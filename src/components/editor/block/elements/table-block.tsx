"use client";

import { Button } from "@ui/button";
import { Plus, Trash2 } from "lucide-react";

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

  const rows: string[][] = block.properties?.cells || [
    ["Header 1", "Header 2"],
    ["Cell 1", "Cell 2"],
  ];

  const colCount = rows[0]?.length || 0;
  const rowCount = rows.length;

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
    const count = colCount || 2;
    const newRow = new Array(count).fill("");
    void updateBlockProperties(block.id, pageId, { cells: [...rows, newRow] });
  };

  const handleDeleteRow = (rowIndex: number) => {
    if (rowCount <= 1) return;

    const updatedRows = rows.filter((_, index: number) => index !== rowIndex);
    void updateBlockProperties(block.id, pageId, { cells: updatedRows });
  };

  const handleAddColumn = () => {
    const updatedRows = rows.map((r: string[]) => [...r, ""]);
    void updateBlockProperties(block.id, pageId, { cells: updatedRows });
  };

  const handleDeleteColumn = (colIndex: number) => {
    if (colCount <= 1) return;

    const updatedRows = rows.map((r: string[]) =>
      r.filter((_, index: number) => index !== colIndex),
    );
    void updateBlockProperties(block.id, pageId, { cells: updatedRows });
  };

  return (
    <div className="group/table relative my-3 w-full overflow-x-auto select-none">
      <table className="w-full border-collapse border border-border text-sm">
        <thead>
          <tr className="bg-muted/30">
            {Array.from({ length: colCount }).map((_, colIndex) => (
              <th
                key={colIndex}
                className="border border-border p-1 text-center"
              >
                <div className="flex items-center justify-between px-1 text-[10px] text-muted-foreground">
                  <span>Col {colIndex + 1}</span>
                  {colCount > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteColumn(colIndex)}
                      title="Delete column"
                    >
                      <Trash2 className="size-3" />
                    </Button>
                  )}
                </div>
              </th>
            ))}
            <th className="w-8 border-none bg-transparent" />
          </tr>
        </thead>
        <tbody>
          {rows.map((row: string[], rowIndex: number) => (
            <tr key={rowIndex} className="group/row border-b border-border">
              {row.map((cellText: string, colIndex: number) => (
                <td
                  key={colIndex}
                  className="min-w-[120px] border-r border-border bg-background p-2 focus-within:ring-1 focus-within:ring-ring"
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

              <td className="w-8 border-none pl-1">
                {rowCount > 1 && (
                  <Button
                    variant="ghost"
                    onClick={() => handleDeleteRow(rowIndex)}
                    title="Delete row"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-2 flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddRow}
          className="flex h-7 items-center gap-1 text-xs"
        >
          <Plus className="size-3" />
          Row
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddColumn}
          className="flex h-7 items-center gap-1 text-xs"
        >
          <Plus className="size-3" />
          Column
        </Button>
      </div>
    </div>
  );
}
