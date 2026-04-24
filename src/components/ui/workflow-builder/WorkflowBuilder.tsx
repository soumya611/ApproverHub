import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Button from "../button/Button";
import SearchInput from "../search-input/SearchInput";
import UserCell from "../user-cell/UserCell";
import { Dropdown } from "../dropdown/Dropdown";
import { DropdownItem } from "../dropdown/DropdownItem";
import {
  AlertIcon,
  CheckListIcon,
  ChevronDownIcon,
  EditPenIcon,
  PlusIcon,
  SettingIcon,
  ShowflowIcon,
  VerticalDots,
  Symbols_lock_Icon,
  StartIcon,
  SkipIcon,
  AddpeopleIcon,
  CalculationIcon,
  DeadlineIcon,
  DropDownArrowIcon,
} from "../../../icons";
import {
  StageStepList,
  WorkflowStageCard,
  type WorkflowStage,
} from "../../workflow";
import type {
  JobMember,
  JobWorkflowConfig,
  JobWorkflowPermissions,
  JobWorkflowStageConfig,
} from "../../jobs/types";
import DeadlinePicker from "../../form/DatePicker";
import { useChecklistTemplatesStore } from "@/stores/checklistTemplatesStore";
import BuilderSelect from "@/components/ui/dropdown/BuilderSelect";

export interface WorkflowBuilderValue extends JobWorkflowConfig { }

interface WorkflowBuilderProps {
  value?: WorkflowBuilderValue | null;
  reviewerOptions?: JobMember[];
  onSave: (value: WorkflowBuilderValue) => void;
  onCancel: () => void;
  className?: string;
  mode?: "create" | "edit";
}

const STAGE_PERMISSION_OPTIONS = [
  { id: "add_stage", label: "Add stages" },
  { id: "remove_stage", label: "Remove stages" },
  { id: "change_stage_name", label: "Change stage name" },
  { id: "change_skip", label: "Change skip stage with new version settings" },
  { id: "change_trigger", label: "Change stage trigger" },
  { id: "change_deadline", label: "Change stage deadline" },
  { id: "change_lock", label: "Change stage lock mechanism" },
  { id: "change_status", label: "Change stage status calculation" },
  { id: "change_private_comment", label: "Change stage private comment ability" },
  { id: "change_invite_message", label: "Change stage invitation message" },
  { id: "add_checklist", label: "Add Checklist to Stage" },
];

const REVIEWER_PERMISSION_OPTIONS = [
  { id: "add_reviewers", label: "Add reviewers" },
  { id: "remove_reviewers", label: "Remove reviewers" },
  { id: "change_roles", label: "Change reviewer roles" },
  { id: "change_notification", label: "Change reviewer notification preference" },
];

const START_OPTIONS_FIRST_STAGE = [
  { value: "immediately", label: "Start Immediately" },
  { value: "manually", label: "Manually" },
];

const START_OPTIONS_LATER_STAGE = [
  { value: "when", label: "When" },
  { value: "immediately", label: "Immediately" },
  { value: "manually", label: "Manually" },
];

const START_DESCRIPTIONS: Record<string, string> = {
  when: "When stage is approved or approved with changes",
  immediately: "Stage starts immediately after the previous stage is complete",
  manually: "Stage starts only when triggered manually",
};

const LOCK_OPTIONS = [
  { value: "never", label: "Never" },
  { value: "manually", label: "Manually" },
  { value: "all_decisions", label: "All decisions made" },
];

const SKIP_OPTIONS = [
  { value: "never", label: "Never" },
  { value: "this_stage", label: "This stage" },
];

const FINAL_STATUS_OPTIONS = [
  { value: "", label: "Select status" },
  { value: "all_decision", label: "All decision" },
  { value: "single_decision", label: "Only one decision" },
  { value: "decision_by", label: "Decision made by" },
];

const ROLE_OPTIONS = [
  { value: "Approver", label: "Approver" },
  { value: "Creator", label: "Creator" },
  { value: "Reviewer", label: "Reviewer" },
  { value: "Viewer", label: "Viewer" },
];

const CHECKLIST_ITEMS = [
  { id: "compliance", label: "Compliance" },
  { id: "design_layout", label: "Design & Layout" },
  { id: "print_asset", label: "Print asset" },
];

const COLOR_POOL = [
  "bg-cyan-600 text-white",
  "bg-indigo-600 text-white",
  "bg-emerald-600 text-white",
  "bg-rose-500 text-white",
  "bg-amber-500 text-white",
  "bg-slate-700 text-white",
  "bg-blue-600 text-white",
  "bg-violet-600 text-white",
];

const DEFAULT_REVIEWERS: JobMember[] = [
  {
    id: "rev-1",
    name: "Krutika Gawankar",
    initials: "KG",
    className: "",
    email: "krutika@perivan.com",
    role: "Approver",
  },
  {
    id: "rev-2",
    name: "Thomas Anree",
    initials: "TA",
    className: "",
    email: "thomas@perivan.com",
    role: "Reviewer",
  },
  {
    id: "rev-3",
    name: "Ananya Shah",
    initials: "AS",
    className: "",
    email: "ananya@perivan.com",
    role: "Approver",
  },
  {
    id: "rev-4",
    name: "Manasi Patil",
    initials: "MP",
    className: "",
    email: "manasi@perivan.com",
    role: "Creator",
  },
  {
    id: "rev-5",
    name: "Jaya Kulkarni",
    initials: "JK",
    className: "",
    email: "jaya@perivan.com",
    role: "Reviewer",
  },
];

