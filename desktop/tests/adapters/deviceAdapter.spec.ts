import { describe, it, expect } from "vitest";
import {
  adaptDeviceData,
  normalizeTelemetry,
  parseStorageGb,
  validateStorageIntegrity,
} from "../../src/adapters/deviceAdapter";
import { DeviceRawPayload } from "../../src/types/device.types";

// Factory pattern para criar objetos de teste padronizados
const createMockDevicePayload = (overrides?: Partial<DeviceRawPayload>): DeviceRawPayload => {
  return {
    connected: true,
    device_name: "iPhone do João",
    product_type: "iPhone14,2", // iPhone 13 Pro
    chassis_serial: "F17H1234ABCD",
    udid: "00008110-001234567890ABCDE",
    storage_capacity: "128 GB",
    storage_used: "64 GB",
    storage_free: "64 GB",
    brick_state: false,
    icloud_locked: "Desbloqueado",
    icloud_account_masked: "N/A",
    fusing_status: "Conforme",
    baseband_status: "Operacional",
    unknown_components: "Genuíno",
    battery_health: 100,
    battery_cycles: 10,
    model_number: "MXXXXLL/A",
    activation_state: "Activated",
    biometric_status: "FaceID_Operacional",
    als_status: "Operacional",
    bms_voltage_mv: 4200,
    bms_temperature_c: 300,
    bms_instant_amperage: -200,
    ...overrides,
  };
};

