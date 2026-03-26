import { useState } from "react";
import PageMeta from "../components/common/PageMeta";
import PageContentContainer from "../components/layout/PageContentContainer";
import ItemsCountSummary from "../components/common/ItemsCountSummary";
import { JobTrackerWorkflowPanel } from "../components/workflow";
import { useJobTrackerStore } from "../stores/jobTrackerStore";
import { resolveLabel } from "../data/localization";
import { useLocalizationStore } from "../stores/localizationStore";

export default function JobTracker() {
  const items = useJobTrackerStore((state) => state.items);
  const [allExpandedDefault, setAllExpandedDefault] = useState(false);
  const [batchKey, setBatchKey] = useState(0);
  const localizationOverrides = useLocalizationStore((s) => s.overrides);
  const jobTrackerTitle = resolveLabel(
    "page.jobTracker.title",
    localizationOverrides
  );

  const handleExpandAll = () => {
    setAllExpandedDefault(true);
    setBatchKey((prev) => prev + 1);
  };

  const handleCollapseAll = () => {
    setAllExpandedDefault(false);
    setBatchKey((prev) => prev + 1);
  };

  return (
    <>
      <PageMeta
        title={jobTrackerTitle}
        description="Track workflow progress by stage"
      />

      <PageContentContainer className="p-4 sm:p-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-[#007B8C]">
              {jobTrackerTitle}
            </h1>
            <ItemsCountSummary total={items.length} className="text-sm" />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExpandAll}
              className="rounded-md border border-[#007B8C] bg-[#007B8C] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#046a79]"
            >
              Expand all
            </button>
            <button
              type="button"
              onClick={handleCollapseAll}
              className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
            >
              Collapse all
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {items.map((item) => (
            <JobTrackerWorkflowPanel
              key={`${item.id}-${batchKey}`}
              summary={item.summary}
              stages={item.stages}
              defaultExpanded={allExpandedDefault}
            />
          ))}
        </div>

        <div className="mt-4">
          <ItemsCountSummary total={items.length} />
        </div>
      </PageContentContainer>
    </>
  );
}
