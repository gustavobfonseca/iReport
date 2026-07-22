import { DeviceRawPayload, DeviceUIModel, InspectionField } from "../types/device.types";

export const normalizeTelemetry = (voltage: number, temp: number, amperage: number) => ({
  voltage,
  temperature: temp > 100 || temp < -50 ? temp / 10 : temp,
  amperage,
});

/** Extrai o número de uma string de armazenamento ("128 GB" -> 128). */
export const parseStorageGb = (value: string): number => {
  const match = value?.match(/[\d.]+/);
  return match ? parseFloat(match[0]) : NaN;
};

/**
 * Cross-check de armazenamento: o espaço realmente disponível (usado + livre)
 * precisa ser coerente com a capacidade declarada. Uma capacidade declarada
 * muito acima do que o chip realmente entrega é um indício clássico de fraude
 * (chip menor "reprogramado" para reportar capacidade maior).
 *
 * Um device real tem usável ~90-95% do nominal (128 GB -> ~119 GB), então a
 * banda aceita é 80%-105% do nominal.
 */
export const validateStorageIntegrity = (
  capacity: string,
  used: string,
  free: string,
): InspectionField => {
  const nominal = parseStorageGb(capacity);
  const usable = parseStorageGb(used) + parseStorageGb(free);

  if (!Number.isFinite(nominal) || nominal <= 0 || !Number.isFinite(usable)) {
    return { label: "Capacidade não verificável", status: "atencao" };
  }

  const ratio = usable / nominal;
  if (ratio < 0.8 || ratio > 1.05) {
    return {
      label: `Capacidade divergente (declara ${capacity.trim()}, disponível ~${usable.toFixed(0)} GB)`,
      status: "critico",
    };
  }

  return { label: "Armazenamento Confirmado", status: "conforme" };
};

export const adaptDeviceData = (raw: DeviceRawPayload): DeviceUIModel => {
  const mdm: InspectionField = raw.brick_state
    ? { label: "MDM: Ativo / Supervisionado", status: "critico" }
    : { label: "MDM: Inativo", status: "conforme" };

  const isIcloudLocked =
    raw.icloud_locked.toLowerCase() === "bloqueado" ||
    raw.icloud_locked.toLowerCase().includes("yes") ||
    raw.icloud_locked.toLowerCase().includes("ativo") ||
    (raw.icloud_account_masked && raw.icloud_account_masked !== "N/A");

  let icloudLabel = "Sem Conta Ativa";
  if (isIcloudLocked) {
    if (raw.icloud_account_masked && raw.icloud_account_masked !== "N/A") {
      icloudLabel = `Conta Vinculada (${raw.icloud_account_masked})`;
    } else {
      icloudLabel = "Conta Vinculada (Find My Ativo)";
    }
  }

  const icloud: InspectionField = isIcloudLocked
    ? { label: icloudLabel, status: "critico" }
    : { label: "Sem Conta Ativa", status: "conforme" };

  const isFusingSecure =
    raw.fusing_status === "3" ||
    raw.fusing_status.toLowerCase().includes("conforme") ||
    raw.fusing_status.toLowerCase().includes("securerom ok");
  const fusing: InspectionField = isFusingSecure
    ? { label: "Integridade Confirmada", status: "conforme" }
    : { label: `Assinatura de Boot Violada: ${raw.fusing_status}`, status: "critico" };

  const isBbOk =
    raw.baseband_status.toLowerCase().includes("operacional") ||
    raw.baseband_status.toLowerCase().includes("available");
  const baseband: InspectionField = isBbOk
    ? { label: "Modem Celular Operante", status: "conforme" }
    : { label: `Falha de Hardware: ${raw.baseband_status}`, status: "critico" };

  const memory_crosscheck: InspectionField = validateStorageIntegrity(
    raw.storage_capacity,
    raw.storage_used,
    raw.storage_free,
  );

  const isGenuine =
    !raw.unknown_components ||
    raw.unknown_components.toLowerCase() === "genuíno" ||
    raw.unknown_components.toLowerCase() === "n/a" ||
    raw.unknown_components.trim() === "";
  const parts_authenticity: InspectionField = isGenuine
    ? { label: "Nenhum histórico de troca registrado", status: "conforme" }
    : { label: `Substituído (${raw.unknown_components})`, status: "atencao" };

  let batteryStatus: InspectionField;
  if (raw.battery_health >= 85) {
    batteryStatus = { label: "Conforme", status: "conforme" };
  } else if (raw.battery_health >= 80) {
    batteryStatus = { label: "Atenção", status: "atencao" };
  } else {
    batteryStatus = { label: "Crítico", status: "critico" };
  }

  // O payload atual não expõe um sinal confiável de "somente eSIM": o sufixo
  // "LL/A" indica só o mercado (EUA/Canadá) e se aplica a TODAS as gerações —
  // inclusive iPhones com gaveta física (ex.: iPhone 13 LL/A). Usá-lo como
  // indicador de eSIM gerava um falso "atenção", então reportamos o padrão
  // até o backend expor um campo dedicado.
  const sim_configuration: InspectionField = { label: "Físico + eSIM", status: "conforme" };

  const isUnlocked =
    raw.activation_state === "Activated" || raw.activation_state === "FactoryActivated";
  const carrier_lock: InspectionField = isUnlocked
    ? { label: "Livre para qualquer operadora", status: "conforme" }
    : { label: "Operadora bloqueada ou restrita", status: "atencao" };

  const isBioOk = raw.biometric_status.toLowerCase().includes("operacional");
  const biometric: InspectionField = isBioOk
    ? { label: raw.biometric_status.replace("_", ": "), status: "conforme" }
    : { label: "Módulo Biométrico Inativo ou Ausente", status: "atencao" };

  const isTtOk = raw.als_status.toLowerCase() === "operacional";
  const truetone: InspectionField = isTtOk
    ? { label: "Sensor TrueTone / ALS ativo", status: "conforme" }
    : { label: "Sem TrueTone / ALS Inativo", status: "atencao" };

  const normalizedTelemetry = normalizeTelemetry(
    raw.bms_voltage_mv,
    raw.bms_temperature_c,
    raw.bms_instant_amperage,
  );

  return {
    connected: raw.connected,
    device_name: raw.device_name,
    product_type: raw.product_type,
    serial_number: raw.chassis_serial,
    udid: raw.udid,
    storage_capacity: raw.storage_capacity,
    storage_used: raw.storage_used,
    storage_free: raw.storage_free,
    mdm,
    icloud,
    fusing,
    baseband,
    memory_crosscheck,
    parts_authenticity,
    battery_health: raw.battery_health,
    battery_cycles: raw.battery_cycles,
    battery_status: batteryStatus,
    sim_configuration,
    carrier_lock,
    biometric,
    truetone,
    bms_telemetry_voltage: normalizedTelemetry.voltage,
    bms_telemetry_temp: normalizedTelemetry.temperature,
    bms_telemetry_amperage: normalizedTelemetry.amperage,
  };
};
