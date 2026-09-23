import type { TagColor } from "@yaad/core/types/document";

import { Button } from "@ui/button";
import { Input } from "@ui/input";
import { Check, Trash2, X } from "lucide-react";

import { cn } from "@/lib/utils";

import { COLOR_OPTIONS } from "./tag-constants";

interface EditData {
  color: TagColor;
  name: string;
}

interface EditTagProps {
  tagId: string;
  editData: EditData;
  onEditData: (v: EditData) => void;
  onUpdateTag: (
    tagId: string,
    updates: { name: string; color: TagColor },
  ) => void;
  onDeleteTag: (id: string) => void;
  onClearEditingId: () => void;
}

export function EditTag({
  tagId,
  editData,
  onEditData,
  onUpdateTag,
  onDeleteTag,
  onClearEditingId,
}: EditTagProps) {
  const handleSaveEdit = () => {
    const trimmed = editData.name.trim();
    if (!trimmed) return;
    onUpdateTag(tagId, { name: trimmed, color: editData.color });
  };

  return (
    <div className="flex flex-col gap-2 rounded-md border p-2 bg-muted/40">
      <div className="flex items-center justify-between text-xs font-medium">
        <span>Edit Tag</span>
        <Button
          variant="ghost"
          size="xs"
          onClick={() => onClearEditingId()}
          className="h-5 w-5 p-0"
        >
          <X className="size-3" />
        </Button>
      </div>
      <Input
        value={editData.name}
        onChange={(e) => {
          onEditData({ ...editData, name: e.target.value });
        }}
        className="h-7 text-xs"
        placeholder="Tag name"
      />
      <div className="flex flex-wrap gap-1">
        {COLOR_OPTIONS.map((c) => (
          <Button
            key={c.value}
            variant="ghost"
            size="icon"
            onClick={() => onEditData({ ...editData, color: c.value })}
            className={cn(
              "flex size-4 items-center justify-center rounded-full border transition-transform",
              c.colorClass,
              editData.color === c.value
                ? "scale-110 ring-2 ring-primary ring-offset-1"
                : "opacity-75 hover:opacity-100",
            )}
            title={c.name}
          >
            {editData.color === c.value && (
              <Check className="size-2.5 stroke-3" />
            )}
          </Button>
        ))}
      </div>
      <div className="flex items-center justify-between pt-1">
        <Button
          variant="destructive"
          size="xs"
          onClick={() => onDeleteTag(tagId)}
          className="h-6 gap-1 text-[11px]"
        >
          <Trash2 className="size-3" />
          <span>Delete</span>
        </Button>
        <Button
          variant="default"
          size="xs"
          onClick={handleSaveEdit}
          className="h-6 gap-1 text-[11px]"
        >
          <Check className="size-3" />
          <span>Save</span>
        </Button>
      </div>
    </div>
  );
}
