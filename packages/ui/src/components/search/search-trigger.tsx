import { Button } from "@ui/button";
import { Search } from "lucide-react";
import { useEffect } from "react";

interface SearchTriggerProps {
  onOpen: () => void;
}

export function SearchTrigger({ onOpen }: SearchTriggerProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLocaleLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpen();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <Button
      variant="ghost"
      onClick={onOpen}
      size="icon"
      className="rounded-full"
      title="Search (⌘ + K / Ctrl + K)"
      aria-label="Search"
    >
      <Search className="size-4" strokeWidth={1.5} />
    </Button>
  );
}
