#!/usr/bin/env node

const fs = require('fs');
const net = require('net');
const path = require('path');

const VALID_SCOPES = new Set(['children', 'volunteers', 'management', 'access']);
const WRITE_BATCH_LIMIT = 400;
const DEFAULT_PROJECT_ID = 'your-project-d';
const DEFAULT_FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
let cachedAdmin = null;

function printUsage() {
  console.log(`
Usage:
  node functions/scripts/migrate-rtdb-to-firestore.js [options]

Options:
  --dry-run
      Parse and transform the source data, but do not write to Firestore.

  --only=children,volunteers,management,access
      Limit the migration to one or more scopes.

  --input=/absolute/or/relative/path/to/export.json
  --input-file=/absolute/or/relative/path/to/export.json
      Read from a local RTDB export file instead of live Realtime Database.

  --firestore-emulator
      Write to the Firestore emulator instead of production Firestore.

  --emulator-host=127.0.0.1:8080
  --firestore-emulator-host=127.0.0.1:8080
      Override the Firestore emulator host.

  --project-id=your-project-id
      Override the Firebase project ID. This is especially useful with emulator imports.

  --service-account=/absolute/or/relative/path/to/service-account.json
      Load Firebase service account credentials from a JSON file.

  --help
      Show this help.

Env vars for live RTDB source:
  FIREBASE_PROJECT_ID
  FIREBASE_CLIENT_EMAIL
  FIREBASE_PRIVATE_KEY
  FIREBASE_DATABASE_URL

Notes:
  - If --input is provided, FIREBASE_DATABASE_URL is not required.
  - If --service-account is not provided, GOOGLE_APPLICATION_CREDENTIALS will be used when set.
  - If --firestore-emulator is provided, service account credentials are optional.
  - If writing to production Firestore without --firestore-emulator, service account credentials are required.
`);
}

function parseArgs(argv) {
  return argv.reduce((acc, arg) => {
    if (arg === '--help') {
      acc.help = true;
      return acc;
    }

    if (arg === '--dry-run') {
      acc.dryRun = true;
      return acc;
    }

    if (arg === '--firestore-emulator') {
      acc.firestoreEmulator = true;
      return acc;
    }

    if (arg.startsWith('--only=')) {
      acc.only = arg.slice('--only='.length);
      return acc;
    }

    if (arg.startsWith('--input=')) {
      acc.inputFile = arg.slice('--input='.length);
      return acc;
    }

    if (arg.startsWith('--input-file=')) {
      acc.inputFile = arg.slice('--input-file='.length);
      return acc;
    }

    if (arg.startsWith('--project-id=')) {
      acc.projectId = arg.slice('--project-id='.length);
      return acc;
    }

    if (arg.startsWith('--service-account=')) {
      acc.serviceAccountFile = arg.slice('--service-account='.length);
      return acc;
    }

    if (arg.startsWith('--emulator-host=')) {
      acc.firestoreEmulatorHost = arg.slice('--emulator-host='.length);
      return acc;
    }

    if (arg.startsWith('--firestore-emulator-host=')) {
      acc.firestoreEmulatorHost = arg.slice('--firestore-emulator-host='.length);
      return acc;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }, {
    dryRun: false,
    only: null,
    help: false,
    inputFile: null,
    projectId: null,
    serviceAccountFile: null,
    firestoreEmulator: false,
    firestoreEmulatorHost: DEFAULT_FIRESTORE_EMULATOR_HOST
  });
}

function loadFirebaseAdmin() {
  if (cachedAdmin) {
    return cachedAdmin;
  }

  const candidatePaths = [
    'firebase-admin',
    path.resolve(__dirname, '..', 'node_modules', 'firebase-admin')
  ];

  let lastError = null;
  for (const candidatePath of candidatePaths) {
    try {
      // eslint-disable-next-line global-require, import/no-dynamic-require
      cachedAdmin = require(candidatePath);
      return cachedAdmin;
    } catch (error) {
      lastError = error;
    }
  }

  throw new Error(
    `Unable to load firebase-admin. Install it with "npm install --prefix functions" or add it to the root package. ${lastError ? `Last error: ${lastError.message}` : ''}`
  );
}

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function sanitize(value, seen = new WeakSet()) {
  if (Array.isArray(value)) {
    return value
      .map((item) => sanitize(item, seen))
      .filter((item) => item !== undefined);
  }

  if (value && typeof value === 'object') {
    if (seen.has(value)) {
      return undefined;
    }

    seen.add(value);

    return Object.entries(value).reduce((acc, [key, entryValue]) => {
      if (entryValue !== undefined) {
        const sanitizedEntry = sanitize(entryValue, seen);
        if (sanitizedEntry !== undefined) {
          acc[key] = sanitizedEntry;
        }
      }

      return acc;
    }, {});
  }

  return value;
}

function toPlainData(value) {
  return JSON.parse(JSON.stringify(sanitize(value)));
}

function parseHostAndPort(hostValue) {
  const [host, rawPort] = hostValue.split(':');
  const port = Number(rawPort);

  if (!host || !Number.isInteger(port) || port <= 0) {
    throw new Error(`Invalid emulator host "${hostValue}". Expected format host:port`);
  }

  return { host, port };
}

function resolveProjectId(args) {
  return args.projectId || process.env.FIREBASE_PROJECT_ID || DEFAULT_PROJECT_ID;
}

function hasServiceAccountEnv() {
  return Boolean(
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
  );
}

function resolveServiceAccountPath(args) {
  if (args.serviceAccountFile) {
    return path.resolve(process.cwd(), args.serviceAccountFile);
  }

  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return path.resolve(process.cwd(), process.env.GOOGLE_APPLICATION_CREDENTIALS);
  }

  return null;
}

