import { useState } from "react";
import PageHeader from "../ui/page-header/PageHeader";
import PageContentContainer from "../layout/PageContentContainer";
import ToggleSwitch from "../ui/toggle/ToggleSwitch";
import { useAppNavigate } from "../../hooks/useAppNavigate";

interface CommentLabel {
  id: string;
  name: string;
  color: string;
  active: boolean;
}

const DEFAULT_LABELS: CommentLabel[] = [
  { id: "grammar", name: "Grammar", color: "#22C55E", active: true },
  { id: "content", name: "Content", color: "#3B82F6", active: true },
  { id: "question", name: "Question", color: "#EC4899", active: true },
  { id: "technical", name: "Technical", color: "#EAB308", active: true },
  { id: "design", name: "Design", color: "#F97316", active: true },
];

const COLOR_OPTIONS = [
  "#22C55E",
  "#3B82F6",
  "#EC4899",
  "#EAB308",
  "#F97316",
  "#8B5CF6",
  "#14B8A6",
  "#EF4444",
];

export default function CommentSettingsView() {
  const { goBack } = useAppNavigate();

  const [allowLabelling, setAllowLabelling] = useState(true);
  const [allowCustomLabels, setAllowCustomLabels] = useState(true);
  const [labels, setLabels] = useState<CommentLabel[]>(DEFAULT_LABELS);

  // "Add New" state
  const [isAdding, setIsAdding] = useState(false);
  const [newLabelName, setNewLabelName] = useState("");
  const [newLabelColor, setNewLabelColor] = useState(COLOR_OPTIONS[0]);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const handleLabelToggle = (id: string, checked: boolean) => {
    setLabels((prev) =>
      prev.map((l) => (l.id === id ? { ...l, active: checked } : l))
    );
  };

  const handleAddNew = () => {
    if (!newLabelName.trim()) return;
    const newLabel: CommentLabel = {
      id: `label-${Date.now()}`,
      name: newLabelName.trim(),
      color: newLabelColor,
      active: true,
    };
    setLabels((prev) => [...prev, newLabel]);
    setNewLabelName("");
    setNewLabelColor(COLOR_OPTIONS[0]);
    setIsAdding(false);
    setShowColorPicker(false);
  };

  const handleCancelAdd = () => {
    setIsAdding(false);
    setNewLabelName("");
    setNewLabelColor(COLOR_OPTIONS[0]);
    setShowColorPicker(false);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
          Home / Settings / Jobs /{" "}
          <span className="text-[#007B8C]">comment</span>
        </p>

      <PageContentContainer className="min-h-0 flex-1 overflow-hidden p-0">
        {/* Page Header — reuses existing PageHeader */}
        <PageHeader
          title="Comments Settings"
          description="Configure how comments can be labelled on the review panel"
          showBackButton
          onBackClick={() => goBack({ fallbackTo: "/settings" })}
          className="!px-4 py-4"
        />

        <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto">
          <div className="p-6 space-y-6 max-w-[480px]">
          {/* ── Labels card ─────────────────────────────── */}
          <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
            <p className="text-sm font-semibold text-gray-800">Labels</p>

            <div className="space-y-3">
              <ToggleSwitch
                checked={allowLabelling}
                onChange={setAllowLabelling}
                label="Allow labelling comments"
                showLabel
                size="sm"
                className="flex-row-reverse justify-between w-full"
                labelClassName="text-sm text-gray-700"
              />
              <ToggleSwitch
                checked={allowCustomLabels}
                onChange={setAllowCustomLabels}
                label="Allow custom labels"
                showLabel
                size="sm"
                className="flex-row-reverse justify-between w-full"
                labelClassName="text-sm text-gray-700"
              />
            </div>
          </div>

          {/* ── Labels Created card ──────────────────────── */}
          <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-[1fr_auto] items-center border-b border-gray-200 px-4 py-2">
              <span className="text-sm font-medium text-gray-500">List</span>
              <span className="text-sm font-medium text-gray-500">Active</span>
            </div>

            {/* Label rows */}
            <div className="divide-y divide-gray-100">
              {labels.map((label) => (
                <div
                  key={label.id}
                  className="grid grid-cols-[1fr_auto] items-center px-4 py-3"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: label.color }}
                    />
                    <span className="text-sm text-gray-700">{label.name}</span>
                  </div>
                  <ToggleSwitch
                    checked={label.active}
                    onChange={(checked) => handleLabelToggle(label.id, checked)}
                    showLabel={false}
                    size="sm"
                  />
                </div>
              ))}
            </div>

            {/* Add new label row / input */}
            <div className="px-4 py-3">
              {isAdding ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    {/* Color dot + picker trigger */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowColorPicker((v) => !v)}
                        className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 shrink-0"
                        style={{ backgroundColor: newLabelColor }}
                        aria-label="Pick color"
                      />
                      {showColorPicker && (
                        <div className="absolute left-0 top-8 z-10 flex flex-wrap gap-1.5 rounded-lg border border-gray-200 bg-white p-2 shadow-md w-36">
                          {COLOR_OPTIONS.map((c) => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => {
                                setNewLabelColor(c);
                                setShowColorPicker(false);
                              }}
                              className="h-5 w-5 rounded-full border-2 transition"
                              style={{
                                backgroundColor: c,
                                borderColor:
                                  newLabelColor === c ? "#007B8C" : "transparent",
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    <input
                      autoFocus
                      type="text"
                      value={newLabelName}
                      onChange={(e) => setNewLabelName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleAddNew();
                        if (e.key === "Escape") handleCancelAdd();
                      }}
                      placeholder="Label name"
                      className="flex-1 rounded-md border border-gray-200 px-2 py-1 text-sm text-gray-800 outline-none focus:border-[#007B8C] focus:ring-1 focus:ring-[#007B8C]/20"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleAddNew}
                      className="rounded-md bg-[#007B8C] px-3 py-1 text-xs font-semibold text-white hover:bg-[#006474] transition"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelAdd}
                      className="rounded-md border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsAdding(true)}
                  className="text-sm font-semibold text-[#007B8C] hover:underline"
                >
                  +Add New
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Save button */}
          <div className="px-6 pb-6">
            <button
              type="button"
              className="rounded-md bg-[#E74C3C] px-5 py-2 text-sm font-semibold text-white hover:bg-[#c0392b] transition"
            >
              Save
            </button>
          </div>
        </div>
      </PageContentContainer>
    </div>
  );
}
