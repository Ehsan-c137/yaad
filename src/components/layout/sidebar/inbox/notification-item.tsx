"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@ui/avatar";
import { Button } from "@ui/button";
import {
  AtSign,
  Check,
  Clock,
  Dot,
  FileText,
  MessageSquare,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

import type { NotificationItem as NotificationItemType } from "@/store/inbox/use-inbox-store";

import { ROUTES } from "@/constants/routes";
import { formatRelativeTime } from "@/lib/date-formatter";
import { styles } from "@/lib/design-token";
import { cn } from "@/lib/utils";
import { useInboxStore } from "@/store/inbox/use-inbox-store";
import { useTabStore } from "@/store/use-tab-store";
import { useWorkspaceStore } from "@/store/use-workspace-store";

interface NotificationItemProps {
  notification: NotificationItemType;
}

export function NotificationItem({ notification }: NotificationItemProps) {
  const router = useRouter();
  const markAsRead = useInboxStore((s) => s.markAsRead);
  const toggleRead = useInboxStore((s) => s.toggleRead);
  const deleteNotification = useInboxStore((s) => s.deleteNotification);
  const openTab = useTabStore((s) => s.openTab);
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);

  const handleClick = () => {
    markAsRead(notification.id);

    if (notification.pageId && activeWorkspaceId) {
      openTab({
        pageId: notification.pageId,
        workspaceId: activeWorkspaceId,
        title: notification.targetTitle ?? "Untitled",
      });
      router.push(
        `/${ROUTES.workspace}/${activeWorkspaceId}/${notification.pageId}`,
      );
    }
  };

  const handleToggleRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleRead(notification.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteNotification(notification.id);
  };

  return (
    <div
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
      className={cn(
        "group relative flex w-full cursor-pointer flex-col gap-1.5 rounded-xl p-2.5 text-left select-none",
        "border border-transparent transition-all duration-200 ease-(--spring)",
        styles.spring,
        notification.read
          ? "bg-transparent text-muted-foreground hover:bg-foreground/4 dark:hover:bg-white/5"
          : "bg-foreground/3 text-foreground shadow-2xs hover:bg-foreground/6 dark:bg-white/4 dark:hover:bg-white/8",
      )}
    >
      <div className="flex items-start gap-2.5">
        {/* Left Icon / Avatar */}
        <div className="relative shrink-0 pt-0.5">
          {notification.author ? (
            <Avatar size="sm" className="size-7">
              {notification.author.avatar && (
                <AvatarImage
                  src={notification.author.avatar}
                  alt={notification.author.name}
                />
              )}
              <AvatarFallback className="bg-foreground/10 text-[10px] font-medium text-foreground">
                {notification.author.initials ??
                  notification.author.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          ) : (
            <TypeIcon type={notification.type} />
          )}

          {!notification.read && (
            <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-(--accent-blue) ring-2 ring-background" />
          )}
        </div>

        {/* Content Details */}
        <div className="min-w-0 flex-1 space-y-0.5">
          <div className="flex items-start justify-between gap-1">
            <h4
              className={cn(
                "line-clamp-1 text-xs/tight font-medium",
                !notification.read && "font-semibold text-foreground",
              )}
            >
              {notification.title}
            </h4>
            <span className="shrink-0 text-[10px] text-muted-foreground/70">
              {formatRelativeTime(notification.createdAt)}
            </span>
          </div>

          <p className="line-clamp-2 text-xs/normal text-muted-foreground/90">
            {notification.description}
          </p>

          {notification.targetTitle && (
            <div className="pt-0.5">
              <span className="inline-flex items-center gap-1 rounded-md bg-foreground/5 px-1.5 py-0.5 text-[10px] font-medium text-foreground/80 dark:bg-white/10">
                <FileText className="size-2.5 opacity-60" />
                <span className="max-w-[150px] truncate">
                  {notification.targetTitle}
                </span>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Hover Action Buttons */}
      <div
        className={cn(
          "absolute top-2 right-2 hidden items-center gap-0.5 rounded-lg border border-border/50 bg-background/90 p-0.5 shadow-xs backdrop-blur-xs group-hover:flex",
        )}
      >
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={handleToggleRead}
          title={notification.read ? "Mark as unread" : "Mark as read"}
          aria-label={notification.read ? "Mark as unread" : "Mark as read"}
          className="size-5 rounded-md text-muted-foreground hover:bg-foreground/10 hover:text-foreground"
        >
          {notification.read ? (
            <Dot className="size-3.5 text-muted-foreground" />
          ) : (
            <Check className="size-3 text-(--accent-blue)" />
          )}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={handleDelete}
          title="Delete notification"
          aria-label="Delete notification"
          className="size-5 rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="size-3" />
        </Button>
      </div>
    </div>
  );
}

function TypeIcon({ type }: { type: NotificationItemType["type"] }) {
  switch (type) {
    case "mention":
      return (
        <div className="flex size-7 items-center justify-center rounded-full bg-blue-500/10 text-blue-500 dark:bg-blue-500/20">
          <AtSign className="size-3.5" />
        </div>
      );

    case "page_update":
      return (
        <div className="flex size-7 items-center justify-center rounded-full bg-sky-500/10 text-sky-500 dark:bg-sky-500/20">
          <FileText className="size-3.5" />
        </div>
      );

    case "comment":
      return (
        <div className="flex size-7 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/20">
          <MessageSquare className="size-3.5" />
        </div>
      );

    case "system":
      return (
        <div className="flex size-7 items-center justify-center rounded-full bg-purple-500/10 text-purple-500 dark:bg-purple-500/20">
          <Sparkles className="size-3.5" />
        </div>
      );

    case "reminder":
      return (
        <div className="flex size-7 items-center justify-center rounded-full bg-amber-500/10 text-amber-500 dark:bg-amber-500/20">
          <Clock className="size-3.5" />
        </div>
      );
  }
}
