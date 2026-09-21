import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Viewfinder({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl bg-bg-subtle shadow-[var(--shadow-border)]",
        className,
      )}
    >
      {children}
      <Corner className="left-3 top-3 border-l border-t" />
      <Corner className="right-3 top-3 border-r border-t" />
      <Corner className="bottom-3 left-3 border-b border-l" />
      <Corner className="bottom-3 right-3 border-b border-r" />
    </div>
  );
}

function Corner({ className }: { className: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute size-7 border-accent",
        className,
      )}
    />
  );
}
