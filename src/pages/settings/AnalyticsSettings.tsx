import AppBreadcrumb from "@/components/common/AppBreadcrumb";
import PageMeta from "@/components/common/PageMeta";
import PageContentContainer from "@/components/layout/PageContentContainer";
import PageHeader from "@/components/ui/page-header/PageHeader";
import ToggleSwitch from "@/components/ui/toggle/ToggleSwitch";
import { TableHeaderRow } from "@/components/ui/table";
import { useAppNavigate } from "@/hooks/useAppNavigate";

interface AnalyticsKpiRow {
  id: string;
  kpiName: string;
  dataset: string;
  active: boolean;
}

interface AnalyticsColumn {
  id: "kpiName" | "dataset" | "status";
  label: string;
  className?: string;
}

const ANALYTICS_COLUMNS: AnalyticsColumn[] = [
  { id: "kpiName", label: "KPI Name", className: "py-3 px-4 text-left" },
  { id: "dataset", label: "Dataset", className: "py-3 px-4 text-left" },
  { id: "status", label: "Status", className: "py-3 px-4 text-center" },
];

const ANALYTICS_ROWS: AnalyticsKpiRow[] = [
  { id: "kpi-1", kpiName: "Total Job", dataset: "Jobs", active: true },
  { id: "kpi-2", kpiName: "In Progress", dataset: "Jobs", active: false },
  { id: "kpi-3", kpiName: "Late", dataset: "Jobs", active: true },
  { id: "kpi-4", kpiName: "Approved", dataset: "Jobs", active: true },
  { id: "kpi-5", kpiName: "Average Revision", dataset: "Jobs", active: true },
  { id: "kpi-6", kpiName: "Average Turnaround Time", dataset: "Jobs", active: true },
  { id: "kpi-7", kpiName: "Created Job", dataset: "Jobs", active: true },
];

export default function AnalyticsSettings() {
  const { goBack } = useAppNavigate();

  return (
    <>
      <PageMeta title="Analytics Settings | Approver Hub" description="Manage analytics KPIs" />
      <div className="flex h-full min-h-0 flex-col gap-4">
        <AppBreadcrumb />
        <PageContentContainer className="min-h-0 flex-1 overflow-hidden p-0">
          <PageHeader
            title="Analytics"
            description="Define Campaign section edit tab name and columns name"
            onBackClick={() => goBack({ fallbackTo: "/settings" })}
            className="!px-4 py-4"
          />

          <div className="min-h-0 flex-1 overflow-auto p-4">
            <div className="overflow-hidden rounded-md border border-gray-200 bg-white p-3">
              <div className="overflow-x-auto custom-scrollbar">
                <table className="min-w-[550px] border-separate [border-spacing:0_10px] text-sm">
                  <thead>
                    <TableHeaderRow
                      className="bg-white text-[12px] font-bold text-gray-600"
                      columns={ANALYTICS_COLUMNS}
                      getColumnKey={(column) => column.id}
                      renderColumn={(column) => column.label}
                      columnClassName={(column) => column.className ?? "py-3 px-4"}
                    />
                  </thead>
                  <tbody>
                    {ANALYTICS_ROWS.map((row) => (
                      <tr key={row.id} className="text-sm text-gray-600">
                        <td className="rounded-l-md border-y border-l border-gray-200 bg-white py-3 px-4 font-medium text-gray-700">
                          {row.kpiName}
                        </td>
                        <td className="border-y border-gray-200 bg-white py-3 px-4">{row.dataset}</td>
                        <td className="rounded-r-md border-y border-r border-gray-200 bg-white py-3 px-4 text-center">
                          <div className="inline-flex items-center gap-2">
                            <ToggleSwitch
                              checked={row.active}
                              onChange={() => undefined}
                              showLabel={false}
                              size="sm"
                            />
                            <span className={row.active ? "text-gray-700" : "text-gray-400"}>
                              {row.active ? "Active" : "Inactive"}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </PageContentContainer>
      </div>
    </>
  );
}

