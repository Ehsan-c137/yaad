"use client";

import { Button } from "@ui/button";
import { Image as ImageIcon, X } from "lucide-react";
import { useEffect, useState } from "react";

import type { DocumentBlock } from "@/types/document";

import { useEditorPageIdContext } from "@/context/use-editor-context";
import { documentService } from "@/services/document-service";
import { useDocumentStore } from "@/store/document/use-document-store";

export function ImageBlock({ block }: { block: DocumentBlock }) {
  const updateBlockProperties = useDocumentStore(
    (state) => state.updateBlockProperties,
  );
  const pageId = useEditorPageIdContext();
  const deleteBlock = useDocumentStore((state) => state.deleteBlock);
  const [url, setUrl] = useState<string | null>(null);

  // Hydrate blob from ID
  useEffect(() => {
    let objectUrl: string | null = null;

    if (block.properties?.blobId) {
      void documentService.getBlob(block.properties.blobId).then((blob) => {
        if (blob) {
          objectUrl = URL.createObjectURL(blob);
          setUrl(objectUrl);
        }
      });
    }

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [block.properties?.blobId]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const blobId = `blob_${Date.now()}`;
    await documentService.saveBlob(blobId, file);
    await updateBlockProperties(block.id, pageId, {
      blobId,
      fileName: file.name,
    });
  };

  if (!url) {
    return (
      <label className="my-2 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-8 hover:bg-accent">
        <ImageIcon className="mb-2 size-8 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          Click to upload image
        </span>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </label>
    );
  }

  return (
    <div className="group relative my-2">
      <img src={url} alt="Uploaded" className="max-w-full rounded-lg" />
      <Button
        onClick={() => deleteBlock(block.id)}
        className="absolute top-2 right-2 rounded-full bg-black/50 p-1 text-white opacity-0 group-hover:opacity-100"
      >
        <X className="size-4" />
      </Button>
    </div>
  );
}
