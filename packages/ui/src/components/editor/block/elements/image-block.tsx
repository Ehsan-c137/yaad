"use client";

import type { DocumentBlock } from "@yaad/core/types/document";

import { Button } from "@ui/button";
import { Dialog, DialogContent, DialogTitle } from "@ui/dialog";
import { documentService } from "@yaad/core/services/document-service";
import { Image as ImageIcon, X } from "lucide-react";
import { useEffect, useState } from "react";

import { useEditorPageIdContext } from "@/context/use-editor-context";
import { useDocumentStore } from "@/hooks/editor/use-document-store-ui";

export function ImageBlock({ block }: { block: DocumentBlock }) {
  const updateBlockProperties = useDocumentStore(
    (state) => state.updateBlockProperties,
  );
  const pageId = useEditorPageIdContext();
  const deleteBlock = useDocumentStore((state) => state.deleteBlock);
  const [url, setUrl] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

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
          onChange={(e) => void handleFileChange(e)}
        />
      </label>
    );
  }

  const fileName = block.properties?.fileName || "Uploaded image";

  return (
    <>
      <div className="group relative my-2">
        <img
          src={url}
          alt={fileName}
          role="button"
          tabIndex={0}
          onClick={() => setIsOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setIsOpen(true);
            }
          }}
          className="max-w-full cursor-zoom-in rounded-lg transition-opacity hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <Button
          onClick={(e) => {
            e.stopPropagation();
            void deleteBlock(block.id);
          }}
          className="absolute top-2 right-2 rounded-full bg-black/50 p-1 text-white opacity-0 group-hover:opacity-100"
        >
          <X className="size-4" />
        </Button>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent
          className="w-full max-w-[95vw] gap-2 border-border/50 bg-background p-2 shadow-2xl sm:max-w-5xl sm:p-4 lg:max-w-6xl"
          overlayClassName="bg-black/60 backdrop-blur-xs"
          showCloseButton
        >
          <DialogTitle className="sr-only">{fileName}</DialogTitle>
          <div className="flex w-full items-center justify-center overflow-hidden rounded-lg">
            <img
              src={url}
              alt={fileName}
              className="h-auto max-h-[85vh] w-full rounded-md object-contain"
            />
          </div>
          {block.properties?.fileName && (
            <div className="truncate px-2 text-center text-xs text-muted-foreground">
              {block.properties.fileName}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
