const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M3.04 9.37C3.04 5.88 5.88 3.04 9.37 3.04c3.5 0 6.33 2.84 6.33 6.33s-2.83 6.34-6.33 6.34C5.88 15.71 3.04 12.87 3.04 9.37Zm9.37 4.72a4.72 4.72 0 1 1 0-9.44 4.72 4.72 0 0 1 0 9.44Z" fill="currentColor" />
    <path d="M14.36 14.36l3.18 3.18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const FilterIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" /></svg>
);

const GridIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
);

const ListIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>
);

export type JobsTab = "all" | "my" | "completed";

interface JobsHeaderProps {
  title?: string;
  search: string;
  onSearchChange: (value: string) => void;
  activeTab: JobsTab;
  onTabChange: (tab: JobsTab) => void;
  allCount?: number;
  myCount?: number;
  completedCount?: number;
  viewMode?: "list" | "grid";
  onViewModeChange?: (mode: "list" | "grid") => void;
}

export default function JobsHeader({
  title = "Jobs",
  search,
  onSearchChange,
  activeTab,
  onTabChange,
  allCount = 6,
  myCount = 1,
  completedCount = 0,
  viewMode = "list",
  onViewModeChange,
}: JobsHeaderProps) {
  return (
    <div className="p-6 pb-4 space-y-4">
      <h1 className="text-xl font-bold text-[#007B8C]">{title}</h1>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <SearchIcon />
          </span>
          <input
            type="text"
            placeholder="Search job"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-lg border border-gray-200 bg-white text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#007B8C]/20 focus:border-[#007B8C]"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onTabChange("all")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === "all" ? "bg-[#007B8C] text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
          >
            All ({allCount})
          </button>
          <button
            type="button"
            onClick={() => onTabChange("my")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === "my" ? "bg-[#007B8C] text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
          >
            My Jobs ({myCount})
          </button>
          <button
            type="button"
            onClick={() => onTabChange("completed")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === "completed" ? "bg-[#007B8C] text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
          >
            Completed jobs ({completedCount})
          </button>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <button type="button" className="p-2 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50" aria-label="Filter">
          <FilterIcon />
        </button>
        <button
          type="button"
          onClick={() => onViewModeChange?.("grid")}
          className={`p-2 rounded-lg border ${viewMode === "grid" ? "border-[#007B8C] bg-[#007B8C]/10 text-[#007B8C]" : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"}`}
          aria-label="Grid view"
        >
          <GridIcon />
        </button>
        <button
          type="button"
          onClick={() => onViewModeChange?.("list")}
          className={`p-2 rounded-lg border ${viewMode === "list" ? "border-[#007B8C] bg-[#007B8C]/10 text-[#007B8C]" : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"}`}
          aria-label="List view"
        >
          <ListIcon />
        </button>
      </div>
    </div>
  );
}
