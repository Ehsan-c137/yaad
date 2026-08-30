"use client";

import { useParams } from "next/navigation";

import { EditorShell } from "@/components/editor/editor-shell";

export default function WorkspacePage() {
  const params = useParams();
  const pageId = params.pageId as string;

  if (!pageId) {
    return (
      <div className="flex size-full items-center justify-center">
        <h1>404</h1>
      </div>
    );
  }

  return <EditorShell pageId={pageId} />;
}
