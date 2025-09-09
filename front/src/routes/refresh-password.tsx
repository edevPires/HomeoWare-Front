import { createFileRoute } from "@tanstack/react-router";
import { useNavigate } from "@tanstack/react-router";
import FullscreenLayout from "../components/layouts/fullscreen-layout";
import { Eye, EyeOff, CheckCircle, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "../lib/api";

export const Route = createFileRoute("/refresh-password")({
  component: RouteComponent,
  validateSearch: (search) => ({
    token: (search.token as string) || "",
    email: (search.email as string) || "",
  }),
  beforeLoad: ({ search }) => {
    // Validar formato do token
    if (!search.token || search.token.length < 10) {
      throw new Error("Token inválido ou expirado");
    }

    // Validar email
    if (!search.email || !search.email.includes("@")) {
      throw new Error("Email inválido");
    }
  },
  errorComponent: ({ error }) => (
    <FullscreenLayout className="flex justify-center items-center p-6">
      <div className="flex flex-col bg-light border border-light-border rounded-2xl w-full max-w-md text-font p-6 sm:p-8 gap-6 shadow-none text-center">
        <h2 className="text-xl font-bold text-red-500">Link Inválido</h2>
        <p className="text-font/70">{error.message}</p>
        <p className="text-sm text-font/50">
          O link pode ter expirado ou ser inválido. Solicite um novo link de
          redefinição.
        </p>
        <button
          onClick={() => (window.location.href = "/forgot-password")}
          className="h-11 w-full rounded-xl bg-primary text-dark font-bold"
        >
          Solicitar Novo Link
        </button>
      </div>
    </FullscreenLayout>
  ),
});

const refreshPasswordSchema = z
  .object({
    password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres"),
    password_confirmation: z
      .string()
      .min(8, "Confirmação de senha é obrigatória"),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "As senhas não coincidem",
    path: ["password_confirmation"],
  });

type RefreshPasswordFormValues = z.infer<typeof refreshPasswordSchema>;

function RouteComponent() {
  const navigate = useNavigate();
  const { token, email } = Route.useSearch();
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] =
    useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RefreshPasswordFormValues>({
    resolver: zodResolver(refreshPasswordSchema),
    defaultValues: { password: "", password_confirmation: "" },
    mode: "onSubmit",
  });

  const onSubmit: SubmitHandler<RefreshPasswordFormValues> = async (data) => {
    // API: POST /api/redefinicaoSenha
    // Body esperado: { email: string, token: string, password: string }
    // Sucesso 200: { message: "Senha redefinida com sucesso." }
    try {
      await api.post("/redefinicaoSenha", {
        email,
        token,
        password: data.password,
      });

      // Mostra tela de sucesso
      setIsSuccess(true);

      // Redireciona para login após 3 segundos
      setTimeout(() => {
        navigate({ to: "/login" });
      }, 3000);
    } catch (err: any) {
      // Trata 400, 422 e outros erros
      const status = err?.response?.status;
      if (status === 400) {
        alert(
          "Token inválido ou expirado. Solicite um novo link de redefinição."
        );
        return;
      }
      if (status === 422) {
        const errors = err?.response?.data?.errors;
        const msg =
          err?.response?.data?.message ||
          "Erro de validação nos dados enviados.";
        if (errors) {
          const details = Object.values(errors).flat().join("\n");
          alert(`${msg}\n${details}`);
        } else {
          alert(msg);
        }
        return;
      }
      const msg =
        err?.response?.data?.message || "Não foi possível redefinir a senha.";
      alert(msg);
    }
  };

  const handleBackToLogin = () => {
    navigate({ to: "/login" });
  };

  if (isSuccess) {
    return (
      <FullscreenLayout className="flex justify-center items-center p-6">
        <div className="flex flex-col bg-light border border-light-border rounded-2xl w-full max-w-md text-font p-6 sm:p-8 gap-6 shadow-none">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold">
              Senha <span className="text-primary">Redefinida</span>
            </h1>
            <p className="mt-2 text-sm text-font/70">
              Sua senha foi redefinida com sucesso!
            </p>
          </div>

          <div className="text-center text-sm text-font/70">
            <p>
              Você será redirecionado para a tela de login em alguns segundos...
            </p>
          </div>

          <div className="flex justify-center items-center">
            <button
              type="button"
              onClick={handleBackToLogin}
              className="h-11 w-full rounded-xl bg-primary text-dark font-bold"
            >
              Ir para Login
            </button>
          </div>
        </div>
      </FullscreenLayout>
    );
  }

  return (
    <FullscreenLayout className="flex justify-center items-center p-6">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col bg-light border border-light-border rounded-2xl w-full max-w-md text-font p-6 sm:p-8 gap-6 shadow-none"
      >
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold">
            Redefinir <span className="text-primary">Senha</span>
          </h1>
          <p className="mt-1 text-sm text-font/70">
            Digite sua nova senha para:{" "}
            <span className="font-medium text-primary">{email}</span>
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="password" className="text-sm font-medium text-font">
            Nova Senha
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              placeholder="••••••••"
              className="h-11 w-full rounded-xl bg-input border border-input-border px-3 pr-10 text-font placeholder:text-font/50 focus:outline-none focus:border-primary/60 focus:shadow-[0_0_0_1px_var(--color-primary)]"
              aria-invalid={errors.password ? "true" : "false"}
              {...register("password")}
            />
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 text-font/70 hover:text-font"
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            >
              {showPassword ? (
                <EyeOff className="size-5" />
              ) : (
                <Eye className="size-5" />
              )}
            </button>
          </div>
          {errors.password && (
            <span className="text-red-400 text-sm">
              {errors.password.message}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="password_confirmation"
            className="text-sm font-medium text-font"
          >
            Confirmar Nova Senha
          </label>
          <div className="relative">
            <input
              type={showPasswordConfirmation ? "text" : "password"}
              id="password_confirmation"
              placeholder="••••••••"
              className="h-11 w-full rounded-xl bg-input border border-input-border px-3 pr-10 text-font placeholder:text-font/50 focus:outline-none focus:border-primary/60 focus:shadow-[0_0_0_1px_var(--color-primary)]"
              aria-invalid={errors.password_confirmation ? "true" : "false"}
              {...register("password_confirmation")}
            />
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 text-font/70 hover:text-font"
              type="button"
              onClick={() =>
                setShowPasswordConfirmation(!showPasswordConfirmation)
              }
              aria-label={
                showPasswordConfirmation
                  ? "Ocultar confirmação"
                  : "Mostrar confirmação"
              }
            >
              {showPasswordConfirmation ? (
                <EyeOff className="size-5" />
              ) : (
                <Eye className="size-5" />
              )}
            </button>
          </div>
          {errors.password_confirmation && (
            <span className="text-red-400 text-sm">
              {errors.password_confirmation.message}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="h-11 w-full rounded-xl bg-primary text-dark font-bold disabled:opacity-60"
          >
            {isSubmitting ? "Redefinindo..." : "Redefinir Senha"}
          </button>

          <button
            type="button"
            onClick={handleBackToLogin}
            className="h-11 w-full rounded-xl bg-input border border-input-border text-font font-medium hover:bg-input/80 flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Login
          </button>
        </div>
      </form>
    </FullscreenLayout>
  );
}
