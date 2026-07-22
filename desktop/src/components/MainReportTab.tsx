import { DeviceUIModel } from "../types/device.types";
import { InspectionRow } from "./InspectionRow";

interface MainReportTabProps {
  device: DeviceUIModel;
}

export const MainReportTab = ({ device }: MainReportTabProps) => {
  const renderHeaderRow = () => (
    <div className="flex items-center justify-between px-4 py-2 bg-[#121215]/80 border-b border-border-strong text-[10px] font-mono font-black uppercase tracking-wider text-text-muted">
      <div className="w-1/3">ITEM INSPECIONADO</div>
      <div className="flex-1">LEITURA DO SISTEMA</div>
      <div className="w-32 text-right">RESULTADO DA INSPEÇÃO</div>
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto bg-base p-6 md:p-8">
      {/* GRUPO A */}
      <div className="w-full bg-surface border border-border-strong rounded-2xl overflow-hidden shadow-lg mb-8">
        <div className="bg-[#121215]/60 px-6 py-4 border-b border-border-strong flex items-center justify-between">
          <span className="text-xs font-sans font-bold uppercase tracking-widest text-text-muted">
            Riscos Críticos (Dealbreakers)
          </span>
        </div>

        {renderHeaderRow()}

        <div className="flex flex-col">
          <InspectionRow
            title="Status MDM (Gerenciamento)"
            value={device.mdm.label}
            status={device.mdm.status}
            tooltipKey="dealbreakers.mdm"
            isDealbreaker
          />
          <InspectionRow
            title="Status iCloud / Find My"
            value={device.icloud.label}
            status={device.icloud.status}
            tooltipKey="dealbreakers.icloud"
            isDealbreaker
          />
          <InspectionRow
            title="Fusing Status (Segurança Boot)"
            value={device.fusing.label}
            status={device.fusing.status}
            tooltipKey="dealbreakers.fusing"
            isDealbreaker
          />
          <InspectionRow
            title="Baseband (Modem Cellular)"
            value={device.baseband.label}
            status={device.baseband.status}
            tooltipKey="dealbreakers.baseband"
            isDealbreaker
          />
          <InspectionRow
            title="Inconsistência de Memória"
            value={device.memory_crosscheck.label}
            status={device.memory_crosscheck.status}
            tooltipKey="dealbreakers.memoria"
            isDealbreaker
          />
        </div>
      </div>

      {/* GRUPO B */}
      <div className="w-full bg-surface border border-border-strong rounded-2xl overflow-hidden shadow-lg">
        <div className="bg-[#121215]/60 px-6 py-4 border-b border-border-strong flex items-center justify-between">
          <span className="text-xs font-sans font-bold uppercase tracking-widest text-text-muted">
            Validação de Hardware
          </span>
        </div>

        {renderHeaderRow()}

        <div className="flex flex-col">
          <InspectionRow
            title="Integridade de Peças (Apple)"
            value={device.parts_authenticity.label}
            status={device.parts_authenticity.status}
            tooltipKey="precificacao.pecas"
          />
          <InspectionRow
            title="Configuração SIM"
            value={device.sim_configuration.label}
            status={device.sim_configuration.status}
            tooltipKey="precificacao.sim"
          />
          <InspectionRow
            title="Bloqueio de Operadora (SIM Lock)"
            value={device.carrier_lock.label}
            status={device.carrier_lock.status}
            tooltipKey="precificacao.operadora"
          />
          <InspectionRow
            title="Status Biometria"
            value={device.biometric.label}
            status={device.biometric.status}
            tooltipKey="precificacao.biometria"
          />
          <InspectionRow
            title="Status True Tone / ALS"
            value={device.truetone.label}
            status={device.truetone.status}
            tooltipKey="precificacao.truetone"
          />
        </div>
      </div>
    </div>
  );
};
