
import React, { useState, useEffect } from 'react';
import { Pill, Download } from 'lucide-react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });

    window.addEventListener('appinstalled', () => {
      setDeferredPrompt(null);
      setIsInstalled(true);
      console.log('PEX Instalado com sucesso!');
    });

    // Verificar se já está rodando como standalone
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-red-800 via-red-700 to-red-900 flex flex-col selection:bg-yellow-400 selection:text-red-900 ${isInstalled ? 'pwa-installed' : ''}`}>
      <header role="banner" className="bg-red-900/95 backdrop-blur-md border-b-4 border-orange-500 p-4 shadow-[0_4px_20px_rgba(0,0,0,0.4)] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-tr from-yellow-400 to-orange-500 p-2.5 rounded-xl border-2 border-orange-600 shadow-lg transform -rotate-3 hover:rotate-0 transition-transform duration-300" aria-hidden="true">
              <Pill className="text-red-900 w-8 h-8 drop-shadow-md" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-4xl md:text-5xl font-black text-yellow-300 tracking-tighter uppercase italic leading-none" 
                  style={{ 
                    textShadow: '2px 2px 0px #c2410c, 4px 4px 0px #9a3412, 6px 6px 0px #7c2d12',
                    filter: 'drop-shadow(0 10px 8px rgba(0,0,0,0.3))'
                  }}>
                PEX
              </h1>
              <p className="text-[10px] md:text-xs font-black text-orange-400 uppercase tracking-[0.2em] mt-2 drop-shadow-sm">
                Gestão de Validades Farmacêuticas
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {deferredPrompt && (
              <button 
                onClick={handleInstallClick}
                className="install-button group flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-red-900 px-4 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest border-b-4 border-orange-700 transition-all active:translate-y-1 active:border-b-0 shadow-lg"
              >
                <Download size={14} className="animate-bounce" />
                Instalar Aplicativo
              </button>
            )}
            
            <div className="hidden sm:flex flex-col items-end" aria-label="Status do Monitoramento">
              <span className="text-yellow-400 font-mono text-xs bg-red-950/80 px-4 py-1.5 rounded-lg border-2 border-orange-600/50 shadow-inner flex items-center gap-2">
                <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" aria-hidden="true"></span>
                {isInstalled ? 'DESKTOP APP ATIVO' : 'SISTEMA ONLINE'}
              </span>
              <span className="text-orange-500 text-[9px] font-bold mt-1 uppercase tracking-tighter" aria-hidden="true">v2.1 Stable Build</span>
            </div>
          </div>
        </div>
      </header>
      
      <main id="main-content" role="main" className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 space-y-8">
        {children}
      </main>

      <footer role="contentinfo" className="bg-red-950 border-t-4 border-orange-600 p-6 text-center">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-yellow-700 text-[10px] md:text-xs font-black tracking-widest uppercase">
            &copy; {new Date().getFullYear()} PEX - PRODUTOS PRÓXIMOS AO VENCIMENTO | USO PROFISSIONAL
          </p>
          <div className="flex gap-4" aria-hidden="true">
            <div className="w-2 h-2 rounded-full bg-red-600"></div>
            <div className="w-2 h-2 rounded-full bg-orange-600"></div>
            <div className="w-2 h-2 rounded-full bg-yellow-600"></div>
          </div>
        </div>
      </footer>
    </div>
  );
};
