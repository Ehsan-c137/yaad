"use client";

import {
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@ui/dropdown-menu";
import {
  Copy,
  Edit3,
  ExternalLink,
  Link2,
  Paintbrush,
  Repeat,
  Sidebar as SidePeek,
  Smile,
  Star,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { toast } from "sonner";

import type { DocumentBlock } from "@/types/document";

import { ROUTES } from "@/constants/routes";
import { useBlockActions } from "@/hooks/editor/use-block-actions";
import { useSidePeek } from "@/hooks/editor/use-side-peek";
import { cn } from "@/lib/utils";
import { useTabStore } from "@/store/use-tab-store";
import { useWorkspaceStore } from "@/store/use-workspace-store";

import { COLOR_OPTIONS, TURN_INTO_OPTIONS } from "./menu-constant";

interface BlockActionMenuProps {
  block: DocumentBlock;
}

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "numeric",
});

export function BlockActionMenu({ block }: BlockActionMenuProps) {
  const actions = useBlockActions(block.id);
  const router = useRouter();
  const workspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  const { openSidePeek } = useSidePeek();
  const openTab = useTabStore((s) => s.openTab);

  const handleOpenInNewTab = () => {
    const targetDocId =
      block.properties.pageId ?? block.properties.targetPageId ?? block.id;
    if (!workspaceId || !targetDocId) return;

    const title = block.properties?.title?.[0]?.text || "Untitled";
    const icon = block.properties?.icon;

    openTab({
      pageId: targetDocId,
      workspaceId,
      title,
      icon,
    });

    router.push(`/${ROUTES.workspace}/${workspaceId}/${targetDocId}`);
  };

  const handleOpenSidepeek = () => {
    // If this block is a sub-page, open its docId; otherwise open parent/linked doc
    const targetDocId = block.properties.targetPageId ?? block.id;
    console.log(targetDocId);
    openSidePeek(targetDocId);
  };

  const handleCopyLink = async () => {
    try {
      const url = new URL(window.location.href);
      url.hash = block.id;
      await navigator.clipboard.writeText(url.toString());
      toast.success("Block link copied to clipboard");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const formattedDate = useMemo(() => {
    return dateFormatter.format(new Date(block.updatedAt || Date.now()));
  }, [block.updatedAt]);

  const editorAuthor = block.properties?.lastEditedBy ?? "You";

  return (
    <>
      <DropdownMenuGroup>
        <DropdownMenuLabel className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
          Block
        </DropdownMenuLabel>
        {/* Turn into submenu */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Repeat className="size-3.5 text-muted-foreground" />
            <span>Turn into</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="max-h-64 w-48 overflow-y-auto">
            {TURN_INTO_OPTIONS.map((item) => {
              const Icon = item.icon;
              return (
                <DropdownMenuItem
                  key={item.type}
                  onClick={() => actions.changeType(item.type)}
                >
                  <Icon className="size-3.5 text-muted-foreground" />
                  <span>{item.label}</span>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* Color submenu */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Paintbrush className="size-3.5 text-muted-foreground" />
            <span>Color</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="max-h-64 w-48 overflow-y-auto">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                Background Color
              </DropdownMenuLabel>
              <div className="flex flex-col gap-1">
                {COLOR_OPTIONS.map((c) => (
                  <DropdownMenuItem
                    key={c.name}
                    className={c.bgClass}
                    onClick={() =>
                      actions.applyColor({ bgColor: c.name.toLowerCase() })
                    }
                  >
                    <span
                      className={cn(
                        "size-3.5 shrink-0 rounded-sm border border-border",
                        c.bgClass,
                      )}
                    />
                    <span className={c.textClass}>{c.name}</span>
                  </DropdownMenuItem>
                ))}
              </div>
              <DropdownMenuLabel className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                Text Color
              </DropdownMenuLabel>
              {COLOR_OPTIONS.map((c) => (
                <DropdownMenuItem
                  key={c.name}
                  onClick={() =>
                    actions.applyColor({ textColor: c.name.toLowerCase() })
                  }
                >
                  <span
                    className={cn(
                      "size-3.5 shrink-0 rounded-sm border border-border",
                    )}
                  />
                  <span className={c.textClass}>{c.name}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuItem>
          <Smile className="size-3.5 text-muted-foreground" />
          <span>Edit icon</span>
        </DropdownMenuItem>

        <DropdownMenuItem>
          <Star className="size-3.5 text-muted-foreground" />
          <span>Add to Favorites</span>
        </DropdownMenuItem>

        <DropdownMenuItem>
          <Edit3 className="size-3.5 text-muted-foreground" />
          <span>Rename</span>
          <DropdownMenuShortcut>Ctrl+Shift+R</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuGroup>

      <DropdownMenuSeparator />

      <DropdownMenuGroup>
        <DropdownMenuItem onClick={handleOpenInNewTab}>
          <ExternalLink className="size-3.5 text-muted-foreground" />
          <span>Open in new tab</span>
          <DropdownMenuShortcut>Ctrl+Shift+↵</DropdownMenuShortcut>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleOpenSidepeek}>
          <SidePeek className="size-3.5 text-muted-foreground" />
          <span>Open in side peek</span>
          <DropdownMenuShortcut>Alt+Click</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuGroup>

      <DropdownMenuSeparator />

      <DropdownMenuGroup>
        <DropdownMenuItem onClick={handleCopyLink}>
          <Link2 className="size-3.5 text-muted-foreground" />
          <span>Copy link</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={actions.duplicate}>
          <Copy className="size-3.5 text-muted-foreground" />
          <span>Duplicate</span>
          <DropdownMenuShortcut>Ctrl+D</DropdownMenuShortcut>
        </DropdownMenuItem>

        <DropdownMenuItem variant="destructive" onClick={actions.delete}>
          <Trash2 className="size-3.5" />
          <span>Move to Trash</span>
        </DropdownMenuItem>
      </DropdownMenuGroup>

      <DropdownMenuSeparator />

      <div className="flex flex-col gap-0.5 px-2 py-1.5 text-[11px] text-muted-foreground">
        <span>Last edited by {editorAuthor}</span>
        <span>{formattedDate}</span>
      </div>
    </>
  );
}
