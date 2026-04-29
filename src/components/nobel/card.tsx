// Nobel Card — floating card §4.3 + §5
// File: src/components/nobel/card.tsx

import * as React from "react";
import { cn } from "@/lib/utils";

export interface NobelCardProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;   // buttons/controls in header right
  children: React.ReactNode;
  accent?: boolean;            // 2px solid --c-gold top border (no gradient)
  className?: string;
  noPadding?: boolean;         // for edge-to-edge content (tables, etc.)
}

export function NobelCard({
  title,
  subtitle,
  actions,
  children,
  accent = false,
  className,
  noPadding = false,
}: NobelCardProps): React.JSX.Element {
  const hasHeader = Boolean(title || subtitle || actions);

  return (
    <div
      className={cn(
        // Base card — §4.3
        "bg-[var(--bg-elev)] border border-[var(--line)] rounded-[var(--r-3)]",
        "shadow-[var(--e-float)]",
        "transition-[transform,box-shadow] duration-[250ms] ease-[ease]",
        "hover:shadow-[var(--e-float-hover)] hover:-translate-y-[2px]",
        // Accent: override top border with gold (solid, no gradient)
        accent && "border-t-2 border-t-[var(--c-gold)]",
        className
      )}
    >
      {/* Header */}
      {hasHeader && (
        <div
          className={cn(
            "flex items-start justify-between gap-3",
            "px-5 py-4",
            "border-b border-[var(--line)]"
          )}
        >
          {/* Title + subtitle */}
          <div className="flex flex-col gap-0.5 min-w-0">
            {title && (
              <h3
                className="font-[var(--f-text)] text-[15px] font-semibold leading-snug text-[var(--fg)] truncate"
              >
                {title}
              </h3>
            )}
            {subtitle && (
              <span className="text-[12px] text-[var(--fg-mute)] leading-snug">
                {subtitle}
              </span>
            )}
          </div>

          {/* Actions slot */}
          {actions && (
            <div className="shrink-0 flex items-center gap-2">
              {actions}
            </div>
          )}
        </div>
      )}

      {/* Body */}
      <div className={cn(!noPadding && "px-5 py-4")}>
        {children}
      </div>
    </div>
  );
}
