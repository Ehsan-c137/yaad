"use client";

import { use } from "react";

import { RecentDocsList } from "@/components/pages/recent-docs-list";
import { useWorkspaceStore } from "@/store/use-workspace-store";

interface WorkspaceHomePageProps {
  params: Promise<{ workspaceId: string }>;
}

export function WorkspaceHomePage({ params }: WorkspaceHomePageProps) {
  const pageParams = use(params);
  const { workspaceId } = pageParams;

  const workspace = useWorkspaceStore((s) => s.workspaces[workspaceId]);

  if (!workspace) return null;

  return (
    <div className="mx-auto max-w-4xl px-12 py-16">
      <div className="mb-4 flex items-center gap-3">
        <span className="text-4xl">{workspace.icon}</span>
        <h1 className="text-3xl font-semibold tracking-tight">
          {workspace.name}
        </h1>
      </div>
      <p className="text-sm text-muted-foreground">
        Select a page from the sidebar or press{" "}
        <kbd className="rounded-md border border-border bg-muted px-1.5 py-0.5 font-mono text-xs">
          ⌘K
        </kbd>{" "}
        /{" "}
        <kbd className="rounded-md border border-border bg-muted px-1.5 py-0.5 font-mono text-xs">
          Ctrl+K
        </kbd>{" "}
        to search.
      </p>
      <RecentDocsList workspaceId={workspaceId} />
    </div>
  );
}