function loadServiceAccountFromFile(filePath) {
  if (!filePath) {
    return null;
  }

  if (!fs.existsSync(filePath)) {
    throw new Error(`Service account file not found: ${filePath}`);
  }

  const raw = fs.readFileSync(filePath, 'utf8');
  const parsed = JSON.parse(raw);

  if (!parsed || typeof parsed !== 'object') {
    throw new Error(`Invalid service account JSON: ${filePath}`);
  }

  if (!parsed.project_id || !parsed.client_email || !parsed.private_key) {
    throw new Error(`Service account JSON is missing required fields (project_id, client_email, private_key): ${filePath}`);
  }

  return {
    projectId: parsed.project_id,
    clientEmail: parsed.client_email,
    privateKey: parsed.private_key
  };
}

function resolveAccessEmail(rawAccess, fallbackEmail = null) {
  if (typeof rawAccess?.email === 'string' && rawAccess.email.trim()) {
    return rawAccess.email;
  }

  if (typeof rawAccess?.Info?.email === 'string' && rawAccess.Info.email.trim()) {
    return rawAccess.Info.email;
  }

  return fallbackEmail;
}

function normalizeAccessData(rawAccess, fallbackEmail = null) {
  const resolveFlag = (permission, legacyKey) => {
    if (typeof rawAccess?.[permission] === 'boolean') {
      return rawAccess[permission];
    }

    if (legacyKey && typeof rawAccess?.[legacyKey]?.access === 'boolean') {
      return rawAccess[legacyKey].access;
    }

    return false;
  };

  return {
    email: resolveAccessEmail(rawAccess, fallbackEmail),
    basic: resolveFlag('basic', 'Basic'),
    children: resolveFlag('children', 'Children'),
    volunteers: resolveFlag('volunteers', 'Volunteers'),
    management: resolveFlag('management', 'Management'),
    archived: typeof rawAccess?.archived === 'boolean'
      ? rawAccess.archived
      : (typeof rawAccess?.Archived?.access === 'boolean'
        ? rawAccess.Archived.access
        : (resolveFlag('children', 'Children') || resolveFlag('volunteers', 'Volunteers'))),
    admin: resolveFlag('admin', 'Admin')
  };
}

