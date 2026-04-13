import { useEffect, useMemo, useState } from "react";
import {
  CAMPAIGN_FIELD_DATA_TYPES,
  DEFAULT_CAMPAIGN_FIELD_DATA_TYPE,
  normalizeColumns,
  type CampaignFieldDataType,
  type ColumnConfigItem,
} from "../../../data/columnsConfig";
import { useColumnsConfig } from "../../../context/ColumnsConfigContext";
import Checkbox from "../../form/input/Checkbox";
import ToggleSwitch from "../toggle/ToggleSwitch";

interface ColumnsManagerProps {
  disabled?: boolean;
  defaultNewFieldChecked?: boolean;
  addFieldInputVisible?: boolean;
  onAddFieldInputVisibleChange?: (visible: boolean) => void;
  allowFieldValueEditing?: boolean;
}

export default function ColumnsManager({
  disabled = false,
  defaultNewFieldChecked = true,
  addFieldInputVisible,
  onAddFieldInputVisibleChange,
  allowFieldValueEditing = true,
}: ColumnsManagerProps) {
  const [newFieldName, setNewFieldName] = useState("");
  const [newFieldDataType, setNewFieldDataType] = useState<CampaignFieldDataType>(
    DEFAULT_CAMPAIGN_FIELD_DATA_TYPE
  );
  const [newFieldShowInTable, setNewFieldShowInTable] = useState(defaultNewFieldChecked);
  const [newFieldRequired, setNewFieldRequired] = useState(false);
  const [internalShowAddInput, setInternalShowAddInput] = useState(false);
  const { columns, setColumns } = useColumnsConfig();
  const showAddInput = addFieldInputVisible ?? internalShowAddInput;

  const resetNewFieldDraft = () => {
    setNewFieldName("");
    setNewFieldDataType(DEFAULT_CAMPAIGN_FIELD_DATA_TYPE);
    setNewFieldRequired(false);
    setNewFieldShowInTable(defaultNewFieldChecked);
  };

  const setShowAddInput = (visible: boolean) => {
    if (addFieldInputVisible === undefined) {
      setInternalShowAddInput(visible);
    }
    if (visible) {
      resetNewFieldDraft();
    }
    onAddFieldInputVisibleChange?.(visible);
  };

  const fields = useMemo(() => normalizeColumns(columns), [columns]);

  useEffect(() => {
    if (!showAddInput) return;
    setNewFieldShowInTable(defaultNewFieldChecked);
  }, [defaultNewFieldChecked, showAddInput]);

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

  const handleDataTypeChange = (id: string, dataType: CampaignFieldDataType) => {
    setColumns((prev) =>
      prev.map((field) => (field.id === id ? { ...field, dataType } : field))
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

    const newField: ColumnConfigItem = {
      id: `field-${Date.now()}`,
      defaultLabel: trimmedName,
      label: trimmedName,
      dataType: newFieldDataType,
      checked: newFieldRequired ? true : newFieldShowInTable,
      required: newFieldRequired,
    };

    setColumns((prev) => normalizeColumns([...prev, newField]));
    resetNewFieldDraft();
    setShowAddInput(false);
  };

  const rowClassName =
    "grid grid-cols-[84px_minmax(0,1fr)_130px_150px_auto] items-center gap-3 rounded-sm bg-white py-2";
  const inputBaseClassName =
    "w-full rounded-sm border border-gray-200 px-2 py-2 text-xs font-semibold focus:outline-none";
  const selectBaseClassName =
    "h-[34px] w-full rounded-sm border border-gray-200 bg-white px-2 text-xs text-gray-700 focus:border-[var(--color-secondary-300)] focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary-100)]";

  return (
    <section className="bg-white p-5 shadow-sm">
      <div
        className={`max-w-[700px] rounded-md border border-[#D9D9D9] bg-gray-50/40 p-4 ${
          disabled ? "pointer-events-none opacity-60" : ""
        }`}
      >
        <div className="space-y-1">
          <p className="text-xs font-bold">Rows</p>
          <p className="text-xs text-gray-400">
            The rows which are active will only appear as columns on campaign dashboard
          </p>
        </div>

        <div className="mt-4  space-y-2">
          {fields.map((field) => (
            <div key={field.id} className={rowClassName}>
              <div className="flex items-center">
                <Checkbox
                  checked={field.required ? true : field.checked}
                  onChange={(checked) => handleToggleEnabled(field.id, checked)}
                  className="!h-4 !w-4"
                  disabled={disabled}
                />
              </div>

              <input
                type="text"
                value={field.label}
                onChange={
                  allowFieldValueEditing
                    ? (event) => handleLabelChange(field.id, event.target.value)
                    : undefined
                }
                className={`${inputBaseClassName} ${
                  allowFieldValueEditing
                    ? "bg-white text-gray-700 focus:border-[var(--color-secondary-300)] focus:ring-2 focus:ring-[var(--color-secondary-100)]"
                    : "cursor-default bg-white text-gray-700"
                }`}
                readOnly={!allowFieldValueEditing}
                disabled={disabled}
              />

              <select
                value={field.dataType ?? DEFAULT_CAMPAIGN_FIELD_DATA_TYPE}
                onChange={(event) =>
                  handleDataTypeChange(field.id, event.target.value as CampaignFieldDataType)
                }
                className={selectBaseClassName}
                disabled={disabled}
                aria-label={`Data type for ${field.label}`}
              >
                {CAMPAIGN_FIELD_DATA_TYPES.map((dataType) => (
                  <option key={dataType} value={dataType}>
                    {dataType}
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-2">
                <ToggleSwitch
                  checked={field.required ?? false}
                  onChange={(checked) => handleToggleRequired(field.id, checked)}
                  size="sm"
                  showLabel={false}
                  disabled={disabled}
                />
                <span className="text-[11px] text-gray-500">Required</span>
              </div>

              <span className="h-7 w-7" />
            </div>
          ))}

          {showAddInput ? (
            <div className={rowClassName}>
              <div className="flex items-center">
                <Checkbox
                  checked={newFieldRequired ? true : newFieldShowInTable}
                  onChange={(checked) => {
                    if (newFieldRequired && !checked) return;
                    setNewFieldShowInTable(checked);
                  }}
                  className="!h-4 !w-4"
                  disabled={disabled}
                />
              </div>

              <input
                type="text"
                placeholder="Enter field name"
                value={newFieldName}
                onChange={(event) => setNewFieldName(event.target.value)}
                onKeyDown={(event) => event.key === "Enter" && handleAddField()}
                className={`${inputBaseClassName} bg-white text-gray-700 focus:border-[var(--color-secondary-300)] focus:ring-2 focus:ring-[var(--color-secondary-100)]`}
                disabled={disabled}
              />

              <select
                value={newFieldDataType}
                onChange={(event) =>
                  setNewFieldDataType(event.target.value as CampaignFieldDataType)
                }
                className={selectBaseClassName}
                disabled={disabled}
                aria-label="New field data type"
              >
                {CAMPAIGN_FIELD_DATA_TYPES.map((dataType) => (
                  <option key={dataType} value={dataType}>
                    {dataType}
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-2">
                <ToggleSwitch
                  checked={newFieldRequired}
                  onChange={(checked) => {
                    setNewFieldRequired(checked);
                    if (checked) {
                      setNewFieldShowInTable(true);
                    }
                  }}
                  size="sm"
                  showLabel={false}
                  disabled={disabled}
                />
                <span className="text-[11px] text-gray-500">Required</span>
              </div>

              <div className="flex items-center">
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
