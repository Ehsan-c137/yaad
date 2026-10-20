import { Button } from "@ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@ui/dialog";
import { useCalendarStore } from "@yaad/core/store/use-calendar-store";
import { Calendar as CalendarIcon, Download, Globe } from "lucide-react";
import React, { useState } from "react";

import { GoogleLogo } from "./calendar-google-logo";
import { ConnectedProvidersTab } from "./providers/connected-providers-tab";
import { GoogleProviderTab } from "./providers/google-provider-tab";
import { IcalProviderTab } from "./providers/ical-provider-tab";
import { ImportExportTab } from "./providers/import-export-tab";

export { GoogleLogo };

export interface CalendarProviderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export type CalendarProviderTabType =
  "connected" | "google" | "ical" | "import-export";

interface ProviderTabDefinition {
  id: CalendarProviderTabType;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

export const CalendarProviderModal: React.FC<CalendarProviderModalProps> = ({
  isOpen,
  onClose,
}) => {
  const providers = useCalendarStore((s) => s.providers);
  const [activeTab, setActiveTab] = useState<CalendarProviderTabType>("google");

  if (!isOpen) return null;

  const tabs: ProviderTabDefinition[] = [
    {
      id: "google",
      label: "Google Calendar",
      icon: <GoogleLogo className="size-4" />,
    },
    {
      id: "ical",
      label: "iCal / Webcal Feed",
      icon: <Globe className="size-4 text-purple-500" />,
    },
    {
      id: "import-export",
      label: "Import & Export (.ics)",
      icon: <Download className="size-4 text-emerald-500" />,
    },
    {
      id: "connected",
      label: `Connected (${providers.length})`,
      icon: <CalendarIcon className="size-4 text-primary" />,
      badge: providers.length,
    },
  ];

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        className="max-w-xl p-0 gap-0 overflow-hidden rounded-3xl"
        showCloseButton={true}
      >
        {/* Header */}
        <DialogHeader className="border-b border-border/80 px-6 py-4">
          <DialogTitle className="text-base font-bold text-foreground">
            Calendar Integrations & Providers
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Sync Google Calendar, import .ics files, or subscribe to iCal feeds
          </DialogDescription>
        </DialogHeader>

        {/* Tab Navigation (Open/Closed & Extensible) */}
        <nav className="flex shrink-0 items-center gap-1 border-b border-border/60 bg-muted/40 px-6 py-2 overflow-x-auto">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <Button
                key={tab.id}
                type="button"
                variant={isActive ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setActiveTab(tab.id)}
                className={`gap-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-background text-foreground shadow-2xs"
                    : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </Button>
            );
          })}
        </nav>

        {/* Tab Contents */}
        <main className="flex-1 overflow-y-auto p-6 max-h-[60vh] scroll-fade">
          {activeTab === "google" && (
            <GoogleProviderTab onSuccess={() => setActiveTab("connected")} />
          )}

          {activeTab === "ical" && (
            <IcalProviderTab onSuccess={() => setActiveTab("connected")} />
          )}

          {activeTab === "import-export" && (
            <ImportExportTab onSuccess={() => setActiveTab("connected")} />
          )}

          {activeTab === "connected" && (
            <ConnectedProvidersTab
              onAddAnother={() => setActiveTab("google")}
            />
          )}
        </main>
      </DialogContent>
    </Dialog>
  );
};
