"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Controller } from "react-hook-form";
import type {
  Control,
  FieldError,
  FieldValues,
  RegisterOptions,
  UseFormRegister,
} from "react-hook-form";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import React from "react";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Info } from "lucide-react";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { Matcher } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";

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

type Props<T extends FieldValues> = {
  label: string;
  className?: string;
  control: Control<any>;
  name: string;
  validators?: RegisterOptions;
  error?: FieldError;
  disabled?: Matcher | Matcher[];
  readOnly?: boolean;
};

export const FormDatePickerWithLabel = <T extends FieldValues>({
  label,
  className,
  control,
  name,
  validators,
  error,
  disabled,
  readOnly = false,
}: Props<T>) => {
  return (
    <Controller
      name={name}
      control={control}
      rules={validators}
      render={({ field }) => {
        const selectedDate = field.value;

        const displayText = selectedDate
          ? format(new Date(selectedDate), "dd MMM yyyy")
          : "Select date";

        return (
          <div className="space-y-2">
            <FormLabel for={name} required={!!validators?.required}>
              {label}
            </FormLabel>
            <Popover modal={false}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal flex items-center gap-2",
                    !selectedDate && "text-muted-foreground",
                    error && "border-red-500",
                    readOnly && "cursor-not-allowed opacity-60",
                    className,
                  )}
                  disabled={readOnly}
                >
                  <CalendarIcon className="h-4 w-4" />
                  <span>{displayText}</span>
                </Button>
              </PopoverTrigger>
              {!readOnly && (
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate ? new Date(selectedDate) : undefined}
                    onSelect={(date) => field.onChange(date)}
                    initialFocus
                    disabled={disabled}
                  />
                </PopoverContent>
              )}
            </Popover>
            {error && <FormError>{error.message}</FormError>}
          </div>
        );
      }}
    />
  );
};

export const FormMultiDatePickerWithLabel = <T extends FieldValues>({
  label,
  className,
  control,
  name,
  validators,
  error,
  disabled,
}: Props<T>) => {
  return (
    <Controller
      name={name}
      control={control}
      rules={validators}
      render={({ field }) => {
        const selectedDates = field.value || [];

        const displayText =
          selectedDates.length > 0
            ? selectedDates
                .map((d: string | Date) =>
                  typeof d === "string"
                    ? format(new Date(d), "dd MMM yyyy")
                    : format(d, "dd MMM yyyy"),
                )
                .join(", ")
            : "Select dates";

        return (
          <div className="space-y-2">
            <FormLabel for={name} required={!!validators?.required}>
              {label}
            </FormLabel>
            <Popover modal={false}>
              <PopoverTrigger asChild className="overflow-hidden max-w-full">
                <Button
                  variant="outline"
                  className={cn(
                    "max-w-full w-full overflow-hidden justify-start text-left font-normal flex items-center gap-2",
                    !selectedDates.length && "text-muted-foreground",
                    error && "border-red-500",
                    className,
                  )}
                >
                  <CalendarIcon className="h-4 w-4 flex-shrink-0" />
                  <span className="line-clamp-1 flex-1">{displayText}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="multiple"
                  selected={field.value}
                  onSelect={(date) => field.onChange(date)}
                  initialFocus
                  disabled={disabled}
                />
              </PopoverContent>
            </Popover>
            {error && <FormError>{error.message}</FormError>}
          </div>
        );
      }}
    />
  );
};

interface FormCheckboxWithLabelProps {
  name: string;
  label: string;
  control: Control<any>;
  defaultValue?: boolean;
  description?: string;
}

export const FormCheckboxWithLabel = ({
  name,
  label,
  control,
  defaultValue = false,
  description,
}: FormCheckboxWithLabelProps) => {
  return (
    <Controller
      name={name}
      control={control}
      defaultValue={defaultValue}
      render={({ field }) => (
        <div className="flex items-start space-x-2 space-y-0">
          <Checkbox
            id={name}
            checked={field.value}
            onCheckedChange={(val) => field.onChange(!!val)}
          />
          <div className="space-y-1 leading-none">
            <Label htmlFor={name} className="text-sm font-medium">
              {label}
            </Label>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
        </div>
      )}
    />
  );
};

interface FormSwitchWithLabelProps {
  name: string;
  label?: string;
  control: Control<any>;
  defaultValue?: boolean;
  description?: string;
}

export const FormSwitchWithLabel = ({
  name,
  label,
  control,
  defaultValue = false,
  description,
}: FormSwitchWithLabelProps) => {
  return (
    <Controller
      name={name}
      control={control}
      defaultValue={defaultValue}
      render={({ field }) => (
        <div className="flex items-center justify-between">
          <div className="space-y-1 leading-none">
            {!!label && (
              <Label htmlFor={name} className="text-sm font-medium">
                {label}
              </Label>
            )}
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          <Switch
            id={name}
            checked={field.value}
            onCheckedChange={(val) => field.onChange(val)}
          />
        </div>
      )}
    />
  );
};
