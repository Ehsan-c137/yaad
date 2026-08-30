import { WorkspaceHomePage } from "@/components/pages/workspace-page";

interface WorkspaceHomeProps {
  params: Promise<{ workspaceId: string }>;
}

export default function WorkspaceHome({ params }: WorkspaceHomeProps) {
  return <WorkspaceHomePage params={params} />;
}
