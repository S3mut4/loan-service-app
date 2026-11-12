import dotenv from "dotenv";

if (process.env.CI !== "true") {
  dotenv.config({ path: "env/dev.env" });
  console.log("Running in local environment");
} else {
  console.log("Running in CI environment");
}

const requiredVars = [
  "URL",
  "TEST_USERNAME",
  "TEST_PASSWORD",
  "TEST_SMART_ID_CODE",
  "TEST_SMART_ID_BLACKLISTED_CODE",
];

// Check for missing variables
requiredVars.forEach((varName) => {
  if (!process.env[varName]) {
    throw new Error(`Missing required environment variable: ${varName}`);
  }
});

export const SMALL_LOAN_URL: string = process.env.URL!;
export const USERNAME: string = process.env.TEST_USERNAME!;
export const PASSWORD: string = process.env.TEST_PASSWORD!;
export const SMART_ID_CODE: string = process.env.TEST_SMART_ID_CODE!;
export const SMART_ID_BLACKLISTED_CODE: string = process.env.TEST_SMART_ID_BLACKLISTED_CODE!;
