import { useMemo, useState } from "react";
import ToggleSwitch from "../toggle/ToggleSwitch";
import { normalizeColumns, type ColumnConfigItem } from "../../../data/columnsConfig";
import { useColumnsConfig } from "../../../context/ColumnsConfigContext";
import Checkbox from "../../form/input/Checkbox";

interface ColumnsManagerProps {
  disabled?: boolean;
  defaultNewFieldChecked?: boolean;
  addFieldInputVisible?: boolean;
  onAddFieldInputVisibleChange?: (visible: boolean) => void;
}

export default function ColumnsManager({
  disabled = false,
  defaultNewFieldChecked = true,
  addFieldInputVisible,
  onAddFieldInputVisibleChange,
}: ColumnsManagerProps) {
  const [newFieldName, setNewFieldName] = useState("");
  const [internalShowAddInput, setInternalShowAddInput] = useState(false);
  const { columns, setColumns } = useColumnsConfig();
  const showAddInput = addFieldInputVisible ?? internalShowAddInput;

  const setShowAddInput = (visible: boolean) => {
    if (addFieldInputVisible === undefined) {
      setInternalShowAddInput(visible);
    }
    onAddFieldInputVisibleChange?.(visible);
  };

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
      prev.map((field) => (field.id === id ? { ...field, label: value } : field))
    );
  };

  const handleAddField = () => {
    const trimmedName = newFieldName.trim();
    if (!trimmedName) return;

    const nextIndex = fields.length + 1;
    const newField: ColumnConfigItem = {
      id: `field-${Date.now()}`,
      label: trimmedName || `New field ${nextIndex}`,
      checked: defaultNewFieldChecked,
      required: false,
    };

    setColumns((prev) => normalizeColumns([...prev, newField]));
    setNewFieldName("");
    setShowAddInput(false);
  };

  return (
    <section className="bg-white p-5 shadow-sm">
      <div
        className={`max-w-[480px] rounded-md border border-[#D9D9D9] bg-gray-50/40 p-4 ${
          disabled ? "pointer-events-none opacity-60" : ""
        }`}
      >
        <div className="space-y-1">
          <p className="text-xs font-bold">Rows</p>
          <p className="text-xs text-gray-400">
            The rows which are active will only appear as columns on campaign dashboard
          </p>
        </div>

        <div className="mt-4 max-w-[460px] space-y-2">
          {fields.map((field) => (
            <div key={field.id} className="flex flex-wrap items-center gap-3 bg-[white] pr-10 py-2">
              <Checkbox
                checked={field.required ? true : field.checked}
                onChange={(checked) => handleToggleEnabled(field.id, checked)}
                className="!h-4 !w-4"
                disabled={disabled}
              />

              <input
                type="text"
                value={field.label}
                onChange={(event) => handleLabelChange(field.id, event.target.value)}
                className="flex-1 rounded-sm border border-gray-200 bg-white px-2 py-2 text-xs text-gray-700 font-semibold focus:border-[var(--color-secondary-300)] focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary-100)]"
                disabled={disabled}
              />

              <div className="ml-auto flex items-center gap-2">
                <ToggleSwitch
                  checked={field.required ?? false}
                  onChange={(checked) => handleToggleRequired(field.id, checked)}
                  size="sm"
                  disabled={disabled}
                />
                <span className="text-[11px] text-gray-500">Required</span>
              </div>
            </div>
          ))}

          {showAddInput ? (
            <div className="flex flex-wrap items-center gap-3 bg-white px-3 py-2">
              <span className="h-4 w-4 flex-shrink-0" />

              <input
                type="text"
                placeholder="Enter field name"
                value={newFieldName}
                onChange={(event) => setNewFieldName(event.target.value)}
                onKeyDown={(event) => event.key === "Enter" && handleAddField()}
                className="flex-1 rounded-sm border border-gray-200 bg-white px-2 py-2 text-xs text-gray-700 focus:border-[var(--color-secondary-300)] focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary-100)]"
                disabled={disabled}
              />

              <div className="ml-auto flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAddField}
                  disabled={disabled || !newFieldName.trim()}
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-lg font-semibold transition ${
                    !disabled && newFieldName.trim()
                      ? "bg-[#FFEAE6] text-[var(--color-secondary-500)]"
                      : "cursor-not-allowed bg-[#FFEAE6] text-gray-300"
                  }`}
                  aria-label="Add field"
                >
                  +
                </button>
                <span className="select-none text-[11px] text-transparent">Required</span>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {!showAddInput ? (
        <button
          type="button"
          onClick={() => setShowAddInput(true)}
          disabled={disabled}
          className="mt-3 text-xs font-semibold text-[var(--color-secondary-500)] disabled:cursor-not-allowed disabled:text-gray-300"
        >
          + Add field
        </button>
      ) : null}
    </section>
  );
}
