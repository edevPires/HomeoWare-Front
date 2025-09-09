import { createFileRoute } from "@tanstack/react-router";
import { useNavigate } from "@tanstack/react-router";
import FullscreenLayout from "../components/layouts/fullscreen-layout";
import { ArrowLeft, Mail } from "lucide-react";
import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "../lib/api";

export const Route = createFileRoute("/forgot-password")({
  component: RouteComponent,
});

const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Informe seu e-mail").email("E-mail inválido"),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

function RouteComponent() {
  const navigate = useNavigate();
  const [isSuccess, setIsSuccess] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues,
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
    mode: "onSubmit",
  });

  const onSubmit: SubmitHandler<ForgotPasswordFormValues> = async (data) => {
    // API: POST /api/mandaEmail/redefinicaoSenha
    // Body esperado: { email: string }
    // Sucesso 200: { message: "Link de redefinição enviado para seu e-mail." }
    try {
      await api.post("/mandaEmail/redefinicaoSenha", {
        email: data.email,
      });

      // Mostra tela de sucesso
      setIsSuccess(true);
    } catch (err: any) {
      // Trata 404, 422 e outros erros
      const status = err?.response?.status;
      if (status === 404) {
        alert("E-mail não encontrado em nossa base de dados.");
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
        err?.response?.data?.message ||
        "Não foi possível enviar o link de redefinição.";
      alert(msg);
    }
  };

  const handleBackToLogin = () => {
    navigate({ to: "/login" });
  };

  const handleTryAgain = () => {
    setIsSuccess(false);
  };

  if (isSuccess) {
    return (
      <FullscreenLayout className="flex justify-center items-center p-6">
        <div className="flex flex-col bg-light border border-light-border rounded-2xl w-full max-w-md text-font p-6 sm:p-8 gap-6 shadow-none">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold">
              E-mail <span className="text-primary">Enviado</span>
            </h1>
            <p className="mt-2 text-sm text-font/70">
              Enviamos um link de redefinição para
            </p>
            <p className="text-sm font-medium text-primary">
              {getValues("email")}
            </p>
          </div>

          <div className="text-center text-sm text-font/70 space-y-2">
            <p>
              Verifique sua caixa de entrada e clique no link para redefinir sua
              senha.
            </p>
            <p>O link expira em 60 minutos.</p>
          </div>

          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={handleTryAgain}
              className="h-11 w-full rounded-xl bg-primary text-dark font-bold"
            >
              Tentar Novamente
            </button>
            <button
              type="button"
              onClick={handleBackToLogin}
              className="h-11 w-full rounded-xl bg-input border border-input-border text-font font-medium hover:bg-input/80"
            >
              Voltar ao Login
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
            Esqueceu sua <span className="text-primary">Senha</span>?
          </h1>
          <p className="mt-1 text-sm text-font/70">
            Digite seu e-mail e enviaremos um link para redefinir sua senha
          </p>
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

        <div className="flex flex-col gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="h-11 w-full rounded-xl bg-primary text-dark font-bold disabled:opacity-60"
          >
            {isSubmitting ? "Enviando..." : "Enviar Link de Redefinição"}
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
