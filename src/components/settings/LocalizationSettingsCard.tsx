import { useMemo, useState } from "react";
import SearchInput from "../ui/search-input/SearchInput";
import { LOCALIZATION_ITEMS } from "../../data/localization";
import { useLocalizationStore } from "../../stores/localizationStore";
import { Add_GridiIcon, EditPenIcon, TrashBinIcon } from "../../icons";

export default function LocalizationSettingsCard() {
  const [query, setQuery] = useState("");
  const overrides = useLocalizationStore((s) => s.overrides);
  const setLabel = useLocalizationStore((s) => s.setLabel);
  const resetLabel = useLocalizationStore((s) => s.resetLabel);

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return LOCALIZATION_ITEMS;
    return LOCALIZATION_ITEMS.filter((item) => {
      const defaultLabel = item.defaultLabel.toLowerCase();
      const customLabel = overrides[item.key]?.toLowerCase() ?? "";
      return (
        defaultLabel.includes(normalizedQuery) ||
        customLabel.includes(normalizedQuery) ||
        item.key.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [query, overrides]);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-base font-semibold text-gray-800">
          Localisation
        </h2>
        <p className="mt-1 text-xs text-gray-500">
          Choose how platform labels are displayed.
        </p>
        <p className="mt-3 text-xs text-gray-500">
          The first column displays the platform's default labels, while the
          second column allows you to customise and enter labels in your
          preferred language. Changing the language or titles will not affect
          the functionality or workflow of the platform.
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
      </div>

      {filteredItems.length === 0 ? (
        <div className="mt-4 rounded-lg border border-dashed border-gray-200 bg-gray-50/50 px-4 py-6 text-center text-xs text-gray-400">
          No labels match your search.
        </div>
      ) : (
        <div className="mt-6 rounded-xl border border-gray-200 px-4 py-4">
          <div className="grid gap-3 text-xs font-semibold text-gray-500 sm:grid-cols-[1fr_1fr_auto]">
            <span className="px-1">Default</span>
            <span className="px-1">Customised Name</span>
            <span className="sr-only">Actions</span>
          </div>
          <div className="mt-3 space-y-3">
            {filteredItems.map((item) => {
              const customValue = overrides[item.key] ?? "";
              const hasOverride = Boolean(customValue.trim());
              return (
                <div
                  key={item.key}
                  className="grid items-center gap-15 sm:grid-cols-[1fr_1fr_auto]"
                >
                  <div className="relative">
                    <input
                      value={item.defaultLabel}
                      readOnly
                      aria-label={`Default label ${item.defaultLabel}`}
                      className="h-10 w-full rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-700 shadow-sm focus:outline-none"
                    />
                  </div>
                  <div className="relative">
                    <input
                      value={customValue}
                      onChange={(event) =>
                        setLabel(item.key, event.target.value)
                      }
                      placeholder={item.defaultLabel}
                      aria-label={`Custom name for ${item.defaultLabel}`}
                      className="h-10 w-full rounded-md border border-gray-200 bg-white px-3 pr-10 text-sm text-gray-700 shadow-sm placeholder:text-gray-400 focus:border-[#007B8C] focus:outline-none focus:ring-2 focus:ring-[#007B8C]/20"
                    />
                    <EditPenIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => setLabel(item.key, item.defaultLabel)}
                      disabled={hasOverride}
                      className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-500 transition ${
                        hasOverride
                          ? "cursor-not-allowed opacity-40"
                          : "hover:border-gray-300 hover:text-gray-700"
                      }`}
                      aria-label={`Set ${item.defaultLabel} custom name`}
                    >
                      <Add_GridiIcon className="h-8 w-8 text-[red]" />
                    </button>
                    <button
                      type="button"
                      onClick={() => resetLabel(item.key)}
                      disabled={!hasOverride}
                      className={`inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-500 transition ${
                        hasOverride
                          ? "hover:border-gray-300 hover:text-gray-700"
                          : "cursor-not-allowed opacity-40"
                      }`}
                      aria-label={`Delete custom name for ${item.defaultLabel}`}
                    >
                      <TrashBinIcon className="h-7 w-7" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
