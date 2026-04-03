import type { ReactNode } from "react";
import { useNavigate } from "react-router";
import { ChevronLeftIcon } from "../../../icons";
import AppBreadcrumb from "../../common/AppBreadcrumb";
import PageContentContainer from "../../layout/PageContentContainer";

interface ProfileSettingsPageContainerProps {
  title: string;
  breadcrumbCurrent: string;
  children: ReactNode;
  subtitle?: string;
  backTo?: string;
  breadcrumbOverride?: ReactNode;
  headerRight?: ReactNode;
  showBackButton?: boolean;
  contentClassName?: string;
}

export default function ProfileSettingsPageContainer({
  title,
  breadcrumbCurrent,
  children,
  subtitle,
  backTo = "/profile",
  breadcrumbOverride,
  headerRight,
  showBackButton = true,
  contentClassName = "space-y-6 p-6",
}: ProfileSettingsPageContainerProps) {
  const navigate = useNavigate();

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      {breadcrumbOverride ? (
        breadcrumbOverride
      ) : (
        <AppBreadcrumb
          items={[
            { label: "Settings", to: "/settings" },
            { label: "People", to: "/settings/people/users" },
            { label: "Profile", to: "/profile" },
            { label: breadcrumbCurrent },
          ]}
        />
      )}

      <PageContentContainer className="min-h-0 flex-1 overflow-hidden p-0">
        <div className="border-b border-gray-200 px-6 py-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              {showBackButton ? (
                <button
                  type="button"
                  onClick={() => navigate(backTo)}
                  className="mt-0.5 rounded-full p-1 text-gray-400 transition hover:bg-gray-100 hover:text-[#007B8C]"
                  aria-label="Back to profile"
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                </button>
              ) : null}
              <div>
                <h2 className="text-xl font-semibold text-primary">{title}</h2>
                {subtitle ? <p className="mt-1 text-sm text-gray-500">{subtitle}</p> : null}
              </div>
            </div>

            {headerRight ? <div className="pt-1">{headerRight}</div> : null}
          </div>
        </div>

        <div className={`min-h-0 flex-1 overflow-y-auto ${contentClassName}`}>{children}</div>
      </PageContentContainer>
    </div>
  );
}
