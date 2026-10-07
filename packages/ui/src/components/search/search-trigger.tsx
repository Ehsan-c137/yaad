import { Button } from "@ui/button";
import { Search } from "lucide-react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

interface SearchTriggerProps {
  onOpen: () => void;
}

export function SearchTrigger({ onOpen }: SearchTriggerProps) {
  const { t } = useTranslation("search");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLocaleLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpen();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onOpen]);

  return (
    <Button
      variant="ghost"
      onClick={onOpen}
      size="icon"
      className="rounded-full"
      title={t("searchPlaceholder")}
      aria-label={t("searchLabel")}
    >
      <Search className="size-4" strokeWidth={1.5} />
    </Button>
  );
}
