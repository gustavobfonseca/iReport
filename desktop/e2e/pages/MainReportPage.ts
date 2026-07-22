import { Page, expect } from "@playwright/test";
import { BasePage } from "./BasePage";

/**
 * MainReportPage
 *
 * Encapsula interações com a aba "Laudo Principal":
 * - KPIs (Condição da Bateria, Integridade, Autenticidade)
 * - Grupo A: Riscos Críticos (Dealbreakers)
 * - Grupo B: Validação de Hardware
 * - Banner de Alerta (ALERTA_SIS)
 */
export class MainReportPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // ─── KPIs ─────────────────────────────────────────────────────────────────

  async expectKPITitlesVisible() {
    await expect(this.page.getByText("Condição da Bateria")).toBeVisible({ timeout: 3000 });
    await expect(this.page.getByText("Integridade do Sistema")).toBeVisible({ timeout: 3000 });
    await expect(this.page.getByText("Autenticidade de Peças")).toBeVisible({ timeout: 3000 });
  }

  async expectBatteryHealth(value: string) {
    await expect(this.page.getByText(value)).toBeVisible({ timeout: 3000 });
  }

  async expectSystemIntegrity(label: string) {
    await expect(this.page.getByText(label)).toBeVisible({ timeout: 3000 });
  }

  async expectPartsAuthenticity(label: string) {
    await expect(
      this.page.locator(`div.text-sm.font-mono.font-bold:has-text("${label}")`),
    ).toBeVisible({ timeout: 3000 });
  }

  // ─── Grupo A: Riscos Críticos ─────────────────────────────────────────────

  async expectGroupAVisible() {
    await expect(this.page.getByText("Riscos Críticos (Dealbreakers)")).toBeVisible({
      timeout: 3000,
    });
  }

  async expectMdm(label: string) {
    await expect(this.page.getByText(label)).toBeVisible({ timeout: 3000 });
  }

  async expectIcloud(label: string) {
    await expect(this.page.getByText(label, { exact: true })).toBeVisible({ timeout: 3000 });
  }

  async expectIcloudContains(text: string) {
    await expect(
      this.page.locator(`span.text-status-red:has-text("Conta Vinculada")`),
    ).toContainText(text);
  }

  async expectFusing(label: string) {
    await expect(this.page.getByText(label)).toBeVisible({ timeout: 3000 });
  }

  async expectBaseband(label: string) {
    await expect(this.page.getByText(label)).toBeVisible({ timeout: 3000 });
  }

  // ─── Grupo B: Hardware ───────────────────────────────────────────────────

  async expectGroupBVisible() {
    await expect(this.page.getByText("Validação de Hardware")).toBeVisible({ timeout: 3000 });
  }

  async expectBiometric(label: string) {
    await expect(this.page.getByText(label)).toBeVisible({ timeout: 3000 });
  }
}
