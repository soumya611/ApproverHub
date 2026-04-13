import { create } from "zustand";
import type { AppUserRole } from "../data/appUsers";
import { getNotificationPreferencesByRole } from "../components/UserProfile/profileSettingsData";

export interface UserNotificationChannelState {
  inApp: boolean;
  email: boolean;
}

export type UserNotificationSettings = Record<string, UserNotificationChannelState>;

export interface UserLeaveHistoryItem {
  id: string;
  dateRange: string;
  duration: string;
  reason: string;
  transferredToUserId?: string;
  transferredJobIds: string[];
}

export interface UserWorkScheduleSettings {
  outOfOffice: boolean;
  assignSubstitute: boolean;
  leaveFrom: string;
  leaveTo: string;
  leaveReason: string;
  substituteUserIds: string[];
  transferredJobOwnerByJobId: Record<string, string>;
  history: UserLeaveHistoryItem[];
}

type WorkScheduleUpdate =
  | Partial<UserWorkScheduleSettings>
  | ((current: UserWorkScheduleSettings) => UserWorkScheduleSettings);

interface UserProfileSettingsState {
  notificationsByUser: Record<string, UserNotificationSettings>;
  workScheduleByUser: Record<string, UserWorkScheduleSettings>;
  setNotificationSettings: (userId: string, settings: UserNotificationSettings) => void;
  setNotificationPreference: (
    userId: string,
    preferenceId: string,
    channel: keyof UserNotificationChannelState,
    checked: boolean
  ) => void;
  setWorkSchedule: (userId: string, updates: WorkScheduleUpdate) => void;
  resetWorkSchedule: (userId: string) => void;
}

const STORAGE_KEY = "user_profile_settings_v1";

const parseJson = <T>(raw: string | null): T | null => {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
};

const defaultLeaveHistory = (): UserLeaveHistoryItem[] => [
  {
    id: "leave-1",
    dateRange: "15 Oct 25",
    duration: "1 Day",
    reason: "Doctor's appointment",
    transferredJobIds: [],
  },
  {
    id: "leave-2",
    dateRange: "25 Oct 25 - 2 Nov 25",
    duration: "8 Day",
    reason: "Doctor's appointment",
    transferredJobIds: [],
  },
];

export const createDefaultWorkScheduleSettings = (): UserWorkScheduleSettings => ({
  outOfOffice: true,
  assignSubstitute: false,
  leaveFrom: "2025-10-04",
  leaveTo: "2025-10-10",
  leaveReason: "Doctor's appointment",
  substituteUserIds: [],
  transferredJobOwnerByJobId: {},
  history: defaultLeaveHistory(),
});

const cloneWorkSchedule = (
  schedule: UserWorkScheduleSettings
): UserWorkScheduleSettings => ({
  ...schedule,
  substituteUserIds: [...schedule.substituteUserIds],
  transferredJobOwnerByJobId: { ...schedule.transferredJobOwnerByJobId },
  history: schedule.history.map((item) => ({ ...item, transferredJobIds: [...item.transferredJobIds] })),
});

const readStoredState = () => {
  if (typeof window === "undefined") {
    return {
      notificationsByUser: {} as Record<string, UserNotificationSettings>,
      workScheduleByUser: {} as Record<string, UserWorkScheduleSettings>,
    };
  }

  const parsed = parseJson<{
    notificationsByUser?: Record<string, UserNotificationSettings>;
    workScheduleByUser?: Record<string, UserWorkScheduleSettings>;
  }>(window.localStorage.getItem(STORAGE_KEY));

  return {
    notificationsByUser: parsed?.notificationsByUser ?? {},
    workScheduleByUser: parsed?.workScheduleByUser ?? {},
  };
};

const persistState = (state: {
  notificationsByUser: Record<string, UserNotificationSettings>;
  workScheduleByUser: Record<string, UserWorkScheduleSettings>;
}) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore persistence failures.
  }
};

export const buildDefaultNotificationSettings = (
  role: AppUserRole = "manager"
): UserNotificationSettings =>
  Object.fromEntries(
    getNotificationPreferencesByRole(role).map((item) => [
      item.id,
      { inApp: item.inApp, email: item.email },
    ])
  );

export const useUserProfileSettingsStore = create<UserProfileSettingsState>((set, get) => {
  const stored = readStoredState();

  const persist = () => {
    const { notificationsByUser, workScheduleByUser } = get();
    persistState({ notificationsByUser, workScheduleByUser });
  };

  return {
    notificationsByUser: stored.notificationsByUser,
    workScheduleByUser: stored.workScheduleByUser,
    setNotificationSettings: (userId, settings) => {
      set((state) => ({
        notificationsByUser: {
          ...state.notificationsByUser,
          [userId]: { ...settings },
        },
      }));
      persist();
    },
    setNotificationPreference: (userId, preferenceId, channel, checked) => {
      set((state) => {
        const currentForUser = state.notificationsByUser[userId] ?? {};
        const currentPreference = currentForUser[preferenceId] ?? {
          inApp: false,
          email: false,
        };
        return {
          notificationsByUser: {
            ...state.notificationsByUser,
            [userId]: {
              ...currentForUser,
              [preferenceId]: {
                ...currentPreference,
                [channel]: checked,
              },
            },
          },
        };
      });
      persist();
    },
    setWorkSchedule: (userId, updates) => {
      set((state) => {
        const current = cloneWorkSchedule(
          state.workScheduleByUser[userId] ?? createDefaultWorkScheduleSettings()
        );
        const next =
          typeof updates === "function"
            ? updates(current)
            : ({ ...current, ...updates } as UserWorkScheduleSettings);
        return {
          workScheduleByUser: {
            ...state.workScheduleByUser,
            [userId]: cloneWorkSchedule(next),
          },
        };
      });
      persist();
    },
    resetWorkSchedule: (userId) => {
      set((state) => ({
        workScheduleByUser: {
          ...state.workScheduleByUser,
          [userId]: createDefaultWorkScheduleSettings(),
        },
      }));
      persist();
    },
  };
});
