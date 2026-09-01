"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";

import { ROUTES } from "@/constants/routes";
import { useTabStore } from "@/store/use-tab-store";
import { useWorkspaceStore } from "@/store/use-workspace-store";

interface OpenPageTarget {
  pageId: string;
  title?: string;
  icon?: string;
}

export function useOpenPageInNewTab() {
  const router = useRouter();
  const workspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  const openTab = useTabStore((s) => s.openTab);

  return useCallback(
    ({ pageId, title, icon }: OpenPageTarget) => {
      if (!workspaceId) return;

      openTab({ pageId, workspaceId, title, icon });
      router.push(`/${ROUTES.workspace}/${workspaceId}/${pageId}`);
    },
    [openTab, router, workspaceId],
  );
}
