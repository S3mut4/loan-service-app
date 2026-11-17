import { test as base } from "@playwright/test";
import { SmallLoanPage } from "./pages/small-loan-page";

type Fixtures = {
  smallLoanPage: SmallLoanPage;
};

export const test = base.extend<Fixtures>({
  // opens the calculator; only runs for tests that ask for smallLoanPage
  smallLoanPage: async ({ page }, use) => {
    const smallLoanPage = new SmallLoanPage(page);
    await smallLoanPage.open();
    await use(smallLoanPage);
  },
});

export { expect } from "@playwright/test";
