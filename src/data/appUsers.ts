export type AppUserRole = "team_manager" | "manager" | "user" | "admin" | "org_admin";
export type AppUserAccountStatus = "active" | "issue" | "inactive";

export interface AppUserAddress {
  country?: string;
  cityState?: string;
  postalCode?: string;
  taxId?: string;
}

export interface AppUserSocialLinks {
  facebook?: string;
  twitter?: string;
  linkedin?: string;
  instagram?: string;
}

export interface AppUserProfile {
  id: string;
  name: string;
  email: string;
  role: AppUserRole;
  accountStatus?: AppUserAccountStatus;
  avatarUrl?: string;
  phone?: string;
  title?: string;
  team?: string;
  workSchedule?: string;
  bio?: string;
  socialLinks?: AppUserSocialLinks;
  address?: AppUserAddress;
}

const ROLE_LABELS: Record<AppUserRole, string> = {
  team_manager: "Team Manager",
  manager: "Manager",
  user: "User",
  admin: "Admin",
  org_admin: "Org Admin",
};

export const APP_USERS: AppUserProfile[] = [
  {
    id: "ID1002451",
    name: "Soumya Patel",
    email: "teammanager@approverhub.com",
    role: "team_manager",
    accountStatus: "active",
    avatarUrl: "https://avatars.githubusercontent.com/u/103572396?v=4",
    phone: "+1 415 555 1020",
    title: "Web & App",
    team: "Designing",
    workSchedule: "Monday to Friday",
    bio: "Team manager for approvals and escalations.",
  },
  {
    id: "ID1234656",
    name: "Altaf Gadab",
    email: "manager@approverhub.com",
    role: "manager",
    accountStatus: "active",
    avatarUrl: "https://avatars.githubusercontent.com/u/103572396?v=4",
    phone: "+1 415 555 3126",
    title: "Operations",
    team: "Workflow",
    workSchedule: "Monday to Friday",
    bio: "Manager profile for workflow operations.",
  },
  {
    id: "ID1008842",
    name: "Priya Nair",
    email: "user@approverhub.com",
    role: "user",
    accountStatus: "active",
    avatarUrl: "https://avatars.githubusercontent.com/u/103572396?v=4",
    phone: "+1 415 555 8890",
    title: "Contributor",
    team: "Marketing",
    workSchedule: "Monday to Friday",
    bio: "General user account.",
  },
  {
    id: "ID1004028",
    name: "Ethan Clark",
    email: "admin@approverhub.com",
    role: "admin",
    accountStatus: "issue",
    avatarUrl: "https://avatars.githubusercontent.com/u/103572396?v=4",
    phone: "+1 415 555 6400",
    title: "Administration",
    team: "System",
    workSchedule: "Monday to Friday",
    bio: "Admin account for configuration and reporting.",
  },
  {
    id: "ID1007789",
    name: "Sara Johnson",
    email: "orgadmin@approverhub.com",
    role: "org_admin",
    accountStatus: "active",
    avatarUrl: "https://avatars.githubusercontent.com/u/103572396?v=4",
    phone: "+1 415 555 7777",
    title: "Governance",
    team: "Organization",
    workSchedule: "Monday to Friday",
    bio: "Organization admin account.",
  },
];

export const DEFAULT_APP_USER = APP_USERS[1];

export const normalizeAppRole = (role?: string | null): AppUserRole | undefined => {
  if (!role) return undefined;
  const normalized = role.trim().toLowerCase().replace(/\s+/g, "_");

  switch (normalized) {
    case "team_manager":
    case "manager":
    case "user":
    case "admin":
    case "org_admin":
      return normalized;
    default:
      return undefined;
  }
};

export const getRoleLabel = (role?: AppUserRole | string | null): string => {
  const normalizedRole =
    typeof role === "string" ? normalizeAppRole(role) : (role ?? undefined);
  if (!normalizedRole) return "";
  return ROLE_LABELS[normalizedRole];
};

export const isNormalUserRole = (role?: AppUserRole | string | null): boolean => {
  const normalizedRole =
    typeof role === "string" ? normalizeAppRole(role) : (role ?? undefined);
  return normalizedRole === "user";
};

export const findAppUserByEmail = (email?: string | null): AppUserProfile | undefined => {
  if (!email) return undefined;
  const normalizedEmail = email.trim().toLowerCase();
  return APP_USERS.find((user) => user.email.toLowerCase() === normalizedEmail);
};

export const getAccountStatusLabel = (status?: AppUserAccountStatus): string => {
  if (status === "issue") return "Issue";
  if (status === "inactive") return "Inactive";
  return "Active";
};
