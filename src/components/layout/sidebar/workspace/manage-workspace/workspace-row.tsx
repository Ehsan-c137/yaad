"use client";

import { Input } from "@ui/input";
import { Pencil, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import type { Workspace } from "@/types/workspace";

import { IconPickerPopover } from "@/components/shared/icon-picker-popover";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/date-formatter";
import { cn } from "@/lib/utils";

interface WorkspaceRowProps {
  workspace: Workspace;
  canDelete: boolean;
  onRename: (name: string) => void;
  onSelectIcon: (icon: string) => void;
  onRequestDelete: () => void;
}

export function WorkspaceRow({
  workspace,
  canDelete,
  onRename,
  onSelectIcon,
  onRequestDelete,
}: WorkspaceRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftName, setDraftName] = useState(workspace.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDraftName(workspace.name);
  }, [workspace.name]);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const commitName = () => {
    const trimmed = draftName.trim();
    setIsEditing(false);

    if (!trimmed || trimmed === workspace.name) {
      setDraftName(workspace.name);
      return;
    }

    onRename(trimmed);
  };

  return (
    <div
      className={cn(
        "group flex items-center gap-2 rounded-xl px-2 py-1.5",
        "transition-colors duration-(--press-duration)",
        "hover:bg-foreground/4",
      )}
    >
      <IconPickerPopover
        currentIcon={workspace.icon}
        onSelectIcon={onSelectIcon}
        triggerAriaLabel={`Change icon for ${workspace.name}`}
        triggerClassName="text-lg"
      >
        <span
          aria-hidden="true"
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-lg bg-(--accent-blue-subtle) text-lg leading-none",
            "transition-transform duration-(--press-duration) ease-(--spring)",
            "group-hover:scale-110",
          )}
        >
          {workspace.icon}
        </span>
      </IconPickerPopover>

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        {isEditing ? (
          <Input
            ref={inputRef}
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            onBlur={commitName}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commitName();
              } else if (e.key === "Escape") {
                e.preventDefault();
                setDraftName(workspace.name);
                setIsEditing(false);
              }
            }}
            aria-label="Workspace name"
            className="h-7 rounded-lg text-sm"
          />
        ) : (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="truncate rounded-sm text-start text-sm font-medium text-foreground"
          >
            {workspace.name}
          </button>
        )}

        <span className="text-xs text-muted-foreground">
          Updated {formatDate(workspace.updatedAt)}
        </span>
      </div>

      <div
        className={cn(
          "flex shrink-0 items-center gap-0.5",
          "opacity-0 transition-opacity duration-(--press-duration)",
          "group-focus-within:opacity-100 group-hover:opacity-100",
        )}
      >
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label={`Rename ${workspace.name}`}
          onClick={() => setIsEditing(true)}
        >
          <Pencil className="size-3" />
        </Button>
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label={`Delete ${workspace.name}`}
          disabled={!canDelete}
          onClick={onRequestDelete}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="size-3" />
        </Button>
      </div>
    </div>
  );
}
