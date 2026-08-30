import { useEffect } from "react";

import { styles } from "@/lib/design-token";
import { EditorPageIdProvider } from "@/store/document/document-provider";
import { useDocumentStore } from "@/store/document/use-document-store";

import { BlockCanvas } from "./block-canvas";
import { PageHeader } from "./header/page-header";

interface EditorShellProps {
  pageId: string;
}

export function EditorShell({ pageId }: EditorShellProps) {
  const loadDocument = useDocumentStore((state) => state.loadDocument, pageId);

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

  return (
    <EditorPageIdProvider pageId={pageId}>
      <div className={styles.editorSurface}>
        <PageHeader />
        <div className="mx-auto max-w-3xl px-4 pb-32 md:px-12">
          <BlockCanvas />
        </div>
      </div>
    </EditorPageIdProvider>
  );
}
