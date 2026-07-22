import { ShieldCheck, Usb, HardDrive, FileText, ActivitySquare, LogOut } from "lucide-react";
import { DeviceUIModel } from "../types/device.types";
import { getAppleModelName } from "../utils/deviceMappings";
import { IphoneWireframe } from "./IphoneWireframe";

interface SidebarProps {
  device: DeviceUIModel | null;
  activeTab: "main" | "advanced";
  setActiveTab: (tab: "main" | "advanced") => void;
  onDisconnect: () => void;
}

export const Sidebar = ({ device, activeTab, setActiveTab, onDisconnect }: SidebarProps) => {
  return (
    <div className="w-[280px] xl:w-[340px] flex-shrink-0 bg-surface border-r border-border-strong flex flex-col h-full overflow-y-auto">
      {/* App Header */}
      <div className="p-6 border-b border-border-md">
        <h1 className="text-sm font-black tracking-tight text-text-primary uppercase flex items-center gap-2 mb-4">
          <ShieldCheck className="w-5 h-5 text-indigo-400" />
          iReport Scanner
        </h1>
      </div>

      {/* Device Info */}
      <div className="flex-1 p-6 flex flex-col">
        {!device ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-2">
            <div className="w-14 h-14 rounded-2xl bg-base border border-border-strong flex items-center justify-center mb-5">
              <Usb className="w-6 h-6 text-text-muted" />
            </div>
            <p className="text-xs font-sans text-text-secondary leading-relaxed max-w-[190px]">
              Conecte um iPhone via cabo USB para iniciar a vistoria.
            </p>
          </div>
        ) : (
          <>
            {/* Visualização do iPhone (Centralizado no Topo) */}
            <div className="flex justify-center mb-6 w-full">
              <IphoneWireframe />
            </div>

            {/* Informações Primárias (Modelo e Apelido) */}
            <div className="flex flex-col items-center text-center mb-8 w-full gap-1.5">
              <span className="text-xl font-sans font-black text-text-primary tracking-tight leading-tight">
                {getAppleModelName(device.product_type)}
              </span>
              <span className="text-xs font-sans text-text-secondary font-medium">
                {device.device_name}
              </span>

              {/* Storage Progress Bar */}
              {(() => {
                const total = parseInt(device.storage_capacity) || 0;
                const used = parseInt(device.storage_used) || 0;
                const pct = total > 0 ? (used / total) * 100 : 0;

                return (
                  <div className="w-full mt-4 px-4 py-3 bg-[#111114] border border-border-subtle rounded-xl flex flex-col gap-2 font-mono text-[10px]">
                    <div className="flex items-center justify-between text-text-secondary font-sans font-bold uppercase tracking-wider">
                      <span className="flex items-center gap-1">
                        <HardDrive className="w-3.5 h-3.5 text-indigo-400" />
                        Armazenamento
                      </span>
                      <span className="text-text-primary">{device.storage_capacity}</span>
                    </div>

                    {/* Barra de progresso */}
                    <div className="w-full h-2 bg-[#222227] rounded-full overflow-hidden relative">
                      <div
                        className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-text-muted text-[9px] mt-0.5">
                      <span>
                        Utilizado: {device.storage_used} ({pct.toFixed(0)}%)
                      </span>
                      <span>Livre: {device.storage_free}</span>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Navegação de Abas */}
            <div className="flex flex-col gap-2 w-full mt-auto mb-4">
              <button
                onClick={() => setActiveTab("main")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all border ${
                  activeTab === "main"
                    ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-400"
                    : "bg-transparent border-transparent text-text-secondary hover:bg-surface-strong hover:text-text-primary"
                }`}
              >
                <FileText className="w-4 h-4" />
                <span className="text-xs font-mono font-bold tracking-wider uppercase">
                  Laudo Principal
                </span>
              </button>

              <button
                onClick={() => setActiveTab("advanced")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all border ${
                  activeTab === "advanced"
                    ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-400"
                    : "bg-transparent border-transparent text-text-secondary hover:bg-surface-strong hover:text-text-primary"
                }`}
              >
                <ActivitySquare className="w-4 h-4" />
                <span className="text-xs font-mono font-bold tracking-wider uppercase">
                  Modo Avançado
                </span>
              </button>
            </div>
          </>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-6 border-t border-border-md bg-base/50 mt-auto">
        {device ? (
          <div className="flex flex-col gap-2">
            <button
              onClick={onDisconnect}
              className="w-full flex items-center justify-center gap-2 py-3 bg-transparent hover:bg-surface-strong border border-border-md rounded-xl text-text-secondary hover:text-white transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
                Sair do Aparelho
              </span>
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 opacity-50">
            <div className="w-2 h-2 rounded-full bg-status-orange animate-pulse" />
            <span
              id="sidebar-status-waiting"
              className="text-[10px] font-mono font-bold text-text-muted uppercase"
            >
              Aguardando Dispositivo
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
