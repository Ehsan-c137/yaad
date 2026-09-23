import { ROUTES } from "@yaad/core/constants/routes";
import { documentService } from "@yaad/core/services/document-service";
import { useSidebarStore } from "@yaad/core/store/use-sidebar-store";
import { useWorkspaceStore } from "@yaad/core/store/use-workspace-store";
import { useNavigate } from "react-router";

export function useDeletePage(pageId: string) {
  const navigate = useNavigate();
  const activePageId = useSidebarStore((s) => s.activePageId);
  const workspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);

  return async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    await documentService.deletePageAndSubTree(pageId);

    if (activePageId === pageId && workspaceId) {
      navigate(`/${ROUTES.workspace}/${workspaceId}`);
    }
  };
}
