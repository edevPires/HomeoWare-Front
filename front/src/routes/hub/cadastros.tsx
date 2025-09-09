import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { LayoutTitle } from "../../components/layouts/layout-title";
import { SearchIcon } from "lucide-react";
import { CadastroActions } from "../../components/cadastros/cadastro-actions";
import { CadastroModal } from "../../components/cadastros/cadastro-modal";
import { api } from "../../lib/api";

type TabKey = "usuarios" | "clientes" | "empresas";
type UsuarioFuncao = "administrador" | "vendedor" | "veterinario";
type UsuarioListItem = { id: string; nome: string; email: string; funcao: UsuarioFuncao };

const mapNivelToFuncao = (nivel: unknown): UsuarioFuncao => {
  if (nivel === "admin") return "administrador";
  if (nivel === "vendedor") return "vendedor";
  if (nivel === "veterinario") return "veterinario";
  return "vendedor"; // default
};

export const Route = createFileRoute("/hub/cadastros")({
  component: RouteComponent,
});

function RouteComponent() {
  const [activeTab, setActiveTab] = useState<TabKey>("usuarios");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formKind, setFormKind] = useState<"usuario" | "cliente" | "empresa">(
    "usuario"
  );
  const [query, setQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  // Estados (mock) editáveis para permitir criar/editar
  const [usuarios, setUsuarios] = useState<UsuarioListItem[]>([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);
  const [errorUsuarios, setErrorUsuarios] = useState<string | null>(null);
  // eslint-disable-next-line no-console
  console.log("[Cadastros] usuarios state:", usuarios.length, usuarios);

  const loadUsuarios = async () => {
    try {
      setLoadingUsuarios(true);
      setErrorUsuarios(null);
      const resp = await api.get("/v1/usuarios", { withCredentials: true });
      const payload = resp?.data;
      const items: any[] = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload?.users)
            ? payload.users
            : [];
      const mapped: UsuarioListItem[] = items.map((u) => ({
        id: String(u.id ?? ""),
        nome: String(u.nome ?? ""),
        email: String(u.email ?? ""),
        // backend: nivel_acesso: 'admin' | 'vendedor' | 'veterinario'
        funcao: mapNivelToFuncao(u?.nivel_acesso),
      }));
      // eslint-disable-next-line no-console
      console.log("Usuarios carregados:", mapped.length, mapped);
      setUsuarios(mapped);
    } catch (e: any) {
      // eslint-disable-next-line no-console
      console.error(e);
      setErrorUsuarios(e?.response?.data?.message || "Falha ao carregar usuários");
    } finally {
      setLoadingUsuarios(false);
    }
  };

  useEffect(() => {
    loadUsuarios();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [clientes, setClientes] = useState(
    () => [
      { id: "C-101", nome: "Clínica Vida", documento: "12.345.678/0001-00" },
      { id: "C-102", nome: "Farmácia Saúde", documento: "98.765.432/0001-11" },
    ]
  );
  const [empresas, setEmpresas] = useState(
    () => [
      { id: "E-201", nome: "HomeoWare LTDA", documento: "11.222.333/0001-44" },
    ]
  );

  const data = useMemo(() => ({ usuarios, clientes, empresas }), [usuarios, clientes, empresas]);

  const tabs: { key: TabKey; label: string }[] = [
    { key: "usuarios", label: "Usuários" },
    { key: "clientes", label: "Clientes" },
    { key: "empresas", label: "Empresas" },
  ];

  const filteredUsuarios = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return data.usuarios;
    return data.usuarios.filter(
      (u) =>
        u.nome.toLowerCase().includes(q) ||
        (u.email ?? "").toLowerCase().includes(q) ||
        u.id.toLowerCase().includes(q)
    );
  }, [data.usuarios, query]);

  const filteredClientes = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return data.clientes;
    return data.clientes.filter(
      (c) =>
        c.nome.toLowerCase().includes(q) ||
        (c.documento ?? "").toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q)
    );
  }, [data.clientes, query]);

  const filteredEmpresas = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return data.empresas;
    return data.empresas.filter(
      (e) =>
        e.nome.toLowerCase().includes(q) ||
        (e.documento ?? "").toLowerCase().includes(q) ||
        e.id.toLowerCase().includes(q)
    );
  }, [data.empresas, query]);

  // Abrir modal para criação
  const openCreate = (kind: "usuario" | "cliente" | "empresa") => {
    setFormKind(kind);
    setEditingId(null);
    setIsModalOpen(true);
  };

  // Abrir modal para edição
  const openEdit = (kind: "usuario" | "cliente" | "empresa", id: string) => {
    setFormKind(kind);
    setEditingId(id);
    setIsModalOpen(true);
  };

  // Valores padrão para o modal conforme edição/criação
  const defaultValues = useMemo(() => {
    if (!editingId) return undefined;
    if (formKind === "usuario") {
      const u = usuarios.find((x) => x.id === editingId);
      if (!u) return undefined;
      return { id: u.id, nome: u.nome, email: u.email, funcao: u.funcao ?? "vendedor", senha: "" };
    }
    if (formKind === "cliente") {
      const c = clientes.find((x) => x.id === editingId);
      if (!c) return undefined;
      return { nome: c.nome, documento: c.documento };
    }
    const e = empresas.find((x) => x.id === editingId);
    if (!e) return undefined;
    return { razaoSocial: e.nome, cnpj: e.documento };
  }, [editingId, formKind, usuarios, clientes, empresas]);

  // Atualiza a lista de clientes localmente (para uso offline/demo)
  const updateClientes = (payload: any, editingId: string | null) => {
    if (editingId) {
      setClientes((prev) => 
        prev.map((c) => 
          c.id === editingId 
            ? { ...c, nome: payload.nome, documento: payload.documento } 
            : c
        )
      );
    } else {
      const id = `C-${String(Math.floor(Math.random() * 900) + 100)}`;
      setClientes((prev) => [{ id, nome: payload.nome, documento: payload.documento }, ...prev]);
    }
  };

  // Atualiza a lista de empresas localmente (para uso offline/demo)
  const updateEmpresas = (payload: any, editingId: string | null) => {
    if (editingId) {
      setEmpresas((prev) => 
        prev.map((e) => 
          e.id === editingId 
            ? { ...e, nome: payload.razaoSocial, documento: payload.cnpj } 
            : e
        )
      );
    } else {
      const id = `E-${String(Math.floor(Math.random() * 900) + 100)}`;
      setEmpresas((prev) => [{ id, nome: payload.razaoSocial, documento: payload.cnpj }, ...prev]);
    }
  };

  return (
    <div className="flex flex-col p-6 text-font overflow-y-auto">
      <LayoutTitle title="Central de" subtitle="Cadastros" />

      {/* Ações principais */}
      <CadastroActions
        onSelect={(kind) => openCreate(kind)}
      />

      {/* Tabs de listagem */}
      <div className="mt-8">
        <div className="inline-flex items-center gap-2 p-1 rounded-xl bg-light border border-light-border">
          {tabs.map((t) => {
            const active = activeTab === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setActiveTab(t.key)}
                className={[
                  "h-9 px-2 rounded-lg text-sm transition-colors",
                  active
                    ? "bg-input border border-input-border text-primary font-semibold"
                    : "text-font/80 hover:text-primary",
                ].join(" ")}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Search input */}
        <div className="mt-4 max-w-md">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-font/60" size={18} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nome, documento, e-mail ou ID..."
              className="w-full h-11 pl-10 pr-3 rounded-xl bg-input border border-input-border text-font placeholder:text-font/50 focus:outline-none focus:border-primary/60 focus:shadow-[0_0_0_1px_var(--color-primary)]"
            />
          </div>
        </div>

        <div className="mt-4 border border-light-border rounded-2xl bg-light">
          <div className="p-4">
            {activeTab === "usuarios" && (
              <ul className="divide-y divide-light-border">
                {loadingUsuarios && (
                  <li className="py-3 px-2 text-sm text-font/70">Carregando usuários...</li>
                )}
                {errorUsuarios && (
                  <li className="py-3 px-2 text-sm text-red-400">{errorUsuarios}</li>
                )}
                {!loadingUsuarios && !errorUsuarios && filteredUsuarios.length === 0 && (
                  <li className="py-3 px-2 text-sm text-font/70">Nenhum usuário encontrado.</li>
                )}
                {!loadingUsuarios && !errorUsuarios && filteredUsuarios.map((u) => (
                  <li
                    key={u.id}
                    className="py-3 flex items-center justify-between hover:bg-input/40 rounded-lg px-2 cursor-pointer"
                    onClick={() => openEdit("usuario", u.id)}
                  >
                    <div className="min-w-0">
                      <p className="font-medium truncate">{u.nome}</p>
                      <p className="text-sm text-font/70 truncate">{u.email}</p>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-input border border-input-border text-font/70">
                      ID: {u.id}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            {activeTab === "clientes" && (
              <ul className="divide-y divide-light-border">
                {filteredClientes.map((c) => (
                  <li
                    key={c.id}
                    className="py-3 flex items-center justify-between hover:bg-input/40 rounded-lg px-2 cursor-pointer"
                    onClick={() => openEdit("cliente", c.id)}
                  >
                    <div className="min-w-0">
                      <p className="font-medium truncate">{c.nome}</p>
                      <p className="text-sm text-font/70 truncate">{c.documento}</p>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-input border border-input-border text-font/70">
                      ID: {c.id}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            {activeTab === "empresas" && (
              <ul className="divide-y divide-light-border">
                {filteredEmpresas.map((e) => (
                  <li
                    key={e.id}
                    className="py-3 flex items-center justify-between hover:bg-input/40 rounded-lg px-2 cursor-pointer"
                    onClick={() => openEdit("empresa", e.id)}
                  >
                    <div className="min-w-0">
                      <p className="font-medium truncate">{e.nome}</p>
                      <p className="text-sm text-font/70 truncate">{e.documento}</p>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-input border border-input-border text-font/70">
                      ID: {e.id}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Modal de cadastro */}
      <CadastroModal
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingId(null);
        }}
        formKind={formKind}
        defaultValues={defaultValues}
        onSubmit={async (data: any) => {
          // Atualiza a lista apropriada baseada no tipo de formulário
          if (formKind === 'usuario') {
            await loadUsuarios();
          } else if (formKind === 'cliente') {
            updateClientes(data, editingId);
          } else {
            updateEmpresas(data, editingId);
          }
          // Fecha o modal e limpa o ID de edição
          setIsModalOpen(false);
          setEditingId(null);
        }}
      />
    </div>
  );
}
