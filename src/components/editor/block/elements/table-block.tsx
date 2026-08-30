"use client";

import { Button } from "@ui/button";

import type { DocumentBlock } from "@/types/document";

import { useEditorPageIdContext } from "@/context/use-editor-context";
import { useDocumentStore } from "@/store/document/use-document-store";

interface TableBlockProps {
  block: DocumentBlock;
}

export function TableBlock({ block }: TableBlockProps) {
  const updateBlockProperties = useDocumentStore(
    (state) => state.updateBlockProperties,
  );
  const pageId = useEditorPageIdContext();

  // Initialize or fetch matrix cells (2x2 default)
  const rows = block.properties?.cells || [
    ["Header 1", "Header 2"],
    ["Cell 1", "Cell 2"],
  ];

  const handleCellChange = (
    rowIndex: number,
    colIndex: number,
    val: string,
  ) => {
    const updatedRows = rows.map((r: string[]) => [...r]);
    updatedRows[rowIndex][colIndex] = val;
    void updateBlockProperties(block.id, pageId, { cells: updatedRows });
  };

  const handleAddRow = () => {
    const colCount = rows[0]?.length || 2;
    const newRow = new Array(colCount).fill("");
    void updateBlockProperties(block.id, pageId, { cells: [...rows, newRow] });
  };

  const handleAddColumn = () => {
    const updatedRows = rows.map((r: string[]) => [...r, ""]);
    void updateBlockProperties(block.id, pageId, { cells: updatedRows });
  };

  return (
    <div className="my-2 w-full overflow-x-auto select-none">
      <table className="w-full border-collapse border border-border text-sm">
        <tbody>
          {rows.map((row: string[], rowIndex: number) => (
            <tr key={rowIndex} className="border-b border-border">
              {row.map((cellText: string, colIndex: number) => (
                <td
                  key={colIndex}
                  className="min-w-[120px] border-r border-border bg-background p-2 hover:bg-accent"
                >
                  <input
                    type="text"
                    value={cellText}
                    onChange={(e) =>
                      handleCellChange(rowIndex, colIndex, e.target.value)
                    }
                    className="w-full bg-transparent text-foreground outline-none"
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Table Expansion Controls */}
      <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
        <Button onClick={handleAddRow} className="hover:text-foreground">
          + Add Row
        </Button>
        <Button onClick={handleAddColumn} className="hover:text-foreground">
          + Add Column
        </Button>
      </div>
    </div>
  );
}
