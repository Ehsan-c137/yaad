import { ROUTES } from "@yaad/core/constants/routes";
import { useSidebarStore } from "@yaad/core/store/use-sidebar-store";
import { useWorkspaceStore } from "@yaad/core/store/use-workspace-store";
import { RotateCcw, Trash2 } from "lucide-react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

interface PageTrashBarProps {
  pageId: string;
}

export function PageTrashBar({ pageId }: PageTrashBarProps) {
  const navigate = useNavigate();
  const restorePage = useSidebarStore((s) => s.restorePage);
  const permanentlyDeletePage = useSidebarStore((s) => s.permanentlyDeletePage);
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  return (
    <div className="sticky top-0 z-30 flex items-center justify-between border-b border-amber-500/20 bg-amber-500/10 px-4 py-2 text-xs text-amber-600 backdrop-blur-md dark:text-amber-400">
      <div className="flex items-center gap-2">
        <Trash2 className="size-4 shrink-0" />
        <span>This page is in the trash.</span>
      </div>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            restorePage(pageId);
            toast.success("Page restored");
          }}
          className="h-7 gap-1 text-xs"
        >
          <RotateCcw className="size-3" />
          <span>Restore</span>
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={async () => {
            await permanentlyDeletePage(pageId);
            toast.success("Page permanently deleted");

            if (activeWorkspaceId) {
              navigate(`/${ROUTES.workspace}/${activeWorkspaceId}`);
            }
          }}
          className="h-7 gap-1 text-xs"
        >
          <span>Delete permanently</span>
        </Button>
      </div>
    </div>
  );
}
