"use client";

import { Button } from "@ui/button";
import { FileText, Plus } from "lucide-react";

import { styles } from "@/lib/design-token";
import { cn } from "@/lib/utils";
import { useDocumentStore } from "@/store/document/use-document-store";
import { useSidebarStore } from "@/store/use-sidebar-store";

import { SidebarPageItem } from "./sidebar-item/sidebar-page-item";

export function SidebarHome() {
  const isHydrated = useSidebarStore((store) => store._hasHydrated);
  const rootPageIds = useSidebarStore((store) => store.rootPageIds);

  return (
    <>
      <SidebarHomeHeader />
      {!isHydrated && (
        <div className="space-y-1.5 p-2">
          <div className={cn(styles.skeleton, "h-4 w-2/3 rounded-full")} />
          <div className={cn(styles.skeleton, "h-4 w-4/5 rounded-full")} />
          <div className={cn(styles.skeleton, "h-4 w-1/2 rounded-full")} />
        </div>
      )}

      {isHydrated && rootPageIds.length === 0 && (
        <div className="flex flex-col items-center gap-3 px-2 py-8 text-center">
          <FileText strokeWidth={1} className="vibrancy-tertiary size-9" />
          <p className="text-sf-footnote vibrancy-secondary leading-relaxed">
            No pages yet.
            <br />
            Create one to get started.
          </p>
        </div>
      )}

      {rootPageIds.length > 0 && (
        <nav className="pb-2" aria-label="Pages">
          {rootPageIds.map((pageId) => (
            <SidebarPageItem key={pageId} pageId={pageId} />
          ))}
        </nav>
      )}
    </>
  );
}

function SidebarHomeHeader() {
  const createPage = useSidebarStore((store) => store.createPage);

  return (
    <div
      className={cn(
        styles.sectionLabel,
        "flex items-center justify-between pt-3 pb-1",
      )}
    >
      <span>Private</span>
      {/* Transparent after: pseudo-element expands the touch target to ≥44px */}
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => createPage(null)}
        title="Create page"
        aria-label="Create new page"
        className="relative text-muted-foreground after:absolute after:-inset-2 after:content-[''] hover:text-(--accent-blue)"
      >
        <Plus className="size-3.5" />
      </Button>
    </div>
  );
}
