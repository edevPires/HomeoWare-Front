import clsx from "clsx";
import type { ReactNode } from "react";

interface FullscreenLayoutProps {
  children: ReactNode;
  className?: string;
}

export default function FullscreenLayout({
  children,
  className,
}: FullscreenLayoutProps) {
  return (
    <div className={clsx("h-dvh", className)}>
      {children}
    </div>
  );
}
