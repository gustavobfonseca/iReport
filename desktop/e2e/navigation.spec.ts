import { test } from "./fixtures/index";
import { PERFECT_DEVICE, COMPROMISED_DEVICE } from "./data/devices";

/**
 * E2E: Navegação e Fluxos de UI
 *
 * Testa comportamentos transversais da interface:
 * - Troca de mock sem recarregar a página
 * - Ciclo completo: mock limpo → desconectar → mock crítico
 * - Reset de aba após desconexão
 * - App title sempre visível na sidebar
 * - Botões de aba e "Sair" não aparecem sem dispositivo conectado
 */
test.describe("Navegação e Fluxos de UI", { tag: ["@smoke", "@regression"] }, () => {
  test("deve permitir selecionar um mock, desconectar e selecionar outro", async ({
    waitingPage,
    sidebar,
    mainReport,
  }) => {
    await waitingPage.selectPerfectDevice();
    await sidebar.expectDeviceNickname(PERFECT_DEVICE.nickname);

    await sidebar.clickDisconnect();
    await waitingPage.expectVisible();

    await waitingPage.selectCompromisedDevice();
    await sidebar.expectDeviceNickname(COMPROMISED_DEVICE.nickname);
  });

  test('deve resetar a aba para "Laudo Principal" após desconectar', async ({
    waitingPage,
    sidebar,
    mainReport,
    advancedLog,
  }) => {
    await waitingPage.selectPerfectDevice();
    await sidebar.expectDeviceNickname(PERFECT_DEVICE.nickname);

    // Navega para log avançado
    await sidebar.clickAdvancedLog();
    await advancedLog.expectHeaderVisible();

    // Desconecta e reconecta
    await sidebar.clickDisconnect();
    await waitingPage.selectPerfectDevice();
    await sidebar.expectDeviceNickname(PERFECT_DEVICE.nickname);

    // Deve voltar para a aba principal
    await mainReport.expectGroupAVisible();
    await advancedLog.expectHeaderHidden();
  });

  test('deve manter o título "iReport Scanner" sempre visível na sidebar', async ({
    waitingPage,
    sidebar,
  }) => {
    await sidebar.expectTitle();

    await waitingPage.selectPerfectDevice();
    await sidebar.expectTitle();

    await sidebar.clickAdvancedLog();
    await sidebar.expectTitle();
  });

  test("não deve exibir os botões de navegação de aba enquanto não há device", async ({
    waitingPage,
    sidebar,
  }) => {
    await sidebar.expectTabButtonsHidden();
  });

  test('não deve exibir o botão "Sair do Aparelho" na tela inicial', async ({
    waitingPage,
    sidebar,
  }) => {
    await sidebar.expectDisconnectButtonHidden();
  });
});
