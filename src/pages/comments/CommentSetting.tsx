import { useState } from "react";
import { useNavigate } from "react-router";
import PageMeta from "@/components/common/PageMeta";
import PageContentContainer from "@/components/layout/PageContentContainer";
import PageHeader from "@/components/ui/page-header/PageHeader";
import ToggleSwitch from "@/components/ui/toggle/ToggleSwitch";
import LabelsList, { type LabelItem } from "@/components/ui/labels-list/LabelsList";
import { useAppNavigate } from "@/hooks/useAppNavigate";

const DEFAULT_LABELS: LabelItem[] = [
  { id: "grammar",   name: "Grammar",   color: "#22C55E", active: true },
  { id: "content",   name: "Content",   color: "#3B82F6", active: true },
  { id: "question",  name: "Question",  color: "#EC4899", active: true },
  { id: "technical", name: "Technical", color: "#EAB308", active: true },
  { id: "design",    name: "Design",    color: "#F97316", active: true },
];

export default function CommentSetting() {
  const navigate = useNavigate();
  const { goBack } = useAppNavigate();

  const [allowTags, setAllowTags] = useState(true);
  const [labels, setLabels]       = useState<LabelItem[]>(DEFAULT_LABELS);

  return (
    <>
      <PageMeta
        title="Comments Settings"
        description="Configure how comments can be labelled on the review panel"
      />

      <div className="space-y-4">
        {/* Breadcrumb */}
        <p className="text-sm text-gray-500">
          <button
            type="button"
            onClick={() => navigate("/settings")}
            className="hover:underline hover:text-[#007B8C] transition-colors"
          >
            Settings
          </button>
          {" / "}
          <button
            type="button"
            onClick={() => navigate("/settings")}
            className="hover:underline hover:text-[#007B8C] transition-colors"
          >
            Jobs
          </button>
          {" / "}
          <span className="font-semibold text-[#007B8C]">Comments Settings</span>
        </p>

        <PageContentContainer className="min-h-0 flex-1 overflow-hidden p-0">
          {/* Header */}
          <PageHeader
            title="Comments Settings"
            description="Configure how comments can be labelled on the review panel"
            showBackButton
            onBackClick={() => goBack({ fallbackTo: "/settings" })}
            className="!px-4 py-4"
          />

          <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto">
          <div className="p-6 space-y-5 max-w-[560px]">
            {/* Single "Allow tags" toggle — flat, no card */}
            <ToggleSwitch
              checked={allowTags}
              onChange={setAllowTags}
              label="Allow tags"
              showLabel
              size="sm"
              labelClassName="text-sm font-semibold text-gray-800"
            />

            {/* Tags created section */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">Tags created</p>
              <LabelsList labels={labels} onChange={setLabels} />
            </div>
          </div>

          {/* Save */}
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
    </>
  );
}
