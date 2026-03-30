import { useNavigate } from "react-router";
import { SettingIcon } from "../../icons";
import { getStoredUserIdentity } from "../../utils/userIdentity";

const SettingButton = () => {
  const navigate = useNavigate();
  const role = getStoredUserIdentity()?.role;
  const isAdminSettingsRole = role === "admin" || role === "org_admin";

  return (
    <button
      type="button"
      onClick={() =>
        navigate(isAdminSettingsRole ? "/settings" : "/settings/jobs/job-information")
      }
      className="relative flex items-center justify-center text-[#64748B] transition-colors bg-[#EFF0F0] border border-[#E2E8F0] rounded-full h-8 w-8 hover:bg-[#E0E2E2] hover:text-[#64748B] dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
      aria-label="Open settings"
    >
      {/* Settings (Gear) Icon */}
      <SettingIcon/>

    </button>
  );
};

export default SettingButton;
