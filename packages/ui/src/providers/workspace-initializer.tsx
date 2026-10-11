import { WorkspaceLayoutSkeleton } from "@ui/skeleton";
import { useWorkspaceStore } from "@yaad/core/store/use-workspace-store";
import { useEffect, useState } from "react";
import { useLocation } from "react-router";

interface WorkspaceInitializerProps {
  children: React.ReactNode;
}

export function WorkspaceInitializer({ children }: WorkspaceInitializerProps) {
  const { pathname } = useLocation();
  const [isHydrated, setIsHydrated] = useState(false);
  const loadInitialWorkspaces = useWorkspaceStore(
    (state) => state.loadInitialWorkspaces,
  );
  const isTauri =
    typeof window !== "undefined" &&
    ("__TAURI_INTERNALS__" in window || "__TAURI__" in window);
  const isLanding = !isTauri && (pathname === "/" || pathname === "/landing");

  useEffect(() => {
    if (isLanding) {
      setIsHydrated(true);
      return;
    }

    async function boot() {
      try {
        // Initialize workspaces (seeds default workspace if empty)
        // This also internally triggers loadWorkspacePages for the active workspace
        await loadInitialWorkspaces();
      } catch (error) {
        console.error("[WorkspaceInitializer] Initialization failed:", error);
      } finally {
        setIsHydrated(true);
      }
    }

    void boot();
  }, [loadInitialWorkspaces, isLanding]);

  // Prevent UI flashing or hydration mismatch while reading from IndexedDB
  if (!isHydrated && !isLanding) {
    return <WorkspaceLayoutSkeleton />;
  }

  return <>{children}</>;
}
