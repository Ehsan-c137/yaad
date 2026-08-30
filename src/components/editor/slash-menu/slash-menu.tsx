"use client";

import { Button } from "@ui/button";
import { useEffect, useRef, useState } from "react";

import { styles } from "@/lib/design-token";
import { cn } from "@/lib/utils";

import type { SlashOption } from "./slash-options";

import { SLASH_OPTIONS } from "./slash-options";

interface SlashMenuProps {
  position: { top: number; left: number };
  query: string;
  onSelect: (option: SlashOption) => void;
  onClose: () => void;
}

export function SlashMenu({
  position,
  query,
  onSelect,
  onClose,
}: SlashMenuProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

  const filteredOptions = SLASH_OPTIONS.filter(
    (option) =>
      option.title.toLowerCase().includes(query.toLowerCase()) ||
      option.description.toLowerCase().includes(query.toLowerCase()),
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (menuRef.current) {
      const selectedItem = menuRef.current.querySelector(
        `#slash-option-${selectedIndex}`,
      );

      if (selectedItem) {
        selectedItem.scrollIntoView({ block: "nearest" });
      }
    }
  }, [selectedIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (filteredOptions.length === 0) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredOptions.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev === 0 ? filteredOptions.length - 1 : prev - 1,
        );
      } else if (e.key === "Enter") {
        e.preventDefault();
        onSelect(filteredOptions[selectedIndex]);
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [filteredOptions, selectedIndex, onSelect, onClose]);

  if (filteredOptions.length === 0) return null;

  return (
    <div
      ref={menuRef}
      style={{ top: `${position.top}px`, left: `${position.left}px` }}
      className={cn(
        styles.menu,
        "fixed z-50 max-h-80 w-72 overflow-y-auto p-1 text-sm select-none",
      )}
    >
      <div className={cn(styles.sectionLabel, "justify-start text-start")}>
        Basic blocks
      </div>
      {filteredOptions.map((option, index) => {
        const Icon = option.icon;
        const isSelected = index === selectedIndex;

        return (
          <Button
            id={`slash-option-${index}`}
            type="button"
            key={option.id}
            variant="ghost"
            onClick={() => onSelect(option)}
            onMouseEnter={() => setSelectedIndex(index)}
            className={cn(
              styles.listRow,
              "h-auto w-full justify-start gap-2.5 py-1.5 text-left",
              isSelected && styles.listRowActive,
            )}
          >
            <div className="flex size-7 items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground">
              <Icon className="size-4" />
            </div>
            <div className="flex min-w-0 flex-col">
              <span className="text-xs/tight font-medium">{option.title}</span>
              <span className="truncate text-[11px] text-muted-foreground">
                {option.description}
              </span>
            </div>
          </Button>
        );
      })}
    </div>
  );
}
