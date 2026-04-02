import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router";

import { HomeIcon, JobIcon, GroupIcon, AnalyticsIcon, ChevronDownIcon ,JobTrackerIcon, CampaignIcon } from "../icons";
import { useSidebar } from "../context/SidebarContext";
import { resolveLabel, type LocalizationKey } from "../data/localization";
import { useLocalizationStore } from "../stores/localizationStore";
import { useAppSettingsStore } from "../stores/appSettingsStore";

type NavItem = {
  labelKey: LocalizationKey;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

const navItems: NavItem[] = [
  {
    icon: <HomeIcon />,
    labelKey: "nav.home",
    path: "/home",
  },
  {
    icon: <JobIcon />,
    labelKey: "nav.jobs",
    path: "/jobs",
  },
  {
    icon: <CampaignIcon />,
    labelKey: "nav.campaigns",
    path: "/campaigns",
  },
  {
    icon: <JobTrackerIcon />,
    labelKey: "nav.jobTracker",
    path: "/job-tracker",
  },
  {
    icon: <AnalyticsIcon />,
    labelKey: "nav.analytics",
    path: "/analytics",
  },
];


const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered } = useSidebar();
  const location = useLocation();
  const localizationOverrides = useLocalizationStore((s) => s.overrides);
  const isCampaignsDisabled = useAppSettingsStore((state) => state.isCampaignsDisabled);

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const visibleNavItems = useMemo(
    () =>
      navItems.filter((item) => (item.path === "/campaigns" ? !isCampaignsDisabled : true)),
    [isCampaignsDisabled]
  );

  const isActive = useCallback(
    (path: string) =>
      location.pathname === path || location.pathname.startsWith(`${path}/`),
    [location.pathname]
  );


  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  const renderMenuItems = (items: NavItem[], menuType: "main" | "others") => (
    <ul className="flex flex-col gap-4 mt-5">
      {items.map((nav, index) => {
        const label = resolveLabel(nav.labelKey, localizationOverrides);
        return (
          <li key={nav.labelKey}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group ${openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "menu-item-active"
                  : "menu-item-inactive"
                } cursor-pointer ${!isExpanded && !isHovered
                  ? "sm:justify-center"
                  : "sm:justify-start"
                }`}
            >
              <span
                className={`menu-item-icon-size ${openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                  }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text">{label}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto w-5 h-5 transition-transform duration-200 ${openSubmenu?.type === menuType &&
                      openSubmenu?.index === index
                      ? "rotate-180 text-brand-500"
                      : ""
                    }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                to={nav.path}
                className={`menu-item group ${
                  isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                } ${
                  !isExpanded && !isHovered && !isMobileOpen
                    ? "flex flex-col items-center gap-1 p-2"
                    : "flex items-center gap-2 p-2"
                }`}
              >
                <span
                  className={`menu-item-icon-size ${
                    isActive(nav.path)
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  }`}
                >
                  {nav.icon}
                </span>

                {/* Text below or beside icon */}
                {(isExpanded || isHovered || isMobileOpen) ? (
                  <span className="menu-item-text ml-2">{label}</span>
                ) : (
                  <span className="menu-item-text text-xs text-center mt-1">
                    {label}
                  </span>
                )}
              </Link>

            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      to={subItem.path}
                      className={`menu-dropdown-item ${isActive(subItem.path)
                          ? "menu-dropdown-item-active"
                          : "menu-dropdown-item-inactive"
                        }`}
                    >
                      {subItem.name}
                      <span className="flex items-center gap-1 ml-auto">
                        {subItem.new && (
                          <span
                            className={`ml-auto ${isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                              } menu-dropdown-badge`}
                          >
                            new
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`ml-auto ${isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                              } menu-dropdown-badge`}
                          >
                            pro
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
          </li>
        );
      })}
    </ul>
  );

  return (
    <aside
      className={`fixed flex flex-col top-[90px] left-3 bg-[var(--color-primary-500)] dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-[calc(100vh-100px)] transition-all duration-300 ease-in-out z-50 rounded-2xl border border-gray-200 
    ${isExpanded || isMobileOpen ? "w-[325px]" : "w-[133px]"}
    ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
    sm:translate-x-0 overflow-hidden`}
    >
      <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin no-scrollbar scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 hover:scrollbar-thumb-gray-400" onWheel={(e) => e.stopPropagation()}>
        <nav className="mb-6 px-3 pb-6">
          <div className="flex flex-col gap-4">
            <div>{renderMenuItems(visibleNavItems, "main")}</div>

          </div>
        </nav>
      </div>
    </aside>

  );
};

export default AppSidebar;
