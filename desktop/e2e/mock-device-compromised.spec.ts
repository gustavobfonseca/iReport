import { test } from "./fixtures/index";
import { COMPROMISED_DEVICE } from "./data/devices";

/**
 * E2E: Fluxo Completo — Dispositivo Comprometido (iPhone 11)
 *
 * Simula o fluxo principal quando o usuário seleciona o mock "compromised":
 * MDM ativo, iCloud bloqueado, fusing violado, baseband com falha, telemetria
 * BMS degradada. Agrupado por fluxo de usuário — ver nota em
 * mock-device-perfect.spec.ts sobre por que não há um teste por campo.
 */
test.describe(
  "Fluxo Completo: Dispositivo Comprometido (iPhone 11)",
  { tag: ["@sanity", "@regression"] },
  () => {
    test.beforeEach(async ({ waitingPage }) => {
      await waitingPage.selectCompromisedDevice();
    });

    test("deve exibir a sidebar com as informações do dispositivo comprometido", async ({
      sidebar,
    }) => {
      await sidebar.expectDeviceName(COMPROMISED_DEVICE.name);
      await sidebar.expectDeviceNickname(COMPROMISED_DEVICE.nickname);
    });

    test("deve exibir o Grupo A de Riscos Críticos com os alertas do dispositivo comprometido", async ({
      mainReport,
    }) => {
      await mainReport.expectMdm(COMPROMISED_DEVICE.mdm);
      await mainReport.expectIcloud(COMPROMISED_DEVICE.icloud);
      await mainReport.expectIcloudContains(COMPROMISED_DEVICE.icloudMaskedEmail);
      await mainReport.expectFusing(COMPROMISED_DEVICE.fusing);
      await mainReport.expectBaseband(COMPROMISED_DEVICE.baseband);
    });

    test("deve exibir telemetria BMS degradada no Log Avançado", async ({
      sidebar,
      advancedLog,
    }) => {
      await sidebar.clickAdvancedLog();
      await advancedLog.expectVoltage(COMPROMISED_DEVICE.bmsVoltage);
      await advancedLog.expectAmperage(COMPROMISED_DEVICE.bmsAmperage);
    });

    test("deve retornar ao estado de aguardo após desconexão", async ({ sidebar, waitingPage }) => {
      await sidebar.clickDisconnect();
      await sidebar.expectWaitingState();
      await waitingPage.expectVisible();
    });
  },
);
