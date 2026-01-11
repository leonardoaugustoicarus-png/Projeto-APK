
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Product, ProductStatus } from '../types';
import { Edit2, Trash2, Box, CalendarDays, ShoppingCart, Sparkles, Loader2, CheckSquare, Share2, Hash, AlertTriangle, ShieldCheck, CheckCircle } from 'lucide-react';
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

    if (sentinelRef.current) observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [displayLimit, products.length]);

  const visibleProducts = useMemo(() => products.slice(0, displayLimit), [products, displayLimit]);

  const getRowClass = (status: ProductStatus) => {
    switch (status) {
      case ProductStatus.EXPIRED: return 'border-red-600/30 bg-red-950/20';
      case ProductStatus.CRITICAL: return 'border-yellow-600/30 bg-yellow-900/10';
      case ProductStatus.SAFE: return 'border-green-800/20 bg-green-950/10';
      default: return 'border-white/5';
    }
  };

  const getStatusIcon = (status: ProductStatus) => {
    switch (status) {
      case ProductStatus.EXPIRED: return <AlertTriangle size={14} className="text-red-500 animate-pulse" />;
      case ProductStatus.CRITICAL: return <ShieldCheck size={14} className="text-yellow-500" />;
      case ProductStatus.SAFE: return <CheckCircle size={14} className="text-green-500" />;
    }
  };

  const allVisibleSelected = visibleProducts.length > 0 && visibleProducts.every(p => selectedIds.has(p.id));

  return (
    <>
      <div className="overflow-hidden rounded-3xl border border-white/5 shadow-[0_40px_100px_rgba(0,0,0,0.6)] bg-black/40 backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-red-950 to-transparent text-white/40 border-b border-white/5 text-[9px] uppercase tracking-[0.25em] font-black">
                <th className="px-6 py-6 w-12 text-center">
                  <input 
                    type="checkbox"
                    checked={allVisibleSelected}
                    onChange={() => onToggleSelectAll(visibleProducts.map(p => p.id))}
                    className="w-4 h-4 rounded-md border-white/10 text-orange-500 focus:ring-orange-500 bg-black/40 cursor-pointer"
                  />
                </th>
                <th className="px-6 py-6">ID / Logística</th>
                <th className="px-6 py-6">Insumo Farmacêutico</th>
                <th className="px-6 py-6 text-center">Qtd</th>
                <th className="px-6 py-6">Validade</th>
                <th className="px-6 py-6 text-center">Dias</th>
                <th className="px-6 py-6">Status</th>
                <th className="px-6 py-6 text-right">Controles</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-24 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-20">
                      <Box size={64} className="text-orange-500" />
                      <p className="text-orange-500 font-black uppercase tracking-[0.4em] text-xs italic">Base de dados vazia</p>
                    </div>
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
                        className={`${getRowClass(p.status)} ${isNew ? 'animate-new-row' : 'hover:bg-white/[0.03]'} ${isSelected ? 'bg-orange-500/10' : ''} transition-all duration-300 group border-l-2`}
                      >
                        <td className="px-6 py-5 text-center">
                          <input 
                            type="checkbox" 
                            checked={isSelected}
                            onChange={() => onToggleSelect(p.id)}
                            className="w-4 h-4 rounded-md border-white/10 text-orange-500 focus:ring-orange-500 bg-black/40 cursor-pointer"
                          />
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex flex-col">
                            <span className="inline-flex items-center gap-1.5 text-[9px] font-black text-orange-500/80 uppercase group-hover:text-orange-400 transition-colors">
                              <Hash size={10} /> {p.batch || 'N/D'}
                            </span>
                            <span className="font-mono text-[9px] opacity-30 mt-1 tracking-tighter">{p.barcode}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="font-black text-sm uppercase tracking-tight text-white group-hover:text-orange-400 transition-colors">{p.name}</div>
                          {p.observations && <div className="text-[9px] opacity-40 italic truncate max-w-[180px] mt-1">{p.observations}</div>}
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span className="bg-black/40 px-3 py-1.5 rounded-xl font-black text-[11px] border border-white/5 text-yellow-300">
                            {p.quantity}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2 font-bold text-xs text-white/80">
                            <CalendarDays size={14} className="text-orange-500/50" />
                            {new Date(p.expiryDate).toLocaleDateString('pt-BR')}
                          </div>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <div className={`inline-block px-3 py-1 rounded-lg font-black text-xs ${p.daysToExpiry <= 35 ? 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'text-green-400'}`}>
                            {p.daysToExpiry}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(p.status)}
                            <span className="text-[9px] font-black uppercase tracking-widest opacity-60">{p.status.split(' ')[0]}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                            <button onClick={() => onConsultAI(p)} className="p-2.5 bg-yellow-400/10 text-yellow-400 rounded-xl hover:bg-yellow-400 hover:text-red-950 transition-all"><Sparkles size={16} /></button>
                            <button onClick={() => onSell(p.id)} className="p-2.5 bg-green-500/10 text-green-500 rounded-xl hover:bg-green-500 hover:text-white transition-all"><ShoppingCart size={16} /></button>
                            <button onClick={() => onEdit(p)} className="p-2.5 bg-white/5 text-white/60 rounded-xl hover:bg-white/10 hover:text-white transition-all"><Edit2 size={16} /></button>
                            <button onClick={() => onDelete(p.id)} className="p-2.5 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="bg-black/60 p-4 border-t border-white/5 flex justify-between items-center px-8">
          <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">
            Monitoramento Ativo: {products.length} Registros {selectedIds.size > 0 && `| ${selectedIds.size} em foco`}
          </p>
          <p className="text-[9px] font-black text-orange-500 uppercase tracking-widest animate-pulse italic">Base de dados PEX-PRO v2.5</p>
        </div>
      </div>

      <ShareProductModal isOpen={shareModal.isOpen} onClose={() => setShareModal({ ...shareModal, isOpen: false })} product={shareModal.product} />
    </>
  );
};
