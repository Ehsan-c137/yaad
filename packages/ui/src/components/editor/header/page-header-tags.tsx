import { useDocumentStore } from "@/hooks/editor/use-document-store-ui";

import { TagList } from "../tags/tag-list";

export function PageHeaderTags() {
  const rootBlock = useDocumentStore(
    (state) => state.currentDocument?.blocks.root,
  );
  const currentDocId = useDocumentStore(
    (state) => state.currentDocument?.id ?? "",
  );
  const addTagToBlock = useDocumentStore((state) => state.addTagToBlock);
  const removeTagFromBlock = useDocumentStore(
    (state) => state.removeTagFromBlock,
  );

  if (!rootBlock) return null;

  return (
    <div className="mb-4 flex items-center">
      <TagList
        tags={rootBlock.tags || []}
        onAddTag={(tag) => addTagToBlock(rootBlock.id, currentDocId, tag)}
        onRemoveTag={(tagId) =>
          removeTagFromBlock(rootBlock.id, currentDocId, tagId)
        }
      />
    </div>
  );
}
