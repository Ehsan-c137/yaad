import { ROUTES } from "@yaad/core/constants/routes";
import { useTabStore } from "@yaad/core/store/use-tab-store";
import { useWorkspaceStore } from "@yaad/core/store/use-workspace-store";
import { useCallback } from "react";
import { useNavigate } from "react-router";

interface OpenPageTarget {
  pageId: string;
  title?: string;
  icon?: string;
}

export function useOpenPageInNewTab() {
  const navigate = useNavigate();
  const workspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  const openTab = useTabStore((s) => s.openTab);

  return useCallback(
    ({ pageId, title, icon }: OpenPageTarget) => {
      if (!workspaceId) return;

      openTab({ pageId, workspaceId, title, icon });
      navigate(`/${ROUTES.workspace}/${workspaceId}/${pageId}`);
    },
    [openTab, navigate, workspaceId],
  );
}
