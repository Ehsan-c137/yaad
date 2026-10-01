"use client";

import type { SidebarPageItem } from "@yaad/core/store/use-sidebar-store";

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
import { ROUTES } from "@yaad/core/constants/routes";
import { formatRelativeTime } from "@yaad/core/lib/date-formatter";
import { styles } from "@yaad/core/lib/design-token";
import { useSidebarStore } from "@yaad/core/store/use-sidebar-store";
import { useWorkspaceStore } from "@yaad/core/store/use-workspace-store";
import { ArrowLeft, RotateCcw, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { toast } from "sonner";

import { Link } from "@/components/ui/link";
import { cn } from "@/lib/utils";

interface TrashPageProps {
  workspaceId: string;
}

export function TrashPage({ workspaceId }: TrashPageProps) {
  const { t } = useTranslation(["search", "common", "editor"]);
  const navigate = useNavigate();
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
      (page.title || t("common:untitled")).toLowerCase().includes(query),
    );
  }, [trashedPages, searchQuery, t]);

  const handleRestore = (page: SidebarPageItem) => {
    restorePage(page.id);
    const title = page.title || t("common:untitled");
    toast.success(t("editor:pageRestored"), {
      description: title,
      action: {
        label: t("common:open"),
        onClick: () => {
          navigate(`/${ROUTES.workspace}/${workspaceId}/${page.id}`);
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
      toast.success(
        t("search:permanentlyDeleted", {
          title: page.title || t("common:untitled"),
        }),
      );
    } catch {
      toast.error(t("search:failedDeletePermanently"));
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleEmptyTrashConfirm = async () => {
    setIsEmptyTrashOpen(false);
    setIsActionLoading(true);

    try {
      await emptyTrash();
      toast.success(t("search:trashEmptied"));
    } catch {
      toast.error(t("search:failedEmptyTrash"));
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
          <ArrowLeft className="size-3.5 rtl:rotate-180" />
          <span>
            {t("search:backTo", { name: workspace?.name || "Workspace" })}
          </span>
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
              {t("search:trash")}
            </h1>
            <p className="text-xs text-muted-foreground sm:text-sm">
              {t("search:trashSubtitle")}
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
            <span>{t("search:emptyTrash")}</span>
          </Button>
        )}
      </div>

      {/* Search and count bar */}
      {trashedPages.length > 0 && (
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-sm flex-1">
            <Search className="pointer-events-none absolute top-1/2 start-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("search:searchTrash")}
              className={cn(
                "h-8 w-full rounded-lg border border-border/60 bg-muted/30 pe-3 ps-8 text-xs text-foreground placeholder:text-muted-foreground/70",
                "focus:border-(--accent-blue) focus:bg-background focus:ring-1 focus:ring-(--accent-blue) focus:outline-none",
                "transition-colors",
              )}
            />
          </div>
          <span className="text-[11px] text-muted-foreground">
            {filteredPages.length}{" "}
            {filteredPages.length === 1 ? t("search:page") : t("search:pages")}
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
            {t("search:trashIsEmpty")}
          </h2>
          <p className="mt-1 max-w-xs text-xs/relaxed text-muted-foreground">
            {t("search:trashEmptyDesc")}
          </p>
        </div>
      ) : filteredPages.length === 0 ? (
        <div className="rounded-xl border border-border/50 bg-card/40 py-12 text-center text-xs text-muted-foreground">
          {t("search:noTrashedMatch", { query: searchQuery })}
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
                        {page.title || t("common:untitled")}
                      </span>
                      {hasSubpages && (
                        <span className="rounded-sm bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                          {t("search:subPages", {
                            count: page.childrenIds.length,
                          })}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground/80">
                      {page.deletedAt
                        ? t("search:deletedAt", {
                            time: formatRelativeTime(page.deletedAt),
                          })
                        : t("search:inTrash")}
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
                    title={t("search:restorePage")}
                    aria-label={`${t("search:restorePage")} ${page.title || t("common:untitled")}`}
                    className="h-8 gap-1.5 text-xs text-foreground hover:bg-foreground/8 hover:text-foreground"
                  >
                    <RotateCcw className="size-3.5 text-(--accent-blue)" />
                    <span className="hidden sm:inline">
                      {t("common:restore")}
                    </span>
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setPageToDeletePermanently(page)}
                    title={t("editor:deletePermanently")}
                    aria-label={`${t("editor:deletePermanently")} ${page.title || t("common:untitled")}`}
                    className="h-8 gap-1.5 text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="size-3.5" />
                    <span className="hidden sm:inline">
                      {t("common:delete")}
                    </span>
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
            <AlertDialogTitle>
              {t("search:deletePermanentlyTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("search:deletePermanentlyDesc", {
                title: pageToDeletePermanently?.title || t("common:untitled"),
                subPages: pageToDeletePermanently?.childrenIds?.length
                  ? t("search:andSubPages", {
                      count: pageToDeletePermanently.childrenIds.length,
                    })
                  : "",
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPageToDeletePermanently(null)}>
              {t("common:cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handlePermanentDeleteConfirm}
            >
              {t("editor:deletePermanently")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirmation Dialog: Empty Trash */}
      <AlertDialog open={isEmptyTrashOpen} onOpenChange={setIsEmptyTrashOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("search:emptyTrashTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("search:emptyTrashDesc", { count: trashedPages.length })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsEmptyTrashOpen(false)}>
              {t("common:cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleEmptyTrashConfirm}
            >
              {t("search:emptyTrash")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
