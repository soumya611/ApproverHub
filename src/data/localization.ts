export const LOCALIZATION_ITEMS = [
  { key: "nav.home", location: "Sidebar", defaultLabel: "Home" },
  { key: "nav.jobs", location: "Sidebar", defaultLabel: "Jobs" },
  { key: "nav.campaigns", location: "Sidebar", defaultLabel: "Campaigns" },
  { key: "nav.jobTracker", location: "Sidebar", defaultLabel: "Job Tracker" },
  { key: "nav.analytics", location: "Sidebar", defaultLabel: "Analytics" },
  { key: "page.jobs.title", location: "Page heading", defaultLabel: "Jobs" },
  { key: "page.campaigns.title", location: "Page heading", defaultLabel: "Campaign" },
  { key: "page.jobTracker.title", location: "Page heading", defaultLabel: "Job Tracker" },
  { key: "page.analytics.title", location: "Page heading", defaultLabel: "Analytics" },
] as const;

export type LocalizationItem = (typeof LOCALIZATION_ITEMS)[number];
export type LocalizationKey = LocalizationItem["key"];
export type LocalizationOverrides = Partial<Record<LocalizationKey, string>>;

export const DEFAULT_LABELS = LOCALIZATION_ITEMS.reduce(
  (acc, item) => {
    acc[item.key] = item.defaultLabel;
    return acc;
  },
  {} as Record<LocalizationKey, string>
);

export const resolveLabel = (
  key: LocalizationKey,
  overrides: LocalizationOverrides
) => {
  const override = overrides[key];
  if (override && override.trim().length > 0) {
    return override.trim();
  }
  return DEFAULT_LABELS[key];
};
