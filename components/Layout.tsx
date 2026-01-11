
import React, { useState, useEffect, useRef } from 'react';
import { Pill, Download, CheckCircle2, AlertTriangle, HelpCircle, X, Monitor, Smartphone, Share, Settings, Maximize2 } from 'lucide-react';

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
  const [isFullscreen, setIsFullscreen] = useState(false);
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

    if (window.matchMedia('(display-mode: standalone)').matches || 
        window.matchMedia('(display-mode: fullscreen)').matches || 
        (window.navigator as any).standalone) {
      setIsInstalled(true);
    }

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

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((e) => {
        console.error(`Erro ao tentar ativar tela cheia: ${e.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-800 via-red-700 to-red-900 flex flex-col selection:bg-yellow-400 selection:text-red-900">
      {/* Header Fixo */}
      <header className="sticky top-0 z-50 bg-red-900/90 backdrop-blur-md border-b-2 border-orange-600/30 px-4 py-3 shadow-2xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-400 rounded-xl shadow-[0_0_15px_rgba(234,179,8,0.4)]">
              <Pill className="text-red-800" size={24} strokeWidth={3} />
            </div>
            <div>
              <h1 className="text-white font-black text-xl tracking-tighter leading-none flex items-center gap-2">
                PEX
                <span className="text-[10px] bg-red-600 px-2 py-0.5 rounded border border-red-400 font-black animate-pulse">PRO</span>
              </h1>
              <p className="text-orange-400 text-[9px] uppercase font-black tracking-[0.2em]">Controle de Validade</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {alertCount > 0 && (
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border-2 ${hasExpired ? 'bg-red-600 border-red-400 animate-alert-intense' : 'bg-yellow-500 border-yellow-200 text-red-900'} shadow-lg transition-all`}>
                <AlertTriangle size={14} strokeWidth={3} />
                <span className="text-xs font-black">{alertCount} ALERTAS</span>
              </div>
            )}
            
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2.5 bg-red-950 text-orange-500 rounded-xl border border-orange-500/30 hover:bg-red-800 transition-all active:scale-95"
              aria-label="Abrir configurações"
            >
              <Settings size={22} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </header>

      {/* Menu Lateral de Configurações */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            ref={menuRef}
            className="absolute right-0 top-0 h-full w-full max-w-xs bg-red-950 border-l-2 border-orange-600 shadow-[-20px_0_50px_rgba(0,0,0,0.5)] p-6 animate-in slide-in-from-right duration-300"
          >
            <div className="flex justify-between items-center mb-8 border-b border-orange-600/20 pb-4">
              <h2 className="text-white font-black uppercase tracking-widest text-sm flex items-center gap-2">
                <Settings size={18} className="text-orange-500" />
                Configurações
              </h2>
              <button onClick={() => setIsMenuOpen(false)} className="text-orange-500 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <button 
                onClick={toggleFullscreen}
                className="w-full flex items-center justify-between p-4 bg-red-900/50 rounded-xl border border-orange-600/30 hover:bg-orange-600/20 transition-all text-left"
              >
                <div className="flex items-center gap-3">
                  <Maximize2 className="text-yellow-400" size={20} />
                  <div>
                    <span className="text-white font-black text-xs uppercase block">Modo Tela Cheia</span>
                    <span className="text-orange-400 text-[9px] uppercase block">Ocultar barra de endereço</span>
                  </div>
                </div>
                <div className={`w-10 h-5 rounded-full relative transition-colors ${isFullscreen ? 'bg-green-600' : 'bg-red-950'}`}>
                  <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${isFullscreen ? 'left-6' : 'left-1'}`} />
                </div>
              </button>

              <button 
                onClick={handleInstallClick}
                className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                  isInstalled 
                    ? 'bg-green-900/20 border-green-600/30 text-green-400 grayscale' 
                    : 'bg-yellow-400 border-yellow-200 text-red-950 animate-pulse-gold'
                }`}
                disabled={isInstalled}
              >
                {isInstalled ? <CheckCircle2 size={24} /> : <Download size={24} strokeWidth={3} />}
                <div className="text-left">
                  <span className="font-black text-xs uppercase block">
                    {isInstalled ? 'Aplicativo Instalado' : 'Instalar no Dispositivo'}
                  </span>
                  {!isInstalled && <span className="text-[9px] font-bold uppercase opacity-70">Acesso rápido sem navegador</span>}
                </div>
              </button>
            </div>

            <div className="absolute bottom-8 left-6 right-6 p-4 bg-black/30 rounded-xl border border-white/5">
              <div className="flex items-center gap-2 mb-2">
                <HelpCircle size={14} className="text-orange-500" />
                <span className="text-orange-500 font-black text-[10px] uppercase tracking-widest">Sobre o PEX</span>
              </div>
              <p className="text-orange-200/50 text-[9px] leading-relaxed uppercase font-bold">
                Versão 2.4.0 <br />
                Desenvolvido para gestão de validades críticas em farmácias e depósitos.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Conteúdo Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 relative">
        {children}
      </main>

      {/* Rodapé Dinâmico */}
      <footer className="bg-red-950/80 border-t border-orange-600/30 py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-center sm:text-left">
            <p className="text-white font-black text-xs uppercase tracking-widest mb-1">PEX - Produtos Próximo ao Vencimento</p>
            <p className="text-orange-600 text-[10px] font-black uppercase tracking-widest">Eficiência farmacêutica em tempo real</p>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end">
              <span className="text-orange-400 text-[9px] font-black uppercase tracking-widest">Ambiente de Operação</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-white font-bold text-[10px] uppercase">{isInstalled ? 'Aplicação Nativa' : 'Navegador Web'}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Smartphone size={20} className={isInstalled ? 'text-yellow-400' : 'text-white/20'} />
              <Monitor size={20} className={!isInstalled ? 'text-yellow-400' : 'text-white/20'} />
            </div>
          </div>
        </div>
      </footer>

      {/* Modal de Ajuda para Instalação (Manual) */}
      {showInstallHelp && (
        <div className="fixed inset-0 z-[140] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-red-900 border-4 border-yellow-500 rounded-3xl p-8 max-w-sm w-full text-center shadow-[0_0_100px_rgba(234,179,8,0.3)] animate-in zoom-in-elastic duration-500">
            <div className="w-20 h-20 bg-yellow-400 rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-3 shadow-xl">
              <Smartphone size={40} className="text-red-900" strokeWidth={3} />
            </div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-4">Como Instalar</h2>
            <div className="space-y-4 text-left mb-8">
              <div className="flex gap-3 items-start">
                <div className="w-6 h-6 rounded-full bg-yellow-500 text-red-950 flex items-center justify-center font-black text-xs shrink-0">1</div>
                <p className="text-orange-100 text-xs font-bold leading-relaxed">Clique no ícone de <span className="text-yellow-400 font-black">Compartilhar</span> (ou menu de 3 pontos) do seu navegador.</p>
              </div>
              <div className="flex gap-3 items-start">
                <div className="w-6 h-6 rounded-full bg-yellow-500 text-red-950 flex items-center justify-center font-black text-xs shrink-0">2</div>
                <p className="text-orange-100 text-xs font-bold leading-relaxed">Selecione a opção <span className="text-yellow-400 font-black">"Adicionar à Tela de Início"</span>.</p>
              </div>
              <div className="flex gap-3 items-start">
                <div className="w-6 h-6 rounded-full bg-yellow-500 text-red-950 flex items-center justify-center font-black text-xs shrink-0">3</div>
                <p className="text-orange-100 text-xs font-bold leading-relaxed">O PEX aparecerá na sua lista de apps sem barra de URL!</p>
              </div>
            </div>
            <button 
              onClick={() => setShowInstallHelp(false)}
              className="w-full bg-yellow-400 hover:bg-yellow-300 text-red-950 font-black py-4 rounded-2xl transition-all shadow-xl uppercase tracking-widest text-xs"
            >
              Entendi, obrigado!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
