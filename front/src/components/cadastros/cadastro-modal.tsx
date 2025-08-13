import { Modal } from "../layouts/modal";
import type { FormKind } from "./cadastro-actions";
import { useEffect, useMemo } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

type Props = {
  open: boolean;
  onClose: () => void;
  formKind: FormKind;
  defaultValues?: any;
  onSubmit?: (data: any) => Promise<void> | void;
};

export function CadastroModal({
  open,
  onClose,
  formKind,
  defaultValues,
  onSubmit: onSubmitProp,
}: Props) {
  const isEditing = Boolean(defaultValues);
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
    // Encaminha para o callback do pai se existir
    if (onSubmitProp) {
      await onSubmitProp(data);
    } else {
      // eslint-disable-next-line no-console
      console.log("Cadastro submetido:", formKind, data);
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
          <button
            type="button"
            onClick={onClose}
            className="h-10 px-4 rounded-lg border border-input-border bg-input text-font hover:border-primary/60"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="h-10 px-4 rounded-lg bg-primary text-contrast font-semibold hover:brightness-110 disabled:opacity-60"
          >
            {isSubmitting ? "Enviando..." : "Continuar"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
