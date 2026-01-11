
import React, { useState, useEffect, useRef } from 'react';
import { AlertCircle, Clock, CheckCircle2, Package } from 'lucide-react';
import { InventoryStats } from '../types';

interface DashboardProps {
  stats: InventoryStats;
}

export const Dashboard: React.FC<DashboardProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" role="region" aria-label="Resumo do Inventário">
      <StatCard 
        label="Total Monitorado" 
        value={stats.total} 
        icon={<Package size={32} aria-hidden="true" />} 
        colorClass="border-orange-500 from-red-800 to-red-900"
        accentColor="text-orange-500"
        delay="0ms"
      />
      <StatCard 
        label="Itens Vencidos" 
        value={stats.expired} 
        icon={<AlertCircle size={32} aria-hidden="true" />} 
        colorClass="border-red-500 from-red-900 to-black shadow-[0_0_15px_rgba(239,68,68,0.2)]"
        accentColor="text-red-500"
        valueColor="text-white"
        description="Atenção: Estes produtos devem ser removidos imediatamente."
        pulse={stats.expired > 0}
        delay="100ms"
      />
      <StatCard 
        label="Validade Crítica" 
        value={stats.critical} 
        icon={<Clock size={32} aria-hidden="true" />} 
        colorClass="border-yellow-400 from-yellow-700 to-yellow-900"
        accentColor="text-yellow-400"
        description="Produtos com menos de 35 dias para o vencimento."
        delay="200ms"
      />
      <StatCard 
        label="Validade Segura" 
        value={stats.safe} 
        icon={<CheckCircle2 size={32} aria-hidden="true" />} 
        colorClass="border-green-500 from-green-800 to-green-950"
        accentColor="text-green-400"
        description="Produtos com prazo de validade confortável."
        delay="300ms"
      />
    </div>
  );
};

const StatCard: React.FC<{
  label: string;
  value: number;
  icon: React.ReactNode;
  colorClass: string;
  accentColor: string;
  valueColor?: string;
  description?: string;
  pulse?: boolean;
  delay?: string;
}> = ({ label, value, icon, colorClass, accentColor, valueColor = "text-yellow-300", description, pulse, delay }) => {
  const [isBumping, setIsBumping] = useState(false);
  const prevValue = useRef(value);

  useEffect(() => {
    if (prevValue.current !== value) {
      setIsBumping(true);
      const timer = setTimeout(() => setIsBumping(false), 400);
      prevValue.current = value;
      return () => clearTimeout(timer);
    }
  }, [value]);

  return (
    <article 
      style={{ animationDelay: delay }}
      className={`bg-gradient-to-br ${colorClass} border-b-4 rounded-xl p-5 shadow-2xl transform transition-all hover:scale-[1.02] hover:-translate-y-1 duration-300 relative overflow-hidden group animate-in fade-in slide-in-from-bottom-4 fill-mode-both ${pulse ? 'animate-pulse' : ''}`}
      aria-label={`${label}: ${value}`}
    >
      {/* Gloss Sheen Effect on Hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none" aria-hidden="true"></div>
      
      <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-125 group-hover:rotate-12 transition-transform duration-700" aria-hidden="true">
        {icon}
      </div>
      
      <div className="flex justify-between items-start relative z-10">
        <div>
          <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em] mb-1" aria-hidden="true">{label}</p>
          <h3 className={`text-5xl font-black ${valueColor} drop-shadow-md transition-all duration-300 ${isBumping ? 'scale-110 text-white' : 'scale-100'}`}>
            <span className="sr-only">{label} de </span>
            {value}
          </h3>
          {description && <p className="sr-only">{description}</p>}
        </div>
        <div className={`${accentColor} p-2 bg-black/20 rounded-lg backdrop-blur-sm group-hover:scale-110 transition-transform duration-300`} aria-hidden="true">
          {icon}
        </div>
      </div>
    </article>
  );
};
