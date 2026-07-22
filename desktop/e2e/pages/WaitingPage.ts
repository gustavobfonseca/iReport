import { Page, expect } from "@playwright/test";
import { BasePage } from "./BasePage";

/**
 * WaitingPage
 *
 * Encapsula interações com a tela inicial do iReport (machineState = WAITING_USB):
 * presença da tela e seleção dos perfis do simulador de dispositivos.
 */
export class WaitingPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // ─── Estado de Aguardo ───────────────────────────────────────────────────

  async expectVisible() {
    await expect(this.page.getByRole("heading", { name: "Aguardando Dispositivo" })).toBeVisible();
  }

  async expectNotVisible() {
    await expect(
      this.page.getByRole("heading", { name: "Aguardando Dispositivo" }),
    ).not.toBeVisible({ timeout: 2000 });
  }

  // ─── Seleção de Mocks ────────────────────────────────────────────────────

  async selectPerfectDevice() {
    await this.page.locator("#btn-mock-perfect").click();
  }

  async selectCompromisedDevice() {
    await this.page.locator("#btn-mock-compromised").click();
  }
}
