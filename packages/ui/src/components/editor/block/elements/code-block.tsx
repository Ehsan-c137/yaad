"use client";

import type { DocumentBlock } from "@yaad/core/types/document";

import { styles } from "@yaad/core/lib/design-token";
import { useEffect, useState } from "react";
import { bundledLanguages, codeToHtml } from "shiki";

import { useEditorPageIdContext } from "@/context/use-editor-context";
import { useDocumentStore } from "@/hooks/editor/use-document-store-ui";
import { cn } from "@/lib/utils";

import { EditableContent } from "../editable-content";

interface CodeBlockProps {
  block: DocumentBlock;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const languageOptions = Object.keys(bundledLanguages ?? {}).sort((a, b) =>
  a.localeCompare(b),
);

function formatLanguageLabel(language: string) {
  const normalized = language
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (match) => match.toUpperCase());

  const labels: Record<string, string> = {
    Ts: "TypeScript",
    Js: "JavaScript",
    Html: "HTML",
    Css: "CSS",
    Json: "JSON",
    Rs: "Rust",
  };

  return labels[normalized] ?? normalized;
}

function normalizeLanguage(language: string) {
  const normalized = language.toLowerCase();

  const aliases: Record<string, string> = {
    ts: "typescript",
    typescript: "typescript",
    js: "javascript",
    javascript: "javascript",
    jsx: "jsx",
    tsx: "tsx",
    html: "html",
    htm: "html",
    css: "css",
    json: "json",
    rs: "rust",
    rust: "rust",
  };

  return (
    aliases[normalized] ??
    (languageOptions.includes(normalized) ? normalized : "typescript")
  );
}

export function CodeBlock({ block }: CodeBlockProps) {
  const updateBlockProperties = useDocumentStore(
    (state) => state.updateBlockProperties,
  );
  const pageId = useEditorPageIdContext();
  const deleteBlock = useDocumentStore((state) => state.deleteBlock);

  const text = block.properties?.title?.[0]?.text ?? "";
  const language = normalizeLanguage(
    block.properties?.language ?? "typescript",
  );
  const [highlightedHtml, setHighlightedHtml] = useState("");

  useEffect(() => {
    let isMounted = true;

    const renderHighlightedCode = async () => {
      if (!text) {
        if (isMounted) setHighlightedHtml("");
        return;
      }

      try {
        const html = await codeToHtml(text, {
          lang: language,
          theme: "github-dark",
        });

        if (isMounted) {
          setHighlightedHtml(html);
        }
      } catch {
        if (isMounted) {
          setHighlightedHtml(`<pre><code>${escapeHtml(text)}</code></pre>`);
        }
      }
    };

    void renderHighlightedCode();

    return () => {
      isMounted = false;
    };
  }, [language, text]);

  return (
    <div
      className={cn(
        styles.menuDark,
        "my-2 w-full overflow-hidden rounded-lg border border-border font-mono text-sm",
      )}
    >
      <div className="flex items-center justify-between border-b border-border px-3 py-1.5 text-xs text-background select-none">
        <select
          value={language}
          onChange={(e) =>
            updateBlockProperties(block.id, pageId, {
              language: e.target.value,
            })
          }
          className="cursor-pointer border-none bg-transparent text-background outline-none"
        >
          {languageOptions.map((languageName) => (
            <option
              key={languageName}
              value={languageName}
              className="bg-background text-foreground"
            >
              {formatLanguageLabel(languageName)}
            </option>
          ))}
        </select>
      </div>

      <div className="relative overflow-x-auto p-3">
        {highlightedHtml ? (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 overflow-x-auto p-3"
            dangerouslySetInnerHTML={{ __html: highlightedHtml }}
          />
        ) : null}

        <EditableContent
          html={text}
          placeholder="// Type code here..."
          className="relative z-10 min-h-[24px] w-full bg-transparent font-mono text-sm/relaxed text-transparent caret-background selection:bg-white/15"
          onChange={(newText: string) =>
            updateBlockProperties(block.id, pageId, {
              title: [{ text: newText }],
            })
          }
          onEnter={() => {
            // Shift+Enter handles multiline inside code
          }}
          onBackspaceEmpty={() => deleteBlock(block.id)}
        />
      </div>
    </div>
  );
}
