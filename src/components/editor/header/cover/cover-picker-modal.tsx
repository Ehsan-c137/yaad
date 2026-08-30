// src/components/editor/header/CoverPickerModal.tsx
"use client";

import { Sparkles } from "lucide-react";
import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const COVER_PRESETS = [
  "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1600&q=80", // Gradient
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1600&q=80", // Fluid Art
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80", // Ocean
  "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1600&q=80", // Mountains
  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80", // Space Earth
  "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1600&q=80", // Aurora
];

interface CoverPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCover: (url: string) => void;
}

export function CoverPickerModal({
  isOpen,
  onClose,
  onSelectCover,
}: CoverPickerModalProps) {
  const [customUrl, setCustomUrl] = useState("");

  const handleApplyCustomLink = (e: React.FormEvent) => {
    e.preventDefault();

    if (customUrl.trim()) {
      onSelectCover(customUrl.trim());
      setCustomUrl("");
      onClose();
    }
  };

  const handleRandomUnsplash = () => {
    const randomUrl = `https://images.unsplash.com/photo-${Date.now()}?auto=format&fit=crop&w=1600&q=80`;
    onSelectCover(randomUrl);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="p-6 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">
            Change cover
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="gallery" className="mt-2 w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="gallery">Gallery</TabsTrigger>
            <TabsTrigger value="link">Link</TabsTrigger>
          </TabsList>

          {/* Gallery Tab */}
          <TabsContent value="gallery" className="space-y-4 pt-3">
            <div className="grid max-h-56 grid-cols-3 gap-2.5 overflow-y-auto pr-1">
              {COVER_PRESETS.map((url, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    onSelectCover(url);
                    onClose();
                  }}
                  className="group relative h-20 w-full overflow-hidden rounded-md border border-border transition-all outline-none hover:opacity-85 focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <img
                    src={url}
                    alt={`Preset ${index + 1}`}
                    className="size-full object-cover transition-transform duration-200 group-hover:scale-105"
                  />
                </button>
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleRandomUnsplash}
              className="flex w-full items-center justify-center gap-2 text-xs"
            >
              <Sparkles className="size-3.5 text-amber-500" />
              <span>Random Unsplash Image</span>
            </Button>
          </TabsContent>

          {/* Link Tab */}
          <TabsContent value="link" className="pt-3">
            <form onSubmit={handleApplyCustomLink} className="space-y-3">
              <Input
                type="url"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="Paste an image link (https://...)"
                autoFocus
              />
              <Button
                type="submit"
                disabled={!customUrl.trim()}
                className="w-full text-xs font-medium"
              >
                Submit
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
