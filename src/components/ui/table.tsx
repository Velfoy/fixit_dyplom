"use client";

import * as React from "react";
import { cn } from "@/lib/utils/utils";
import "@/styles/ui/table.css";
import { Button } from "@/components/ui/button";

export type ColumnDef<T> = {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  className?: string;
};

type TableProps<T> = {
  data: T[];
  columns: ColumnDef<T>[];
  pageSize?: number;
  getRowKey?: (row: T, index: number) => React.Key;
  className?: string;
};

export function Table<T>({
  data,
  columns,
  pageSize = 10,
  getRowKey,
  className,
}: TableProps<T>) {
  const [page, setPage] = React.useState(1);

  const total = data.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, total);
  const pageItems = data.slice(startIndex, endIndex);

  const canPrev = currentPage > 1;
  const canNext = currentPage < totalPages;

  const handlePrev = () => {
    if (canPrev) setPage((p) => p - 1);
  };

  const handleNext = () => {
    if (canNext) setPage((p) => p + 1);
  };

  return (
    <div className={cn("table-card", className)}>
      <div className="table-wrapper">
        <table className="table-base">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="table-header-cell">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageItems.length === 0 ? (
              <tr className="table-row">
                <td className="table-cell" colSpan={columns.length}>
                  No data found.
                </td>
              </tr>
            ) : (
              pageItems.map((row, rowIndex) => {
                const rowKey = getRowKey
                  ? getRowKey(row, startIndex + rowIndex)
                  : startIndex + rowIndex;

                return (
                  <tr className="table-row" key={rowKey}>
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={cn("table-cell", col.className)}
                        data-label={col.header}
                      >
                        {col.render(row)}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="table-footer">
        <div className="table-footer-text">
          {total === 0
            ? "No rows"
            : `Showing ${startIndex + 1}–${endIndex} of ${total} items`}
        </div>
        <div className="table-footer-actions">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrev}
            disabled={!canPrev}
          >
            Previous
          </Button>
          <span className="table-footer-text">
            Page {currentPage} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNext}
            disabled={!canNext}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
