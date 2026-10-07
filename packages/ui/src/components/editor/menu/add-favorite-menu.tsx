import { Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { styles } from "@/lib/design-token";
import { cn } from "@/lib/utils";

export function AddtoFavoriteMenu({ onClose }: { onClose: () => void }) {
  return (
    <Button
      onClick={onClose}
      className={cn(styles.menuItem, "w-full justify-between")}
      variant="outline"
    >
      <div className="flex items-center gap-2">
        <Star className="size-3.5 text-muted-foreground" />
        <span>Add to Favorites</span>
      </div>
    </Button>
  );
}
