import { Tabs, TabsList, TabsTrigger } from "@ui/tabs";
import { useSidebarStore } from "@yaad/core/store/use-sidebar-store";
import { Bookmark, House } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { usePageTransitionPreference } from "@/hooks/use-page-transition-preference";
import { styles } from "@/lib/design-token";
import { cn } from "@/lib/utils";

import { SidebarBookmarks } from "./bookmarks/bookmarks";
import { SidebarHome } from "./home/sidebar-home";

type Tab = "bookmarked" | "home";

export function SidebarTabs() {
  const { t } = useTranslation("sidebar");
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const hasHydrated = useSidebarStore((state) => state._hasHydrated);
  const { transitionsEnabled } = usePageTransitionPreference();

  const pillRef = useRef<HTMLSpanElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const isMounted = useRef(false);

  const tabs = [
    {
      label: t("home"),
      value: "home" as const,
      icon: <House strokeWidth={1.5} className="size-4" />,
    },
    {
      label: t("bookmarked"),
      value: "bookmarked" as const,
      icon: <Bookmark strokeWidth={1.5} className="size-4" />,
    },
  ];

  const activeIndex = tabs.findIndex((tab) => tab.value === activeTab);

  const moveTo = (idx: number, animate: boolean) => {
    const tab = tabRefs.current[idx];
    const pill = pillRef.current;
    if (!tab || !pill) return false;

    const left = tab.offsetLeft;
    const top = tab.offsetTop;
    const width = tab.offsetWidth;
    const height = tab.offsetHeight;

    if (!animate) {
      const prev = pill.style.transition;
      pill.style.transition = "none";
      pill.style.transform = `translate(${left}px, ${top}px)`;
      pill.style.width = `${width}px`;
      pill.style.height = `${height}px`;
      void pill.offsetWidth; // force reflow
      pill.style.transition = prev;
    } else {
      pill.style.transform = `translate(${left}px, ${top}px)`;
      pill.style.width = `${width}px`;
      pill.style.height = `${height}px`;
    }

    return true;
  };

  useEffect(() => {
    if (activeIndex === -1) return;

    if (!isMounted.current) {
      const id = window.requestAnimationFrame(() => {
        const success = moveTo(activeIndex, false);
        if (success) isMounted.current = true;
      });
      return () => window.cancelAnimationFrame(id);
    } else {
      moveTo(activeIndex, transitionsEnabled);
    }
  }, [activeIndex, hasHydrated, transitionsEnabled]);

  useEffect(() => {
    const onResize = () => moveTo(activeIndex, false);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [activeIndex]);

  return (
    <div className="flex min-h-0 flex-1 flex-col px-1">
      <div className="pt-2">
        {!hasHydrated ? (
          <div className={cn(styles.skeleton, "h-9 w-full rounded-full")} />
        ) : (
          <Tabs
            value={activeTab}
            onValueChange={(val) => setActiveTab(val as Tab)}
            className="w-full px-0"
          >
            <TabsList variant="segmented" className="relative w-full">
              <span
                ref={pillRef}
                className="pointer-events-none absolute left-0 top-0 z-0 rounded-full bg-background shadow-xs transition-all duration-300 ease-out will-change-transform dark:bg-secondary/90 motion-reduce:transition-none"
                aria-hidden="true"
              />
              {tabs.map((tab, i) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  ref={(el) => {
                    tabRefs.current[i] = el;
                  }}
                  className="relative z-10 gap-1.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none dark:data-[state=active]:bg-transparent motion-reduce:transition-none"
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        )}
      </div>

      <div className="scroll-fade min-h-0 flex-1 overflow-x-hidden overflow-y-auto pt-1">
        <div hidden={activeTab !== "home"} className="h-full">
          <SidebarHome />
        </div>
        <div hidden={activeTab !== "bookmarked"} className="h-full">
          {activeTab === "bookmarked" && <SidebarBookmarks />}
        </div>
      </div>
    </div>
  );
}
