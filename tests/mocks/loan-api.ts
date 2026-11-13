import { Page } from "@playwright/test";

// fake internal details: the UI must never show them to the user
const INTERNAL_ERROR_BODY = JSON.stringify({
  error: "NullPointerException at LoanCalcService.java:42",
});

const isLoanCalc = (url: URL) => url.pathname === "/api/loan-calc";
const isDecisions = (url: URL) => url.pathname === "/api/decisions";

export async function mockLoanCalc(page: Page, paymentAmountMonthly: number) {
  await page.route(isLoanCalc, (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ paymentAmountMonthly }),
    }),
  );
}

export async function mockLoanCalcError(page: Page, status: number) {
  await page.route(isLoanCalc, (route) =>
    route.fulfill({ status, contentType: "application/json", body: INTERNAL_ERROR_BODY }),
  );
}

type DecisionMock = { approved: boolean; reason?: string | null };

export async function mockDecision(page: Page, { approved, reason = null }: DecisionMock) {
  await page.route(isDecisions, (route) => {
    // only the POST that creates the decision is mocked
    if (route.request().method() !== "POST") return route.fallback();

    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        id: "3fd7d7db-870f-412e-8656-600767f58bb7",
        approved,
        reason,
        createdAt: "2026-11-13T07:23:04.277Z",
      }),
    });
  });
}

// times: how many requests fail before the real backend answers again
export async function mockDecisionError(page: Page, status: number, times?: number) {
  await page.route(
    isDecisions,
    (route) =>
      route.fulfill({ status, contentType: "application/json", body: INTERNAL_ERROR_BODY }),
    { times },
  );
}

// lets the real request through, but changes the monthly payment sent by the client
export async function tamperDecisionPayment(page: Page, monthlyPayment: number) {
  await page.route(isDecisions, (route) => {
    if (route.request().method() !== "POST") return route.fallback();

    const body = route.request().postDataJSON();
    return route.continue({ postData: JSON.stringify({ ...body, monthlyPayment }) });
  });
}
