
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
        label="Total Ativos" 
        value={stats.total} 
        icon={<Package size={28} />} 
        colorClass="border-orange-500/50 from-red-900/40 to-red-950/60"
        accentColor="text-orange-500"
        delay="0ms"
      />
      <StatCard 
        label="Vencidos" 
        value={stats.expired} 
        icon={<AlertCircle size={28} />} 
        colorClass="border-red-500/50 from-red-600/20 to-black/80 shadow-[0_10px_30px_rgba(239,68,68,0.15)]"
        accentColor="text-red-500"
        valueColor="text-white"
        pulse={stats.expired > 0}
        delay="100ms"
      />
      <StatCard 
        label="Críticos" 
        value={stats.critical} 
        icon={<Clock size={28} />} 
        colorClass="border-yellow-400/50 from-yellow-700/20 to-black/80"
        accentColor="text-yellow-400"
        delay="200ms"
      />
      <StatCard 
        label="Seguros" 
        value={stats.safe} 
        icon={<CheckCircle2 size={28} />} 
        colorClass="border-green-500/50 from-green-800/20 to-black/80"
        accentColor="text-green-400"
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
  pulse?: boolean;
  delay?: string;
}> = ({ label, value, icon, colorClass, accentColor, valueColor = "text-yellow-300", pulse, delay }) => {
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
      className={`bg-gradient-to-br ${colorClass} backdrop-blur-md border border-white/5 border-b-4 rounded-2xl p-6 shadow-2xl transition-all hover:scale-[1.03] duration-500 relative overflow-hidden group animate-in fade-in slide-in-from-bottom-4 fill-mode-both ${pulse ? 'animate-pulse' : ''}`}
    >
      <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
      
      <div className="flex flex-col gap-1 relative z-10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/40 text-[9px] font-black uppercase tracking-[0.25em]">{label}</span>
          <div className={`${accentColor} p-2 bg-black/40 rounded-xl border border-white/5 transition-transform duration-500 group-hover:rotate-12`}>
            {icon}
          </div>
        </div>
        <h3 className={`text-4xl font-black ${valueColor} drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] transition-all duration-300 ${isBumping ? 'scale-110 text-white' : 'scale-100'}`}>
          {value}
        </h3>
      </div>
    </article>
  );
};
