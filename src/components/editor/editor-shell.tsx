import { MainContentSkeleton } from "@ui/skeleton";
import { useEffect } from "react";

import { styles } from "@/lib/design-token";
import { EditorPageIdProvider } from "@/store/document/document-provider";
import { useDocumentStore } from "@/store/document/use-document-store";
import { useSidebarStore } from "@/store/use-sidebar-store";

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
        <div className="mx-auto max-w-3xl pb-32 pl-4 sm:px-4 md:px-12">
          <BlockCanvas />
        </div>
      </div>
    </EditorPageIdProvider>
  );
}
