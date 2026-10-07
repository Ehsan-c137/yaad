/* eslint-disable @eslint-react/immutability */
import { Button } from "@ui/button";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";

import { useSlidingPill } from "@/hooks/use-sliding-pill";
import { styles } from "@/lib/design-token";
import { cn } from "@/lib/utils";

import type { SlashOption } from "./slash-options";

import { SLASH_OPTION_KEYS, SLASH_OPTIONS } from "./slash-options";

export interface SlashMenuProps {
  position: { top: number; left: number; anchorTop: number };
  query: string;
  onSelect: (option: SlashOption) => void;
  onClose: () => void;
}

interface MenuLayout {
  top?: number;
  bottom?: number;
  left: number;
  maxHeight: number;
}

/** Hard cap on menu height (px). */
const MAX_HEIGHT = 320;
/** Gap (px) between menu edge and viewport edge. */
const VIEWPORT_GAP = 8;
/** Gap (px) between menu and the cursor line. */
const CURSOR_GAP = 6;
/** Menu width (px) matching Tailwind `w-72`. */
const MENU_WIDTH = 288;
/** Minimum usable menu height before forcing upward flip. */
const MIN_USABLE_HEIGHT = 120;

interface SlashMenuItemProps {
  option: SlashOption;
  index: number;
  isSelected: boolean;
  isKeyboardNav: boolean;
  onSelect: (option: SlashOption) => void;
  onHover: (index: number) => void;
  itemRef: (el: HTMLButtonElement | null) => void;
}

// eslint-disable-next-line max-lines-per-function
export function SlashMenu({
  position,
  query,
  onSelect,
  onClose,
}: SlashMenuProps) {
  const { t } = useTranslation("editor");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isKeyboardNav, setIsKeyboardNav] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [layout, setLayout] = useState<MenuLayout | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  // Localize option titles and descriptions
  const translatedOptions = useMemo(() => {
    return SLASH_OPTIONS.map((opt) => ({
      ...opt,
      title: t(SLASH_OPTION_KEYS[opt.id]?.titleKey || opt.id, {
        defaultValue: opt.title,
      }),
      description: t(SLASH_OPTION_KEYS[opt.id]?.descKey || opt.id, {
        defaultValue: opt.description,
      }),
    }));
  }, [t]);

  // Filter options based on user search query
  const filteredOptions = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return translatedOptions;
    return translatedOptions.filter(
      (opt) =>
        opt.title.toLowerCase().includes(q) ||
        opt.description.toLowerCase().includes(q),
    );
  }, [translatedOptions, query]);

  // Sliding background indicator pill
  const { pillRef, itemRefs } = useSlidingPill(
    filteredOptions.length > 0 ? selectedIndex : -1,
    [filteredOptions.length],
  );

  // Reset selection index when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Keep selected item scrolled into view via direct ref
  useEffect(() => {
    itemRefs.current[selectedIndex]?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex, itemRefs]);

  // Layout & collision positioning with resize observer
  useLayoutEffect(() => {
    const updateLayout = () => {
      setLayout(calculateMenuLayout(position));
    };

    updateLayout();
    window.addEventListener("resize", updateLayout);
    return () => window.removeEventListener("resize", updateLayout);
  }, [
    position.top,
    position.left,
    position.anchorTop,
    filteredOptions.length,
    position,
  ]);

  // Dismiss on click/touch outside or scroll outside
  useEffect(() => {
    const handleDismiss = (e: Event) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleDismiss);
    document.addEventListener("touchstart", handleDismiss);
    window.addEventListener("scroll", handleDismiss, {
      capture: true,
      passive: true,
    });

    return () => {
      document.removeEventListener("mousedown", handleDismiss);
      document.removeEventListener("touchstart", handleDismiss);
      window.removeEventListener("scroll", handleDismiss, { capture: true });
    };
  }, [onClose]);

  // Keyboard navigation
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (filteredOptions.length === 0) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setIsKeyboardNav(true);
          setSelectedIndex((prev) => (prev + 1) % filteredOptions.length);
          break;

        case "ArrowUp":
          e.preventDefault();
          setIsKeyboardNav(true);
          setSelectedIndex((prev) =>
            prev === 0 ? filteredOptions.length - 1 : prev - 1,
          );
          break;

        case "Enter":
          e.preventDefault();

          if (filteredOptions[selectedIndex]) {
            onSelect(filteredOptions[selectedIndex]);
          }

          break;

        case "Escape":
          e.preventDefault();
          onClose();
          break;
      }
    };

    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [filteredOptions, selectedIndex, onSelect, onClose]);

  if (filteredOptions.length === 0 || !mounted) return null;

  const style: React.CSSProperties = {
    position: "fixed",
    left: `${layout?.left ?? position.left}px`,
    maxHeight: `${layout?.maxHeight ?? MAX_HEIGHT}px`,
    ...(layout?.bottom !== undefined
      ? { bottom: `${layout.bottom}px` }
      : { top: `${layout?.top ?? position.top}px` }),
  };

  return createPortal(
    <div
      tabIndex={0}
      ref={menuRef}
      role="listbox"
      aria-label={t("basicBlocks")}
      onMouseDown={(e) => e.preventDefault()}
      style={style}
      className={cn(
        styles.menu,
        "z-50 w-72 overflow-y-auto p-1 text-sm select-none rounded-xl",
        "animate-in fade-in-0 zoom-in-95 duration-150",
      )}
      onMouseMove={() => {
        if (isKeyboardNav) {
          setIsKeyboardNav(false);
        }
      }}
    >
      <div
        className={cn(
          styles.sectionLabel,
          "relative z-10 justify-start text-start",
        )}
      >
        {t("basicBlocks")}
      </div>

      <span
        ref={pillRef}
        className="pointer-events-none absolute left-0 top-0 z-0 rounded-lg bg-accent/50 transition-all duration-150 ease-out will-change-transform motion-reduce:transition-none"
        aria-hidden="true"
      />

      {filteredOptions.map((option, index) => (
        <SlashMenuItem
          key={option.id}
          option={option}
          index={index}
          isSelected={index === selectedIndex}
          isKeyboardNav={isKeyboardNav}
          onSelect={onSelect}
          onHover={setSelectedIndex}
          itemRef={(el) => {
            itemRefs.current[index] = el;
          }}
        />
      ))}
    </div>,
    document.body,
  );
}

