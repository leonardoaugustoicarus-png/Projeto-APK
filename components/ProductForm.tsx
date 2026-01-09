
import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Calendar, Barcode, Package } from 'lucide-react';
import { Product } from '../types';

interface ProductFormProps {
  onClose: () => void;
  onSubmit: (data: Partial<Product>) => void;
  initialData?: Product;
}

export const ProductForm: React.FC<ProductFormProps> = ({ onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState<Partial<Product>>({
    barcode: '',
    name: '',
    quantity: 1,
    expiryDate: '',
    observations: ''
  });

  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
    // Foco automático para navegação por teclado intuitiva
    setTimeout(() => {
      firstInputRef.current?.focus();
    }, 100);
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.expiryDate) {
      alert('Campos obrigatórios: Nome e Data de Validade');
      return;
    }
    onSubmit(formData);
  };

  return (
    <div 
      className="fixed inset-0 bg-red-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="bg-red-800 border-4 border-orange-500 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        <header className="bg-orange-600 p-4 flex justify-between items-center">
          <h2 id="modal-title" className="text-white font-black uppercase flex items-center gap-2">
            {initialData ? 'Editar Registro' : 'Novo Produto'}
          </h2>
          <button 
            onClick={onClose} 
            className="text-white hover:rotate-90 transition-transform p-1 rounded-md focus:ring-2 focus:ring-yellow-400 focus:outline-none"
            aria-label="Fechar formulário"
          >
            <X size={24} aria-hidden="true" />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1">
              <label htmlFor="barcode" className="text-yellow-400 text-xs font-bold uppercase block">Código de Barras / Lote</label>
              <div className="relative">
                <Barcode aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-400 w-4 h-4" />
                <input 
                  id="barcode"
                  type="text" 
                  ref={firstInputRef}
                  className="w-full bg-red-900 border-2 border-orange-700 rounded p-2 pl-10 text-yellow-300 focus:border-yellow-500 outline-none"
                  value={formData.barcode}
                  onChange={(e) => setFormData({...formData, barcode: e.target.value})}
                  placeholder="00000000000"
                />
              </div>
            </div>

            <div className="col-span-2 space-y-1">
              <label htmlFor="name" className="text-yellow-400 text-xs font-bold uppercase block">Nome do Produto *</label>
              <input 
                id="name"
                type="text" 
                required
                className="w-full bg-red-900 border-2 border-orange-700 rounded p-2 text-yellow-300 focus:border-yellow-500 outline-none uppercase font-bold"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Ex: Amoxicilina 500mg"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="quantity" className="text-yellow-400 text-xs font-bold uppercase block">Quantidade</label>
              <div className="relative">
                <Package aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-400 w-4 h-4" />
                <input 
                  id="quantity"
                  type="number" 
                  min="0"
                  className="w-full bg-red-900 border-2 border-orange-700 rounded p-2 pl-10 text-yellow-300 focus:border-yellow-500 outline-none"
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: Number(e.target.value)})}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="expiryDate" className="text-yellow-400 text-xs font-bold uppercase block">Vencimento *</label>
              <div className="relative">
                <Calendar aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-400 w-4 h-4" />
                <input 
                  id="expiryDate"
                  type="date" 
                  required
                  className="w-full bg-red-900 border-2 border-orange-700 rounded p-2 pl-10 text-yellow-300 focus:border-yellow-500 outline-none"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                />
              </div>
            </div>

            <div className="col-span-2 space-y-1">
              <label htmlFor="observations" className="text-yellow-400 text-xs font-bold uppercase block">Notas / Observações</label>
              <textarea 
                id="observations"
                className="w-full bg-red-900 border-2 border-orange-700 rounded p-2 text-yellow-300 focus:border-yellow-500 outline-none h-24 resize-none"
                value={formData.observations}
                onChange={(e) => setFormData({...formData, observations: e.target.value})}
                placeholder="Observações adicionais sobre o armazenamento..."
              />
            </div>
          </div>

          <footer className="pt-4 flex gap-2">
            <button 
              type="submit"
              className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-red-900 font-black py-3 rounded-lg transition-all flex items-center justify-center gap-2 shadow-xl border-b-4 border-orange-700 active:translate-y-1 active:border-b-0 focus:ring-4 focus:ring-yellow-400/50 focus:outline-none"
              aria-label="Salvar produto no inventário"
            >
              <Save size={20} aria-hidden="true" />
              CONFIRMAR
            </button>
            <button 
              type="button"
              onClick={onClose}
              className="px-6 bg-red-950 text-white font-bold rounded-lg hover:bg-red-900 transition-all border border-orange-500 active:scale-95 focus:ring-4 focus:ring-white/20 focus:outline-none"
              aria-label="Cancelar cadastro"
            >
              SAIR
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};
