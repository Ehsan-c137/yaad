import { useEffect, useState } from "react";

import { IconPickerPopover } from "@/components/shared/icon-picker-popover";
import { cn } from "@/lib/utils";
import { useDocumentStore } from "@/store/document/use-document-store";
import { useSidebarStore } from "@/store/use-sidebar-store";

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

  const [icon, setIcon] = useState<string | undefined>("📄");

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
