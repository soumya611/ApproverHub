import { create } from "zustand";
import type { CampaignMember, CampaignRowData } from "../data/campaigns";
import { CAMPAIGN_DATA } from "../data/campaigns";
import type { WorkflowMember, WorkflowStage } from "../types/workflow.types";

interface CampaignsPaginationState {
  currentPage: number;
  pageSize: number;
}

export type PinnedMember = CampaignMember;

export type PinnedCampaign = {
  id: string;
  campaignId: string;
  title: string;
  endDate: string;
  members: PinnedMember[];
  stages: WorkflowStage[];
  assetTitle?: string;
  assetFormat?: string;
};

interface CampaignsState {
  campaigns: CampaignRowData[];
  archived: CampaignRowData[];
  pinned: PinnedCampaign[];
  pagination: CampaignsPaginationState;
  addCampaign: (campaign: CampaignRowData) => void;
  updateCampaign: (id: string, updates: Partial<CampaignRowData>) => void;
  duplicateCampaigns: (ids: string[]) => void;
  archiveCampaigns: (ids: string[]) => void;
  pinCampaigns: (ids: string[]) => void;
  unpinCampaign: (id: string) => void;
  goToNextPage: () => void;
  goToPreviousPage: () => void;
  setCurrentPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  resetPagination: () => void;
  clearAll: () => void;
}

const STORAGE_KEY = "campaigns_store_v1";
const DEFAULT_PAGE_SIZE = 50;

const normalizePagination = (
  pagination?: Partial<CampaignsPaginationState>
): CampaignsPaginationState => {
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
      campaigns: CampaignRowData[];
      archived: CampaignRowData[];
      pinned: PinnedCampaign[];
      pagination?: Partial<CampaignsPaginationState>;
    };
    if (!parsed || !Array.isArray(parsed.campaigns)) return null;
    return {
      ...parsed,
      pagination: normalizePagination(parsed.pagination),
    };
  } catch {
    return null;
  }
};

const persistState = (state: {
  campaigns: CampaignRowData[];
  archived: CampaignRowData[];
  pinned: PinnedCampaign[];
  pagination: CampaignsPaginationState;
}) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore persistence errors.
  }
};

const createPinnedStages = (
  baseId: string,
  members: PinnedMember[]
): WorkflowStage[] => {
  const workflowMembers: WorkflowMember[] = members.map((member) => ({
    id: member.id,
    initials: member.initials,
    className: member.className,
  }));

  return [
    {
      id: `${baseId}-s1`,
      stepLabel: "S1",
      name: "Content Edit",
      status: "Approved",
      dueDate: "28 Jan 26",
      commentsCount: 3,
      members: workflowMembers,
    },
    {
      id: `${baseId}-s2`,
      stepLabel: "S2",
      name: "Content Edit",
      status: "In Progress",
      dueDate: "28 Jan 26",
      commentsCount: 3,
      members: workflowMembers,
    },
    {
      id: `${baseId}-s3`,
      stepLabel: "S3",
      name: "Legal",
      status: "Not Started",
      dueDate: "02 Feb 26",
      members: workflowMembers,
    },
    {
      id: `${baseId}-s4`,
      stepLabel: "S4",
      name: "Final",
      status: "Not Started",
      dueDate: "02 Feb 26",
      commentsCount: 0,
      members: workflowMembers,
    },
  ];
};

const createDuplicateRow = (row: CampaignRowData, index: number) => {
  const duplicateId = `dup-${Date.now()}-${index}`;
  const nextSubRows = row.subRows?.map((subRow, subIndex) => ({
    ...subRow,
    id: `${duplicateId}-sub-${subIndex + 1}`,
  }));

  return {
    ...row,
    id: duplicateId,
    campaignId: `${row.campaignId}-D${index + 1}`,
    title: `${row.title} Copy`,
    campaignName: row.campaignName ? `${row.campaignName} Copy` : row.campaignName,
    subRows: nextSubRows,
  };
};

const createPinnedCampaign = (row: CampaignRowData): PinnedCampaign => {
  const members = row.members ?? [];
  const stages =
    row.workflowStages && row.workflowStages.length > 0
      ? row.workflowStages
      : createPinnedStages(row.id, members);
  return {
    id: row.id,
    campaignId: row.campaignId,
    title: row.title,
    endDate: row.endDate,
    members,
    stages,
    assetTitle: row.assetTitle,
    assetFormat: row.assetFormat,
  };
};

