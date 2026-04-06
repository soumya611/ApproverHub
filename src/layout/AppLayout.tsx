import { SidebarProvider, useSidebar } from "../context/SidebarContext";
import { Outlet, useLocation } from "react-router";
import AppHeader from "./AppHeader";
import Backdrop from "./Backdrop";
import AppSidebar from "./AppSidebar";

const HIDE_SIDEBAR_PATHS = ["/home"];

const LayoutContent: React.FC = () => {
  const { isExpanded, isMobileOpen } = useSidebar();
  const location = useLocation();
  const hideSidebar = HIDE_SIDEBAR_PATHS.includes(location.pathname);
  const pageWrapperClass = hideSidebar
    ? "w-full h-full min-h-0 max-w-[1050px]"
    : "w-full h-full min-h-0 min-w-0";
  const routeContentClass = hideSidebar
    ? "h-full min-h-0"
    : "flex h-full min-h-0 flex-col";
  const mainOverflowClass = "overflow-y-auto";
  const bodySpacingClass = hideSidebar ? "pt-20" : "pb-3 pt-[90px]";
  const sidebarOffsetClass = hideSidebar
    ? "ml-0"
    : isMobileOpen
      ? "ml-0"
      : isExpanded
        ? "sm:ml-[337px]"
        : "sm:ml-[145px]";

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#E9E9E9] dark:bg-gray-900">
      {/* 🟦 Full-width Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 dark:bg-gray-900 dark:border-gray-800 shadow-sm">
        <AppHeader />
      </div>

      {/* 🟩 Main Body (below header) */}
      <div className={`flex min-h-0 flex-1 ${bodySpacingClass}`}>
        {/* Sidebar - hidden on Home */}
        {!hideSidebar && (
          <>
            <AppSidebar />
            <Backdrop />
          </>
        )}

        {/* Page Content - full width when no sidebar */}
        <main
          className={`min-h-0 min-w-0 flex-1 ${mainOverflowClass} no-scrollbar transition-all duration-300 ease-in-out
    ${sidebarOffsetClass}
  `}
        >
          <div
            className={
              hideSidebar
                ? "flex h-full min-h-0 justify-center px-6 py-6"
                : "h-full min-h-0 px-6 pt-4"
            }
          >
            <div className={pageWrapperClass}>
              <div className={routeContentClass}>
                <Outlet key={location.pathname} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};


const AppLayout: React.FC = () => {
  return (
    <SidebarProvider>
      <LayoutContent />
    </SidebarProvider>
  );
};

export default AppLayout;
