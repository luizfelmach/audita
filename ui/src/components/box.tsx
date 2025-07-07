import type * as React from "react";
import { cn } from "@/lib/utils";

interface BoxProps {
  children?: React.ReactNode;
  className?: string;
}

export function BoxRoot({ children, className }: BoxProps) {
  return (
    <div className={cn("rounded-lg border border-gray-200", className)}>
      {children}
    </div>
  );
}

export function BoxHeader({ children, className }: BoxProps) {
  return (
    <div className={cn("px-4 py-3 border-gray-200", className)}>{children}</div>
  );
}

export function BoxContent({ children, className }: BoxProps) {
  return <div className={cn("px-4 py-3", className)}>{children}</div>;
}

export function BoxFooter({ children, className }: BoxProps) {
  return <div className={cn("px-4 py-3", className)}>{children}</div>;
}
