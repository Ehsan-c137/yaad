import { Button } from "@ui/button";
import { Edit3 } from "lucide-react";

import { styles } from "@/lib/design-token";
import { cn } from "@/lib/utils";

export function RenameMenu({ onClose }: { onClose: () => void }) {
  return (
    <Button
      onClick={onClose}
      variant="outline"
      className={cn(styles.menuItem, "w-full justify-between")}
    >
      <div className="flex items-center gap-2">
        <Edit3 className="size-3.5 text-muted-foreground" />
        <span>Rename</span>
      </div>
      <span className="text-[10px] text-muted-foreground">Ctrl+Shift+R</span>
    </Button>
  );
}
