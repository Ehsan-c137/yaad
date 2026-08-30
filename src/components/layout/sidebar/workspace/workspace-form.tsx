import { Button } from "@ui/button";
import { Input } from "@ui/input";
import { Plus } from "lucide-react";
import { useState } from "react";

import { styles } from "@/lib/design-token";
import { cn } from "@/lib/utils";
import { useWorkspaceStore } from "@/store/use-workspace-store";

export function WorkspaceForm() {
  const [isCreating, setIsCreating] = useState(false);
  const [newWsName, setNewWsName] = useState("");
  const createWorkspace = useWorkspaceStore((state) => state.createWorkspace);

  const handleCancel = () => {
    setNewWsName("");
    setIsCreating(false);
  };

  const handleCreate = async (e: React.ChangeEvent) => {
    e.preventDefault();
    const trimmed = newWsName.trim();
    if (!trimmed) return;
    await createWorkspace(trimmed);
    setNewWsName("");
    setIsCreating(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
    }
  };

  return (
    <>
      {isCreating ? (
        <form onSubmit={handleCreate} className="flex flex-col gap-1.5 p-1">
          <Input
            type="text"
            value={newWsName}
            onChange={(e) => setNewWsName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Workspace name…"
            aria-label="Workspace name"
            autoFocus
            className={cn(styles.menuInput)}
          />
          <div className="flex justify-end gap-1">
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={handleCancel}
              className="text-white/60 hover:bg-white/8 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="xs"
              disabled={!newWsName.trim()}
              className="bg-(--accent-blue) text-white hover:opacity-90 disabled:opacity-50"
            >
              Create
            </Button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setIsCreating(true)}
          className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-foreground/70 transition-colors hover:bg-white/[0.07] hover:text-foreground"
        >
          <Plus className="size-3.5" />
          <span>New Workspace</span>
        </button>
      )}
    </>
  );
}
