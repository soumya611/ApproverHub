import { SidebarProvider, useSidebar } from "../context/SidebarContext";
import { Outlet, useLocation } from "react-router";
import AppHeader from "./AppHeader";
import Backdrop from "./Backdrop";
import AppSidebar from "./AppSidebar";

const HIDE_SIDEBAR_PATHS = ["/home"];

const LayoutContent: React.FC = () => {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const location = useLocation();
  const hideSidebar = HIDE_SIDEBAR_PATHS.includes(location.pathname);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* 🟦 Full-width Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 dark:bg-gray-900 dark:border-gray-800 shadow-sm">
        <AppHeader />
      </div>

      {/* 🟩 Main Body (below header) */}
      <div className="flex flex-1 bg-[#EFF0F0]">
        {/* Sidebar - hidden on Home */}
        {!hideSidebar && (
          <>
            <AppSidebar />
            <Backdrop />
          </>
        )}

        {/* Page Content - full width when no sidebar */}
        <main
          className={`flex-1 mt-20 overflow-y-auto no-scrollbar transition-all duration-300 ease-in-out
    ${hideSidebar ? "ml-0" : `ml-[90px] ${isExpanded ? "sm:ml-[335px]" : "sm:ml-[140px]"} ${isMobileOpen ? "ml-0" : ""}`}
  `}
        >
          <div className={hideSidebar ? "min-h-screen flex justify-center px-6 py-6" : "p-6"}>
            <div className={hideSidebar ? "w-full max-w-[1050px]" : "w-full"}>
              <Outlet key={location.pathname} />
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
