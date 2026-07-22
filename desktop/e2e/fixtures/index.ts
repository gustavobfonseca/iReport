import { test as base } from "@playwright/test";
import { SidebarComponent } from "../pages/SidebarComponent";
import { WaitingPage } from "../pages/WaitingPage";
import { MainReportPage } from "../pages/MainReportPage";
import { AdvancedLogPage } from "../pages/AdvancedLogPage";

/**
 * Custom Fixtures — iReport E2E
 *
 * Estende o `test` do Playwright com page objects pré-instanciados.
 * Os specs importam `{ test, expect }` deste módulo em vez de '@playwright/test'.
 *
 * Fixtures disponíveis:
 * - `sidebar`      — interações com a sidebar (sempre presente)
 * - `waitingPage`  — tela inicial (já navega para '/' automaticamente)
 * - `mainReport`   — aba Laudo Principal
 * - `advancedLog`  — aba Log Avançado
 */

type IReportFixtures = {
  sidebar: SidebarComponent;
  waitingPage: WaitingPage;
  mainReport: MainReportPage;
  advancedLog: AdvancedLogPage;
};

export const test = base.extend<IReportFixtures>({
  sidebar: async ({ page }, use) => {
    await use(new SidebarComponent(page));
  },

  waitingPage: async ({ page }, use) => {
    const wp = new WaitingPage(page);
    await wp.goto();
    await use(wp);
  },

  mainReport: async ({ page }, use) => {
    await use(new MainReportPage(page));
  },

  advancedLog: async ({ page }, use) => {
    await use(new AdvancedLogPage(page));
  },
});

export { expect } from "@playwright/test";
