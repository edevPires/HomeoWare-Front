import { createFileRoute } from "@tanstack/react-router";
import { useNavigate } from "@tanstack/react-router";
import FullscreenLayout from "../components/layouts/fullscreen-layout";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "../lib/api";

export const Route = createFileRoute("/login")({
  component: RouteComponent,
});

const loginSchema = z.object({
  email: z.string().min(1, "Informe seu e-mail").email("E-mail inválido"),
  password: z.string().min(6, "Mínimo de 6 caracteres"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function RouteComponent() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onSubmit",
  });

  const onSubmit: SubmitHandler<LoginFormValues> = async (data) => {
    // API: POST /login (Sanctum)
    // Body esperado: { email: string, senha: string }
    // Sucesso 200: { message, token, token_type, user }
    try {
      const resp = await api.post("/login", {
        email: data.email,
        senha: data.password,
      });

      const payload = resp.data as {
        message?: string;
        token?: string;
        token_type?: string; // "Bearer"
        user?: {
          id: number | string;
          nome?: string;
          name?: string;
          email: string;
          nivel_acesso?: string;
          ativo?: boolean;
        };
      };

      if (payload?.token) {
        // Armazena token e usuário
        localStorage.setItem("auth_token", payload.token);
        if (payload?.token_type) localStorage.setItem("auth_token_type", payload.token_type);
        if (payload?.user) localStorage.setItem("auth_user", JSON.stringify(payload.user));

        // Redireciona
        navigate({ to: "/hub/estoque" });
      } else {
        const msg = payload?.message || "Falha ao autenticar. Verifique suas credenciais.";
        alert(msg);
      }
    } catch (err: any) {
      // Trata 401 e 422
      const status = err?.response?.status;
      if (status === 401) {
        const msg = err?.response?.data?.message || "Credenciais inválidas.";
        alert(msg);
        return;
      }
      if (status === 422) {
        const errors = err?.response?.data?.errors;
        const msg = err?.response?.data?.message || "Erro de validação nos dados enviados.";
        if (errors) {
          const details = Object.values(errors).flat().join("\n");
          alert(`${msg}\n${details}`);
        } else {
          alert(msg);
        }
        return;
      }
      const msg = err?.response?.data?.message || "Não foi possível realizar o login.";
      alert(msg);
    }
  };

  return (
    <FullscreenLayout className="flex justify-center items-center p-6">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col bg-light border border-light-border rounded-2xl w-full max-w-md text-font p-6 sm:p-8 gap-6 shadow-none"
      >
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold">
            Acessar a <span className="text-primary">HomeoWare</span>
          </h1>
          <p className="mt-1 text-sm text-font/70">Entre com suas credenciais para continuar</p>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="text-sm font-medium text-font">
            E-mail
          </label>
          <input
            type="email"
            id="email"
            placeholder="seuemail@exemplo.com"
            className="h-11 w-full rounded-xl bg-input border border-input-border px-3 text-font placeholder:text-font/50 focus:outline-none focus:border-primary/60 focus:shadow-[0_0_0_1px_var(--color-primary)]"
            aria-invalid={errors.email ? "true" : "false"}
            {...register("email")}
          />
          {errors.email && (
            <span className="text-red-400 text-sm">{errors.email.message}</span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="password" className="text-sm font-medium text-font">
            Senha
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
            <span className="text-red-400 text-sm">{errors.password.message}</span>
          )}
        </div>

        <div className="flex justify-center items-center">
          <button
            type="submit"
            disabled={isSubmitting}
            className="h-11 w-full rounded-xl bg-primary text-dark font-bold disabled:opacity-60"
          >
            {isSubmitting ? "Entrando..." : "Entrar"}
          </button>
        </div>
      </form>
    </FullscreenLayout>
  );
}
