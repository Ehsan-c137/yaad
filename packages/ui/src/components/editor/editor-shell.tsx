import { useSidebarStore } from "@yaad/core/store/use-sidebar-store";
import { useEffect, useState } from "react";
import { useParams } from "react-router";

import { CollabProvider } from "@/context/collab-context";
import { useDocumentStore } from "@/hooks/editor/use-document-store-ui";
import { styles } from "@/lib/design-token";
import { EditorPageIdProvider } from "@/providers/document-provider";

import { EditorPermissionsProvider } from "@/context/editor-permissions-context";
import { useWorkspacePermissions } from "@/hooks/workspace/use-workspace-permissions";
import { BlockCanvas } from "./block-canvas";
import { BlockCanvasSkeleton } from "./block-canvas-skeleton";
import { PageHeader } from "./header/page-header";
import { PageTrashBar } from "./header/page-trash-bar";

interface EditorShellProps {
  pageId: string;
}

export function EditorShell({ pageId }: EditorShellProps) {
  const { workspaceId = "ws_personal" } = useParams<{ workspaceId: string }>();
  const loadDocument = useDocumentStore((state) => state.loadDocument, pageId);
  const isDeleted = useSidebarStore((s) => s.pages[pageId]?.isDeleted);
  const hasHydrated = useDocumentStore((state) => state._hasHydrated, pageId);
  const permissions = useWorkspacePermissions(workspaceId);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const loadDoc = async () => {
      try {
        if (!pageId) return;
        setLoadError(null);
        await loadDocument(pageId);
      } catch (err) {
        if (isMounted) {
          console.error(`[EditorShell] Failed to load page ${pageId}:`, err);
          setLoadError(err instanceof Error ? err.message : "Failed to load document");
        }
      }
    };

    void loadDoc();
    return () => {
      isMounted = false;
    };
  }, [pageId, loadDocument]);

  return (
    <EditorPageIdProvider pageId={pageId}>
      <EditorPermissionsProvider value={permissions}>
        <CollabProvider workspaceId={workspaceId} pageId={pageId}>
          <div className={styles.editorSurface}>
            {isDeleted && <PageTrashBar pageId={pageId} />}
            <PageHeader />
            <div
              key={pageId}
              className="mx-auto pb-32 sm:px-4 md:px-12 animate-page-body"
            >
              {loadError ? (
                <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
                  <p className="mb-4 text-sm">{loadError}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setLoadError(null);
                      void loadDocument(pageId);
                    }}
                    className="rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground hover:bg-primary/90"
                  >
                    Retry loading
                  </button>
                </div>
              ) : hasHydrated ? (
                <BlockCanvas />
              ) : (
                <BlockCanvasSkeleton />
              )}
            </div>
          </div>
        </CollabProvider>
      </EditorPermissionsProvider>
    </EditorPageIdProvider>
  );
}
