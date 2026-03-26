import { useMemo, useState } from "react";
import Button from "../button/Button";
import DescriptionText from "../description-text/DescriptionText";
import { Dropdown } from "../dropdown/Dropdown";
import PopupTitle from "../popup-title/PopupTitle";
import SearchInput from "../search-input/SearchInput";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  Search,
  Star,
} from "../../../icons";

export type WorkflowOption = {
  id: string;
  label: string;
  isFavorite?: boolean;
};

type WorkflowTab = "all" | "favorites" | "build";

interface SelectWorkflowDropdownProps {
  title?: string;
  defaultOpen?: boolean;
  className?: string;
  workflows?: WorkflowOption[];
  headerClassName?: string;
  dividerClassName?: string;
  bodyClassName?: string;
  sidebarClassName?: string;
  contentClassName?: string;
  inline?: boolean;
  dropdownClassName?: string;
  selectedWorkflowId?: string;
  onSelectWorkflow?: (workflow: WorkflowOption) => void;
  onCreateBuildWorkflow?: () => void;
}

const defaultWorkflows: WorkflowOption[] = [
  { id: "marketing", label: "Marketing", isFavorite: true },
  { id: "sales", label: "Sales" },
  { id: "product-development", label: "Product Development" },
  { id: "customer-support", label: "Customer Support" },
  { id: "content-creation", label: "Content Creation" },
  { id: "marketing-2", label: "Marketing" },
];

const workflowTabs: { id: WorkflowTab; label: string }[] = [
  { id: "all", label: "All templates" },
  { id: "favorites", label: "Favourites" },
  { id: "build", label: "Build your own" },
];

const tabDescription: Record<WorkflowTab, string> = {
  all: "Please select your workflow",
  favorites: "All your saved and favorite workflows will appear here",
  build: "Build your own",
};

interface WorkflowOptionCardProps {
  label: string;
  isFavorite: boolean;
  isSelected: boolean;
  onToggleFavorite: () => void;
  onSelect: () => void;
}

function WorkflowOptionCard({
  label,
  isFavorite,
  isSelected,
  onToggleFavorite,
  onSelect,
}: WorkflowOptionCardProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
      className={`flex items-center justify-between gap-3 rounded-md border px-3 py-2 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 cursor-pointer ${
        isSelected
          ? "border-[#007B8C] bg-[#007B8C]/10 text-[#007B8C]"
          : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
      }`}
    >
      <span>{label}</span>
      <span className="relative">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onToggleFavorite();
          }}
          aria-label={isFavorite ? "Remove from favourites" : "Add to favourites"}
          className="rounded-full p-0.5 text-gray-300 transition hover:text-[#F2B534] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
        >
          <Star
            className={`h-3.5 w-3.5 ${
              isFavorite ? "text-[#F2B534]" : "text-gray-300"
            }`}
          />
        </button>
      </span>
    </div>
  );
}

