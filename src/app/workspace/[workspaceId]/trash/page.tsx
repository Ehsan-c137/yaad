"use client";

import { useParams } from "next/navigation";

import { TrashPage } from "@/components/pages/trash-page";

export default function WorkspaceTrashPage() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;

  return <TrashPage workspaceId={workspaceId} />;
}
