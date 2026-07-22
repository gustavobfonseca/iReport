import { test } from "./fixtures/index";

/**
 * E2E: Tela de Aguardo (Estado Inicial)
 *
 * Smoke do estado inicial do app (machineState = "WAITING_USB"): garante que o
 * app sobe já na tela de conexão. O fluxo real (mock → laudo) é coberto pelos
 * specs mock-device-*; navegação/desconexão por navigation.spec.
 */
test.describe("Tela de Aguardo (Estado Inicial)", { tag: ["@smoke", "@regression"] }, () => {
  test("deve exibir a tela de conexão ao iniciar o app", async ({ waitingPage }) => {
    await waitingPage.expectVisible();
  });
});
