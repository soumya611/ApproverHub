import { VerticalDots } from "../../../icons";
import ProfileTableCheckbox from "./ProfileTableCheckbox";
import { TableHeaderRow } from "../table";

const ROLE_COLUMNS = [
  { id: "role_name", label: "Role Name" },
  { id: "description", label: "Description" },
  { id: "members", label: "Members" },
  { id: "access", label: "Access Level" },
];

export interface ProfileRoleRow {
  id: string;
  roleName: string;
  description: string;
  members: number;
  access: "Full" | "Custom" | "Limited";
}

const getAccessClassName = (access: ProfileRoleRow["access"]) => {
  switch (access) {
    case "Full":
      return "bg-green-100 text-green-700";
    case "Custom":
      return "bg-[#E6F6F8] text-[#007B8C]";
    default:
      return "bg-amber-100 text-amber-700";
  }
};

interface ProfileRolesTableProps {
  roles: ProfileRoleRow[];
  selectedIds: Set<string>;
  onToggleSelectAll: () => void;
  onToggleSelect: (roleId: string) => void;
}

export default function ProfileRolesTable({
  roles,
  selectedIds,
  onToggleSelectAll,
  onToggleSelect,
}: ProfileRolesTableProps) {
  const allSelected = roles.length > 0 && selectedIds.size === roles.length;
  const hasRows = roles.length > 0;

  return (
    <div className="overflow-x-auto px-3 py-3">
      <table className="w-full min-w-[980px] border-separate border-spacing-y-3 text-sm">
        <thead>
          <TableHeaderRow
            className="text-left text-sm text-gray-700"
            columns={ROLE_COLUMNS}
            getColumnKey={(column) => column.id}
            renderColumn={(column) => column.label}
            columnClassName="px-4 py-2 !font-medium"
            prefixCells={[
              {
                className: "px-4 py-2",
                content: (
                  <ProfileTableCheckbox
                    checked={allSelected}
                    onChange={onToggleSelectAll}
                    label="Select all"
                  />
                ),
              },
            ]}
            suffixCells={[{ className: "px-4 py-2 text-right", content: "" }]}
          />
        </thead>
        <tbody>
          {hasRows ? (
            roles.map((role) => {
              const baseCellClass = "border-y border-gray-200 bg-white px-4 py-3 align-middle";
              const leftCellClass = `${baseCellClass} border-l rounded-l-lg`;
              const rightCellClass = `${baseCellClass} border-r rounded-r-lg text-right`;

              return (
                <tr key={role.id} className="text-sm text-gray-700">
                  <td className={leftCellClass}>
                    <ProfileTableCheckbox
                      checked={selectedIds.has(role.id)}
                      onChange={() => onToggleSelect(role.id)}
                      aria-label={`Select ${role.roleName}`}
                    />
                  </td>
                  <td className={baseCellClass}>{role.roleName}</td>
                  <td className={baseCellClass}>{role.description}</td>
                  <td className={baseCellClass}>{role.members}</td>
                  <td className={baseCellClass}>
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${getAccessClassName(
                        role.access
                      )}`}
                    >
                      {role.access}
                    </span>
                  </td>
                  <td className={rightCellClass}>
                    <button
                      type="button"
                      className="rounded-full p-1 text-gray-400 hover:text-gray-600"
                      aria-label={`More options for ${role.roleName}`}
                    >
                      <VerticalDots className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td
                colSpan={ROLE_COLUMNS.length + 2}
                className="rounded-lg border border-gray-200 bg-white px-4 py-10 text-center text-sm text-gray-400"
              >
                No roles found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
