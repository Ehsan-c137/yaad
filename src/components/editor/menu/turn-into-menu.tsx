import type { Dispatch, SetStateAction } from "react";

import { ChevronRight, Repeat } from "lucide-react";

import type { DocumentBlockType as BlockType } from "@/types/document";

import { Button } from "@/components/ui/button";
import { styles } from "@/lib/design-token";
import { cn } from "@/lib/utils";
import { useDocumentStore } from "@/store/document/use-document-store";

import { SLASH_OPTIONS } from "../slash-menu/slash-options";

interface TurnIntoMenuProps {
  isActive: boolean;
  setActiveSubmenu: Dispatch<SetStateAction<"color" | "turn_into" | null>>;
  onClose: () => void;
  blockId: string;
}

export function TurnIntoMenu({
  isActive,
  setActiveSubmenu,
  onClose,
  blockId,
}: TurnIntoMenuProps) {
  const changeBlockType = useDocumentStore((state) => state.changeBlockType);

  const handleTurnInto = (type: BlockType) => {
    changeBlockType(blockId, type);
    onClose();
  };

  return (
    <div
      className="relative w-full"
      onMouseEnter={() => setActiveSubmenu("turn_into")}
      onMouseLeave={() => !isActive && setActiveSubmenu(null)}
      onFocus={() => setActiveSubmenu("turn_into")}
    >
      <Button
        variant="outline"
        className={cn(styles.menuItem, "w-full justify-between")}
        aria-haspopup="menu"
        aria-expanded={isActive}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            setActiveSubmenu("turn_into");
          }
        }}
      >
        <div className="flex items-center gap-2">
          <Repeat className="size-3.5 text-muted-foreground" />
          <span>Turn into</span>
        </div>
        <ChevronRight
          className={cn(
            "size-3.5 text-muted-foreground transition-transform duration-(--press-duration)",
            isActive && "rotate-90",
          )}
        />
      </Button>

      {isActive && (
        <div
          className={cn(
            styles.menu,
            "absolute top-0 left-full z-50 ml-1 max-h-64 w-48 overflow-y-auto p-1",
          )}
          role="menu"
          tabIndex={0}
          aria-label="Turn block into"
          onMouseLeave={() => setActiveSubmenu(null)}
          onKeyDown={(event) => {
            if (event.key === "Escape") setActiveSubmenu(null);
          }}
        >
          {SLASH_OPTIONS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.type}
                type="button"
                role="menuitem"
                onClick={() => handleTurnInto(item.type)}
                className={cn(styles.menuItem, "w-full justify-start gap-2")}
              >
                <Icon className="size-3.5 text-muted-foreground" />
                <span>{item.title}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
