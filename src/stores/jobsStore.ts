import { create } from "zustand";
import type { JobRow } from "../components/jobs/types";
import { MOCK_JOBS } from "../components/jobs/types";

interface JobsPaginationState {
  currentPage: number;
  pageSize: number;
}

interface JobsState {
  jobs: JobRow[];
  archived: JobRow[];
  pinned: JobRow[];
  pagination: JobsPaginationState;
  addJob: (job: JobRow) => void;
  updateJob: (id: string, updates: Partial<JobRow>) => void;
  pinJobs: (ids: string[]) => void;
  unpinJob: (id: string) => void;
  archiveJobs: (ids: string[]) => void;
  goToNextPage: () => void;
  goToPreviousPage: () => void;
  setCurrentPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  resetPagination: () => void;
  clearAll: () => void;
}

const STORAGE_KEY = "jobs_store_v1";
const DEFAULT_PAGE_SIZE = 50;

const normalizePagination = (
  pagination?: Partial<JobsPaginationState>
): JobsPaginationState => {
  const normalizedPageSize =
    pagination?.pageSize && pagination.pageSize > 0
      ? Math.floor(pagination.pageSize)
      : DEFAULT_PAGE_SIZE;
  const normalizedCurrentPage =
    pagination?.currentPage && pagination.currentPage > 0
      ? Math.floor(pagination.currentPage)
      : 1;

  return {
    currentPage: normalizedCurrentPage,
    pageSize: normalizedPageSize,
  };
};

const clampPage = (page: number, totalItems: number, pageSize: number) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / Math.max(1, pageSize)));
  return Math.min(Math.max(1, page), totalPages);
};

const readStoredState = () => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      jobs: JobRow[];
      archived?: JobRow[];
      pinned?: JobRow[];
      pagination?: Partial<JobsPaginationState>;
    };
    if (!parsed || !Array.isArray(parsed.jobs)) return null;
    return {
      jobs: parsed.jobs,
      archived: Array.isArray(parsed.archived) ? parsed.archived : [],
      pinned: Array.isArray(parsed.pinned) ? parsed.pinned : [],
      pagination: normalizePagination(parsed.pagination),
    };
  } catch {
    return null;
  }
};

const persistState = (state: {
  jobs: JobRow[];
  archived: JobRow[];
  pinned: JobRow[];
  pagination: JobsPaginationState;
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
  const initialPagination = normalizePagination(stored?.pagination);

  const persist = () => {
    const { jobs, archived, pinned, pagination } = get();
    persistState({ jobs, archived, pinned, pagination });
  };

  return {
    jobs: initialJobs,
    archived: initialArchived,
    pinned: initialPinned,
    pagination: initialPagination,
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
        const currentPage = clampPage(
          state.pagination.currentPage,
          remaining.length,
          state.pagination.pageSize
        );
        return {
          jobs: remaining,
          archived,
          pinned,
          pagination: {
            ...state.pagination,
            currentPage,
          },
        };
      });
      persist();
    },
    goToNextPage: () => {
      set((state) => ({
        pagination: {
          ...state.pagination,
          currentPage: state.pagination.currentPage + 1,
        },
      }));
      persist();
    },
    goToPreviousPage: () => {
      set((state) => ({
        pagination: {
          ...state.pagination,
          currentPage: Math.max(1, state.pagination.currentPage - 1),
        },
      }));
      persist();
    },
    setCurrentPage: (page) => {
      const normalizedPage =
        Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
      set((state) => ({
        pagination: {
          ...state.pagination,
          currentPage: normalizedPage,
        },
      }));
      persist();
    },
    setPageSize: (pageSize) => {
      const normalizedPageSize =
        Number.isFinite(pageSize) && pageSize > 0
          ? Math.floor(pageSize)
          : DEFAULT_PAGE_SIZE;
      set((state) => ({
        pagination: {
          ...state.pagination,
          pageSize: normalizedPageSize,
          currentPage: 1,
        },
      }));
      persist();
    },
    resetPagination: () => {
      set((state) => ({
        pagination: {
          ...state.pagination,
          currentPage: 1,
        },
      }));
      persist();
    },
    clearAll: () => {
      set((state) => ({
        jobs: MOCK_JOBS,
        archived: [],
        pinned: [],
        pagination: {
          ...state.pagination,
          currentPage: 1,
        },
      }));
      persist();
    },
  };
});
