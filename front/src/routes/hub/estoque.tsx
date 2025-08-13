import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { LayoutTitle } from "../../components/layouts/layout-title";
import { PlusIcon, SearchIcon } from "lucide-react";
import { ProductCard } from "../../components/ui/product-card";
import { Modal } from "../../components/layouts/modal";
import {
  ProductForm,
  type ProductFormValues,
} from "../../components/form/product-form";
import type { SelectOption } from "../../components/form/select-input";
import axios from "axios";

export const Route = createFileRoute("/hub/estoque")({
  component: RouteComponent,
});

type Produto = {
  id: string;
  name: string;
  quantity: number;
  createdAt: number;
  // Optional extra fields that might be present later
  categoria?: string;
  estoqueInicial?: number;
  limiteAlerta?: number;
};

// const initialProdutos: Produto[] = [
//   {
//     id: "SKU-00123",
//     name: "Tintura Arnica 30CH",
//     quantity: 42,
//     createdAt: new Date("2025-01-12").getTime(),
//   },
//   {
//     id: "SKU-00456",
//     name: "Pomada Calêndula 10%",
//     quantity: 12,
//     createdAt: new Date("2025-02-03").getTime(),
//   },
//   {
//     id: "SKU-00789",
//     name: "Solução Sinus 20ml",
//     quantity: 5,
//     createdAt: new Date("2025-01-28").getTime(),
//   },
//   {
//     id: "SKU-01012",
//     name: "Solução Sinus 25ml",
//     quantity: 5,
//     createdAt: new Date("2025-03-10").getTime(),
//   },
//   {
//     id: "SKU-01315",
//     name: "Solução Sinus 30ml",
//     quantity: 5,
//     createdAt: new Date("2025-03-08").getTime(),
//   },
// ];

