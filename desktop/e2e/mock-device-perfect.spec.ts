import { test } from "./fixtures/index";
import { PERFECT_DEVICE } from "./data/devices";

/**
 * E2E: Fluxo Completo — Dispositivo Sem Alertas (iPhone 13 "Limpo")
 *
 * Agrupado por fluxo de usuário (não por campo isolado): cada teste cobre um
 * pedaço coeso da jornada — sidebar, KPIs, Grupo A, Grupo B, navegação de aba
 * e desconexão. A tradução de dado bruto -> veredito de UI já é validada a
 * fundo em tests/adapters/deviceAdapter.spec.ts (Vitest); aqui o objetivo é
 * provar que o fluxo renderiza e navega de ponta a ponta, não re-testar cada
 * rótulo individualmente.
 */
test.describe(
  "Fluxo Completo: Dispositivo Limpo (iPhone 13)",
  { tag: ["@sanity", "@regression"] },
  () => {
    test.beforeEach(async ({ waitingPage }) => {
      await waitingPage.selectPerfectDevice();
    });

    test("deve esconder a tela de conexão e exibir a sidebar completa do dispositivo", async ({
      waitingPage,
      sidebar,
    }) => {
      await waitingPage.expectNotVisible();
      await sidebar.expectDeviceName(PERFECT_DEVICE.name);
      await sidebar.expectDeviceNickname(PERFECT_DEVICE.nickname);
      await sidebar.expectStorageBlock(PERFECT_DEVICE.storage);
      await sidebar.expectTabButtonsVisible();
    });

    test("deve exibir os KPIs com os valores esperados", async ({ mainReport }) => {
      await mainReport.expectKPITitlesVisible();
      await mainReport.expectBatteryHealth(PERFECT_DEVICE.batteryHealth);
      await mainReport.expectSystemIntegrity(PERFECT_DEVICE.systemIntegrity);
      await mainReport.expectPartsAuthenticity(PERFECT_DEVICE.partsAuthenticity);
    });

    test("deve exibir o Grupo A de Riscos Críticos com status conforme", async ({ mainReport }) => {
      await mainReport.expectGroupAVisible();
      await mainReport.expectMdm(PERFECT_DEVICE.mdm);
      await mainReport.expectIcloud(PERFECT_DEVICE.icloud);
      await mainReport.expectFusing(PERFECT_DEVICE.fusing);
      await mainReport.expectBaseband(PERFECT_DEVICE.baseband);
    });

    test("deve exibir o Grupo B de Validação de Hardware com status conforme", async ({
      mainReport,
    }) => {
      await mainReport.expectGroupBVisible();
      await mainReport.expectBiometric(PERFECT_DEVICE.biometric);
    });

    test("deve navegar para o Log Avançado, exibir telemetria BMS e voltar ao Laudo Principal", async ({
      sidebar,
      advancedLog,
      mainReport,
    }) => {
      await sidebar.clickAdvancedLog();
      await advancedLog.expectHeaderVisible();
      await advancedLog.expectBmsSectionVisible();
      await advancedLog.expectVoltage(PERFECT_DEVICE.bmsVoltage);

      await sidebar.clickMainReport();
      await mainReport.expectGroupAVisible();
    });

    test('deve exibir "Sair do Aparelho" e retornar à tela de aguardo ao desconectar', async ({
      sidebar,
      waitingPage,
    }) => {
      await sidebar.expectDisconnectButtonVisible();
      await sidebar.clickDisconnect();
      await waitingPage.expectVisible();
      await sidebar.expectWaitingState();
    });
  },
);
