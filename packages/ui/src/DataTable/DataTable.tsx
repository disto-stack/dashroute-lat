import React from 'react';
import { DataTableProps } from './DataTable.types';
import styles from './DataTable.module.css';

export function DataTable<Row extends Record<string, unknown>>({
  columns,
  rows,
  rowKey = 'id',
  selectedKey,
  onRowClick,
  dense = false,
}: DataTableProps<Row>) {
  return (
    <div className={[styles.wrap, dense && styles.dense].filter(Boolean).join(' ')}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} scope="col" style={{ textAlign: column.align || 'left', width: column.width }}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const key = row[rowKey] as string | number;
            const selected = selectedKey != null && key === selectedKey;
            return (
              <tr
                key={key}
                className={[onRowClick && styles.clickable, selected && styles.selected].filter(Boolean).join(' ')}
                aria-selected={onRowClick ? selected : undefined}
                tabIndex={onRowClick ? 0 : undefined}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                onKeyDown={
                  onRowClick
                    ? (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onRowClick(row);
                        }
                      }
                    : undefined
                }
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={column.strong ? styles.strong : undefined}
                    style={{ textAlign: column.align || 'left' }}
                  >
                    {column.render ? column.render(row) : (row[column.key] as React.ReactNode)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