function buildChildRecord(child) {
  return toPlainData({
    firstName: child?.firstName,
    lastName: child?.lastName,
    residence: child?.residence,
    address: child?.address,
    description: child?.description,
    telephone: child?.telephone,
    img: child?.img,
    class: child?.class,
    school: child?.school,
    parentName: child?.parentName,
    parentTel: child?.parentTel,
    interests: child?.interests,
    programs: child?.programs,
    createdAt: child?.createdAt,
    updatedAt: child?.updatedAt,
    latestVersionId: child?.latestVersionId,
    archived: child?.archived === true,
    archivedAt: child?.archivedAt,
    archivedReason: child?.archivedReason,
    archivedReasonDetail: child?.archivedReasonDetail,
    archivedBy: child?.archivedBy ?? null
  });
}

function buildVolunteerRecord(volunteer) {
  return toPlainData({
    firstName: volunteer?.firstName,
    lastName: volunteer?.lastName,
    residence: volunteer?.residence,
    address: volunteer?.address,
    telephone: volunteer?.telephone,
    img: volunteer?.img,
    school: volunteer?.school,
    level: volunteer?.level,
    program: volunteer?.program,
    email: volunteer?.email,
    volunteeringInProg: volunteer?.volunteeringInProg,
    createdAt: volunteer?.createdAt,
    updatedAt: volunteer?.updatedAt,
    latestVersionId: volunteer?.latestVersionId,
    archived: volunteer?.archived === true,
    archivedAt: volunteer?.archivedAt,
    archivedReason: volunteer?.archivedReason,
    archivedReasonDetail: volunteer?.archivedReasonDetail,
    archivedBy: volunteer?.archivedBy ?? null
  });
}

function buildManagementRecord(member) {
  return toPlainData({
    firstName: member?.firstName,
    lastName: member?.lastName,
    residence: member?.residence,
    email: member?.email,
    address: member?.address,
    description: member?.description,
    telephone: member?.telephone,
    img: member?.img,
    position: member?.position
  });
}

function normalizeHistoryEntry(entry, builder) {
  const timestamp = Number(entry?.timestamp ?? 0);
  const profileSource = entry?.profile && typeof entry.profile === 'object' ? entry.profile : entry;

  return toPlainData({
    timestamp,
    profile: builder(profileSource)
  });
}

class BatchedWriter {
  constructor(firestore, dryRun) {
    this.firestore = firestore;
    this.dryRun = dryRun;
    this.batch = dryRun ? null : firestore.batch();
    this.operationCount = 0;
    this.committedBatches = 0;
  }

  async set(docRef, data, options) {
    if (this.dryRun) {
      this.operationCount += 1;
      return;
    }

    this.batch.set(docRef, data, options);
    this.operationCount += 1;

    if (this.operationCount >= WRITE_BATCH_LIMIT) {
      await this.flush();
    }
  }

  async flush() {
    if (this.dryRun || this.operationCount === 0) {
      this.operationCount = 0;
      this.batch = this.dryRun ? null : this.firestore.batch();
      return;
    }

    await this.batch.commit();
    this.batch = this.firestore.batch();
    this.operationCount = 0;
    this.committedBatches += 1;
  }
}

function loadInputFile(inputFile) {
  const resolvedPath = path.resolve(process.cwd(), inputFile);
  const raw = fs.readFileSync(resolvedPath, 'utf8');
  const parsed = JSON.parse(raw);

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error(`Input file must contain a top-level JSON object: ${resolvedPath}`);
  }

  return {
    resolvedPath,
    data: parsed
  };
}

function createReadRoot(args, database, inputData) {
  if (inputData) {
    return async (rootPath) => {
      const value = inputData[rootPath];
      if (!value || typeof value !== 'object') {
        return {};
      }

      return value;
    };
  }

  if (!database) {
    throw new Error('Realtime Database source is not configured');
  }

  return async (rootPath) => readRtdbRoot(database, rootPath);
}

function ensureFirestoreEmulatorAvailable(hostValue) {
  const { host, port } = parseHostAndPort(hostValue);

  return new Promise((resolve, reject) => {
    const socket = net.createConnection({ host, port });
    const timeout = setTimeout(() => {
      socket.destroy();
      reject(new Error(`Firestore emulator is not reachable at ${hostValue}. Start it before running the import.`));
    }, 1500);

    socket.on('connect', () => {
      clearTimeout(timeout);
      socket.end();
      resolve();
    });

    socket.on('error', () => {
      clearTimeout(timeout);
      reject(new Error(`Firestore emulator is not reachable at ${hostValue}. Start it before running the import.`));
    });
  });
}

