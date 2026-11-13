# Loan Service App – Test Automation

End-to-end tests for the Small Loan (https://loan-decision.tl-academy.ee/small-loan) application, built with Playwright and TypeScript for the Tallinn Learning School QA Automation course (lesson 19).

The project is intended for learning and practicing:

- The Page Object Model (POM): one class per screen, holding its locators and actions.
- Writing End-to-End (E2E) tests for a multi-step flow.
- Waiting for network requests triggered by UI actions.
- Mocking backend responses to test states the real backend cannot produce on demand.
- Managing credentials with env files and GitHub Actions secrets.

## Configuration Instructions

### Step 1: Install dependencies

```bash
npm install
npx playwright install chromium
```

### Step 2: Create the env file

Copy the provided `env/dev.env.example` file to `env/dev.env` (keep the example file as a reference):

```bash
cp env/dev.env.example env/dev.env
```

### Step 3: Fill in the values

Open `env/dev.env` and fill in the following fields:

- `URL`: The Small Loan page URL.
- `TEST_USERNAME`: The username for the service.
- `TEST_PASSWORD`: The password for the service.
- `TEST_SMART_ID_CODE`: A Smart-ID personal code that is accepted.
- `TEST_SMART_ID_BLACKLISTED_CODE`: A Smart-ID personal code that is always declined.

Example:

```
URL=https://example.com/small-loan
TEST_USERNAME=myUsername
TEST_PASSWORD=myPassword
TEST_SMART_ID_CODE=00000000000
TEST_SMART_ID_BLACKLISTED_CODE=00000000000
```

`env/dev.env` is listed in `.gitignore` and must never be committed.

`config/env-data.ts` loads `env/dev.env` when running locally and checks that every required variable is set. If one is missing, the run stops with `Missing required environment variable: <NAME>`.

## Running the tests

```bash
npm test                   # run all tests
npx playwright test --ui   # interactive UI mode
npx playwright show-report # open the last HTML report
```

## Scripts

| Script                    | Description                                     |
| ------------------------- | ----------------------------------------------- |
| `npm test`                | Runs the Playwright tests.                      |
| `npm run typecheck`       | Checks TypeScript types without emitting files. |
| `npm run prettier:format` | Formats the code with Prettier.                 |
| `npm run prettier:check`  | Checks formatting without changing files.       |

## Project structure

```
config/
  env-data.ts              # loads and validates environment variables
env/
  dev.env.example          # template for the local env file
tests/
  pages/                   # page objects
    small-loan-page.ts     # calculator
    login-popup.ts         # username/password and Smart-ID login
    loan-details-page.ts   # loan summary after login
    income-page.ts         # monthly income form
    decision-page.ts       # loan decision
  mocks/
    loan-api.ts            # mocked responses for /api/loan-calc and /api/decisions
  calculator.spec.ts       # calculator: default state, request, slider, mocked responses
  login.spec.ts            # login popup
  loan-flow.spec.ts        # end-to-end flow and mocked decisions
```

## Page Object Model

Each page object holds the locators and actions of one screen. Assertions stay in the tests.

Navigation methods return the next page object, so a flow reads as a chain:

```ts
const loginPopup = await smallLoanPage.apply();
const loanDetailsPage = await loginPopup.signIn(USERNAME, PASSWORD);
const incomePage = await loanDetailsPage.continue();
const decisionPage = await incomePage.getDecision();
```

## Mocks

Mocks replace a backend response with a fixed one, so the tests can check UI states that the real backend cannot produce on demand (a declined loan, a server error).

- Mocks live in `tests/mocks/`, not in the page objects: a page object models a screen, a mock models the backend.
- A mock is registered **before** the action that sends the request.
- Mocked responses keep the shape of the real API response.
- Error mocks include fake internal details (a stack trace line) and the tests check that the UI does **not** show them.
- A mocked test only checks what the mock controls. The real flow is covered once by the end-to-end test.

## Test coverage

| Spec       | Test                                  | What it checks                                                                                   |
| ---------- | ------------------------------------- | ------------------------------------------------------------------------------------------------ |
| calculator | Default state                         | Amount 500, period 12, Calculate enabled, Apply Now disabled.                                    |
| calculator | Image button                          | The image button scrolls the page back to the calculator.                                        |
| calculator | Calculate request                     | Calculate sends the amount and period in the request and enables Apply Now.                      |
| calculator | Amount slider                         | Clicking the middle of the slider increases the amount above the default.                        |
| calculator | Mocked monthly payment                | The monthly payment returned by the backend is shown.                                            |
| calculator | Calculation server error (mocked 500) | A generic error is shown, internal details are not exposed, Apply Now stays disabled.            |
| login      | Popup default state                   | Username/password fields visible, Smart-ID tab shows the personal code field, Continue disabled. |
| login      | Smart-ID login                        | A valid Smart-ID code reaches Loan Details with the calculator values.                           |
| loan-flow  | Full flow with real backend           | Calculator → login → loan details → income → loan approved.                                      |
| loan-flow  | Blacklisted Smart-ID (real backend)   | The blacklisted code is declined even with a high income.                                        |
| loan-flow  | Negative decision (mocked)            | The income is sent in the request; "Loan declined" and the declined icon are shown.              |
| loan-flow  | Positive decision (mocked)            | "Loan approved!" and the approved icon are shown.                                                |
| loan-flow  | Decision server error (mocked 500)    | A generic error and the Try again button are shown; internal details are not exposed.            |
| loan-flow  | Retry after server error              | The first request fails, Try again reaches the real backend and the decision is shown.           |

## Continuous Integration

GitHub Actions (`.github/workflows/playwright.yml`) runs on every push and pull request to `main`:

1. `npm ci`
2. TypeScript check
3. Prettier check
4. Install Chromium
5. Run the Playwright tests
6. Upload the HTML report as an artifact

### Secrets

In CI there is no `env/dev.env` file. The variables come from repository secrets, under **Settings → Secrets and variables → Actions**:

- `URL`
- `TEST_USERNAME`
- `TEST_PASSWORD`
- `TEST_SMART_ID_CODE`
- `TEST_SMART_ID_BLACKLISTED_CODE`

## Known issues

- The period dropdown uses the test id `ib-small-loan-calculator-field-period`, while every other calculator element uses the `id-` prefix. It is probably a typo in the application; the tests use the id as it is.

## Useful commands

### Find test ids with codegen

```bash
npx playwright codegen https://loan-decision.tl-academy.ee/small-loan
```

Opens a browser and the Playwright Inspector. Every action in the browser generates its code line with the element's `getByTestId`. The **Assert visibility** and **Assert text** buttons generate `expect` lines when you click an element.

### How this project was created

For reference only. Do not run these commands on a cloned copy.

```bash
npm init playwright@latest
npm install --save-dev typescript prettier dotenv
npx tsc --init
echo '{ "printWidth": 100 }' > .prettierrc
```

`tsconfig.json` was adjusted afterwards: `include` points to `tests`, `config` and `playwright.config.ts`, and `noEmit` is enabled.
