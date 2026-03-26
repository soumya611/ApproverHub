import { useState, useRef, useEffect } from "react";
import { Modal } from "../ui/modal";
import { useDashboardCardsStore } from "../../stores/dashboardCardsStore";

interface AddNewTabModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PencilIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const selectTriggerClass =
  "w-full h-8 rounded-lg border border-gray-200 bg-white pl-3 pr-8 text-left text-xs text-gray-600 focus:outline-none focus:border-gray-400 focus:ring-0 cursor-pointer transition-colors";

interface CustomSelectOption {
  value: string;
  label: string;
}

function CustomSelect({
  placeholder,
  value,
  options,
  onChange,
}: {
  placeholder: string;
  value: string;
  options: CustomSelectOption[];
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const selected = options.find((o) => o.value === value);
  const display = selected ? selected.label : placeholder;

  return (
    <div ref={ref} className="relative min-w-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`${selectTriggerClass} flex items-center justify-between gap-1 ${!value ? "text-gray-400" : "text-gray-600"}`}
      >
        <span className="truncate">{display}</span>
        <span className="flex-shrink-0 text-gray-400">
          <ChevronDownIcon />
        </span>
      </button>
      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 min-w-full rounded-lg border border-gray-200 bg-white py-1 shadow-md">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AddNewTabModal({ isOpen, onClose }: AddNewTabModalProps) {
  const addCard = useDashboardCardsStore((s) => s.addCard);
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedJob, setSelectedJob] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedRoles, setSelectedRoles] = useState("");

  const resetForm = () => {
    setStep(1);
    setName("");
    setDescription("");
    setSelectedJob("");
    setDueDate("");
    setSelectedStatus("");
    setSelectedRoles("");
  };

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) resetForm();
  }, [isOpen]);

  const goToStep2 = () => setStep(2);
  const goToStep1 = () => setStep(1);

  const handleSubmit = () => {
    addCard({
      title: name.trim() || "Untitled tab",
      description: description.trim() || "No description",
      value: 34,
      filters: {
        job: selectedJob || undefined,
        dueDate: dueDate || undefined,
        status: selectedStatus || undefined,
        roles: selectedRoles || undefined,
      },
    });
    resetForm();
    onClose();
  };

  const hasFilters = selectedJob || dueDate || selectedStatus || selectedRoles;

  const dueDateLabel =
    dueDate === "no_date"
      ? "No date"
      : dueDate
        ? dueDate
            .split("_")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" ")
        : "";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      showCloseButton={false}
      overlayClassName="bg-black/40"
      className="max-w-[440px] w-full mx-4 rounded-xl shadow-lg"
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-gray-800">Add new tab</h2>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-7 h-7 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Step 1 content: initial view - show only when step 1 */}
        {step === 1 && (
          <>
            {/* Name input - click/focus or edit icon goes to step 2 */}
            <div className="relative mb-3">
              <input
                type="text"
                placeholder="Add Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onFocus={goToStep2}
                onClick={goToStep2}
                className="w-full h-10 rounded-lg border border-gray-200 bg-white pl-4 pr-10 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-gray-400 focus:ring-0 transition-colors cursor-pointer"
              />
              <button
                type="button"
                onClick={goToStep2}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded cursor-pointer"
                aria-label="Edit name"
              >
                <PencilIcon />
              </button>
            </div>

            {/* Description input */}
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Add description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onFocus={goToStep2}
                onClick={goToStep2}
                className="w-full h-10 rounded-lg border border-gray-200 bg-white pl-4 pr-10 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-gray-400 focus:ring-0 transition-colors cursor-pointer"
              />
              <button
                type="button"
                onClick={goToStep2}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded cursor-pointer"
                aria-label="Edit description"
              >
                <PencilIcon />
              </button>
            </div>

            {/* Filter dropdowns - single row of four */}
            <div className="grid grid-cols-4 gap-2 mb-5">
          <CustomSelect
            placeholder="Select job"
            value={selectedJob}
            onChange={setSelectedJob}
            options={[
              { value: "", label: "Select job" },
              { value: "job1", label: "Job 1" },
              { value: "job2", label: "Job 2" },
              { value: "job3", label: "Job 3" },
            ]}
          />
          <CustomSelect
            placeholder="Due date"
            value={dueDate}
            onChange={setDueDate}
            options={[
              { value: "late", label: "Late" },
              { value: "today", label: "Today" },
              { value: "tomorrow", label: "Tomorrow" },
              { value: "this_week", label: "This week" },
              { value: "next_week", label: "Next week" },
              { value: "no_date", label: "No date" },
            ]}
          />
          <CustomSelect
            placeholder="Select status"
            value={selectedStatus}
            onChange={setSelectedStatus}
            options={[
              { value: "", label: "Select status" },
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
              { value: "pending", label: "Pending" },
            ]}
          />
          <CustomSelect
            placeholder="Select roles"
            value={selectedRoles}
            onChange={setSelectedRoles}
            options={[
              { value: "", label: "Select roles" },
              { value: "admin", label: "Admin" },
              { value: "editor", label: "Editor" },
              { value: "viewer", label: "Viewer" },
            ]}
          />
        </div>

        {/* Filter preview area */}
        <div className="min-h-[36px] flex items-center justify-center rounded-lg">
          {hasFilters ? (
            <div className="flex flex-wrap gap-2 w-full">
              {selectedJob && (
                <span className="text-xs bg-[#007B8C]/10 text-[#007B8C] px-2 py-1 rounded-full">
                  Job: {selectedJob}
                </span>
              )}
              {dueDate && (
                <span className="text-xs bg-[#007B8C]/10 text-[#007B8C] px-2 py-1 rounded-full">
                  Due: {dueDateLabel}
                </span>
              )}
              {selectedStatus && (
                <span className="text-xs bg-[#007B8C]/10 text-[#007B8C] px-2 py-1 rounded-full">
                  Status: {selectedStatus}
                </span>
              )}
              {selectedRoles && (
                <span className="text-xs bg-[#007B8C]/10 text-[#007B8C] px-2 py-1 rounded-full">
                  Role: {selectedRoles}
                </span>
              )}
            </div>
          ) : (
            <p className="text-xs text-gray-500">No filter selected</p>
          )}
        </div>
          </>
        )}

        {/* Step 2 content: Tab name, Shortcut, filters, data count, footer */}
        {step === 2 && (
          <>
            <div className="relative mb-3">
              <input
                type="text"
                placeholder="My Jobs"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-10 rounded-lg border border-gray-200 bg-white pl-4 pr-10 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-gray-400 focus:ring-0 transition-colors"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                <PencilIcon />
              </span>
            </div>
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Shortcut for my in progress jobs"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full h-10 rounded-lg border border-gray-200 bg-white pl-4 pr-10 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-gray-400 focus:ring-0 transition-colors"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                <PencilIcon />
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2 mb-5">
              <CustomSelect
                placeholder="All jobs"
                value={selectedJob}
                onChange={setSelectedJob}
                options={[
                  { value: "", label: "All jobs" },
                  { value: "job1", label: "Job 1" },
                  { value: "job2", label: "Job 2" },
                  { value: "job3", label: "Job 3" },
                ]}
              />
              <CustomSelect
                placeholder="Due date"
                value={dueDate}
                onChange={setDueDate}
                options={[
                  { value: "late", label: "Late" },
                  { value: "today", label: "Today" },
                  { value: "tomorrow", label: "Tomorrow" },
                  { value: "this_week", label: "This week" },
                  { value: "next_week", label: "Next week" },
                  { value: "no_date", label: "No date" },
                ]}
              />
              <CustomSelect
                placeholder="In progress"
                value={selectedStatus}
                onChange={setSelectedStatus}
                options={[
                  { value: "", label: "In progress" },
                  { value: "active", label: "Active" },
                  { value: "inactive", label: "Inactive" },
                  { value: "pending", label: "Pending" },
                ]}
              />
              <CustomSelect
                placeholder="Owner"
                value={selectedRoles}
                onChange={setSelectedRoles}
                options={[
                  { value: "", label: "Owner" },
                  { value: "admin", label: "Admin" },
                  { value: "editor", label: "Editor" },
                  { value: "viewer", label: "Viewer" },
                ]}
              />
            </div>
            <div className="text-center py-6 mb-4">
              <p className="text-4xl font-semibold text-[#007B8C]">34</p>
              <p className="text-sm text-gray-400 mt-1">Data fetch from data source</p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2 -mx-6 px-6 border-t border-gray-200">
              <button
                type="button"
                onClick={goToStep1}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors"
              >
                Add new tab
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
