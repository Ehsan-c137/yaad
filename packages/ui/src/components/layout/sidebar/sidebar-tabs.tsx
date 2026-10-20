import { Tabs, TabsList, TabsTrigger } from "@ui/tabs";
import { useSidebarStore } from "@yaad/core/store/use-sidebar-store";
import { Bookmark, House } from "lucide-react";
import { useTranslation } from "react-i18next";

import { styles } from "@/lib/design-token";
import { cn } from "@/lib/utils";

import { SidebarBookmarks } from "./bookmarks/bookmarks";
import { SidebarHome } from "./home/sidebar-home";

type Tab = "bookmarked" | "home";

export const SidebarTabs = () => {
  const { t } = useTranslation("sidebar");
  const activeTab = useSidebarStore((state) => state.sidebarTab);
  const setActiveTab = useSidebarStore((state) => state.setSidebarTab);
  const hasHydrated = useSidebarStore((state) => state._hasHydrated);

  const tabs = [
    {
      label: t("home"),
      value: "home" as const,
      icon: <House strokeWidth={1.5} className="size-3.5" />,
    },
    {
      label: t("bookmarked"),
      value: "bookmarked" as const,
      icon: <Bookmark strokeWidth={1.5} className="size-3.5" />,
    },
  ];

  return (
    <div className="flex min-h-0 flex-1 flex-col px-1">
      <div className="pt-2">
        {!hasHydrated ? (
          <div className={cn(styles.skeleton, "h-8 w-full rounded-xl")} />
        ) : (
          <Tabs
            value={activeTab}
            onValueChange={(val) => setActiveTab(val as Tab)}
            className="w-full px-0"
          >
            <TabsList variant="pill" className="w-full">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="gap-1.5"
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
};
