import { useEffect, useRef } from "react";

import { Link } from "react-router";
import NotificationDropdown from "../components/header/NotificationDropdown";
import UserDropdown from "../components/header/UserDropdown";
import SettingButton from "../components/common/SettingButton";
import FaqButton from "../components/common/FaqButton";

const AppHeader: React.FC = () => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 flex w-full bg-[#ffffff] dark:border-gray-800 dark:bg-gray-900 shadow-[#0000000A]">
      <div className="grid w-full lg:grid-cols-3 md:grid-cols-[auto_1fr_auto] items-center px-6 py-3">

        {/* LEFT: Logo aligned with sidebar */}
        <div className="flex items-center gap-3">
          {/* Logo */}
          <Link to="/home">
            <img
              className="dark:hidden lg:w-30 md:w-25"
              src="./images/logo/new-logo.svg"
              alt="Logo"
            />
            <img
              className="hidden dark:block lg:w-30 md:w-25"
              src="./images/logo/new-logo.svg"
              alt="Logo"
            />
          </Link>
        </div>

        {/* MIDDLE: Search bar */}
        <div className="lg:flex justify-center lg:px-0 md:px-4">
          <form className="w-full max-w-6xl">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2">
                <svg
                  className="fill-gray-500 dark:fill-gray-400"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M3.04175 9.37363C3.04175 5.87693 5.87711 3.04199 9.37508 3.04199C12.8731 3.04199 15.7084 5.87693 15.7084 9.37363C15.7084 12.8703 12.8731 15.7053 9.37508 15.7053C5.87711 15.7053 3.04175 12.8703 3.04175 9.37363ZM9.37508 1.54199C5.04902 1.54199 1.54175 5.04817 1.54175 9.37363C1.54175 13.6991 5.04902 17.2053 9.37508 17.2053C11.2674 17.2053 13.003 16.5344 14.357 15.4176L17.177 18.238C17.4699 18.5309 17.9448 18.5309 18.2377 18.238C18.5306 17.9451 18.5306 17.4703 18.2377 17.1774L15.418 14.3573C16.5365 13.0033 17.2084 11.2669 17.2084 9.37363C17.2084 5.04817 13.7011 1.54199 9.37508 1.54199Z"
                    fill=""
                  />
                </svg>
              </span>
              <input
                ref={inputRef}
                type="text"
                placeholder="Type to search..."
                className="h-[32px] w-full rounded-3xl border border-gray-200 bg-[#EFF0F0] py-2 pl-12 pr-14 text-sm text-gray-800 placeholder:text-[#64748B]  dark:border-gray-800 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
              />

            </div>
          </form>
        </div>

        {/* RIGHT: existing dropdowns */}
        <div className="flex items-center justify-end gap-2">
          <SettingButton />
          <FaqButton />
          <NotificationDropdown />
          <UserDropdown />
        </div>
      </div>
    </header>

  );
};

export default AppHeader;
