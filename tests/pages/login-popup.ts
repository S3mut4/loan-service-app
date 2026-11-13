import { Locator, Page } from "@playwright/test";
import { LoanDetailsPage } from "./loan-details-page";

export class LoginPopup {
  readonly page: Page;
  readonly usernameField: Locator;
  readonly passwordField: Locator;
  readonly continueButton: Locator;
  readonly smartIdTab: Locator;
  readonly personalCodeField: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameField = page.getByTestId("login-popup-username-input");
    this.passwordField = page.getByTestId("login-popup-password-input");
    this.continueButton = page.getByTestId("login-popup-continue-button");
    this.smartIdTab = page.getByTestId("login-popup-tab-smart-id");
    this.personalCodeField = page.getByTestId("login-popup-personal-code-input");
  }

  async selectSmartIdTab() {
    await this.smartIdTab.click();
  }

  async signIn(username: string, password: string) {
    await this.usernameField.fill(username);
    await this.passwordField.fill(password);
    await this.continueButton.click();
    return new LoanDetailsPage(this.page);
  }

  async signInWithSmartId(personalCode: string) {
    await this.selectSmartIdTab();
    await this.personalCodeField.fill(personalCode);
    await this.continueButton.click();
    return new LoanDetailsPage(this.page);
  }
}
