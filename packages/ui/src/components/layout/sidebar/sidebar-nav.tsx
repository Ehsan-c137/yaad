import { buttonVariants } from "@ui/button";
import { useSidebarStore } from "@yaad/core/store/use-sidebar-store";
import { useWorkspaceStore } from "@yaad/core/store/use-workspace-store";
import { Calendar, FileText, Network, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router";

import { SearchBox } from "@/components/search/search-command";
import { Link } from "@/components/ui/link";
import { isFirefox } from "@/lib/browser";
import { cn } from "@/lib/utils";

export function SidebarNav() {
  const { t } = useTranslation("sidebar");
  const { pathname } = useLocation();
  const activeWorkspaceId = useWorkspaceStore(
    (store) => store.activeWorkspaceId,
  );
  const isSidebarOpen = useSidebarStore((store) => store.isSidebarOpen);

  if (!activeWorkspaceId) return null;

  const isGraphActive =
    Boolean(activeWorkspaceId) &&
    pathname === `/workspace/${activeWorkspaceId}/graph`;
  const isTrashActive =
    Boolean(activeWorkspaceId) &&
    pathname === `/workspace/${activeWorkspaceId}/trash`;
  const isCalendarActive =
    pathname === "/calendar" ||
    (Boolean(activeWorkspaceId) &&
      pathname === `/workspace/${activeWorkspaceId}/calendar`);
  const isNotesActive =
    Boolean(activeWorkspaceId) &&
    !isGraphActive &&
    !isTrashActive &&
    !isCalendarActive;

  return (
    <div className="flex items-center justify-between px-1 pt-1.5 pb-0.5">
      <div className="flex items-center gap-1">
        <Link
          href={`/workspace/${activeWorkspaceId}`}
          aria-label={t("pages") || "Pages"}
          title={t("pages") || "Pages"}
          className={cn(
            buttonVariants({ variant: "ghost", size: "icon" }),
            isNotesActive && "bg-muted text-foreground",
          )}
        >
          <FileText className="size-4" strokeWidth={1.5} />
        </Link>
        <Link
          href={`/workspace/${activeWorkspaceId}/graph`}
          aria-label={t("graphView")}
          title={t("graphView")}
          className={cn(
            buttonVariants({ variant: "ghost", size: "icon" }),
            isGraphActive && "bg-muted text-foreground",
          )}
        >
          <Network className="size-4" strokeWidth={1.5} />
        </Link>
        <Link
          href={`/workspace/${activeWorkspaceId}/trash`}
          aria-label={t("goToTrash")}
          title={t("trashPage")}
          className={cn(
            buttonVariants({ variant: "ghost", size: "icon" }),
            isTrashActive && "bg-muted text-foreground",
          )}
        >
          <Trash2 className="size-4" strokeWidth={1.5} />
        </Link>
        <Link
          href={`/workspace/${activeWorkspaceId}/calendar`}
          aria-label="Calendar"
          title="Calendar"
          className={cn(
            buttonVariants({ variant: "ghost", size: "icon" }),
            isCalendarActive && "bg-muted text-foreground",
          )}
        >
          <Calendar className="size-4" strokeWidth={1.5} />
        </Link>
        <SearchBox
          triggerClassName={
            isSidebarOpen && !isFirefox() ? "sidebar-search-button" : undefined
          }
        />
      </div>
    </div>
  );
}
