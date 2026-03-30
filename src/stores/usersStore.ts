import { create } from "zustand";
import {
  APP_USERS,
  DEFAULT_APP_USER,
  getRoleLabel,
  normalizeAppRole,
  type AppUserAccountStatus,
  type AppUserRole,
} from "../data/appUsers";
import { CAMPAIGN_DATA } from "../data/campaigns";
import { DEFAULT_JOB_MEMBERS } from "../components/jobs/types";

export type UnifiedInviteState = "none" | "send" | "resend";

export interface UnifiedUser {
  id: string;
  name: string;
  email: string;
  role: string;
  appRole?: AppUserRole;
  accountStatus?: AppUserAccountStatus;
  avatarUrl?: string;
  phone?: string;
  title?: string;
  team?: string;
  workSchedule?: string;
  bio?: string;
  company: string;
  isActive: boolean;
  inviteState: UnifiedInviteState;
  lastSent?: string;
  source: "app" | "job_member" | "campaign" | "session";
}

interface UsersState {
  users: UnifiedUser[];
  refreshUsers: () => void;
  setUsers: (users: UnifiedUser[]) => void;
  upsertUser: (user: UnifiedUser) => void;
  updateUserStatus: (id: string, isActive: boolean) => void;
  findUserByEmail: (email?: string | null) => UnifiedUser | undefined;
  getDefaultUser: () => UnifiedUser;
}

const USERS_STORAGE_KEY = "users_store_v1";
const USER_DATA_STORAGE_KEY = "userData";
const KEEP_LOGGED_IN_STORAGE_KEY = "keepMeLoggedIn";

const toTitleCase = (value: string) =>
  value
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const getCompanyFromEmail = (email?: string) => {
  if (!email) return "";
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return "";
  if (domain.includes("approverhub")) return "Approver Hub";
  const primary = domain.split(".")[0];
  return primary ? toTitleCase(primary) : "";
};

const resolveInviteState = (
  status?: AppUserAccountStatus | string | null
): UnifiedInviteState => {
  if (status === "issue") return "resend";
  if (status === "inactive") return "send";
  return "none";
};

const normalizeNameFromEmail = (email?: string) => {
  if (!email) return "";
  const localPart = email.split("@")[0];
  if (!localPart) return "";
  return toTitleCase(localPart.replace(/[._-]+/g, " "));
};

const parseJson = <T>(value: string | null): T | null => {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
};

const readStoredIdentity = (): {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
  accountStatus?: AppUserAccountStatus;
  avatarUrl?: string;
  phone?: string;
  title?: string;
  team?: string;
  workSchedule?: string;
  bio?: string;
} | null => {
  if (typeof window === "undefined") return null;
  const keepLoggedIn = window.localStorage.getItem(KEEP_LOGGED_IN_STORAGE_KEY) === "true";
  const storages = keepLoggedIn
    ? [window.localStorage, window.sessionStorage]
    : [window.sessionStorage, window.localStorage];

  for (const storage of storages) {
    const parsed = parseJson<{
      id?: string;
      name?: string;
      email?: string;
      role?: string;
      accountStatus?: AppUserAccountStatus;
      avatarUrl?: string;
      phone?: string;
      title?: string;
      team?: string;
      workSchedule?: string;
      bio?: string;
    }>(storage.getItem(USER_DATA_STORAGE_KEY));
    if (parsed) return parsed;
  }

  return null;
};

const mergeValue = (incoming: string | undefined, existing: string | undefined) =>
  incoming && incoming.trim() ? incoming : existing;