describe("deviceAdapter", () => {
  describe("normalizeTelemetry", () => {
    it("deve normalizar a temperatura corretamente quando estiver na escala de 10x", () => {
      // Arrange
      const voltage = 4200;
      const temp = 300; // 30.0 °C
      const amperage = -200;

      // Act
      const result = normalizeTelemetry(voltage, temp, amperage);

      // Assert
      expect(result.temperature).toBe(30);
    });

    it("não deve normalizar a temperatura se ela já parecer estar na escala correta", () => {
      // Arrange
      const voltage = 4200;
      const temp = 30; // 30 °C
      const amperage = -200;

      // Act
      const result = normalizeTelemetry(voltage, temp, amperage);

      // Assert
      expect(result.temperature).toBe(30);
    });
  });

  describe("adaptDeviceData", () => {
    it("deve mapear um dispositivo limpo e genuíno corretamente", () => {
      // Arrange
      const rawDevice = createMockDevicePayload();

      // Act
      const uiModel = adaptDeviceData(rawDevice);

      // Assert
      expect(uiModel.mdm.status).toBe("conforme");
      expect(uiModel.icloud.status).toBe("conforme");
      expect(uiModel.fusing.status).toBe("conforme");
      expect(uiModel.baseband.status).toBe("conforme");
      expect(uiModel.parts_authenticity.status).toBe("conforme");
      expect(uiModel.battery_status.status).toBe("conforme");
      expect(uiModel.biometric.status).toBe("conforme");
      expect(uiModel.truetone.status).toBe("conforme");
    });

    it("deve mapear status crítico quando MDM estiver ativo (Supervisionado)", () => {
      // Arrange
      const rawDevice = createMockDevicePayload({ brick_state: true });

      // Act
      const uiModel = adaptDeviceData(rawDevice);

      // Assert
      expect(uiModel.mdm.status).toBe("critico");
      expect(uiModel.mdm.label).toContain("MDM: Ativo");
    });

    it("deve mapear status crítico quando iCloud estiver bloqueado", () => {
      // Arrange
      const rawDevice = createMockDevicePayload({ icloud_locked: "Bloqueado" });

      // Act
      const uiModel = adaptDeviceData(rawDevice);

      // Assert
      expect(uiModel.icloud.status).toBe("critico");
      expect(uiModel.icloud.label).toContain("Conta Vinculada");
    });

    it("deve mapear atenção quando houver peças não genuínas informadas", () => {
      // Arrange
      const rawDevice = createMockDevicePayload({ unknown_components: "Display, Battery" });

      // Act
      const uiModel = adaptDeviceData(rawDevice);

      // Assert
      expect(uiModel.parts_authenticity.status).toBe("atencao");
      expect(uiModel.parts_authenticity.label).toContain("Substituído");
    });

    it("deve mapear status de bateria corretamente com base na saúde", () => {
      // Arrange - Act - Assert for each condition
      expect(
        adaptDeviceData(createMockDevicePayload({ battery_health: 86 })).battery_status.status,
      ).toBe("conforme");
      expect(
        adaptDeviceData(createMockDevicePayload({ battery_health: 80 })).battery_status.status,
      ).toBe("atencao");
      expect(
        adaptDeviceData(createMockDevicePayload({ battery_health: 79 })).battery_status.status,
      ).toBe("critico");
    });

    it("deve mapear falhas críticas no baseband ou bootROM", () => {
      // Arrange
      const rawDevice = createMockDevicePayload({
        baseband_status: "Unresponsive",
        fusing_status: "Violation",
      });

      // Act
      const uiModel = adaptDeviceData(rawDevice);

      // Assert
      expect(uiModel.baseband.status).toBe("critico");
      expect(uiModel.fusing.status).toBe("critico");
    });

    // ─── Bateria: valores de fronteira (onde um off-by-one vira o laudo) ───

    it("classifica a bateria exatamente nas fronteiras 85 / 84 / 80", () => {
      expect(
        adaptDeviceData(createMockDevicePayload({ battery_health: 85 })).battery_status.status,
      ).toBe("conforme");
      expect(
        adaptDeviceData(createMockDevicePayload({ battery_health: 84 })).battery_status.status,
      ).toBe("atencao");
      expect(
        adaptDeviceData(createMockDevicePayload({ battery_health: 80 })).battery_status.status,
      ).toBe("atencao");
    });

    // ─── iCloud vinculado só pela conta mascarada (mesmo "desbloqueado") ───

    it("marca iCloud como crítico quando há conta mascarada, mesmo com icloud_locked desbloqueado", () => {
      const uiModel = adaptDeviceData(
        createMockDevicePayload({
          icloud_locked: "Desbloqueado",
          icloud_account_masked: "j*****@icloud.com",
        }),
      );
      expect(uiModel.icloud.status).toBe("critico");
      expect(uiModel.icloud.label).toContain("j*****@icloud.com");
    });

    // ─── Carrier lock (activation_state) ───

    it("mapeia bloqueio de operadora a partir do activation_state", () => {
      expect(
        adaptDeviceData(createMockDevicePayload({ activation_state: "Activated" })).carrier_lock
          .status,
      ).toBe("conforme");
      expect(
        adaptDeviceData(createMockDevicePayload({ activation_state: "MobileActivationError" }))
          .carrier_lock.status,
      ).toBe("atencao");
    });

    // ─── TrueTone / ALS ───

    it("mapeia o sensor TrueTone/ALS pelo als_status", () => {
      expect(
        adaptDeviceData(createMockDevicePayload({ als_status: "Operacional" })).truetone.status,
      ).toBe("conforme");
      expect(
        adaptDeviceData(createMockDevicePayload({ als_status: "FALHA_DE_COMUNICACAO" })).truetone
          .status,
      ).toBe("atencao");
    });

    // ─── eSIM: NÃO pode gerar falso "atenção" em modelo US com SIM físico ───

    it("não marca falso 'Apenas eSIM' para modelo US (LL/A) com gaveta física", () => {
      const uiModel = adaptDeviceData(createMockDevicePayload({ model_number: "MXXXXLL/A" }));
      expect(uiModel.sim_configuration.status).toBe("conforme");
      expect(uiModel.sim_configuration.label).not.toContain("Apenas eSIM");
    });

    // ─── Campo ilegível: documenta o comportamento atual (possível falso crítico) ───

    it("trata baseband vazio como crítico (comportamento atual — campo ilegível vira falha)", () => {
      const uiModel = adaptDeviceData(createMockDevicePayload({ baseband_status: "" }));
      expect(uiModel.baseband.status).toBe("critico");
    });

    // ─── Memory crosscheck integrado ao laudo ───

    it("marca crosscheck de memória como crítico quando a capacidade declarada não bate com o disponível", () => {
      const uiModel = adaptDeviceData(
        createMockDevicePayload({
          storage_capacity: "256 GB",
          storage_used: "40 GB",
          storage_free: "20 GB",
        }),
      );
      expect(uiModel.memory_crosscheck.status).toBe("critico");
    });
  });

  // ─── Helpers puros de armazenamento (a "conta e assert") ───

  describe("parseStorageGb", () => {
    it("extrai o número de uma string de capacidade", () => {
      expect(parseStorageGb("128 GB")).toBe(128);
      expect(parseStorageGb("64GB")).toBe(64);
      expect(parseStorageGb("1.5 TB")).toBe(1.5);
    });

    it("retorna NaN para entradas sem número", () => {
      expect(parseStorageGb("N/A")).toBeNaN();
      expect(parseStorageGb("")).toBeNaN();
    });
  });

  describe("validateStorageIntegrity", () => {
    it("confirma quando usado + livre é coerente com a capacidade declarada", () => {
      // 42 + 86 = 128, bate com o nominal
      expect(validateStorageIntegrity("128 GB", "42 GB", "86 GB").status).toBe("conforme");
      // device real: usável ~93% do nominal ainda é aceito
      expect(validateStorageIntegrity("128 GB", "60 GB", "59 GB").status).toBe("conforme");
    });

    it("acusa capacidade divergente quando o disponível é muito menor que o declarado (fraude)", () => {
      // declara 256, mas só 60 GB reais disponíveis
      const result = validateStorageIntegrity("256 GB", "40 GB", "20 GB");
      expect(result.status).toBe("critico");
      expect(result.label).toContain("divergente");
    });

    it("marca como não verificável quando a capacidade não pode ser lida", () => {
      expect(validateStorageIntegrity("N/A", "40 GB", "20 GB").status).toBe("atencao");
    });
  });
});
