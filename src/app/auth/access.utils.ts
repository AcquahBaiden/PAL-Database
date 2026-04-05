export type PermissionKey = 'basic' | 'children' | 'volunteers' | 'management' | 'archived' | 'admin';

export interface UserAccess {
  email: string | null;
  basic: boolean;
  children: boolean;
  volunteers: boolean;
  management: boolean;
  archived: boolean;
  admin: boolean;
}

const legacyPermissionMap: Partial<Record<PermissionKey, string>> = {
  basic: 'Basic',
  children: 'Children',
  volunteers: 'Volunteers',
  management: 'Management',
  archived: 'Archived',
  admin: 'Admin'
};

export const emptyAccess: UserAccess = {
  email: null,
  basic: false,
  children: false,
  volunteers: false,
  management: false,
  archived: false,
  admin: false
};

function resolvePermissionFlag(rawAccess: any, permission: PermissionKey): boolean {
  if (typeof rawAccess?.[permission] === 'boolean') {
    return rawAccess[permission];
  }

  const legacyKey = legacyPermissionMap[permission];
  if (legacyKey && typeof rawAccess?.[legacyKey]?.access === 'boolean') {
    return rawAccess[legacyKey].access;
  }

  return false;
}

export function normalizeAccessData(rawAccess: any, fallbackEmail: string | null = null): UserAccess {
  if (!rawAccess) {
    return {
      ...emptyAccess,
      email: fallbackEmail
    };
  }

  const children = resolvePermissionFlag(rawAccess, 'children');
  const volunteers = resolvePermissionFlag(rawAccess, 'volunteers');
  const archived =
    typeof rawAccess?.archived === 'boolean'
      ? rawAccess.archived
      : typeof rawAccess?.Archived?.access === 'boolean'
        ? rawAccess.Archived.access
        : (children || volunteers);

  return {
    email: typeof rawAccess.email === 'string' ? rawAccess.email : fallbackEmail,
    basic: resolvePermissionFlag(rawAccess, 'basic'),
    children,
    volunteers,
    management: resolvePermissionFlag(rawAccess, 'management'),
    archived,
    admin: resolvePermissionFlag(rawAccess, 'admin')
  };
}
