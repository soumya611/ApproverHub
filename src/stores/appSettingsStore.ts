import { create } from "zustand";

interface AppSettingsState {
  isCampaignsDisabled: boolean;
  setCampaignsDisabled: (disabled: boolean) => void;
  toggleCampaignsDisabled: () => void;
}

const STORAGE_KEY = "app_settings_v1";

const readStoredSettings = () => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<AppSettingsState>;
    if (typeof parsed?.isCampaignsDisabled !== "boolean") return null;
    return { isCampaignsDisabled: parsed.isCampaignsDisabled };
  } catch {
    return null;
  }
};

const persistSettings = (settings: Pick<AppSettingsState, "isCampaignsDisabled">) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Ignore persistence errors.
  }
};

export const useAppSettingsStore = create<AppSettingsState>((set, get) => {
  const stored = readStoredSettings();
  const initialState = {
    isCampaignsDisabled: stored?.isCampaignsDisabled ?? false,
  };

  const persist = () => {
    persistSettings({ isCampaignsDisabled: get().isCampaignsDisabled });
  };

  return {
    ...initialState,
    setCampaignsDisabled: (disabled) => {
      set({ isCampaignsDisabled: disabled });
      persist();
    },
    toggleCampaignsDisabled: () => {
      set((state) => ({ isCampaignsDisabled: !state.isCampaignsDisabled }));
      persist();
    },
  };
});

