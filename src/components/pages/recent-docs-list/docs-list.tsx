import type { SidebarPageItem } from "@/store/use-sidebar-store";

import { Button } from "@/components/ui/button";
import { formatRelativeTime } from "@/lib/date-formatter";
import { styles } from "@/lib/design-token";
import { cn } from "@/lib/utils";

interface DocListItemProps {
  item: any;
  pageMeta: SidebarPageItem | undefined;
  parentTitle: string | undefined;
  onOpenDoc: () => void;
}

export function DocsListItem({
  item,
  parentTitle,
  onOpenDoc,
}: DocListItemProps) {
  return (
    <li key={item.pageId}>
      <Button
        variant="ghost"
        onClick={onOpenDoc}
        className={cn(styles.listRow, "w-full cursor-pointer text-left")}
      >
        <span className="flex size-5 shrink-0 items-center justify-center text-sm select-none">
          {item.icon ?? "📄"}
        </span>
        <span className="min-w-0 flex-1 truncate text-foreground">
          {item.title}
        </span>
        {parentTitle && (
          <span className="hidden shrink-0 text-xs text-muted-foreground/80 sm:inline">
            In {parentTitle}
          </span>
        )}
        {item.lastAccessedAt ? (
          <span className="shrink-0 text-[10px] text-muted-foreground/70">
            {formatRelativeTime(item.lastAccessedAt)}
          </span>
        ) : null}
      </Button>
    </li>
  );
}
