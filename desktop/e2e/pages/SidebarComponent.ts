import { Page, expect } from "@playwright/test";
import { BasePage } from "./BasePage";

/**
 * SidebarComponent
 *
 * Encapsula todas as interações com a sidebar do iReport Scanner.
 * A sidebar é persistente em todos os estados do app:
 * - Estado de aguardo: exibe título + "Aguardando Dispositivo"
 * - Dispositivo conectado: exibe info do device + botões de navegação de aba
 */
export class SidebarComponent extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // ─── App Title ───────────────────────────────────────────────────────────

  async expectTitle() {
    await expect(this.page.getByText("iReport Scanner")).toBeVisible();
  }

  // ─── Estado de Aguardo ───────────────────────────────────────────────────

  async expectWaitingState() {
    await expect(this.page.locator("#sidebar-status-waiting")).toBeVisible();
  }

  // ─── Informações do Dispositivo ──────────────────────────────────────────

  async expectDeviceName(name: string) {
    await expect(this.page.getByText(name)).toBeVisible({ timeout: 5000 });
  }

  async expectDeviceNickname(nickname: string) {
    await expect(this.page.locator(`span.text-xs:has-text("${nickname}")`)).toBeVisible({
      timeout: 5000,
    });
  }

  async expectStorageBlock(capacity: string) {
    const storageContainer = this.page.locator("div.w-full.mt-4.px-4.py-3");
    await expect(storageContainer.getByText("Armazenamento")).toBeVisible({ timeout: 5000 });
    await expect(storageContainer.getByText(capacity)).toBeVisible({ timeout: 5000 });
  }

  // ─── Navegação por Abas ──────────────────────────────────────────────────

  async clickMainReport() {
    await this.page.getByRole("button", { name: /Laudo Principal/i }).click();
  }

  async clickAdvancedLog() {
    await this.page.getByRole("button", { name: /Modo Avançado/i }).click();
  }

  async expectTabButtonsVisible() {
    await expect(this.page.getByRole("button", { name: /Laudo Principal/i })).toBeVisible({
      timeout: 3000,
    });
    await expect(this.page.getByRole("button", { name: /Modo Avançado/i })).toBeVisible({
      timeout: 3000,
    });
  }

  async expectTabButtonsHidden() {
    await expect(this.page.getByRole("button", { name: /Laudo Principal/i })).not.toBeVisible();
    await expect(this.page.getByRole("button", { name: /Modo Avançado/i })).not.toBeVisible();
  }

  // ─── Desconexão ──────────────────────────────────────────────────────────

  async clickDisconnect() {
    await this.page.getByRole("button", { name: /Sair do Aparelho/i }).click();
  }

  async expectDisconnectButtonVisible() {
    await expect(this.page.getByRole("button", { name: /Sair do Aparelho/i })).toBeVisible({
      timeout: 3000,
    });
  }

  async expectDisconnectButtonHidden() {
    await expect(this.page.getByRole("button", { name: /Sair do Aparelho/i })).not.toBeVisible();
  }
}
