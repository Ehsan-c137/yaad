import { Check } from "lucide-react";
import React from "react";

import { CALENDAR_COLOR_OPTIONS } from "./color-options";

interface ColorPickerRowProps {
  selectedIndex: number;
  onSelectIndex: (index: number) => void;
  label?: string;
}

export const ColorPickerRow: React.FC<ColorPickerRowProps> = ({
  selectedIndex,
  onSelectIndex,
  label = "Category Color",
}) => {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[12px] font-medium text-foreground">{label}</label>
      <div className="flex items-center gap-2">
        {CALENDAR_COLOR_OPTIONS.map((c, i) => (
          <button
            key={c.name}
            type="button"
            onClick={() => onSelectIndex(i)}
            title={c.name}
            className={`flex size-6 items-center justify-center rounded-full transition-all ${
              selectedIndex === i
                ? "ring-2 ring-primary ring-offset-2 scale-110"
                : "hover:scale-105 opacity-80 hover:opacity-100"
            }`}
            style={{ backgroundColor: c.dot }}
          >
            {selectedIndex === i && (
              <Check className="size-3 text-white" strokeWidth={2.5} />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
