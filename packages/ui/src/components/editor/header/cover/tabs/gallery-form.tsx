import { Button } from "@ui/button";
import { Input } from "@ui/input";
import { Search, X } from "lucide-react";
import { useTranslation } from "react-i18next";

interface CoverGalleryFormProps {
  onSearch: (value: string) => void;
  searchQuery: string;
  onClearForm: () => void;
}

export const CoverGalleryForm = ({
  onSearch,
  searchQuery,
  onClearForm,
}: CoverGalleryFormProps) => {
  const { t } = useTranslation("editor");
  return (
    <div className="relative w-full">
      <Search className="absolute start-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
      <Input
        type="text"
        value={searchQuery}
        onChange={(v) => {
          onSearch(v.target.value);
        }}
        placeholder={t("searchPictures")}
        className="ps-9 pe-8 h-8 text-xs bg-muted/40"
      />
      {searchQuery && (
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={onClearForm}
          className="absolute end-1 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          <X className="size-3.5" />
        </Button>
      )}
    </div>
  );
};
