// Nobel Button — extends shadcn/ui Button with Nobel variants
// Adds "editorial" variant for marketing surfaces while keeping
// operational variants for dashboards.

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        // Operational (dashboards / intranet)
        primary:
          "bg-primary text-primary-foreground hover:bg-[var(--color-b-600)] rounded-sm",
        secondary:
          "bg-card text-foreground border border-input hover:bg-muted rounded-sm",
        ghost:
          "text-muted-foreground hover:bg-muted hover:text-foreground rounded-sm",
        destructive:
          "bg-destructive text-destructive-foreground hover:opacity-90 rounded-sm",

        // Editorial (marketing / decks / reports)
        editorial:
          "bg-[var(--color-gold)] text-[var(--color-midnight-deep)] hover:bg-[var(--color-gold-deep)] uppercase tracking-[0.06em] text-xs font-medium rounded-xs",
        "editorial-outline":
          "border border-[var(--color-gold)] text-[var(--color-gold)] hover:bg-[var(--color-gold)]/10 uppercase tracking-[0.06em] text-xs font-medium rounded-xs",
      },
      size: {
        sm:      "h-7 px-2.5 text-xs",
        default: "h-[34px] px-3.5 text-[13px]",
        lg:      "h-[42px] px-4.5 text-sm",
        icon:    "h-[34px] w-[34px]",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { buttonVariants };
