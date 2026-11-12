import { test, expect } from "@playwright/test";
import { SMALL_LOAN_URL, USERNAME, PASSWORD } from "../config/env-data";

test("app has default state", async ({ page }) => {
  await page.goto(SMALL_LOAN_URL);

  await expect(page.getByTestId("id-small-loan-calculator-field-calculate")).toBeEnabled();
  await expect(page.getByTestId("id-small-loan-calculator-field-apply")).toBeDisabled();

  await page.getByTestId("id-image-element-button-image-1").scrollIntoViewIfNeeded();
  await page.getByTestId("id-image-element-button-image-1").click();
  // now scroll happened
  await expect(page.getByTestId("id-small-loan-calculator-field-calculate")).toBeInViewport();
});

test("calculate > apply button enabled > request happened", async ({ page }) => {
  await page.goto(SMALL_LOAN_URL);

  // before an action we have to init the request listener
  const calcRequestPromise = page.waitForRequest("**/api/loan-calc?amount=500&period=12");
  await page.getByTestId("id-small-loan-calculator-field-calculate").click();
  // straight after the action
  await calcRequestPromise;

  // check the Apply button is enabled now
  await expect(page.getByTestId("id-small-loan-calculator-field-apply")).toBeEnabled();

  // change amount from default to 1000
  await page.getByTestId("id-small-loan-calculator-field-amount").fill("1000");
  const requestOneKPromise = page.waitForRequest("**/api/loan-calc?amount=1000&period=12");
  await page.getByTestId("id-small-loan-calculator-field-calculate").click();
  // straight after the action
  await requestOneKPromise;
});

test("login popup has default state", async ({ page }) => {
  await page.goto(SMALL_LOAN_URL);

  await page.getByTestId("id-small-loan-calculator-field-calculate").click();
  await page.getByTestId("id-small-loan-calculator-field-apply").click();

  // (1) check username / password >> visible
  await expect(page.getByTestId("login-popup-username-input")).toBeVisible();
  await expect(page.getByTestId("login-popup-password-input")).toBeVisible();
  await expect(page.getByTestId("login-popup-continue-button")).toBeDisabled();

  // (2) click smart id and check smart id field
  await page.getByTestId("login-popup-tab-smart-id").click();
  await expect(page.getByTestId("login-popup-personal-code-input")).toBeVisible();
  await expect(page.getByTestId("login-popup-continue-button")).toBeDisabled();
});

test("full flow: loan details > income > decision", async ({ page }) => {
  await page.goto(SMALL_LOAN_URL);

  // calculator
  await page.getByTestId("id-small-loan-calculator-field-amount").fill("6000");
  await page.getByTestId("ib-small-loan-calculator-field-period").selectOption("24");
  await page.getByTestId("id-small-loan-calculator-field-calculate").click();
  await page.getByTestId("id-small-loan-calculator-field-apply").click();

  // login
  await page.getByTestId("login-popup-username-input").fill(USERNAME);
  await page.getByTestId("login-popup-password-input").fill(PASSWORD);
  await page.getByTestId("login-popup-continue-button").click();

  // loan details: values come from the calculator
  await expect(page.getByTestId("final-page-amount")).toHaveText("6000 €");
  await expect(page.getByTestId("final-page-monthly-payment")).toHaveText(/^\d+(\.\d+)? €$/);
  await expect(page.getByTestId("final-page-period")).toHaveText("24 months");
  await page.getByTestId("final-page-continue-button").click();

  // income
  await expect(page.getByTestId("income-page-submit-button")).toBeDisabled();
  await page.getByTestId("income-page-input").fill("6000");
  await expect(page.getByTestId("income-page-submit-button")).toBeEnabled();
  await page.getByTestId("income-page-submit-button").click();

  // decision
  await expect(page.getByTestId("decision-page-ok-button")).toBeVisible();
});
