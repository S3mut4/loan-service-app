import { test as base } from "@playwright/test";
import { SmallLoanPage } from "./pages/small-loan-page";
import { LoanDetailsPage } from "./pages/loan-details-page";
import { IncomePage } from "./pages/income-page";
import { USERNAME, PASSWORD } from "../config/env-data";

type Fixtures = {
  smallLoanPage: SmallLoanPage;
  loanDetailsPage: LoanDetailsPage;
  incomePage: IncomePage;
};

export const test = base.extend<Fixtures>({
  // opens the calculator; only runs for tests that ask for smallLoanPage
  smallLoanPage: async ({ page }, use) => {
    const smallLoanPage = new SmallLoanPage(page);
    await smallLoanPage.open();
    await use(smallLoanPage);
  },

  // calculator with 6000 € / 24 months, then password login
  loanDetailsPage: async ({ smallLoanPage }, use) => {
    await smallLoanPage.fillAmount(6000);
    await smallLoanPage.selectPeriod(24);
    await smallLoanPage.calculate();
    const loginPopup = await smallLoanPage.apply();
    await use(await loginPopup.signIn(USERNAME, PASSWORD));
  },

  // loan details > Continue
  incomePage: async ({ loanDetailsPage }, use) => {
    await use(await loanDetailsPage.continue());
  },
});

export { expect } from "@playwright/test";
