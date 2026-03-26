import { useMemo, useState } from "react";
import ToggleSwitch from "../toggle/ToggleSwitch";
import { normalizeColumns, type ColumnConfigItem } from "../../../data/columnsConfig";
import { useColumnsConfig } from "../../../context/ColumnsConfigContext";

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
  };

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-800">Campaign</h3>
          <p className="text-xs text-gray-500">
            Define Campaign section and tab name with column visibility.
          </p>
        </div>
        <ToggleSwitch
          checked={isDisabled}
          onChange={setIsDisabled}
          label="Disable"
          showLabel
          size="sm"
        />
      </div>
      <div
        className={`mt-4 rounded-lg border border-gray-100 bg-gray-50/40 p-4 ${
          isDisabled ? "pointer-events-none opacity-60" : ""
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
              className="flex flex-wrap items-center gap-3 rounded-md border border-gray-200 bg-white px-3 py-2 shadow-sm"
            >
              <input
                type="checkbox"
                className="h-4 w-4 rounded columns-checkbox"
                checked={field.required ? true : field.checked}
                disabled={field.required}
                onChange={(event) =>
                  handleToggleEnabled(field.id, event.target.checked)
                }
              />
              <input
                type="text"
                value={field.label}
                onChange={(event) =>
                  handleLabelChange(field.id, event.target.value)
                }
                className="flex-1 rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700 focus:border-[var(--color-secondary-300)] focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary-100)]"
              />
              <ToggleSwitch
                checked={field.required}
                onChange={(checked) => handleToggleRequired(field.id, checked)}
                label="Required"
                showLabel
                size="sm"
                className="ml-auto"
                labelClassName="text-[11px] text-gray-500"
              />
            </div>
          ))}
        </div>
        {showAddInput ? (
          <div className="mt-4 flex items-center gap-2">
            <input
              type="text"
              placeholder="Enter field name"
              value={newFieldName}
              onChange={(event) => setNewFieldName(event.target.value)}
              className="flex-1 rounded-md border border-gray-200 bg-white px-3 py-2 text-xs text-gray-700 shadow-sm focus:border-[var(--color-secondary-300)] focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary-100)]"
            />
            <button
              type="button"
              onClick={handleAddField}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-secondary-500)] text-lg font-semibold text-white transition hover:bg-[var(--color-secondary-600)] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={!newFieldName.trim()}
              aria-label="Add field"
            >
              +
            </button>
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
