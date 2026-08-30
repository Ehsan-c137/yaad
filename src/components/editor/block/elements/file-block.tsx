"use client";

import { Button } from "@ui/button";
import { FileText, X } from "lucide-react";
import { useEffect, useState } from "react";

import type { DocumentBlock } from "@/types/document";

import { documentService } from "@/services/document-service";
import { useDocumentStore } from "@/store/document/use-document-store";

export function FileBlock({ block }: { block: DocumentBlock }) {
  const deleteBlock = useDocumentStore((state) => state.deleteBlock);
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (block.properties?.blobId) {
      void documentService.getBlob(block.properties.blobId).then((blob) => {
        if (blob) setUrl(URL.createObjectURL(blob));
      });
    }
  }, [block.properties?.blobId]);

  return (
    <div className="my-2 flex items-center gap-3 rounded-md border border-border p-3 hover:bg-accent">
      <FileText className="size-5 text-blue-500" />
      <a
        href={url || "#"}
        target="_blank"
        download={block.properties?.fileName}
        className="flex-1 text-sm font-medium hover:underline"
      >
        {block.properties?.fileName || "Unknown file"}
      </a>
      <Button
        onClick={() => deleteBlock(block.id)}
        className="text-muted-foreground hover:text-red-500"
      >
        <X className="size-4" />
      </Button>
    </div>
  );
}
