# Small Loan – Checklist and Test Cases

## Sources

| Source                                                                                                                                    | What it defines                                                                                                 |
| ----------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Swagger `GET /api/loan-calc` ([backend.tallinn-learning.ee](https://backend.tallinn-learning.ee/swagger-ui/index.html#/Loan%20endpoints)) | Amount 500–10000, period 12–36 months, response `paymentAmountMonthly`, 400 with `ErrorMessage { id, message }` |
| App JavaScript bundle (`/assets/index-*.js`)                                                                                              | Endpoints called by the UI and the decision request payload                                                     |
| Observed in the app (Nov 2026)                                                                                                            | UI flow, test ids, period options 12–36 in steps of 4, `/api/decisions` request with `income`                   |
| Assumption                                                                                                                                | Common UX/security practice where no requirement exists. Failures here are **recommendations**, not bugs        |

**Expected result source** column: `Spec` = Swagger, `Obs` = observed behaviour, `Assum` = assumption.

**Type**: `Auto` = automated (or to automate), `Manual` = manual check, `Explo` = exploratory session.

**Status**: Passed / Failed / Blocked / Skipped / _To do_.

## Checklist

### Calculator

| ID      | Check                                                                                                   | Source           | Priority | Type   | Covered by                                         | Status                  |
| ------- | ------------------------------------------------------------------------------------------------------- | ---------------- | -------- | ------ | -------------------------------------------------- | ----------------------- |
| CALC-01 | Default state: amount 500, period 12, Calculate enabled, Apply Now disabled                             | Obs              | High     | Auto   | calculator: default state                          | Passed                  |
| CALC-02 | Valid boundaries 500 and 10000 return a monthly payment                                                 | Spec             | High     | Auto   | calculator: valid amount                           | Passed                  |
| CALC-03 | Invalid boundaries 499 and 10001 show an error and keep Apply Now disabled                              | Spec             | High     | Auto   | calculator: invalid amount                         | Passed                  |
| CALC-04 | Invalid amount (empty, 0, negative, decimal, letters) shows an error                                    | Spec             | Medium   | Auto   |                                                    | To do                   |
| CALC-05 | Period dropdown offers 12–36 in steps of 4 and nothing outside the range                                | Spec + Obs       | Medium   | Auto   |                                                    | To do                   |
| CALC-06 | Amount input and slider stay in sync both ways                                                          | Obs              | Medium   | Auto   |                                                    | To do                   |
| CALC-07 | Period dropdown and slider stay in sync both ways                                                       | Obs              | Medium   | Auto   |                                                    | To do                   |
| CALC-08 | Calculate sends `amount` and `period` in the request and enables Apply Now                              | Spec             | High     | Auto   | calculator: request                                | Passed                  |
| CALC-09 | Monthly payment shown is the one returned by the API                                                    | Spec             | High     | Auto   | calculator: mocked payment                         | Passed                  |
| CALC-10 | Changing amount or period after calculating clears the payment or disables Apply Now until recalculated | Assum            | High     | Auto   | calculator: change amount/period after calculating | Passed                  |
| CALC-11 | API 500: generic error, no internal details, Apply Now disabled                                         | Assum (security) | High     | Auto   | calculator: server error                           | Passed                  |
| CALC-12 | API 400: error message is shown to the user                                                             | Spec             | Medium   | Auto   |                                                    | To do                   |
| CALC-13 | Payment format: "42.8 €" vs "42.80 €"                                                                   | Assum            | Low      | Manual |                                                    | To do                   |
| CALC-14 | Image button scrolls back to the calculator                                                             | Obs              | Low      | Auto   | calculator: image button                           | Passed                  |
| CALC-15 | Payment calculation is correct (interest formula)                                                       | —                | —        | —      |                                                    | Skipped: no requirement |

### Login popup

| ID       | Check                                                                          | Source           | Priority | Type  | Covered by               | Status |
| -------- | ------------------------------------------------------------------------------ | ---------------- | -------- | ----- | ------------------------ | ------ |
| LOGIN-01 | Default state: password tab, fields visible, Continue disabled                 | Obs              | Medium   | Auto  | login: default state     | Passed |
| LOGIN-02 | Continue is enabled only when username and password are filled                 | Assum            | Medium   | Auto  |                          | To do  |
| LOGIN-03 | Valid username/password opens Loan Details                                     | Obs              | High     | Auto  | loan-flow: full flow     | Passed |
| LOGIN-04 | Wrong username, wrong password or both show the same generic error             | Assum (security) | High     | Auto  | login: wrong credentials | Passed |
| LOGIN-05 | Password field is masked                                                       | Assum (security) | Medium   | Auto  |                          | To do  |
| LOGIN-06 | Valid Smart-ID code opens Loan Details                                         | Obs              | High     | Auto  | login: Smart-ID          | Passed |
| LOGIN-07 | Invalid Smart-ID code (letters, too short) is rejected                         | Assum            | Medium   | Auto  |                          | To do  |
| LOGIN-08 | Closing the popup keeps the calculator values                                  | Obs              | Low      | Auto  |                          | To do  |
| LOGIN-09 | Repeated failed logins: lockout or rate limit (behaviour only, no brute force) | Assum (security) | Medium   | Explo |                          | To do  |

### Loan Details

| ID     | Check                                                                         | Source | Priority | Type   | Covered by           | Status |
| ------ | ----------------------------------------------------------------------------- | ------ | -------- | ------ | -------------------- | ------ |
| DET-01 | Amount, monthly payment and period match the calculator                       | Obs    | High     | Auto   | loan-flow: full flow | Passed |
| DET-02 | "Your information" shows the logged-in user's data and communication language | Obs    | Low      | Manual |                      | To do  |
| DET-03 | Back returns to the calculator with the values kept                           | Obs    | Medium   | Auto   |                      | To do  |
| DET-04 | Apply Now after Back asks for login again: intended or session bug?           | Obs    | Medium   | Explo  |                      | To do  |

### Income

| ID     | Check                                                                 | Source | Priority | Type | Covered by                   | Status         |
| ------ | --------------------------------------------------------------------- | ------ | -------- | ---- | ---------------------------- | -------------- |
| INC-01 | Get decision is disabled with an empty field and enabled with a value | Obs    | Medium   | Auto | loan-flow: full flow         | Passed         |
| INC-02 | Invalid income (0, negative, letters, decimals) is rejected           | Assum  | High     | Auto | loan-flow: income validation | Failed: BUG-01 |
| INC-03 | The request sends the income typed by the user                        | Obs    | High     | Auto | loan-flow: negative decision | Passed         |

### Decision

| ID     | Check                                                                                                | Source           | Priority | Type       | Covered by                            | Status                  |
| ------ | ---------------------------------------------------------------------------------------------------- | ---------------- | -------- | ---------- | ------------------------------------- | ----------------------- |
| DEC-01 | Approved: title "Loan approved!" and approved icon                                                   | Obs              | High     | Auto       | loan-flow: positive decision          | Passed                  |
| DEC-02 | Declined: title "Loan declined" and declined icon                                                    | Obs              | High     | Auto       | loan-flow: negative decision          | Passed                  |
| DEC-03 | Blacklisted Smart-ID is declined even with high income                                               | Obs              | High     | Auto       | loan-flow: blacklisted Smart-ID       | Passed                  |
| DEC-04 | API 500: generic error and Try again, no internal details                                            | Assum (security) | High     | Auto       | loan-flow: server error               | Passed                  |
| DEC-05 | Try again after an error shows the decision                                                          | Obs              | Medium   | Auto       | loan-flow: retry                      | Passed                  |
| DEC-06 | OK button: where it goes and whether the flow is reset                                               | Obs              | Medium   | Auto       |                                       | To do                   |
| DEC-07 | Decision rule boundaries (income threshold)                                                          | —                | —        | —          |                                       | Skipped: no requirement |
| DEC-08 | The backend recalculates the monthly payment instead of trusting `monthlyPayment` sent by the client | Assum (security) | High     | Auto (API) | loan-flow: decision request tampering | Failed: BUG-02          |

### Cross-cutting

| ID     | Check                                                                               | Source           | Priority | Type       | Covered by                             | Status                                |
| ------ | ----------------------------------------------------------------------------------- | ---------------- | -------- | ---------- | -------------------------------------- | ------------------------------------- |
| GEN-01 | API `/api/loan-calc` returns 400 with `ErrorMessage` for amount/period out of range | Spec             | High     | Auto (API) | api: loan-calc-api                     | Passed (status); body Failed: FIND-02 |
| GEN-02 | Language switch EN ↔ ET translates the whole page                                   | Obs              | Low      | Auto       |                                        | To do                                 |
| GEN-03 | Reloading mid-flow (Loan Details, Income)                                           | Assum            | Medium   | Explo      |                                        | To do                                 |
| GEN-04 | Later steps cannot be opened by URL without login                                   | Assum (security) | High     | Explo      | access: open later steps without login | Passed                                |
| GEN-05 | No credentials or personal data in URLs or query strings                            | Assum (security) | High     | Manual     |                                        | To do                                 |
| GEN-06 | Mobile viewport and keyboard-only navigation                                        | Assum            | Low      | Manual     |                                        | To do                                 |
| GEN-07 | Endpoints used by the UI match the Swagger documentation                            | Spec             | Medium   | Manual     |                                        | Failed: FIND-01                       |

## Test cases (complex flows)

### TC-01 Full flow with password login – approved

**Precondition:** valid test user.

| #   | Step                                           | Expected result                                      |
| --- | ---------------------------------------------- | ---------------------------------------------------- |
| 1   | Set amount 6000, period 24, click Calculate    | Monthly payment is shown, Apply Now enabled          |
| 2   | Click Apply Now, log in with valid credentials | Loan Details shows 6000 €, the payment and 24 months |
| 3   | Click Continue, enter income 6000              | Get decision becomes enabled                         |
| 4   | Click Get decision                             | "Loan approved!" and approved icon                   |

Automated: `loan-flow: full flow with real backend`.

### TC-02 Blacklisted Smart-ID – always declined

**Precondition:** blacklisted Smart-ID code.

| #   | Step                                             | Expected result                   |
| --- | ------------------------------------------------ | --------------------------------- |
| 1   | Click Calculate, then Apply Now                  | Login popup opens                 |
| 2   | Log in with Smart-ID using the blacklisted code  | Loan Details opens                |
| 3   | Continue, enter income 10000, click Get decision | "Loan declined" and declined icon |

Automated: `loan-flow: blacklisted Smart-ID`.

### TC-03 Back from Loan Details

| #   | Step                                          | Expected result                                                  |
| --- | --------------------------------------------- | ---------------------------------------------------------------- |
| 1   | Calculate with amount 7000, period 24, log in | Loan Details shows the values                                    |
| 2   | Click Back                                    | Calculator keeps 7000 and 24                                     |
| 3   | Click Apply Now                               | To clarify: login popup again, or Loan Details directly (DET-04) |

### TC-04 Decision server error and retry

| #   | Step                                           | Expected result                                                                             |
| --- | ---------------------------------------------- | ------------------------------------------------------------------------------------------- |
| 1   | Reach the income page and enter a valid income | Get decision enabled                                                                        |
| 2   | Click Get decision while the API returns 500   | "Could not save your decision. Please try again." and Try again button, no internal details |
| 3   | Click Try again with the API working           | The decision is shown                                                                       |

Automated: `loan-flow: server error` and `loan-flow: retry` (mocked).

### TC-05 Values changed after calculation

| #   | Step                                        | Expected result                                          |
| --- | ------------------------------------------- | -------------------------------------------------------- |
| 1   | Click Calculate with the defaults           | 42.8 € shown, Apply Now enabled                          |
| 2   | Change amount to 2000 without recalculating | Payment cleared or Apply Now disabled (CALC-10)          |
| 3   | Click Apply Now if enabled and log in       | Loan Details must not show 2000 € with the 500 € payment |

## Bug reports

Environment for all reports: https://loan-decision.tl-academy.ee/small-loan and https://backend.tallinn-learning.ee, Chromium (Playwright 1.65), November 2026.

### BUG-01 Decimal income on the Income page is multiplied by 100 when a decimal separator is typed

| Field               | Content                                                                                                                                    |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Steps to reproduce  | 1. Calculate a loan and click Apply Now. 2. Log in and click Continue on Loan Details. 3. Type `1500.50` (or `1500,50`) in Monthly income. |
| Actual result       | The field shows `150050`. The separator is removed and the decision is requested with an income 100 times higher.                          |
| Expected result     | The income is accepted as 1500.50, or decimals are rejected with a message. The value is never changed silently.                           |
| Severity / Priority | Major / High: a loan can be approved on an income the user does not have.                                                                  |
| Test                | `loan-flow: income validation > decimal income` (`test.fail`)                                                                              |

### BUG-02 Decision API approves a loan when the client sends a lower monthlyPayment than calculated

| Field               | Content                                                                                                                                                                                      |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Steps to reproduce  | 1. Calculate amount 10000, period 12, log in, enter income 1000. 2. Intercept `POST /api/decisions` and change `monthlyPayment` to `10`, keeping `amount` and `period`. 3. Send the request. |
| Actual result       | "Loan approved!". The same request without the change returns "Loan declined".                                                                                                               |
| Expected result     | The backend calculates the monthly payment from `amount` and `period` (or validates the value sent) and declines the loan.                                                                   |
| Severity / Priority | Critical / High: anyone can get a loan approved by editing one request field.                                                                                                                |
| Test                | `loan-flow: decision request tampering` (control test passes, tampered test `test.fail`)                                                                                                     |

### FIND-01 Decision endpoint used by the UI is not documented in Swagger

| Field               | Content                                                                                                                                                                              |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Type                | Documentation discrepancy                                                                                                                                                            |
| Actual              | The UI sends `POST /api/decisions` to its own host (`loan-decision.tl-academy.ee`) with `{ id, clientId, amount, period, income, monthlyPayment }`. This endpoint is not in Swagger. |
| Expected            | Swagger documents the endpoint the UI uses. Swagger only has `POST /api/loan-calc/decision` (risk model with income, debt, age, employment), which the UI does not call.             |
| Matching part       | `GET /api/loan-calc` matches Swagger (host, parameters `amount`/`period`, response `paymentAmountMonthly`). `POST /api/loan-calc/sign` is not used by the UI.                        |
| Severity / Priority | Minor / Medium                                                                                                                                                                       |

### FIND-02 `GET /api/loan-calc` returns 400 with an empty body

| Field               | Content                                                                                                                 |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Type                | API / documentation discrepancy                                                                                         |
| Steps to reproduce  | `GET https://backend.tallinn-learning.ee/api/loan-calc?amount=499&period=12` (same for amount 10001, period 11 and 37). |
| Actual result       | Status 400 (correct) with an empty body.                                                                                |
| Expected result     | 400 with `ErrorMessage { id, message }`, as documented in Swagger.                                                      |
| Severity / Priority | Minor / Low: the UI shows a generic message, but API clients get no reason.                                             |
| Test                | `api: out of range > 400 body` (`test.fail`)                                                                            |

## Open questions

- No requirement for the decision rule, the interest formula, the payment format or field validation messages. The UI text says a loan is declined when "the monthly payment is too high compared to your income".
- DET-04: is the second login after Back intended?
- DEC-08: the client sends `monthlyPayment` in the decision request. If the backend uses it without recalculating, a modified request could get a loan approved.
