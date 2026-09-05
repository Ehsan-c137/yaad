"use client";

import { use } from "react";

import { WorkspaceHomePage } from "@/components/pages/workspace-page";
import { useWorkspaceStore } from "@/store/use-workspace-store";

interface WorkspaceHomeProps {
  params: Promise<{ workspaceId: string }>;
}

export default function WorkspaceHome({ params }: WorkspaceHomeProps) {
  const { workspaceId } = use(params);
  const workspace = useWorkspaceStore((s) => s.workspaces[workspaceId]);

  return <WorkspaceHomePage workspace={workspace} />;
}
