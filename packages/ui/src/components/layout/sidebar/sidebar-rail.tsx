"use client";

import { Button } from "@ui/button";
import { ROUTES } from "@yaad/core/constants/routes";
import { useSidebarStore } from "@yaad/core/store/use-sidebar-store";
import { useWorkspaceStore } from "@yaad/core/store/use-workspace-store";
import { Bookmark, Network, Plus, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router";

import { SearchBox } from "@/components/search/search-command";
import { Link } from "@/components/ui/link";
import { useSidebarToggle } from "@/hooks/sidebar/use-sidebar-toggle";
import { cn } from "@/lib/utils";

import { Profile } from "./profile/profile";
import { SidebarToggleButton } from "./sidebar-toggle-button";

export function SidebarRail() {
  const { t } = useTranslation("sidebar");
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const isSidebarOpen = useSidebarStore((store) => store.isSidebarOpen);
  const toggleSidebar = useSidebarToggle();
  const setSidebarTab = useSidebarStore((store) => store.setSidebarTab);
  const sidebarTab = useSidebarStore((store) => store.sidebarTab);
  const createPage = useSidebarStore((store) => store.createPage);

  const activeWorkspaceId = useWorkspaceStore(
    (store) => store.activeWorkspaceId,
  );

  const isGraphActive =
    activeWorkspaceId !== null &&
    pathname === `/workspace/${activeWorkspaceId}/graph`;
  const isTrashActive =
    activeWorkspaceId !== null &&
    pathname === `/workspace/${activeWorkspaceId}/trash`;
  const isBookmarkedActive = isSidebarOpen && sidebarTab === "bookmarked";

  const handleBookmarkClick = () => {
    setSidebarTab("bookmarked");

    if (!isSidebarOpen) {
      toggleSidebar();
    }
  };

  const handleCreatePage = async () => {
    const newPageId = createPage(null);

    if (activeWorkspaceId && newPageId) {
      await navigate(`/${ROUTES.workspace}/${activeWorkspaceId}/${newPageId}`);
    }
  };

  return (
    <div
      aria-label="Sidebar navigation rail"
      className="flex h-full w-full flex-col items-center justify-between py-1"
    >
      <div className="sidebar-rail-items flex w-full flex-col items-center gap-1.5">
        <SidebarToggleButton />

        <div className="my-0.5 h-px w-5 bg-border/60 dark:bg-white/10" />

        {activeWorkspaceId && (
          <Link
            href={`/workspace/${activeWorkspaceId}/graph`}
            aria-label={t("graphView")}
            className={cn(
              "rounded-full transition-colors",
              isGraphActive && "bg-muted text-foreground",
            )}
          >
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              title={t("graphView")}
              aria-label={t("graphView")}
            >
              <Network className="size-4" strokeWidth={1.5} />
            </Button>
          </Link>
        )}

        <Button
          variant="ghost"
          size="icon"
          onClick={handleBookmarkClick}
          className={cn(
            "rounded-full transition-colors",
            isBookmarkedActive && "bg-muted text-foreground",
          )}
          title={t("bookmarked")}
          aria-label={t("bookmarked")}
        >
          <Bookmark className="size-4" strokeWidth={1.5} />
        </Button>

        {activeWorkspaceId && (
          <Link
            href={`/workspace/${activeWorkspaceId}/trash`}
            aria-label={t("goToTrash")}
            className={cn(
              "rounded-full transition-colors",
              isTrashActive && "bg-muted text-foreground",
            )}
          >
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              title={t("trashPage")}
              aria-label={t("trashPage")}
            >
              <Trash2 className="size-4" strokeWidth={1.5} />
            </Button>
          </Link>
        )}

        <SearchBox
          triggerClassName={
            !isSidebarOpen ? "sidebar-search-button" : undefined
          }
        />

        <Button
          variant="ghost"
          size="icon"
          onClick={() => void handleCreatePage()}
          className="rounded-full text-muted-foreground hover:text-foreground"
          title={t("createNewPage")}
          aria-label={t("createNewPage")}
        >
          <Plus className="size-4" strokeWidth={1.5} />
        </Button>
      </div>

      <div className="sidebar-rail-profile flex w-full flex-col items-center pt-2">
        <Profile compact />
      </div>
    </div>
  );
}
