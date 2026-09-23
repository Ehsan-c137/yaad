import { TooltipProvider } from "@/components/ui/tooltip";

import { ErrorBoundary } from "./error-boundary";
import { ThemeProvider } from "./theme-provider";
import { WorkspaceInitializer } from "./workspace-initializer";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <ThemeProvider />
      <WorkspaceInitializer>
        <TooltipProvider delay={200}>{children}</TooltipProvider>
      </WorkspaceInitializer>
    </ErrorBoundary>
  );
}
