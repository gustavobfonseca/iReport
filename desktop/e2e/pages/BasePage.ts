import { Page } from "@playwright/test";

/**
 * BasePage
 *
 * Classe base compartilhada por todos os Page Objects.
 * Fornece acesso à `page` e helpers de navegação comuns.
 */
export class BasePage {
  constructor(protected readonly page: Page) {}

  async goto() {
    await this.page.goto("/");
  }
}
