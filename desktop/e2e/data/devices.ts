/**
 * Test Data — iReport E2E
 *
 * Centraliza os valores esperados de cada mock de dispositivo.
 * Se os mocks mudarem no código-fonte (WaitingScreen.tsx), apenas
 * este arquivo precisa ser atualizado.
 */

export const PERFECT_DEVICE = {
  // --- Sidebar ---
  name: "iPhone 13",
  nickname: "iPhone de Gustavo",
  storage: "128 GB",

  // --- KPIs ---
  batteryHealth: "94%",
  systemIntegrity: "Fusing e MDM validados",
  partsAuthenticity: "Nenhum histórico de troca registrado",

  // --- Grupo A: Dealbreakers ---
  mdm: "MDM: Inativo",
  icloud: "Sem Conta Ativa",
  fusing: "Integridade Confirmada",
  baseband: "Modem Celular Operante",

  // --- Grupo B: Hardware ---
  biometric: "FaceID",

  // --- Log Avançado: BMS ---
  bmsVoltage: "4120 mV",
  bmsAmperage: "-450 mA",

  // --- Estado: não deve exibir alerta ---
  hasAlertBanner: false,
} as const;

export const COMPROMISED_DEVICE = {
  // --- Sidebar ---
  name: "iPhone 11",
  nickname: "iPhone de Testes",
  storage: "64 GB",

  // --- Grupo A: Dealbreakers ---
  mdm: "MDM: Ativo / Supervisionado",
  icloud: "Conta Vinculada (b*****@gmail.com)",
  icloudMaskedEmail: "b*****@gmail.com",
  fusing: "Assinatura de Boot Violada",
  baseband: "Falha de Hardware",

  // --- Log Avançado: BMS ---
  bmsVoltage: "3800 mV",
  bmsAmperage: "-1200 mA",

  // --- Estado: deve exibir alerta ---
  alertBannerText: "ALERTA_SIS",
  hasAlertBanner: true,
} as const;
