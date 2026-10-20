/* eslint-disable @typescript-eslint/prefer-optional-chain, @typescript-eslint/no-unnecessary-condition, @typescript-eslint/strict-void-return, @typescript-eslint/no-floating-promises */
import { Button } from "@ui/button";
import { ROUTES } from "@yaad/core/constants/routes";
import { MOBILE_NAV_HEIGHT } from "@yaad/core/constants/sizes";
import { useCalendarStore } from "@yaad/core/store/use-calendar-store";
import { useSidebarStore } from "@yaad/core/store/use-sidebar-store";
import { useWorkspaceStore } from "@yaad/core/store/use-workspace-store";
import {
  Calendar as CalendarIcon,
  CalendarRange,
  Globe,
  Inbox as InboxIcon,
  Plus,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate, useParams } from "react-router";

import { MobileBlockDrawer } from "@/components/editor/menu/mobile-block-drawer";
import { SearchBox } from "@/components/search/search-command";
import { useDocumentStore } from "@/hooks/editor/use-document-store-ui";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useWorkspacePermissions } from "@/hooks/workspace/use-workspace-permissions";
import { cn } from "@/lib/utils";
import { EditorPageIdProvider } from "@/providers/document-provider";

interface MobileEditorNavActionsProps {
  pageId: string;
  activeWorkspace: string;
}

function MobileEditorNavActions({
  pageId,
  activeWorkspace,
}: MobileEditorNavActionsProps) {
  const { t } = useTranslation(["sidebar", "editor"]);
  const navigate = useNavigate();
  const { isReadOnly } = useWorkspacePermissions(activeWorkspace);
  const createPage = useSidebarStore((store) => store.createPage);
  const currentDocument = useDocumentStore(
    (state) => state.currentDocument,
    pageId,
  );
  const activeBlockId = useDocumentStore(
    (state) => state.activeBlockId,
    pageId,
  );
  const addBlock = useDocumentStore((state) => state.addBlock, pageId);

  const isEditorPage = Boolean(
    pageId && currentDocument && currentDocument.id === pageId,
  );

  const rootChildren = currentDocument?.blocks?.root?.childrenIds ?? [];
  const effectiveBlockId =
    (activeBlockId && currentDocument?.blocks?.[activeBlockId]
      ? activeBlockId
      : null) ??
    (rootChildren.length > 0 ? rootChildren[rootChildren.length - 1] : null);

  const activeBlock = effectiveBlockId
    ? currentDocument?.blocks?.[effectiveBlockId]
    : null;

  const handleAddBlockBelow = async () => {
    if (isReadOnly) return;
    if (activeBlock) {
      await addBlock(
        activeBlock.parentId ?? "root",
        activeBlock.id,
        "paragraph",
      );
    } else {
      await addBlock("root", "root", "paragraph");
    }
  };

  if (!isEditorPage) {
    if (isReadOnly) return null;

    return (
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full active:scale-95"
        onClick={async () => {
          const newPageId = createPage(null);
          await navigate(
            `/${ROUTES.workspace}/${activeWorkspace}/${newPageId}`,
          );
        }}
        title={t("sidebar:createNewPage")}
      >
        <Plus className="size-4" />
      </Button>
    );
  }

  if (isReadOnly) return null;

  return (
    <div className="flex items-center gap-1.5">
      {activeBlock && <MobileBlockDrawer block={activeBlock} pageId={pageId} />}
      <Button
        size="icon"
        variant="ghost"
        className="size-8 rounded-full active:scale-95"
        onClick={handleAddBlockBelow}
        title={t("sidebar:addSubPage")}
      >
        <Plus className="size-4" />
      </Button>
    </div>
  );
}

