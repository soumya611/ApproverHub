import { create } from "zustand";

interface JobTrackerPaginationState {
  currentPage: number;
  pageSize: number;
}

interface JobTrackerState {
  pagination: JobTrackerPaginationState;
  goToNextPage: () => void;
  goToPreviousPage: () => void;
  setCurrentPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  resetPagination: () => void;
}

const STORAGE_KEY = "job_tracker_store_v1";
const DEFAULT_PAGE_SIZE = 50;

const normalizePagination = (
  pagination?: Partial<JobTrackerPaginationState>
): JobTrackerPaginationState => {
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

const readStoredPagination = (): JobTrackerPaginationState | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      pagination?: Partial<JobTrackerPaginationState>;
    };
    return normalizePagination(parsed.pagination);
  } catch {
    return null;
  }
};

const persistPagination = (pagination: JobTrackerPaginationState) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ pagination }));
  } catch {
    // Ignore persistence errors.
  }
};

export const useJobTrackerStore = create<JobTrackerState>((set, get) => {
  const initialPagination = readStoredPagination() ?? normalizePagination();

  const persist = () => {
    persistPagination(get().pagination);
  };

  return {
    pagination: initialPagination,
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
  };
});
