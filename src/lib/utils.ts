import { PLATFORM_FEE_PERCENT } from "./constants";

/**
 * Format an amount in cents as a USD string (e.g. 1500 -> "$15.00").
 */
export function formatCents(cents: number): string {
  const dollars = cents / 100;
  return `$${dollars.toFixed(2)}`;
}

/**
 * Calculate the platform fee and total for a given contribution amount.
 */
export function calculateFee(amountCents: number): {
  amount: number;
  fee: number;
  total: number;
} {
  const fee = Math.round(amountCents * (PLATFORM_FEE_PERCENT / 100));
  return {
    amount: amountCents,
    fee,
    total: amountCents + fee,
  };
}

/**
 * Generate a URL-friendly slug from a teacher name and occasion.
 * e.g. ("Ms. Johnson", "End of Year") -> "ms-johnson-end-of-year-a3f"
 */
export function generateSlug(teacherName: string, occasion: string): string {
  const base = `${teacherName} ${occasion}`
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let suffix = "";
  for (let i = 0; i < 3; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }

  return `${base}-${suffix}`;
}
