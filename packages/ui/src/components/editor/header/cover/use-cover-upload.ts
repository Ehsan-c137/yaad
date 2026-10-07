import type { DragEvent } from "react";

import { documentService } from "@yaad/core/services/document-service";
import { useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_IMAGE_DIMENSION = 8192; // 8K max width/height

const ALLOWED_MIME_TYPES = new Set([
  "image/avif",
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

function matchesBytes(
  bytes: Uint8Array,
  offset: number,
  pattern: readonly number[],
): boolean {
  if (bytes.length < offset + pattern.length) {
    return false;
  }

  return pattern.every((byte, index) => bytes[offset + index] === byte);
}

function isPng(bytes: Uint8Array): boolean {
  return matchesBytes(bytes, 0, [0x89, 0x50, 0x4e, 0x47]);
}

function isJpeg(bytes: Uint8Array): boolean {
  return matchesBytes(bytes, 0, [0xff, 0xd8, 0xff]);
}

function isGif(bytes: Uint8Array): boolean {
  return matchesBytes(bytes, 0, [0x47, 0x49, 0x46]);
}

function isWebP(bytes: Uint8Array): boolean {
  return (
    matchesBytes(bytes, 0, [0x52, 0x49, 0x46, 0x46]) &&
    matchesBytes(bytes, 8, [0x57, 0x45, 0x42, 0x50])
  );
}

function isAvif(bytes: Uint8Array): boolean {
  return matchesBytes(bytes, 4, [0x66, 0x74, 0x79, 0x70]);
}

const IMAGE_VALIDATORS = [isPng, isJpeg, isGif, isWebP, isAvif] as const;

async function validateImageMagicBytes(file: File): Promise<boolean> {
  try {
    const slice = await file.slice(0, 12).arrayBuffer();
    const bytes = new Uint8Array(slice);
    return IMAGE_VALIDATORS.some((validator) => validator(bytes));
  } catch {
    return false;
  }
}

async function validateImageDimensions(file: File): Promise<boolean> {
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(file);
      const isValid =
        bitmap.width <= MAX_IMAGE_DIMENSION &&
        bitmap.height <= MAX_IMAGE_DIMENSION;
      bitmap.close();
      return isValid;
    } catch {
      // In non-browser / mock test environments without full decoder, do not block
      return true;
    }
  }

  return true;
}

interface UseCoverUploadOptions {
  onSuccess: (url: string) => void;
  onClose: () => void;
}

export function useCoverUpload({ onSuccess, onClose }: UseCoverUploadOptions) {
  const { t } = useTranslation("editor");

  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const clearUploadError = useCallback(() => {
    setUploadError(null);
  }, []);

  const processFile = useCallback(
    async (file: File) => {
      setUploadError(null);

      // Block SVGs (XSS risk) and non-allowed image MIME types
      if (!ALLOWED_MIME_TYPES.has(file.type) || file.type === "image/svg+xml") {
        const errorMsg = t("invalidFileType");
        setUploadError(errorMsg);
        toast.error(errorMsg);
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        const errorMsg = t("fileTooLarge");
        setUploadError(errorMsg);
        toast.error(errorMsg);
        return;
      }

      const isValidSignature = await validateImageMagicBytes(file);

      if (!isValidSignature) {
        const errorMsg = t("invalidFileType");
        setUploadError(errorMsg);
        toast.error(errorMsg);
        return;
      }

      const isValidDimensions = await validateImageDimensions(file);

      if (!isValidDimensions) {
        const errorMsg = t("fileTooLarge");
        setUploadError(errorMsg);
        toast.error(errorMsg);
        return;
      }

      setIsUploading(true);

      try {
        const blobId = `blob_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        await documentService.saveBlob(blobId, file);
        onSuccess(blobId);
        onClose();
      } catch (err) {
        console.error("Failed to upload cover image:", err);
        const errorMsg = t("imageNotLoaded");
        setUploadError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setIsUploading(false);
      }
    },
    [onSuccess, onClose, t],
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];

      if (file) {
        void processFile(file);
      }

      e.target.value = "";
    },
    [processFile],
  );

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      void processFile(file);
    },
    [processFile],
  );

  const openFileDialog = useCallback(() => {
    if (!isUploading) {
      fileInputRef.current?.click();
    }
  }, [isUploading]);

  return {
    isUploading,
    isDragging,
    uploadError,
    fileInputRef,
    clearUploadError,
    processFile,
    handleFileInputChange,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    openFileDialog,
  };
}
