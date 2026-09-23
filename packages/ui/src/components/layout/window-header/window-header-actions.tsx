"use client";

import { Button } from "@ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@ui/dropdown-menu";
import { useTabStore } from "@yaad/core/store/use-tab-store";
import { useWorkspaceStore } from "@yaad/core/store/use-workspace-store";
import { MoreHorizontal, Plus, XSquare } from "lucide-react";
import { useCallback } from "react";
import { useNavigate } from "react-router";

import { ActionHeaderBar } from "./action-header-bar";
import { useTabSync } from "./use-tab-sync";

export function WindowHeaderActions() {
  const { handleCreateNewTab } = useTabSync();
  const navigate = useNavigate();
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  const closeAllTabs = useTabStore((s) => s.closeAllTabs);

  const handleCloseAllTabs = useCallback(() => {
    if (activeWorkspaceId) {
      closeAllTabs(activeWorkspaceId, { push: (href) => navigate(href) });
    }
  }, [activeWorkspaceId, closeAllTabs, navigate]);

  return (
    <div className="flex shrink-0 items-center gap-1 pl-2">
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label="Window options"
              data-tauri-no-drag-region="true"
              className="size-7 rounded-md text-muted-foreground hover:bg-foreground/6 hover:text-foreground dark:hover:bg-white/6 [app-region:no-drag]"
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
      <ActionHeaderBar />
    </div>
  );
}
