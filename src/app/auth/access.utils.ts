export type PermissionKey = 'basic' | 'children' | 'volunteers' | 'management' | 'admin';

export interface UserAccess {
  email: string | null;
  basic: boolean;
  children: boolean;
  volunteers: boolean;
  management: boolean;
  admin: boolean;
}

const legacyPermissionMap: Partial<Record<PermissionKey, string>> = {
  basic: 'Basic',
  children: 'Children',
  volunteers: 'Volunteers',
  management: 'Management',
  admin: 'Admin'
};

export const emptyAccess: UserAccess = {
  email: null,
  basic: false,
  children: false,
  volunteers: false,
  management: false,
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

  return {
    email: typeof rawAccess.email === 'string' ? rawAccess.email : fallbackEmail,
    basic: resolvePermissionFlag(rawAccess, 'basic'),
    children: resolvePermissionFlag(rawAccess, 'children'),
    volunteers: resolvePermissionFlag(rawAccess, 'volunteers'),
    management: resolvePermissionFlag(rawAccess, 'management'),
    admin: resolvePermissionFlag(rawAccess, 'admin')
  };
}
