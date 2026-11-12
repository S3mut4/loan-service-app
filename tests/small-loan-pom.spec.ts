import { test, expect } from "@playwright/test";
import { SmallLoanPage } from "./pages/small-loan-page";
import { USERNAME, PASSWORD } from "../config/env-data";

let smallLoanPage: SmallLoanPage;

test.beforeEach(async ({ page }) => {
  smallLoanPage = new SmallLoanPage(page);
  await smallLoanPage.open();
});

test("app has default state", async () => {
  await expect(smallLoanPage.calculateButton).toBeEnabled();
  await expect(smallLoanPage.applyButton).toBeDisabled();
});

test("image button scrolls back to the calculator", async () => {
  await smallLoanPage.scrollToImageButton();
  await expect(smallLoanPage.calculateButton).not.toBeInViewport();

  await smallLoanPage.clickImageButton();
  await expect(smallLoanPage.calculateButton).toBeInViewport();
});

test("login popup has default state", async () => {
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

test("full flow: loan details > income > decision", async () => {
  await smallLoanPage.fillAmount(6000);
  await smallLoanPage.selectPeriod(24);
  await smallLoanPage.calculate();

  const loginPopup = await smallLoanPage.apply();
  const loanDetailsPage = await loginPopup.signIn(USERNAME, PASSWORD);

  // loan details: values come from the calculator
  await expect(loanDetailsPage.amount).toHaveText("6000 €");
  await expect(loanDetailsPage.monthlyPayment).toHaveText(/^\d+(\.\d+)? €$/);
  await expect(loanDetailsPage.period).toHaveText("24 months");
  const incomePage = await loanDetailsPage.continue();

  // income
  await expect(incomePage.getDecisionButton).toBeDisabled();
  await incomePage.fillIncome(6000);
  await expect(incomePage.getDecisionButton).toBeEnabled();
  const decisionPage = await incomePage.getDecision();

  // decision
  await expect(decisionPage.okButton).toBeVisible();
});
