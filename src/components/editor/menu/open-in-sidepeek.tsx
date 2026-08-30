import { Button } from "@ui/button";
import { Sidebar as SidePeek } from "lucide-react";

import { styles } from "@/lib/design-token";
import { cn } from "@/lib/utils";

export function OpenInSidePeek({ onClose }: { onClose: () => void }) {
  return (
    <Button
      onClick={onClose}
      className={cn(styles.menuItem, "w-full justify-between")}
      variant="outline"
    >
      <div className="flex items-center gap-2">
        <SidePeek className="size-3.5 text-muted-foreground" />
        <span>Open in side peek</span>
      </div>
      <span className="text-[10px] text-muted-foreground">Alt+Click</span>
    </Button>
  );
}
