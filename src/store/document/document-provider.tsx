import { DocumentPageIdContext } from "@/context/use-editor-context";

export function EditorPageIdProvider({
  pageId,
  children,
}: {
  pageId: string;
  children: React.ReactNode;
}) {
  return (
    <DocumentPageIdContext value={pageId}>{children}</DocumentPageIdContext>
  );
}
