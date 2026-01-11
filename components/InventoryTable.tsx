
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Product, ProductStatus } from '../types';
import { Edit2, Trash2, Box, CalendarDays, ShoppingCart, Sparkles, Loader2, CheckSquare, Share2, Hash } from 'lucide-react';
import { ShareProductModal } from './ShareProductModal';

interface InventoryTableProps {
  products: Product[];
  onDelete: (id: string) => void;
  onSell: (id: string) => void;
  onEdit: (product: Product) => void;
  onConsultAI: (product: Product) => void;
  lastAddedId?: string | null;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: (ids: string[]) => void;
}

const ITEMS_PER_PAGE = 20;

export const InventoryTable: React.FC<InventoryTableProps> = ({ 
  products, 
  onDelete, 
  onSell, 
  onEdit, 
  onConsultAI, 
  lastAddedId,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll
}) => {
  const [displayLimit, setDisplayLimit] = useState(ITEMS_PER_PAGE);
  const [shareModal, setShareModal] = useState<{ isOpen: boolean; product: Product | null }>({
    isOpen: false,
    product: null
  });
  const sentinelRef = useRef<HTMLTableRowElement>(null);

  useEffect(() => {
    setDisplayLimit(ITEMS_PER_PAGE);
  }, [products.length, products[0]?.id]); 

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && displayLimit < products.length) {
          setTimeout(() => {
            setDisplayLimit((prev) => prev + ITEMS_PER_PAGE);
          }, 150);
        }
      },
      { threshold: 0.1 }
    );

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => observer.disconnect();
  }, [displayLimit, products.length]);

  const visibleProducts = useMemo(() => {
    return products.slice(0, displayLimit);
  }, [products, displayLimit]);

  const getRowClass = (status: ProductStatus) => {
    switch (status) {
      case ProductStatus.EXPIRED: return 'bg-red-950/40 text-red-200 border-red-600/50';
      case ProductStatus.CRITICAL: return 'bg-yellow-900/30 text-yellow-100 border-yellow-600/50';
      case ProductStatus.SAFE: return 'bg-green-900/20 text-green-100 border-green-800/30';
      default: return 'bg-red-900/40 text-yellow-300 border-orange-500/30';
    }
  };

  const getStatusBadge = (status: ProductStatus) => {
    switch (status) {
      case ProductStatus.EXPIRED: 
        return <span role="status" className="px-3 py-1 bg-red-600 text-white text-[10px] font-black rounded-full shadow-lg border border-red-400 animate-pulse inline-flex items-center gap-1">VENCIDO</span>;
      case ProductStatus.CRITICAL: 
        return <span role="status" className="px-3 py-1 bg-yellow-500 text-red-900 text-[10px] font-black rounded-full shadow-md border border-yellow-200 inline-flex items-center gap-1">CRÍTICO</span>;
      case ProductStatus.SAFE: 
        return <span role="status" className="px-3 py-1 bg-green-600 text-white text-[10px] font-black rounded-full shadow-md border border-green-400 inline-flex items-center gap-1">SEGURO</span>;
    }
  };

  const allVisibleSelected = visibleProducts.length > 0 && visibleProducts.every(p => selectedIds.has(p.id));

  const handleShareClick = (product: Product) => {
    setShareModal({ isOpen: true, product });
  };

  return (
    <>
      <div className="overflow-hidden rounded-xl border-2 border-orange-500/50 shadow-[0_20px_50px_rgba(0,0,0,0.5)] bg-red-950/20 backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" aria-label="Lista de produtos e validades">
            <thead>
              <tr className="bg-gradient-to-r from-red-950 to-red-900 text-orange-400 border-b-2 border-orange-600/50 text-[10px] uppercase tracking-[0.2em] font-black">
                <th scope="col" className="px-4 py-4 w-10">
                  <div className="flex items-center justify-center">
                    <input 
                      type="checkbox"
                      checked={allVisibleSelected}
                      onChange={() => onToggleSelectAll(visibleProducts.map(p => p.id))}
                      className="w-4 h-4 rounded border-orange-600 text-yellow-500 focus:ring-yellow-500 bg-red-950/50"
                      aria-label="Selecionar todos os itens visíveis"
                    />
                  </div>
                </th>
                <th scope="col" className="px-6 py-4">Lote / Código</th>
                <th scope="col" className="px-6 py-4">Descrição do Produto</th>
                <th scope="col" className="px-6 py-4 text-center">Qtd</th>
                <th scope="col" className="px-6 py-4">Validade</th>
                <th scope="col" className="px-6 py-4 text-center">Dias Rest.</th>
                <th scope="col" className="px-6 py-4">Status</th>
                <th scope="col" className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-orange-900/20">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3 opacity-30" aria-hidden="true">
                      <Box size={48} className="text-yellow-600" />
                      <p className="text-yellow-600 font-black uppercase tracking-widest italic">Nenhum item para exibir</p>
                    </div>
                    <span className="sr-only">Nenhum produto encontrado.</span>
                  </td>
                </tr>
              ) : (
                <>
                  {visibleProducts.map((p) => {
                    const isNew = p.id === lastAddedId;
                    const isSelected = selectedIds.has(p.id);
                    return (
                      <tr 
                        key={p.id} 
                        className={`${getRowClass(p.status)} ${isNew ? 'animate-new-row ring-2 ring-inset ring-yellow-500/50' : 'hover:bg-orange-500/10'} ${isSelected ? 'bg-orange-500/20' : ''} transition-colors duration-200 group border-l-4 animate-in fade-in duration-500`}
                      >
                        <td className="px-4 py-4 text-center">
                          <input 
                            type="checkbox" 
                            checked={isSelected}
                            onChange={() => onToggleSelect(p.id)}
                            className="w-4 h-4 rounded border-orange-800 text-yellow-500 focus:ring-yellow-500 bg-red-950/50"
                            aria-label={`Selecionar ${p.name}`}
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div 
                            className="inline-flex items-center gap-1 font-bold text-[11px] text-yellow-500/60 uppercase tracking-wider hover:bg-orange-500/20 hover:text-yellow-400 px-1.5 py-0.5 rounded transition-all cursor-default"
                            title="Lote do Produto"
                          >
                            <Hash size={10} className="text-orange-500/50" aria-hidden="true" />
                            {p.batch || 'S/ LOTE'}
                          </div>
                          <div className="font-mono text-[10px] tracking-tighter opacity-40 mt-0.5 pl-1.5">{p.barcode}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-black text-sm uppercase tracking-tight group-hover:text-yellow-400 transition-colors">{p.name}</div>
                          {p.observations && (
                            <div className="text-[10px] opacity-50 italic truncate max-w-[200px] font-medium" title={p.observations}>
                              {p.observations}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="bg-black/20 px-3 py-1 rounded font-black text-xs border border-white/5" aria-label={`Quantidade: ${p.quantity}`}>
                            {p.quantity}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-bold text-xs flex items-center gap-2 h-full py-6 whitespace-nowrap">
                          <CalendarDays size={14} className="text-orange-500" aria-hidden="true" />
                          {new Date(p.expiryDate).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div 
                            aria-label={`${p.daysToExpiry} dias restantes`}
                            className={`inline-block px-3 py-1 rounded-md font-black text-sm shadow-inner ${
                              p.daysToExpiry <= 35 
                                ? 'bg-red-600/80 text-white ring-2 ring-red-400' 
                                : 'bg-green-900/50 text-green-300'
                            }`}
                          >
                            {p.daysToExpiry}
                          </div>
                        </td>
                        <td className="px-6 py-4">{getStatusBadge(p.status)}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                            <button 
                              onClick={() => handleShareClick(p)}
                              className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500 hover:text-white transition-all shadow-md active:scale-95 flex items-center gap-1"
                              title="Compartilhar Detalhes"
                              aria-label={`Compartilhar ${p.name}`}
                            >
                              <Share2 size={16} strokeWidth={2.5} aria-hidden="true" />
                            </button>
                            <button 
                              onClick={() => onConsultAI(p)}
                              className="p-2 bg-yellow-400/20 text-yellow-400 rounded-lg hover:bg-yellow-400 hover:text-red-950 transition-all shadow-md active:scale-95 flex items-center gap-1"
                              title="Consulte IA"
                              aria-label={`Consultar IA sobre ${p.name}`}
                            >
                              <Sparkles size={16} strokeWidth={2.5} aria-hidden="true" />
                            </button>
                            <button 
                              onClick={() => onSell(p.id)}
                              className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-all shadow-md active:scale-95 flex items-center gap-1.5 font-black text-[10px] uppercase tracking-tighter"
                              title="Vender Produto"
                              aria-label={`Marcar ${p.name} como vendido`}
                            >
                              <ShoppingCart size={14} strokeWidth={3} aria-hidden="true" />
                              <span className="hidden xl:inline">Vender</span>
                            </button>
                            <button 
                              onClick={() => onEdit(p)}
                              className="p-2 bg-yellow-500 text-red-950 rounded-lg hover:bg-yellow-400 transition-all shadow-md active:scale-95"
                              title="Editar Produto"
                              aria-label={`Editar ${p.name}`}
                            >
                              <Edit2 size={16} strokeWidth={3} aria-hidden="true" />
                            </button>
                            <button 
                              onClick={() => onDelete(p.id)}
                              className="p-2 bg-red-700 text-white rounded-lg hover:bg-red-600 transition-all shadow-md active:scale-95"
                              title="Excluir Registro"
                              aria-label={`Excluir ${p.name}`}
                            >
                              <Trash2 size={16} strokeWidth={3} aria-hidden="true" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  
                  {displayLimit < products.length && (
                    <tr ref={sentinelRef}>
                      <td colSpan={8} className="px-6 py-8 text-center bg-black/10">
                        <div className="flex items-center justify-center gap-3">
                          <Loader2 className="text-orange-500 animate-spin" size={20} />
                          <span className="text-orange-500 font-black text-[10px] uppercase tracking-widest animate-pulse">
                            Carregando mais itens ({products.length - displayLimit} restantes)...
                          </span>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="bg-red-950/80 p-3 border-t border-orange-600/30 flex justify-between items-center px-6">
          <p className="text-[9px] font-black text-orange-400/60 uppercase tracking-widest">
            Mostrando {Math.min(displayLimit, products.length)} de {products.length} produtos {selectedIds.size > 0 && `| ${selectedIds.size} selecionado(s)`}
          </p>
          {displayLimit < products.length && (
            <p className="text-[9px] font-black text-yellow-500 uppercase tracking-widest animate-pulse">
              Role para ver mais
            </p>
          )}
        </div>
      </div>

      <ShareProductModal 
        isOpen={shareModal.isOpen} 
        onClose={() => setShareModal({ ...shareModal, isOpen: false })} 
        product={shareModal.product} 
      />
    </>
  );
};
