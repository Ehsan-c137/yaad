"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@ui/alert-dialog";
import { Button } from "@ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@ui/dialog";
import { Plus, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import type { Workspace } from "@/types/workspace";

import { useWorkspaceStore } from "@/store/use-workspace-store";

import { WorkspaceForm } from "../workspace-form";
import { WorkspaceRow } from "./workspace-row";

const DEFAULT_NEW_ICON = "💼";

export interface ManageWorkspacesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ManageWorkspacesModal({
  open,
  onOpenChange,
}: ManageWorkspacesModalProps) {
  const workspaces = useWorkspaceStore((state) => state.workspaces);

  const deleteWorkspace = useWorkspaceStore((state) => state.deleteWorkspace);
  const updateWorkspace = useWorkspaceStore((state) => state.updateWorkspace);

  const [deletingWorkspace, setDeletingWorkspace] = useState<Workspace | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const newNameInputRef = useRef<HTMLInputElement>(null);

  const workspaceList = Object.values(workspaces).sort(
    (a, b) => a.createdAt - b.createdAt,
  );
  const canDelete = workspaceList.length > 1;

  useEffect(() => {
    if (isCreating) {
      newNameInputRef.current?.focus();
    }
  }, [isCreating]);

  const handleRename = (ws: Workspace, name: string) => {
    void updateWorkspace(ws.id, { name });
  };

  const handleSelectIcon = (ws: Workspace, icon: string) => {
    if (icon === ws.icon) return;
    void updateWorkspace(ws.id, { icon });
  };

  const handleConfirmDelete = async () => {
    if (!deletingWorkspace) return;
    setIsDeleting(true);

    try {
      await deleteWorkspace(deletingWorkspace.id);
      toast.success(`Deleted "${deletingWorkspace.name}"`);
      setDeletingWorkspace(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          id="manage-workspaces-modal"
          className="max-w-sm gap-0 overflow-hidden p-0"
          aria-labelledby="manage-workspaces-modal-title"
        >
          <DialogHeader className="gap-1 border-b border-border/50 px-5 pt-5 pb-4">
            <DialogTitle
              id="manage-workspaces-modal-title"
              className="text-center text-sm font-semibold tracking-tight"
            >
              Manage Workspaces
            </DialogTitle>
            <DialogDescription className="text-center text-xs/snug text-muted-foreground">
              Rename, pick an icon, or remove your workspaces.
            </DialogDescription>
          </DialogHeader>

          <div
            role="list"
            aria-label="Workspaces"
            className="flex max-h-72 flex-col gap-0.5 overflow-y-auto p-2"
          >
            {workspaceList.map((ws) => (
              <WorkspaceRow
                key={ws.id}
                workspace={ws}
                canDelete={canDelete}
                onRename={(name) => handleRename(ws, name)}
                onSelectIcon={(icon) => handleSelectIcon(ws, icon)}
                onRequestDelete={() => setDeletingWorkspace(ws)}
              />
            ))}
          </div>

          <div className="border-t border-border/50 p-2">
            {isCreating ? (
              <WorkspaceForm />
            ) : (
              <Button
                variant="ghost"
                onClick={() => setIsCreating(true)}
                className="w-full justify-start gap-2"
              >
                <Plus className="size-4" />
                New Workspace
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deletingWorkspace}
        onOpenChange={(isOpen) => !isOpen && setDeletingWorkspace(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive">
              <Trash2 className="size-7" />
            </AlertDialogMedia>
            <AlertDialogTitle>
              Delete “{deletingWorkspace?.name}”?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the workspace and all of its pages. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              loading={isDeleting}
              onClick={handleConfirmDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
