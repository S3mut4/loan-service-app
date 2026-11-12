import { Locator, Page } from "@playwright/test";
import { DecisionPage } from "./decision-page";

export class IncomePage {
  readonly page: Page;
  readonly incomeField: Locator;
  readonly getDecisionButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.incomeField = page.getByTestId("income-page-input");
    this.getDecisionButton = page.getByTestId("income-page-submit-button");
  }

  async fillIncome(income: number) {
    await this.incomeField.fill(String(income));
  }

  async getDecision() {
    await this.getDecisionButton.click();
    return new DecisionPage(this.page);
  }
}
