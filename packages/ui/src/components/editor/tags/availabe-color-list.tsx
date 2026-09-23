import type { TagColor } from "@yaad/core/types/document";

import { Button } from "@ui/button";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

import { COLOR_OPTIONS } from "./tag-constants";

interface AvailableColorListProps {
  selectedColor: string;
  setSelectedColor: React.Dispatch<React.SetStateAction<TagColor>>;
}

export function AvailableColorList({
  selectedColor,
  setSelectedColor,
}: AvailableColorListProps) {
  return (
    <>
      <div className="text-[11px] font-medium text-muted-foreground">
        Select tag color:
      </div>
      <div className="flex flex-wrap gap-1">
        {COLOR_OPTIONS.map((c) => (
          <Button
            variant="outline"
            key={c.value}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedColor(c.value);
            }}
            onKeyDown={(e) => e.stopPropagation()}
            className={cn(
              "flex size-5 items-center justify-center rounded-full border transition-transform",
              c.colorClass,
              selectedColor === c.value
                ? "scale-110 ring-2 ring-primary ring-offset-1"
                : "opacity-75 hover:opacity-100",
            )}
            title={c.name}
          >
            {selectedColor === c.value && <Check className="size-3 stroke-3" />}
          </Button>
        ))}
      </div>
    </>
  );
}
