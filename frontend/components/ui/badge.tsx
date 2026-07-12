import * as React from "react";
import { cn } from "@/lib/utils";

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: "default" | "outline" | "success" | "warning" | "danger";
};

const variants: Record<NonNullable<BadgeProps["variant"]>, string> = {
  default: "bg-primary/10 text-primary",
  outline: "border border-border text-muted-foreground",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-amber-700 dark:text-amber-300",
  danger: "bg-danger/10 text-danger"
};

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold", variants[variant], className)}
      {...props}
    />
  );
}
