// Nobel KPI Card — for dashboards
// File: src/components/nobel/kpi.tsx

import * as React from "react";
import { cn } from "@/lib/utils";

export interface KPIProps {
  label: string;
  value: string;
  unit?: string;
  delta?: { value: string; trend: "positive" | "negative" | "neutral" };
  spark?: number[];
  className?: string;
}

export function KPI({ label, value, unit, delta, spark, className }: KPIProps) {
  return (
    <div
      className={cn(
        "bg-card border border-border rounded-[var(--r-3)] p-4 flex flex-col gap-2.5",
        "shadow-[var(--e-float)] transition-[transform,box-shadow] duration-[250ms] ease-[ease]",
        "hover:shadow-[var(--e-float-hover)] hover:-translate-y-[2px]",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
          {label}
        </span>
        {delta && <Delta value={delta.value} trend={delta.trend} />}
      </div>

      <div className="font-mono text-3xl font-medium tracking-tight leading-none [font-feature-settings:'tnum']">
        {value}
        {unit && (
          <span className="text-sm text-muted-foreground ml-1 font-normal">
            {unit}
          </span>
        )}
      </div>

      {spark && spark.length > 1 && <Sparkline points={spark} trend={delta?.trend ?? "neutral"} />}
    </div>
  );
}

function Delta({
  value,
  trend,
}: {
  value: string;
  trend: "positive" | "negative" | "neutral";
}) {
  const styles = {
    positive: "border border-[var(--color-positive)] text-[var(--color-positive)] bg-transparent",
    negative: "border border-[var(--color-negative)] text-[var(--color-negative)] bg-transparent",
    neutral:  "border border-[var(--line-strong)] text-[var(--fg-mute)] bg-transparent",
  }[trend];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-wide px-2 py-0.5 rounded-full font-medium",
        styles
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {value}
    </span>
  );
}

function Sparkline({
  points,
  trend = "neutral",
}: {
  points: number[];
  trend?: "positive" | "negative" | "neutral";
}) {
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;
  const w = 200;
  const h = 34;
  const step = w / (points.length - 1);
  const path = points
    .map((p, i) => {
      const x = i * step;
      const y = h - ((p - min) / range) * h;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const stroke = {
    positive: "var(--color-positive)",
    negative: "var(--color-negative)",
    neutral:  "var(--muted-foreground)",
  }[trend];

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      className="w-full h-[34px]"
    >
      <path d={path} fill="none" stroke={stroke} strokeWidth={1.5} />
    </svg>
  );
}
