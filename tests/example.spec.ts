import { test, expect } from "@playwright/test";

const SMALL_LOAN_URL = "https://loan-decision.tl-academy.ee/small-loan";

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
