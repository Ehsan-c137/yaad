"use client";

import { Button } from "@ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@ui/dropdown-menu";
import {
  MoreHorizontal,
  Plus,
  Sidebar as SidePeekIcon,
  XSquare,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

import { useSidePeek } from "@/hooks/editor/use-side-peek";
import { cn } from "@/lib/utils";
import { useTabStore } from "@/store/use-tab-store";
import { useWorkspaceStore } from "@/store/use-workspace-store";

import { useTabSync } from "./use-tab-sync";

export function WindowHeaderActions() {
  const { activeDocId, handleCreateNewTab } = useTabSync();
  const router = useRouter();
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  const closeAllTabs = useTabStore((s) => s.closeAllTabs);
  const { isOpen: isSidePeekOpen, openSidePeek, closeSidePeek } = useSidePeek();

  const handleCloseAllTabs = useCallback(() => {
    if (activeWorkspaceId) {
      closeAllTabs(activeWorkspaceId, router);
    }
  }, [activeWorkspaceId, closeAllTabs, router]);

  return (
    <div className="flex shrink-0 items-center gap-1 pl-2">
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label="Window options"
              className="size-7 rounded-md text-muted-foreground hover:bg-foreground/6 hover:text-foreground dark:hover:bg-white/6"
            >
              <MoreHorizontal className="size-3.5" />
            </Button>
          }
        />
        <DropdownMenuContent align="end" className="w-48 text-xs">
          <DropdownMenuItem onClick={handleCloseAllTabs}>
            <XSquare className="size-3.5 text-muted-foreground" />
            <span>Close all tabs</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleCreateNewTab}>
            <Plus className="size-3.5 text-muted-foreground" />
            <span>New document tab</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
