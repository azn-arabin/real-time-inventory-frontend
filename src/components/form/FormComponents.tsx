"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type {
  FieldError,
  RegisterOptions,
  UseFormRegister,
} from "react-hook-form";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import React from "react";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface FormLabelProps {
  children: React.ReactNode;
  className?: string;
  required?: boolean;
  for?: string;
  tooltip?: string;
}

export const FormLabel = (props: FormLabelProps) => (
  <div className="flex items-center gap-1">
    <Label htmlFor={props.for} className={props.className}>
      {props.children}
      {!!props.required && <span className="text-red-500 ml-1">*</span>}
    </Label>
    {props.tooltip && (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Info className="w-4 h-4 cursor-pointer" />
          </TooltipTrigger>
          <TooltipContent className="max-w-xs text-sm">
            {props.tooltip}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )}
  </div>
);
interface FormInputWithLabelProps {
  name: string;
  label: string;
  placeholder?: string;
  type?: string;
  error?: FieldError;
  register: UseFormRegister<any>;
  className?: string;
  validators?: RegisterOptions;
  min?: string;
  tooltip?: string;
  disabled?: boolean;
  step?: string | number;
}

export const FormInputWithLabel = ({
  name,
  label,
  placeholder,
  type = "text",
  error,
  register,
  className,
  validators,
  min,
  tooltip,
  disabled,
  step,
}: FormInputWithLabelProps) => {
  return (
    <div className="space-y-2">
      <FormLabel tooltip={tooltip} for={name} required={!!validators?.required}>
        {label}
      </FormLabel>
      <Input
        id={name}
        type={type}
        placeholder={placeholder}
        {...register(name, validators)}
        className={cn(error && "border-red-500", className)}
        min={min}
        disabled={disabled}
        step={step}
      />
      {error && <FormError>{error.message}</FormError>}
    </div>
  );
};

export const FormError = ({ children }: { children: React.ReactNode }) => (
  <p className="text-sm text-red-500">{children}</p>
);

interface FormTextAreaWithLabelProps {
  name: string;
  label: string;
  placeholder?: string;
  error?: FieldError;
  register: UseFormRegister<any>;
  className?: string;
  validators?: RegisterOptions;
  tooltip?: string;
  disabled?: boolean;
}

export const FormTextAreaWithLabel = ({
  name,
  label,
  placeholder,
  error,
  register,
  className,
  validators,
  tooltip,
  disabled,
}: FormTextAreaWithLabelProps) => {
  return (
    <div className="space-y-2">
      <FormLabel tooltip={tooltip} for={name} required={!!validators?.required}>
        {label}
      </FormLabel>
      <Textarea
        id={name}
        placeholder={placeholder}
        {...register(name, validators)}
        className={cn(error && "border-red-500", className)}
        disabled={disabled}
      />
      {error && <FormError>{error.message}</FormError>}
    </div>
  );
};
