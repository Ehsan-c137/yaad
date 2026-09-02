import { TooltipProvider } from "@/components/ui/tooltip";

import { ThemeProvider } from "./theme-provider";
import { WorkspaceInitializer } from "./workspace-initializer";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ThemeProvider />
      <WorkspaceInitializer>
        <TooltipProvider>{children}</TooltipProvider>
      </WorkspaceInitializer>
    </>
  );
}
