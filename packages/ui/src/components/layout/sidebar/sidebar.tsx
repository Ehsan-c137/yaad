"use client";

import type { CSSProperties } from "react";

import { WINDOW_HEADER_HEIGHT } from "@yaad/core/constants/sizes";
import { useSidebarStore } from "@yaad/core/store/use-sidebar-store";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { useSidebarToggle } from "@/hooks/sidebar/use-sidebar-toggle";
import { useMediaQuery } from "@/hooks/use-media-query";
import { usePageTransitionPreference } from "@/hooks/use-page-transition-preference";
import { styles } from "@/lib/design-token";
import { cn } from "@/lib/utils";

import { Profile } from "./profile/profile";
import { SidebarRail } from "./sidebar-rail";
import { SidebarTabs } from "./sidebar-tabs";
import { SidebarToggleButton } from "./sidebar-toggle-button";
import { WorkspaceSwitcher } from "./workspace/workspace-switch";

type AnimationPhase = "closing" | "idle" | "opening";

function useSidebarAnimation(
  isSidebarOpen: boolean,
  sidebarRef: React.RefObject<HTMLElement | null>,
  transitionsEnabled: boolean,
) {
  const isFirstRenderRef = useRef(true);
  const [animationPhase, setAnimationPhase] = useState<AnimationPhase>("idle");

  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return;
    }

    if (!transitionsEnabled) {
      setAnimationPhase("idle");
      return;
    }

    setAnimationPhase(isSidebarOpen ? "opening" : "closing");

    const timer = setTimeout(() => {
      setAnimationPhase("idle");
    }, 320);

    return () => clearTimeout(timer);
  }, [isSidebarOpen, transitionsEnabled]);

  const handleAnimationEnd = (event: React.AnimationEvent<HTMLElement>) => {
    if (event.target !== sidebarRef.current) return;
    setAnimationPhase("idle");
  };

  const isClosing = animationPhase === "closing";
  const isOpening = animationPhase === "opening";
  const isClosed = !isSidebarOpen && animationPhase === "idle";
  const isVisible = isSidebarOpen || isClosing;

  return {
    animationPhase,
    handleAnimationEnd,
    isClosed,
    isClosing,
    isOpening,
    isVisible,
  };
}

function SidebarBackdrop({
  isOpen,
  isVisible,
  onClose,
}: {
  isOpen: boolean;
  isVisible: boolean;
  onClose: () => void;
}) {
  if (!isVisible) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-40 bg-black/40 transition-opacity duration-300",
        isOpen ? "opacity-100" : "pointer-events-none opacity-0",
      )}
      onClick={onClose}
      aria-hidden="true"
    />
  );
}

function SidebarExpandedPanel({
  isClosing,
  isOpening,
}: {
  isClosing: boolean;
  isOpening: boolean;
}) {
  return (
    <div
      className={cn(
        "flex h-full w-[calc(100vw-2.25rem)] max-w-[16.25rem] shrink-0 flex-col overflow-x-hidden md:w-[16.25rem]",
        isClosing &&
          "absolute inset-y-0 start-0 z-10 p-2.5 sidebar-panel-animating-close pointer-events-none",
        isOpening && "sidebar-panel-animating-open",
      )}
    >
      <div className="flex items-center justify-between">
        <WorkspaceSwitcher />
        <SidebarToggleButton />
      </div>

      <SidebarTabs />

      <div>
        <Profile />
      </div>
    </div>
  );
}

function getSidebarClasses({
  isClosed,
  isClosing,
  isMobile,
  isOpening,
  isSidebarOpen,
  isVisible,
}: {
  isClosed: boolean;
  isClosing: boolean;
  isMobile: boolean;
  isOpening: boolean;
  isSidebarOpen: boolean;
  isVisible: boolean;
}) {
  if (isMobile) {
    return cn(
      isClosing && "sidebar-animating-close pointer-events-none p-0",
      isOpening && "sidebar-animating-open",
      isVisible ? "visible" : "pointer-events-none invisible",
      isSidebarOpen
        ? "w-[calc(100vw-1rem)] max-w-72 p-2.5 opacity-100 translate-x-0 scale-100"
        : isClosed &&
            "pointer-events-none -translate-x-full rtl:translate-x-full scale-90 p-0 opacity-0 w-0",
    );
  }

  return cn(
    "sidebar-desktop-transition visible opacity-100 translate-x-0 scale-100 md:me-2",
    isSidebarOpen ? "md:w-70 md:p-2.5" : "md:w-[3.25rem] md:p-1.5",
  );
}

export function Sidebar() {
  const { t } = useTranslation("sidebar");
  const isSidebarOpen = useSidebarStore((store) => store.isSidebarOpen);
  const toggleSidebar = useSidebarToggle();
  const { transitionsEnabled } = usePageTransitionPreference();

  const sidebarRef = useRef<HTMLElement>(null);
  const isMobile = useMediaQuery("(max-width: 640px)");

  const { handleAnimationEnd, isClosed, isClosing, isOpening, isVisible } =
    useSidebarAnimation(isSidebarOpen, sidebarRef, transitionsEnabled);

  const showExpandedPanel = isSidebarOpen || (isClosing && !isMobile);
  const showCollapsedRail = !isMobile && !isSidebarOpen;

  return (
    <>
      {isMobile && (
        <SidebarBackdrop
          isOpen={isSidebarOpen}
          isVisible={isVisible}
          onClose={toggleSidebar}
        />
      )}

      <aside
        ref={sidebarRef}
        aria-label={t("openSidebar")}
        data-state={isSidebarOpen ? "open" : "closed"}
        onAnimationEnd={handleAnimationEnd}
        style={
          {
            "--window-header-height": `${WINDOW_HEADER_HEIGHT}px`,
          } as CSSProperties
        }
        className={cn(
          styles.sidebar,
          "fixed top-2 start-2 z-50 flex h-[calc(100vh-1rem)] flex-col overflow-hidden rounded-2xl border border-border/80 bg-background/95 shadow-2xl origin-left rtl:origin-right will-change-[width,transform]",
          "md:relative md:z-20 md:top-auto md:start-auto md:h-full md:border-border/70 dark:md:border-white/[0.08] md:bg-card/75 dark:md:bg-sidebar/80 md:shadow-xs",
          getSidebarClasses({
            isClosed,
            isClosing,
            isMobile,
            isOpening,
            isSidebarOpen,
            isVisible,
          }),
        )}
      >
        {showCollapsedRail && (
          <div className="h-full w-full">
            <SidebarRail />
          </div>
        )}

        {showExpandedPanel && (
          <SidebarExpandedPanel
            isClosing={!isMobile && isClosing}
            isOpening={!isMobile && isOpening}
          />
        )}
      </aside>
    </>
  );
}
