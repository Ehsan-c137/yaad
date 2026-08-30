import { Button } from "@ui/button";
import { Input } from "@ui/input";
import { useActionState, useState } from "react";
import { toast } from "sonner";

import { IconPickerPopover } from "@/components/shared/icon-picker-popover";
import { useWorkspaceStore } from "@/store/use-workspace-store";

const DEFAULT_NEW_ICON = "💼";

interface WorkspaceFormProps {
  onCancel?: () => void;
}

export function WorkspaceForm({ onCancel }: WorkspaceFormProps) {
  const [icon, setIcon] = useState(DEFAULT_NEW_ICON);
  const createWorkspace = useWorkspaceStore((state) => state.createWorkspace);

  const [, formAction, isPending] = useActionState(
    async (_prevState: unknown, formData: FormData) => {
      const name = (formData.get("name") as string)?.trim();
      if (!name) return;

      try {
        await createWorkspace(name, icon);
        toast.success(`Created "${name}"`);
        onCancel?.();
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to create workspace",
        );
      }
    },
    null,
  );

  return (
    <form action={formAction} className="flex items-center gap-2 p-1">
      <IconPickerPopover
        currentIcon={icon}
        onSelectIcon={setIcon}
        triggerAriaLabel="New workspace icon"
        triggerClassName="text-lg"
      >
        <span
          aria-hidden="true"
          className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-(--accent-blue-subtle) text-lg leading-none"
        >
          {icon}
        </span>
      </IconPickerPopover>

      <Input
        name="name"
        placeholder="Workspace name…"
        aria-label="New workspace name"
        className="h-8 min-w-0 flex-1"
        autoFocus
        onKeyDown={(e) => {
          if (e.key === "Escape") onCancel?.();
        }}
        disabled={isPending}
      />

      <Button type="submit" size="sm" loading={isPending}>
        Create
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onCancel}
        disabled={isPending}
      >
        Cancel
      </Button>
    </form>
  );
}
