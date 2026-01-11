
import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Calendar, Barcode, Package, AlertCircle, Hash } from 'lucide-react';
import { Product } from '../types';

interface ProductFormProps {
  onClose: () => void;
  onSubmit: (data: Partial<Product>) => void;
  initialData?: Product;
}

export const ProductForm: React.FC<ProductFormProps> = ({ onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState<Partial<Product>>({
    barcode: '',
    batch: '',
    name: '',
    quantity: 1,
    expiryDate: '',
    observations: ''
  });
  
  const [errors, setErrors] = useState<{ name?: string; expiryDate?: string }>({});

  const modalRef = useRef<HTMLDivElement>(null);
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
    const timer = setTimeout(() => {
      barcodeInputRef.current?.focus();
    }, 150);
    return () => clearTimeout(timer);
  }, [initialData]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])'
        );
        
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) { 
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else { 
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
      
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const validate = (): boolean => {
    const newErrors: { name?: string; expiryDate?: string } = {};
    
    if (!formData.name?.trim()) {
      newErrors.name = 'O nome do produto é obrigatório.';
    }
    
    if (!formData.expiryDate) {
      newErrors.expiryDate = 'A data de validade é obrigatória.';
    } else {
      const selectedDate = new Date(formData.expiryDate);
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);
      
      if (selectedDate < currentDate) {
        newErrors.expiryDate = 'A validade não pode ser anterior a hoje.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-red-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        ref={modalRef}
        className="bg-red-800 border-4 border-orange-500 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-elastic duration-300"
      >
        <header className="bg-orange-600 p-4 flex justify-between items-center shadow-lg">
          <h2 id="modal-title" className="text-white font-black uppercase flex items-center gap-2 text-sm tracking-widest">
            {initialData ? 'Editar Registro' : 'Novo Produto'}
          </h2>
          <button 
            onClick={onClose} 
            className="text-white hover:rotate-90 transition-transform p-1 rounded-md focus:ring-4 focus:ring-yellow-400 focus:outline-none"
            aria-label="Fechar formulário"
          >
            <X size={24} aria-hidden="true" />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-5">
            {/* 1. Barcode */}
            <div className="col-span-2 space-y-2">
              <label htmlFor="barcode" className="text-yellow-400 text-[10px] font-black uppercase tracking-widest block pl-1">Código de Barras</label>
              <div className="relative group">
                <Barcode aria-hidden="true" className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500 w-4 h-4 group-focus-within:text-yellow-400 transition-colors" />
                <input 
                  id="barcode"
                  type="text" 
                  ref={barcodeInputRef}
                  className="w-full bg-red-950/50 border-2 border-orange-900/50 rounded-xl py-3 pl-12 pr-4 text-yellow-300 focus:border-yellow-500 focus:ring-4 focus:ring-yellow-500/10 outline-none font-mono text-sm transition-all"
                  value={formData.barcode}
                  onChange={(e) => setFormData({...formData, barcode: e.target.value})}
                  placeholder="0000000000000"
                />
              </div>
            </div>

            {/* 2. Lote (Positioned before Product Name) */}
            <div className="col-span-2 space-y-2">
              <label htmlFor="batch" className="text-yellow-400 text-[10px] font-black uppercase tracking-widest block pl-1">Lote (Opcional)</label>
              <div className="relative group">
                <Hash aria-hidden="true" className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500 w-4 h-4 group-focus-within:text-yellow-400 transition-colors" />
                <input 
                  id="batch"
                  type="text" 
                  className="w-full bg-red-950/50 border-2 border-orange-900/50 rounded-xl py-3 pl-12 pr-4 text-yellow-300 focus:border-yellow-500 focus:ring-4 focus:ring-yellow-500/10 outline-none uppercase font-bold text-sm transition-all"
                  value={formData.batch}
                  onChange={(e) => setFormData({...formData, batch: e.target.value})}
                  placeholder="Ex: L88921"
                />
              </div>
            </div>

            {/* 3. Name */}
            <div className="col-span-2 space-y-2">
              <label htmlFor="name" className="text-yellow-400 text-[10px] font-black uppercase tracking-widest block pl-1">Nome do Produto *</label>
              <input 
                id="name"
                type="text" 
                className={`w-full bg-red-950/50 border-2 rounded-xl py-3 px-4 text-yellow-300 focus:border-yellow-500 focus:ring-4 focus:ring-yellow-500/10 outline-none uppercase font-black text-sm transition-all ${errors.name ? 'border-red-500 bg-red-900/30' : 'border-orange-900/50'}`}
                value={formData.name}
                onChange={(e) => {
                  setFormData({...formData, name: e.target.value});
                  if (errors.name) setErrors({...errors, name: undefined});
                }}
                placeholder="NOME DO MEDICAMENTO OU PRODUTO"
              />
              {errors.name && (
                <p className="text-red-400 text-[10px] font-bold flex items-center gap-1.5 mt-1.5 animate-in slide-in-from-left-1">
                  <AlertCircle size={12} strokeWidth={3} /> {errors.name}
                </p>
              )}
            </div>

            {/* 4. Quantity */}
            <div className="space-y-2">
              <label htmlFor="quantity" className="text-yellow-400 text-[10px] font-black uppercase tracking-widest block pl-1">Qtd</label>
              <div className="relative group">
                <Package aria-hidden="true" className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500 w-4 h-4 group-focus-within:text-yellow-400 transition-colors" />
                <input 
                  id="quantity"
                  type="number" 
                  min="0"
                  className="w-full bg-red-950/50 border-2 border-orange-900/50 rounded-xl py-3 pl-12 pr-4 text-yellow-300 focus:border-yellow-500 focus:ring-4 focus:ring-yellow-500/10 outline-none font-black text-sm transition-all"
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: Number(e.target.value)})}
                />
              </div>
            </div>

            {/* 5. ExpiryDate */}
            <div className="space-y-2">
              <label htmlFor="expiryDate" className="text-yellow-400 text-[10px] font-black uppercase tracking-widest block pl-1">Vencimento *</label>
              <div className="relative group">
                <Calendar aria-hidden="true" className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500 w-4 h-4 group-focus-within:text-yellow-400 transition-colors" />
                <input 
                  id="expiryDate"
                  type="date" 
                  min={today}
                  className={`w-full bg-red-950/50 border-2 rounded-xl py-3 pl-12 pr-4 text-yellow-300 focus:border-yellow-500 focus:ring-4 focus:ring-yellow-500/10 outline-none text-sm transition-all ${errors.expiryDate ? 'border-red-500 bg-red-900/30' : 'border-orange-900/50'}`}
                  value={formData.expiryDate}
                  onChange={(e) => {
                    setFormData({...formData, expiryDate: e.target.value});
                    if (errors.expiryDate) setErrors({...errors, expiryDate: undefined});
                  }}
                />
              </div>
              {errors.expiryDate && (
                <p className="text-red-400 text-[10px] font-bold flex items-center gap-1.5 mt-1.5 animate-in slide-in-from-left-1">
                  <AlertCircle size={12} strokeWidth={3} /> {errors.expiryDate}
                </p>
              )}
            </div>

            {/* 6. Observations */}
            <div className="col-span-2 space-y-2">
              <label htmlFor="observations" className="text-yellow-400 text-[10px] font-black uppercase tracking-widest block pl-1">Notas / Observações</label>
              <textarea 
                id="observations"
                className="w-full bg-red-950/50 border-2 border-orange-900/50 rounded-xl py-3 px-4 text-yellow-300 focus:border-yellow-500 focus:ring-4 focus:ring-yellow-500/10 outline-none h-24 resize-none text-sm transition-all placeholder:text-orange-900/50"
                value={formData.observations}
                onChange={(e) => setFormData({...formData, observations: e.target.value})}
                placeholder="Informações adicionais como tipo de armazenamento..."
              />
            </div>
          </div>

          <footer className="pt-4 flex gap-3">
            <button 
              type="submit"
              className="flex-1 bg-gradient-to-b from-orange-500 to-orange-700 hover:from-orange-400 hover:to-orange-600 text-white font-black py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-xl border-b-4 border-orange-900 active:translate-y-1 active:border-b-0 focus:ring-4 focus:ring-orange-500/50 focus:outline-none uppercase tracking-widest text-xs"
              aria-label="Salvar produto no inventário"
            >
              <Save size={18} aria-hidden="true" strokeWidth={3} />
              Confirmar Registro
            </button>
            <button 
              type="button"
              onClick={onClose}
              className="px-8 bg-red-950 text-white/70 font-black rounded-xl hover:bg-red-900 hover:text-white transition-all border border-orange-900/30 active:scale-95 focus:ring-4 focus:ring-white/10 focus:outline-none uppercase tracking-widest text-[10px]"
              aria-label="Cancelar e fechar formulário"
            >
              Sair
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};
