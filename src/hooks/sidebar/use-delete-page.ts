import { useRouter } from "next/navigation";

import { ROUTES } from "@/constants/routes";
import { documentService } from "@/services/document-service";
import { useSidebarStore } from "@/store/use-sidebar-store";
import { useWorkspaceStore } from "@/store/use-workspace-store";

export function useDeletePage(pageId: string) {
  const router = useRouter();
  const activePageId = useSidebarStore((s) => s.activePageId);
  const workspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);

  return async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    await documentService.deletePageAndSubTree(pageId);

    if (activePageId === pageId && workspaceId) {
      router.push(`/${ROUTES.workspace}/${workspaceId}`);
    }
  };
}
