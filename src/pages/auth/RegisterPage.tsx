import { useForm } from "react-hook-form";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { FormInputWithLabel } from "@/components/form/FormComponents";
import { PasswordInputWithLabel } from "@/components/form/PasswordsInput";
import { Button } from "@/components/common/Buttons";
import { useAuth } from "@/context/AuthContext";
import { authApi } from "@/services/api";

type RegisterForm = {
  username: string;
  email: string;
  password: string;
};

export function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>();

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true);
    try {
      const res = await authApi.register(data);
      const { token, user } = res.data.data;
      login(user, token);
      toast.success("Account created! Welcome " + user.username);
      navigate("/");
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Registration failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Create account</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Sign up to reserve limited drops
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormInputWithLabel
            name="username"
            label="Username"
            placeholder="yourname"
            register={register}
            error={errors.username}
            validators={{
              required: "Username is required",
              minLength: { value: 3, message: "Min 3 characters" },
            }}
          />

          <FormInputWithLabel
            name="email"
            label="Email"
            type="email"
            placeholder="you@example.com"
            register={register}
            error={errors.email}
            validators={{ required: "Email is required" }}
          />

          <PasswordInputWithLabel
            name="password"
            label="Password"
            placeholder="••••••••"
            register={register}
            watch={watch}
            error={errors.password}
            validators={{
              required: "Password is required",
              minLength: { value: 6, message: "Min 6 characters" },
            }}
          />

          <Button type="submit" className="w-full" loading={loading}>
            Create Account
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="underline text-foreground">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
