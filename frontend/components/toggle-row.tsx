"use client";

import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function ToggleRow({
  icon: Icon,
  label,
  description,
  enabled
}: {
  icon: LucideIcon;
  label: string;
  description: string;
  enabled?: boolean;
}) {
  const [checked, setChecked] = useState(Boolean(enabled));

  return (
    <button
      type="button"
      className="flex w-full items-center justify-between gap-4 rounded-lg border border-border p-4 text-left"
      onClick={() => setChecked((value) => !value)}
      aria-pressed={checked}
    >
      <span className="flex items-start gap-3">
        <span className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
          <Icon aria-hidden="true" />
        </span>
        <span>
          <span className="block font-semibold">{label}</span>
          <span className="mt-1 block text-sm text-muted-foreground">{description}</span>
        </span>
      </span>
      <span
        className={cn(
          "relative h-7 w-12 shrink-0 rounded-full border border-border transition",
          checked ? "bg-primary" : "bg-muted"
        )}
      >
        <span
          className={cn(
            "absolute top-1 size-5 rounded-full bg-white transition",
            checked ? "left-6" : "left-1"
          )}
        />
      </span>
    </button>
  );
}
