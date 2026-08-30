"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo } from "react";

import { ROUTES } from "@/constants/routes";
import { useSidebarStore } from "@/store/use-sidebar-store";
import { useTabStore } from "@/store/use-tab-store";
import { useWorkspaceStore } from "@/store/use-workspace-store";

export function useTabSync() {
  const params = useParams();
  const router = useRouter();

  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  const activeDocId = (params.pageId as string) || null;

  const tabs = useTabStore((s) => s.tabs);
  const activeTabId = useTabStore((s) => s.activeTabId);
  const openTab = useTabStore((s) => s.openTab);
  const updateTabInfo = useTabStore((s) => s.updateTabInfo);

  const sidebarPages = useSidebarStore((s) => s.pages);
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

    const pageInfo = sidebarPages[activeDocId];
    openTab({
      pageId: activeDocId,
      workspaceId: activeWorkspaceId,
      title: pageInfo?.title || "Untitled",
      icon: pageInfo?.icon,
    });
  }, [activeDocId, activeWorkspaceId, sidebarPages, openTab]);

  // Sync page title/icon updates into open tabs
  useEffect(() => {
    if (!activeDocId) return;
    const pageInfo = sidebarPages[activeDocId];

    if (pageInfo) {
      updateTabInfo(activeDocId, {
        title: pageInfo.title,
        icon: pageInfo.icon,
      });
    }
  }, [activeDocId, sidebarPages, updateTabInfo]);

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
      router.push(`/${ROUTES.workspace}/${activeWorkspaceId}/${newPageId}`);
    }
  }, [activeWorkspaceId, createPage, openTab, router]);

  return {
    activeDocId,
    activeTabId,
    workspaceTabs,
    handleCreateNewTab,
  };
}
