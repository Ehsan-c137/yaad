"use client";

import { Button } from "@ui/button";
import { Check, ChevronsUpDown, Settings2, Trash2 } from "lucide-react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ROUTES } from "@/constants/routes";
import { styles } from "@/lib/design-token";
import { cn } from "@/lib/utils";
import { useWorkspaceStore } from "@/store/use-workspace-store";

import { WorkspaceForm } from "./workspace-form";

const ManageWorkspacesModal = dynamic(
  () =>
    import("./manage-workspace/manage-workspaces-modal").then(
      (m) => m.ManageWorkspacesModal,
    ),
  { ssr: false },
);

export function WorkspaceSwitcher() {
  const router = useRouter();
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

  const activeWorkspace = activeWorkspaceId
    ? workspaces[activeWorkspaceId]
    : null;

  if (!activeWorkspace)
    return <p className="text-sm text-muted-foreground">Loading…</p>;

  return (
    <>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger
          render={
            <Button
              variant="ghost"
              className={cn(
                "w-auto max-w-45 justify-between gap-2 p-1.5 text-left",
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
              Workspaces
            </p>

            <div
              role="listbox"
              aria-label="Workspaces"
              className="flex max-h-48 flex-col gap-0.5 overflow-y-auto"
            >
              {Object.values(workspaces).map((ws) => (
                <div
                  key={ws.id}
                  role="option"
                  tabIndex={0}
                  aria-selected={ws.id === activeWorkspaceId}
                  className={cn(
                    "group flex cursor-pointer items-center justify-between rounded-lg px-2 py-1.5 transition-colors",
                    "duration-(--press-duration) ease-(--spring)",
                    ws.id === activeWorkspaceId
                      ? "bg-white/10 text-foreground"
                      : "text-foreground/80 hover:bg-white/[0.07]",
                  )}
                  onClick={async () => {
                    await setActiveWorkspace(ws.id);
                    router.push(`/${ROUTES.workspace}/${ws.id}`);
                  }}
                  onKeyDown={async (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      await setActiveWorkspace(ws.id);
                    }
                  }}
                >
                  <div className="flex min-w-0 items-center gap-2 truncate">
                    <span className="text-base">{ws.icon}</span>
                    <span className="truncate text-sm font-medium">
                      {ws.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {ws.id === activeWorkspaceId && (
                      <Check className="size-3.5 text-(--accent-blue)" />
                    )}
                    {Object.keys(workspaces).length > 1 && (
                      <button
                        type="button"
                        onClick={async (e) => {
                          e.stopPropagation();
                          await deleteWorkspace(ws.id);
                        }}
                        aria-label={`Delete workspace ${ws.name}`}
                        className="rounded-sm p-0.5 text-white/30 opacity-0 transition-opacity group-hover:opacity-100 hover:text-red-400 focus-visible:opacity-100 focus-visible:outline-none"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    )}
                  </div>
                </div>
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
              <span>Manage Workspaces</span>
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
