import { create } from "zustand";
import type { JobRow } from "../components/jobs/types";
import { MOCK_JOBS } from "../components/jobs/types";

interface JobsState {
  jobs: JobRow[];
  archived: JobRow[];
  pinned: JobRow[];
  addJob: (job: JobRow) => void;
  updateJob: (id: string, updates: Partial<JobRow>) => void;
  pinJobs: (ids: string[]) => void;
  unpinJob: (id: string) => void;
  archiveJobs: (ids: string[]) => void;
  clearAll: () => void;
}

const STORAGE_KEY = "jobs_store_v1";

const readStoredState = () => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      jobs: JobRow[];
      archived?: JobRow[];
      pinned?: JobRow[];
    };
    if (!parsed || !Array.isArray(parsed.jobs)) return null;
    return {
      jobs: parsed.jobs,
      archived: Array.isArray(parsed.archived) ? parsed.archived : [],
      pinned: Array.isArray(parsed.pinned) ? parsed.pinned : [],
    };
  } catch {
    return null;
  }
};

const persistState = (state: {
  jobs: JobRow[];
  archived: JobRow[];
  pinned: JobRow[];
}) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore persistence errors.
  }
};

export const useJobsStore = create<JobsState>((set, get) => {
  const stored = readStoredState();
  const initialJobs = stored?.jobs ?? MOCK_JOBS;
  const initialArchived = stored?.archived ?? [];
  const initialPinned =
    stored?.pinned
      ?.map(
        (job) => initialJobs.find((item) => item.id === job.id) ?? job
      )
      .filter((job) => initialJobs.some((item) => item.id === job.id)) ?? [];

  const persist = () => {
    const { jobs, archived, pinned } = get();
    persistState({ jobs, archived, pinned });
  };

  return {
    jobs: initialJobs,
    archived: initialArchived,
    pinned: initialPinned,
    addJob: (job) => {
      set((state) => ({
        jobs: [job, ...state.jobs],
      }));
      persist();
    },
    updateJob: (id, updates) => {
      set((state) => {
        const jobs = state.jobs.map((job) =>
          job.id === id ? { ...job, ...updates } : job
        );
        const archived = state.archived.map((job) =>
          job.id === id ? { ...job, ...updates } : job
        );
        const pinned = state.pinned.map((job) =>
          job.id === id ? { ...job, ...updates } : job
        );
        return { jobs, archived, pinned };
      });
      persist();
    },
    pinJobs: (ids) => {
      if (!ids.length) return;
      set((state) => {
        const toPin = state.jobs.filter((job) => ids.includes(job.id));
        const nextPinned = [
          ...state.pinned,
          ...toPin.filter(
            (job) => !state.pinned.some((item) => item.id === job.id)
          ),
        ];
        return { pinned: nextPinned };
      });
      persist();
    },
    unpinJob: (id) => {
      set((state) => ({
        pinned: state.pinned.filter((job) => job.id !== id),
      }));
      persist();
    },
    archiveJobs: (ids) => {
      if (!ids.length) return;
      set((state) => {
        const toArchive = state.jobs.filter((job) => ids.includes(job.id));
        const remaining = state.jobs.filter((job) => !ids.includes(job.id));
        const archived = [
          ...state.archived,
          ...toArchive.filter(
            (job) => !state.archived.some((item) => item.id === job.id)
          ),
        ];
        const pinned = state.pinned.filter((job) => !ids.includes(job.id));
        return { jobs: remaining, archived, pinned };
      });
      persist();
    },
    clearAll: () => {
      set({ jobs: MOCK_JOBS, archived: [], pinned: [] });
      persistState({ jobs: MOCK_JOBS, archived: [], pinned: [] });
    },
  };
});
