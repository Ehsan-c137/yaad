import { Outlet } from "react-router";

import { SidePeekPanel } from "../editor/side-panel/side-peek-panel";
import { WelcomeModal } from "../onboarding/welcome-modal";
import { BottomMobileNav } from "./bottom-mobile-nav";
import { Sidebar } from "./sidebar/sidebar";
import { WindowHeader } from "./window-header/window-header";

export function MainLayout({ children }: { children?: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-muted/40 text-foreground dark:bg-black/40">
      <WindowHeader />
      <div className="flex min-h-0 flex-1 overflow-hidden p-0 md:p-2 md:pt-1">
        <Sidebar />
        <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden bg-background md:rounded-2xl md:border md:border-border/70 md:shadow-xs dark:md:border-white/[0.08] dark:md:shadow-black/25">
          <main className="flex flex-1 scroll-fade overflow-hidden">
            <div className="flex w-full flex-1 overflow-y-auto">
              {children ?? <Outlet />}
            </div>
            <SidePeekPanel />
          </main>
          <BottomMobileNav />
        </div>
      </div>
      <WelcomeModal />
    </div>
  );
}
