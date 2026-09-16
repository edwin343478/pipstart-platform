const required = [
  "PIPSTART_E2E_ACCOUNT_EMAIL",
  "PIPSTART_E2E_ACCOUNT_PASSWORD",
];
const missing = required.filter((name) => !process.env[name]?.trim());

if (missing.length > 0) {
  throw new Error(
    `Real account lifecycle gate requires: ${missing.join(", ")}.`,
  );
}

const password = process.env.PIPSTART_E2E_ACCOUNT_PASSWORD;
if (password.length < 8 || password.length > 120) {
  throw new Error(
    "PIPSTART_E2E_ACCOUNT_PASSWORD must contain between 8 and 120 characters.",
  );
}
