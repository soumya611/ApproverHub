import type { ReactNode } from "react";
import { Navigate } from "react-router";
import { useAppSettingsStore } from "../../stores/appSettingsStore";

interface CampaignsRouteGuardProps {
  children: ReactNode;
  fallbackPath?: string;
}

export default function CampaignsRouteGuard({
  children,
  fallbackPath = "/home",
}: CampaignsRouteGuardProps) {
  const isCampaignsDisabled = useAppSettingsStore((state) => state.isCampaignsDisabled);

  if (isCampaignsDisabled) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
}

