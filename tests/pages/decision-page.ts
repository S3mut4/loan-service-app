import { Locator, Page } from "@playwright/test";

export class DecisionPage {
  readonly page: Page;
  readonly okButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.okButton = page.getByTestId("decision-page-ok-button");
  }
}