const mergeUsers = (users: UnifiedUser[]): UnifiedUser[] => {
  const map = new Map<string, UnifiedUser>();

  users.forEach((user) => {
    const key = user.email.trim()
      ? `email:${user.email.trim().toLowerCase()}`
      : `name:${user.name.trim().toLowerCase()}`;
    const existing = map.get(key);

    if (!existing) {
      map.set(key, user);
      return;
    }

    map.set(key, {
      ...existing,
      ...user,
      id: mergeValue(user.id, existing.id) || existing.id,
      name: mergeValue(user.name, existing.name) || existing.name,
      email: mergeValue(user.email, existing.email) || existing.email,
      role:
        user.role && user.role !== "User"
          ? user.role
          : existing.role && existing.role !== "User"
            ? existing.role
            : user.role || existing.role,
      appRole: user.appRole ?? existing.appRole,
      accountStatus: user.accountStatus ?? existing.accountStatus,
      avatarUrl: mergeValue(user.avatarUrl, existing.avatarUrl),
      phone: mergeValue(user.phone, existing.phone),
      title: mergeValue(user.title, existing.title),
      team: mergeValue(user.team, existing.team),
      workSchedule: mergeValue(user.workSchedule, existing.workSchedule),
      bio: mergeValue(user.bio, existing.bio),
      company: mergeValue(user.company, existing.company) || "",
      isActive: user.isActive,
      inviteState: user.inviteState !== "none" ? user.inviteState : existing.inviteState,
      lastSent: mergeValue(user.lastSent, existing.lastSent),
      source: user.source,
    });
  });

  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
};

const createDefaultUnifiedUser = (): UnifiedUser => ({
  id: DEFAULT_APP_USER.id,
  name: DEFAULT_APP_USER.name,
  email: DEFAULT_APP_USER.email,
  role: getRoleLabel(DEFAULT_APP_USER.role),
  appRole: DEFAULT_APP_USER.role,
  accountStatus: DEFAULT_APP_USER.accountStatus,
  avatarUrl: DEFAULT_APP_USER.avatarUrl,
  phone: DEFAULT_APP_USER.phone,
  title: DEFAULT_APP_USER.title,
  team: DEFAULT_APP_USER.team,
  workSchedule: DEFAULT_APP_USER.workSchedule,
  bio: DEFAULT_APP_USER.bio,
  company: getCompanyFromEmail(DEFAULT_APP_USER.email),
  isActive: DEFAULT_APP_USER.accountStatus !== "inactive",
  inviteState: resolveInviteState(DEFAULT_APP_USER.accountStatus),
  source: "app",
});

const buildBaseUsers = (): UnifiedUser[] => {
  const fromAppUsers: UnifiedUser[] = APP_USERS.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: getRoleLabel(user.role) || "User",
    appRole: user.role,
    accountStatus: user.accountStatus,
    avatarUrl: user.avatarUrl,
    phone: user.phone,
    title: user.title,
    team: user.team,
    workSchedule: user.workSchedule,
    bio: user.bio,
    company: getCompanyFromEmail(user.email),
    isActive: user.accountStatus !== "inactive",
    inviteState: resolveInviteState(user.accountStatus),
    lastSent: user.accountStatus === "issue" ? "Last sent 2 days ago" : undefined,
    source: "app",
  }));

  const fromJobMembers: UnifiedUser[] = DEFAULT_JOB_MEMBERS.map((member) => ({
    id: member.id,
    name: member.name,
    email: member.email ?? "",
    role: member.role ?? "User",
    appRole: normalizeAppRole(member.role),
    company: getCompanyFromEmail(member.email),
    isActive: true,
    inviteState: "none",
    source: "job_member",
  }));

  const campaignNamePool = new Set<string>();
  CAMPAIGN_DATA.forEach((campaign) => {
    campaignNamePool.add(campaign.ownerName);
    if (campaign.reviewerName) campaignNamePool.add(campaign.reviewerName);
    campaign.members?.forEach((member) => campaignNamePool.add(member.name));
    campaign.subRows?.forEach((subRow) => campaignNamePool.add(subRow.ownerName));
  });

  const fromCampaignUsers: UnifiedUser[] = Array.from(campaignNamePool).map((name, index) => ({
    id: `campaign-user-${index + 1}`,
    name,
    email: "",
    role: "User",
    appRole: undefined,
    company: "",
    isActive: true,
    inviteState: "none",
    source: "campaign",
  }));

  const storedIdentity = readStoredIdentity();
  const fromStoredUser: UnifiedUser[] =
    storedIdentity && (storedIdentity.name || storedIdentity.email)
      ? [
          {
            id: storedIdentity.id || "current-user",
            name:
              storedIdentity.name ||
              normalizeNameFromEmail(storedIdentity.email) ||
              "Current User",
            email: storedIdentity.email || "",
            role:
              (storedIdentity.role
                ? getRoleLabel(storedIdentity.role) || storedIdentity.role
                : "") || "User",
            appRole: normalizeAppRole(storedIdentity.role),
            accountStatus: storedIdentity.accountStatus,
            avatarUrl: storedIdentity.avatarUrl,
            phone: storedIdentity.phone,
            title: storedIdentity.title,
            team: storedIdentity.team,
            workSchedule: storedIdentity.workSchedule,
            bio: storedIdentity.bio,
            company: getCompanyFromEmail(storedIdentity.email),
            isActive: storedIdentity.accountStatus !== "inactive",
            inviteState: resolveInviteState(storedIdentity.accountStatus),
            lastSent:
              resolveInviteState(storedIdentity.accountStatus) === "resend"
                ? "Last sent recently"
                : undefined,
            source: "session",
          },
        ]
      : [];

  return mergeUsers([...fromCampaignUsers, ...fromJobMembers, ...fromAppUsers, ...fromStoredUser]);
};

