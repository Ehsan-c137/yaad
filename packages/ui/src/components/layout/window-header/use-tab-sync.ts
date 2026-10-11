/* eslint-disable @typescript-eslint/prefer-nullish-coalescing, @typescript-eslint/no-floating-promises */
import { ROUTES } from "@yaad/core/constants/routes";
import { useSidebarStore } from "@yaad/core/store/use-sidebar-store";
import { useTabStore } from "@yaad/core/store/use-tab-store";
import { useWorkspaceStore } from "@yaad/core/store/use-workspace-store";
import { useCallback, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router";

export function useTabSync() {
  const params = useParams();
  const navigate = useNavigate();

  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  const activeDocId = params.pageId! || null;

  const tabs = useTabStore((s) => s.tabs);
  const activeTabId = useTabStore((s) => s.activeTabId);
  const openTab = useTabStore((s) => s.openTab);

  const activePageInfo = useSidebarStore((s) =>
    activeDocId ? s.pages[activeDocId] : undefined,
  );
  const activePageTitle = activePageInfo?.title;
  const activePageIcon = activePageInfo?.icon;
  const createPage = useSidebarStore((s) => s.createPage);

  // Filter tabs belonging to current workspace
  const workspaceTabs = useMemo(
    () =>
      tabs.filter(
        (t) => !activeWorkspaceId || t.workspaceId === activeWorkspaceId,
      ),
    [tabs, activeWorkspaceId],
  );

  // Sync active page from route into tab store
  useEffect(() => {
    if (!activeWorkspaceId || !activeDocId) return;

    openTab({
      pageId: activeDocId,
      workspaceId: activeWorkspaceId,
      title: activePageTitle || "Untitled",
      icon: activePageIcon,
    });
  }, [
    activeDocId,
    activeWorkspaceId,
    activePageTitle,
    activePageIcon,
    openTab,
  ]);

  const handleCreateNewTab = useCallback(() => {
    if (!activeWorkspaceId) return;
    const newPageId = createPage(null);

    if (newPageId) {
      openTab({
        pageId: newPageId,
        workspaceId: activeWorkspaceId,
        title: "Untitled",
        icon: "📄",
      });
      navigate(`/${ROUTES.workspace}/${activeWorkspaceId}/${newPageId}`);
    }
  }, [activeWorkspaceId, createPage, openTab, navigate]);

  return {
    activeDocId,
    activeTabId,
    workspaceTabs,
    handleCreateNewTab,
  };
}
