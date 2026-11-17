import { Locator, Page } from "@playwright/test";
import { IncomePage } from "./income-page";
import { SmallLoanPage } from "./small-loan-page";

export class LoanDetailsPage {
  readonly page: Page;
  readonly amount: Locator;
  readonly monthlyPayment: Locator;
  readonly period: Locator;
  readonly continueButton: Locator;
  readonly backButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.amount = page.getByTestId("final-page-amount");
    this.monthlyPayment = page.getByTestId("final-page-monthly-payment");
    this.period = page.getByTestId("final-page-period");
    this.continueButton = page.getByTestId("final-page-continue-button");
    this.backButton = page.getByTestId("final-page-back-button");
  }

  async continue() {
    await this.continueButton.click();
    return new IncomePage(this.page);
  }

  async back() {
    await this.backButton.click();
    return new SmallLoanPage(this.page);
  }
}
