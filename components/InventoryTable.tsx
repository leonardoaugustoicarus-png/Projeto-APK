
import React from 'react';
import { Product, ProductStatus } from '../types';
import { Edit2, Trash2, Box, CalendarDays, ShoppingCart } from 'lucide-react';

interface InventoryTableProps {
  products: Product[];
  onDelete: (id: string) => void;
  onSell: (id: string) => void;
  onEdit: (product: Product) => void;
}

export const InventoryTable: React.FC<InventoryTableProps> = ({ products, onDelete, onSell, onEdit }) => {
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

  return (
    <div className="overflow-hidden rounded-xl border-2 border-orange-500/50 shadow-[0_20px_50px_rgba(0,0,0,0.5)] bg-red-950/20 backdrop-blur-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse" aria-label="Lista de produtos e validades">
          <thead>
            <tr className="bg-gradient-to-r from-red-950 to-red-900 text-orange-400 border-b-2 border-orange-600/50 text-[10px] uppercase tracking-[0.2em] font-black">
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
                <td colSpan={7} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center gap-3 opacity-30" aria-hidden="true">
                    <Box size={48} className="text-yellow-600" />
                    <p className="text-yellow-600 font-black uppercase tracking-widest italic">Nenhum item para exibir</p>
                  </div>
                  <span className="sr-only">Nenhum produto encontrado.</span>
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr 
                  key={p.id} 
                  className={`${getRowClass(p.status)} hover:bg-orange-500/10 transition-colors duration-200 group border-l-4`}
                >
                  <td className="px-6 py-4 font-mono text-xs tracking-tighter opacity-70">{p.barcode}</td>
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
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                      <button 
                        onClick={() => onSell(p.id)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-all shadow-md active:scale-95 font-black text-[10px] uppercase"
                        aria-label={`Marcar ${p.name} como vendido`}
                      >
                        <ShoppingCart size={14} strokeWidth={3} aria-hidden="true" />
                        <span className="hidden xl:inline">Vendido</span>
                      </button>
                      <button 
                        onClick={() => onEdit(p)}
                        className="p-2 bg-yellow-500 text-red-950 rounded-lg hover:bg-yellow-400 transition-all shadow-md active:scale-95"
                        aria-label={`Editar ${p.name}`}
                      >
                        <Edit2 size={16} strokeWidth={3} aria-hidden="true" />
                      </button>
                      <button 
                        onClick={() => onDelete(p.id)}
                        className="p-2 bg-red-700 text-white rounded-lg hover:bg-red-600 transition-all shadow-md active:scale-95"
                        aria-label={`Excluir ${p.name}`}
                      >
                        <Trash2 size={16} strokeWidth={3} aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
