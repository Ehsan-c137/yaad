"use client";

import { Button } from "@ui/button";
import { CheckCheck, Inbox, Sparkles, Trash2 } from "lucide-react";
import React from "react";

import type { InboxFilter } from "@/store/inbox/use-inbox-store";

import { styles } from "@/lib/design-token";
import { cn } from "@/lib/utils";
import { useInboxStore } from "@/store/inbox/use-inbox-store";

import { NotificationItem } from "./notification-item";

export function SidebarInbox() {
  const notifications = useInboxStore((state) => state.notifications);
  const filter = useInboxStore((state) => state.filter);
  const _hasHydrated = useInboxStore((state) => state._hasHydrated);
  const setFilter = useInboxStore((state) => state.setFilter);
  const markAllAsRead = useInboxStore((state) => state.markAllAsRead);
  const clearAll = useInboxStore((state) => state.clearAll);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const mentionsCount = notifications.filter(
    (n) => n.type === "mention",
  ).length;

  const filteredNotifications = notifications.filter((item) => {
    if (filter === "unread") return !item.read;
    if (filter === "mentions") return item.type === "mention";
    return true;
  });

  return (
    <div className="pointer-events-none relative flex h-full flex-col px-1 pb-4">
      <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-background/70">
        <p className="font-mono text-sm text-muted-foreground">
          Coming soon...
        </p>
      </div>
      <div className="flex items-center justify-between pt-2.5 pb-2">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              styles.sectionLabel,
              "text-xs font-semibold tracking-wider text-muted-foreground uppercase",
            )}
          >
            Notifications
          </span>
          {unreadCount > 0 && (
            <span className="inline-flex h-4 items-center justify-center rounded-full bg-(--accent-blue) px-1.5 text-[10px] font-semibold text-white">
              {unreadCount}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={() => markAllAsRead()}
              title="Mark all as read"
              aria-label="Mark all notifications as read"
              className="size-6 rounded-md text-muted-foreground hover:bg-foreground/10 hover:text-foreground"
            >
              <CheckCheck className="size-3.5" />
            </Button>
          )}
          {notifications.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={() => clearAll()}
              title="Clear all notifications"
              aria-label="Clear all notifications"
              className="size-6 rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="size-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Filter Pill Tabs */}
      <div className="mb-2.5 flex items-center gap-1 rounded-xl bg-foreground/4 p-1 dark:bg-white/6">
        <FilterButton
          active={filter === "all"}
          onClick={() => setFilter("all")}
          label="All"
          count={notifications.length}
        />
        <FilterButton
          active={filter === "unread"}
          onClick={() => setFilter("unread")}
          label="Unread"
          count={unreadCount}
          highlight={unreadCount > 0}
        />
        <FilterButton
          active={filter === "mentions"}
          onClick={() => setFilter("mentions")}
          label="Mentions"
          count={mentionsCount}
        />
      </div>

      {/* Skeleton Loading State */}
      {!_hasHydrated && (
        <div className="space-y-2 p-1">
          <div className={cn(styles.skeleton, "h-16 w-full rounded-xl")} />
          <div className={cn(styles.skeleton, "h-16 w-full rounded-xl")} />
          <div className={cn(styles.skeleton, "h-16 w-full rounded-xl")} />
        </div>
      )}

      {/* Empty State */}
      {_hasHydrated && filteredNotifications.length === 0 && (
        <div className="flex flex-1 flex-col items-center justify-center gap-2.5 px-4 py-12 text-center select-none">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-foreground/5 dark:bg-white/5">
            {filter === "unread" ? (
              <Sparkles className="size-5 text-muted-foreground/60" />
            ) : (
              <Inbox className="size-5 text-muted-foreground/60" />
            )}
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground/90">
              {filter === "unread"
                ? "All caught up!"
                : filter === "mentions"
                  ? "No mentions yet"
                  : "No notifications"}
            </p>
            <p className="max-w-[200px] text-xs/normal text-muted-foreground">
              {filter === "unread"
                ? "You have read all your notifications."
                : filter === "mentions"
                  ? "When team members @mention you, they will appear here."
                  : "New updates and activity will appear here."}
            </p>
          </div>
        </div>
      )}

      {/* Notification List */}
      {_hasHydrated && filteredNotifications.length > 0 && (
        <div className="space-y-1.5">
          {filteredNotifications.map((item) => (
            <NotificationItem key={item.id} notification={item} />
          ))}
        </div>
      )}
    </div>
  );
}

interface FilterButtonProps {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
  highlight?: boolean;
}

function FilterButton({
  active,
  onClick,
  label,
  count,
  highlight,
}: FilterButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-1 items-center justify-center gap-1 rounded-lg px-2 py-1 text-xs font-medium transition-all duration-150 select-none",
        active
          ? "bg-background font-semibold text-foreground shadow-2xs dark:bg-input/40"
          : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground",
      )}
    >
      <span>{label}</span>
      {count > 0 && (
        <span
          className={cn(
            "py-0.2 rounded-full px-1.5 text-[10px] leading-tight font-bold",
            active
              ? highlight
                ? "bg-(--accent-blue) text-white"
                : "bg-foreground/10 text-foreground"
              : highlight
                ? "bg-(--accent-blue-tint) text-(--accent-blue)"
                : "bg-foreground/5 text-muted-foreground",
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}
