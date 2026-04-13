import { Link, matchPath, useLocation } from "react-router";

export type AppBreadcrumbItem = {
  label: string;
  to?: string;
};

type BreadcrumbResolver = {
  pattern: string;
  resolve: (params: Record<string, string | undefined>) => AppBreadcrumbItem[];
};

const toTitleCase = (value: string) =>
  value
    .replace(/[-_]/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const SEGMENT_LABELS: Record<string, string> = {
  home: "Home",
  settings: "Settings",
  people: "People",
  users: "Users",
  jobs: "Jobs",
  "job-information": "Job Information",
  localisation: "Localisation",
  profile: "Profile",
  notifications: "Notifications",
  "work-schedule": "Work Schedule",
  "campaign-setting": "Campaign Settings",
  "workflow-setting": "Workflow Settings",
  "checklist-setting": "Checklist Settings",
};

const ROUTE_RESOLVERS: BreadcrumbResolver[] = [
  {
    pattern: "/settings/jobs/job-information/:templateId/branching",
    resolve: (params) => {
      const templateId = params.templateId;
      const jobInfoPath =
        templateId && templateId !== "new"
          ? `/settings/jobs/job-information/${templateId}`
          : "/settings/jobs/job-information";
      return [
        { label: "Home", to: "/home" },
        { label: "Settings", to: "/settings" },
        { label: "Jobs", to: "/settings/jobs/job-information" },
        { label: "Job Information", to: jobInfoPath },
        { label: "Branching" },
      ];
    },
  },
  {
    pattern: "/settings/jobs/job-information/new",
    resolve: () => [
      { label: "Home", to: "/home" },
      { label: "Settings", to: "/settings" },
      { label: "Jobs", to: "/settings/jobs/job-information" },
      { label: "Job Information" },
    ],
  },
  {
    pattern: "/settings/jobs/job-information/:templateId",
    resolve: () => [
      { label: "Home", to: "/home" },
      { label: "Settings", to: "/settings" },
      { label: "Jobs", to: "/settings/jobs/job-information" },
      { label: "Job Information" },
    ],
  },
  {
    pattern: "/settings/jobs/job-information",
    resolve: () => [
      { label: "Home", to: "/home" },
      { label: "Settings", to: "/settings" },
      { label: "Jobs", to: "/settings/jobs/job-information" },
      { label: "Job Information" },
    ],
  },
  {
    pattern: "/settings/people/users/:userId",
    resolve: () => [
      { label: "Settings", to: "/settings" },
      { label: "People", to: "/settings/people/users" },
      { label: "Users", to: "/settings/people/users" },
      { label: "User Detail" },
    ],
  },
  {
    pattern: "/settings/people/users/:userId/edit",
    resolve: (params) => [
      { label: "Settings", to: "/settings" },
      { label: "People", to: "/settings/people/users" },
      { label: "Users", to: "/settings/people/users" },
      { label: "User Detail", to: `/settings/people/users/${params.userId}` },
      { label: "Edit" },
    ],
  },
  {
    pattern: "/settings/people/users/:userId/notifications",
    resolve: (params) => [
      { label: "Settings", to: "/settings" },
      { label: "People", to: "/settings/people/users" },
      { label: "Users", to: "/settings/people/users" },
      { label: "User Detail", to: `/settings/people/users/${params.userId}` },
      { label: "Notification" },
    ],
  },
  {
    pattern: "/settings/people/users/:userId/work-schedule",
    resolve: (params) => [
      { label: "Settings", to: "/settings" },
      { label: "People", to: "/settings/people/users" },
      { label: "Users", to: "/settings/people/users" },
      { label: "User Detail", to: `/settings/people/users/${params.userId}` },
      { label: "Work Schedule" },
    ],
  },
  {
    pattern: "/settings/people/users",
    resolve: () => [
      { label: "Settings", to: "/settings" },
      { label: "People", to: "/settings/people/users" },
      { label: "User Detail" },
    ],
  },
  {
    pattern: "/campaign-setting",
    resolve: () => [
      { label: "Settings", to: "/settings" },
      { label: "Campaign Settings" },
    ],
  },
  {
    pattern: "/workflow-setting",
    resolve: () => [
      { label: "Settings", to: "/settings" },
      { label: "Workflow Settings" },
    ],
  },
  {
    pattern: "/checklist-setting",
    resolve: () => [
      { label: "Settings", to: "/settings" },
      { label: "Checklist Settings" },
    ],
  },
  {
    pattern: "/profile/work-schedule",
    resolve: () => [
      { label: "Settings", to: "/settings" },
      { label: "People", to: "/settings/people/users" },
      { label: "Profile", to: "/profile" },
      { label: "Work Schedule" },
    ],
  },
  {
    pattern: "/profile/notifications",
    resolve: () => [
      { label: "Settings", to: "/settings" },
      { label: "People", to: "/settings/people/users" },
      { label: "Profile", to: "/profile" },
      { label: "Notifications" },
    ],
  },
  {
    pattern: "/profile",
    resolve: () => [
      { label: "Settings", to: "/settings" },
      { label: "People", to: "/settings/people/users" },
      { label: "Profile" },
    ],
  },
];

const buildDefaultItems = (pathname: string): AppBreadcrumbItem[] => {
  const parts = pathname.split("/").filter(Boolean);
  if (!parts.length) return [];

  let accumulatedPath = "";
  return parts.map((part, index) => {
    accumulatedPath += `/${part}`;
    const label = SEGMENT_LABELS[part] ?? toTitleCase(part);
    const isLast = index === parts.length - 1;
    return {
      label,
      to: isLast ? undefined : accumulatedPath,
    };
  });
};

const resolveBreadcrumbItems = (pathname: string): AppBreadcrumbItem[] => {
  for (const resolver of ROUTE_RESOLVERS) {
    const matched = matchPath({ path: resolver.pattern, end: true }, pathname);
    if (matched) {
      return resolver.resolve(matched.params as Record<string, string | undefined>);
    }
  }
  return buildDefaultItems(pathname);
};

interface AppBreadcrumbProps {
  items?: AppBreadcrumbItem[];
  className?: string;
}

export default function AppBreadcrumb({ items, className = "" }: AppBreadcrumbProps) {
  const location = useLocation();
  const resolvedItems =
    items && items.length > 0 ? items : resolveBreadcrumbItems(location.pathname);

  if (resolvedItems.length === 0) return null;

  return (
    <p className={`text-sm text-gray-500 ${className}`.trim()}>
      {resolvedItems.map((item, index) => {
        const isLast = index === resolvedItems.length - 1;
        return (
          <span key={`${item.label}-${index}`}>
            {item.to && !isLast ? (
              <Link to={item.to} className="transition hover:text-[#007B8C]">
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? "font-semibold text-[#007B8C]" : ""}>
                {item.label}
              </span>
            )}
            {!isLast ? <span className="mx-1">/</span> : null}
          </span>
        );
      })}
    </p>
  );
}
