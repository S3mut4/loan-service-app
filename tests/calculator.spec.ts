import { test, expect } from "@playwright/test";
import { SmallLoanPage } from "./pages/small-loan-page";
import { mockLoanCalc, mockLoanCalcError } from "./mocks/loan-api";

let smallLoanPage: SmallLoanPage;

test.beforeEach(async ({ page }) => {
  smallLoanPage = new SmallLoanPage(page);
  await smallLoanPage.open();
});

test("default state > amount 500, period 12, apply disabled", async () => {
  await expect(smallLoanPage.amountField).toHaveValue("500");
  await expect(smallLoanPage.periodSelect).toHaveValue("12");
  await expect(smallLoanPage.calculateButton).toBeEnabled();
  await expect(smallLoanPage.applyButton).toBeDisabled();
});

test("image button > scrolls back to the calculator", async () => {
  await smallLoanPage.scrollToImageButton();
  await expect(smallLoanPage.calculateButton).not.toBeInViewport();

  await smallLoanPage.clickImageButton();
  await expect(smallLoanPage.calculateButton).toBeInViewport();
});

test("calculate > request with amount and period is sent > apply enabled", async ({ page }) => {
  await smallLoanPage.fillAmount(1000);
  await smallLoanPage.selectPeriod(24);

  // the listener must exist before the action
  const calcRequest = page.waitForRequest("**/api/loan-calc?amount=1000&period=24");
  await smallLoanPage.calculate();
  await calcRequest;

  await expect(smallLoanPage.applyButton).toBeEnabled();
});

test("click middle of amount slider > amount greater than default", async () => {
  await expect(smallLoanPage.amountField).toHaveValue("500");

  await smallLoanPage.clickAmountSliderCenter();

  // retries until the input is updated
  await expect
    .poll(async () => Number(await smallLoanPage.amountField.inputValue()))
    .toBeGreaterThan(500);
});

test.describe("mocked backend", () => {
  test("calculate > mocked monthly payment is shown", async ({ page }) => {
    await mockLoanCalc(page, 34.56);

    await smallLoanPage.calculate();

    await expect(smallLoanPage.monthlyPayment).toContainText("34.56");
  });

  test("calculate with server error > generic error, no internal details, apply disabled", async ({
    page,
  }) => {
    await mockLoanCalcError(page, 500);

    await smallLoanPage.calculate();

    await expect(smallLoanPage.calculationError).toBeVisible();
    await expect(smallLoanPage.calculationError).not.toContainText("NullPointerException");
    await expect(smallLoanPage.applyButton).toBeDisabled();
  });
});
