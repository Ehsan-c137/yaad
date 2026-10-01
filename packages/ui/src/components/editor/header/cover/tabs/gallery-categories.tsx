import { Button } from "@ui/button";
import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";

import type { CoverCategory } from "../cover-picker-types";

import { COVER_CATEGORIES } from "../cover-presets";

interface CoverGalleryCategoriesProps {
  selectedCategory: string;
  onSelectCategory: (category: "all" | CoverCategory) => void;
}

export const CoverGalleryCategories = ({
  selectedCategory,
  onSelectCategory,
}: CoverGalleryCategoriesProps) => {
  const { t } = useTranslation("editor");
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
      {COVER_CATEGORIES.map((cat) => {
        const isSelected = selectedCategory === cat.id;
        return (
          <Button
            key={cat.id}
            type="button"
            size="xs"
            variant={isSelected ? "default" : "secondary"}
            onClick={() => {
              onSelectCategory(cat.id);
            }}
            className={cn(
              "rounded-full shrink-0 font-medium",
              !isSelected &&
                "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground",
            )}
          >
            {cat.icon && <span>{cat.icon}</span>}
            <span>{t(cat.labelKey)}</span>
          </Button>
        );
      })}
    </div>
  );
};
