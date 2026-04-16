import { getStoredUserIdentity } from "./userIdentity";

export interface PersistedSavedView<TFilterState> {
  id: string;
  name: string;
  filterState: TFilterState;
}

export interface PersistedSavedViewsState<TFilterState> {
  activeViewId: string;
  savedViews: PersistedSavedView<TFilterState>[];
}

const STORAGE_KEY_PREFIX = "saved_views";
const DEFAULT_ACTIVE_VIEW_ID = "all";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const getSavedViewsUserKey = () => {
  const storedUser = getStoredUserIdentity();
  const normalizedEmail = storedUser?.email?.trim().toLowerCase();

  if (normalizedEmail) {
    return normalizedEmail;
  }

  if (storedUser?.id) {
    return String(storedUser.id);
  }

  return "anonymous";
};

export const getSavedViewsStorageKey = (scope: string) =>
  `${STORAGE_KEY_PREFIX}:${scope}:${encodeURIComponent(getSavedViewsUserKey())}`;

export const readSavedViewsStorage = <TFilterState>(
  storageKey: string
): PersistedSavedViewsState<TFilterState> => {
  if (typeof window === "undefined") {
    return {
      activeViewId: DEFAULT_ACTIVE_VIEW_ID,
      savedViews: [],
    };
  }

  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) {
      return {
        activeViewId: DEFAULT_ACTIVE_VIEW_ID,
        savedViews: [],
      };
    }

    const parsed = JSON.parse(raw) as {
      activeViewId?: unknown;
      savedViews?: unknown;
    };

    const savedViews = Array.isArray(parsed.savedViews)
      ? parsed.savedViews.filter(
          (item): item is PersistedSavedView<TFilterState> =>
            isRecord(item) &&
            typeof item.id === "string" &&
            typeof item.name === "string" &&
            "filterState" in item
        )
      : [];

    const candidateActiveViewId =
      typeof parsed.activeViewId === "string"
        ? parsed.activeViewId
        : DEFAULT_ACTIVE_VIEW_ID;

    const activeViewId =
      candidateActiveViewId === DEFAULT_ACTIVE_VIEW_ID ||
      savedViews.some((view) => view.id === candidateActiveViewId)
        ? candidateActiveViewId
        : DEFAULT_ACTIVE_VIEW_ID;

    return {
      activeViewId,
      savedViews,
    };
  } catch {
    return {
      activeViewId: DEFAULT_ACTIVE_VIEW_ID,
      savedViews: [],
    };
  }
};

export const writeSavedViewsStorage = <TFilterState>(
  storageKey: string,
  state: PersistedSavedViewsState<TFilterState>
) => {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(storageKey, JSON.stringify(state));
  } catch {
    // Ignore storage errors to keep the UI responsive.
  }
};
