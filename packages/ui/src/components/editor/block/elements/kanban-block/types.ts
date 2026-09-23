import type { DocumentBlock } from "@yaad/core/types/document";

export interface KanbanColumn {
  id: string;
  title: string;
}

export interface KanbanCard {
  id: string;
  columnId: string;
  title: string;
}

export interface KanbanBlockProps {
  block: DocumentBlock;
}

export interface ColumnStyleTokens {
  container: string;
  headerText: string;
  badge: string;
  dot: string;
  addCardBtn: string;
}

export interface KanbanColumnProps {
  column: KanbanColumn;
  cards: KanbanCard[];
  isFirstCol: boolean;
  isLastCol: boolean;
  totalColumns: number;
}

export interface KanbanCardProps {
  card: KanbanCard;
  isFirstCol: boolean;
  isLastCol: boolean;
}

export interface AddCardFormProps {
  columnId: string;
  colStyles: ColumnStyleTokens;
}
