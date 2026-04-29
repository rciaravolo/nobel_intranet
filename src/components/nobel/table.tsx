// Nobel Table — dense data table §5.4
// File: src/components/nobel/table.tsx

import * as React from "react";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: keyof T | string;
  header: string;
  align?: "left" | "right" | "center";
  render?: (value: unknown, row: T, index: number) => React.ReactNode;
  numeric?: boolean; // forces align right + font-mono
}

export interface NobelTableProps<T> {
  columns: Column<T>[];
  data: T[];
  density?: "compact" | "balanced" | "cozy";
  className?: string;
  onRowClick?: (row: T) => void;
  keyExtractor?: (row: T, index: number) => string | number;
}

const densityVars: Record<string, React.CSSProperties> = {
  compact:  { "--row-h": "30px", "--pad-x": "12px", "--pad-y": "6px" } as React.CSSProperties,
  balanced: { "--row-h": "36px", "--pad-x": "14px", "--pad-y": "8px" } as React.CSSProperties,
  cozy:     { "--row-h": "44px", "--pad-x": "16px", "--pad-y": "12px" } as React.CSSProperties,
};

function getColAlign(col: Column<unknown>): "left" | "right" | "center" {
  if (col.numeric) return "right";
  return col.align ?? "left";
}

const alignClass: Record<"left" | "right" | "center", string> = {
  left:   "text-left",
  right:  "text-right",
  center: "text-center",
};

export function NobelTable<T>({
  columns,
  data,
  density = "balanced",
  className,
  onRowClick,
  keyExtractor,
}: NobelTableProps<T>): React.JSX.Element {
  return (
    <div
      data-density={density}
      style={densityVars[density]}
      className={cn("w-full overflow-x-auto", className)}
    >
      <table className="w-full border-collapse">
        {/* Header */}
        <thead>
          <tr>
            {columns.map((col) => {
              const align = getColAlign(col as Column<unknown>);
              return (
                <th
                  key={String(col.key)}
                  className={cn(
                    "font-mono text-[11px] uppercase tracking-[0.14em]",
                    "text-[var(--fg-faint)] bg-transparent",
                    "border-b border-[var(--line)]",
                    "px-[var(--pad-x,14px)] py-[var(--pad-y,8px)]",
                    "font-medium whitespace-nowrap",
                    alignClass[align]
                  )}
                >
                  {col.header}
                </th>
              );
            })}
          </tr>
        </thead>

        {/* Body */}
        <tbody>
          {data.map((row, rowIndex) => {
            const rowKey = keyExtractor
              ? keyExtractor(row, rowIndex)
              : rowIndex;

            return (
              <tr
                key={rowKey}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn(
                  "bg-white border-b border-[var(--line)]",
                  "transition-colors duration-[120ms]",
                  "hover:bg-[var(--n-50)]",
                  onRowClick && "cursor-pointer"
                )}
                style={{ height: "var(--row-h, 36px)" }}
              >
                {columns.map((col) => {
                  const align = getColAlign(col as Column<unknown>);
                  const rawValue =
                    typeof col.key === "string" && col.key.includes(".")
                      ? col.key
                          .split(".")
                          .reduce(
                            (obj: unknown, k) =>
                              obj != null &&
                              typeof obj === "object" &&
                              k in (obj as object)
                                ? (obj as Record<string, unknown>)[k]
                                : undefined,
                            row as unknown
                          )
                      : (row as Record<string, unknown>)[col.key as string];

                  const cell = col.render
                    ? col.render(rawValue, row, rowIndex)
                    : rawValue != null
                    ? String(rawValue)
                    : "—";

                  return (
                    <td
                      key={String(col.key)}
                      className={cn(
                        "px-[var(--pad-x,14px)] py-[var(--pad-y,8px)]",
                        "text-[13.5px] text-[var(--fg)]",
                        col.numeric && "font-mono [font-feature-settings:'tnum']",
                        alignClass[align]
                      )}
                    >
                      {cell as React.ReactNode}
                    </td>
                  );
                })}
              </tr>
            );
          })}

          {data.length === 0 && (
            <tr>
              <td
                colSpan={columns.length}
                className="text-center py-8 text-[var(--fg-faint)] text-[12px] font-mono uppercase tracking-[0.14em]"
              >
                Sem dados
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
