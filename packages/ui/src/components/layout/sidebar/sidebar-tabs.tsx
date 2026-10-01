import { Tabs, TabsList, TabsTrigger } from "@ui/tabs";
import { useSidebarStore } from "@yaad/core/store/use-sidebar-store";
import { Bookmark, House } from "lucide-react";
import { useState } from "react";

import { useTranslation } from "react-i18next";

import { styles } from "@/lib/design-token";
import { cn } from "@/lib/utils";

import { SidebarBookmarks } from "./bookmarks/bookmarks";
import { SidebarHome } from "./home/sidebar-home";

type Tab = "bookmarked" | "home";

export function SidebarTabs() {
  const { t } = useTranslation("sidebar");
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const hasHydrated = useSidebarStore((state) => state._hasHydrated);

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

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="px-1 pt-2 pb-1">
        {!hasHydrated ? (
          <div className={cn(styles.skeleton, "h-9 w-full rounded-full")} />
        ) : (
          <Tabs
            value={activeTab}
            onValueChange={(val) => setActiveTab(val as Tab)}
            className="w-full"
          >
            <TabsList variant="segmented" className="w-full">
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

      <div className="min-h-0 flex-1 scroll-fade overflow-x-hidden overflow-y-auto pt-1">
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
