"use client";

import { useParams } from "next/navigation";

import GraphPage from "@/components/pages/graph-page";

export default function PageGraphPage() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  const pageId = params.pageId as string;

  return <GraphPage workspaceId={workspaceId} pageId={pageId} />;
}
