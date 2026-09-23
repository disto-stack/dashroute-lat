import { ReactNode } from 'react';

export interface Column<Row> {
  key: string;
  header: string;
  align?: 'left' | 'right' | 'center';
  width?: string | number;
  strong?: boolean;
  render?: (row: Row) => ReactNode;
}

export interface DataTableProps<Row extends Record<string, unknown>> {
  columns: Column<Row>[];
  rows: Row[];
  rowKey?: string;
  selectedKey?: string | number;
  onRowClick?: (row: Row) => void;
  /** 40px rows instead of 52px. */
  dense?: boolean;
}
