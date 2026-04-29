import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const badgeVariants = cva(
  "inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.12em] px-[10px] py-[6px] rounded-full",
  {
    variants: {
      variant: {
        pos: "border border-[var(--color-positive)] text-[var(--color-positive)]",
        neg: "border border-[var(--color-negative)] text-[var(--color-negative)]",
        gold: "border border-[var(--c-gold)] text-[var(--c-gold)]",
        solid: "bg-[var(--c-gold)] text-[var(--c-midnight)]",
        neutral: "border border-[var(--color-line)] text-[var(--color-fg-mute)]",
        info: "border border-[var(--color-b-500)] text-[var(--color-b-500)]",
        dot: "border border-[var(--color-line)] text-[var(--color-fg-mute)]",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  }
);

interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {variant === "dot" && (
        <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
      )}
      {children}
    </span>
  );
}
