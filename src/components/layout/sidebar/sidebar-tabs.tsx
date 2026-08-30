import { Tabs, TabsList, TabsTrigger } from "@ui/tabs";
import { House, Inbox } from "lucide-react";
import dynamic from "next/dynamic";
import { useState } from "react";

import { styles } from "@/lib/design-token";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/store/use-sidebar-store";

import { SidebarHome } from "./home/sidebar-home";

const SidebarInbox = dynamic(() =>
  import("./inbox/sidebar-inbox").then((mod) => mod.SidebarInbox),
);

type Tab = "home" | "inbox";

const TABS = [
  {
    label: "Home",
    value: "home" as const,
    icon: <House strokeWidth={1.5} className="size-4" />,
  },
  {
    label: "Inbox",
    value: "inbox" as const,
    icon: <Inbox strokeWidth={1.5} className="size-4" />,
  },
];

export function SidebarTabs() {
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const hasHydrated = useSidebarStore((state) => state._hasHydrated);

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
              {TABS.map((tab) => (
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
        <div hidden={activeTab !== "inbox"} className="h-full">
          {activeTab === "inbox" && <SidebarInbox />}
        </div>
      </div>
    </div>
  );
}
