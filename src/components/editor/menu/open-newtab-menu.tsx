import { Button } from "@ui/button";
import { ExternalLink } from "lucide-react";

import { styles } from "@/lib/design-token";
import { cn } from "@/lib/utils";

interface OpenNewTabProps {
  onClose: () => void;
}

export function OpenNewTabMenu({ onClose }: OpenNewTabProps) {
  return (
    <Button
      onClick={onClose}
      className={cn(styles.menuItem, "w-full justify-between")}
      variant="outline"
    >
      <div className="flex items-center gap-2">
        <ExternalLink className="size-3.5 text-muted-foreground" />
        <span>Open in new tab</span>
      </div>
      <span className="text-[10px] text-muted-foreground">Ctrl+Shift+↵</span>
    </Button>
  );
}
