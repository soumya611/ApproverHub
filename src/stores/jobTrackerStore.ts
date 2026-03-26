import { create } from "zustand";
import type { JobTrackerItem } from "../components/workflow/types";
import { JOB_TRACKER_ITEMS } from "../components/workflow/data/jobTrackerMockData";

interface JobTrackerState {
  items: JobTrackerItem[];
  addItem: (item: Omit<JobTrackerItem, "id">) => JobTrackerItem;
  removeItem: (id: string) => void;
  updateItem: (id: string, updates: Partial<Omit<JobTrackerItem, "id">>) => void;
}

function generateTrackerId(): string {
  return `jt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export const useJobTrackerStore = create<JobTrackerState>((set) => ({
  items: JOB_TRACKER_ITEMS,

  addItem: (item) => {
    const newItem: JobTrackerItem = {
      id: generateTrackerId(),
      ...item,
    };

    set((state) => ({
      items: [...state.items, newItem],
    }));

    return newItem;
  },

  removeItem: (id) => {
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    }));
  },

  updateItem: (id, updates) => {
    set((state) => ({
      items: state.items.map((item) => (item.id === id ? { ...item, ...updates } : item)),
    }));
  },
}));
