import { Locator, Page } from "@playwright/test";
import { LoginPopup } from "./login-popup";
import { SMALL_LOAN_URL } from "../../config/env-data";

export class SmallLoanPage {
  readonly page: Page;
  readonly url: string = SMALL_LOAN_URL;
  readonly amountField: Locator;
  readonly periodSelect: Locator;
  readonly calculateButton: Locator;
  readonly applyButton: Locator;
  readonly imageButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.amountField = page.getByTestId("id-small-loan-calculator-field-amount");
    // the app uses "ib-" instead of "id-" for this test id
    this.periodSelect = page.getByTestId("ib-small-loan-calculator-field-period");
    this.calculateButton = page.getByTestId("id-small-loan-calculator-field-calculate");
    this.applyButton = page.getByTestId("id-small-loan-calculator-field-apply");
    this.imageButton = page.getByTestId("id-image-element-button-image-1");
  }

  async open() {
    await this.page.goto(this.url);
  }

  async fillAmount(amount: number) {
    await this.amountField.fill(String(amount));
  }

  async selectPeriod(months: number) {
    await this.periodSelect.selectOption(String(months));
  }

  async calculate() {
    await this.calculateButton.click();
  }

  async scrollToImageButton() {
    await this.imageButton.scrollIntoViewIfNeeded();
  }

  async clickImageButton() {
    await this.imageButton.click();
  }

  async apply() {
    await this.applyButton.click();
    return new LoginPopup(this.page);
  }
}
