"use client";

import { useParams } from "next/navigation";

import GraphPage from "@/components/pages/graph-page";

export default function WorkspaceGraphPage() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;

  return <GraphPage workspaceId={workspaceId} />;
}
