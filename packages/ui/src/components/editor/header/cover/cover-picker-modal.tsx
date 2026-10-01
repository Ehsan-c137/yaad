import { Link2, Palette, UploadCloud } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import type { CoverPickerModalProps } from "./cover-picker-types";

import { CoverGalleryTab } from "./tabs/gallery-tab";
import { CoverLinkTab } from "./tabs/link-tab";
import { CoverUploadTab } from "./tabs/upload-tab";

export function CoverPickerModal({
  isOpen,
  onClose,
  onSelectCover,
  currentCover,
}: CoverPickerModalProps) {
  const { t } = useTranslation("editor");
  const [activeTab, setActiveTab] = useState("gallery");

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <DialogContent className="p-5 sm:max-w-2xl max-h-[88vh] flex flex-col gap-3 overflow-hidden">
        <DialogHeader className="pb-1">
          <DialogTitle className="text-base font-semibold">
            {t("changeCover")}
          </DialogTitle>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full flex flex-col flex-1 overflow-hidden"
        >
          <TabsList variant="segmented" className="w-full grid grid-cols-3">
            <TabsTrigger
              value="gallery"
              className="flex items-center justify-center gap-1.5"
            >
              <Palette className="size-3.5" />
              <span>{t("coverGallery")}</span>
            </TabsTrigger>
            <TabsTrigger
              value="upload"
              className="flex items-center justify-center gap-1.5"
            >
              <UploadCloud className="size-3.5" />
              <span>{t("coverUpload")}</span>
            </TabsTrigger>
            <TabsTrigger
              value="link"
              className="flex items-center justify-center gap-1.5"
            >
              <Link2 className="size-3.5" />
              <span>{t("coverLink")}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="gallery"
            keepMounted
            className="flex-1 flex flex-col gap-3 pt-3 overflow-hidden"
          >
            <CoverGalleryTab
              onSelectCover={onSelectCover}
              onClose={onClose}
              currentCover={currentCover}
            />
          </TabsContent>

          <TabsContent
            value="upload"
            keepMounted
            className="pt-3 flex flex-col gap-3"
          >
            <CoverUploadTab
              onSelectCover={onSelectCover}
              onClose={onClose}
              currentCover={currentCover}
            />
          </TabsContent>

          <TabsContent value="link" keepMounted className="pt-3">
            <CoverLinkTab
              onSelectCover={onSelectCover}
              onClose={onClose}
              currentCover={currentCover}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
