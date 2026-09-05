"use client";

import { useParams } from "next/navigation";

import { EditorShell } from "@/components/editor/editor-shell";

export default function WorkspacePage() {
  const params = useParams();
  const pageId = params.pageId as string;

  return <EditorShell pageId={pageId} />;
}
