import { documentService } from "@yaad/core/services/document-service";
import { useCallback, useEffect, useState } from "react";

export type CoverStatus = "error" | "idle" | "loaded" | "loading" | "resolving";

export interface CoverResolutionResult {
  displayUrl: string | undefined;
  status: CoverStatus;
  setImageLoaded: () => void;
  setImageError: () => void;
  retry: () => void;
}

export function useCoverResolution(
  coverImage: string | undefined,
): CoverResolutionResult {
  const [displayUrl, setDisplayUrl] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState<CoverStatus>("idle");
  const [retryCounter, setRetryCounter] = useState(0);

  useEffect(() => {
    let active = true;
    let createdObjectUrl: string | null = null;

    if (!coverImage) {
      setDisplayUrl(undefined);
      setStatus("idle");
      return;
    }

    if (coverImage.startsWith("blob_")) {
      setStatus("resolving");
      void documentService
        .getBlob(coverImage)
        .then((blob) => {
          if (!active) return;
          if (blob) {
            createdObjectUrl = URL.createObjectURL(blob);
            setDisplayUrl(createdObjectUrl);
            setStatus("loading");
          } else {
            setDisplayUrl(undefined);
            setStatus("error");
          }
        })
        .catch(() => {
          if (!active) return;
          setDisplayUrl(undefined);
          setStatus("error");
        });
    } else {
      setDisplayUrl(coverImage);
      setStatus("loading");
    }

    return () => {
      active = false;

      if (createdObjectUrl) {
        URL.revokeObjectURL(createdObjectUrl);
      }
    };
  }, [coverImage, retryCounter]);

  const setImageLoaded = useCallback(() => {
    setStatus("loaded");
  }, []);

  const setImageError = useCallback(() => {
    setStatus("error");
  }, []);

  const retry = useCallback(() => {
    setRetryCounter((prev) => prev + 1);
  }, []);

  return {
    displayUrl,
    status,
    setImageLoaded,
    setImageError,
    retry,
  };
}
