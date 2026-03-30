import {
  getRoleLabel,
  isNormalUserRole,
  normalizeAppRole,
  type AppUserAccountStatus,
  type AppUserAddress,
  type AppUserSocialLinks,
  type AppUserRole,
} from "../data/appUsers";
import { useUsersStore } from "../stores/usersStore";

const USER_DATA_STORAGE_KEY = "userData";
const KEEP_LOGGED_IN_STORAGE_KEY = "keepMeLoggedIn";

const cleanAndTitleCase = (input: string): string => {
  return input
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

export const deriveDisplayNameFromEmail = (email?: string | null): string | null => {
  if (!email) return null;
  const localPart = email.split("@")[0];
  if (!localPart) return null;
  const spaced = localPart.replace(/[._-]+/g, " ");
  return cleanAndTitleCase(spaced);
};

export type StoredUserIdentity = {
  id?: string;
  name?: string;
  email?: string;
  initial?: string;
  displayName?: string;
  role?: AppUserRole | string;
  accountStatus?: AppUserAccountStatus;
  avatarUrl?: string;
  phone?: string;
  title?: string;
  team?: string;
  workSchedule?: string;
  bio?: string;
  socialLinks?: AppUserSocialLinks;
  address?: AppUserAddress;
};

const parseStoredUserData = (storageValue: string | null): StoredUserIdentity | null => {
  if (!storageValue) return null;
  try {
    return JSON.parse(storageValue) as StoredUserIdentity;
  } catch {
    return null;
  }
};

const getStorageOrder = (): Storage[] => {
  if (typeof window === "undefined") return [];
  const keepMeLoggedIn = window.localStorage.getItem(KEEP_LOGGED_IN_STORAGE_KEY) === "true";
  return keepMeLoggedIn
    ? [window.localStorage, window.sessionStorage]
    : [window.sessionStorage, window.localStorage];
};

export const readStoredUserData = (): StoredUserIdentity | null => {
  const storages = getStorageOrder();
  for (const storage of storages) {
    const stored = parseStoredUserData(storage.getItem(USER_DATA_STORAGE_KEY));
    if (stored) {
      return stored;
    }
  }
  return null;
};

const resolveStoredUser = (stored: StoredUserIdentity): StoredUserIdentity => {
  const matchedUser = useUsersStore.getState().findUserByEmail(stored.email);
  const normalizedRole = normalizeAppRole(stored.role) ?? matchedUser?.appRole;
  const resolvedName =
    stored.name ||
    stored.displayName ||
    matchedUser?.name ||
    deriveDisplayNameFromEmail(stored.email) ||
    undefined;

  return {
    ...stored,
    id: stored.id ?? matchedUser?.id ?? undefined,
    email: stored.email ?? matchedUser?.email ?? undefined,
    name: resolvedName,
    role: normalizedRole,
    accountStatus: stored.accountStatus ?? matchedUser?.accountStatus,
    avatarUrl: stored.avatarUrl ?? matchedUser?.avatarUrl,
    phone: stored.phone ?? matchedUser?.phone,
    title: stored.title ?? matchedUser?.title,
    team: stored.team ?? matchedUser?.team,
    workSchedule: stored.workSchedule ?? matchedUser?.workSchedule,
    bio: stored.bio ?? matchedUser?.bio,
  };
};

export const saveUserIdentity = (user: StoredUserIdentity, keepMeLoggedIn: boolean): void => {
  if (typeof window === "undefined") return;

  const targetStorage = keepMeLoggedIn ? window.localStorage : window.sessionStorage;
  const otherStorage = keepMeLoggedIn ? window.sessionStorage : window.localStorage;

  const normalizedRole = normalizeAppRole(user.role);
  const payload: StoredUserIdentity = {
    ...user,
    role: normalizedRole ?? user.role,
  };

  otherStorage.removeItem(USER_DATA_STORAGE_KEY);
  targetStorage.setItem(USER_DATA_STORAGE_KEY, JSON.stringify(payload));
  window.localStorage.setItem(KEEP_LOGGED_IN_STORAGE_KEY, String(keepMeLoggedIn));
};

export const clearStoredUserIdentity = (): void => {
  if (typeof window === "undefined") return;

  window.localStorage.removeItem(USER_DATA_STORAGE_KEY);
  window.sessionStorage.removeItem(USER_DATA_STORAGE_KEY);
  window.localStorage.removeItem(KEEP_LOGGED_IN_STORAGE_KEY);
};

export const getStoredUserIdentity = (): {
  id?: string;
  name?: string;
  email?: string;
  initial?: string;
  role?: AppUserRole;
  roleLabel?: string;
  showRole: boolean;
  accountStatus?: AppUserAccountStatus;
  avatarUrl?: string;
  phone?: string;
  title?: string;
  team?: string;
  workSchedule?: string;
  bio?: string;
} | null => {
  const stored = readStoredUserData();
  if (!stored) return null;

  const resolvedUser = resolveStoredUser(stored);
  const resolvedRole = normalizeAppRole(resolvedUser.role);
  const roleLabel = getRoleLabel(resolvedRole);
  const derivedName =
    resolvedUser.name ||
    resolvedUser.displayName ||
    deriveDisplayNameFromEmail(resolvedUser.email) ||
    undefined;
  const rawInitialSource = resolvedUser.initial || derivedName || resolvedUser.email || "";
  const initial = rawInitialSource ? rawInitialSource.charAt(0).toUpperCase() : undefined;

  return {
    id: resolvedUser.id,
    name: derivedName,
    email: resolvedUser.email,
    initial,
    role: resolvedRole,
    roleLabel: roleLabel || undefined,
    showRole: !!resolvedRole && !isNormalUserRole(resolvedRole),
    accountStatus: resolvedUser.accountStatus,
    avatarUrl: resolvedUser.avatarUrl,
    phone: resolvedUser.phone,
    title: resolvedUser.title,
    team: resolvedUser.team,
    workSchedule: resolvedUser.workSchedule,
    bio: resolvedUser.bio,
  };
};


