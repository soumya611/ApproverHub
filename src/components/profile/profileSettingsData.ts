import type { AppUserRole } from "../../data/appUsers";
import type { AppSvgIcon } from "../../icons";
import {
  CommentIcon,
  DeadlineIcon,
  JobIcon,
  NotificationIcon,
  ShowflowIcon,
} from "../../icons";

export interface ProfileWorkDay {
  id: string;
  day: string;
  shift: string;
  channel: string;
  isActive: boolean;
}

export interface ProfileWorkScheduleDetails {
  timezone: string;
  weeklyHours: string;
  defaultShift: string;
  workingDays: string;
  days: ProfileWorkDay[];
}

export interface ProfileNotificationPreference {
  id: string;
  icon: AppSvgIcon;
  title: string;
  description: string;
  inApp: boolean;
  email: boolean;
}

const cloneDays = (days: ProfileWorkDay[]): ProfileWorkDay[] =>
  days.map((day) => ({ ...day }));

const clonePreferences = (
  preferences: ProfileNotificationPreference[]
): ProfileNotificationPreference[] => preferences.map((preference) => ({ ...preference }));

const WORK_DAYS_TEMPLATE: ProfileWorkDay[] = [
  {
    id: "monday",
    day: "Monday",
    shift: "09:30 AM - 06:30 PM",
    channel: "Web & App",
    isActive: true,
  },
  {
    id: "tuesday",
    day: "Tuesday",
    shift: "09:30 AM - 06:30 PM",
    channel: "Web & App",
    isActive: true,
  },
  {
    id: "wednesday",
    day: "Wednesday",
    shift: "09:30 AM - 06:30 PM",
    channel: "Web & App",
    isActive: true,
  },
  {
    id: "thursday",
    day: "Thursday",
    shift: "09:30 AM - 06:30 PM",
    channel: "Web & App",
    isActive: true,
  },
  {
    id: "friday",
    day: "Friday",
    shift: "09:30 AM - 06:30 PM",
    channel: "Web & App",
    isActive: true,
  },
  {
    id: "saturday",
    day: "Saturday",
    shift: "Off Day",
    channel: "--",
    isActive: false,
  },
  {
    id: "sunday",
    day: "Sunday",
    shift: "Off Day",
    channel: "--",
    isActive: false,
  },
];

const BASE_WORK_SCHEDULES: Record<AppUserRole, ProfileWorkScheduleDetails> = {
  team_manager: {
    timezone: "(GMT -08:00) Pacific Time",
    weeklyHours: "40 Hours / Week",
    defaultShift: "09:30 AM - 06:30 PM",
    workingDays: "Monday to Friday",
    days: cloneDays(WORK_DAYS_TEMPLATE),
  },
  manager: {
    timezone: "(GMT -08:00) Pacific Time",
    weeklyHours: "40 Hours / Week",
    defaultShift: "09:00 AM - 06:00 PM",
    workingDays: "Monday to Friday",
    days: cloneDays(
      WORK_DAYS_TEMPLATE.map((day) =>
        day.isActive ? { ...day, shift: "09:00 AM - 06:00 PM" } : day
      )
    ),
  },
  user: {
    timezone: "(GMT -08:00) Pacific Time",
    weeklyHours: "35 Hours / Week",
    defaultShift: "10:00 AM - 06:00 PM",
    workingDays: "Monday to Friday",
    days: cloneDays(
      WORK_DAYS_TEMPLATE.map((day) =>
        day.isActive ? { ...day, shift: "10:00 AM - 06:00 PM" } : day
      )
    ),
  },
  admin: {
    timezone: "(GMT -06:00) Central Time",
    weeklyHours: "45 Hours / Week",
    defaultShift: "08:30 AM - 06:00 PM",
    workingDays: "Monday to Friday",
    days: cloneDays(
      WORK_DAYS_TEMPLATE.map((day) =>
        day.isActive ? { ...day, shift: "08:30 AM - 06:00 PM" } : day
      )
    ),
  },
  org_admin: {
    timezone: "(GMT -05:00) Eastern Time",
    weeklyHours: "40 Hours / Week",
    defaultShift: "09:00 AM - 06:00 PM",
    workingDays: "Monday to Friday",
    days: cloneDays(
      WORK_DAYS_TEMPLATE.map((day) =>
        day.isActive ? { ...day, shift: "09:00 AM - 06:00 PM" } : day
      )
    ),
  },
};

const BASE_NOTIFICATION_PREFERENCES: ProfileNotificationPreference[] = [
  {
    id: "job_assignments",
    icon: JobIcon,
    title: "Job Assignments",
    description: "Notify when new jobs are assigned to you or your team.",
    inApp: true,
    email: true,
  },
  {
    id: "workflow_updates",
    icon: ShowflowIcon,
    title: "Workflow Updates",
    description: "Get updates when workflow stages are started or completed.",
    inApp: true,
    email: true,
  },
  {
    id: "mentions",
    icon: CommentIcon,
    title: "Comments & Mentions",
    description: "Receive alerts when someone mentions you in comments.",
    inApp: true,
    email: false,
  },
  {
    id: "deadline_reminders",
    icon: DeadlineIcon,
    title: "Deadline Reminders",
    description: "Reminder alerts before due dates and SLA breaches.",
    inApp: true,
    email: true,
  },
  {
    id: "system_announcements",
    icon: NotificationIcon,
    title: "System Announcements",
    description: "Product updates and important account notifications.",
    inApp: true,
    email: false,
  },
];

const buildNotificationSet = (
  overrides: Partial<Record<string, Pick<ProfileNotificationPreference, "inApp" | "email">>> = {}
): ProfileNotificationPreference[] =>
  BASE_NOTIFICATION_PREFERENCES.map((preference) => ({
    ...preference,
    ...(overrides[preference.id] ?? {}),
  }));

const ROLE_NOTIFICATION_PREFERENCES: Record<AppUserRole, ProfileNotificationPreference[]> = {
  team_manager: buildNotificationSet(),
  manager: buildNotificationSet({
    system_announcements: { inApp: true, email: true },
  }),
  user: buildNotificationSet({
    workflow_updates: { inApp: true, email: false },
    deadline_reminders: { inApp: true, email: false },
  }),
  admin: buildNotificationSet({
    mentions: { inApp: true, email: true },
    system_announcements: { inApp: true, email: true },
  }),
  org_admin: buildNotificationSet({
    job_assignments: { inApp: true, email: false },
    system_announcements: { inApp: true, email: true },
  }),
};

export const getWorkScheduleDetailsByRole = (
  role: AppUserRole = "manager"
): ProfileWorkScheduleDetails => ({
  ...BASE_WORK_SCHEDULES[role],
  days: cloneDays(BASE_WORK_SCHEDULES[role].days),
});

export const getNotificationPreferencesByRole = (
  role: AppUserRole = "manager"
): ProfileNotificationPreference[] => clonePreferences(ROLE_NOTIFICATION_PREFERENCES[role]);
