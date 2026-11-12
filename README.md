# Loan Service App – Test Automation

End-to-end tests for the Small Loan (https://loan-decision.tl-academy.ee/small-loan) application, built with Playwright and TypeScript for the Tallinn Learning School QA Automation course (lesson 19).

The project is intended for learning and practicing:

- The Page Object Model (POM): one class per screen, holding its locators and actions.
- Writing End-to-End (E2E) tests for a multi-step flow.
- Waiting for network requests triggered by UI actions.
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

| Script | Description |
|---|---|
| `npm test` | Runs the Playwright tests. |
| `npm run typecheck` | Checks TypeScript types without emitting files. |
| `npm run prettier:format` | Formats the code with Prettier. |
| `npm run prettier:check` | Checks formatting without changing files. |

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
  small-loan-pom.spec.ts   # tests using the page objects
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

## Test coverage

| Test                                        | What it checks                                                                                                  |
|---------------------------------------------|-----------------------------------------------------------------------------------------------------------------|
| App has default state                       | Calculate is enabled and Apply Now is disabled on page load.                                                    |
| Image button scrolls back to the calculator | The calculator is out of view after scrolling down, and back in view after clicking the image button.           |
| Login popup has default state               | Username/password fields are visible, Continue is disabled, and the Smart-ID tab shows the personal code field. |
| Full flow                                   | Calculator → login → loan details (amount, payment, period) → income → positive decision.                       |

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