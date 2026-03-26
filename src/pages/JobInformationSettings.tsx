import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import PageMeta from "../components/common/PageMeta";
import PageContentContainer from "../components/layout/PageContentContainer";
import DescriptionText from "../components/ui/description-text/DescriptionText";
import PopupTitle from "../components/ui/popup-title/PopupTitle";
import ToggleSwitch from "../components/ui/toggle/ToggleSwitch";
import Popup from "../components/ui/popup/Popup";
import { TableHeaderRow } from "../components/ui/table";
import { ChevronLeftIcon, EditPenIcon, PlusIcon, VerticalDots } from "../icons";
import { useJobInformationStore } from "../stores/jobInformationStore";

const TABLE_COLUMNS = [
  { id: "name", label: "Name" },
  { id: "version", label: "Version" },
  { id: "status", label: "Status" },
  { id: "edit", label: "Edit" },
];

export default function JobInformationSettings() {
  const navigate = useNavigate();
  const templates = useJobInformationStore((state) => state.templates);
  const enabled = useJobInformationStore((state) => state.enabled);
  const setEnabled = useJobInformationStore((state) => state.setEnabled);
  const setActiveTemplate = useJobInformationStore((state) => state.setActiveTemplate);
  const duplicateTemplate = useJobInformationStore((state) => state.duplicateTemplate);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    if (!openMenuId) return;
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest(".job-info-template-menu")) return;
      setOpenMenuId(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openMenuId]);

  return (
    <>
      <PageMeta title="Job Information" description="Job information settings" />
      <div className="space-y-4">
        <p className="text-sm text-gray-500">
          Home / Settings / Jobs /{" "}
          <span className="text-[#007B8C]">Job Information</span>
        </p>
        <PageContentContainer className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="mt-0.5 rounded-full p-1 text-gray-400 hover:text-[#007B8C]"
                aria-label="Back"
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </button>
              <div>
                <PopupTitle
                  colorClassName="text-[#007B8C]"
                  sizeClassName="text-base"
                  weightClassName="font-semibold"
                >
                  Job Information
                </PopupTitle>
                <DescriptionText
                  label=""
                  text="Define metadata questions that can later be linked to job creation"
                  className="text-xs"
                  labelClassName="text-gray-400"
                  textClassName="text-gray-500"
                />
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold text-gray-500">
              <span>On/Off</span>
              <ToggleSwitch
                checked={enabled}
                onChange={setEnabled}
                showLabel={false}
                size="sm"
              />
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-gray-200 bg-white p-4">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] border-separate border-spacing-y-2 text-sm">
                <thead>
                  <TableHeaderRow
                    className="text-left text-xs font-semibold text-gray-500"
                    columns={TABLE_COLUMNS}
                    getColumnKey={(column) => column.id}
                    renderColumn={(column) => column.label}
                    columnClassName="px-4 py-2"
                    suffixCells={[{ className: "px-4 py-2 text-right", content: "" }]}
                  />
                </thead>
                <tbody>
                  {templates.map((template) => {
                    const baseCell =
                      "border-y border-gray-200 bg-white px-4 py-3 align-middle text-sm text-gray-600";
                    const leftCell = `${baseCell} border-l rounded-l-lg`;
                    const rightCell = `${baseCell} border-r rounded-r-lg text-right`;
                    return (
                      <tr key={template.id}>
                        <td className={leftCell}>{template.name}</td>
                        <td className={baseCell}>{template.version}</td>
                        <td className={baseCell}>
                          <div className="flex items-center gap-2">
                            <ToggleSwitch
                              checked={template.isActive}
                              onChange={(checked) =>
                                setActiveTemplate(template.id, checked)
                              }
                              showLabel={false}
                              size="sm"
                            />
                            <span
                              className={`text-xs ${
                                template.isActive
                                  ? "text-[#007B8C]"
                                  : "text-gray-400"
                              }`}
                            >
                              {template.isActive ? "Active" : "Inactive"}
                            </span>
                          </div>
                        </td>
                        <td className={baseCell}>
                          <button
                            type="button"
                            onClick={() =>
                              navigate(`/settings/jobs/job-information/${template.id}`)
                            }
                            className="rounded-full p-1 text-gray-400 hover:text-[#007B8C]"
                            aria-label="Edit job information"
                          >
                            <EditPenIcon className="h-4 w-4" />
                          </button>
                        </td>
                        <td className={rightCell}>
                          <div className="job-info-template-menu relative inline-flex justify-end">
                            <button
                              type="button"
                              onClick={() =>
                                setOpenMenuId((prev) =>
                                  prev === template.id ? null : template.id
                                )
                              }
                              className="rounded-full p-1 text-gray-400 hover:text-gray-600"
                              aria-label="More options"
                              aria-haspopup="menu"
                              aria-expanded={openMenuId === template.id}
                            >
                              <VerticalDots className="h-4 w-4" />
                            </button>
                            {openMenuId === template.id ? (
                              <div className="absolute right-0 top-full z-30 mt-2">
                                <Popup
                                  items={[
                                    {
                                      id: "duplicate",
                                      label: "Duplicate",
                                      onClick: () => {
                                        duplicateTemplate(template.id);
                                        setOpenMenuId(null);
                                      },
                                    },
                                  ]}
                                  className="!min-w-[160px] rounded-lg"
                                />
                              </div>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </PageContentContainer>

        <button
          type="button"
          onClick={() => navigate("/settings/jobs/job-information/new")}
          className="fixed bottom-8 right-8 flex h-11 w-11 items-center justify-center rounded-md bg-[#F25C54] text-white shadow-lg"
          aria-label="Create new job information"
        >
          <PlusIcon className="h-5 w-5" />
        </button>
      </div>
    </>
  );
}
