"use client";

import type { ChangeEvent } from "react";

import { Popover, PopoverContent, PopoverTrigger } from "@ui/popover";
import { Sparkles, Trash2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const COMMON_EMOJIS = [
  "📄",
  "📝",
  "📁",
  "📂",
  "🚀",
  "⚡",
  "💡",
  "🔥",
  "🎯",
  "⭐",
  "✨",
  "💻",
  "🛠️",
  "🎨",
  "📚",
  "📌",
  "☕",
  "🍕",
  "🏠",
  "🌍",
  "📊",
  "📈",
  "🔒",
  "🔑",
  "🎉",
  "✅",
  "❤️",
  "🧠",
  "🎧",
  "🎸",
  "🌱",
  "🪐",
];

interface IconPickerPopoverProps {
  currentIcon: string | undefined;
  onSelectIcon: (icon: string) => void;
  onRemoveIcon?: () => void;
  triggerAriaLabel?: string;
  triggerClassName?: string;
  children: React.ReactNode;
}

export function IconPickerPopover({
  currentIcon,
  onSelectIcon,
  onRemoveIcon,
  triggerAriaLabel,
  triggerClassName,
  children,
}: IconPickerPopoverProps) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const filteredEmojis = COMMON_EMOJIS.filter((emoji) =>
    emoji.includes(search),
  );

  const handleRandomIcon = () => {
    const randomEmoji =
      COMMON_EMOJIS[Math.floor(Math.random() * COMMON_EMOJIS.length)];
    onSelectIcon(randomEmoji);
    setOpen(false);
  };

  const handleIconChange = (
    e: ChangeEvent<HTMLInputElement, HTMLInputElement>,
  ) => {
    setSearch(e.target.value);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn("text-4xl", triggerClassName)}
        aria-label={triggerAriaLabel}
      >
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3" align="start">
        <div className="space-y-3">
          {/* Search Input */}
          <Input
            placeholder="Search emoji..."
            value={search}
            onChange={handleIconChange}
            className="h-8 text-xs"
          />

          <div className="flex items-center justify-between gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRandomIcon}
              className="flex h-7 flex-1 items-center gap-1.5 text-xs"
            >
              <Sparkles className="size-3 text-amber-500" />
              <span>Random</span>
            </Button>
            {currentIcon && onRemoveIcon && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  onRemoveIcon();
                  setOpen(false);
                }}
                className="h-7 text-xs text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
              >
                <Trash2 className="mr-1 size-3" />
                <span>Remove</span>
              </Button>
            )}
          </div>

          <div className="grid max-h-48 grid-cols-8 gap-1 overflow-y-auto pr-1">
            {filteredEmojis.length === 0 && !!search && (
              <Button
                variant="ghost"
                type="button"
                onClick={() => {
                  onSelectIcon(search);
                  setOpen(false);
                }}
                className="flex size-8 items-center justify-center rounded-md text-lg transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                {search}
              </Button>
            )}
            {filteredEmojis.map((emoji) => (
              <Button
                variant="ghost"
                key={emoji}
                type="button"
                onClick={() => {
                  onSelectIcon(emoji);
                  setOpen(false);
                }}
                className="flex size-8 items-center justify-center rounded-md text-lg transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                {emoji}
              </Button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
