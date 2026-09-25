import { MainContentSkeleton } from "@ui/skeleton";
import { styles } from "@yaad/core/lib/design-token";
import { useSidebarStore } from "@yaad/core/store/use-sidebar-store";
import { useEffect } from "react";

import { useDocumentStore } from "@/hooks/editor/use-document-store-ui";
import { EditorPageIdProvider } from "@/providers/document-provider";

import { BlockCanvas } from "./block-canvas";
import { PageHeader } from "./header/page-header";
import { PageTrashBar } from "./header/page-trash-bar";

interface EditorShellProps {
  pageId: string;
}

export function EditorShell({ pageId }: EditorShellProps) {
  const loadDocument = useDocumentStore((state) => state.loadDocument, pageId);
  const isDeleted = useSidebarStore((s) => s.pages[pageId]?.isDeleted);
  const hasHydrated = useDocumentStore((state) => state._hasHydrated, pageId);

  useEffect(() => {
    const loadDoc = async () => {
      try {
        if (!pageId) return;

        await loadDocument(pageId);
      } catch {
        console.log("oops cant load page Id");
      }
    };

    void loadDoc();
  }, [pageId, loadDocument]);

  if (!hasHydrated) {
    return <MainContentSkeleton />;
  }

  return (
    <EditorPageIdProvider pageId={pageId}>
      <div className={styles.editorSurface}>
        {isDeleted && <PageTrashBar pageId={pageId} />}
        <PageHeader />
        <div className="mx-auto pb-32 sm:px-4 md:px-12">
          <BlockCanvas />
        </div>
      </div>
    </EditorPageIdProvider>
  );
}
