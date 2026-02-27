"use client";

import { Button as ShadButton, buttonVariants } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { type VariantProps } from "class-variance-authority";
import * as React from "react";

export interface ButtonProps
  extends React.ComponentProps<"button">, VariantProps<typeof buttonVariants> {
  loading?: boolean;
  children: React.ReactNode;
  asChild?: boolean;
}
export const Button = ({
  loading,
  children,
  disabled,
  className,
  ...props
}: ButtonProps) => {
  return (
    <ShadButton
      disabled={loading || disabled}
      className={cn("flex items-center gap-2 cursor-pointer", className)}
      {...props}
    >
      {loading && <Loader2 className="animate-spin h-4 w-4" />}
      {children}
    </ShadButton>
  );
};
