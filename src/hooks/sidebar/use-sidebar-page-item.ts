import { usePathname, useRouter } from "next/navigation";
import { useCallback } from "react";

import type { SidebarPageItem } from "@/store/use-sidebar-store";

import { ROUTES } from "@/constants/routes";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useDocumentStore } from "@/store/document/use-document-store";
import { useSidebarStore } from "@/store/use-sidebar-store";
import { useWorkspaceStore } from "@/store/use-workspace-store";

export interface SidebarPageItemViewModel {
  page: SidebarPageItem | undefined;
  href: string;
  isActive: boolean;
  hasChildren: boolean;
  handleNavigate: () => void;
  handleToggleExpand: (e: React.MouseEvent) => void;
  handleCreateSubpage: (e: React.MouseEvent) => Promise<void>;
}

export function useSidebarPageItem(pageId: string): SidebarPageItemViewModel {
  const pathname = usePathname();
  const router = useRouter();
  const isMobile = useMediaQuery("(max-width: 640px)");

  const page = useSidebarStore((s) => s.pages[pageId]);
  const workspaceId = useWorkspaceStore((s) => s.activeWorkspaceId)!;
  const toggleExpand = useSidebarStore((s) => s.toggleExpand);
  const toggleSidebar = useSidebarStore((s) => s.toggleSidebar);

  const createSubpage = useDocumentStore((s) => s.addSubPageBlock, pageId);

  const href = `/${ROUTES.workspace}/${workspaceId}/${pageId}`;
  const isActive = pathname === href;
  const hasChildren = page.childrenIds.length > 0;

  const handleNavigate = useCallback(() => {
    if (isMobile) toggleSidebar();
    router.push(href);
  }, [isMobile, toggleSidebar, router, href]);

  const handleToggleExpand = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      toggleExpand(pageId);
    },
    [toggleExpand, pageId],
  );

  const handleCreateSubpage = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      await createSubpage(pageId);
    },
    [createSubpage, pageId],
  );

  return {
    page,
    href,
    isActive,
    hasChildren,
    handleNavigate,
    handleToggleExpand,
    handleCreateSubpage,
  };
}
