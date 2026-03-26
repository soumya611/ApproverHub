import { useState, useEffect } from "react";
import type { HomeDashboardData } from "../types/home";

/**
 * Fetches home dashboard data. Replace the mock implementation with your API.
 * Example API integration:
 *
 * const response = await fetch('/api/home-dashboard');
 * if (!response.ok) throw new Error('Failed to load');
 * return response.json();
 */
async function fetchHomeDashboard(): Promise<HomeDashboardData> {
  // TODO: Replace with real API call
  // const res = await fetch('/api/home-dashboard');
  // if (!res.ok) throw new Error('Failed to load dashboard');
  // return res.json();

  const now = new Date();
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return {
    date: {
      month: months[now.getMonth()],
      day: String(now.getDate()).padStart(2, "0"),
      weekday: weekdays[now.getDay()],
    },
    welcome: {
      title: "Welcome !",
      subtitle: "Greetings for the day",
    },
    progress: {
      completed: 4,
      total: 6,
    },
    cards: [
      {
        id: "live-jobs",
        title: "Live Jobs",
        description:
          "Track all ongoing jobs in real time and stay updated on current progress.",
        value: 23,
        path: "/jobs",
      },
      {
        id: "live-campaigns",
        title: "Live Campaigns",
        description:
          "Monitor active campaigns and analyze engagement performance instantly.",
        value: 30,
        path: "/campaigns",
      },
      {
        id: "completed-jobs",
        title: "Completed Jobs",
        description:
          "Review finished tasks and measure completion outcomes with ease.",
        icon: "document",
      },
      {
        id: "analytics",
        title: "Analytics",
        description:
          "Gain insights from key metrics to improve performance and strategy.",
        icon: "chart",
      },
      {
        id: "job-tracker",
        title: "Job Tracker",
        description:
          "Keep a detailed record of job activities and deadlines in one place.",
        icon: "clipboard",
        badge: "1 CU",
        path: "/job-tracker",
      },
    ],
  };
}

export function useHomeDashboard() {
  const [data, setData] = useState<HomeDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchHomeDashboard()
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err : new Error(String(err)));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { data, loading, error };
}
