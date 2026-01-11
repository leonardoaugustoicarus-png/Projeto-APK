
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

  // Obtém a data de hoje no formato YYYY-MM-DD para o atributo 'min' do input
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
    // Foco inicial no primeiro campo lógico (barcode)
    const timer = setTimeout(() => {
      barcodeInputRef.current?.focus();
    }, 150);
    return () => clearTimeout(timer);
  }, [initialData]);

  // Lógica de captura de foco (Focus Trap)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab' && modalRef.current) {
        // Seleciona apenas elementos visíveis e habilitados
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])'
        );
        
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) { // Shift + Tab (navegação reversa)
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else { // Tab (navegação normal)
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
        <header className="bg-orange-600 p-4 flex justify-between items-center">
          <h2 id="modal-title" className="text-white font-black uppercase flex items-center gap-2">
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* 1. Barcode */}
            <div className="col-span-2 space-y-1">
              <label htmlFor="barcode" className="text-yellow-400 text-xs font-bold uppercase block">Código de Barras</label>
              <div className="relative">
                <Barcode aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-400 w-4 h-4" />
                <input 
                  id="barcode"
                  type="text" 
                  ref={barcodeInputRef}
                  className="w-full bg-red-900 border-2 border-orange-700 rounded p-2 pl-10 text-yellow-300 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 outline-none font-mono"
                  value={formData.barcode}
                  onChange={(e) => setFormData({...formData, barcode: e.target.value})}
                  placeholder="00000000000"
                />
              </div>
            </div>

            {/* 2. Batch */}
            <div className="col-span-2 space-y-1">
              <label htmlFor="batch" className="text-yellow-400 text-xs font-bold uppercase block">Lote</label>
              <div className="relative">
                <Hash aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-400 w-4 h-4" />
                <input 
                  id="batch"
                  type="text" 
                  className="w-full bg-red-900 border-2 border-orange-700 rounded p-2 pl-10 text-yellow-300 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 outline-none uppercase font-bold"
                  value={formData.batch}
                  onChange={(e) => setFormData({...formData, batch: e.target.value})}
                  placeholder="Ex: L12345"
                />
              </div>
            </div>

            {/* 3. Name */}
            <div className="col-span-2 space-y-1">
              <label htmlFor="name" className="text-yellow-400 text-xs font-bold uppercase block">Nome do Produto *</label>
              <input 
                id="name"
                type="text" 
                className={`w-full bg-red-900 border-2 rounded p-2 text-yellow-300 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 outline-none uppercase font-bold ${errors.name ? 'border-red-500 ring-1 ring-red-500' : 'border-orange-700'}`}
                value={formData.name}
                onChange={(e) => {
                  setFormData({...formData, name: e.target.value});
                  if (errors.name) setErrors({...errors, name: undefined});
                }}
                placeholder="Ex: Amoxicilina 500mg"
              />
              {errors.name && (
                <p className="text-red-400 text-[10px] font-bold flex items-center gap-1 mt-1">
                  <AlertCircle size={10} /> {errors.name}
                </p>
              )}
            </div>

            {/* 4. Quantity */}
            <div className="space-y-1">
              <label htmlFor="quantity" className="text-yellow-400 text-xs font-bold uppercase block">Quantidade</label>
              <div className="relative">
                <Package aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-400 w-4 h-4" />
                <input 
                  id="quantity"
                  type="number" 
                  min="0"
                  className="w-full bg-red-900 border-2 border-orange-700 rounded p-2 pl-10 text-yellow-300 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 outline-none"
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: Number(e.target.value)})}
                />
              </div>
            </div>

            {/* 5. ExpiryDate */}
            <div className="space-y-1">
              <label htmlFor="expiryDate" className="text-yellow-400 text-xs font-bold uppercase block">Vencimento *</label>
              <div className="relative">
                <Calendar aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-400 w-4 h-4" />
                <input 
                  id="expiryDate"
                  type="date" 
                  min={today}
                  className={`w-full bg-red-900 border-2 rounded p-2 pl-10 text-yellow-300 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 outline-none ${errors.expiryDate ? 'border-red-500 ring-1 ring-red-500' : 'border-orange-700'}`}
                  value={formData.expiryDate}
                  onChange={(e) => {
                    setFormData({...formData, expiryDate: e.target.value});
                    if (errors.expiryDate) setErrors({...errors, expiryDate: undefined});
                  }}
                />
              </div>
              {errors.expiryDate && (
                <p className="text-red-400 text-[10px] font-bold flex items-center gap-1 mt-1">
                  <AlertCircle size={10} /> {errors.expiryDate}
                </p>
              )}
            </div>

            {/* 6. Observations */}
            <div className="col-span-2 space-y-1">
              <label htmlFor="observations" className="text-yellow-400 text-xs font-bold uppercase block">Notas / Observações</label>
              <textarea 
                id="observations"
                className="w-full bg-red-900 border-2 border-orange-700 rounded p-2 text-yellow-300 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 outline-none h-24 resize-none"
                value={formData.observations}
                onChange={(e) => setFormData({...formData, observations: e.target.value})}
                placeholder="Observações adicionais sobre o armazenamento..."
              />
            </div>
          </div>

          <footer className="pt-4 flex gap-2">
            <button 
              type="submit"
              className="flex-1 bg-[#e26a00] hover:bg-[#f37b12] text-white font-black py-3 rounded-lg transition-all flex items-center justify-center gap-2 shadow-xl border-b-4 border-orange-900 active:translate-y-1 active:border-b-0 focus:ring-4 focus:ring-orange-500/50 focus:outline-none"
              aria-label="Salvar produto no inventário"
            >
              <Save size={20} aria-hidden="true" />
              CONFIRMAR
            </button>
            <button 
              type="button"
              onClick={onClose}
              className="px-6 bg-red-950 text-white font-bold rounded-lg hover:bg-red-900 transition-all border border-orange-500 active:scale-95 focus:ring-4 focus:ring-white/20 focus:outline-none"
              aria-label="Cancelar e fechar formulário"
            >
              SAIR
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};
