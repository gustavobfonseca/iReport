import { useState, useEffect } from "react";
import { DeviceUIModel } from "../types/device.types";
import { TelemetryDashboard } from "./TelemetryDashboard";
import { Terminal } from "lucide-react";
import { listen } from "@tauri-apps/api/event";

interface AdvancedLogTabProps {
  device: DeviceUIModel;
}

interface TelemetryPayload {
  voltage: number;
  temp: number;
  amperage: number;
}

const normalizeTemp = (t: number): number => {
  return t > 100 || t < -50 ? t / 10 : t;
};

export const AdvancedLogTab = ({ device }: AdvancedLogTabProps) => {
  // Estado inicializado a partir do device: como o componente é remontado
  // (via `key={device.udid}` no InspectionPage) a cada troca de aparelho,
  // não é necessário um efeito para resetar o histórico.
  const [telemetryHistory, setTelemetryHistory] = useState(() => [
    {
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
      voltage: device.bms_telemetry_voltage,
      temperature: device.bms_telemetry_temp,
      amperage: device.bms_telemetry_amperage,
    },
  ]);

  useEffect(() => {
    const setupListener = async () => {
      const unlisten = await listen<TelemetryPayload>("telemetry_update", (event) => {
        const timestamp = new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });
        const newPoint = {
          time: timestamp,
          voltage: event.payload.voltage,
          temperature: normalizeTemp(event.payload.temp),
          amperage: event.payload.amperage,
        };
        setTelemetryHistory((prev) => [...prev.slice(-59), newPoint]);
      });
      return unlisten;
    };

    const promise = setupListener();

    return () => {
      promise.then((unlisten) => unlisten());
    };
  }, []);

  return (
    <div className="flex-1 overflow-y-auto bg-base p-6 md:p-8">
      <div className="mb-8 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-start gap-3">
        <Terminal className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
        <div>
          <h3 className="text-indigo-400 font-mono font-bold uppercase tracking-wider mb-1 text-xs">
            Modo Avançado (Debug & Telemetria)
          </h3>
          <p className="text-text-muted font-sans text-sm leading-relaxed">
            Estes dados são extraídos em tempo real via diagnóstico profundo e representam métricas
            de telemetria crua do hardware.
          </p>
        </div>
      </div>

      <TelemetryDashboard data={telemetryHistory} />
    </div>
  );
};
