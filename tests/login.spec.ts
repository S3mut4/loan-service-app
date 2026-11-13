import { test, expect } from "@playwright/test";
import { SmallLoanPage } from "./pages/small-loan-page";
import { SMART_ID_CODE } from "../config/env-data";

let smallLoanPage: SmallLoanPage;

test.beforeEach(async ({ page }) => {
  smallLoanPage = new SmallLoanPage(page);
  await smallLoanPage.open();
});

test("login popup > default state for password and smart id tabs", async () => {
  await smallLoanPage.calculate();
  const loginPopup = await smallLoanPage.apply();

  // username / password tab
  await expect(loginPopup.usernameField).toBeVisible();
  await expect(loginPopup.passwordField).toBeVisible();
  await expect(loginPopup.continueButton).toBeDisabled();

  // smart id tab
  await loginPopup.selectSmartIdTab();
  await expect(loginPopup.personalCodeField).toBeVisible();
  await expect(loginPopup.continueButton).toBeDisabled();
});

test("smart id login > loan details show the calculator values", async () => {
  await smallLoanPage.calculate();
  const loginPopup = await smallLoanPage.apply();

  const loanDetailsPage = await loginPopup.signInWithSmartId(SMART_ID_CODE);

  await expect(loanDetailsPage.amount).toHaveText("500 €");
  await expect(loanDetailsPage.period).toHaveText("12 months");
});
