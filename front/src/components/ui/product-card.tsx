import { Package, DollarSign, Archive, Hash, FileText, TrendingUp, AlertTriangle } from "lucide-react";

interface ProductCardProps {
  id: string;
  nome: string;
  preco: number;
  estoque: number;
  ncm: string;
  observacao?: string;
  onClick?: () => void;
}

export const ProductCard = ({ id, nome, preco, estoque, ncm, observacao, onClick }: ProductCardProps) => {
  // Determine stock status for visual indicators
  const getStockStatus = () => {
    if (estoque === 0) return { status: 'out', indicator: 'bg-red-500' };
    if (estoque <= 10) return { status: 'low', indicator: 'bg-yellow-500' };
    return { status: 'good', indicator: 'bg-green-500' };
  };

  const stockStatus = getStockStatus();

  return (
    <button
      type="button"
      onClick={onClick}
      className="group text-left bg-light border border-light-border rounded-2xl p-4 hover:border-primary/60 hover:shadow-[0_0_0_1px_var(--color-primary)] transition-all duration-200 relative"
    >
      {/* Stock status indicator */}
      <div className={`absolute top-3 right-3 w-2 h-2 rounded-full ${stockStatus.indicator}`} />
      
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Package className="size-4 text-primary" />
            <span className="text-xs text-font/60 uppercase tracking-wide">Produto</span>
          </div>
          <h3 className="text-font font-semibold text-base leading-tight truncate" title={nome}>
            {nome}
          </h3>
          <div className="flex items-center gap-1 mt-0.5">
            <Hash className="size-3 text-font/40" />
            <span className="text-xs text-font/60 font-mono">{id}</span>
          </div>
        </div>
      </div>

      {/* Main metrics */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        {/* Price */}
        <div className="bg-input rounded-lg p-2 border border-input-border">
          <div className="flex items-center gap-1 mb-1">
            <DollarSign className="size-3 text-primary" />
            <span className="text-xs text-font/70">Preço</span>
          </div>
          <div className="text-sm font-bold text-font">
            R$ {preco.toFixed(2)}
          </div>
        </div>

        {/* Stock */}
        <div className="bg-input rounded-lg p-2 border border-input-border">
          <div className="flex items-center gap-1 mb-1">
            <Archive className="size-3 text-primary" />
            <span className="text-xs text-font/70">Estoque</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-sm font-bold text-font">{estoque}</span>
            {stockStatus.status === 'out' && <AlertTriangle className="size-3 text-red-500" />}
            {stockStatus.status === 'low' && <TrendingUp className="size-3 text-yellow-500" />}
          </div>
        </div>
      </div>

      {/* NCM and Observation */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Hash className="size-3 text-font/40" />
            <span className="text-xs text-font/60">NCM:</span>
          </div>
          <span className="text-xs font-mono text-font/80">{ncm}</span>
        </div>
        
        {observacao && (
          <div className="bg-input/50 rounded p-2 border border-input-border/50">
            <div className="flex items-center gap-1 mb-1">
              <FileText className="size-3 text-font/60" />
              <span className="text-xs text-font/60">Observação</span>
            </div>
            <div className="text-xs text-font/80 line-clamp-1" title={observacao}>
              {observacao}
            </div>
          </div>
        )}
      </div>
    </button>
  );
};
