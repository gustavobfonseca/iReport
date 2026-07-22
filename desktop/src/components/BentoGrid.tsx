import { DeviceUIModel } from "../types/device.types";
import { Database, ShieldCheck, Cpu } from "lucide-react";
import { BentoCard } from "./BentoCard";
import { Tooltip } from "./Tooltip";
import { TOOLTIPS_DICTIONARY } from "../constants/tooltipsDictionary";

interface BentoGridProps {
  device: DeviceUIModel;
}

export const BentoGrid = ({ device }: BentoGridProps) => {
  const healthPercentage = device.battery_health;
  const isBtyGood = device.battery_status.status === "conforme";
  const isBtyOk = device.battery_status.status === "atencao";
  const btyColor = isBtyGood
    ? "text-status-green"
    : isBtyOk
      ? "text-status-orange"
      : "text-status-red";
  const btyLabel = device.battery_status.label;

  const isSystemSecure = device.fusing.status === "conforme" && device.mdm.status === "conforme";
  const systemLabel = isSystemSecure ? "Conforme" : "Irregularidade";

  const isGenuine = device.parts_authenticity.status === "conforme";
  const partsLabel = isGenuine ? "Conforme" : "Alterado";

  return (
    <div className="grid grid-cols-3 gap-3 @xl:gap-6 p-4 @2xl:p-8 border-b border-border-strong bg-base flex-shrink-0">
      <BentoCard
        title={
          <div className="flex items-center gap-2">
            Condição da Bateria
            <Tooltip content={TOOLTIPS_DICTIONARY.kpis.bateria} />
          </div>
        }
        icon={<Database className="w-3.5 h-3.5" />}
        badge={
          <span
            className={`text-[10px] font-sans font-bold uppercase px-2 py-0.5 rounded border ${
              isBtyGood
                ? "border-border-green text-status-green bg-bg-green"
                : isBtyOk
                  ? "border-border-orange text-status-orange bg-bg-orange"
                  : "border-border-red text-status-red bg-bg-red"
            }`}
          >
            {btyLabel}
          </span>
        }
      >
        <div className="flex justify-between items-end">
          <div>
            <div className="text-[10px] font-sans uppercase tracking-widest text-text-muted mb-1">
              Saúde
            </div>
            <div className={`text-4xl font-mono font-black tracking-tighter ${btyColor}`}>
              {healthPercentage}%
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-sans uppercase tracking-widest text-text-muted mb-1">
              Ciclos Reais
            </div>
            <div className="text-xl font-mono font-bold text-text-primary">
              {device.battery_cycles}
            </div>
          </div>
        </div>
      </BentoCard>

      <BentoCard
        title={
          <div className="flex items-center gap-2">
            Integridade do Sistema
            <Tooltip content={TOOLTIPS_DICTIONARY.kpis.integridade} />
          </div>
        }
        icon={<ShieldCheck className="w-3.5 h-3.5" />}
        badge={
          <span
            className={`text-[10px] font-sans font-bold uppercase px-2 py-0.5 rounded border ${
              isSystemSecure
                ? "border-border-green text-status-green bg-bg-green"
                : "border-border-red text-status-red bg-bg-red"
            }`}
          >
            {systemLabel}
          </span>
        }
      >
        <div className="flex justify-between items-end h-full mt-2">
          <div className="w-full">
            <div className="text-[10px] font-sans uppercase tracking-widest text-text-muted mb-1">
              Core & MDM
            </div>
            <div
              className={`text-xl font-mono font-bold tracking-tight ${isSystemSecure ? "text-text-primary" : "text-status-red"}`}
            >
              {isSystemSecure ? "Fusing e MDM validados" : "Restrição de MDM ou Boot"}
            </div>
          </div>
        </div>
      </BentoCard>

      <BentoCard
        title={
          <div className="flex items-center gap-2">
            Autenticidade de Peças
            <Tooltip content={TOOLTIPS_DICTIONARY.kpis.autenticidade} />
          </div>
        }
        icon={<Cpu className="w-3.5 h-3.5" />}
        badge={
          <span
            className={`text-[10px] font-sans font-bold uppercase px-2 py-0.5 rounded border ${
              isGenuine
                ? "border-border-green text-status-green bg-bg-green"
                : "border-border-orange text-status-orange bg-bg-orange"
            }`}
          >
            {partsLabel}
          </span>
        }
      >
        <div className="flex justify-between items-end h-full mt-2">
          <div className="w-full">
            <div className="text-[10px] font-sans uppercase tracking-widest text-text-muted mb-1">
              Assinatura Criptográfica
            </div>
            <div
              className={`text-sm font-mono font-bold tracking-tight leading-tight ${!isGenuine ? "text-status-orange" : "text-text-primary"}`}
            >
              {device.parts_authenticity.label}
            </div>
          </div>
        </div>
      </BentoCard>
    </div>
  );
};
