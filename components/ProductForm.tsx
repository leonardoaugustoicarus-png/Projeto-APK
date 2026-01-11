
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { X, Save, Calendar, Barcode, Package, AlertCircle, Hash, Info, ChevronRight } from 'lucide-react';
import { Product, ProductStatus } from '../types';
import { calculateDaysToExpiry, getStatusFromDays } from '../utils/dateUtils';

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

  // Preview de status em tempo real
  const expiryPreview = useMemo(() => {
    if (!formData.expiryDate) return null;
    const days = calculateDaysToExpiry(formData.expiryDate);
    const status = getStatusFromDays(days);
    return { days, status };
  }, [formData.expiryDate]);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
    const timer = setTimeout(() => {
      barcodeInputRef.current?.focus();
    }, 150);
    return () => clearTimeout(timer);
  }, [initialData]);

  const validate = (): boolean => {
    const newErrors: { name?: string; expiryDate?: string } = {};
    if (!formData.name?.trim()) newErrors.name = 'Nome obrigatório.';
    if (!formData.expiryDate) newErrors.expiryDate = 'Data obrigatória.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-4 overflow-y-auto">
      <div 
        ref={modalRef}
        className="bg-[#2d0606] border border-orange-500/30 rounded-3xl shadow-[0_0_80px_rgba(0,0,0,0.8)] w-full max-w-2xl overflow-hidden animate-in zoom-in-elastic duration-500"
      >
        <header className="bg-gradient-to-r from-red-950 to-red-900 p-6 flex justify-between items-center border-b border-orange-500/20">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-600 rounded-2xl shadow-lg shadow-orange-900/40">
              <Package className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-white font-black uppercase text-lg tracking-tight">
                {initialData ? 'Atualizar Registro' : 'Novo Produto'}
              </h2>
              <p className="text-orange-500/60 text-[10px] font-black uppercase tracking-widest">Painel de Cadastro de Insumos</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-orange-500 transition-colors">
            <X size={28} />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Seção 1: Identificação */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-orange-500/50 mb-2">
              <ChevronRight size={14} strokeWidth={3} />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Identificação Principal</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField label="Código de Barras" icon={<Barcode size={16} />}>
                <input 
                  type="text" 
                  ref={barcodeInputRef}
                  className="w-full bg-black/40 border-2 border-white/5 rounded-2xl py-4 px-12 text-yellow-400 font-mono text-sm outline-none focus:border-orange-500 transition-all input-glow"
                  value={formData.barcode}
                  onChange={(e) => setFormData({...formData, barcode: e.target.value})}
                  placeholder="0000000000000"
                />
              </FormField>

              <FormField label="Número do Lote" icon={<Hash size={16} />}>
                <input 
                  type="text" 
                  className="w-full bg-black/40 border-2 border-white/5 rounded-2xl py-4 px-12 text-yellow-400 font-bold text-sm outline-none focus:border-orange-500 transition-all input-glow uppercase"
                  value={formData.batch}
                  onChange={(e) => setFormData({...formData, batch: e.target.value})}
                  placeholder="EX: L-2025/01"
                />
              </FormField>

              <div className="md:col-span-2">
                <FormField label="Nome / Descrição do Medicamento *" icon={<Info size={16} />}>
                  <input 
                    type="text" 
                    className={`w-full bg-black/40 border-2 rounded-2xl py-4 px-6 text-white font-black text-base outline-none focus:border-orange-500 transition-all input-glow uppercase placeholder:text-white/10 ${errors.name ? 'border-red-500' : 'border-white/5'}`}
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="DIGITE O NOME COMPLETO"
                  />
                  {errors.name && <span className="text-red-500 text-[9px] font-black uppercase mt-1 block tracking-widest">{errors.name}</span>}
                </FormField>
              </div>
            </div>
          </div>

          {/* Seção 2: Logística e Prazos */}
          <div className="space-y-4 pt-4 border-t border-white/5">
            <div className="flex items-center gap-2 text-orange-500/50 mb-2">
              <ChevronRight size={14} strokeWidth={3} />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Controle Logístico</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField label="Estoque Atual" icon={<Package size={16} />}>
                <input 
                  type="number" 
                  min="0"
                  className="w-full bg-black/40 border-2 border-white/5 rounded-2xl py-4 px-12 text-yellow-400 font-black text-lg outline-none focus:border-orange-500 transition-all input-glow"
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: Number(e.target.value)})}
                />
              </FormField>

              <div className="md:col-span-2">
                <FormField label="Data de Vencimento *" icon={<Calendar size={16} />}>
                  <div className="relative">
                    <input 
                      type="date" 
                      min={today}
                      className={`w-full bg-black/40 border-2 rounded-2xl py-4 px-12 text-yellow-400 font-black text-sm outline-none focus:border-orange-500 transition-all input-glow ${errors.expiryDate ? 'border-red-500' : 'border-white/5'}`}
                      value={formData.expiryDate}
                      onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                    />
                    {expiryPreview && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 animate-in fade-in zoom-in">
                        <span className="text-[9px] font-black text-white/30 uppercase mr-2">{expiryPreview.days} dias</span>
                        <StatusPill status={expiryPreview.status} />
                      </div>
                    )}
                  </div>
                </FormField>
              </div>
            </div>
          </div>

          {/* Observações */}
          <FormField label="Observações de Armazenamento" icon={<AlertCircle size={16} />}>
            <textarea 
              className="w-full bg-black/40 border-2 border-white/5 rounded-2xl py-4 px-6 text-yellow-200/60 font-medium text-sm outline-none focus:border-orange-500 transition-all input-glow h-24 resize-none"
              value={formData.observations}
              onChange={(e) => setFormData({...formData, observations: e.target.value})}
              placeholder="Ex: Armazenar entre 2°C e 8°C..."
            />
          </FormField>

          <footer className="pt-6 flex flex-col sm:flex-row gap-4">
            <button 
              type="submit"
              className="flex-1 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-black py-5 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-2xl shadow-orange-950/40 border-b-4 border-orange-800 active:translate-y-1 active:border-b-0 uppercase tracking-[0.2em] text-xs"
            >
              <Save size={20} strokeWidth={3} />
              Finalizar Registro
            </button>
            <button 
              type="button"
              onClick={onClose}
              className="px-10 bg-red-950/40 text-orange-500 hover:text-white font-black rounded-2xl hover:bg-red-900/60 transition-all border border-orange-500/20 active:scale-95 uppercase tracking-[0.2em] text-[10px]"
            >
              Descartar
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};

const FormField: React.FC<{ label: string; icon: React.ReactNode; children: React.ReactNode }> = ({ label, icon, children }) => (
  <div className="space-y-2 relative group">
    <label className="text-orange-500/70 text-[10px] font-black uppercase tracking-widest pl-1 flex items-center gap-2">
      {label}
    </label>
    <div className="relative">
      <div className="absolute left-4 top-[1.25rem] text-orange-500/30 group-focus-within:text-orange-500 transition-colors pointer-events-none">
        {icon}
      </div>
      {children}
    </div>
  </div>
);

const StatusPill: React.FC<{ status: ProductStatus }> = ({ status }) => {
  const colors = {
    [ProductStatus.EXPIRED]: 'bg-red-500',
    [ProductStatus.CRITICAL]: 'bg-yellow-500',
    [ProductStatus.SAFE]: 'bg-green-500'
  };
  return <div className={`w-3 h-3 rounded-full ${colors[status]} shadow-[0_0_10px_currentColor] animate-pulse`} />;
};
