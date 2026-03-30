import { useState } from "react";
import { useNavigate } from "react-router";
import { getRoleLabel, isNormalUserRole } from "../../data/appUsers";
import { useUsersStore } from "../../stores/usersStore";
import { clearStoredUserIdentity, getStoredUserIdentity } from "../../utils/userIdentity";
import UserAvatar from "../common/UserAvatar";
import { Dropdown } from "../ui/dropdown/Dropdown";
import Button from "../ui/button/Button";

const formatUserId = (id?: string): string => {
  if (!id) return "ID0000000";
  return id.toUpperCase().startsWith("ID") ? id : `ID${id}`;
};

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const defaultUser = useUsersStore((state) => state.getDefaultUser());

  const storedUser = getStoredUserIdentity();
  const role = storedUser?.role ?? defaultUser.appRole ?? "user";
  const name = storedUser?.name ?? defaultUser.name;
  const avatarUrl = storedUser?.avatarUrl ?? defaultUser.avatarUrl;
  const userId = formatUserId(storedUser?.id ?? defaultUser.id);
  const roleLabel = storedUser?.roleLabel || getRoleLabel(role) || defaultUser.role;
  const showRole = !isNormalUserRole(role);

  const closeDropdown = () => {
    setIsOpen(false);
  };

  const handleManageProfile = () => {
    closeDropdown();
    navigate("/profile");
  };

  const handleSignOut = () => {
    clearStoredUserIdentity();
    closeDropdown();
    navigate("/login");
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen((previousState) => !previousState)}
        className="dropdown-toggle flex items-center text-gray-700 dark:text-gray-300"
        aria-label="Open user menu"
      >
        <div className="mr-2 hidden text-right md:flex md:flex-col md:leading-tight">
          <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">{name}</span>
          {showRole ? (
            <span className="text-xs text-gray-500 dark:text-gray-400">{roleLabel}</span>
          ) : null}
        </div>

        <span className="mr-2">
          <UserAvatar size="medium" name={name} avatarUrl={avatarUrl} />
        </span>

        <svg
          className={`stroke-gray-500 transition-transform duration-200 dark:stroke-gray-400 ${
            isOpen ? "rotate-180" : ""
          }`}
          width="18"
          height="20"
          viewBox="0 0 18 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4.3125 8.65625L9 13.3437L13.6875 8.65625"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute right-0 mt-[17px] w-[345px] h-[214px] rounded-sm bg-white shadow-theme-lg dark:border-gray-800 dark:bg-gray-900"
      >
        <div className="rounded-lg p-4 dark:border-gray-800">
          <div className="relative mx-auto mb-2 w-fit">
            <UserAvatar size="large" name={name} avatarUrl={avatarUrl} />
            <span className="absolute bottom-1 right-1 inline-flex h-5 w-5 items-center justify-center rounded-full border border-white bg-gray-100 text-gray-500 dark:border-gray-900 dark:bg-gray-700 dark:text-gray-200">
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9 3L7.17 5H4C2.9 5 2 5.9 2 7V19C2 20.1 2.9 21 4 21H20C21.1 21 22 20.1 22 19V7C22 5.9 21.1 5 20 5H16.83L15 3H9ZM12 8C14.76 8 17 10.24 17 13C17 15.76 14.76 18 12 18C9.24 18 7 15.76 7 13C7 10.24 9.24 8 12 8ZM12 10C10.35 10 9 11.35 9 13C9 14.65 10.35 16 12 16C13.65 16 15 14.65 15 13C15 11.35 13.65 10 12 10Z"
                  fill="currentColor"
                />
              </svg>
            </span>
          </div>

          <h4 className="text-center text-sm font-semibold text-gray-800 dark:text-gray-100">{name}</h4>
          <p className="mt-0.5 text-center text-[13px]  text-gray-500 dark:text-gray-400 font-regular">
            {showRole && roleLabel ? `${roleLabel} | ` : ""}
            {userId}
          </p>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <Button
              type="button"
              size="sm"
              variant="orangebutton"
              onClick={handleManageProfile}
              className="font-medium !text-[12px] !px-3 !py-1  w-full rounded-md ring-[var(--color-secondary-500)] text-[var(--color-secondary-500)] hover:bg-[var(--color-secondary-50)]"
            >
              Manage Profile
            </Button>
            <Button
              type="button"
              size="sm"
              variant="primary"
              onClick={handleSignOut}
              className="font-medium !text-[12px] !px-3 !py-1  w-full rounded-md"
            >
              Logout
            </Button>
          </div>
        </div>
      </Dropdown>
    </div>
  );
}
