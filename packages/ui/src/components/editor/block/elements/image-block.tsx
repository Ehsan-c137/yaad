import type { DocumentBlock } from "@yaad/core/types/document";

import { Button } from "@ui/button";
import { Dialog, DialogContent, DialogTitle } from "@ui/dialog";
import { documentService } from "@yaad/core/services/document-service";
import { Image as ImageIcon, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { useEditorPageIdContext } from "@/context/use-editor-context";
import { useDocumentStore } from "@/hooks/editor/use-document-store-ui";

export function ImageBlock({ block }: { block: DocumentBlock }) {
  const { t } = useTranslation("editor");
  const deleteBlock = useDocumentStore((state) => state.deleteBlock);
  const [url, setUrl] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const blobId = block.properties?.blobId;

  useEffect(() => {
    if (!blobId || isInView) return;

    if (typeof IntersectionObserver === "undefined") {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "200px 0px",
      },
    );

    const el = containerRef.current;

    if (el) {
      observer.observe(el);
    }

    return () => {
      observer.disconnect();
    };
  }, [blobId, isInView]);

  // Load image blob only when in viewport
  useEffect(() => {
    if (!isInView || !blobId) return;

    let isCancelled = false;
    let objectUrl: string | null = null;

    void documentService.getBlob(blobId).then((blob) => {
      if (!isCancelled && blob) {
        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
      }
    });

    return () => {
      isCancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [isInView, blobId]);

  const fileName = block.properties?.fileName ?? t("uploadedImage");

  if (!blobId) {
    return <AddImage blockId={block.id} />;
  }

  return (
    <>
      <div
        ref={containerRef}
        className="group relative my-2 min-h-32 flex items-center justify-center"
      >
        {url ? (
          <>
            <img
              src={url}
              alt={fileName}
              loading="lazy"
              tabIndex={0}
              role="button"
              onClick={() => setIsOpen(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setIsOpen(true);
                }
              }}
              className="max-w-full max-h-[400px] cursor-zoom-in rounded-lg transition-opacity hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <Button
              onClick={(e) => {
                e.stopPropagation();
                void deleteBlock(block.id);
              }}
              className="absolute top-2 end-2 w-8 h-8 rounded-full bg-black/50 p-1 text-white opacity-0 group-hover:opacity-100"
            >
              <X className="size-4" />
            </Button>
          </>
        ) : (
          <div className="flex h-48 w-full items-center justify-center rounded-lg border border-border/40 bg-muted/30 animate-pulse text-muted-foreground">
            <ImageIcon className="size-8 opacity-40" />
            <Button
              onClick={(e) => {
                e.stopPropagation();
                void deleteBlock(block.id);
              }}
              className="absolute top-2 end-2 rounded-full bg-black/50 p-1 text-white opacity-0 group-hover:opacity-100"
            >
              <X className="size-4" />
            </Button>
          </div>
        )}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent
          className="w-full max-w-[95vw] gap-2 border-border/50 bg-background p-2 shadow-2xl sm:max-w-5xl sm:p-4 lg:max-w-6xl"
          overlayClassName="bg-black/60 backdrop-blur-xs"
          showCloseButton
        >
          <DialogTitle className="sr-only">{fileName}</DialogTitle>
          <div className="flex w-full items-center justify-center overflow-hidden rounded-lg">
            {url && (
              <img
                src={url}
                alt={fileName}
                className="h-auto max-h-[80vh] w-full rounded-md object-contain"
              />
            )}
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

function AddImage({ blockId }: { blockId: string }) {
  const { t } = useTranslation("editor");
  const updateBlockProperties = useDocumentStore(
    (state) => state.updateBlockProperties,
  );

  const pageId = useEditorPageIdContext();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const blobId = `blob_${Date.now()}`;
    await documentService.saveBlob(blobId, file);
    await updateBlockProperties(blockId, pageId, {
      blobId,
      fileName: file.name,
    });
  };

  return (
    <label className="my-2 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-8 hover:bg-accent">
      <ImageIcon className="mb-2 size-8 text-muted-foreground" />
      <span className="text-sm text-muted-foreground">
        {t("clickToUploadImage")}
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
