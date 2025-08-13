import { Package } from "lucide-react";

interface ProductCardProps {
  id: string;
  name: string;
  quantity: number;
  // Optional extra fields to support edit form defaults
  categoria?: string;
  estoqueInicial?: number;
  limiteAlerta?: number;
  onClick?: () => void;
}

export const ProductCard = ({ id, name, quantity, onClick }: ProductCardProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group text-left flex flex-col justify-between bg-light border border-input-border rounded-2xl p-4 h-38 hover:border-primary/70 hover:shadow-[0_0_0_1px_var(--color-primary)] transition-colors"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-font font-semibold truncate" title={name}>
            {name}
          </h3>
          <span className="inline-flex items-center gap-1 mt-1 text-xs text-font/70">
            <span className="px-2 py-0.5 rounded-full bg-input border border-input-border">
              ID: {id}
            </span>
          </span>
        </div>
        <Package className="size-6 text-font/60 group-hover:text-primary" />
      </div>

      {/* Quantity */}
      <div className="mt-4 flex items-center justify-between">
        <span className="text-font/80">Quantidade</span>
        <span className="text-primary font-bold text-lg">{quantity}</span>
      </div>
    </button>
  );
};
