import { useEffect, useMemo, useState } from "react";
import SearchInput from "../ui/search-input/SearchInput";
import {
  LOCALIZATION_ITEMS,
  type LocalizationKey,
} from "../../data/localization";
import { useLocalizationStore } from "../../stores/localizationStore";
import { Add_GridiIcon, EditPenIcon, TrashBinIcon } from "../../icons";
import { useColumnsConfig } from "../../context/ColumnsConfigContext";
import { normalizeColumns } from "../../data/columnsConfig";

type DraftValues = Record<string, string>;

export default function LocalizationSettingsCard() {
  const [query, setQuery] = useState("");
  const [campaignDrafts, setCampaignDrafts] = useState<DraftValues>({});
  const [platformDrafts, setPlatformDrafts] = useState<DraftValues>({});
  const overrides = useLocalizationStore((s) => s.overrides);
  const setLabel = useLocalizationStore((s) => s.setLabel);
  const { columns, setColumns } = useColumnsConfig();

  const normalizedColumns = useMemo(() => normalizeColumns(columns), [columns]);
  const normalizedQuery = query.trim().toLowerCase();

  useEffect(() => {
    setCampaignDrafts(
      Object.fromEntries(
        normalizedColumns.map((field) => [field.id, field.label])
      )
    );
  }, [normalizedColumns]);

  useEffect(() => {
    setPlatformDrafts(
      Object.fromEntries(
        LOCALIZATION_ITEMS.map((item) => [item.key, overrides[item.key] ?? ""])
      )
    );
  }, [overrides]);

  const filteredPlatformItems = useMemo(() => {
    if (!normalizedQuery) return LOCALIZATION_ITEMS;
    return LOCALIZATION_ITEMS.filter((item) => {
      const defaultLabel = item.defaultLabel.toLowerCase();
      const draftLabel = (platformDrafts[item.key] ?? "").toLowerCase();
      return (
        defaultLabel.includes(normalizedQuery) ||
        draftLabel.includes(normalizedQuery) ||
        item.key.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [normalizedQuery, platformDrafts]);

  const filteredCampaignFields = useMemo(() => {
    if (!normalizedQuery) return normalizedColumns;
    return normalizedColumns.filter((field) => {
      const defaultLabel = (field.defaultLabel ?? field.label).toLowerCase();
      const draftLabel = (campaignDrafts[field.id] ?? field.label).toLowerCase();
      return (
        defaultLabel.includes(normalizedQuery) ||
        draftLabel.includes(normalizedQuery) ||
        field.id.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [normalizedColumns, normalizedQuery, campaignDrafts]);

  const handlePlatformSave = (key: LocalizationKey) => {
    const draftValue = (platformDrafts[key] ?? "").trim();
    setLabel(key, draftValue);
  };

  const handlePlatformDelete = (key: LocalizationKey) => {
    setLabel(key, "");
    setPlatformDrafts((prev) => ({ ...prev, [key]: "" }));
  };

  const handleCampaignSave = (id: string) => {
    const currentField = normalizedColumns.find((field) => field.id === id);
    if (!currentField) return;
    const fallback = currentField.defaultLabel ?? currentField.label;
    const draftValue = (campaignDrafts[id] ?? "").trim();
    const nextLabel = draftValue || fallback;

    setColumns((prev) =>
      prev.map((field) => (field.id === id ? { ...field, label: nextLabel } : field))
    );
  };

  const handleCampaignDelete = (id: string) => {
    setColumns((prev) => prev.filter((field) => field.id !== id));
  };

  const hasNoResult =
    filteredPlatformItems.length === 0 && filteredCampaignFields.length === 0;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <p className="text-xs text-gray-500">
        The first column displays the platform&apos;s default labels, while the
        second column allows you to customise and enter labels in your preferred
        language. Changing the language or titles will not affect the
        functionality or workflow of the platform.
      </p>

      <div className="mt-4 w-full sm:w-72">
        <div className="rounded-full border border-gray-200 bg-white px-3 py-2">
          <SearchInput
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search customise settings"
            containerClassName="w-full"
            inputClassName="text-sm text-gray-700 placeholder:text-gray-400"
            className="text-sm text-gray-700 placeholder:text-gray-400"
            iconClassName="text-gray-400"
            iconSize="h-4 w-4"
            aria-label="Search localisation labels"
          />
        </div>
      </div>

      {hasNoResult ? (
        <div className="mt-4 rounded-lg border border-dashed border-gray-200 bg-gray-50/50 px-4 py-6 text-center text-xs text-gray-400">
          No labels match your search.
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          <section className="rounded-xl border border-gray-200 px-4 py-4">
            <h3 className="px-1 text-sm font-semibold text-gray-700">
              Platform Labels
            </h3>
            <div className="mt-3 grid gap-3 text-xs font-semibold text-gray-500 sm:grid-cols-[1fr_1fr_auto]">
              <span className="px-1">Default</span>
              <span className="px-1">Customised Name</span>
              <span className="sr-only">Actions</span>
            </div>
            <div className="mt-3 space-y-3">
              {filteredPlatformItems.length === 0 ? (
                <p className="px-1 text-xs text-gray-400">
                  No platform labels found.
                </p>
              ) : (
                filteredPlatformItems.map((item) => (
                  <div
                    key={item.key}
                    className="grid items-center gap-3 sm:grid-cols-[1fr_1fr_auto]"
                  >
                    {(() => {
                      const draftValue = (platformDrafts[item.key] ?? "").trim();
                      const savedValue = (overrides[item.key] ?? "").trim();
                      const hasPendingChange = draftValue !== savedValue;
                      const canDelete = Boolean(savedValue || draftValue);

                      return (
                        <>
                          <input
                            value={item.defaultLabel}
                            readOnly
                            aria-label={`Default label ${item.defaultLabel}`}
                            className="h-10 w-full rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-700 shadow-sm focus:outline-none"
                          />
                          <div className="relative">
                            <input
                              value={platformDrafts[item.key] ?? ""}
                              onChange={(event) =>
                                setPlatformDrafts((prev) => ({
                                  ...prev,
                                  [item.key]: event.target.value,
                                }))
                              }
                              placeholder={item.defaultLabel}
                              aria-label={`Custom name for ${item.defaultLabel}`}
                              className="h-10 w-full rounded-md border border-gray-200 bg-white px-3 pr-10 text-sm text-gray-700 shadow-sm placeholder:text-gray-400 focus:border-[#007B8C] focus:outline-none focus:ring-2 focus:ring-[#007B8C]/20"
                            />
                            <EditPenIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                          </div>
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => handlePlatformSave(item.key)}
                              disabled={!hasPendingChange}
                              className={`inline-flex h-8 w-8 items-center justify-center rounded-full transition ${
                                hasPendingChange
                                  ? "text-[#007B8C] hover:text-[#005f6c]"
                                  : "cursor-not-allowed text-gray-300"
                              }`}
                              aria-label={`Save custom name for ${item.defaultLabel}`}
                            >
                              <Add_GridiIcon className="h-6 w-6" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handlePlatformDelete(item.key)}
                              disabled={!canDelete}
                              className={`inline-flex h-8 w-8 items-center justify-center rounded-full transition ${
                                canDelete
                                  ? "text-gray-500 hover:text-gray-700"
                                  : "cursor-not-allowed text-gray-300"
                              }`}
                              aria-label={`Delete custom name for ${item.defaultLabel}`}
                            >
                              <TrashBinIcon className="h-7 w-7" />
                            </button>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="rounded-xl border border-gray-200 px-4 py-4">
            <h3 className="px-1 text-sm font-semibold text-gray-700">
              Campaign Fields
            </h3>
            <div className="mt-3 grid gap-3 text-xs font-semibold text-gray-500 sm:grid-cols-[1fr_1fr_auto]">
              <span className="px-1">Default</span>
              <span className="px-1">Customised Name</span>
              <span className="sr-only">Actions</span>
            </div>
            <div className="mt-3 space-y-3">
              {filteredCampaignFields.length === 0 ? (
                <p className="px-1 text-xs text-gray-400">
                  No campaign fields found.
                </p>
              ) : (
                filteredCampaignFields.map((field) => {
                  const defaultLabel = field.defaultLabel ?? field.label;
                  const draftValue = (campaignDrafts[field.id] ?? field.label).trim();
                  const nextValue = draftValue || defaultLabel;
                  const hasPendingChange = nextValue !== field.label;
                  return (
                    <div
                      key={field.id}
                      className="grid items-center gap-3 sm:grid-cols-[1fr_1fr_auto]"
                    >
                      <input
                        value={defaultLabel}
                        readOnly
                        aria-label={`Default label ${defaultLabel}`}
                        className="h-10 w-full rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-700 shadow-sm focus:outline-none"
                      />
                      <div className="relative">
                        <input
                          value={campaignDrafts[field.id] ?? field.label}
                          onChange={(event) =>
                            setCampaignDrafts((prev) => ({
                              ...prev,
                              [field.id]: event.target.value,
                            }))
                          }
                          placeholder={defaultLabel}
                          aria-label={`Custom name for ${defaultLabel}`}
                          className="h-10 w-full rounded-md border border-gray-200 bg-white px-3 pr-10 text-sm text-gray-700 shadow-sm placeholder:text-gray-400 focus:border-[#007B8C] focus:outline-none focus:ring-2 focus:ring-[#007B8C]/20"
                        />
                        <EditPenIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleCampaignSave(field.id)}
                          disabled={!hasPendingChange}
                          className={`inline-flex h-8 w-8 items-center justify-center rounded-full transition ${
                            hasPendingChange
                              ? "text-[#007B8C] hover:text-[#005f6c]"
                              : "cursor-not-allowed text-gray-300"
                          }`}
                          aria-label={`Save custom name for ${defaultLabel}`}
                        >
                          <Add_GridiIcon className="h-6 w-6" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCampaignDelete(field.id)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-500 transition hover:text-red-500"
                          aria-label={`Delete ${defaultLabel}`}
                        >
                          <TrashBinIcon className="h-7 w-7" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
