import { Resend } from "resend";

function getResendApiKey(): string {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    throw new Error(
      "Missing RESEND_API_KEY environment variable. " +
        "Add it to your .env.local file."
    );
  }
  return key;
}

export const resend = new Resend(getResendApiKey());
