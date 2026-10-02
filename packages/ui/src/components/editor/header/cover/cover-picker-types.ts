export type CoverCategory =
  "architecture" | "gradients" | "nature" | "paintings" | "space" | "vintage";

export interface CoverPresetItem {
  id: string;
  url: string;
  previewUrl?: string;
  title: string;
  category: CoverCategory;
  keywords?: string[];
}

export interface CoverCategoryOption {
  id: "all" | CoverCategory;
  labelKey: string;
  icon?: string;
}

export interface CoverPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCover: (url: string) => void;
  currentCover?: string;
}

export interface CoverTabProps {
  onSelectCover: (url: string) => void;
  onClose: () => void;
  currentCover?: string;
}
