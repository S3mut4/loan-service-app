import { test, expect } from "./fixtures";
import { SmallLoanPage } from "./pages/small-loan-page";
import { SMALL_LOAN_URL } from "../config/env-data";

// later steps of the flow must not open without login
// no smallLoanPage fixture here: it would open the calculator first
for (const path of ["/loan-decision", "/income", "/decision"]) {
  test(`open ${path} without login > back on the calculator`, async ({ page }) => {
    const smallLoanPage = new SmallLoanPage(page);

    await page.goto(new URL(path, SMALL_LOAN_URL).toString());

    await expect(page).toHaveURL(/\/small-loan$/);
    await expect(smallLoanPage.calculateButton).toBeVisible();
  });
}
