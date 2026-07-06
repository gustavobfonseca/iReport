import { DeviceData, RowStatus } from "../types/device";
import { getModelOrigin, getRegionName } from "./deviceMappings";

export class DeviceValidator {
  private device: DeviceData;

  constructor(device: DeviceData) {
    this.device = device;
  }

  public validateICloud() {
    const isClean = this.device.icloud_locked === "CLEAN";
    return {
      read: isClean ? "Find My: Inativo (Livre)" : "Find My: Ativo (Bloqueado)",
      result: isClean ? "Conforme" : "Crítico",
      status: (isClean ? "success" : "danger") as RowStatus,
    };
  }

  public validateAppleID() {
    const hasAccount = !!(this.device.icloud_account_masked && this.device.icloud_account_masked !== "N/A" && this.device.icloud_account_masked !== "");
    return {
      read: hasAccount ? `Sessão: Ativa (${this.device.icloud_account_masked})` : "Sessão: Nenhuma Conta Conectada",
      result: hasAccount ? "Atenção" : "Conforme",
      status: (hasAccount ? "warning" : "success") as RowStatus,
    };
  }

  public validatePasscode() {
    const isProtected = this.device.password_protected;
    return {
      read: isProtected ? "Senha de Tela: Ativa (Bloqueada)" : "Senha de Tela: Inativa (Sem Senha)",
      result: isProtected ? "Atenção" : "Conforme",
      status: (isProtected ? "warning" : "success") as RowStatus,
    };
  }

  public validateMDM() {
    const isMdm = this.device.brick_state;
    return {
      read: isMdm ? "Gerenciamento MDM: Ativo (Supervisionado)" : "Gerenciamento MDM: Inativo (Livre)",
      result: isMdm ? "Crítico" : "Conforme",
      status: (isMdm ? "danger" : "success") as RowStatus,
    };
  }

  public validateAppleCategory() {
    const origin = getModelOrigin(this.device.model_number);
    return {
      read: `Modelo: ${this.device.model_number} | Prefixo: ${origin.letter} | Canal: ${origin.label}`,
      result: origin.status === "success" ? "Conforme" : origin.status === "danger" ? "Crítico" : "Atenção",
      status: origin.status as RowStatus,
    };
  }

  public validateActivationState() {
    const isActivated = this.device.activation_state === "Activated";
    return {
      read: isActivated ? "Ativação iOS: Ativado" : "Ativação iOS: Não Ativado / Pendente",
      result: isActivated ? "Conforme" : "Atenção",
      status: (isActivated ? "success" : "warning") as RowStatus,
    };
  }

  public validateOrigin() {
    return {
      read: `Região: ${getRegionName(this.device.device_region)} | Código: ${this.device.device_region || "N/A"}`,
      result: "Conforme",
      status: "success" as RowStatus,
    };
  }

  public validateBatteryHealth() {
    const isOk = this.device.battery_health >= 80;
    return {
      read: `Capacidade Máxima: ${this.device.battery_health}% (iOS)`,
      result: isOk ? "Conforme" : "Crítico",
      status: (isOk ? "success" : "danger") as RowStatus,
    };
  }

  public validateBatteryCycles() {
    const product = this.device.product_type.toLowerCase();
    const isNewModel = product.includes("iphone15") || product.includes("iphone16") || product.includes("iphone17");
    const maxCycles = isNewModel ? 1000 : 500;
    
    const isConforme = this.device.battery_cycles < maxCycles;
    const isAtencao = this.device.battery_cycles < (maxCycles * 1.5);
    
    return {
      read: `Ciclos de Carga: ${this.device.battery_cycles} ciclos`,
      result: isConforme ? "Conforme" : isAtencao ? "Atenção" : "Crítico",
      status: (isConforme ? "success" : isAtencao ? "warning" : "danger") as RowStatus,
    };
  }

  public validateBmsResets() {
    const isClean = this.device.bms_reset_count === 0;
    return {
      read: `Reinicializações: ${this.device.bms_reset_count} resets no chip`,
      result: isClean ? "Conforme" : "Atenção",
      status: (isClean ? "success" : "warning") as RowStatus,
    };
  }

  public validateBatteryOriginality() {
    const isOriginal = this.device.battery_original;
    return {
      read: `Módulo Bateria: ${isOriginal ? "Original Apple (Pareado)" : "Ausente / Divergente (Desconhecido)"}`,
      result: isOriginal ? "Conforme" : "Atenção",
      status: (isOriginal ? "success" : "warning") as RowStatus,
    };
  }

  public validateDisplayOriginality() {
    const isDisplayParallel = this.device.unknown_components.toLowerCase().includes("display");
    return {
      read: `Módulo Tela: ${isDisplayParallel ? "Não Homologado (Substituída / Paralela)" : "Original Apple (Pareada)"}`,
      result: isDisplayParallel ? "Crítico" : "Conforme",
      status: (isDisplayParallel ? "danger" : "success") as RowStatus,
    };
  }

  public validateBaseband() {
    const isBasebandBroken = this.device.baseband_status.toLowerCase() === "unresponsive";
    return {
      read: `Modem Baseband: ${this.device.baseband_status === "BBInfoAvailable" ? "Operacional" : "Falha / Inoperante"}`,
      result: isBasebandBroken ? "Crítico" : "Conforme",
      status: (isBasebandBroken ? "danger" : "success") as RowStatus,
    };
  }

  public validateSystemStability() {
    const isStable = this.device.panic_full_count === 0;
    return {
      read: `Kernel Panics: ${this.device.panic_full_count} falhas registradas`,
      result: isStable ? "Conforme" : "Crítico",
      note: !isStable ? `Último registro: ${this.device.last_panic_reason}` : undefined,
      status: (isStable ? "success" : "danger") as RowStatus,
    };
  }

  public validateBiometric() {
    const isOperational = this.device.biometric_status.includes("Operacional");
    const label = this.device.biometric_status === "FaceID_Operacional" 
      ? "Face ID Operacional" 
      : this.device.biometric_status === "TouchID_Operacional" 
        ? "Touch ID Operacional" 
        : "Inativo / Falha de Pareamento";
    return {
      read: `Módulo Biométrico: ${label}`,
      result: isOperational ? "Conforme" : "Crítico",
      status: (isOperational ? "success" : "danger") as RowStatus,
    };
  }

  public validateTrueTone() {
    const isAlsOk = this.device.als_status === "OPERACIONAL";
    return {
      read: `Comunicação ALS: ${isAlsOk ? "Operacional (TrueTone Ativo)" : "Sem Resposta (TrueTone Inativo)"}`,
      result: isAlsOk ? "Conforme" : "Crítico",
      status: (isAlsOk ? "success" : "danger") as RowStatus,
    };
  }

  public validateStorageWear() {
    const isWearOk = this.device.nand_wear_level <= 90;
    return {
      read: `Vida Útil Flash: ${(100 - this.device.nand_wear_level).toFixed(2)}% | Desgaste Estimado: ${this.device.nand_wear_level.toFixed(2)}%`,
      result: isWearOk ? "Conforme" : "Crítico",
      status: (isWearOk ? "success" : "danger") as RowStatus,
    };
  }
}
