/* eslint-disable perfectionist/sort-imports, @typescript-eslint/strict-void-return */
import { Button } from "@ui/button";
import { ROUTES } from "@yaad/core/constants/routes";
import { styles } from "@/lib/design-token";
import { useWorkspaceStore } from "@yaad/core/store/use-workspace-store";
import { Check, ChevronsUpDown, Settings2, Trash2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { toast } from "sonner";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

import { ManageWorkspacesModal } from "./manage-workspaces/manage-workspaces-modal";
import { WorkspaceForm } from "./workspace-form";

export function WorkspaceSwitcher() {
  const { t } = useTranslation(["sidebar", "common"]);
  const navigate = useNavigate();
  const workspaces = useWorkspaceStore((state) => state.workspaces);
  const activeWorkspaceId = useWorkspaceStore(
    (state) => state.activeWorkspaceId,
  );
  const setActiveWorkspace = useWorkspaceStore(
    (state) => state.setActiveWorkspace,
  );

  const deleteWorkspace = useWorkspaceStore((state) => state.deleteWorkspace);

  const [isOpen, setIsOpen] = useState(false);
  const [isManageOpen, setIsManageOpen] = useState(false);

  const handleDeleteWorkspace = async (
    e: React.MouseEvent,
    workspaceId: string,
  ) => {
    e.stopPropagation();
    const wasActive = workspaceId === activeWorkspaceId;
    const res = await deleteWorkspace(workspaceId);

    if (!res.success && res.error) {
      toast.error(res.error);
      return;
    }

    if (wasActive) {
      const nextActiveId = useWorkspaceStore.getState().activeWorkspaceId;

      if (nextActiveId) {
        void navigate(`/${ROUTES.workspace}/${nextActiveId}`);
      }
    }
  };

  const activeWorkspace = activeWorkspaceId
    ? workspaces[activeWorkspaceId]
    : null;

  if (!activeWorkspace)
    return (
      <p className="text-sm text-muted-foreground">{t("common:loading")}</p>
    );

  return (
    <>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger
          render={
            <Button
              variant="ghost"
              className={cn(
                "w-auto max-w-50 justify-between gap-2 p-1.5 text-start",
                "rounded-lg hover:bg-foreground/5",
              )}
            />
          }
        >
          <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-(--accent-blue-subtle) text-lg leading-none">
            {activeWorkspace.icon}
          </span>
          <span className="truncate text-sm font-semibold text-foreground">
            {activeWorkspace.name}
          </span>
          <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground" />
        </PopoverTrigger>

        <PopoverContent className="w-52 p-0">
          <div className={cn(styles.menu, "rounded-2xl p-1")}>
            <p
              className={cn(
                "px-2 py-1 text-[10px] font-semibold tracking-widest text-foreground uppercase",
              )}
              aria-hidden="true"
            >
              {t("sidebar:workspaces")}
            </p>

            <div
              role="listbox"
              aria-label={t("sidebar:workspaces")}
              className="flex max-h-48 flex-col gap-0.5 overflow-y-auto"
            >
              {Object.values(workspaces).map((ws) => (
                <WorkspaceSwitcherItem
                  key={ws.id}
                  ws={ws}
                  isActive={ws.id === activeWorkspaceId}
                  canDelete={Object.keys(workspaces).length > 1}
                  onSelect={async () => {
                    await setActiveWorkspace(ws.id);
                    void navigate(`/${ROUTES.workspace}/${ws.id}`);
                  }}
                  onKeyDown={async (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      await setActiveWorkspace(ws.id);
                    }
                  }}
                  onDelete={(e) => handleDeleteWorkspace(e, ws.id)}
                />
              ))}
            </div>

            <div className="my-1 h-px bg-white/8" />

            <WorkspaceForm />

            <div className="my-1 h-px bg-white/8" />

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setIsManageOpen(true);
              }}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-foreground/70 transition-colors hover:bg-white/[0.07] hover:text-foreground"
            >
              <Settings2 className="size-3.5" />
              <span>{t("sidebar:manageWorkspaces")}</span>
            </button>
          </div>
        </PopoverContent>
      </Popover>

      <ManageWorkspacesModal
        open={isManageOpen}
        onOpenChange={setIsManageOpen}
      />
    </>
  );
}

interface WorkspaceSwitcherItemProps {
  ws: Workspace;
  isActive: boolean;
  canDelete: boolean;
  onSelect: () => Promise<void>;
  onKeyDown: (e: React.KeyboardEvent) => Promise<void>;
  onDelete: (e: React.MouseEvent) => Promise<void>;
}

function WorkspaceSwitcherItem({
  ws,
  isActive,
  canDelete,
  onSelect,
  onKeyDown,
  onDelete,
}: WorkspaceSwitcherItemProps) {
  const { t } = useTranslation(["sidebar"]);

  return (
    <div
      role="option"
      tabIndex={0}
      aria-selected={isActive}
      className={cn(
        "group flex cursor-pointer items-center justify-between rounded-lg px-2 py-1.5 transition-colors",
        "duration-(--press-duration) ease-(--spring)",
        isActive
          ? "bg-white/10 text-foreground"
          : "text-foreground/80 hover:bg-white/[0.07]",
      )}
      onClick={onSelect}
      onKeyDown={onKeyDown}
    >
      <div className="flex min-w-0 items-center gap-2 truncate">
        <span className="text-base">{ws.icon}</span>
        <span className="truncate text-sm font-medium">{ws.name}</span>
      </div>
      <div className="flex items-center gap-1">
        {isActive && <Check className="size-3.5 text-(--accent-blue)" />}
        {canDelete && (
          <button
            type="button"
            onClick={onDelete}
            aria-label={t("sidebar:deleteWorkspace", {
              name: ws.name,
            })}
            className="rounded-sm p-0.5 text-white/30 opacity-0 transition-opacity group-hover:opacity-100 hover:text-red-400 focus-visible:opacity-100 focus-visible:outline-none"
          >
            <Trash2 className="size-3" />
          </button>
        )}
      </div>
    </div>
  );
}
