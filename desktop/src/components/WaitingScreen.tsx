import { Smartphone, RefreshCw, AlertCircle, Info } from "lucide-react";
import { DeviceRawPayload } from "../types/device.types";

interface WaitingScreenProps {
  scanning: boolean;
  scanDevice: () => void;
  onSelectMockDevice: (device: DeviceRawPayload) => void;
  feedback?: { tone: "info" | "error"; text: string } | null;
}

const CONNECTION_STEPS = [
  "Conecte o iPhone com um cabo de dados USB",
  "Desbloqueie a tela do aparelho",
  'Toque em "Confiar" no popup e digite o código',
];

const MOCK_DEVICES = {
  perfect: {
    connected: true,
    device_name: "iPhone de Gustavo",
    product_type: "iPhone14,5",
    chassis_serial: "CP722CMFWX",
    udid: "00008110-0000000000000000",
    storage_capacity: "128 GB",
    storage_used: "42 GB",
    storage_free: "86 GB",
    brick_state: false,
    icloud_locked: "Desvinculado",
    icloud_account_masked: "N/A",
    fusing_status: "3",
    baseband_status: "Operacional",
    unknown_components: "Genuíno",
    battery_health: 94,
    battery_cycles: 120,
    model_number: "MXXXXLL/A",
    activation_state: "Activated",
    biometric_status: "FaceID_Operacional",
    als_status: "OPERACIONAL",
    bms_voltage_mv: 4120,
    bms_temperature_c: 31.2,
    bms_instant_amperage: -450,
  },
  compromised: {
    connected: true,
    device_name: "iPhone de Testes",
    product_type: "iPhone12,1",
    chassis_serial: "G2NXM48FLX",
    udid: "00008030-0000000000000000",
    storage_capacity: "64 GB",
    storage_used: "61 GB",
    storage_free: "3 GB",
    brick_state: true,
    icloud_locked: "Bloqueado",
    icloud_account_masked: "b*****@gmail.com",
    fusing_status: "Violation",
    baseband_status: "Unresponsive",
    unknown_components: "display, battery",
    battery_health: 71,
    battery_cycles: 580,
    model_number: "FXXXXLL/A",
    activation_state: "MobileActivationError",
    biometric_status: "FALHA_OU_AUSENTE",
    als_status: "FALHA_DE_COMUNICACAO",
    bms_voltage_mv: 3800,
    bms_temperature_c: 451,
    bms_instant_amperage: -1200,
  },
};

export const WaitingScreen = ({
  scanning,
  scanDevice,
  onSelectMockDevice,
  feedback,
}: WaitingScreenProps) => {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-base select-none p-6 @xl:p-10 overflow-y-auto">
      {/* ─── Área central ─── */}
      <div className="w-full max-w-lg flex flex-col items-center">
        {/* Ícone */}
        <div className="mb-8 w-20 h-20 rounded-2xl bg-surface border border-border-strong flex items-center justify-center shadow-lg">
          <Smartphone
            className={`w-9 h-9 transition-colors duration-300 ${
              scanning ? "text-indigo-400" : "text-text-muted"
            }`}
          />
        </div>

        {/* Títulos */}
        <h1 className="text-2xl font-black tracking-tight text-text-primary mb-2">
          Aguardando Dispositivo
        </h1>
        <p className="text-sm font-sans text-text-secondary text-center max-w-xs leading-relaxed mb-6">
          O laudo é gerado a partir dos dados lidos direto do aparelho. Siga os passos abaixo para
          conectar.
        </p>

        {/* Guia de conexão em 3 passos */}
        <ol className="w-full mb-8 flex flex-col gap-2.5">
          {CONNECTION_STEPS.map((step, i) => (
            <li key={i} className="flex items-center gap-3 text-left">
              <span className="w-6 h-6 shrink-0 rounded-full bg-surface border border-border-strong flex items-center justify-center text-[11px] font-mono font-bold text-indigo-400">
                {i + 1}
              </span>
              <span className="text-xs font-sans text-text-secondary leading-snug">{step}</span>
            </li>
          ))}
        </ol>

        {/* Feedback do scan: aviso neutro (nenhum device) vs falha real */}
        {feedback && (
          <div
            className={`w-full mb-6 flex items-start gap-3 px-4 py-3 rounded-xl border text-left ${
              feedback.tone === "error"
                ? "bg-bg-red border-border-red"
                : "bg-bg-orange border-border-orange"
            }`}
          >
            {feedback.tone === "error" ? (
              <AlertCircle className="w-4 h-4 text-status-red shrink-0 mt-0.5" />
            ) : (
              <Info className="w-4 h-4 text-status-orange shrink-0 mt-0.5" />
            )}
            <p
              className={`text-xs leading-relaxed ${
                feedback.tone === "error" ? "text-status-red" : "text-status-orange"
              }`}
            >
              {feedback.text}
            </p>
          </div>
        )}

        {/* Botão primário */}
        <button
          onClick={scanDevice}
          disabled={scanning}
          id="btn-scan-device"
          className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_0_1px_rgba(99,102,241,0.4),0_4px_20px_rgba(99,102,241,0.25)] mb-10"
        >
          <RefreshCw className={`w-4 h-4 ${scanning ? "animate-spin" : ""}`} />
          {scanning ? "Identificando dispositivo..." : "Verificar Dispositivo USB"}
        </button>

        {/* ─── Simulador ─── */}
        <div className="w-full">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-1 h-px bg-border-strong" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-text-muted whitespace-nowrap">
              Simulador de Dispositivos
            </span>
            <div className="flex-1 h-px bg-border-strong" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              id="btn-mock-perfect"
              onClick={() => onSelectMockDevice(MOCK_DEVICES.perfect)}
              className="group p-4 rounded-xl bg-surface border border-border-strong hover:border-indigo-500/40 hover:bg-elevated transition-all text-left flex flex-col gap-2"
            >
              <div className="flex items-center justify-between w-full">
                <span className="flex items-center gap-1.5 text-xs font-bold text-text-primary">
                  <Smartphone className="w-3.5 h-3.5 text-text-muted group-hover:text-indigo-400 transition-colors" />
                  iPhone 13
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-bg-green text-status-green border border-border-green uppercase font-bold tracking-wider">
                  Limpo
                </span>
              </div>
              <span className="text-[10px] text-text-muted font-sans leading-snug">
                Sem alertas críticos · 94% de saúde
              </span>
            </button>

            <button
              id="btn-mock-compromised"
              onClick={() => onSelectMockDevice(MOCK_DEVICES.compromised)}
              className="group p-4 rounded-xl bg-surface border border-border-strong hover:border-status-red/40 hover:bg-elevated transition-all text-left flex flex-col gap-2"
            >
              <div className="flex items-center justify-between w-full">
                <span className="flex items-center gap-1.5 text-xs font-bold text-text-primary">
                  <Smartphone className="w-3.5 h-3.5 text-text-muted group-hover:text-status-red transition-colors" />
                  iPhone 11
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-bg-red text-status-red border border-border-red uppercase font-bold tracking-wider">
                  Crítico
                </span>
              </div>
              <span className="text-[10px] text-text-muted font-sans leading-snug">
                iCloud Lock + MDM + Baseband inoperante
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