export function BottomMobileNav() {
  const { t } = useTranslation("sidebar");
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { pageId } = useParams();

  const isMobile = useMediaQuery("(max-width: 767px)");
  const createPage = useSidebarStore((store) => store.createPage);
  const activeWorkspace = useWorkspaceStore((state) => state.activeWorkspaceId);
  const { isReadOnly } = useWorkspacePermissions(activeWorkspace);
  const isSidebarOpen = useSidebarStore((store) => store.isSidebarOpen);

  const mobileTab = useCalendarStore((s) => s.mobileTab);
  const setMobileTab = useCalendarStore((s) => s.setMobileTab);
  const setIsProviderModalOpen = useCalendarStore(
    (s) => s.setIsProviderModalOpen,
  );
  const connectedProvidersCount = useCalendarStore((s) => s.providers.length);

  const isCalendar =
    pathname === "/calendar" ||
    pathname.endsWith("/calendar") ||
    (activeWorkspace !== null &&
      pathname === `/workspace/${activeWorkspace}/calendar`);

  if (!isMobile || (!activeWorkspace && !isCalendar)) return null;

  const handleNewAction = () => {
    if (isReadOnly) return;
    if (isCalendar) {
      useCalendarStore.getState().setIsEventModalOpen(true);
      return;
    }
    if (!activeWorkspace) return;
    const newPageId = createPage(null);
    navigate(`/${ROUTES.workspace}/${activeWorkspace}/${newPageId}`);
  };

  return (
    <>
      {/* Calendar Floating Action Button (FAB) above dock */}
      {isCalendar && !isReadOnly && (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleNewAction}
          title="Add event"
          aria-label="Add event"
          className={cn(
            "fixed right-5 z-40 flex size-14 items-center justify-center rounded-full",
            "bg-primary text-primary-foreground shadow-xl shadow-primary/25",
            "transition-all duration-300 ease-(--spring) hover:scale-105 active:scale-95",
            isSidebarOpen &&
              "pointer-events-none select-none opacity-0 translate-y-3",
          )}
          style={{
            bottom:
              "calc(max(1rem, calc(0.75rem + env(safe-area-inset-bottom, 0px))) + 68px + 12px)",
          }}
        >
          <Plus className="size-6" strokeWidth={2.2} />
        </Button>
      )}

      <nav
        style={{
          height: `${MOBILE_NAV_HEIGHT}px`,
          background: "rgba(255, 255, 255, 0.95)",
          boxShadow: "0 -4px 20px rgba(0, 0, 0, 0.06)",
          bottom: "max(1rem, calc(0.75rem + env(safe-area-inset-bottom, 0px)))",
        }}
        aria-label="Mobile navigation"
        aria-hidden={isSidebarOpen}
        inert={isSidebarOpen ? true : undefined}
        className={cn(
          "fixed inset-x-4 z-30 mx-auto flex items-center",
          isCalendar
            ? "max-w-sm justify-around rounded-full border border-border/60 px-3 py-1.5 dark:border-white/12 dark:bg-[#18181b]/85 dark:shadow-[0_-4px_20px_rgba(0,0,0,0.3)]"
            : "max-w-md justify-between rounded-full border border-border/60 bg-background/90 px-3.5 py-1.5 shadow-lg shadow-black/5 backdrop-blur-xl dark:border-white/12 dark:bg-background/85 dark:shadow-black/30",
          "transition-all duration-300 ease-(--spring)",
          isSidebarOpen &&
            "pointer-events-none select-none opacity-0 translate-y-3",
        )}
      >
        {/* 1. Left: Search Trigger (only when not on calendar) */}
        {!isCalendar && <SearchBox />}

        {/* 2. Center: Calendar Dock Items (4 core navigation tabs) */}
        {isCalendar && (
          <div className="flex w-full items-center justify-around">
            {/* Tab 1: Inbox */}
            <Button
              type="button"
              variant="ghost"
              onClick={() => setMobileTab("inbox")}
              className={cn(
                "flex h-auto flex-col items-center justify-center gap-1 rounded-xl px-3 py-1 text-[11px] transition-all select-none hover:bg-transparent",
                mobileTab === "inbox"
                  ? "font-bold text-foreground"
                  : "font-normal text-muted-foreground hover:text-foreground",
              )}
            >
              <InboxIcon
                className="size-[18px]"
                strokeWidth={mobileTab === "inbox" ? 2.5 : 1.5}
              />
              <span>Inbox</span>
            </Button>

            {/* Tab 2: Today */}
            <Button
              type="button"
              variant="ghost"
              onClick={() => setMobileTab("today")}
              className={cn(
                "flex h-auto flex-col items-center justify-center gap-1 rounded-xl px-3 py-1 text-[11px] transition-all select-none hover:bg-transparent",
                mobileTab === "today"
                  ? "font-bold text-foreground"
                  : "font-normal text-muted-foreground hover:text-foreground",
              )}
            >
              <CalendarIcon
                className="size-[18px]"
                strokeWidth={mobileTab === "today" ? 2.5 : 1.5}
              />
              <span>Today</span>
            </Button>

            {/* Tab 3: Upcoming */}
            <Button
              type="button"
              variant="ghost"
              onClick={() => setMobileTab("upcoming")}
              className={cn(
                "flex h-auto flex-col items-center justify-center gap-1 rounded-xl px-3 py-1 text-[11px] transition-all select-none hover:bg-transparent",
                mobileTab === "upcoming"
                  ? "font-bold text-foreground"
                  : "font-normal text-muted-foreground hover:text-foreground",
              )}
            >
              <CalendarRange
                className="size-[18px]"
                strokeWidth={mobileTab === "upcoming" ? 2.5 : 1.5}
              />
              <span>Upcoming</span>
            </Button>

            {/* Tab 4: Browse */}
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setMobileTab("browse");
                setIsProviderModalOpen(true);
              }}
              className={cn(
                "relative flex h-auto flex-col items-center justify-center gap-1 rounded-xl px-3 py-1 text-[11px] transition-all select-none hover:bg-transparent",
                mobileTab === "browse"
                  ? "font-bold text-foreground"
                  : "font-normal text-muted-foreground hover:text-foreground",
              )}
            >
              <div className="relative flex items-center justify-center">
                <Globe
                  className="size-[18px]"
                  strokeWidth={mobileTab === "browse" ? 2.5 : 1.5}
                />
                {connectedProvidersCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 size-1.5 rounded-full bg-primary" />
                )}
              </div>
              <span>Browse</span>
            </Button>
          </div>
        )}

        {/* 3. Right: Action Trigger (only when not on calendar) */}
        {!isCalendar &&
          (pageId ? (
            <EditorPageIdProvider pageId={pageId}>
              <MobileEditorNavActions
                pageId={pageId}
                activeWorkspace={activeWorkspace ?? ""}
              />
            </EditorPageIdProvider>
          ) : (
            !isReadOnly && (
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full active:scale-95"
                onClick={handleNewAction}
                title={t("createNewPage")}
                aria-label={t("createNewPage")}
              >
                <Plus className="size-4" />
              </Button>
            )
          ))}
      </nav>
    </>
  );
}
