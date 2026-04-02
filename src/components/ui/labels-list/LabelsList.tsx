import { useState } from "react";
import ToggleSwitch from "../toggle/ToggleSwitch";
import AddLabelModal from "./AddLabelModal";

export interface LabelItem {
  id: string;
  name: string;
  color: string;
  active: boolean;
}

interface LabelsListProps {
  labels: LabelItem[];
  onChange: (labels: LabelItem[]) => void;
}

export default function LabelsList({ labels, onChange }: LabelsListProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleToggle = (id: string, checked: boolean) =>
    onChange(labels.map((l) => (l.id === id ? { ...l, active: checked } : l)));

  const handleAdd = (name: string, color: string) => {
    onChange([
      ...labels,
      { id: `label-${Date.now()}`, name, color, active: true },
    ]);
  };

  return (
    <>
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        {/* Table header — only "List", no "Active" on the right */}
        <div className="border-b border-gray-200 px-4 py-2">
          <span className="text-sm font-medium text-gray-500">List</span>
        </div>

        {/* Rows */}
        <div className="divide-y divide-gray-100">
          {labels.map((label) => (
            <div
              key={label.id}
              className="grid grid-cols-[1fr_auto] items-center px-4 py-3"
            >
              <div className="flex items-center gap-2">
                <span
                  className="inline-block h-2 w-2 rounded-full shrink-0"
                  style={{ backgroundColor: label.color }}
                />
                <span className="text-sm text-gray-700">{label.name}</span>
              </div>
              <ToggleSwitch
                checked={label.active}
                onChange={(checked) => handleToggle(label.id, checked)}
                showLabel={false}
                size="sm"
              />
            </div>
          ))}
        </div>

        {/* +Add New */}
        <div className="px-4 py-3">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="text-sm font-semibold text-[#007B8C]"
          >
            + Add New
          </button>
        </div>
      </div>

      <AddLabelModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAdd}
      />
    </>
  );
}