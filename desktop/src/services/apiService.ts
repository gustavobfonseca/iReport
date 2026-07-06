import { DeviceData } from "../types/device";

export const generateReport = async (device: DeviceData, panicLogs: number | null): Promise<string> => {
  const res = await fetch("http://localhost:3000/api/laudos/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ 
      ...device, 
      panic_log_count: panicLogs,
    }),
  });
  const result = await res.json();
  if (result.success) {
    return result.url;
  }
  throw new Error("Failed to generate report");
};
