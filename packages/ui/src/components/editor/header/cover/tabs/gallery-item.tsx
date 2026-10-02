import { Button } from "@ui/button";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
import { getCoverFullUrl, getCoverPreviewUrl } from "../cover-presets";

interface CoverGalleryItemProps {
  isSelected: boolean;
  preset: {
    url: string;
    previewUrl?: string;
    title: string;
  };
  onClose: () => void;
  onSelectCover: (url: string) => void;
}

export function CoverGalleryItem({
  isSelected,
  preset,
  onClose,
  onSelectCover,
}: CoverGalleryItemProps) {
  const previewUrl = preset.previewUrl || getCoverPreviewUrl(preset.url);
  const fullCoverUrl = getCoverFullUrl(preset.url);

  return (
    <Button
      variant={isSelected ? "default" : "outline"}
      onClick={() => {
        onSelectCover(fullCoverUrl);
        onClose();
      }}
      className={cn(
        "group relative aspect-video h-auto w-full p-0 overflow-hidden rounded-lg border transition-all outline-none",
        "focus-visible:ring-2 focus-visible:ring-ring",
        isSelected
          ? "border-primary ring-2 ring-primary/40 shadow-sm"
          : "border-border/70 hover:border-foreground/40 hover:opacity-90",
      )}
    >
      <img
        src={previewUrl}
        alt={preset.title}
        loading="lazy"
        className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100 flex items-end p-1.5">
        <span className="text-[10px] text-white line-clamp-1 text-start">
          {preset.title}
        </span>
      </div>
      {isSelected && (
        <div className="absolute top-1.5 end-1.5 rounded-full bg-primary p-0.5 text-primary-foreground shadow-xs">
          <Check className="size-3" />
        </div>
      )}
    </Button>
  );
}
