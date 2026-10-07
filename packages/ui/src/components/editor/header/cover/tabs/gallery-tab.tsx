import { Dices, Search, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";

import type { CoverCategory, CoverTabProps } from "../cover-picker-types";

import {
  COVER_PRESETS,
  filterPresets,
  getCoverFullUrl,
  getCoverPreviewUrl,
  getRandomPreset,
  getRandomUnsplashUrl,
} from "../cover-presets";
import { CoverGalleryCategories } from "./gallery-categories";
import { CoverGalleryForm } from "./gallery-form";
import { CoverGalleryItem } from "./gallery-item";

function isPresetSelected(presetUrl: string, currentCover?: string): boolean {
  if (!currentCover) return false;
  if (currentCover === presetUrl) return true;

  try {
    const current = new URL(currentCover);
    const preset = new URL(presetUrl);
    return (
      current.origin === preset.origin && current.pathname === preset.pathname
    );
  } catch {
    return false;
  }
}

export function CoverGalleryTab({
  onSelectCover,
  onClose,
  currentCover,
}: CoverTabProps) {
  const { t } = useTranslation("editor");

  const [selectedCategory, setSelectedCategory] = useState<
    "all" | CoverCategory
  >("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPresets = useMemo(
    () => filterPresets(COVER_PRESETS, selectedCategory, searchQuery),
    [selectedCategory, searchQuery],
  );

  const handleSurprisePreset = () => {
    const randomItem = getRandomPreset(COVER_PRESETS, selectedCategory);

    if (randomItem) {
      onSelectCover(getCoverFullUrl(randomItem.url));
      onClose();
    }
  };

  const handleRandomUnsplash = () => {
    onSelectCover(getRandomUnsplashUrl());
    onClose();
  };

  return (
    <div className="flex flex-col gap-3 overflow-hidden">
      <CoverGalleryForm
        searchQuery={searchQuery}
        onSearch={(value) => setSearchQuery(value)}
        onClearForm={() => setSearchQuery("")}
      />

      <CoverGalleryCategories
        selectedCategory={selectedCategory}
        onSelectCategory={(v: "all" | CoverCategory) => setSelectedCategory(v)}
      />

      {filteredPresets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground text-xs">
          <Search className="size-6 mb-2 opacity-50" />
          <p>{t("noPicturesFound")}</p>
        </div>
      ) : (
        <div className="grid max-h-[320px] grid-cols-3 sm:grid-cols-4 gap-2.5 overflow-y-auto pe-1">
          {filteredPresets.map((preset) => {
            const isSelected = isPresetSelected(preset.url, currentCover);
            return (
              <CoverGalleryItem
                isSelected={isSelected}
                onClose={onClose}
                onSelectCover={onSelectCover}
                preset={{
                  ...preset,
                  previewUrl:
                    preset.previewUrl ?? getCoverPreviewUrl(preset.url),
                }}
                key={preset.id}
              />
            );
          })}
        </div>
      )}

      <div className="mt-1 grid grid-cols-2 gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={handleSurprisePreset}
          className="flex items-center justify-center gap-1.5 text-xs h-8"
        >
          <Dices className="size-3.5 text-indigo-500" />
          <span>{t("surpriseMe")}</span>
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleRandomUnsplash}
          className="flex items-center justify-center gap-1.5 text-xs h-8"
        >
          <Sparkles className="size-3.5 text-amber-500" />
          <span>{t("randomUnsplash")}</span>
        </Button>
      </div>
    </div>
  );
}
