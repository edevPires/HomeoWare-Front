import { UserPlusIcon, UsersIcon, Building2Icon, ChevronRightIcon } from "lucide-react";

export type FormKind = "usuario" | "cliente" | "empresa";

type Props = {
  onSelect: (kind: FormKind) => void;
};

export function CadastroActions({ onSelect }: Props) {
  return (
    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
      <button
        type="button"
        className="group w-full rounded-xl border border-input-border bg-input text-left p-4 hover:border-primary/60 hover:shadow-[0_0_0_1px_var(--color-primary)] transition-colors"
        onClick={() => onSelect("usuario")}
        aria-label="Cadastrar Usuário"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-lg bg-light border border-light-border flex items-center justify-center text-primary">
              <UserPlusIcon size={20} />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-font truncate">Cadastrar Usuário</p>
              <p className="text-sm text-font/70 truncate">Crie um novo usuário do sistema</p>
            </div>
          </div>
          <ChevronRightIcon className="text-font/40 group-hover:text-primary transition-colors" size={18} />
        </div>
      </button>

      <button
        type="button"
        className="group w-full rounded-xl border border-input-border bg-input text-left p-4 hover:border-primary/60 hover:shadow-[0_0_0_1px_var(--color-primary)] transition-colors"
        onClick={() => onSelect("cliente")}
        aria-label="Cadastrar Cliente"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-lg bg-light border border-light-border flex items-center justify-center text-primary">
              <UsersIcon size={20} />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-font truncate">Cadastrar Cliente</p>
              <p className="text-sm text-font/70 truncate">Registre um novo cliente</p>
            </div>
          </div>
          <ChevronRightIcon className="text-font/40 group-hover:text-primary transition-colors" size={18} />
        </div>
      </button>

      <button
        type="button"
        className="group w-full rounded-xl border border-input-border bg-input text-left p-4 hover:border-primary/60 hover:shadow-[0_0_0_1px_var(--color-primary)] transition-colors"
        onClick={() => onSelect("empresa")}
        aria-label="Cadastrar Empresa"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-lg bg-light border border-light-border flex items-center justify-center text-primary">
              <Building2Icon size={20} />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-font truncate">Cadastrar Empresa</p>
              <p className="text-sm text-font/70 truncate">Cadastre uma nova empresa</p>
            </div>
          </div>
          <ChevronRightIcon className="text-font/40 group-hover:text-primary transition-colors" size={18} />
        </div>
      </button>
    </div>
  );
}