function initializeFirebase(args, needsRealtimeDatabaseSource) {
  const projectId = resolveProjectId(args);
  const admin = loadFirebaseAdmin();
  const serviceAccountPath = resolveServiceAccountPath(args);
  const serviceAccount = loadServiceAccountFromFile(serviceAccountPath);

  if (args.firestoreEmulator) {
    process.env.FIRESTORE_EMULATOR_HOST = args.firestoreEmulatorHost;
  }

  const appOptions = { projectId };

  if (needsRealtimeDatabaseSource) {
    appOptions.databaseURL = requireEnv('FIREBASE_DATABASE_URL');
  }

  const needsServiceAccount = needsRealtimeDatabaseSource || (!args.dryRun && !args.firestoreEmulator);
  if (needsServiceAccount) {
    if (serviceAccount) {
      appOptions.credential = admin.credential.cert(serviceAccount);
    } else if (hasServiceAccountEnv()) {
      appOptions.credential = admin.credential.cert({
        projectId: requireEnv('FIREBASE_PROJECT_ID'),
        clientEmail: requireEnv('FIREBASE_CLIENT_EMAIL'),
        privateKey: requireEnv('FIREBASE_PRIVATE_KEY').replace(/\\n/g, '\n')
      });
    } else {
      throw new Error(
        'Production Firestore access requires credentials. Provide --service-account=/path/to/service-account.json or set GOOGLE_APPLICATION_CREDENTIALS or FIREBASE_PROJECT_ID/FIREBASE_CLIENT_EMAIL/FIREBASE_PRIVATE_KEY.'
      );
    }
  } else if (serviceAccount) {
    appOptions.credential = admin.credential.cert(serviceAccount);
  } else if (hasServiceAccountEnv()) {
    appOptions.credential = admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    });
  }

  const app = admin.initializeApp(appOptions, `migration-${Date.now()}`);

  return {
    projectId,
    app,
    database: needsRealtimeDatabaseSource ? admin.database(app) : null,
    firestore: admin.firestore(app)
  };
}

async function verifyFirestoreAccess(firestore, args) {
  await firestore.collection('migration_probe').limit(1).get();

  if (args.dryRun) {
    console.log(
      args.firestoreEmulator
        ? `Verified Firestore emulator access at ${args.firestoreEmulatorHost}.`
        : 'Verified production Firestore access.'
    );
  }
}

async function readRtdbRoot(database, path) {
  const snapshot = await database.ref(path).get();
  return snapshot.exists() ? snapshot.val() : {};
}

async function migrateChildren(readRoot, firestore, writer, stats) {
  const [children, history] = await Promise.all([
    readRoot('Children'),
    readRoot('ChildrenHistory')
  ]);

  for (const [childId, child] of Object.entries(children)) {
    stats.children.read += 1;
    await writer.set(firestore.collection('children').doc(childId), buildChildRecord(child));
    stats.children.written += 1;
  }

  for (const [childId, versions] of Object.entries(history)) {
    for (const [versionId, version] of Object.entries(versions || {})) {
      stats.childrenHistory.read += 1;
      await writer.set(
        firestore.collection('children').doc(childId).collection('history').doc(versionId),
        normalizeHistoryEntry(version, buildChildRecord)
      );
      stats.childrenHistory.written += 1;
    }
  }
}

async function migrateVolunteers(readRoot, firestore, writer, stats) {
  const [volunteers, history] = await Promise.all([
    readRoot('Volunteers'),
    readRoot('VolunteersHistory')
  ]);

  for (const [volunteerId, volunteer] of Object.entries(volunteers)) {
    stats.volunteers.read += 1;
    await writer.set(firestore.collection('volunteers').doc(volunteerId), buildVolunteerRecord(volunteer));
    stats.volunteers.written += 1;
  }

  for (const [volunteerId, versions] of Object.entries(history)) {
    for (const [versionId, version] of Object.entries(versions || {})) {
      stats.volunteersHistory.read += 1;
      await writer.set(
        firestore.collection('volunteers').doc(volunteerId).collection('history').doc(versionId),
        normalizeHistoryEntry(version, buildVolunteerRecord)
      );
      stats.volunteersHistory.written += 1;
    }
  }
}

