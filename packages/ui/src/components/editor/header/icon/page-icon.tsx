import { useSidebarStore } from "@yaad/core/store/use-sidebar-store";
import { useEffect, useState } from "react";

import { IconPickerPopover } from "@/components/shared/icon-picker-popover";
import { useDocumentStore } from "@/hooks/editor/use-document-store-ui";
import { cn } from "@/lib/utils";

export function PageIcon() {
  const currentDocumentId = useDocumentStore(
    (state) => state.currentDocument?.id,
  );
  const savedIcon = useDocumentStore((state) => state.currentDocument?.icon);
  const updateIcon = useDocumentStore((state) => state.updateIcon);
  const removePageIcon = useDocumentStore((state) => state.removeIcon);
  const updatePageTitleInTree = useSidebarStore(
    (store) => store.updatePageTitleInTree,
  );

  const [icon, setIcon] = useState<string | undefined>("ðŸ“„");

  useEffect(() => {
    setIcon(savedIcon);
  }, [savedIcon]);

  if (!currentDocumentId) return null;

  const handleIcon = async (newIcon: string) => {
    setIcon(newIcon);
    updatePageTitleInTree(currentDocumentId, undefined, icon);

    await updateIcon(newIcon);
  };

  const handleRemoveIcon = async () => {
    setIcon(undefined);
    updatePageTitleInTree(currentDocumentId, undefined, undefined);
    await removePageIcon();
  };

  return (
    <IconPickerPopover
      currentIcon={icon}
      onSelectIcon={handleIcon}
      onRemoveIcon={handleRemoveIcon}
    >
      <span
        id="page_icon"
        className={cn(
          "cursor-pointer text-start text-5xl leading-none select-none",
          "transition-transform duration-(--spring-duration) ease-(--spring)",
          "inline-block hover:scale-110",
        )}
      >
        {icon}
      </span>
    </IconPickerPopover>
  );
}
