import { useMemo, useState } from "react";
import ToggleSwitch from "../toggle/ToggleSwitch";
import { normalizeColumns, type ColumnConfigItem } from "../../../data/columnsConfig";
import { useColumnsConfig } from "../../../context/ColumnsConfigContext";
import Checkbox from "../../form/input/Checkbox";

export default function ColumnsManager() {
  const [isDisabled, setIsDisabled] = useState(false);
  const [newFieldName, setNewFieldName] = useState("");
  const [showAddInput, setShowAddInput] = useState(false);
  const { columns, setColumns } = useColumnsConfig();

  const fields = useMemo(() => normalizeColumns(columns), [columns]);

  const handleToggleEnabled = (id: string, enabled: boolean) => {
    setColumns((prev) =>
      prev.map((field) => {
        if (field.id !== id) return field;
        if (field.required && !enabled) return field;
        return { ...field, checked: enabled };
      })
    );
  };

  const handleToggleRequired = (id: string, required: boolean) => {
    setColumns((prev) =>
      prev.map((field) => {
        if (field.id !== id) return field;
        return {
          ...field,
          required,
          checked: required ? true : field.checked,
        };
      })
    );
  };

  const handleLabelChange = (id: string, value: string) => {
    setColumns((prev) =>
      prev.map((field) =>
        field.id === id ? { ...field, label: value } : field
      )
    );
  };

  const handleAddField = () => {
    const trimmedName = newFieldName.trim();
    if (!trimmedName) return;
    const nextIndex = fields.length + 1;
    const newField: ColumnConfigItem = {
      id: `field-${Date.now()}`,
      label: trimmedName || `New field ${nextIndex}`,
      checked: true,
      required: false,
    };
    setColumns((prev) => normalizeColumns([...prev, newField]));
    setNewFieldName("");
    setShowAddInput(false);
  };

  return (
    <section className="bg-white p-5 shadow-sm">
      <div
        className={`max-w-[460px] rounded-md border-1 border-[#D9D9D9] bg-gray-50/40 p-4 ${isDisabled ? "pointer-events-none opacity-60" : ""
          }`}
      >
        <div className="space-y-1">
          <p className="text-xs font-semibold text-gray-500">Rows</p>
          <p className="text-xs text-gray-400">
            Active rows will appear on the campaign dashboard. Required rows
            cannot be unchecked.
          </p>
        </div>
        <div className="mt-4 max-w-[460px] space-y-2">
          {fields.map((field) => (
            <div
              key={field.id}
              className="flex flex-wrap items-center gap-3 bg-white px-3 py-2"
            >
              <Checkbox
                checked={field.required ? true : field.checked}
                onChange={(checked) =>
                  handleToggleEnabled(field.id, checked)
                }
                className="!h-4 !w-4"
              />
              <input
                type="text"
                value={field.label}
                onChange={(event) =>
                  handleLabelChange(field.id, event.target.value)
                }
                className="flex-1 rounded-sm border border-gray-200 bg-white px-2 py-2 text-xs text-gray-700 focus:border-[var(--color-secondary-300)] focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary-100)]"
              />
              <div className="ml-auto flex items-center gap-2">
                <ToggleSwitch
                  checked={field.required ?? false}
                  onChange={(checked) => handleToggleRequired(field.id, checked)}
                  size="sm"
                />
                <span className="text-[11px] text-gray-500">
                  Required
                </span>
              </div>

            </div>
          ))}
        </div>
        {showAddInput ? (
          <div className="mt-2 flex flex-wrap items-center gap-3 bg-white px-3 py-2">
            {/* Empty checkbox placeholder — keeps input aligned with rows above */}
            <span className="h-4 w-4 flex-shrink-0" />

            {/* Input — same flex-1 as label inputs above */}
            <input
              type="text"
              placeholder="Enter field name"
              value={newFieldName}
              onChange={(event) => setNewFieldName(event.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddField()}
              className="flex-1 rounded-sm border border-gray-200 bg-white px-2 py-2 text-xs text-gray-700 focus:border-[var(--color-secondary-300)] focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary-100)]"
            />

            {/* Add button — same position as toggle+Required above */}
            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                onClick={handleAddField}
                disabled={!newFieldName.trim()}
                className={`flex h-7 w-7 items-center justify-center rounded-full text-lg font-semibold transition ${newFieldName.trim()
                    ? "bg-[#FFEAE6] text-[var(--color-secondary-500)]"
                    : "bg-[#FFEAE6] text-gray-300 cursor-not-allowed"
                  }`}
                aria-label="Add field"
              >
                +
              </button>
              <span className="text-[11px] text-transparent select-none">Required</span>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowAddInput(true)}
            className="mt-4 text-xs font-semibold text-[var(--color-secondary-500)]"
          >
            + Add field
          </button>
        )}
      </div>
    </section>
  );
}
