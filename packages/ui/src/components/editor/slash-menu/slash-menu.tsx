import { Button } from "@ui/button";
import { styles } from "@yaad/core/lib/design-token";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";

import type { SlashOption } from "./slash-options";

import { SLASH_OPTION_KEYS, SLASH_OPTIONS } from "./slash-options";

interface SlashMenuProps {
  position: { top: number; left: number; anchorTop: number };
  query: string;
  onSelect: (option: SlashOption) => void;
  onClose: () => void;
}

/** Minimum height (px) before we give up constraining and just flip. */
const MIN_VISIBLE_HEIGHT = 120;
/** Default maximum height matching Tailwind's max-h-80 (320px). */
const DEFAULT_MAX_HEIGHT = 320;
/** Gap (px) kept between the menu edge and the viewport edge. */
const VIEWPORT_PADDING = 8;
/** Gap (px) between the menu and the cursor anchor line. */
const ANCHOR_GAP = 6;

export function SlashMenu({
  position,
  query,
  onSelect,
  onClose,
}: SlashMenuProps) {
  const { t } = useTranslation("editor");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);
  const isKeyboardNavRef = useRef(false);
  const [isKeyboardNav, setIsKeyboardNav] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [layout, setLayout] = useState<{
    top: number;
    left: number;
    maxHeight: number;
    transformOrigin: string;
  } | null>(null);

  const translatedOptions = useMemo(() => {
    return SLASH_OPTIONS.map((opt) => ({
      ...opt,
      title: t(SLASH_OPTION_KEYS[opt.id]?.titleKey ?? opt.id, {
        defaultValue: opt.title,
      }),
      description: t(SLASH_OPTION_KEYS[opt.id]?.descKey ?? opt.id, {
        defaultValue: opt.description,
      }),
    }));
  }, [t]);

  const filteredOptions = translatedOptions.filter(
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

  useLayoutEffect(() => {
    if (!menuRef.current) return;

    const viewportH = window.innerHeight;
    const viewportW = window.innerWidth;
    const menuRect = menuRef.current.getBoundingClientRect();
    const menuH = menuRect.height || menuRef.current.offsetHeight || 280;
    const menuW = menuRect.width || menuRef.current.offsetWidth || 288;

    let { top } = position;
    let { left } = position;
    let maxHeight = DEFAULT_MAX_HEIGHT;
    let originY = "top";

    const spaceBelow = viewportH - position.top - VIEWPORT_PADDING;
    const spaceAbove = position.anchorTop - VIEWPORT_PADDING;

    if (menuH > spaceBelow && spaceAbove > spaceBelow) {
      // More room above → flip the menu upward
      const constrainedH = Math.min(DEFAULT_MAX_HEIGHT, spaceAbove);
      top = position.anchorTop - Math.min(menuH, constrainedH) - ANCHOR_GAP;
      maxHeight = constrainedH;
      originY = "bottom";
    } else {
      // Keep below; constrain maxHeight if space below is limited
      maxHeight = Math.min(
        DEFAULT_MAX_HEIGHT,
        Math.max(spaceBelow, MIN_VISIBLE_HEIGHT),
      );
    }

    // Horizontal clamping within viewport
    let originX = "left";

    if (left + menuW > viewportW - VIEWPORT_PADDING) {
      left = Math.max(VIEWPORT_PADDING, viewportW - menuW - VIEWPORT_PADDING);
      originX = "right";
    }

    if (left < VIEWPORT_PADDING) {
      left = VIEWPORT_PADDING;
      originX = "left";
    }

    setLayout({
      top,
      left,
      maxHeight,
      transformOrigin: `${originY} ${originX}`,
    });
  }, [position.top, position.left, position.anchorTop, filteredOptions.length]);

  // Close menu on scroll outside or click outside
  useEffect(() => {
    const handleScroll = (e: Event) => {
      if (menuRef.current && menuRef.current.contains(e.target as Node)) {
        return;
      }
      onClose();
    };

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    window.addEventListener("scroll", handleScroll, {
      capture: true,
      passive: true,
    });
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);

    return () => {
      window.removeEventListener("scroll", handleScroll, { capture: true });
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [onClose]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (filteredOptions.length === 0) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        isKeyboardNavRef.current = true;
        setIsKeyboardNav(true);
        setSelectedIndex((prev) => (prev + 1) % filteredOptions.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        isKeyboardNavRef.current = true;
        setIsKeyboardNav(true);
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

  if (filteredOptions.length === 0 || !mounted) return null;

  return createPortal(
    <div
      ref={menuRef}
      onMouseDown={(e) => e.preventDefault()}
      style={{
        top: `${layout?.top ?? position.top}px`,
        left: `${layout?.left ?? position.left}px`,
        maxHeight: `${layout?.maxHeight ?? DEFAULT_MAX_HEIGHT}px`,
        transformOrigin: layout?.transformOrigin ?? "top left",
      }}
      className={cn(
        styles.menu,
        "fixed z-50 w-72 overflow-y-auto p-1 text-sm select-none rounded-2xl",
        "animate-in fade-in-0 zoom-in-95 duration-150",
      )}
      onMouseMove={() => {
        if (isKeyboardNav) {
          isKeyboardNavRef.current = false;
          setIsKeyboardNav(false);
        }
      }}
    >
      <div className={cn(styles.sectionLabel, "justify-start text-start")}>
        {t("basicBlocks")}
      </div>
      {filteredOptions.map((option, index) => {
        const Icon = option.icon;
        const isSelected = index === selectedIndex;

        return (
          <Button
            id={`slash-option-${index}`}
            key={option.id}
            variant="ghost"
            onClick={() => onSelect(option)}
            onMouseMove={() => setSelectedIndex(index)}
            className={cn(
              styles.listRow,
              "h-auto w-full justify-start gap-2.5 py-1.5 text-start",
              isSelected && styles.listRowActive,
              isSelected && "bg-accent/50",
              isKeyboardNav &&
                !isSelected &&
                "pointer-events-none hover:!bg-transparent",
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
    </div>,
    document.body,
  );
}