export default function SelectWorkflowDropdown({
  title = "Select Workflow",
  defaultOpen = false,
  className = "",
  workflows = defaultWorkflows,
  headerClassName = "",
  dividerClassName = "",
  bodyClassName = "",
  sidebarClassName = "",
  contentClassName = "",
  inline = false,
  dropdownClassName = "",
  selectedWorkflowId,
  onSelectWorkflow,
  onCreateBuildWorkflow,
}: SelectWorkflowDropdownProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [activeTab, setActiveTab] = useState<WorkflowTab>("all");
  const [query, setQuery] = useState("");
  const [workflowItems, setWorkflowItems] = useState(workflows);
  const [internalSelectedId, setInternalSelectedId] = useState<string | null>(null);

  const visibleWorkflows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    let items = workflowItems;
    if (activeTab === "favorites") {
      items = workflowItems.filter((workflow) => workflow.isFavorite);
    }
    if (normalizedQuery) {
      items = items.filter((workflow) =>
        workflow.label.toLowerCase().includes(normalizedQuery)
      );
    }
    return items;
  }, [activeTab, query, workflowItems]);

  const handleToggleFavorite = (workflowId: string) => {
    setWorkflowItems((prev) =>
      prev.map((workflow) =>
        workflow.id === workflowId
          ? { ...workflow, isFavorite: !workflow.isFavorite }
          : workflow
      )
    );
  };

  const handleToggleOpen = () => {
    setIsOpen((prev) => !prev);
  };

  const selectedId = selectedWorkflowId ?? internalSelectedId;

  const handleSelectWorkflow = (workflow: WorkflowOption) => {
    if (selectedWorkflowId === undefined) {
      setInternalSelectedId(workflow.id);
    }
    onSelectWorkflow?.(workflow);
  };

  const handleCreateBuildWorkflow = () => {
    onCreateBuildWorkflow?.();
    setIsOpen(false);
  };

  const dropdownContent = (
    <>
      <div className={`border-b border-gray-200 ${dividerClassName}`} />
      <div className={`flex min-h-[220px] ${bodyClassName}`}>
        <aside className={`w-44 border-r border-gray-200 px-4 py-4 ${sidebarClassName}`}>
          <p className="text-xs font-bold uppercase tracking-wide text-gray-900">
            Templates
          </p>
          <div className="mt-3 flex flex-col gap-2">
            {workflowTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`text-left text-xs font-medium transition ${
                    isActive
                      ? "text-brand-teal"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </aside>
        <div className={`flex-1 px-4 py-4 ${contentClassName}`}>
          <DescriptionText
            label={null}
            text={tabDescription[activeTab]}
            className="text-xs"
            textClassName="text-gray-400"
          />
          {activeTab === "build" ? (
            <div className="mt-4">
              <Button
                type="button"
                size="sm"
                variant="primary"
                className="!rounded-md !px-4 !py-2 text-xs"
                onClick={handleCreateBuildWorkflow}
              >
                Create
              </Button>
            </div>
          ) : (
            <div className="mt-4 flex flex-wrap gap-3">
              {visibleWorkflows.length === 0 ? (
                <p className="text-xs text-gray-400">No workflows found.</p>
              ) : (
                visibleWorkflows.map((workflow) => (
                  <WorkflowOptionCard
                    key={workflow.id}
                    label={workflow.label}
                    isFavorite={Boolean(workflow.isFavorite)}
                    isSelected={selectedId === workflow.id}
                    onToggleFavorite={() => handleToggleFavorite(workflow.id)}
                    onSelect={() => handleSelectWorkflow(workflow)}
                  />
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );

  return (
    <div className={`relative w-full ${className}`}>
      <button
        type="button"
        onClick={handleToggleOpen}
        aria-expanded={isOpen}
        className={`dropdown-toggle flex w-full items-center justify-between gap-3 border border-gray-200 bg-[white] px-4 py-3 text-left transition hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 ${
          isOpen ? "rounded-t-xl" : "rounded-xl"
        } ${headerClassName}`}
      >
        <div className="flex flex-1 items-center gap-0">
          <PopupTitle
            sizeClassName="text-sm w-44"
            colorClassName="text-gray-800"
            weightClassName="font-semibold"
          >
            {title}
          </PopupTitle>
          {isOpen ? (
            <div onClick={(event) => event.stopPropagation()}>
              <SearchInput
                value={query}
                placeholder="Search workflow"
                onChange={(event) => setQuery(event.target.value)}
                containerClassName="max-w-[240px] rounded-full border border-gray-200 bg-gray-50 px-3 py-1"
                inputClassName="text-xs text-gray-700 placeholder:text-gray-400"
                className="text-xs text-gray-700"
                iconClassName="text-gray-400"
                icon={<Search className="h-3.5 w-3.5 text-gray-400" />}
              />
            </div>
          ) : null}
        </div>
        {isOpen ? (
          <ChevronUpIcon className="h-4 w-4" />
        ) : (
          <ChevronDownIcon className="h-4 w-4" />
        )}
      </button>
      {inline ? (
        isOpen ? (
          <div
            className={`rounded-b-xl border border-gray-200 border-t-0 bg-white shadow-sm ${dropdownClassName}`}
          >
            {dropdownContent}
          </div>
        ) : null
      ) : (
        <Dropdown
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          className={`left-0 right-0 !mt-0 rounded-t-none border-t-0 shadow-sm ${dropdownClassName}`}
        >
          {dropdownContent}
        </Dropdown>
      )}
    </div>
  );
}