const mergeCampaignDefaults = (row: CampaignRowData): CampaignRowData => {
  const fallback = CAMPAIGN_DATA.find((item) => item.id === row.id);
  if (!fallback) return row;
  return {
    ...fallback,
    ...row,
    members: row.members ?? fallback.members,
    workflowStages: row.workflowStages ?? fallback.workflowStages,
    assetTitle: row.assetTitle ?? fallback.assetTitle,
    assetFormat: row.assetFormat ?? fallback.assetFormat,
  };
};

const mergePinnedDefaults = (
  pinned: PinnedCampaign[],
  campaigns: CampaignRowData[]
): PinnedCampaign[] =>
  pinned.map((item) => {
    const base = campaigns.find((row) => row.id === item.id);
    const storedMembers = Array.isArray(item.members) ? item.members : [];
    const members =
      storedMembers.length > 0 ? storedMembers : base?.members ?? [];
    const baseStages = base?.workflowStages ?? [];
    const storedStages = Array.isArray(item.stages) ? item.stages : [];
    const stages =
      baseStages.length > 0
        ? baseStages
        : storedStages.length > 0
          ? storedStages
          : createPinnedStages(item.id, members);
    return {
      ...item,
      members,
      stages,
      assetTitle: item.assetTitle ?? base?.assetTitle,
      assetFormat: item.assetFormat ?? base?.assetFormat,
    };
  });

export const useCampaignsStore = create<CampaignsState>((set, get) => {
  const stored = readStoredState();
  const initialCampaigns = (stored?.campaigns ?? CAMPAIGN_DATA).map(
    mergeCampaignDefaults
  );
  const initialArchived = stored?.archived ?? [];
  const initialPinned = mergePinnedDefaults(
    stored?.pinned ?? [],
    initialCampaigns
  );
  const initialPagination = normalizePagination(stored?.pagination);

  const persist = () => {
    const { campaigns, archived, pinned, pagination } = get();
    persistState({ campaigns, archived, pinned, pagination });
  };

  return {
    campaigns: initialCampaigns,
    archived: initialArchived,
    pinned: initialPinned,
    pagination: initialPagination,
    addCampaign: (campaign) => {
      set((state) => ({
        campaigns: [campaign, ...state.campaigns],
      }));
      persist();
    },
    updateCampaign: (id, updates) => {
      set((state) => {
        const campaigns = state.campaigns.map((row) =>
          row.id === id ? { ...row, ...updates } : row
        );
        const updatedRow = campaigns.find((row) => row.id === id);
        const pinned = updatedRow
          ? state.pinned.map((item) =>
              item.id === id ? createPinnedCampaign(updatedRow) : item
            )
          : state.pinned;
        return { campaigns, pinned };
      });
      persist();
    },
    duplicateCampaigns: (ids) => {
      if (!ids.length) return;
      set((state) => {
        const originals = state.campaigns.filter((row) => ids.includes(row.id));
        const duplicates = originals.map((row, index) =>
          createDuplicateRow(row, index)
        );
        return { campaigns: [...duplicates, ...state.campaigns] };
      });
      persist();
    },
    archiveCampaigns: (ids) => {
      if (!ids.length) return;
      set((state) => {
        const toArchive = state.campaigns.filter((row) =>
          ids.includes(row.id)
        );
        const remaining = state.campaigns.filter((row) => !ids.includes(row.id));
        const archived = [
          ...state.archived,
          ...toArchive.filter(
            (row) => !state.archived.some((item) => item.id === row.id)
          ),
        ];
        const pinned = state.pinned.filter((item) => !ids.includes(item.id));
        const currentPage = clampPage(
          state.pagination.currentPage,
          remaining.length,
          state.pagination.pageSize
        );
        return {
          campaigns: remaining,
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
    pinCampaigns: (ids) => {
      if (!ids.length) return;
      set((state) => {
        const toPin = state.campaigns.filter((row) => ids.includes(row.id));
        const nextPinned = [
          ...state.pinned,
          ...toPin
            .filter((row) => !state.pinned.some((item) => item.id === row.id))
            .map((row) => createPinnedCampaign(row)),
        ];
        return { pinned: nextPinned };
      });
      persist();
    },
    unpinCampaign: (id) => {
      set((state) => ({
        pinned: state.pinned.filter((item) => item.id !== id),
      }));
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
        campaigns: CAMPAIGN_DATA,
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
