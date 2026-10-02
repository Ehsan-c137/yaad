import { AlertCircle, ImageIcon, RefreshCw } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Image } from "@/components/ui/image";
import { useDocumentStore } from "@/hooks/editor/use-document-store-ui";
import { cn } from "@/lib/utils";

import { CoverPickerModal } from "./cover-picker-modal";
import { useCoverResolution } from "./use-cover-resolution";

export function PageHeaderCover() {
  const { t } = useTranslation("editor");
  const [isCoverModalOpen, setIsCoverModalOpen] = useState(false);

  const coverImage = useDocumentStore(
    (state) => state.currentDocument?.coverImage,
  );
  const updatePageCover = useDocumentStore((store) => store.updateCoverImage);
  const removeCoverImage = useDocumentStore((store) => store.removeCoverImage);

  const { displayUrl, status, setImageLoaded, setImageError, retry } =
    useCoverResolution(coverImage);

  const hasCover = Boolean(coverImage);
  const isLoaded = status === "loaded";
  const isResolvingOrLoading = status === "resolving" || status === "loading";
  const hasError = status === "error";

  const handleSelectCover = async (url: string) => {
    await updatePageCover(url);
  };

  const handleRemoveCover = async () => {
    await removeCoverImage();
  };

  if (!hasCover) {
    return (
      <>
        <div className="flex items-end justify-end px-4">
          <div className="mb-2 flex min-h-8 items-center gap-2 animate-page-cover-actions">
            <Button
              onClick={() => setIsCoverModalOpen(true)}
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground"
            >
              <ImageIcon className="size-3.5" />
              <span>{t("addCover")}</span>
            </Button>
          </div>
        </div>

        <CoverPickerModal
          isOpen={isCoverModalOpen}
          onClose={() => setIsCoverModalOpen(false)}
          onSelectCover={(url) => void handleSelectCover(url)}
          currentCover={coverImage}
        />
      </>
    );
  }

  return (
    <>
      <section
        className={cn(
          "group/cover relative w-full overflow-hidden bg-muted/30 md:h-72 h-56",
          "animate-page-cover",
        )}
        aria-label={t("pageCover", "Page Cover")}
      >
        {isResolvingOrLoading && (
          <div
            data-slot="cover-skeleton"
            className="absolute inset-0 bg-muted/40 animate-pulse pointer-events-none"
          />
        )}

        {hasError ? (
          <div className="flex size-full flex-col items-center justify-center gap-2 bg-muted/50 p-4 text-muted-foreground">
            <div className="flex items-center gap-2 text-sm font-medium">
              <AlertCircle className="size-4 text-destructive" />
              <span>{t("imageNotLoaded")}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={retry}
                className="h-7 text-xs"
              >
                <RefreshCw className="size-3 me-1" />
                {t("retry", "Retry")}
              </Button>
            </div>
          </div>
        ) : (
          displayUrl && (
            <Image
              data-slot="cover-image"
              src={displayUrl}
              alt={t("pageCover", "Page Cover")}
              fill
              priority
              className={cn(
                "size-full object-cover transition-[opacity,filter,transform] duration-500 ease-out",
                isLoaded
                  ? "opacity-100 scale-100 blur-0"
                  : "opacity-0 scale-105 blur-sm",
              )}
              onLoad={setImageLoaded}
              onError={setImageError}
            />
          )
        )}

        {(isLoaded || hasError) && (
          <div
            className={cn(
              "material",
              "absolute end-4 bottom-4 flex items-center gap-1 rounded-xl px-2 py-1",
              "opacity-0 transition-opacity duration-200 group-hover/cover:opacity-100 focus-within:opacity-100",
              hasError && "opacity-100",
              "animate-page-cover-actions",
            )}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCoverModalOpen(true)}
              className="text-xs"
            >
              {t("changeCover")}
            </Button>
            <span className="text-border" aria-hidden="true">
              |
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => void handleRemoveCover()}
              className="text-xs"
            >
              {t("removeCover")}
            </Button>
          </div>
        )}
      </section>

      <CoverPickerModal
        isOpen={isCoverModalOpen}
        onClose={() => setIsCoverModalOpen(false)}
        onSelectCover={(url) => void handleSelectCover(url)}
        currentCover={coverImage}
      />
    </>
  );
}
