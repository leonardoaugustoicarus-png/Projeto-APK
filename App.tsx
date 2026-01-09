
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Layout } from './components/Layout';
import { InventoryTable } from './components/InventoryTable';
import { ProductForm } from './components/ProductForm';
import { Dashboard } from './components/Dashboard';
import { Product, ProductStatus } from './types';
import { calculateDaysToExpiry, getStatusFromDays } from './utils/dateUtils';
import { generatePDF } from './services/pdfService';
import { Search, Plus, FileText, Calendar, Filter, ChevronDown, ChevronUp, FilterX, Sparkles, Keyboard, Trash2 } from 'lucide-react';

const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('pex_inventory');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProductStatus | ''>('');
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);
  
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);

  // Persistence
  useEffect(() => {
    localStorage.setItem('pex_inventory', JSON.stringify(products));
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           p.barcode.includes(searchTerm);
      
      const matchesStartDate = !startDate || p.expiryDate >= startDate;
      const matchesEndDate = !endDate || p.expiryDate <= endDate;
      const matchesStatus = !statusFilter || p.status === statusFilter;

      return matchesSearch && matchesStartDate && matchesEndDate && matchesStatus;
    }).sort((a, b) => a.daysToExpiry - b.daysToExpiry);
  }, [products, searchTerm, startDate, endDate, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: products.length,
      expired: products.filter(p => p.status === ProductStatus.EXPIRED).length,
      critical: products.filter(p => p.status === ProductStatus.CRITICAL).length,
      safe: products.filter(p => p.status === ProductStatus.SAFE).length,
    };
  }, [products]);

  const handleExportPDF = useCallback(() => {
    generatePDF(filteredProducts);
  }, [filteredProducts]);

  const handleAddOrUpdateProduct = (data: Partial<Product>) => {
    const expiry = data.expiryDate || '';
    const days = calculateDaysToExpiry(expiry);
    const status = getStatusFromDays(days);

    if (editingProduct) {
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? { 
        ...p, 
        ...data, 
        daysToExpiry: days, 
        status 
      } as Product : p));
    } else {
      const newProduct: Product = {
        id: Math.random().toString(36).substr(2, 9),
        barcode: data.barcode || '',
        name: data.name || '',
        quantity: Number(data.quantity) || 0,
        expiryDate: expiry,
        observations: data.observations || '',
        daysToExpiry: days,
        status: status
      };
      setProducts(prev => [...prev, newProduct]);
    }
    setShowForm(false);
    setEditingProduct(undefined);
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm('Deseja realmente excluir este produto?')) {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleDeleteFiltered = useCallback(() => {
    if (filteredProducts.length === 0) return;
    const count = filteredProducts.length;
    if (confirm(`CUIDADO: Deseja excluir PERMANENTEMENTE os ${count} produtos exibidos no filtro atual? Esta ação não pode ser desfeita.`)) {
      const idsToDelete = new Set(filteredProducts.map(p => p.id));
      setProducts(prev => prev.filter(p => !idsToDelete.has(p.id)));
    }
  }, [filteredProducts]);

  const handleSellProduct = (id: string) => {
    if (confirm('Confirmar venda deste item? Ele será removido do controle de validade.')) {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
    setStatusFilter('');
  };

  // Keyboard Shortcuts Implementation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isTyping = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        handleExportPDF();
        return;
      }

      if (e.key === 'Escape' && showForm) {
        setShowForm(false);
        setEditingProduct(undefined);
        return;
      }

      if (!isTyping) {
        if (e.key.toLowerCase() === 'n') {
          e.preventDefault();
          setEditingProduct(undefined);
          setShowForm(true);
        } else if (e.key.toLowerCase() === 'f') {
          e.preventDefault();
          setIsFiltersExpanded(prev => !prev);
        } else if (e.key.toLowerCase() === 'l') {
            e.preventDefault();
            clearFilters();
        } else if (e.key.toLowerCase() === 'd') {
            e.preventDefault();
            handleDeleteFiltered();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showForm, handleExportPDF, handleDeleteFiltered]);

  const activeFiltersCount = [startDate, endDate, statusFilter].filter(Boolean).length;

  return (
    <Layout>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <Dashboard stats={stats} />

        <section 
          aria-labelledby="search-section-title"
          className="bg-red-900/60 border-2 border-orange-500/50 rounded-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.6)] overflow-hidden backdrop-blur-sm"
        >
          <h2 id="search-section-title" className="sr-only">Ferramentas de Pesquisa e Ações Globais</h2>
          
          <div className="p-5 flex flex-col lg:flex-row items-center gap-6 border-b border-orange-600/20">
            <div className="relative flex-1 w-full group">
              <Search aria-hidden="true" className="absolute left-4 top-1/2 -translate-y-1/2 text-yellow-600 w-5 h-5 group-focus-within:text-yellow-400 transition-colors" />
              <input 
                type="text"
                placeholder="Pesquisar por nome ou código do item..."
                aria-label="Pesquisar produtos por nome ou código"
                className="w-full bg-red-950/80 border-2 border-orange-800/50 rounded-xl py-3.5 pl-12 pr-4 text-yellow-300 placeholder-orange-900/60 focus:outline-none focus:ring-4 focus:ring-yellow-500/10 focus:border-yellow-500 transition-all font-bold"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-3 w-full lg:w-auto">
              <button 
                onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
                aria-expanded={isFiltersExpanded}
                aria-controls="advanced-filters-panel"
                className={`group relative flex items-center gap-2 px-5 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all border-2 ${
                  isFiltersExpanded || activeFiltersCount > 0
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white border-orange-400 shadow-lg shadow-orange-900/40'
                    : 'bg-red-950/80 text-yellow-600 border-orange-800 hover:bg-red-900'
                }`}
                title="Abrir Filtros Avançados (Atalho: F)"
              >
                <Filter size={16} aria-hidden="true" />
                <span className="hidden sm:inline">Filtros</span>
                {activeFiltersCount > 0 && (
                  <span className="bg-yellow-400 text-red-900 rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-black animate-bounce shadow-md">
                    <span className="sr-only">{activeFiltersCount} filtros aplicados</span>
                    {activeFiltersCount}
                  </span>
                )}
                {isFiltersExpanded ? <ChevronUp size={16} aria-hidden="true" /> : <ChevronDown size={16} aria-hidden="true" />}
                <kbd className="hidden lg:block absolute -bottom-2 right-2 bg-black/60 text-[8px] px-1 rounded border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true">F</kbd>
              </button>

              <div className="h-12 w-px bg-orange-800/30 mx-1 hidden lg:block" aria-hidden="true"></div>

              <button 
                onClick={() => { setEditingProduct(undefined); setShowForm(true); }}
                className="group relative flex-1 sm:flex-none flex items-center justify-center gap-2 bg-gradient-to-b from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 text-red-950 font-black py-3.5 px-6 rounded-xl transition-all border-b-4 border-orange-700 shadow-xl active:translate-y-1 active:border-b-0"
                title="Cadastrar Novo Produto (Atalho: N)"
                aria-label="Adicionar novo produto"
              >
                <Plus size={18} strokeWidth={3} aria-hidden="true" />
                <span className="uppercase text-[10px] tracking-tighter">Adicionar</span>
                <kbd className="hidden lg:block absolute -bottom-2 right-2 bg-black/60 text-red-100 text-[8px] px-1 rounded border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true">N</kbd>
              </button>

              <button 
                onClick={handleDeleteFiltered}
                disabled={filteredProducts.length === 0}
                className={`group relative flex-1 sm:flex-none flex items-center justify-center gap-2 bg-gradient-to-b from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white font-black py-3.5 px-6 rounded-xl transition-all border-b-4 border-red-900 shadow-xl active:translate-y-1 active:border-b-0 ${filteredProducts.length === 0 ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
                title="Excluir todos os itens da lista filtrada (Atalho: D)"
                aria-label={`Excluir os ${filteredProducts.length} itens atualmente exibidos`}
              >
                <Trash2 size={18} strokeWidth={2.5} aria-hidden="true" />
                <span className="uppercase text-[10px] tracking-tighter">Deletar</span>
                <kbd className="hidden lg:block absolute -bottom-2 right-2 bg-black/60 text-white text-[8px] px-1 rounded border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true">D</kbd>
              </button>
              
              <button 
                onClick={handleExportPDF}
                className="group relative flex-1 sm:flex-none flex items-center justify-center gap-2 bg-red-800 hover:bg-red-700 text-white font-black py-3.5 px-6 rounded-xl transition-all border-b-4 border-black/30 shadow-xl active:translate-y-1 active:border-b-0"
                title="Gerar Relatório PDF (Atalho: Ctrl+P)"
                aria-label="Exportar para PDF"
              >
                <FileText size={18} aria-hidden="true" />
                <span className="uppercase text-[10px] tracking-tighter">Relatório</span>
                <kbd className="hidden lg:block absolute -bottom-2 right-2 bg-black/60 text-[8px] px-1 rounded border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap" aria-hidden="true">CTRL+P</kbd>
              </button>
            </div>
          </div>

          {isFiltersExpanded && (
            <div 
              id="advanced-filters-panel"
              className="bg-black/20 p-8 border-b border-orange-800/10 animate-in slide-in-from-top-4 duration-500"
              role="region"
              aria-label="Filtros avançados"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <FilterField label="Data de Início" icon={<Calendar size={14} aria-hidden="true" />} id="start-date-filter">
                  <input 
                    id="start-date-filter"
                    type="date"
                    className="w-full bg-red-950 border-2 border-orange-900/50 rounded-lg py-2.5 px-4 text-yellow-300 focus:outline-none focus:border-yellow-500 font-bold"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </FilterField>

                <FilterField label="Data de Término" icon={<Calendar size={14} aria-hidden="true" />} id="end-date-filter">
                  <input 
                    id="end-date-filter"
                    type="date"
                    className="w-full bg-red-950 border-2 border-orange-900/50 rounded-lg py-2.5 px-4 text-yellow-300 focus:outline-none focus:border-yellow-500 font-bold"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </FilterField>

                <FilterField label="Situação / Status" icon={<Sparkles size={14} aria-hidden="true" />} id="status-filter">
                  <div className="relative">
                    <select
                      id="status-filter"
                      className="w-full bg-red-950 border-2 border-orange-900/50 rounded-lg py-2.5 px-4 text-yellow-300 focus:outline-none focus:border-yellow-500 appearance-none font-black cursor-pointer uppercase text-xs"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as ProductStatus | '')}
                    >
                      <option value="" className="bg-red-900">Todos os Status</option>
                      <option value={ProductStatus.EXPIRED} className="bg-red-950">{ProductStatus.EXPIRED}</option>
                      <option value={ProductStatus.CRITICAL} className="bg-red-950">{ProductStatus.CRITICAL}</option>
                      <option value={ProductStatus.SAFE} className="bg-red-950">{ProductStatus.SAFE}</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-orange-600 pointer-events-none" size={16} aria-hidden="true" />
                  </div>
                </FilterField>
              </div>

              <div className="flex justify-between items-center mt-8 pt-4 border-t border-white/5">
                <p className="text-orange-900/60 text-[10px] font-black uppercase tracking-widest italic flex items-center gap-2">
                  <Keyboard size={12} aria-hidden="true" />
                  Atalhos: L (limpar) | D (deletar lista)
                </p>
                <button 
                  onClick={clearFilters}
                  className="flex items-center gap-2 text-yellow-700 hover:text-yellow-400 font-black text-[10px] uppercase tracking-widest transition-all group"
                  aria-label="Remover todos os filtros"
                >
                  <FilterX size={14} className="group-hover:rotate-12 transition-transform" aria-hidden="true" />
                  Limpar Filtros
                </button>
              </div>
            </div>
          )}
        </section>

        <section aria-labelledby="inventory-title" className="space-y-4">
          <div className="flex justify-between items-end px-2">
            <h2 id="inventory-title" className="text-yellow-400/80 font-black uppercase text-xs tracking-[0.3em] flex items-center gap-3">
              <span className="w-1.5 h-6 bg-gradient-to-b from-orange-400 to-orange-600 rounded-full shadow-[0_0_8px_rgba(249,115,22,0.4)]" aria-hidden="true"></span>
              {filteredProducts.length} Item(ns) Encontrado(s)
            </h2>
          </div>
          <InventoryTable 
            products={filteredProducts} 
            onDelete={handleDeleteProduct}
            onSell={handleSellProduct}
            onEdit={handleEdit}
          />
        </section>
      </div>

      {showForm && (
        <ProductForm 
          onClose={() => { setShowForm(false); setEditingProduct(undefined); }}
          onSubmit={handleAddOrUpdateProduct}
          initialData={editingProduct}
        />
      )}
    </Layout>
  );
};

const FilterField: React.FC<{ label: string; icon: React.ReactNode; children: React.ReactNode; id: string }> = ({ label, icon, children, id }) => (
  <div className="space-y-2.5">
    <label htmlFor={id} className="text-orange-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
      <span className="p-1 bg-orange-950/50 rounded border border-orange-800/30" aria-hidden="true">{icon}</span>
      {label}
    </label>
    {children}
  </div>
);

export default App;