const getInitials = (name: string) => {
  const trimmed = name.trim();
  if (!trimmed) return "U";
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const createDefaultPermissions = (): JobWorkflowPermissions => {
  const stages: Record<string, boolean> = {};
  const reviewers: Record<string, boolean> = {};
  STAGE_PERMISSION_OPTIONS.forEach((item) => {
    stages[item.id] = true;
  });
  REVIEWER_PERMISSION_OPTIONS.forEach((item) => {
    reviewers[item.id] = true;
  });
  return { stages, reviewers };
};

const buildStage = (index: number): JobWorkflowStageConfig => ({
  id: `stage-${Date.now()}-${index}`,
  stepLabel: `S${index + 1}`,
  name: "",
  startRule: index === 0 ? "immediately" : "when",
  startOnDeadline: false,
  lockRule: "never",
  skipRule: "never",
  deadline: "",
  checklistIds: [],
  finalStatus: "",
  decisionMakerIds: [],
});

const normalizeStages = (inputStages: JobWorkflowStageConfig[]) =>
  inputStages.map((stage, index) => {
    const isFirstStage = index === 0;
    const startRule = isFirstStage
      ? stage.startRule === "manually"
        ? "manually"
        : "immediately"
      : stage.startRule || "when";
    return {
      ...stage,
      stepLabel: `S${index + 1}`,
      startRule,
      startOnDeadline: isFirstStage ? false : stage.startOnDeadline ?? false,
      checklistIds: stage.checklistIds ?? [],
      decisionMakerIds: stage.decisionMakerIds ?? [],
      deadline: stage.deadline ?? "",
      finalStatus: stage.finalStatus ?? "",
    };
  });

const formatDeadlineLabel = (deadline: string) => {
  if (!deadline || deadline === "no_deadline") return "No Deadline";
  const parsed = new Date(deadline);
  if (Number.isNaN(parsed.getTime())) return deadline;
  const datePart = parsed.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const timePart = parsed
    .toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
    .toLowerCase();
  return `${datePart}, ${timePart}`;
};

function ChecklistDropdown({
  value,
  items,
  onChange,
  placeholder = "Select checklist",
}: {
  value: string[];
  items: Array<{ id: string; label: string }>;
  onChange: (value: string[]) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (event: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const filteredItems = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return items;
    return items.filter((item) => item.label.toLowerCase().includes(term));
  }, [items, query]);

  const selectedLabels = items
    .filter((item) => value.includes(item.id))
    .map((item) => item.label);
  const displayLabel = selectedLabels.length ? selectedLabels.join(", ") : placeholder;

  const toggleItem = (id: string) => {
    if (value.includes(id)) {
      onChange(value.filter((itemId) => itemId !== id));
    } else {
      onChange([...value, id]);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-8 w-full items-center justify-between rounded-md border border-gray-200 bg-white px-3 text-[15px] text-[#666666] font-medium"
      >
        <span
          className={`truncate ${selectedLabels.length ? "text-gray-700" : "text-gray-400"
            }`}
        >
          {displayLabel}
        </span>
        <DropDownArrowIcon
          className={`h-3 w-3 text-[#818181] transition ${open ? "rotate-180" : ""
            }`}
        />
      </button>
      {open ? (
        <div className="absolute left-0 z-20 mt-2 w-full rounded-md border border-gray-200 bg-white shadow-lg overflow-hidden">
          <SearchInput
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search checklist"
            containerClassName="gap-1! px-3 py-2 border-b border-gray-200"
            className="text-sm text-[var(--color-disabled-text)] placeholder:text-gray-400"
            inputClassName="text-sm text-gray-600"
            iconClassName="text-[#64748B]"
            iconSize="!h-3.5"
          />
          <div className="max-h-44 space-y-1 overflow-auto p-2">
            {filteredItems.length ? (
              filteredItems.map((item) => (
                <label
                  key={item.id}
                  className="flex items-center justify-between rounded-md px-2 py-2 text-sm text-[#212121] hover:bg-gray-50"
                >
                  <span>{item.label}</span>
                  <input
                    type="checkbox"
                    checked={value.includes(item.id)}
                    onChange={() => toggleItem(item.id)}
                    className="h-4 w-4 accent-secondary rounded-none border-gray-300 text-[var(--color-secondary-500)] focus:ring-[var(--color-secondary-500)] columns-checkbox"
                  />
                </label>
              ))
            ) : (
              <div className="px-2 py-2 text-[11px] text-gray-400">
                No checklist items found.
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function WorkflowBuilder({
  value,
  reviewerOptions = [],
  onSave,
  onCancel,
  className = "",
  mode = "create",
}: WorkflowBuilderProps) {
  const isEditMode = mode === "edit";
  const [workflowName, setWorkflowName] = useState(value?.name ?? "");
  const [stages, setStages] = useState<JobWorkflowStageConfig[]>(() => {
    const seed = value?.stages?.length ? value.stages : [buildStage(0)];
    return normalizeStages(seed);
  });
  const [activeStageId, setActiveStageId] = useState(() => stages[0].id);
  const [permissions, setPermissions] = useState<JobWorkflowPermissions>(
    value?.permissions ?? createDefaultPermissions()
  );
  const [reviewerQuery, setReviewerQuery] = useState("");
  const [hasReordered, setHasReordered] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const baseReviewers = useMemo(() => {
    const map = new Map<string, JobMember>();
    reviewerOptions.forEach((reviewer) => map.set(reviewer.id, reviewer));
    value?.reviewers?.forEach((reviewer) => map.set(reviewer.id, reviewer));
    if (map.size === 0) {
      DEFAULT_REVIEWERS.forEach((reviewer) => map.set(reviewer.id, reviewer));
    }
    return Array.from(map.values());
  }, [reviewerOptions, value?.reviewers]);

  const [availableReviewers, setAvailableReviewers] = useState<JobMember[]>(() => {
    return baseReviewers.map((reviewer, index) => {
      const email =
        reviewer.email ?? (reviewer.id.includes("@") ? reviewer.id : undefined);
      return {
        ...reviewer,
        email,
        role: reviewer.role ?? "Approver",
        share: reviewer.share ?? true,
        initials: reviewer.initials || getInitials(reviewer.name),
        className: reviewer.className || COLOR_POOL[index % COLOR_POOL.length],
      };
    });
  });

  const [selectedReviewerIds, setSelectedReviewerIds] = useState<Set<string>>(
    new Set(
      value?.reviewers?.map((reviewer) => reviewer.id) ?? []
    )
  );
  const [permissionsTab, setPermissionsTab] = useState<"stages" | "reviewers">(
    "stages"
  );
  const [permissionsOpen, setPermissionsOpen] = useState(true);
  const [checklistOpen, setChecklistOpen] = useState(true);
  const [decisionPopupOpen, setDecisionPopupOpen] = useState(false);
  const [stageActionsOpen, setStageActionsOpen] = useState(false);
  const [showFlow, setShowFlow] = useState(false);
  const lastSavedRef = useRef<string>("");
  const decisionPopupRef = useRef<HTMLDivElement | null>(null);
  const checklistTemplates = useChecklistTemplatesStore((state) => state.checklistTemplates);

  const checklistItems = useMemo(() => {
    const dynamicItems = checklistTemplates.map((template) => ({
      id: template.id,
      label: template.name,
    }));
    return dynamicItems.length > 0 ? dynamicItems : CHECKLIST_ITEMS;
  }, [checklistTemplates]);

  const activeStage = stages.find((stage) => stage.id === activeStageId) ?? stages[0];
  const activeStageIndex = stages.findIndex((stage) => stage.id === activeStageId);
  const isFirstStage = activeStageIndex === 0;
  const activeChecklistItems = useMemo(() => {
    const ids = new Set(activeStage?.checklistIds ?? []);
    return checklistItems.filter((item) => ids.has(item.id));
  }, [activeStage?.checklistIds, checklistItems]);

  const stageSteps = useMemo<{ label: string; title: string; isActive: boolean }[]>(
    () =>
      stages.map((stage) => ({
        label: stage.stepLabel,
        title: stage.name.trim() || "Stage Name",
        isActive: stage.id === activeStageId,
      })),
    [stages, activeStageId]
  );

  const selectedReviewers = useMemo(
    () => availableReviewers.filter((reviewer) => selectedReviewerIds.has(reviewer.id)),
    [availableReviewers, selectedReviewerIds]
  );
  const decisionMakerReviewers = useMemo(() => {
    const ids = new Set(activeStage?.decisionMakerIds ?? []);
    return selectedReviewers.filter((reviewer) => ids.has(reviewer.id));
  }, [activeStage?.decisionMakerIds, selectedReviewers]);

  const flowStages = useMemo<WorkflowStage[]>(() => {
    const members = selectedReviewers.map((reviewer) => ({
      id: reviewer.id,
      initials: reviewer.initials,
      className: reviewer.className,
    }));
    return stages.map((stage, index) => ({
      id: stage.id,
      stepLabel: stage.stepLabel,
      name: stage.name.trim() || `Stage ${index + 1}`,
      status: index === 0 ? "In Progress" : "Not Started",
      dueDate: formatDeadlineLabel(stage.deadline ?? ""),
      members,
    }));
  }, [selectedReviewers, stages]);

  const filteredReviewers = useMemo(() => {
    const term = reviewerQuery.trim().toLowerCase();
    if (!term) return availableReviewers;
    return availableReviewers.filter(
      (reviewer) =>
        reviewer.name.toLowerCase().includes(term) ||
        reviewer.id.toLowerCase().includes(term) ||
        reviewer.email?.toLowerCase().includes(term)
    );
  }, [availableReviewers, reviewerQuery]);

  const showReviewerResults =
    reviewerQuery.trim().length > 0 && filteredReviewers.length > 0;

  const allReviewersSelected =
    availableReviewers.length > 0 &&
    selectedReviewerIds.size === availableReviewers.length;

  const markDirty = useCallback(() => {
    if (!isEditMode) return;
    setIsDirty(true);
  }, [isEditMode]);

  const updateStage = (updates: Partial<JobWorkflowStageConfig>) => {
    setStages((prev) =>
      prev.map((stage) =>
        stage.id === activeStageId ? { ...stage, ...updates } : stage
      )
    );
    markDirty();
  };

  const handleRemoveChecklistItem = (checklistId: string) => {
    if (!activeStage) return;
    const nextIds = (activeStage.checklistIds ?? []).filter(
      (id) => id !== checklistId
    );
    updateStage({ checklistIds: nextIds });
  };

  const updateReviewer = (id: string, updates: Partial<JobMember>) => {
    setAvailableReviewers((prev) =>
      prev.map((reviewer) =>
        reviewer.id === id ? { ...reviewer, ...updates } : reviewer
      )
    );
    markDirty();
  };

  const handleAddStage = () => {
    setStages((prev) => {
      const next = [...prev, buildStage(prev.length)];
      setActiveStageId(next[next.length - 1].id);
      return next;
    });
    markDirty();
  };

  const handleDuplicateActiveStage = () => {
    if (!activeStage) return;
    setStages((prev) => {
      const sourceIndex = prev.findIndex((stage) => stage.id === activeStage.id);
      if (sourceIndex < 0) return prev;
      const duplicated: JobWorkflowStageConfig = {
        ...activeStage,
        id: `stage-${Date.now()}-${prev.length + 1}`,
      };
      const next = [...prev];
      next.splice(sourceIndex + 1, 0, duplicated);
      const normalized = normalizeStages(next);
      const inserted = normalized[sourceIndex + 1];
      if (inserted) {
        setActiveStageId(inserted.id);
      }
      return normalized;
    });
    setStageActionsOpen(false);
    markDirty();
  };

  const handleDeleteActiveStage = () => {
    if (!activeStage) return;
    setStages((prev) => {
      if (prev.length <= 1) {
        const fallback = buildStage(0);
        setActiveStageId(fallback.id);
        return [fallback];
      }
      const removeIndex = prev.findIndex((stage) => stage.id === activeStage.id);
      if (removeIndex < 0) return prev;
      const next = prev.filter((stage) => stage.id !== activeStage.id);
      const normalized = normalizeStages(next);
      const fallbackIndex = Math.max(0, removeIndex - 1);
      const fallbackStage = normalized[fallbackIndex] ?? normalized[0];
      if (fallbackStage) {
        setActiveStageId(fallbackStage.id);
      }
      return normalized;
    });
    setStageActionsOpen(false);
    markDirty();
  };

  const handleReorderStage = (fromIndex: number, toIndex: number) => {
    setStages((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return normalizeStages(next);
    });
    setHasReordered(true);
    markDirty();
  };

  const handleTogglePermission = (group: "stages" | "reviewers", id: string) => {
    setPermissions((prev) => ({
      ...prev,
      [group]: {
        ...prev[group],
        [id]: !prev[group][id],
      },
    }));
    markDirty();
  };

  const toggleReviewer = (id: string) => {
    let removedReviewerId: string | null = null;
    setSelectedReviewerIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        removedReviewerId = id;
      } else {
        next.add(id);
      }
      return next;
    });
    if (removedReviewerId) {
      setStages((prev) =>
        prev.map((stage) => ({
          ...stage,
          decisionMakerIds: stage.decisionMakerIds.filter((reviewerId) => reviewerId !== removedReviewerId),
        }))
      );
    }
    markDirty();
  };

  const toggleAllReviewers = (checked: boolean) => {
    if (!checked) {
      setStages((prev) =>
        prev.map((stage) => ({
          ...stage,
          decisionMakerIds: [],
        }))
      );
    }
    setSelectedReviewerIds(checked ? new Set(availableReviewers.map((reviewer) => reviewer.id)) : new Set());
    markDirty();
  };

  const handleAddReviewerByEmail = () => {
    const email = reviewerQuery.trim();
    if (!email || !email.includes("@")) return;
    const existing = availableReviewers.find(
      (reviewer) => reviewer.id.toLowerCase() === email.toLowerCase()
    );
    if (existing) {
      setSelectedReviewerIds((prev) => new Set(prev).add(existing.id));
      setReviewerQuery("");
      return;
    }
    const name = email.split("@")[0].replace(/[._-]/g, " ");
    const initials = getInitials(name || email);
    const nextReviewer: JobMember = {
      id: email,
      name: name || email,
      email,
      initials,
      role: "Approver",
      share: true,
      className: COLOR_POOL[availableReviewers.length % COLOR_POOL.length],
    };
    setAvailableReviewers((prev) => [...prev, nextReviewer]);
    setSelectedReviewerIds((prev) => new Set(prev).add(nextReviewer.id));
    setReviewerQuery("");
    markDirty();
  };

  const toggleDecisionMaker = (reviewerId: string) => {
    if (!activeStage) return;
    const next = new Set(activeStage.decisionMakerIds);
    if (next.has(reviewerId)) {
      next.delete(reviewerId);
    } else {
      next.add(reviewerId);
    }
    updateStage({ decisionMakerIds: Array.from(next) });
  };

  const buildConfig = useCallback((): WorkflowBuilderValue => {
    const resolvedName = workflowName.trim() || "Custom workflow";
    const workflowId = value?.id ?? `workflow-${Date.now()}`;
    const resolvedStages = normalizeStages(stages).map((stage, index) => ({
      ...stage,
      name: stage.name.trim() || `Stage ${index + 1}`,
      startRule: stage.startRule || (index === 0 ? "immediately" : "when"),
      startOnDeadline: index === 0 ? false : stage.startOnDeadline ?? false,
      checklistIds: stage.checklistIds ?? [],
    }));
    const config: WorkflowBuilderValue = {
      id: workflowId,
      name: resolvedName,
      stages: resolvedStages,
      reviewers: selectedReviewers,
      permissions,
    };
    return config;
  }, [permissions, selectedReviewers, stages, value?.id, workflowName]);

  const handleSave = () => {
    onSave(buildConfig());
  };

  useEffect(() => {
    if (!isEditMode) return;
    if (!value) return;
    const snapshot = JSON.stringify({
      name: value.name,
      stages: value.stages,
      reviewers: value.reviewers,
      permissions: value.permissions,
    });
    lastSavedRef.current = snapshot;
  }, [isEditMode, value]);

  useEffect(() => {
    if (!isEditMode || !isDirty) return;
    const config = buildConfig();
    const snapshot = JSON.stringify(config);
    if (snapshot === lastSavedRef.current) {
      setIsDirty(false);
      return;
    }
    lastSavedRef.current = snapshot;
    setIsDirty(false);
    onSave(config);
  }, [buildConfig, isDirty, isEditMode, onSave]);

  useEffect(() => {
    if (!decisionPopupOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (!decisionPopupRef.current) return;
      if (decisionPopupRef.current.contains(event.target as Node)) return;
      setDecisionPopupOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [decisionPopupOpen]);

  const activeStartRule = isFirstStage
    ? activeStage?.startRule === "manually"
      ? "manually"
      : "immediately"
    : activeStage?.startRule ?? "when";
  const startDescription = !isFirstStage
    ? START_DESCRIPTIONS[activeStartRule] ?? START_DESCRIPTIONS.when
    : "";

  return (
    <div className={className}>
      <div className={`flex flex-col gap-4 ${isEditMode ? "py-1" : ""}`}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex flex-col items-start gap-2">
              {!isEditMode ? (
                <div className="relative w-full max-w-[320px]">
                  <input
                    value={workflowName}
                    onChange={(event) => {
                      setWorkflowName(event.target.value);
                      markDirty();
                    }}
                    placeholder="Enter workflow name"
                    className="w-full border-b border-gray-200 px-1 pb-2 pr-8 text-sm text-gray-700 focus:border-[#007B8C] focus:outline-none"
                  />
                  <button
                    type="button"
                    className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label="Edit workflow name"
                  >
                    <EditPenIcon className="h-4 w-4" />
                  </button>
                </div>
              ) : null}
              <button
                type="button"
                onClick={() => setShowFlow((prev) => !prev)}
                className={`inline-flex items-center gap-2 rounded-md border px-3 py-1 text-sm font-semibold ${showFlow
                  ? "border-[#007B8C] bg-[#E3F3F6] text-[#007B8C]"
                  : "border-transparent bg-[#9F9F9F26] text-gray-500"
                  }`}
              >
                <ShowflowIcon className="h-3.5 w-3.5" />
                Show flow
              </button>
            </div>
            {!isEditMode ? (
              <div className="flex flex-col items-end gap-1">
                <div className="flex items-center gap-2">
                  <Button
                    size="tiny"
                    variant="orangebutton"
                    className="!h-[28px] !w-[78px] !rounded-[4px] !px-0 !py-0 !text-[11px] !font-medium"
                    onClick={onCancel}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="tiny"
                    variant="primary"
                    className="!h-[28px] !w-[92px] !rounded-[4px] !px-0 !py-0 !text-[11px] !font-medium !bg-[var(--color-secondary-500)] !text-white hover:!bg-[var(--color-secondary-600)]"
                    onClick={handleSave}
                  >
                    Save Changes
                  </Button>
                </div>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setStageActionsOpen((prev) => !prev)}
                    className="flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100"
                    aria-label="Open stage actions"
                  >
                    <VerticalDots className="h-4 w-4" />
                  </button>
                  <Dropdown
                    isOpen={stageActionsOpen}
                    onClose={() => setStageActionsOpen(false)}
                    className="left-auto right-0 mt-1 min-w-[160px] rounded-md border border-gray-200 bg-white py-1 shadow-lg"
                  >
                    <DropdownItem
                      onClick={handleDeleteActiveStage}
                      baseClassName="block w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-gray-50"
                    >
                      Delete stage
                    </DropdownItem>
                    <DropdownItem
                      onClick={handleDuplicateActiveStage}
                      baseClassName="block w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-gray-50"
                    >
                      Duplicate stage
                    </DropdownItem>
                  </Dropdown>
                </div>
              </div>
            ) : null}
          </div>

          {showFlow ? (
            <div className="rounded-xl border border-gray-200 bg-white p-3">
              <div className="no-scrollbar flex items-stretch gap-0 overflow-x-auto overflow-y-visible pr-8">
                {flowStages.map((stage, index) => (
                  <WorkflowStageCard
                    key={stage.id}
                    stage={stage}
                    variant="fluid"
                    showRightChevron={index < flowStages.length - 1}
                  />
                ))}
                <div className="w-8 shrink-0" />
              </div>
            </div>
          ) : null}

          <div className="grid items-start gap-4 lg:grid-cols-[240px_1fr]">
            <div className="flex h-[360px] flex-col rounded-xl border border-gray-200 bg-gray-50/60 p-3 self-start">
              <div className="flex-1 overflow-y-auto pr-1">
                <StageStepList
                  steps={stageSteps}
                  className="w-full"
                  variant={isEditMode ? "filled" : "bordered"}
                  showConnector={isEditMode}
                  draggable={!isEditMode}
                  onReorder={isEditMode ? undefined : handleReorderStage}
                  onStepClick={(index) => {
                    const nextStage = stages[index];
                    if (nextStage) {
                      setActiveStageId(nextStage.id);
                    }
                  }}
                />
              </div>
              {!isEditMode && (<button
                type="button"
                onClick={handleAddStage}
                className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-[#F25C54]"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#F25C54] text-white shadow-sm">
                  <PlusIcon className="h-3 w-3" />
                </span>
                Add Stage
              </button>)}
            </div>

            <div className="space-y-3">
              <div className="rounded-xl bg-white">
                <div className="border rounded-xl border-gray-200">

                  <div className="flex flex-wrap items-center p-4 gap-3">
                    <span className="bg-[#F25C54]/10 px-2 py-1 text-sm font-semibold text-[#F15F44] rounded-xs">
                      {activeStage?.stepLabel ?? "S1"}
                    </span>
                    <input
                      value={activeStage?.name ?? ""}
                      onChange={(event) => updateStage({ name: event.target.value })}
                      placeholder="Enter stage name"
                      className="w-full max-w-[300px] border border-gray-200 rounded-sm px-3 py-3 text-base text-gray-700 font-semibold focus:border-[#007B8C] focus:outline-none"
                    />
                    {hasReordered ? (
                      <div className="ml-auto flex items-center gap-2 text-[11px] text-[#F25C54]">
                        <AlertIcon className="h-4 w-4" />
                        <span>You reordered stages, some settings may need updating.</span>
                      </div>
                    ) : null}
                  </div>

                  <div className="border-t border-gray-200" />

                  <div className="grid gap-y-8 p-4 grid-cols-1 xl:gap-x-6 xl:pr-42 xl:grid-cols-[minmax(0,400px)_minmax(0,400px)] justify-between">
                    {/* Start */}
                    <div className="flex items-start gap-10">
                      <div className="flex w-32 shrink-0 items-center gap-3 pt-1">
                        <StartIcon className="h-4 w-4 shrink-0 text-[#818181]" />
                        <p className="text-sm font-gilroy-regular text-[#000000]">Start</p>
                      </div>
                      <div className="w-48 min-w-0 space-y-1">
                        <BuilderSelect
                          value={activeStartRule}
                          onChange={(value) => updateStage({ startRule: value })}
                          options={
                            isFirstStage ? START_OPTIONS_FIRST_STAGE : START_OPTIONS_LATER_STAGE
                          }
                          className="w-full rounded-xs"
                          selectClassName="h-8 text-[15px] text-[#666666] font-medium"
                        />
                        {!isFirstStage ? (
                          <>
                            <p className="text-[11px] text-gray-500">{startDescription}</p>
                            <label className="flex items-center gap-2 text-[11px] text-gray-500">
                              <input
                                type="checkbox"
                                checked={activeStage?.startOnDeadline ?? false}
                                onChange={(event) =>
                                  updateStage({ startOnDeadline: event.target.checked })
                                }
                                className="h-3.5 w-3.5"
                              />
                              Or when deadline is reached.
                            </label>
                          </>
                        ) : null}
                      </div>
                    </div>

                    {/* Lock */}
                    <div className="flex items-center gap-10">
                      <div className="flex w-32 shrink-0 items-center gap-3">
                        <Symbols_lock_Icon className="h-4 w-4 shrink-0 text-[#818181]" />
                        <p className="text-sm font-gilroy-regular text-[#000000]">Lock</p>
                      </div>
                      <div className="w-48 min-w-0">
                        <BuilderSelect
                          value={activeStage?.lockRule ?? "never"}
                          onChange={(value) => updateStage({ lockRule: value })}
                          options={LOCK_OPTIONS}
                          className="w-full"
                          selectClassName="h-8 text-[15px] text-[#666666] font-medium"
                        />
                      </div>
                    </div>

                    {/* Deadline */}
                    <div className="flex items-center gap-10">
                      <div className="flex w-32 shrink-0 items-center gap-3">
                        <DeadlineIcon className="h-4 w-4 shrink-0 text-[#818181]" />
                        <p className="text-sm font-gilroy-regular text-[#000000]">Deadline</p>
                      </div>
                      <DeadlinePicker
                        value={activeStage?.deadline ?? ""}
                        onChange={(value) => updateStage({ deadline: value })}
                      />
                    </div>

                    {/* Skip */}
                    <div className="flex items-center gap-10">
                      <div className="flex w-32 shrink-0 items-center gap-3">
                        <SkipIcon className="h-3 w-4 shrink-0 text-[#818181]" />
                        <p className="text-sm font-gilroy-regular text-[#000000]">Skip</p>
                      </div>
                      <div className="w-48 min-w-0">
                        <BuilderSelect
                          value={activeStage?.skipRule ?? "never"}
                          onChange={(value) => updateStage({ skipRule: value })}
                          options={SKIP_OPTIONS}
                          className="w-full"
                          selectClassName="h-8 text-[15px] text-[#666666] font-medium"
                        />
                      </div>
                    </div>

                    {/* Final Status Calculation */}
                    <div className="flex items-start gap-10">
                      <div className="flex w-32 shrink-0 items-center gap-3 pt-1">
                        <CalculationIcon className="h-4 w-4 shrink-0 text-[#818181]" />
                        <p className="text-sm font-gilroy-regular text-[#000000]">Final Status Calculation</p>
                      </div>
                      <div className="w-48 min-w-0 space-y-2">
                        <BuilderSelect
                          value={activeStage?.finalStatus ?? ""}
                          onChange={(value) =>
                            updateStage({
                              finalStatus: value,
                              decisionMakerIds: value === "decision_by" ? activeStage?.decisionMakerIds ?? [] : [],
                            })
                          }
                          options={FINAL_STATUS_OPTIONS}
                          placeholder="Select status"
                          className="w-full"
                          selectClassName="h-8 text-[15px] text-[#666666] font-medium"
                        />
                        {activeStage?.finalStatus === "decision_by" ? (
                          <div className="relative space-y-1" ref={decisionPopupRef}>
                            {decisionMakerReviewers.length === 0 ? (
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => setDecisionPopupOpen(true)}
                                className="!rounded-md !px-3 !py-1 text-[11px]"
                              >
                                Add user
                              </Button>
                            ) : null}
                            {decisionMakerReviewers.length > 0 ? (
                              <div className="mt-1 max-w-[260px] space-y-1">
                                {decisionMakerReviewers.map((reviewer) => (
                                  <div key={reviewer.id} className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                      <p className="truncate text-[12px] font-medium text-gray-700">
                                        {reviewer.name}
                                      </p>
                                      <p className="truncate text-[10px] text-gray-400">
                                        {reviewer.email ?? reviewer.id}
                                      </p>
                                    </div>
                                    <span className="shrink-0 text-[11px] text-gray-400">
                                      {reviewer.role ?? "Guest"}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            ) : null}
                            {decisionPopupOpen ? (
                              <div className="absolute left-0 top-full z-30 mt-2 w-[360px] rounded-2xl border border-gray-200 bg-white p-3 shadow-lg">
                                <button
                                  type="button"
                                  onClick={() => setDecisionPopupOpen(false)}
                                  className="absolute right-3 top-2 text-lg leading-none text-gray-400 hover:text-gray-600"
                                  aria-label="Close add user popup"
                                >
                                  ×
                                </button>
                                {selectedReviewers.length === 0 ? (
                                  <div className="rounded-lg border border-dashed border-gray-200 px-3 py-4 text-center text-xs text-gray-400">
                                    No user selected.
                                  </div>
                                ) : (
                                  <div className="space-y-1">
                                    {selectedReviewers.map((reviewer) => {
                                      const isChecked = activeStage?.decisionMakerIds.includes(reviewer.id);
                                      return (
                                        <label
                                          key={reviewer.id}
                                          className="flex items-center gap-3 rounded-md px-2 py-2 text-xs text-gray-600 hover:bg-gray-50"
                                        >
                                          <input
                                            type="checkbox"
                                            checked={Boolean(isChecked)}
                                            onChange={() => toggleDecisionMaker(reviewer.id)}
                                            className="h-3.5 w-3.5 accent-[#F25C54]"
                                          />
                                          <UserCell
                                            title={reviewer.name}
                                            subtitle={reviewer.email ?? reviewer.id}
                                            avatarUrl={reviewer.avatarUrl}
                                            avatarAlt={reviewer.name}
                                            avatarSize="xsmall"
                                            avatarFallback="initials"
                                            align="start"
                                            titleWrap
                                            className="min-w-0 flex-1 gap-2"
                                            titleClassName="text-[12px] font-medium text-gray-700"
                                            subtitleClassName="text-[10px] text-gray-400"
                                          />
                                          <span className="text-[11px] text-gray-400">
                                            {reviewer.role ?? "Guest"}
                                          </span>
                                        </label>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                    </div>

                    {/* Checklist */}
                    <div className="flex items-center gap-10">
                      <div className="flex w-32 shrink-0 items-center gap-3">
                        <CheckListIcon className="h-4 w-4 shrink-0 text-[#818181]" />
                        <p className="text-sm font-gilroy-regular text-[#000000]">Checklist</p>
                      </div>
                      <div className="w-48 min-w-0">
                        <ChecklistDropdown
                          value={activeStage?.checklistIds ?? []}
                          onChange={(value) => updateStage({ checklistIds: value })}
                          items={checklistItems}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 border-t border-gray-200 p-4">
                    <div className="flex items-center gap-3">
                      <span className="relative flex h-8 w-8 items-center justify-center text-gray-400">
                        <AddpeopleIcon className="h-5 w-5" />
                      </span>
                      <div className="w-full sm:w-[40%]">
                        <SearchInput
                          value={reviewerQuery}
                          iconPosition="right"
                          onChange={(event) => setReviewerQuery(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") {
                              event.preventDefault();
                              handleAddReviewerByEmail();
                            }
                          }}
                          placeholder="Search or 'add' reviewer by email address"
                          containerClassName="gap-2 rounded-full border border-gray-200 px-4 py-3"
                          inputClassName="text-xs text-gray-600"
                          className="text-sm! text-[#B1B1B1]"
                          iconClassName="text-[#64748B]"
                          iconSize="!h-4"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {reviewerQuery.trim() && reviewerQuery.includes("@") ? (
                  <button
                    type="button"
                    onClick={handleAddReviewerByEmail}
                    className="mt-2 text-xs font-semibold text-[#007B8C]"
                  >
                    Add "{reviewerQuery.trim()}"
                  </button>
                ) : null}

                {showReviewerResults ? (
                  <div className="mt-3 rounded-lg border border-gray-200">
                    <div className="grid grid-cols-[5fr_1fr_1fr] items-center border-b border-gray-100 p-3">
                      <label className="flex items-center gap-2 font-medium text-[15px] text-[#000000]">
                        <input
                          type="checkbox"
                          checked={allReviewersSelected}
                          onChange={(event) => toggleAllReviewers(event.target.checked)}
                          className="h-3.5 w-3.5 accent-secondary rounded-none cursor-pointer border-gray-300 text-[var(--color-secondary-500)] focus:ring-[var(--color-secondary-500)] columns-checkbox"
                        />
                        Select all
                      </label>
                      <span className="text-center font-medium text-[15px] text-[#000000]">Role</span>
                      <span className="text-center font-medium text-[15px] text-[#000000]">Share</span>
                    </div>

                    <div className="divide-y divide-gray-100">
                      {filteredReviewers.map((reviewer) => {
                        const isSelected = selectedReviewerIds.has(reviewer.id);
                        return (
                          <div
                            key={reviewer.id}
                            className="grid grid-cols-[5fr_1fr_1fr] items-center px-3 py-2 text-xs text-gray-600"
                          >
                            <div className="flex min-w-0 items-center gap-4">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleReviewer(reviewer.id)}
                                className="h-3.5 w-3.5 accent-secondary rounded-none cursor-pointer border-gray-300 text-[var(--color-secondary-500)] focus:ring-[var(--color-secondary-500)] columns-checkbox"
                              />
                              <UserCell
                                title={reviewer.name}
                                subtitle={reviewer.email ?? reviewer.id}
                                avatarUrl={reviewer.avatarUrl}
                                avatarAlt={reviewer.name}
                                avatarSize="small"
                                avatarFallback="initials"
                                className="min-w-0 flex-1 gap-4"
                                titleWrap={true}
                                titleClassName="font-medium text-gray-700"
                                subtitleClassName="text-gray-400"
                              />
                            </div>
                            <div className="px-2">
                              <BuilderSelect
                                value={reviewer.role ?? "Approver"}
                                onChange={(value) =>
                                  updateReviewer(reviewer.id, {
                                    role: value as JobMember["role"],
                                  })
                                }
                                options={ROLE_OPTIONS}
                                className="w-full"
                                selectClassName="h-8 text-[11px]"
                              />
                            </div>
                            <div className="flex justify-center">
                              <input
                                type="checkbox"
                                checked={Boolean(reviewer.share)}
                                onChange={(event) =>
                                  updateReviewer(reviewer.id, {
                                    share: event.target.checked,
                                  })
                                }
                                className="h-3.5 w-3.5 accent-secondary rounded-none cursor-pointer border-gray-300 text-[var(--color-secondary-500)] focus:ring-[var(--color-secondary-500)] columns-checkbox"
                              />
                            </div>
                          </div>

                        );
                      })}
                    </div>
                  </div>
                ) : null}

                {isEditMode ? (
                  <div className="my-4 rounded-xl border border-gray-200">
                    <button
                      type="button"
                      onClick={() => setChecklistOpen((prev) => !prev)}
                      className="flex w-full items-center justify-between px-4 py-3 text-left"
                    >
                      <div className="flex items-center gap-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500">
                          <CheckListIcon className="h-4 w-4" />
                        </span>
                        <span className="text-base font-medium text-[#000000]">
                          Checklist
                        </span>
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#F25C54]/10 text-[11px] font-semibold text-[#F25C54]">
                          {activeChecklistItems.length}
                        </span>
                      </div>
                      <ChevronDownIcon
                        className={`h-4 w-4 transition-transform ${checklistOpen ? "rotate-180" : ""
                          }`}
                      />
                    </button>
                    {checklistOpen ? (
                      <div className="border-t border-gray-200 px-4 pb-4 pt-3">
                        {activeChecklistItems.length ? (
                          <div className="space-y-2">
                            {activeChecklistItems.map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center justify-between text-xs text-gray-600"
                              >
                                <span>{item.label}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveChecklistItem(item.id)}
                                  className="text-[11px] font-semibold text-[#F25C54]"
                                >
                                  Remove
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-400">
                            No checklist items added.
                          </p>
                        )}
                      </div>
                    ) : null}
                  </div>
                ) : null}

                <div className="rounded-xl my-4 border border-gray-200">
                  <button
                    type="button"
                    onClick={() => setPermissionsOpen((prev) => !prev)}
                    className="flex w-full items-center justify-between px-4 py-3 text-left"
                  >
                    <div className="flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500">
                        <SettingIcon className="h-4 w-4" />
                      </span>
                      <span className="text-base font-medium text-[#000000]">
                        Manage Permissions
                      </span>
                    </div>
                    <ChevronDownIcon
                      className={`h-4 w-4 transition-transform ${permissionsOpen ? "rotate-180" : ""
                        }`}
                    />
                  </button>
                  {permissionsOpen ? (
                    <div className="border-t border-gray-200 px-4 pb-4 pt-3">
                      <div className="flex items-center gap-6 border-b border-gray-200 text-sm font-semibold text-gray-500">
                        {[
                          { id: "stages", label: "Stages" },
                          { id: "reviewers", label: "Reviewers" },
                        ].map((tab) => (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() =>
                              setPermissionsTab(tab.id as "stages" | "reviewers")
                            }
                            className={`pb-2 ${permissionsTab === tab.id
                              ? "border-b-2 border-[#007B8C] text-[#007B8C]"
                              : ""
                              }`}
                          >
                            {tab.label}
                          </button>
                        ))}
                      </div>
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        {(permissionsTab === "stages"
                          ? STAGE_PERMISSION_OPTIONS
                          : REVIEWER_PERMISSION_OPTIONS
                        ).map((item) => (
                          <label
                            key={item.id}
                            className="flex items-center gap-2 text-sm text-gray-600"
                          >
                            <input
                              type="checkbox"
                              checked={permissions[permissionsTab][item.id] ?? false}
                              onChange={() =>
                                handleTogglePermission(permissionsTab, item.id)
                              }
                              className="h-4 w-4 accent-secondary rounded-none border-gray-300 text-[var(--color-secondary-500)] focus:ring-[var(--color-secondary-500)] columns-checkbox"
                            />
                            {item.label}
                          </label>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      
    </div>
  );
}
