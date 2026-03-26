const cleanAndTitleCase = (input: string): string => {
  return input
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

export const deriveDisplayNameFromEmail = (email?: string | null): string | null => {
  if (!email) return null;
  const localPart = email.split('@')[0];
  if (!localPart) return null;
  const spaced = localPart.replace(/[._-]+/g, ' ');
  return cleanAndTitleCase(spaced);
};

type StoredUserIdentity = {
  name?: string;
  email?: string;
  initial?: string;
  displayName?: string;
};

const readUserDataFromStorage = (): StoredUserIdentity | null => {
  if (typeof window === 'undefined') return null;
  const storageValue =
    window.localStorage.getItem('userData') || window.sessionStorage.getItem('userData');
  if (!storageValue) return null;
  try {
    return JSON.parse(storageValue);
  } catch {
    return null;
  }
};

export const getStoredUserIdentity = (): {
  name?: string;
  email?: string;
  initial?: string;
} | null => {
  const stored = readUserDataFromStorage();
  if (!stored) return null;

  const derivedName =
    stored.name || stored.displayName || deriveDisplayNameFromEmail(stored.email) || undefined;
  const rawInitialSource = stored.initial || derivedName || stored.email || '';
  const initial = rawInitialSource ? rawInitialSource.charAt(0).toUpperCase() : undefined;

  return {
    name: derivedName,
    email: stored.email,
    initial,
  };
};


