"use client";

import type { DocumentBlock } from "@yaad/core/types/document";

import { Button } from "@ui/button";
import { documentService } from "@yaad/core/services/document-service";
import { FileText, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { useDocumentStore } from "@/hooks/editor/use-document-store-ui";

export function FileBlock({ block }: { block?: DocumentBlock }) {
  const { t } = useTranslation("editor");
  const deleteBlock = useDocumentStore((state) => state.deleteBlock);
  const [url, setUrl] = useState<string | null>(null);

  const blobId = block?.properties?.blobId;
  const fileName = block?.properties?.fileName;
  const blockId = block?.id;

  useEffect(() => {
    let isCancelled = false;

    if (blobId) {
      void documentService.getBlob(blobId).then((blob) => {
        if (!isCancelled && blob) {
          setUrl(URL.createObjectURL(blob));
        }
      });
    }

    return () => {
      isCancelled = true;
    };
  }, [blobId]);

  if (!block) {
    return null;
  }

  return (
    <div className="my-2 flex items-center gap-3 rounded-md border border-border p-3 hover:bg-accent">
      <FileText className="size-5 text-blue-500" />
      <a
        href={url ?? "#"}
        target="_blank"
        download={fileName}
        className="flex-1 text-sm font-medium hover:underline"
      >
        {fileName ?? t("unknownFile")}
      </a>
      <Button
        onClick={() => {
          if (blockId) {
            void deleteBlock(blockId);
          }
        }}
        className="text-muted-foreground hover:text-red-500"
      >
        <X className="size-4" />
      </Button>
    </div>
  );
}
