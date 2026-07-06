import { ShieldCheck, Usb } from "lucide-react";
import { InspectionSummary, DeviceData } from "../types/device";
import { getAppleModelName } from "../utils/deviceMappings";
import { IphoneWireframe } from "./IphoneWireframe";
interface SidebarProps {
  device: DeviceData | null;
  summary: InspectionSummary | null;
  clearDevice: () => void;
}

const parseDeviceColor = (colorCode: string, modelName: string) => {
  const code = colorCode ? colorCode.trim() : "";
  const model = modelName.toLowerCase();
  
  if (code.startsWith("#")) {
    return { name: "Cor Customizada", hex: code };
  }

  // Mapeamento baseado no DeviceColor do ideviceinfo
  // Geralmente: 1 = Space Gray/Black/Midnight, 2 = Silver/Starlight, 3 = Gold, 4 = Rose Gold/Pink, 5 = Blue
  switch (code) {
    case "1": 
      if (model.includes("pro")) return { name: "Preto Espacial / Titânio Preto", hex: "#2c2d30" };
      return { name: "Meia-noite / Preto", hex: "#1c2127" };
    case "2": 
      if (model.includes("pro")) return { name: "Prateado / Titânio Branco", hex: "#e3e4e5" };
      return { name: "Estelar / Branco", hex: "#faf6f0" };
    case "3": 
      if (model.includes("15 pro") || model.includes("16 pro")) return { name: "Titânio Natural", hex: "#a69f96" };
      return { name: "Dourado", hex: "#f4e0c8" };
    case "4": 
      return { name: "Rosa / Rose Gold", hex: "#fed0d4" };
    case "5": 
      if (model.includes("pro")) return { name: "Azul Sierra / Titânio Azul", hex: "#2f343d" };
      return { name: "Azul", hex: "#a7c1d8" };
    default: 
      return { name: "Cinza Clássico", hex: "#52525b" };
  }
};

export const Sidebar = ({ 
  device, summary, clearDevice 
}: SidebarProps) => {
  const modelName = device ? getAppleModelName(device.product_type) : "iPhone";
  const resolvedColor = parseDeviceColor(device?.device_color || "", modelName);

  return (
    <div className="w-[340px] flex-shrink-0 bg-surface border-r border-border-strong flex flex-col h-full overflow-y-auto">
      
      {/* App Header */}
      <div className="p-6 border-b border-border-md">
        <h1 className="text-sm font-black tracking-tight text-text-primary uppercase flex items-center gap-2 mb-4">
          <ShieldCheck className="w-5 h-5 text-indigo-400" />
          iReport Desktop
        </h1>
      </div>

      {/* Device Info & Verdict */}
      <div className="flex-1 p-6 flex flex-col">
        {!device ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50">
            <Usb className="w-16 h-16 text-text-muted mb-4 animate-pulse" />
            <p className="text-sm font-mono font-medium text-text-secondary uppercase">
              Conecte um iPhone<br/>via Cabo USB
            </p>
          </div>
        ) : (
          <>
            {/* Visualização do iPhone (Centralizado no Topo) */}
            <div className="flex justify-center mb-6 w-full">
              <IphoneWireframe />
            </div>

            {/* Informações Primárias (Modelo, Apelido, Serial e Cor) */}
            <div className="flex flex-col items-center text-center mb-6 w-full gap-1.5">
              <span className="text-xl font-sans font-black text-text-primary tracking-tight leading-tight">
                {getAppleModelName(device.product_type)}
              </span>
              <span className="text-xs font-sans text-text-secondary font-medium">
                {device.device_name}
              </span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-mono text-text-muted uppercase tracking-wide">
                  SN: {device.chassis_serial}
                </span>
                <span className="text-text-muted text-[10px]">•</span>
                <span className="text-[10px] font-sans text-text-muted">
                  {resolvedColor.name.split("/")[0].trim()}
                </span>
              </div>
            </div>

            {/* Gráfico de Armazenamento Simples */}
            <div className="w-full mb-6">
              <div className="flex justify-between items-center text-[10px] font-sans font-bold uppercase tracking-widest text-text-muted mb-2">
                <span>Armazenamento</span>
                <span className="text-text-primary font-mono font-black text-xs">
                  {device.storage_used ? device.storage_used.replace(" ", "") : "0GB"} / {device.storage_capacity ? device.storage_capacity.replace(" ", "") : "N/A"}
                </span>
              </div>
              <div className="w-full h-2 bg-[#1b1b1f] border border-border-subtle rounded-full overflow-hidden relative">
                {(() => {
                  const used = parseFloat(device.storage_used) || 0;
                  const total = parseFloat(device.storage_capacity) || 1;
                  const percent = Math.min(100, Math.round((used / total) * 100));
                  return (
                    <div 
                      className="absolute top-0 bottom-0 left-0 bg-indigo-400 rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  );
                })()}
              </div>
            </div>

            {summary && (
              <div className="mb-8">
                <p className="text-[10px] font-sans font-bold uppercase tracking-widest text-text-muted text-center mb-3">
                  Resumo da Inspeção
                </p>
                <div className="p-4 rounded-2xl border bg-base border-border-strong shadow-xl grid grid-cols-2 gap-4">
                  <div className="flex flex-col items-center text-center">
                    <span className="text-2xl font-mono font-black text-text-primary leading-none mb-1">
                      {summary.totalChecks}
                    </span>
                    <span className="text-[9px] font-mono font-bold uppercase text-text-muted">Itens Lidos</span>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <span className="text-2xl font-mono font-black text-status-green leading-none mb-1">
                      {summary.compliant}
                    </span>
                    <span className="text-[9px] font-mono font-bold uppercase text-text-muted">Conformes</span>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <span className="text-2xl font-mono font-black text-status-orange leading-none mb-1">
                      {summary.warnings}
                    </span>
                    <span className="text-[9px] font-mono font-bold uppercase text-text-muted">Atenção</span>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <span className={`text-2xl font-mono font-black leading-none mb-1 ${summary.critical > 0 ? 'text-status-red' : 'text-text-muted'}`}>
                      {summary.critical}
                    </span>
                    <span className="text-[9px] font-mono font-bold uppercase text-text-muted">Críticos</span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-6 border-t border-border-md bg-base/50 mt-auto">
        {device ? (
          <button
            onClick={clearDevice}
            className="w-full py-2.5 rounded-lg border border-border-strong text-text-secondary hover:text-text-primary text-[11px] font-mono font-bold uppercase transition-colors"
          >
            Desconectar Aparelho
          </button>
        ) : (
          <div className="flex items-center justify-center gap-2 opacity-50">
            <div className="w-2 h-2 rounded-full bg-status-orange animate-pulse" />
            <span className="text-[10px] font-mono font-bold text-text-muted uppercase">
              Aguardando Dispositivo
            </span>
          </div>
        )}
      </div>

    </div>
  );
}
