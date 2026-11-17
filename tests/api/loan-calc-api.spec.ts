import { test, expect } from "@playwright/test";

// documented in Swagger: amount 500-10000, period 12-36
const LOAN_CALC_URL = "https://backend.tallinn-learning.ee/api/loan-calc";

test("valid amount and period > 200 with monthly payment", async ({ request }) => {
  const response = await request.get(LOAN_CALC_URL, { params: { amount: 500, period: 12 } });

  expect(response.status()).toBe(200);
  expect(await response.json()).toHaveProperty("paymentAmountMonthly");
});

const outOfRange = [
  { amount: 499, period: 12 },
  { amount: 10001, period: 12 },
  { amount: 500, period: 11 },
  { amount: 500, period: 37 },
];

for (const params of outOfRange) {
  test(`amount ${params.amount}, period ${params.period} > 400`, async ({ request }) => {
    const response = await request.get(LOAN_CALC_URL, { params });

    expect(response.status()).toBe(400);
  });
}

test("out of range > 400 body has the documented error message", async ({ request }) => {
  test.fail(true, "FIND-02: the 400 body is empty; Swagger documents ErrorMessage { id, message }");
  const response = await request.get(LOAN_CALC_URL, { params: { amount: 499, period: 12 } });

  // text() instead of json(): an empty body must fail the assertion, not the parsing
  expect(await response.text()).toContain('"message"');
});
