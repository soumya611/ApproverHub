import { create } from "zustand";
import {
  DEFAULT_LABELS,
  type LocalizationKey,
  type LocalizationOverrides,
} from "../data/localization";

const STORAGE_KEY = "localization_labels_v1";

const isValidKey = (key: string): key is LocalizationKey =>
  Object.prototype.hasOwnProperty.call(DEFAULT_LABELS, key);

const readStoredOverrides = (): LocalizationOverrides => {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (!parsed || typeof parsed !== "object") return {};
    const cleaned: LocalizationOverrides = {};
    Object.entries(parsed).forEach(([key, value]) => {
      if (!isValidKey(key) || typeof value !== "string") return;
      cleaned[key] = value;
    });
    return cleaned;
  } catch {
    return {};
  }
};

const persistOverrides = (overrides: LocalizationOverrides) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
  } catch {
    // Ignore persistence errors.
  }
};

interface LocalizationState {
  overrides: LocalizationOverrides;
  setLabel: (key: LocalizationKey, value: string) => void;
  resetLabel: (key: LocalizationKey) => void;
  resetAll: () => void;
}

export const useLocalizationStore = create<LocalizationState>((set, get) => {
  const initialOverrides = readStoredOverrides();

  const updateOverrides = (next: LocalizationOverrides) => {
    set({ overrides: next });
    persistOverrides(next);
  };

  return {
    overrides: initialOverrides,
    setLabel: (key, value) => {
      const normalizedValue = value.trim();
      const current = get().overrides;
      const next = { ...current };
      if (!normalizedValue) {
        delete next[key];
      } else {
        next[key] = normalizedValue;
      }
      updateOverrides(next);
    },
    resetLabel: (key) => {
      const current = get().overrides;
      if (!current[key]) return;
      const next = { ...current };
      delete next[key];
      updateOverrides(next);
    },
    resetAll: () => {
      updateOverrides({});
    },
  };
});
