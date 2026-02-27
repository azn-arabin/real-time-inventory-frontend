import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  FieldError,
  RegisterOptions,
  UseFormRegister,
  UseFormWatch,
} from "react-hook-form";

interface PasswordInputWithLabelProps {
  name: string;
  label: string;
  placeholder?: string;
  error?: FieldError;
  register: UseFormRegister<any>;
  watch: UseFormWatch<any>;
  className?: string;
  validators?: RegisterOptions;
  disabled?: boolean;
  autoComplete?: string;
}

export const PasswordInputWithLabel = ({
  name,
  label,
  placeholder,
  error,
  register,
  watch,
  className,
  validators,
  disabled = false,
  autoComplete = "off",
}: PasswordInputWithLabelProps) => {
  const [showPassword, setShowPassword] = useState(false);

  const toggleVisibility = () => setShowPassword((prev) => !prev);

  return (
    <div className="space-y-2">
      <Label htmlFor={name}>
        {label}{" "}
        {!!validators?.required && <span className="text-red-500">*</span>}
      </Label>

      <div className="relative">
        <Input
          id={name}
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          className={cn(error && "border-red-500 pr-10", className)}
          {...register(name, validators)}
          defaultValue={watch(name)}
          disabled={disabled}
          autoComplete={autoComplete}
        />

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={toggleVisibility}
          className="absolute top-1/2 right-2 -translate-y-1/2 h-7 w-7 p-0"
          tabIndex={-1}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </Button>
      </div>

      {error && <p className="text-sm text-red-500">{error.message}</p>}
    </div>
  );
};
