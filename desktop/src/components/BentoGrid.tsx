import { DeviceData } from "../types/device";
import { Database, Activity, History } from "lucide-react";
import { BentoCard } from "./BentoCard";

interface BentoGridProps {
  device: DeviceData;
  batteryVeredict: any;
}

const getEstimatedUsageTime = (cycles: number) => {
  if (cycles < 30) return "Novo / Vitrine";
  
  const totalDays = cycles * 1.1; // Adiciona margem assumindo que nem todo dia é 1 ciclo completo
  const years = Math.floor(totalDays / 365);
  const months = Math.floor((totalDays % 365) / 30);
  
  if (years === 0) return `${months} meses`;
  if (months === 0) return `${years} ano${years > 1 ? 's' : ''}`;
  return `${years}a e ${months}m`;
};

export const BentoGrid = ({ device, batteryVeredict }: BentoGridProps) => {
  const healthPercentage = device.battery_health;

  const isBtyGood = healthPercentage >= 85;
  const isBtyOk = healthPercentage >= 80 && healthPercentage < 85;
  const btyColor = isBtyGood ? "text-status-green" : isBtyOk ? "text-status-orange" : "text-status-red";

  return (
    <div className="grid grid-cols-3 gap-6 p-8 border-b border-border-strong bg-base flex-shrink-0">

      {/* Dados Frios da Bateria */}
      <BentoCard 
        title="Bateria" 
        icon={<Database className="w-3.5 h-3.5" />}
        badge={
          <span className={`text-[10px] font-sans font-bold uppercase px-2 py-0.5 rounded border ${
            isBtyGood ? 'border-border-green text-status-green bg-bg-green' : 
            isBtyOk ? 'border-border-orange text-status-orange bg-bg-orange' : 
            'border-border-red text-status-red bg-bg-red'
          }`}>
            {batteryVeredict.label}
          </span>
        }
      >
        <div className="flex justify-between items-end">
          <div>
            <div className="text-[10px] font-sans uppercase tracking-widest text-text-muted mb-1">Saúde</div>
            <div className={`text-4xl font-mono font-black tracking-tighter ${btyColor}`}>{healthPercentage}%</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-sans uppercase tracking-widest text-text-muted mb-1">Ciclos de Carga</div>
            <div className="text-xl font-mono font-bold text-text-primary">{device.battery_cycles}</div>
          </div>
        </div>
      </BentoCard>

      {/* Telemetria de Sensores (Tempo Real) */}
      <BentoCard 
        title="Saúde da Placa" 
        icon={<Activity className="w-3.5 h-3.5" />}
        badge={<div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />}
      >
        <div className="flex justify-between items-end">
          <div>
            <div className="text-[10px] font-sans uppercase tracking-widest text-text-muted mb-1">Temperatura</div>
            <div className="text-2xl font-mono font-bold text-text-primary">
              {device.bms_temperature_dc > 0 ? `${(device.bms_temperature_dc / 10).toFixed(1)}°C` : "--"}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-sans uppercase tracking-widest text-text-muted mb-1">Consumo (Carga)</div>
            <div className="text-2xl font-mono font-bold text-text-primary">
              {device.bms_instant_amperage !== 0 ? `${Math.abs(device.bms_instant_amperage)} mA` : "--"}
            </div>
          </div>
        </div>
      </BentoCard>

      {/* Histórico de Uso (Uptime e Uso Real com base nos ciclos) */}
      <BentoCard 
        title="Histórico de Uso" 
        icon={<History className="w-3.5 h-3.5" />}
        badge={
          <span className="text-[8px] font-sans uppercase tracking-widest px-2 py-0.5 rounded bg-[#1b1b1f] text-text-muted border border-border-strong">
            Cálculo Estimado
          </span>
        }
      >
        <div className="flex justify-between items-end">
          <div>
            <div className="text-[10px] font-sans uppercase tracking-widest text-text-muted mb-1">Tempo de Tela Estimado</div>
            <div className="text-2xl font-mono font-bold text-text-primary tracking-tight">
              ~{Math.round(device.battery_cycles * 6.5)}h <span className="text-xs font-sans font-medium text-text-muted">tela</span>
            </div>
            <div className="text-[9px] font-sans text-text-muted mt-1">Média de 6.5h por ciclo</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-sans uppercase tracking-widest text-text-muted mb-1">Idade Estimada do Aparelho</div>
            <div className="text-xl font-mono font-bold text-text-primary">
              {getEstimatedUsageTime(device.battery_cycles)}
            </div>
            <div className="text-[9px] font-sans text-text-muted mt-1">Projeção por Ciclos</div>
          </div>
        </div>
      </BentoCard>

    </div>
  );
};
