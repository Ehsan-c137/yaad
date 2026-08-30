import type { Dispatch, SetStateAction } from "react";

import { Button } from "@ui/button";
import { ChevronRight, Paintbrush } from "lucide-react";

import { styles } from "@/lib/design-token";
import { cn } from "@/lib/utils";

import { COLOR_OPTIONS } from "./menu-constant";

interface ColorMenuProps {
  isActive: boolean;
  setActiveSubmenu: Dispatch<SetStateAction<"color" | "turn_into" | null>>;
  handleApplyColor: (colorName: string) => void;
}

export function ColorMenu({
  isActive,
  setActiveSubmenu,
  handleApplyColor,
}: ColorMenuProps) {
  return (
    <div
      className="relative w-full"
      onMouseEnter={() => setActiveSubmenu("color")}
      onMouseLeave={() => !isActive && setActiveSubmenu(null)}
      onFocus={() => setActiveSubmenu("color")}
    >
      <Button
        variant="outline"
        className={cn(styles.menuItem, "w-full justify-between")}
        aria-haspopup="menu"
        aria-expanded={isActive}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            setActiveSubmenu("color");
          }
        }}
      >
        <div className="flex items-center gap-2">
          <Paintbrush className="size-3.5 text-muted-foreground" />
          <span>Color</span>
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
          tabIndex={0}
          role="menu"
          aria-label="Text color"
          onMouseLeave={() => setActiveSubmenu(null)}
          onKeyDown={(event) => {
            if (event.key === "Escape") setActiveSubmenu(null);
          }}
        >
          <div className={styles.sectionLabel}>Color</div>
          {COLOR_OPTIONS.map((c) => (
            <Button
              key={c.name}
              variant="outline"
              type="button"
              role="menuitem"
              onClick={() => handleApplyColor(c.name.toLowerCase())}
              className={cn(styles.menuItem, "w-full justify-start gap-2")}
            >
              <span
                className={cn(
                  "size-3.5 shrink-0 rounded-sm border border-border",
                  c.bgClass,
                )}
              />
              <span className={c.textClass}>{c.name}</span>
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