function RouteComponent() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<
    "qty-asc" | "qty-desc" | "date-asc" | "date-desc"
  >("qty-asc");

  const [isModalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);

  const categoriaOptions: SelectOption[] = [
    { value: "homeopatia", label: "Homeopatia" },
    { value: "fitoterapia", label: "Fitoterapia" },
    { value: "dermocosmetico", label: "Dermocosmético" },
  ];

  const mapApiProduto = (r: any): Produto => ({
    id: r?.identificador ?? r?.id,
    name: r?.name ?? "",
    quantity:
      typeof r?.quantity === "number" ? r.quantity : (r?.estoqueInicial ?? 0),
    createdAt: typeof r?.createdAt === "number" ? r.createdAt : Date.now(),
    categoria: r?.categoria,
    estoqueInicial: r?.estoqueInicial,
    limiteAlerta: r?.limiteAlerta,
  });

  // Fetch products on mount
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const res = await axios.get("/api/produtos");
        const data = Array.isArray(res.data)
          ? res.data
          : (res.data?.items ?? []);
        if (!active) return;
        setProdutos((data as any[]).map(mapApiProduto));
      } catch (err) {
        console.error("Falha ao carregar produtos", err);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return produtos;
    return produtos.filter(
      (p) => p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q)
    );
  }, [query, produtos]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    switch (sort) {
      case "qty-asc":
        return arr.sort((a, b) => a.quantity - b.quantity);
      case "qty-desc":
        return arr.sort((a, b) => b.quantity - a.quantity);
      case "date-asc":
        return arr.sort((a, b) => a.createdAt - b.createdAt);
      case "date-desc":
        return arr.sort((a, b) => b.createdAt - a.createdAt);
      default:
        return arr;
    }
  }, [filtered, sort]);

  const openCreate = () => {
    setEditingId(null);
    setModalOpen(true);
  };

  const openEdit = (id: string) => {
    setEditingId(id);
    setModalOpen(true);
  };

  const closeModal = () => {
    if (submitting) return; // avoid closing while submitting
    setModalOpen(false);
    setEditingId(null);
  };

  const defaultValues: Partial<ProductFormValues> | undefined = useMemo(() => {
    if (!editingId) return undefined;
    const p = produtos.find((x) => x.id === editingId);
    if (!p) return undefined;
    return {
      identificador: p.id,
      name: p.name,
      categoria: p.categoria ?? "",
      estoqueInicial: p.estoqueInicial ?? p.quantity,
      limiteAlerta: p.limiteAlerta ?? 0,
    };
  }, [editingId, produtos]);

  const handleSubmitForm = async (data: ProductFormValues) => {
    setSubmitting(true);
    try {
      const payload = {
        identificador: data.identificador,
        name: data.name,
        categoria: data.categoria,
        estoqueInicial: data.estoqueInicial,
        limiteAlerta: data.limiteAlerta,
      };

      if (editingId) {
        // Update existing product via API
        const res = await axios.put(
          `/api/produtos/editar/${encodeURIComponent(editingId)}`,
          payload
        );
        const updated = mapApiProduto(res.data);
        setProdutos((prev) =>
          prev.map((p) => (p.id === editingId ? updated : p))
        );
      } else {
        // Create new product via API
        const res = await axios.post("/api/produtos/criar", payload);
        const created = mapApiProduto(res.data);
        setProdutos((prev) => [created, ...prev]);
      }
      setModalOpen(false);
      setEditingId(null);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col p-6 text-font">
      <LayoutTitle title="Estoque de" subtitle="Produtos" />
      {/* Ações principais movidas para dentro da grade de listagem */}

      {/* Busca e filtros */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-md w-full">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-font/60" size={18} />
            <input
              type="text"
              placeholder="Buscar por nome ou ID..."
              className="w-full h-11 pl-10 pr-3 rounded-xl bg-input border border-input-border text-font placeholder:text-font/50 focus:outline-none focus:border-primary/60 focus:shadow-[0_0_0_1px_var(--color-primary)]"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
        <div>
          <label htmlFor="filtro" className="sr-only">Ordenar</label>
          <select
            name="filtro"
            id="filtro"
            className="h-11 px-3 rounded-xl bg-input border border-input-border text-font"
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
          >
            <option value="qty-asc">Quantidade (menor)</option>
            <option value="qty-desc">Quantidade (maior)</option>
            <option value="date-desc">Ordem (novo)</option>
            <option value="date-asc">Ordem (antigo)</option>
          </select>
        </div>
      </div>

      {loading && (
        <div className="mb-4 text-sm text-font/70">Carregando produtos...</div>
      )}

      <div className="mt-4 border border-light-border rounded-2xl bg-light">
        <div className="p-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
            <button
              type="button"
              onClick={openCreate}
              className="flex flex-col justify-center items-center border border-input-border rounded-2xl p-4 h-36 text-primary hover:border-primary/70 hover:shadow-[0_0_0_1px_var(--color-primary)] transition-colors"
            >
              <PlusIcon size={24} />
              <span className="mt-1 text-sm font-medium">Adicionar produto</span>
              <span className="text-xs text-font/70">Cadastrar um novo item no estoque</span>
            </button>
            {sorted.map((produto) => (
              <ProductCard
                key={produto.id}
                id={produto.id}
                name={produto.name}
                quantity={produto.quantity}
                categoria={produto.categoria}
                estoqueInicial={produto.estoqueInicial}
                limiteAlerta={produto.limiteAlerta}
                onClick={() => openEdit(produto.id)}
              />
            ))}
          </div>
        </div>
      </div>

      <Modal
        open={isModalOpen}
        onClose={closeModal}
        title={editingId ? "Editar produto" : "Adicionar produto"}
        size="auto"
      >
        <ProductForm
          onSubmit={handleSubmitForm}
          defaultValues={defaultValues}
          categoriaOptions={categoriaOptions}
          submitting={submitting}
        />
      </Modal>
    </div>
  );
}
