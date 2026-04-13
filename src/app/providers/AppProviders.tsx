import type { ReactNode } from "react";
import { AppWrapper } from "@/components/common/PageMeta";
import { ColorThemeProvider } from "@/context/ColorThemeContext";
import { ColumnsConfigProvider } from "@/context/ColumnsConfigContext";
import { JobsColumnsConfigProvider } from "@/context/JobsColumnsConfigContext";
import { ThemeProvider } from "@/context/ThemeContext";

interface AppProvidersProps {
  children: ReactNode;
}

export default function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider>
      <AppWrapper>
        <ColorThemeProvider>
          <ColumnsConfigProvider>
            <JobsColumnsConfigProvider>{children}</JobsColumnsConfigProvider>
          </ColumnsConfigProvider>
        </ColorThemeProvider>
      </AppWrapper>
    </ThemeProvider>
  );
}
