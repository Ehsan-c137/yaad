"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@ui/alert-dialog";
import { Button } from "@ui/button";
import { ArrowLeft, RotateCcw, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import type { SidebarPageItem } from "@/store/use-sidebar-store";

import { ROUTES } from "@/constants/routes";
import { formatRelativeTime } from "@/lib/date-formatter";
import { styles } from "@/lib/design-token";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/store/use-sidebar-store";
import { useWorkspaceStore } from "@/store/use-workspace-store";

interface TrashPageProps {
  workspaceId: string;
}

export function TrashPage({ workspaceId }: TrashPageProps) {
  const router = useRouter();
  const workspace = useWorkspaceStore((s) => s.workspaces[workspaceId]);
  const pages = useSidebarStore((s) => s.pages);
  const restorePage = useSidebarStore((s) => s.restorePage);
  const permanentlyDeletePage = useSidebarStore((s) => s.permanentlyDeletePage);
  const emptyTrash = useSidebarStore((s) => s.emptyTrash);

  const [searchQuery, setSearchQuery] = useState("");
  const [pageToDeletePermanently, setPageToDeletePermanently] =
    useState<SidebarPageItem | null>(null);
  const [isEmptyTrashOpen, setIsEmptyTrashOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Collect all trashed pages
  const trashedPages = useMemo(() => {
    return Object.values(pages)
      .filter((page): page is SidebarPageItem => Boolean(page?.isDeleted))
      .sort((a, b) => (b.deletedAt ?? 0) - (a.deletedAt ?? 0));
  }, [pages]);

  // Filter by search query
  const filteredPages = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return trashedPages;
    return trashedPages.filter((page) =>
      (page.title || "Untitled").toLowerCase().includes(query),
    );
  }, [trashedPages, searchQuery]);

  const handleRestore = (page: SidebarPageItem) => {
    restorePage(page.id);
    const title = page.title || "Untitled";
    toast.success(`Restored "${title}"`, {
      action: {
        label: "Open",
        onClick: () => {
          router.push(`/${ROUTES.workspace}/${workspaceId}/${page.id}`);
        },
      },
    });
  };

  const handlePermanentDeleteConfirm = async () => {
    if (!pageToDeletePermanently) return;
    const page = pageToDeletePermanently;
    setPageToDeletePermanently(null);

    setIsActionLoading(true);

    try {
      await permanentlyDeletePage(page.id);
      toast.success(`Permanently deleted "${page.title || "Untitled"}"`);
    } catch {
      toast.error("Failed to delete page permanently");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleEmptyTrashConfirm = async () => {
    setIsEmptyTrashOpen(false);
    setIsActionLoading(true);

    try {
      await emptyTrash();
      toast.success("Trash emptied successfully");
    } catch {
      toast.error("Failed to empty trash");
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-10 md:px-12 md:py-16">
      {/* Top back navigation */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href={`/${ROUTES.workspace}/${workspaceId}`}
          className={cn(
            "inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors",
            "hover:text-foreground",
          )}
        >
          <ArrowLeft className="size-3.5" />
          <span>Back to {workspace?.name || "Workspace"}</span>
        </Link>
      </div>

      {/* Header section */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-destructive/10 text-destructive shadow-xs">
            <Trash2 className="size-6" strokeWidth={1.75} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Trash
            </h1>
            <p className="text-xs text-muted-foreground sm:text-sm">
              Pages in the trash can be restored or permanently deleted.
            </p>
          </div>
        </div>

        {trashedPages.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEmptyTrashOpen(true)}
            disabled={isActionLoading}
            className="self-start text-xs text-destructive hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive sm:self-auto"
          >
            <Trash2 className="size-3.5" />
            <span>Empty Trash</span>
          </Button>
        )}
      </div>

      {/* Search and count bar */}
      {trashedPages.length > 0 && (
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-sm flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search trash..."
              className={cn(
                "h-8 w-full rounded-lg border border-border/60 bg-muted/30 pr-3 pl-8 text-xs text-foreground placeholder:text-muted-foreground/70",
                "focus:border-(--accent-blue) focus:bg-background focus:ring-1 focus:ring-(--accent-blue) focus:outline-none",
                "transition-colors",
              )}
            />
          </div>
          <span className="text-[11px] text-muted-foreground">
            {filteredPages.length}{" "}
            {filteredPages.length === 1 ? "page" : "pages"}
          </span>
        </div>
      )}

      {/* Main content list / empty state */}
      {trashedPages.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 py-16 text-center select-none sm:py-24">
          <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-muted/60 text-muted-foreground">
            <Trash2 className="size-6 opacity-75" strokeWidth={1.5} />
          </div>
          <h2 className="text-base font-semibold text-foreground">
            Trash is empty
          </h2>
          <p className="mt-1 max-w-xs text-xs/relaxed text-muted-foreground">
            Pages you move to trash will appear here. You can restore them
            anytime or delete them permanently.
          </p>
        </div>
      ) : filteredPages.length === 0 ? (
        <div className="rounded-xl border border-border/50 bg-card/40 py-12 text-center text-xs text-muted-foreground">
          No trashed pages match &quot;{searchQuery}&quot;.
        </div>
      ) : (
        <div className="divide-y divide-border/40 overflow-hidden rounded-xl border border-border/60 bg-card/50 backdrop-blur-sm">
          {filteredPages.map((page) => {
            const hasSubpages = page.childrenIds && page.childrenIds.length > 0;

            return (
              <div
                key={page.id}
                className={cn(
                  styles.listRow,
                  "group flex items-center justify-between gap-3 p-3 transition-colors duration-(--press-duration)",
                  "hover:bg-foreground/4 dark:hover:bg-white/4",
                )}
              >
                <Link
                  href={`/${ROUTES.workspace}/${workspaceId}/${page.id}`}
                  className="flex min-w-0 flex-1 items-center gap-2.5 transition-opacity hover:opacity-80"
                >
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted/50 text-base select-none">
                    {page.icon ?? "📄"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium text-foreground">
                        {page.title || "Untitled"}
                      </span>
                      {hasSubpages && (
                        <span className="rounded-sm bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                          {page.childrenIds.length} sub-page
                          {page.childrenIds.length > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground/80">
                      {page.deletedAt
                        ? `Deleted ${formatRelativeTime(page.deletedAt)}`
                        : "In trash"}
                    </p>
                  </div>
                </Link>

                {/* Actions */}
                <div className="flex shrink-0 items-center gap-1.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRestore(page)}
                    title="Restore page"
                    aria-label={`Restore ${page.title || "Untitled"}`}
                    className="h-8 gap-1.5 text-xs text-foreground hover:bg-foreground/8 hover:text-foreground"
                  >
                    <RotateCcw className="size-3.5 text-(--accent-blue)" />
                    <span className="hidden sm:inline">Restore</span>
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setPageToDeletePermanently(page)}
                    title="Delete permanently"
                    aria-label={`Delete permanently ${page.title || "Untitled"}`}
                    className="h-8 gap-1.5 text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="size-3.5" />
                    <span className="hidden sm:inline">Delete</span>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Dialog: Delete Permanently */}
      <AlertDialog
        open={Boolean(pageToDeletePermanently)}
        onOpenChange={(open) => {
          if (!open) setPageToDeletePermanently(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Permanently delete page?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete &quot;
              {pageToDeletePermanently?.title || "Untitled"}&quot;
              {pageToDeletePermanently?.childrenIds?.length
                ? ` and its ${pageToDeletePermanently.childrenIds.length} sub-page(s)`
                : ""}
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPageToDeletePermanently(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handlePermanentDeleteConfirm}
            >
              Delete permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirmation Dialog: Empty Trash */}
      <AlertDialog open={isEmptyTrashOpen} onOpenChange={setIsEmptyTrashOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Empty Trash?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete all{" "}
              {trashedPages.length} page{trashedPages.length === 1 ? "" : "s"}{" "}
              in the trash? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsEmptyTrashOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleEmptyTrashConfirm}
            >
              Empty Trash
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
