import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { LayoutTitle } from "../../components/layouts/layout-title";
import { PlusIcon, SearchIcon, Loader2 } from "lucide-react";
import { ProductCard } from "../../components/ui/product-card";
import { Modal } from "../../components/layouts/modal";
import {
  ProductForm,
  type ProductFormValues,
} from "../../components/form/product-form";
import { api } from "../../lib/api";

export const Route = createFileRoute("/hub/estoque")({
  component: RouteComponent,
});

type Produto = {
  id: string;
  nome: string;
  preco: number;
  estoque: number;
  ncm: string;
  observacao?: string;
  createdAt: number;
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
  const [deleting, setDeleting] = useState(false);

  const mapApiProduto = (r: any): Produto => ({
    id: r?.id ?? "",
    nome: r?.nome ?? "",
    preco: typeof r?.preco === "number" ? r.preco : 0,
    estoque: typeof r?.estoque === "number" ? r.estoque : 0,
    ncm: r?.ncm ?? "",
    observacao: r?.observacao ?? "",
    createdAt: typeof r?.createdAt === "number" ? r.createdAt : Date.now(),
  });

  // Fetch products on mount
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const res = await api.get("/v1/produtos");
        // Backend returns paginated data: { data: [...], current_page, last_page, etc }
        const data = res.data?.data ?? [];
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
      (p) =>
        p.nome.toLowerCase().includes(q) ||
        String(p.id).toLowerCase().includes(q) ||
        p.ncm.toLowerCase().includes(q)
    );
  }, [query, produtos]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    switch (sort) {
      case "qty-asc":
        return arr.sort((a, b) => a.estoque - b.estoque);
      case "qty-desc":
        return arr.sort((a, b) => b.estoque - a.estoque);
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

  const defaultValues = useMemo(() => {
    if (!editingId) return undefined;
    const p = produtos.find((x) => x.id === editingId);
    if (!p) return undefined;
    return {
      nome: p.nome,
      preco: p.preco,
      estoque: p.estoque,
      ncm: p.ncm,
      observacao: p.observacao,
    };
  }, [editingId, produtos]);

  const handleSubmitForm = async (data: ProductFormValues) => {
    setSubmitting(true);
    try {
      const payload = {
        nome: data.nome,
        preco: data.preco,
        estoque: data.estoque,
        ncm: data.ncm,
        observacao: data.observacao,
      };

      if (editingId) {
        // Update existing product via API
        const res = await api.put(
          `/v1/produtos/${editingId}`,
          payload
        );
        const apiResponse = res.data?.data ?? res.data;
        
        // Check if API returned a different ID (indicates backend issue)
        if (apiResponse.id && String(apiResponse.id) !== String(editingId)) {
          console.warn('⚠️ API returned different ID!', {
            expected: editingId,
            received: apiResponse.id,
            message: 'This suggests the backend created a new product instead of updating the existing one'
          });
        }
        
        // Always use the original editing ID to maintain consistency
        const updated = {
          ...mapApiProduto(apiResponse),
          id: editingId // Force the ID to match what we're editing
        };
        
        setProdutos((prev) => {
          const newProducts = prev.map((p) => {
            if (String(p.id) === String(editingId)) {
              console.log('✅ Successfully updated product:', editingId);
              return updated;
            }
            return p;
          });
          
          return newProducts;
        });
      } else {
        // Create new product via API
        const res = await api.post("/v1/produtos", payload);
        const created = mapApiProduto(res.data?.data ?? res.data);
        setProdutos((prev) => [created, ...prev]);
      }
      setModalOpen(false);
      setEditingId(null);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!editingId) return;
    
    const produto = produtos.find(p => p.id === editingId);
    if (!produto) return;

    if (!confirm(`Tem certeza que deseja excluir o produto "${produto.nome}"?`)) {
      return;
    }

    setDeleting(true);
    try {
      const response = await api.delete(`/v1/produtos/${editingId}`);
      
      // Log success message from API (should be "Produto removido com sucesso.")
      if (response.data?.message) {
        console.log('✅ Delete success:', response.data.message);
      }
      
      // Remove product from local state
      setProdutos((prev) => prev.filter((p) => p.id !== editingId));
      setModalOpen(false);
      setEditingId(null);
      
      // Optional: Show success message to user
      // alert(response.data?.message || 'Produto removido com sucesso!');
      
    } catch (error: any) {
      console.error('Erro ao excluir produto:', error);
      
      // Handle specific API error responses
      if (error.response?.status === 404) {
        alert('Produto não encontrado.');
      } else if (error.response?.status === 401) {
        alert('Não autorizado. Faça login novamente.');
      } else {
        alert('Erro ao excluir produto. Tente novamente.');
      }
    } finally {
      setDeleting(false);
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
            <SearchIcon
              className="absolute left-3 top-1/2 -translate-y-1/2 text-font/60"
              size={18}
            />
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
          <label htmlFor="filtro" className="sr-only">
            Ordenar
          </label>
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
        <div className="mt-4 flex flex-col items-center justify-center py-12 text-font/70">
          <Loader2 className="size-8 animate-spin text-primary mb-3" />
          <span className="text-sm">Carregando produtos...</span>
        </div>
      )}

      {/* Add Product Button */}
      <div className="mt-4 flex justify-start">
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2  bg-primary text-contrast rounded-lg font-medium hover:brightness-110 transition-all"
        >
          <PlusIcon size={16} className="text-dark" />
          <span className="text-dark">Adicionar produto</span>
        </button>
      </div>

      {/* Products Grid */}
      {!loading && (
        <div className="mt-3 border border-light-border rounded-2xl bg-light">
          <div className="p-4">
            {sorted.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-font/60">
                <div className="text-4xl mb-4">📦</div>
                <h3 className="text-lg font-medium text-font/80 mb-2">Nenhum produto encontrado</h3>
                <p className="text-sm text-center max-w-md">
                  {query ? 'Tente ajustar sua pesquisa ou' : 'Comece'} adicionando seu primeiro produto ao estoque.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
                {sorted.map((produto) => (
                  <ProductCard
                    key={produto.id}
                    id={produto.id}
                    nome={produto.nome}
                    preco={produto.preco}
                    estoque={produto.estoque}
                    ncm={produto.ncm}
                    observacao={produto.observacao}
                    onClick={() => openEdit(produto.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <Modal
        open={isModalOpen}
        onClose={closeModal}
        title={editingId ? "Editar produto" : "Adicionar produto"}
        size="auto"
      >
        <ProductForm
          onSubmit={handleSubmitForm}
          defaultValues={defaultValues}
          submitting={submitting}
          onDelete={editingId ? handleDeleteProduct : undefined}
          deleting={deleting}
        />
      </Modal>
    </div>
  );
}
