import { test, expect } from "@playwright/test";
import { SmallLoanPage } from "./pages/small-loan-page";
import { IncomePage } from "./pages/income-page";
import { mockDecision, mockDecisionError } from "./mocks/loan-api";
import { USERNAME, PASSWORD, SMART_ID_BLACKLISTED_CODE } from "../config/env-data";

let smallLoanPage: SmallLoanPage;

test.beforeEach(async ({ page }) => {
  smallLoanPage = new SmallLoanPage(page);
  await smallLoanPage.open();
});

// path to the income page for tests that focus on the decision
async function goToIncomePage(): Promise<IncomePage> {
  await smallLoanPage.fillAmount(6000);
  await smallLoanPage.selectPeriod(24);
  await smallLoanPage.calculate();
  const loginPopup = await smallLoanPage.apply();
  const loanDetailsPage = await loginPopup.signIn(USERNAME, PASSWORD);
  return loanDetailsPage.continue();
}

test("full flow with real backend > loan approved", async () => {
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
  await expect(decisionPage.title).toHaveText("Loan approved!");
  await expect(decisionPage.okButton).toBeVisible();
});

test("blacklisted smart id > loan declined even with high income", async () => {
  await smallLoanPage.calculate();
  const loginPopup = await smallLoanPage.apply();
  const loanDetailsPage = await loginPopup.signInWithSmartId(SMART_ID_BLACKLISTED_CODE);
  const incomePage = await loanDetailsPage.continue();
  await incomePage.fillIncome(10000);

  const decisionPage = await incomePage.getDecision();

  await expect(decisionPage.title).toHaveText("Loan declined");
  await expect(decisionPage.declinedIcon).toBeVisible();
});

test.describe("decision with mocked backend", () => {
  test("positive decision > loan approved is shown", async ({ page }) => {
    await mockDecision(page, { approved: true });
    const incomePage = await goToIncomePage();
    await incomePage.fillIncome(6000);

    const decisionPage = await incomePage.getDecision();

    await expect(decisionPage.title).toHaveText("Loan approved!");
    await expect(decisionPage.approvedIcon).toBeVisible();
  });

  test("negative decision > loan declined is shown", async ({ page }) => {
    await mockDecision(page, { approved: false, reason: "insufficient_income" });
    const incomePage = await goToIncomePage();
    await incomePage.fillIncome(500);

    // the frontend sends the income typed by the user
    const decisionRequest = page.waitForRequest("**/api/decisions");
    const decisionPage = await incomePage.getDecision();
    expect((await decisionRequest).postDataJSON()).toMatchObject({ income: 500 });

    await expect(decisionPage.title).toHaveText("Loan declined");
    await expect(decisionPage.declinedIcon).toBeVisible();
  });

  test("server error > generic error and retry button, no internal details", async ({ page }) => {
    await mockDecisionError(page, 500);
    const incomePage = await goToIncomePage();
    await incomePage.fillIncome(6000);

    const decisionPage = await incomePage.getDecision();

    await expect(decisionPage.errorMessage).toBeVisible();
    await expect(decisionPage.retryButton).toBeVisible();
    await expect(decisionPage.container).not.toContainText("NullPointerException");
  });

  test("server error once > try again > decision from real backend is shown", async ({ page }) => {
    // only the first request fails; the retry reaches the real backend
    await mockDecisionError(page, 500, 1);
    const incomePage = await goToIncomePage();
    await incomePage.fillIncome(6000);

    const decisionPage = await incomePage.getDecision();
    await decisionPage.retry();

    await expect(decisionPage.title).toHaveText("Loan approved!");
  });
});
