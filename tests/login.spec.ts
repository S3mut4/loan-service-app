import { test, expect } from "@playwright/test";
import { SmallLoanPage } from "./pages/small-loan-page";
import { USERNAME, PASSWORD, SMART_ID_CODE } from "../config/env-data";

let smallLoanPage: SmallLoanPage;

test.beforeEach(async ({ page }) => {
  smallLoanPage = new SmallLoanPage(page);
  await smallLoanPage.open();
});

test("login popup > default state for password and smart id tabs", async () => {
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

test("smart id login > loan details show the calculator values", async () => {
  await smallLoanPage.calculate();
  const loginPopup = await smallLoanPage.apply();

  const loanDetailsPage = await loginPopup.signInWithSmartId(SMART_ID_CODE);

  await expect(loanDetailsPage.amount).toHaveText("500 €");
  await expect(loanDetailsPage.period).toHaveText("12 months");
});

const wrongCredentials = [
  { description: "wrong username", username: "nobody", password: PASSWORD },
  { description: "wrong password", username: USERNAME, password: "wrong-password" },
  { description: "both wrong", username: "nobody", password: "wrong-password" },
];

for (const { description, username, password } of wrongCredentials) {
  // the same message for every case: it must not reveal which field is wrong
  test(`login with ${description} > generic error, no loan details`, async () => {
    await smallLoanPage.calculate();
    const loginPopup = await smallLoanPage.apply();

    const loanDetailsPage = await loginPopup.signIn(username, password);

    await expect(loginPopup.passwordError).toHaveText("Incorrect username or password");
    await expect(loanDetailsPage.amount).not.toBeVisible();
  });
}
