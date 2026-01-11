
import React, { useState, useEffect, useRef } from 'react';
import { Pill, AlertTriangle, X, Monitor, Settings, Maximize2, ShieldCheck, Database } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  alertCount?: number;
  hasExpired?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ children, alertCount = 0, hasExpired = false }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((e) => {
        console.error(`Erro: ${e.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#450a0a] flex flex-col selection:bg-orange-500 selection:text-white">
      {/* Header Desktop Nativo */}
      <header className="sticky top-0 z-50 bg-red-950 border-b-2 border-orange-600/20 px-6 py-4 shadow-xl">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg shadow-lg">
              <Pill className="text-red-950" size={26} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-white font-extrabold text-2xl tracking-tight leading-none">
                PEX <span className="text-orange-500 font-normal text-lg">PRO</span>
              </h1>
              <p className="text-orange-400/60 text-[10px] uppercase font-bold tracking-widest mt-1">SISTEMA DE GESTÃO DE VALIDADE</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {alertCount > 0 && (
              <div className={`flex items-center gap-3 px-4 py-2 rounded-lg border ${hasExpired ? 'bg-red-600/20 border-red-500 text-red-100 animate-alert-intense' : 'bg-yellow-500/10 border-yellow-500 text-yellow-400'}`}>
                <AlertTriangle size={18} />
                <span className="text-xs font-black uppercase tracking-tight">{alertCount} ITENS CRÍTICOS</span>
              </div>
            )}
            
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2.5 bg-red-900/40 text-orange-400 rounded-lg border border-orange-500/20 hover:bg-red-800 transition-all"
            >
              <Settings size={22} />
            </button>
          </div>
        </div>
      </header>

      {/* Menu Lateral Estilo Desktop */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            ref={menuRef}
            className="absolute right-0 top-0 h-full w-80 bg-red-950 border-l border-orange-600/30 shadow-2xl p-8 animate-in slide-in-from-right duration-300"
          >
            <div className="flex justify-between items-center mb-10 pb-4 border-b border-white/5">
              <h2 className="text-white font-black uppercase tracking-widest text-xs">Ajustes do Sistema</h2>
              <button onClick={() => setIsMenuOpen(false)} className="text-orange-500 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <button 
                onClick={toggleFullscreen}
                className="w-full flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-orange-600/20 transition-all"
              >
                <div className="flex items-center gap-3">
                  <Maximize2 className="text-orange-500" size={18} />
                  <span className="text-white font-bold text-xs uppercase">Modo Tela Cheia</span>
                </div>
                <div className={`w-3 h-3 rounded-full ${isFullscreen ? 'bg-green-500' : 'bg-red-500'}`} />
              </button>

              <div className="p-4 bg-black/20 rounded-xl border border-white/5 space-y-2">
                <div className="flex items-center gap-2 text-yellow-500">
                  <ShieldCheck size={14} />
                  <span className="text-[9px] font-black uppercase">Segurança de Dados</span>
                </div>
                <p className="text-[10px] text-orange-100/40 uppercase">Armazenamento Local Ativo (Offline-First)</p>
              </div>
            </div>

            <div className="absolute bottom-8 left-8 right-8">
              <div className="flex items-center justify-center gap-2 text-orange-400/30">
                <Database size={12} />
                <span className="text-[8px] font-black uppercase tracking-widest">Build 2025.4.1</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-8 py-10">
        {children}
      </main>

      {/* Footer Padrão Desktop */}
      <footer className="bg-red-950 border-t border-orange-600/10 py-4 px-8">
        <div className="max-w-[1600px] mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4 text-orange-500/40">
            <Monitor size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest italic">Estação de Trabalho PEX Ativa</span>
          </div>
          <div className="flex items-center gap-2 text-green-500">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest">Sincronizado</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
