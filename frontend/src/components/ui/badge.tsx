import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "bg-slate-700 text-slate-200",
        excellent: "bg-emerald-900/60 text-emerald-300 border border-emerald-700",
        good: "bg-blue-900/60 text-blue-300 border border-blue-700",
        caution: "bg-amber-900/60 text-amber-300 border border-amber-700",
        danger: "bg-red-900/60 text-red-300 border border-red-700",
        outline: "border border-slate-600 text-slate-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
