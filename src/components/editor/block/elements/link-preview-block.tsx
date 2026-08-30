"use client";

import type { SyntheticEvent } from "react";

import { ExternalLink, Globe, Loader2 } from "lucide-react";
import { useState } from "react";

import type { DocumentBlock } from "@/types/document";

import { Button } from "@/components/ui/button";
import { useEditorPageIdContext } from "@/context/use-editor-context";
import { useDocumentStore } from "@/store/document/use-document-store";

interface LinkPreviewBlockProps {
  block: DocumentBlock;
}

export function LinkPreviewBlock({ block }: LinkPreviewBlockProps) {
  const updateBlockProperties = useDocumentStore(
    (state) => state.updateBlockProperties,
  );
  const pageId = useEditorPageIdContext();
  const [inputUrl, setInputUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Stored metadata in block.properties
  const linkData = block.properties?.linkData as
    | {
        url: string;
        title: string;
        description: string;
        image: string | null;
        favicon: string;
        domain: string;
      }
    | undefined;

  const handleFetchPreview = async (e: SyntheticEvent) => {
    e.preventDefault();
    if (!inputUrl.trim()) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/link-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: inputUrl.trim() }),
      });

      if (!response.ok) {
        throw new Error("Could not retrieve metadata for this URL.");
      }

      const data = await response.json();

      void updateBlockProperties(block.id, pageId, {
        linkData: data,
        url: data.url,
      });
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to generate link preview");
    } finally {
      setIsLoading(false);
    }
  };

  // 1. Initial State: URL Input form (when no link has been set yet)
  if (!linkData) {
    return (
      <div className="my-2 w-full rounded-lg border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-800 dark:bg-neutral-900">
        <form onSubmit={handleFetchPreview} className="flex items-center gap-2">
          <Globe className="size-4 shrink-0 text-neutral-400" />
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="Paste web link here and press Enter..."
            className="flex-1 bg-transparent text-sm text-neutral-800 placeholder-neutral-400 outline-none dark:text-neutral-200"
          />
          <Button
            type="submit"
            disabled={isLoading || !inputUrl}
            className="flex items-center gap-1.5 rounded-sm bg-neutral-900 px-3 py-1 text-xs font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900"
          >
            {isLoading && <Loader2 className="size-3 animate-spin" />}
            <span>Create bookmark</span>
          </Button>
        </form>
        {errorMessage && (
          <p className="mt-2 text-xs text-red-500">{errorMessage}</p>
        )}
      </div>
    );
  }

  // 2. Rendered State: Notion-Style Bookmark Card with Thumbnail
  return (
    <div className="group my-2 w-full select-none">
      <a
        href={linkData.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex max-h-32 items-stretch overflow-hidden rounded-lg border border-neutral-200 text-left transition-colors duration-150 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800/50"
      >
        {/* Left Side: Title, Description, Favicon & Domain */}
        <div className="flex min-w-0 flex-1 flex-col justify-between overflow-hidden p-3">
          <div className="space-y-1">
            <h4 className="truncate text-sm/snug font-semibold text-neutral-800 dark:text-neutral-200">
              {linkData.title || linkData.url}
            </h4>
            {linkData.description && (
              <p className="line-clamp-2 text-xs/relaxed text-neutral-500 dark:text-neutral-400">
                {linkData.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 pt-2">
            {linkData.favicon ? (
              <img
                src={linkData.favicon}
                alt=""
                className="size-3.5 shrink-0 rounded-sm"
              />
            ) : (
              <Globe className="size-3.5 shrink-0 text-neutral-400" />
            )}
            <span className="truncate text-[11px] text-neutral-500 dark:text-neutral-400">
              {linkData.domain}
            </span>
            <ExternalLink className="ml-auto size-3 text-neutral-400 opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
        </div>

        {/* Right Side: Preview Thumbnail Image */}
        {linkData.image && (
          <div className="relative w-36 shrink-0 overflow-hidden bg-neutral-100 md:w-48 dark:bg-neutral-800">
            <img
              src={linkData.image}
              alt={linkData.title}
              className="size-full object-cover"
              onError={(e) => {
                // If image fails to load, hide thumbnail container
                (e.target as HTMLElement).parentElement?.remove();
              }}
            />
          </div>
        )}
      </a>
    </div>
  );
}
