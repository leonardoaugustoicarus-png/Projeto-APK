
import React, { useState, useEffect, useRef } from 'react';
import { Pill, Download, CheckCircle2, AlertTriangle, HelpCircle, X, Monitor, Smartphone, Share, MoreVertical, Settings, Info } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  alertCount?: number;
  hasExpired?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ children, alertCount = 0, hasExpired = false }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showInstallHelp, setShowInstallHelp] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });

    window.addEventListener('appinstalled', () => {
      setDeferredPrompt(null);
      setIsInstalled(true);
    });

    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsInstalled(true);
    }

    // Fechar menu ao clicar fora
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      setShowInstallHelp(true);
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
    setIsMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-800 via-red-700 to-red-900 flex flex-col selection:bg-yellow-400 selection:text-red-900">
      <header role="banner" className="bg-red-900/95 backdrop-blur-md border-b-2 border-orange-500 p-2 md:p-3 shadow-[0_4px_20px_rgba(0,0,0,0.4)] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          
          {/* Logo e Título - Prioridade Máxima */}
          <div className="flex items-center gap-2 md:gap-4 shrink-0">
            <div className="bg-gradient-to-tr from-yellow-400 to-orange-500 p-1.5 md:p-2 rounded-lg border border-orange-600 shadow-lg transform -rotate-3">
              <Pill className="text-red-900 w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-2xl md:text-4xl font-black text-yellow-300 tracking-tighter uppercase italic leading-none" 
                  style={{ textShadow: '1px 1px 0px #c2410c, 2px 2px 0px #9a3412' }}>
                PEX
              </h1>
              <p className="text-[8px] font-black text-orange-400 uppercase tracking-widest hidden xs:block">
                Validades
              </p>
            </div>

            {/* Alertas - Próximos ao Título em Mobile */}
            {alertCount > 0 && (
              <div 
                className={`flex items-center gap-1.5 px-2 py-1 rounded-full border shadow-lg animate-in zoom-in-elastic transition-all ${
                  hasExpired 
                    ? 'bg-red-600 border-red-400 text-white' 
                    : 'bg-orange-500/20 border-orange-400 text-orange-100'
                }`}
              >
                <AlertTriangle 
                  size={14} 
                  className={hasExpired ? "animate-alert-intense" : "animate-pulse text-orange-400"} 
                />
                <span className="text-[10px] font-black">{alertCount}</span>
              </div>
            )}
          </div>

          {/* Menu de Ações Consolidadas */}
          <div className="flex items-center gap-2" ref={menuRef}>
            <div className="hidden sm:flex items-center gap-2 mr-2">
               <span className={`text-[9px] font-black px-2 py-0.5 rounded border ${
                isInstalled ? 'text-green-400 border-green-900/50 bg-black/20' : 'text-yellow-500 border-yellow-900/50 bg-black/20'
               }`}>
                 {isInstalled ? 'APP ATIVO' : 'MODO WEB'}
               </span>
            </div>

            <div className="relative">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`p-2 rounded-lg transition-all border-2 ${isMenuOpen ? 'bg-orange-500 border-orange-300 text-white' : 'bg-red-950 border-orange-900/50 text-orange-400 hover:text-yellow-300'}`}
                aria-label="Menu de configurações e instalação"
                aria-expanded={isMenuOpen}
              >
                <Settings size={20} className={isMenuOpen ? 'animate-spin-slow' : ''} />
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-red-900 border-2 border-orange-500 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] overflow-hidden animate-in slide-in-from-top-2 duration-200">
                  <div className="p-2 border-b border-orange-800/30 bg-black/20">
                    <p className="text-[9px] font-black text-orange-400 uppercase tracking-widest text-center">Configurações do Sistema</p>
                  </div>
                  
                  <div className="p-1">
                    {!isInstalled && (
                      <button 
                        onClick={handleInstallClick}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left text-yellow-300 hover:bg-orange-500/20 rounded-lg transition-colors group"
                      >
                        <Download size={16} className="text-yellow-500 group-hover:animate-bounce" />
                        <span className="text-xs font-bold uppercase">Instalar Aplicativo</span>
                      </button>
                    )}

                    <button 
                      onClick={() => { setShowInstallHelp(true); setIsMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left text-orange-100 hover:bg-orange-500/20 rounded-lg transition-colors"
                    >
                      <HelpCircle size={16} className="text-orange-400" />
                      <span className="text-xs font-bold uppercase">Como Instalar</span>
                    </button>

                    <div className="h-px bg-orange-800/30 my-1"></div>

                    <div className="px-4 py-3 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-orange-400 uppercase">Status</span>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${isInstalled ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-yellow-500'}`}></div>
                        <span className="text-[9px] font-black text-white uppercase">{isInstalled ? 'Instalado' : 'Web'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      
      <main id="main-content" role="main" className="flex-1 max-w-7xl mx-auto w-full p-3 md:p-6 lg:p-8 space-y-4 md:space-y-8">
        {children}
      </main>

      <footer role="contentinfo" className="bg-red-950 border-t-2 border-orange-600 p-4 text-center mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-2">
          <p className="text-yellow-700 text-[9px] font-black tracking-widest uppercase italic">
            &copy; {new Date().getFullYear()} PEX - SOFTWARE DE GESTÃO FARMACÊUTICA
          </p>
          <div className="flex gap-2" aria-hidden="true">
            <div className="w-1.5 h-1.5 rounded-full bg-red-600"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-orange-600"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-yellow-600"></div>
          </div>
        </div>
      </footer>

      {/* Modal de Ajuda de Instalação permanece igual, mas com Z-index maior */}
      {showInstallHelp && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-red-900 border-4 border-yellow-500 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300">
            <header className="p-4 bg-yellow-500 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Monitor className="text-red-900" size={20} />
                <h2 className="text-red-900 font-black uppercase text-sm tracking-tighter">Guia de Instalação PEX</h2>
              </div>
              <button onClick={() => setShowInstallHelp(false)} className="text-red-900 hover:scale-110 transition-transform"><X size={24} /></button>
            </header>
            
            <div className="p-8 space-y-8">
              <div className="space-y-4">
                <h3 className="flex items-center gap-2 text-yellow-400 font-black uppercase text-xs tracking-widest">
                  <Monitor size={16} /> Computador (Chrome/Edge)
                </h3>
                <ol className="text-orange-100 text-sm space-y-2 list-decimal list-inside">
                  <li>Abra o menu <span className="text-yellow-400 font-bold"><Settings className="inline" size={14} /> Configurações</span> no cabeçalho.</li>
                  <li>Clique em <span className="text-yellow-400 font-bold">"Instalar Aplicativo"</span>.</li>
                  <li>Confirme a instalação para criar o atalho na área de trabalho.</li>
                </ol>
              </div>

              <div className="h-px bg-white/10"></div>

              <div className="space-y-4">
                <h3 className="flex items-center gap-2 text-yellow-400 font-black uppercase text-xs tracking-widest">
                  <Smartphone size={16} /> iPhone / iPad (Safari)
                </h3>
                <ol className="text-orange-100 text-sm space-y-2 list-decimal list-inside">
                  <li>Toque no botão de <span className="text-yellow-400 font-bold">Compartilhar <Share className="inline" size={14} /></span> no Safari.</li>
                  <li>Role para baixo e toque em <span className="text-yellow-400 font-bold">"Adicionar à Tela de Início"</span>.</li>
                  <li>Toque em <span className="text-yellow-400 font-bold">Adicionar</span> no canto superior direito.</li>
                </ol>
              </div>

              <div className="bg-black/30 p-4 rounded-xl border border-white/5 text-center">
                <p className="text-[10px] text-orange-400/70 uppercase font-black leading-tight">
                  O PEX instalado funciona offline e abre instantaneamente.
                </p>
              </div>
            </div>
            
            <footer className="p-4 bg-black/40 text-center">
              <button 
                onClick={() => setShowInstallHelp(false)}
                className="bg-yellow-500 text-red-900 px-8 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-yellow-400 transition-colors shadow-lg"
              >
                Entendido
              </button>
            </footer>
          </div>
        </div>
      )}
      
      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        @media (max-width: 400px) {
          .xs\\:block { display: none; }
        }
      `}</style>
    </div>
  );
};
