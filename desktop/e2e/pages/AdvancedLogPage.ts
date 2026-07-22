import { Page, expect } from "@playwright/test";
import { BasePage } from "./BasePage";

/**
 * AdvancedLogPage
 *
 * Encapsula interações com a aba "Log Avançado":
 * - Header de confirmação do modo debug
 * - Seção de Telemetria BMS (voltagem, amperagem, temperatura)
 */
export class AdvancedLogPage extends BasePage {
  /** Container da seção "Dinâmica de Energia e Térmica" — único na página */
  private get bmsSection() {
    return this.page.locator('div.w-full.mb-8:has-text("Dinâmica de Energia e Térmica")');
  }

  constructor(page: Page) {
    super(page);
  }

  // ─── Header ──────────────────────────────────────────────────────────────

  async expectHeaderVisible() {
    await expect(this.page.getByText("Modo Avançado (Debug & Telemetria)")).toBeVisible({
      timeout: 3000,
    });
  }

  async expectHeaderHidden() {
    await expect(this.page.getByText("Modo Avançado (Debug & Telemetria)")).not.toBeVisible();
  }

  // ─── Seção BMS ───────────────────────────────────────────────────────────

  async expectBmsSectionVisible() {
    await expect(this.bmsSection).toBeVisible({ timeout: 3000 });
  }

  async expectVoltage(value: string) {
    await expect(this.bmsSection).toBeVisible({ timeout: 5000 });
    await expect(this.bmsSection.getByText(value)).toBeVisible({ timeout: 5000 });
  }

  async expectAmperage(value: string) {
    await expect(this.bmsSection).toBeVisible({ timeout: 5000 });
    await expect(this.bmsSection.getByText(value)).toBeVisible({ timeout: 5000 });
  }
}
