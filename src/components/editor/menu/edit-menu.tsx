import { Smile } from "lucide-react";

import { Button } from "@/components/ui/button";
import { styles } from "@/lib/design-token";
import { cn } from "@/lib/utils";

export function EditMenu({ onClose }: { onClose: () => void }) {
  return (
    <Button
      variant="outline"
      onClick={onClose}
      className={cn(styles.menuItem, "w-full justify-between")}
    >
      <div className="flex items-center gap-2">
        <Smile className="size-3.5 text-muted-foreground" />
        <span>Edit icon</span>
      </div>
    </Button>
  );
}
