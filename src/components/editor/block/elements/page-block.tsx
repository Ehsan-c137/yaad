"use client";

import { ArrowUpRight, FileText, Trash2 } from "lucide-react";
import Link from "next/link";

import type { DocumentBlock } from "@/types/document";

import { styles } from "@/lib/design-token";
import { cn } from "@/lib/utils";
// import { documentService } from "@/services/document-service";
import { useDocumentStore } from "@/store/document/use-document-store";
import { useSidebarStore } from "@/store/use-sidebar-store";
import { useWorkspaceStore } from "@/store/use-workspace-store";

interface PageBlockProps {
  block: DocumentBlock;
}

export function PageBlock({ block }: PageBlockProps) {
  const workspaceId = useWorkspaceStore((store) => store.activeWorkspaceId);
  const deleteBlock = useDocumentStore((state) => state.deleteBlock);
  const deleteDocument = useDocumentStore((state) => state.deleteDocument);

  const subPageId = block.properties?.targetPageId;
  const subPageItem = useSidebarStore((s) =>
    subPageId ? s.pages[subPageId] : undefined,
  );

  const title =
    subPageItem?.title || block.properties?.title?.[0]?.text || "Untitled";
  const icon = subPageItem?.icon || block.properties?.icon;

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (subPageId) {
      await deleteDocument(subPageId);
    }

    // 2. Delete block reference from parent editor state
    await deleteBlock(block.id);
  };

  if (!subPageId || !workspaceId)
    return (
      <div>
        <p className="bg-black text-white">Loading...</p>
      </div>
    );

  return (
    <div className="group relative my-0.5 w-full">
      <Link
        href={`/workspace/${workspaceId}/${subPageId}`}
        className={cn(
          styles.listRow,
          "group/link my-0.5 w-full text-foreground select-none",
        )}
      >
        {/* Page Icon */}
        <span className="flex size-5 items-center justify-center text-base">
          {icon || <FileText className="size-4 text-muted-foreground" />}
        </span>

        {/* Title */}
        <span className="flex-1 truncate text-sm font-medium underline-offset-4 group-hover/link:underline">
          {title}
        </span>

        {/* Quick Nav & Delete Controls */}
        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <span
            role="button"
            tabIndex={0}
            onClick={handleDelete}
            onKeyDown={async (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                e.stopPropagation();
                await handleDelete(e as any);
              }
            }}
            title="Delete sub-page"
            className="flex cursor-pointer items-center justify-center rounded-sm p-1 text-muted-foreground hover:bg-accent hover:text-red-500"
          >
            <Trash2 className="size-3.5" />
          </span>
          <ArrowUpRight className="size-4 text-muted-foreground" />
        </div>
      </Link>
    </div>
  );
}