function SlashMenuItem({
  option,
  index,
  isSelected,
  isKeyboardNav,
  onSelect,
  onHover,
  itemRef,
}: SlashMenuItemProps) {
  const Icon = option.icon;

  return (
    <Button
      id={`slash-option-${index}`}
      key={option.id}
      variant="ghost"
      role="option"
      aria-selected={isSelected}
      onClick={() => onSelect(option)}
      onMouseMove={() => onHover(index)}
      ref={itemRef}
      className={cn(
        styles.listRow,
        "relative z-10 h-auto w-full justify-start gap-2.5 rounded-lg py-1.5 text-start",
        "hover:bg-transparent dark:hover:bg-transparent",
        isSelected && "text-accent-foreground",
        isKeyboardNav && !isSelected && "pointer-events-none",
      )}
    >
      <div className="flex size-7 items-center justify-center rounded-md border border-border bg-muted text-muted-foreground">
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
}

/** Computes viewport-aware coordinates and flip placement for the slash menu. */
function calculateMenuLayout(
  position: SlashMenuProps["position"],
  viewportW = window.innerWidth,
  viewportH = window.innerHeight,
): MenuLayout {
  const spaceBelow = viewportH - position.top - VIEWPORT_GAP;
  const spaceAbove = position.anchorTop - VIEWPORT_GAP;

  let top: number | undefined;
  let bottom: number | undefined;
  let maxHeight: number;

  if (spaceBelow < MAX_HEIGHT && spaceAbove > spaceBelow) {
    // Render above cursor
    maxHeight = Math.min(MAX_HEIGHT, spaceAbove);
    bottom = viewportH - position.anchorTop + CURSOR_GAP;
  } else {
    // Render below cursor
    maxHeight = Math.min(MAX_HEIGHT, Math.max(spaceBelow, MIN_USABLE_HEIGHT));
    top = position.top;
  }

  // Clamp horizontally within viewport
  let { left } = position;

  if (left + MENU_WIDTH > viewportW - VIEWPORT_GAP) {
    left = Math.max(VIEWPORT_GAP, viewportW - MENU_WIDTH - VIEWPORT_GAP);
  }
  if (left < VIEWPORT_GAP) {
    left = VIEWPORT_GAP;
  }

  return { top, bottom, left, maxHeight };
}
