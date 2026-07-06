import { useDeviceScanner } from "./hooks/useDeviceScanner";
import { getInspectionSummary, getBatteryVeredict, buildRows } from "./utils/evaluation";
import { AlertTriangle } from "lucide-react";
import { Sidebar } from "./components/Sidebar";
import { WaitingScreen } from "./components/WaitingScreen";
import { BentoGrid } from "./components/BentoGrid";
import { DiagnosticTable } from "./components/DiagnosticTable";

import "./App.css";

export default function App() {
  const { device, scanning, panicLogs, scanDevice, clearDevice } = useDeviceScanner();

  const rows = buildRows(device, panicLogs);
  const summary = device ? getInspectionSummary(rows) : null;
  const batteryVeredict = getBatteryVeredict(device);

  return (
    <main className="h-screen w-screen flex flex-row overflow-hidden bg-base text-text-primary font-['Inter',sans-serif]">
      
      {/* Esquerda: Painel Fixo (Sidebar) */}
      <Sidebar 
        device={device}
        summary={summary}
        clearDevice={clearDevice}
      />

      {/* Direita: Área Principal */}
      <div className="flex-1 flex flex-col h-full bg-[#0a0a0c] overflow-hidden">
        {!device ? (
          <WaitingScreen scanning={scanning} scanDevice={scanDevice} />
        ) : (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            
            {/* Alertas Críticos de Segurança (Find My / MDM que impedem a compra) */}
            {summary && (device.icloud_locked !== "CLEAN" || device.brick_state) && (
              <div className="bg-[#b91c1c] border-b border-red-800 p-4 shrink-0 flex items-start gap-4 shadow-lg shadow-red-950/20">
                <AlertTriangle className="w-6 h-6 text-white shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-black text-white uppercase tracking-wide mb-3 flex items-center gap-2">
                    ALERTA_SIS: Bloqueio de Ativação / Vínculo de Segurança Ativo
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {device.icloud_locked !== "CLEAN" && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black/25 border border-white/10 rounded-lg text-xs font-mono font-bold text-white">
                        <span className="opacity-70 text-red-300">iCloud / Find My:</span> Bloqueado (Ativo)
                      </span>
                    )}
                    {device.brick_state && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black/25 border border-white/10 rounded-lg text-xs font-mono font-bold text-white">
                        <span className="opacity-70 text-red-300">MDM Corporativo:</span> Supervisionado (Ativo)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto">
              <BentoGrid 
                device={device} 
                batteryVeredict={batteryVeredict} 
              />
              <DiagnosticTable 
                rows={rows} 
              />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
