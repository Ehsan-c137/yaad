import { Badge } from "@ui/badge";
import { Button } from "@ui/button";
import { useCalendarStore } from "@yaad/core/store/use-calendar-store";
import {
  AlertCircle,
  CheckCircle2,
  Globe,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";
import React, { useState } from "react";

import { GoogleLogo } from "../calendar-google-logo";

interface ConnectedProvidersTabProps {
  onAddAnother: () => void;
}

export const ConnectedProvidersTab: React.FC<ConnectedProvidersTabProps> = ({
  onAddAnother,
}) => {
  const providers = useCalendarStore((s) => s.providers);
  const syncProviderConnection = useCalendarStore(
    (s) => s.syncProviderConnection,
  );
  const syncAllProviders = useCalendarStore((s) => s.syncAllProviders);
  const removeProvider = useCalendarStore((s) => s.removeProvider);

  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [syncingId, setSyncingId] = useState<string | null>(null);

  const handleSyncAll = async () => {
    setIsSyncingAll(true);

    try {
      await syncAllProviders();
    } finally {
      setIsSyncingAll(false);
    }
  };

  const handleSyncOne = async (id: string) => {
    setSyncingId(id);

    try {
      await syncProviderConnection(id);
    } finally {
      setSyncingId(null);
    }
  };

  if (providers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <Globe className="size-6" />
        </div>
        <span className="text-sm font-semibold text-foreground">
          No External Calendars Connected
        </span>
        <p className="max-w-xs text-xs text-muted-foreground">
          Connect your Google Calendar or Webcal feed to automatically keep your
          schedules synchronized.
        </p>
        <Button
          type="button"
          variant="default"
          size="sm"
          onClick={onAddAnother}
          className="mt-2 gap-2 rounded-xl text-xs font-semibold"
        >
          <Plus className="size-3.5" />
          <span>Connect a Calendar</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Badge variant="secondary" className="text-xs font-medium">
          {providers.length} {providers.length === 1 ? "provider" : "providers"}{" "}
          connected
        </Badge>

        <Button
          type="button"
          variant="outline"
          size="xs"
          onClick={() => {
            void handleSyncAll();
          }}
          disabled={isSyncingAll}
          className="gap-1.5 text-xs font-medium"
        >
          <RefreshCw
            className={`size-3 text-muted-foreground ${isSyncingAll ? "animate-spin" : ""}`}
          />
          <span>{isSyncingAll ? "Syncing All..." : "Sync All"}</span>
        </Button>
      </div>

      <div className="flex flex-col gap-2.5">
        {providers.map((p) => {
          const isThisSyncing =
            syncingId === p.id || p.syncStatus === "syncing";

          return (
            <div
              key={p.id}
              className="flex items-center justify-between rounded-2xl border border-border bg-card p-3.5 shadow-2xs transition-colors hover:border-border/80"
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex size-9 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `${p.color}15` }}
                >
                  {p.provider === "google" ? (
                    <GoogleLogo className="size-5" />
                  ) : (
                    <Globe className="size-5" style={{ color: p.color }} />
                  )}
                </div>

                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">
                      {p.name}
                    </span>
                    <span
                      className="size-2 rounded-full"
                      style={{ backgroundColor: p.color }}
                    />
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {p.accountEmail && <span>{p.accountEmail}</span>}
                    {p.lastSyncedAt && (
                      <span>
                        · Synced{" "}
                        {new Date(p.lastSyncedAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {/* Status indicator */}
                {p.syncStatus === "success" && (
                  <span
                    title="Connected & synced"
                    className="flex items-center px-1"
                  >
                    <CheckCircle2 className="size-4 text-emerald-500" />
                  </span>
                )}
                {p.syncStatus === "error" && (
                  <span
                    title={p.errorMessage ?? "Sync error"}
                    className="flex items-center px-1"
                  >
                    <AlertCircle className="size-4 text-destructive" />
                  </span>
                )}

                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => void handleSyncOne(p.id)}
                  disabled={isThisSyncing}
                  className="text-muted-foreground hover:text-foreground"
                  title="Sync now"
                >
                  <RefreshCw
                    className={`size-3.5 ${isThisSyncing ? "animate-spin" : ""}`}
                  />
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => removeProvider(p.id)}
                  className="text-muted-foreground hover:bg-destructive/15 hover:text-destructive"
                  title="Remove provider"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onAddAnother}
        className="mt-2 w-full border-dashed gap-1.5 text-xs font-semibold"
      >
        <Plus className="size-3.5" />
        <span>Connect Another Provider</span>
      </Button>
    </div>
  );
};