async function migrateManagement(readRoot, firestore, writer, stats) {
  const management = await readRoot('Management');

  for (const [memberId, member] of Object.entries(management)) {
    stats.management.read += 1;
    await writer.set(firestore.collection('management').doc(memberId), buildManagementRecord(member));
    stats.management.written += 1;
  }
}

async function migrateAccess(readRoot, firestore, writer, stats) {
  const accessRecords = await readRoot('Access');

  for (const [userId, access] of Object.entries(accessRecords)) {
    stats.access.read += 1;
    await writer.set(firestore.collection('access').doc(userId), normalizeAccessData(access));
    stats.access.written += 1;
  }
}

function printSummary(stats, args, sourceLabel, targetLabel) {
  const mode = args.dryRun ? 'DRY RUN' : 'WRITE';
  console.log(`\nMigration summary (${mode})`);
  console.log(`Source: ${sourceLabel}`);
  console.log(`Target: ${targetLabel}`);
  console.table({
    children: stats.children,
    childrenHistory: stats.childrenHistory,
    volunteers: stats.volunteers,
    volunteersHistory: stats.volunteersHistory,
    management: stats.management,
    access: stats.access
  });
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printUsage();
    return;
  }

  const selectedScopes = args.only
    ? new Set(args.only.split(',').map((scope) => scope.trim()).filter(Boolean))
    : new Set(VALID_SCOPES);

  for (const scope of selectedScopes) {
    if (!VALID_SCOPES.has(scope)) {
      throw new Error(`Invalid scope "${scope}". Valid values: ${Array.from(VALID_SCOPES).join(', ')}`);
    }
  }

  const inputFile = args.inputFile ? loadInputFile(args.inputFile) : null;
  if (args.firestoreEmulator) {
    await ensureFirestoreEmulatorAvailable(args.firestoreEmulatorHost);
  }

  const { projectId, app, database, firestore } = initializeFirebase(args, !inputFile);
  firestore.settings({ ignoreUndefinedProperties: true });
  await verifyFirestoreAccess(firestore, args);

  const readRoot = createReadRoot(args, database, inputFile?.data ?? null);
  const writer = new BatchedWriter(firestore, args.dryRun);
  const stats = {
    children: { read: 0, written: 0 },
    childrenHistory: { read: 0, written: 0 },
    volunteers: { read: 0, written: 0 },
    volunteersHistory: { read: 0, written: 0 },
    management: { read: 0, written: 0 },
    access: { read: 0, written: 0 }
  };

  const sourceLabel = inputFile
    ? `JSON file (${inputFile.resolvedPath})`
    : `Realtime Database (${requireEnv('FIREBASE_DATABASE_URL')})`;
  const targetLabel = args.firestoreEmulator
    ? `Firestore emulator (${args.firestoreEmulatorHost}) [projectId=${projectId}]`
    : `Firestore production [projectId=${projectId}]`;

  if (selectedScopes.has('children')) {
    console.log('Migrating children and child history...');
    await migrateChildren(readRoot, firestore, writer, stats);
  }

  if (selectedScopes.has('volunteers')) {
    console.log('Migrating volunteers and volunteer history...');
    await migrateVolunteers(readRoot, firestore, writer, stats);
  }

  if (selectedScopes.has('management')) {
    console.log('Migrating management...');
    await migrateManagement(readRoot, firestore, writer, stats);
  }

  if (selectedScopes.has('access')) {
    console.log('Migrating access records...');
    await migrateAccess(readRoot, firestore, writer, stats);
  }

  await writer.flush();
  printSummary(stats, args, sourceLabel, targetLabel);

  if (app) {
    await app.delete();
  }
}

main().catch((error) => {
  console.error('\nRTDB -> Firestore migration failed.');
  console.error(error);
  process.exit(1);
});
