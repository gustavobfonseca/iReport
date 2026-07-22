import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { WaitingScreen } from "./WaitingScreen";
import { BentoGrid } from "./BentoGrid";
import { MainReportTab } from "./MainReportTab";
import { AdvancedLogTab } from "./AdvancedLogTab";

import { readUsbDevice } from "../services/deviceService";
import { adaptDeviceData } from "../adapters/deviceAdapter";
import { DeviceRawPayload, DeviceUIModel } from "../types/device.types";

export type MachineState = "WAITING_USB" | "EXTRACTING" | "REPORT_READY";

export type ScanFeedback = { tone: "info" | "error"; text: string };

export const InspectionPage = () => {
  const [machineState, setMachineState] = useState<MachineState>("WAITING_USB");
  const [device, setDevice] = useState<DeviceUIModel | null>(null);
  const [activeTab, setActiveTab] = useState<"main" | "advanced">("main");
  const [feedback, setFeedback] = useState<ScanFeedback | null>(null);

  const handleScan = async () => {
    setFeedback(null);
    setMachineState("EXTRACTING");
    try {
      const rawData = await readUsbDevice();
      if (rawData.connected) {
        const adapted = adaptDeviceData(rawData);
        setDevice(adapted);
        setMachineState("REPORT_READY");
      } else {
        // Estado esperado (nada plugado ainda), não um erro: tom neutro.
        setDevice(null);
        setMachineState("WAITING_USB");
        setFeedback({
          tone: "info",
          text: 'Nenhum iPhone conectado. Ligue o cabo USB, desbloqueie o aparelho e toque em "Confiar" — depois verifique de novo.',
        });
      }
    } catch (err: unknown) {
      console.error(err);
      setDevice(null);
      setMachineState("WAITING_USB");
      if (String(err).includes("scan_in_progress")) {
        setFeedback({ tone: "info", text: "Verificação já em andamento. Aguarde alguns segundos." });
      } else {
        setFeedback({
          tone: "error",
          text: "Falha ao comunicar com o dispositivo. Tente reconectar o cabo.",
        });
      }
    }
  };

  const handleSelectMock = (mockRaw: DeviceRawPayload) => {
    setMachineState("EXTRACTING");
    setTimeout(() => {
      const adapted = adaptDeviceData(mockRaw);
      setDevice(adapted);
      setMachineState("REPORT_READY");
    }, 800);
  };

  const handleDisconnect = () => {
    setDevice(null);
    setMachineState("WAITING_USB");
    setActiveTab("main");
    setFeedback(null);
  };

  return (
    <div className="flex flex-row h-full w-full overflow-hidden">
      {/* Esquerda: Painel Fixo (Sidebar) */}
      <Sidebar
        device={device}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onDisconnect={handleDisconnect}
      />

      {/* Direita: Área Principal — @container: o layout interno reflui pela
          largura REAL do conteúdo (descontando a Sidebar), não pela viewport */}
      <div className="@container flex-1 flex flex-col h-full bg-[#0a0a0c] overflow-hidden">
        {machineState === "WAITING_USB" && (
          <div className="relative h-full w-full">
            <WaitingScreen
              scanning={false}
              scanDevice={handleScan}
              onSelectMockDevice={handleSelectMock}
              feedback={feedback}
            />
          </div>
        )}

        {machineState === "EXTRACTING" && (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-base">
            <div className="relative w-12 h-12 mb-6">
              <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20" />
              <div className="absolute inset-0 rounded-full border-2 border-t-indigo-500 animate-spin" />
            </div>
            <h3 className="text-sm font-mono font-bold uppercase tracking-widest text-indigo-400 animate-pulse">
              Extraindo Telemetria
            </h3>
            <p className="text-xs text-text-secondary mt-2 max-w-xs font-sans">
              Lendo canais de hardware do barramento USB. Não desconecte o aparelho.
            </p>
          </div>
        )}

        {machineState === "REPORT_READY" && device && (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            <div className="flex-1 flex flex-col min-h-0">
              <BentoGrid device={device} />
              {activeTab === "main" ? (
                <MainReportTab device={device} />
              ) : (
                <AdvancedLogTab key={device.udid} device={device} />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
