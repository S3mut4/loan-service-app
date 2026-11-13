import { Locator, Page } from "@playwright/test";

export class DecisionPage {
  readonly page: Page;
  readonly container: Locator;
  readonly title: Locator;
  readonly approvedIcon: Locator;
  readonly declinedIcon: Locator;
  readonly okButton: Locator;
  readonly errorMessage: Locator;
  readonly retryButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.container = page.getByTestId("decision-page");
    this.title = page.getByTestId("decision-page-title");
    this.approvedIcon = page.getByTestId("decision-page-icon-approved");
    this.declinedIcon = page.getByTestId("decision-page-icon-declined");
    this.okButton = page.getByTestId("decision-page-ok-button");
    // the error message has no test id of its own
    this.errorMessage = this.container.getByText("Could not save your decision. Please try again.");
    this.retryButton = page.getByTestId("decision-page-retry-button");
  }

  async retry() {
    await this.retryButton.click();
  }
}
