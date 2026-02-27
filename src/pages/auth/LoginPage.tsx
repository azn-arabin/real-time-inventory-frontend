import { useForm } from "react-hook-form";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { FormInputWithLabel } from "@/components/form/FormComponents";
import { PasswordInputWithLabel } from "@/components/form/PasswordsInput";
import { Button } from "@/components/common/Buttons";
import { useAuth } from "@/context/AuthContext";
import { authApi } from "@/services/api";

type LoginForm = {
  email: string;
  password: string;
};

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    try {
      const res = await authApi.login(data);
      const { token, user } = res.data.data;
      login(user, token);
      toast.success("Welcome back, " + user.username + "!");
      navigate("/");
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Login failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Sign in</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Enter your credentials to continue
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
            validators={{ required: "Password is required" }}
          />

          <Button type="submit" className="w-full" loading={loading}>
            Login
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link to="/register" className="underline text-foreground">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
