import { ImageIcon } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useDocumentStore } from "@/store/document/use-document-store";

import { CoverPickerModal } from "./cover-picker-modal";

export function PageHeaderCover() {
  const updatePageCover = useDocumentStore((store) => store.updateCoverImage);
  const removeCoverImage = useDocumentStore((store) => store.removeCoverImage);

  const coverImage = useDocumentStore(
    (state) => state.currentDocument?.coverImage,
  );

  const [coverUrl, setCoverUrl] = useState<string | undefined>(undefined);
  const [isCoverModalOpen, setIsCoverModalOpen] = useState(false);

  useEffect(() => {
    setCoverUrl(coverImage);
  }, [coverImage]);

  const handleRemoveCover = async () => {
    setCoverUrl(undefined);
    await removeCoverImage();
  };

  const handleCover = async (url: string) => {
    setCoverUrl(url);
    await updatePageCover(url);
  };

  return (
    <>
      {coverUrl ? (
        <div className="group/cover relative h-56 w-full overflow-hidden md:h-72">
          <Image
            src={coverUrl}
            alt="Page Cover"
            fill
            className="size-full object-cover"
            unoptimized
          />

          <div
            className={cn(
              "material",
              "absolute right-4 bottom-4 flex items-center gap-1 rounded-xl px-2 py-1",
            )}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCoverModalOpen(true)}
              className="text-xs"
            >
              Change cover
            </Button>
            <span className="text-border">|</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemoveCover}
              className="text-xs"
            >
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-end justify-end px-4">
          <div className="mb-2 flex min-h-8 items-center gap-2">
            <Button
              onClick={() => setIsCoverModalOpen(true)}
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground"
            >
              <ImageIcon className="size-3.5" />
              <span>Add cover</span>
            </Button>
          </div>
        </div>
      )}
      <CoverPickerModal
        isOpen={isCoverModalOpen}
        onClose={() => setIsCoverModalOpen(false)}
        onSelectCover={(url) => handleCover(url)}
      />
    </>
  );
}
