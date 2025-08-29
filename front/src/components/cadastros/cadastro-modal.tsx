import { Modal } from "../layouts/modal";
import type { FormKind } from "./cadastro-actions";
import { useEffect, useMemo, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "../../lib/api";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

type Props = {
  open: boolean;
  onClose: () => void;
  formKind: FormKind;
  defaultValues?: any;
  onSubmit?: (data: any) => Promise<void> | void;
  onSuccess?: () => Promise<void> | void;
};

export function CadastroModal({
  open,
  onClose,
  formKind,
  defaultValues,
  onSubmit: onSubmitProp,
}: Props) {
  const isEditing = Boolean(defaultValues);
  console.log(
    "isEditing:",
    isEditing,
    "formKind:",
    formKind,
    "defaultValues:",
    defaultValues
  );
  const title =
    formKind === "usuario"
      ? isEditing
        ? "Editar Usuário"
        : "Cadastrar Usuário"
      : formKind === "cliente"
        ? isEditing
          ? "Editar Cliente"
          : "Cadastrar Cliente"
        : isEditing
          ? "Editar Empresa"
          : "Cadastrar Empresa";

  // Schemas por tipo de formulário
  const usuarioSchema = z.object({
    nome: z.string().min(1, "Informe o nome"),
    email: z.string().email("Email inválido"),
    funcao: z.enum(["administrador", "vendedor", "veterinario"]),
    senha: z.string().min(6, "Mínimo de 6 caracteres"),
    observacoes: z
      .string()
      .max(500, "Máximo de 500 caracteres")
      .optional()
      .or(z.literal("")),
  });

  const clienteSchema = z.object({
    nome: z.string().min(1, "Informe o nome"),
    documento: z.string().min(5, "Informe o documento"),
  });

  const empresaSchema = z.object({
    razaoSocial: z.string().min(1, "Informe a razão social"),
    cnpj: z.string().min(14, "Informe o CNPJ"),
  });

  type UsuarioForm = z.infer<typeof usuarioSchema>;
  type ClienteForm = z.infer<typeof clienteSchema>;
  type EmpresaForm = z.infer<typeof empresaSchema>;

  const resolver = useMemo<Resolver<any>>(() => {
    if (formKind === "usuario")
      return zodResolver(usuarioSchema) as unknown as Resolver<any>;
    if (formKind === "cliente")
      return zodResolver(clienteSchema) as unknown as Resolver<any>;
    return zodResolver(empresaSchema) as unknown as Resolver<any>;
  }, [formKind]);

  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (
      !confirm(
        `Tem certeza que deseja excluir o usuário ${defaultValues.nome}?`
      )
    ) {
      return;
    }

    try {
      setIsDeleting(true);
      console.log('Tentando excluir usuário ID:', defaultValues.id);
      
      // Primeiro verifica se o usuário existe
      try {
        await api.get(`/user/${defaultValues.id}`);
      } catch (getError: any) {
        console.error('Erro ao verificar usuário:', getError);
        if (getError.response?.status === 404) {
          toast.warning('Este usuário já foi removido.');
          onClose();
          return;
        }
        throw getError; // Re-throw para ser pego pelo catch externo
      }
      
      // Se chegou aqui, o usuário existe, então tenta deletar
      const response = await api.delete(`/user/${defaultValues.id}`);
      console.log('Resposta da exclusão:', response);
      
      toast.success("Usuário excluído com sucesso!");
      onClose();
      
      // Atualiza a lista
      if (onSubmitProp) {
        await onSubmitProp({} as any);
      }
    } catch (error: any) {
      console.error("Erro ao excluir usuário:", error);
      console.error('Detalhes do erro:', {
        status: error.response?.status,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method
        }
      });
      
      if (error.response?.status === 404) {
        toast.error("Usuário não encontrado. Pode ter sido excluído por outra pessoa.");
      } else if (error.response?.status === 403) {
        toast.error("Você não tem permissão para excluir este usuário.");
      } else if (error.response?.status === 500) {
        toast.error("Erro no servidor ao tentar excluir o usuário.");
      } else if (!navigator.onLine) {
        toast.error("Sem conexão com a internet. Verifique sua conexão e tente novamente.");
      } else {
        toast.error(`Erro ao excluir usuário: ${error.message || 'Tente novamente mais tarde.'}`);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<any>({
    resolver,
    mode: "onBlur",
    defaultValues,
  });

  // Garante que o formulário receba os valores quando abrir para edição
  useEffect(() => {
    if (open) {
      reset(defaultValues || {});
    }
  }, [open, defaultValues, formKind, reset]);

  const onSubmit = async (data: UsuarioForm | ClienteForm | EmpresaForm) => {
    try {
      if (formKind === "usuario") {
        const d = data as UsuarioForm;
        const nivelAcesso = d.funcao === "administrador" ? "admin" : d.funcao;
        const payload = {
          nome: d.nome,
          email: d.email,
          senha: d.senha,
          nivel_acesso: nivelAcesso,
          ativo: true,
          observacoes: d.observacoes || "",
        };

        if (isEditing && (defaultValues as any)?.id) {
          // Edição total do usuário
          const userId = String((defaultValues as any).id);
          await api.put(`/user/${userId}`, payload);
          toast.success("Usuário atualizado com sucesso!");
          onClose();
          // Chamar a função de sucesso para atualizar a lista
          if (onSubmitProp) {
            await onSubmitProp(data);
          }
        } else {
          // Criação de novo usuário
          await api.post("/user", payload);
          toast.success("Usuário criado com sucesso!");
          onClose();
          // Chamar a função de sucesso para atualizar a lista
          if (onSubmitProp) {
            await onSubmitProp(data);
          }
        }
      } else {
        // Mantém comportamento padrão para outros formulários
        // eslint-disable-next-line no-console
        console.log("Cadastro submetido:", formKind, data);
      }

      // Após sucesso, notifica o pai se existir (ex.: atualizar listas locais)
      if (onSubmitProp) {
        await onSubmitProp(data);
      }
    } catch (err: any) {
      // Tenta extrair mensagem do backend; fallback genérico
      const msg =
        err?.response?.data?.message || "Não foi possível criar o usuário.";
      // eslint-disable-next-line no-console
      console.error(err);
      if (typeof window !== "undefined") {
        window.alert(msg);
      }
      return; // não fechar/resetar em caso de erro
    }
    onClose();
    reset();
  };

  return (
    <Modal open={open} onClose={onClose} size="auto" title={title}>
      <form
        className="w-[22rem] lg:w-[28rem]"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="grid gap-4">
          {formKind === "usuario" && (
            <div className="grid gap-3">
              <h3 className="text-sm font-semibold text-font/90">
                Dados do Usuário
              </h3>
              <div className="grid gap-2">
                <label className="text-sm text-font/80">Nome</label>
                <input
                  {...register("nome")}
                  className="h-10 px-3 rounded-lg bg-input border border-input-border text-font placeholder:text-font/50 w-full"
                  placeholder="Ex.: João da Silva"
                />
                {errors?.nome && (
                  <span className="text-xs text-red-400">
                    {String(errors.nome.message)}
                  </span>
                )}
              </div>
              <div className="grid gap-2">
                <label className="text-sm text-font/80">Email</label>
                <input
                  {...register("email")}
                  type="email"
                  className="h-10 px-3 rounded-lg bg-input border border-input-border text-font placeholder:text-font/50 w-full"
                  placeholder="Ex.: joao@email.com"
                />
                {errors?.email && (
                  <span className="text-xs text-red-400">
                    {String(errors.email.message)}
                  </span>
                )}
              </div>
              <div className="grid gap-2">
                <label className="text-sm text-font/80">Função</label>
                <select
                  {...register("funcao")}
                  className="h-10 px-3 rounded-lg bg-input border border-input-border text-font w-full"
                  defaultValue=""
                >
                  <option value="" disabled>
                    Selecione...
                  </option>
                  <option value="administrador">Administrador</option>
                  <option value="vendedor">Vendedor</option>
                  <option value="veterinario">Veterinário</option>
                </select>
                {errors?.funcao && (
                  <span className="text-xs text-red-400">
                    {String(errors.funcao.message)}
                  </span>
                )}
              </div>
              <div className="grid gap-2">
                <label className="text-sm text-font/80">Senha</label>
                <input
                  {...register("senha")}
                  type="password"
                  className="h-10 px-3 rounded-lg bg-input border border-input-border text-font placeholder:text-font/50 w-full"
                  placeholder="Digite a senha"
                />
                {errors?.senha && (
                  <span className="text-xs text-red-400">
                    {String(errors.senha.message)}
                  </span>
                )}
              </div>
              <div className="grid gap-2">
                <label className="text-sm text-font/80">Observações</label>
                <textarea
                  {...register("observacoes")}
                  rows={3}
                  className="px-3 py-2 rounded-lg bg-input border border-input-border text-font placeholder:text-font/50 w-full resize-y"
                  placeholder="Anotações adicionais sobre o usuário (opcional)"
                />
                {errors?.observacoes && (
                  <span className="text-xs text-red-400">
                    {String(errors.observacoes.message)}
                  </span>
                )}
              </div>
            </div>
          )}

          {formKind === "cliente" && (
            <div className="grid gap-3">
              <h3 className="text-sm font-semibold text-font/90">
                Dados do Cliente
              </h3>
              <div className="grid gap-2">
                <label className="text-sm text-font/80">Nome do Cliente</label>
                <input
                  {...register("nome")}
                  className="h-10 px-3 rounded-lg bg-input border border-input-border text-font placeholder:text-font/50 w-full"
                  placeholder="Ex.: Clínica Vida"
                />
                {errors?.nome && (
                  <span className="text-xs text-red-400">
                    {String(errors.nome.message)}
                  </span>
                )}
              </div>
              <div className="grid gap-2">
                <label className="text-sm text-font/80">Documento</label>
                <input
                  {...register("documento")}
                  className="h-10 px-3 rounded-lg bg-input border border-input-border text-font placeholder:text-font/50 w-full"
                  placeholder="CPF/CNPJ"
                />
                {errors?.documento && (
                  <span className="text-xs text-red-400">
                    {String(errors.documento.message)}
                  </span>
                )}
              </div>
            </div>
          )}

          {formKind === "empresa" && (
            <div className="grid gap-3">
              <h3 className="text-sm font-semibold text-font/90">
                Dados da Empresa
              </h3>
              <div className="grid gap-2">
                <label className="text-sm text-font/80">Razão Social</label>
                <input
                  {...register("razaoSocial")}
                  className="h-10 px-3 rounded-lg bg-input border border-input-border text-font placeholder:text-font/50 w-full"
                  placeholder="Ex.: HomeoWare LTDA"
                />
                {errors?.razaoSocial && (
                  <span className="text-xs text-red-400">
                    {String(errors.razaoSocial.message)}
                  </span>
                )}
              </div>
              <div className="grid gap-2">
                <label className="text-sm text-font/80">CNPJ</label>
                <input
                  {...register("cnpj")}
                  className="h-10 px-3 rounded-lg bg-input border border-input-border text-font placeholder:text-font/50 w-full"
                  placeholder="00.000.000/0000-00"
                />
                {errors?.cnpj && (
                  <span className="text-xs text-red-400">
                    {String(errors.cnpj.message)}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          {isEditing && formKind === "usuario" && defaultValues?.id ? (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="h-10 px-4 rounded-lg border border-red-500 bg-red-500/10 text-red-500 hover:bg-red-500/20 disabled:opacity-60 flex items-center gap-2"
            >
              {isDeleting ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Excluindo...
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  Excluir
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="h-10 px-4 rounded-lg border border-input-border bg-input text-font hover:border-primary/60"
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="h-10 px-4 rounded-lg bg-primary text-contrast font-semibold hover:brightness-110 disabled:opacity-60"
          >
            {isSubmitting ? "Enviando..." : isEditing ? "Salvar" : "Continuar"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
