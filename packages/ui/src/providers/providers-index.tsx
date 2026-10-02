import "@/i18n";
import type { WindowControls } from "@/context/platform-context";

import { TooltipProvider } from "@/components/ui/tooltip";
import { PlatformProvider } from "@/context/platform-context";

import { ErrorBoundary } from "./error-boundary";
import { MotionProvider } from "./motion-provider";
import { ThemeProvider } from "./theme-provider";
import { WorkspaceInitializer } from "./workspace-initializer";

export interface ProvidersProps {
  children: React.ReactNode;
  windowControls?: WindowControls;
}

export function Providers({ children, windowControls }: ProvidersProps) {
  return (
    <ErrorBoundary>
      <PlatformProvider
        value={{ isDesktop: Boolean(windowControls), windowControls }}
      >
        <ThemeProvider />
        <MotionProvider />
        <WorkspaceInitializer>
          <TooltipProvider delay={200}>{children}</TooltipProvider>
        </WorkspaceInitializer>
      </PlatformProvider>
    </ErrorBoundary>
  );
}
