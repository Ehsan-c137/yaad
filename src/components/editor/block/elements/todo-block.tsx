"use client";

import type { DocumentBlock } from "@/types/document";

import { useEditorPageIdContext } from "@/context/use-editor-context";
import { useDocumentStore } from "@/store/document/use-document-store";

import { EditableContent } from "../editable-content";

interface TodoBlockProps {
  block: DocumentBlock;
}

export function TodoBlock({ block }: TodoBlockProps) {
  const updateBlockProperties = useDocumentStore(
    (state) => state.updateBlockProperties,
  );
  const pageId = useEditorPageIdContext();
  const changeBlockType = useDocumentStore((state) => state.changeBlockType);
  const addBlock = useDocumentStore((state) => state.addBlock);
  const deleteBlock = useDocumentStore((state) => state.deleteBlock);
  const text = block.properties?.title?.[0]?.text || "";
  const isChecked = Boolean(block.properties?.checked);

  const handleToggleCheck = () => {
    void updateBlockProperties(block.id, pageId, {
      checked: !isChecked,
    });
  };

  const handleChange = (newText: string) => {
    void updateBlockProperties(block.id, pageId, {
      title: [{ text: newText }],
    });
  };

  return (
    <div className="flex w-full items-start gap-2 py-1">
      {/* Custom Checkbox */}
      <input
        type="checkbox"
        checked={isChecked}
        onChange={handleToggleCheck}
        className="mt-1 size-4 cursor-pointer rounded-sm border-border text-primary accent-primary focus:ring-0"
      />

      {/* Checkable Text Content */}
      <div
        className={`min-w-0 flex-1 ${isChecked ? "text-muted-foreground line-through" : ""}`}
      >
        <EditableContent
          html={text}
          placeholder="To-do"
          className="text-base text-foreground"
          onChange={handleChange}
          onEnter={() => addBlock(block.parentId || "root", block.id, "todo")}
          onBackspaceEmpty={() => deleteBlock(block.id)}
          onTransformType={(newType) => changeBlockType(block.id, newType)}
          blockType={block.type}
        />
      </div>
    </div>
  );
}
