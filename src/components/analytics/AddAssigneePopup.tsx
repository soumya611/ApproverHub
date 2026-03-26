import { useEffect, useMemo, useState } from "react";
import PopupModal from "../ui/popup-modal/PopupModal";
import SearchInput from "../ui/search-input/SearchInput";
import ToggleSwitch from "../ui/toggle/ToggleSwitch";
import Button from "../ui/button/Button";
import UserCell from "../ui/user-cell/UserCell";

export interface AssigneeOption {
  id: string;
  name: string;
  initials: string;
  className?: string;
  avatarUrl?: string;
  subtitle?: string;
}

interface AddAssigneePopupProps {
  isOpen: boolean;
  onClose: () => void;
  users?: AssigneeOption[];
  selfUser?: AssigneeOption;
  onAdd?: (user: AssigneeOption) => void;
  title?: string;
  showToggleLabel?: boolean;
  titleClassName?: string;
  modalClassName?: string;
  modalContentClassName?: string;
  modalHeaderClassName?: string;
  overlayClassName?: string;
  searchContainerClassName?: string;
  searchInputClassName?: string;
  searchIconClassName?: string;
  toggleClassName?: string;
  toggleTrackClassName?: string;
  toggleThumbClassName?: string;
  toggleLabelClassName?: string;
  closeButtonClassName?: string;
  closeIconClassName?: string;
  addButtonClassName?: string;
}

export default function AddAssigneePopup({
  isOpen,
  onClose,
  users = [],
  selfUser,
  onAdd,
  title = "Add Assignee",
  showToggleLabel = true,
  titleClassName = "",
  modalClassName = "",
  modalContentClassName = "",
  modalHeaderClassName = "",
  overlayClassName = "bg-black/20",
  searchContainerClassName = "",
  searchInputClassName = "",
  searchIconClassName = "",
  toggleClassName = "",
  toggleTrackClassName = "",
  toggleThumbClassName = "",
  toggleLabelClassName = "",
  closeButtonClassName = "",
  closeIconClassName = "",
  addButtonClassName = "bg-[var(--color-brand-teal)] hover:bg-[var(--color-brand-teal)]",
}: AddAssigneePopupProps) {
  const [search, setSearch] = useState("");
  const [assignToSelf, setAssignToSelf] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!users || users.length === 0) return [];
    if (!term) return users;
    return users.filter((user) =>
      user.name.toLowerCase().includes(term)
    );
  }, [search, users]);

  const resolvedSelfUser = selfUser ?? null;
  const selectedUser = assignToSelf
    ? resolvedSelfUser
    : users?.find((user) => user.id === selectedUserId) ?? null;
  const canAdd = Boolean(selectedUser);

  useEffect(() => {
    if (!isOpen) {
      setSearch("");
      setAssignToSelf(false);
      setSelectedUserId(null);
    }
  }, [isOpen]);

  const handleToggleSelf = (checked: boolean) => {
    setAssignToSelf(checked);
    if (checked && resolvedSelfUser) {
      setSelectedUserId(resolvedSelfUser.id);
    }
  };

  const handleAdd = () => {
    if (!selectedUser) return;
    onAdd?.(selectedUser);
  };

  return (
    <PopupModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      titleClassName={titleClassName}
      closeButtonClassName={closeButtonClassName}
      closeIconClassName={closeIconClassName}
      className={`max-w-[850px] rounded-xl ${modalClassName}`}
      contentClassName={modalContentClassName}
      headerClassName={modalHeaderClassName}
      overlayClassName={overlayClassName}
    >
      <div className="border-b border-gray-300 pb-3">
        <SearchInput
          placeholder="Search users"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          containerClassName={searchContainerClassName}
          inputClassName={searchInputClassName}
          iconClassName={searchIconClassName}
        />
      </div>

      <div className="mt-4 max-h-[260px] space-y-2 overflow-y-auto pr-1">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => {
            const isSelected = user.id === selectedUserId && !assignToSelf;
            return (
              <button
                key={user.id}
                type="button"
                onClick={() => {
                  setSelectedUserId(user.id);
                  setAssignToSelf(false);
                }}
                className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left transition ${
                  isSelected
                    ? "border-[#007B8C] bg-[#007B8C]/5"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                <UserCell
                  title={user.name}
                  subtitle={user.subtitle}
                  avatarUrl={user.avatarUrl}
                  avatarSize="xsmall"
                  className="gap-2"
                  contentClassName="leading-tight"
                  titleClassName="text-[13px] font-medium text-gray-700"
                  subtitleClassName="text-[11px] text-gray-500"
                />
                <span
                  className={`ml-2 h-2.5 w-2.5 rounded-full border ${
                    isSelected
                      ? "border-[#007B8C] bg-[#007B8C]"
                      : "border-gray-300 bg-transparent"
                  }`}
                />
              </button>
            );
          })
        ) : ""}
      </div>

      <div className="mt-9 flex items-center justify-end gap-4">
        <ToggleSwitch
          checked={assignToSelf}
          onChange={handleToggleSelf}
          label="Assign to self"
          showLabel={showToggleLabel}
          className={toggleClassName}
          trackClassName={toggleTrackClassName}
          thumbClassName={toggleThumbClassName}
          labelClassName={toggleLabelClassName}
        />
        <Button
          size="sm"
          variant="primary"
          className={`min-w-[92px] ${addButtonClassName}`}
          onClick={handleAdd}
          disabled={!canAdd}
        >
          Add
        </Button>
      </div>
    </PopupModal>
  );
}
