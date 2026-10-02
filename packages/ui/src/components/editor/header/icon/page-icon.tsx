import { useSidebarStore } from "@yaad/core/store/use-sidebar-store";

import { IconPickerPopover } from "@/components/shared/icon-picker-popover";
import { useEditorPageIdContext } from "@/context/use-editor-context";
import { useDocumentStore } from "@/hooks/editor/use-document-store-ui";
import { cn } from "@/lib/utils";

export function PageIcon() {
  const contextPageId = useEditorPageIdContext();
  const currentDocumentId = useDocumentStore(
    (state) => state.currentDocument?.id,
  );
  const effectiveDocumentId = currentDocumentId ?? contextPageId;

  const sidebarIcon = useSidebarStore(
    (store) => (contextPageId ? store.pages[contextPageId]?.icon : undefined),
  );
  const savedIcon = useDocumentStore((state) => state.currentDocument?.icon);
  const updateIcon = useDocumentStore((state) => state.updateIcon);
  const removePageIcon = useDocumentStore((state) => state.removeIcon);
  const updatePageTitleInTree = useSidebarStore(
    (store) => store.updatePageTitleInTree,
  );

  const icon = savedIcon ?? sidebarIcon ?? "📄";

  if (!effectiveDocumentId) return null;

  const handleIcon = async (newIcon: string) => {
    updatePageTitleInTree(effectiveDocumentId, undefined, newIcon);
    await updateIcon(newIcon);
  };

  const handleRemoveIcon = async () => {
    updatePageTitleInTree(effectiveDocumentId, undefined, undefined);
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
          "animate-page-icon",
        )}
      >
        {icon}
      </span>
    </IconPickerPopover>
  );
}
