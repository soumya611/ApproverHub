export interface HomeDateInfo {
  month: string;
  day: string;
  weekday: string;
}

export interface HomeWelcomeInfo {
  title: string;
  subtitle: string;
}

export interface HomeProgressInfo {
  completed: number;
  total: number;
}

export type DashboardCardIcon = "document" | "chart" | "clipboard";

export interface DashboardCard {
  id: string;
  title: string;
  description: string;
  value?: number;
  icon?: DashboardCardIcon;
  badge?: string;
  path?: string;
}

export interface HomeDashboardData {
  date: HomeDateInfo;
  welcome: HomeWelcomeInfo;
  progress: HomeProgressInfo;
  cards: DashboardCard[];
}