const readStoredUsers = (): UnifiedUser[] | null => {
  if (typeof window === "undefined") return null;
  const parsed = parseJson<{ users?: UnifiedUser[] }>(window.localStorage.getItem(USERS_STORAGE_KEY));
  if (!parsed?.users || !Array.isArray(parsed.users)) return null;
  return parsed.users;
};

const persistUsers = (users: UnifiedUser[]) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify({ users }));
  } catch {
    // Ignore persistence errors.
  }
};

const resolveInitialUsers = () => {
  const base = buildBaseUsers();
  const stored = readStoredUsers();
  if (!stored) return base;
  return mergeUsers([...base, ...stored]);
};

const findUserByEmailInList = (users: UnifiedUser[], email?: string | null) => {
  if (!email) return undefined;
  const normalized = email.trim().toLowerCase();
  return users.find((user) => user.email.toLowerCase() === normalized);
};

const getDefaultUserFromList = (users: UnifiedUser[]): UnifiedUser => {
  const defaultByEmail = findUserByEmailInList(users, DEFAULT_APP_USER.email);
  if (defaultByEmail) return defaultByEmail;
  if (users.length > 0) return users[0];
  return createDefaultUnifiedUser();
};

export const useUsersStore = create<UsersState>((set, get) => {
  const initialUsers = resolveInitialUsers();

  const persist = () => {
    persistUsers(get().users);
  };

  return {
    users: initialUsers,
    refreshUsers: () => {
      const baseUsers = buildBaseUsers();
      const merged = mergeUsers([...baseUsers, ...get().users]);
      set({ users: merged });
      persistUsers(merged);
    },
    setUsers: (users) => {
      const merged = mergeUsers(users);
      set({ users: merged });
      persistUsers(merged);
    },
    upsertUser: (user) => {
      const merged = mergeUsers([...get().users, user]);
      set({ users: merged });
      persist();
    },
    updateUserStatus: (id, isActive) => {
      set((state) => ({
        users: state.users.map((user) =>
          user.id === id
            ? {
                ...user,
                isActive,
                accountStatus: isActive ? "active" : "inactive",
                inviteState: isActive ? "none" : user.inviteState,
              }
            : user
        ),
      }));
      persist();
    },
    findUserByEmail: (email) => findUserByEmailInList(get().users, email),
    getDefaultUser: () => getDefaultUserFromList(get().users),
  };
});
