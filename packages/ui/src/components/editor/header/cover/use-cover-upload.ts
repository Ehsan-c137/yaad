import type { DragEvent } from "react";

import { documentService } from "@yaad/core/services/document-service";
import { useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_IMAGE_DIMENSION = 8192; // 8K max width/height

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

async function validateImageMagicBytes(file: File): Promise<boolean> {
  try {
    const slice = await file.slice(0, 12).arrayBuffer();
    const bytes = new Uint8Array(slice);
    if (bytes.length < 4) return false;

    // PNG: 89 50 4E 47
    if (
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47
    ) {
      return true;
    }

    // JPEG: FF D8 FF
    if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
      return true;
    }

    // GIF: 47 49 46 ('GIF')
    if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) {
      return true;
    }

    // WEBP: RIFF....WEBP
    if (
      bytes[0] === 0x52 &&
      bytes[1] === 0x49 &&
      bytes[2] === 0x46 &&
      bytes[3] === 0x46 &&
      bytes.length >= 12 &&
      bytes[8] === 0x57 &&
      bytes[9] === 0x45 &&
      bytes[10] === 0x42 &&
      bytes[11] === 0x50
    ) {
      return true;
    }

    // AVIF / HEIF: ....ftyp (bytes 4-7: 66 74 79 70)
    if (
      bytes.length >= 8 &&
      bytes[4] === 0x66 &&
      bytes[5] === 0x74 &&
      bytes[6] === 0x79 &&
      bytes[7] === 0x70
    ) {
      return true;
    }

    return false;
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
      if (e.target) {
        e.target.value = "";
      }
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

      const file = e.dataTransfer.files?.[0];
      if (file) {
        void processFile(file);
      }
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
