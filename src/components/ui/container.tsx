import { cn } from "@/lib/utils";
import React from "react";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Container({
  children,
  className,
  ...props
}: ContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-screen-xl px-2.5 md:px-20",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}