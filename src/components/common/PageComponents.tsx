import { cn } from "@/lib/utils";
import * as React from "react";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const PageContainer = ({ children, className }: PageContainerProps) => {
  return (
    <main
      className={cn(
        "flex-1 flex flex-col lg:px-16 md:px-12 px-4 gap-3 my-4",
        className,
      )}
    >
      {children}
    </main>
  );
};
