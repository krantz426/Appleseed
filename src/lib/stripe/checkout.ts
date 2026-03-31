import { stripe } from "./client";

interface CreateCheckoutSessionParams {
  poolId: string;
  poolSlug: string;
  amountCents: number;
  feeCents: number;
  totalCents: number;
  childName: string;
  parentEmail: string;
  parentName: string;
  contributionId: string;
}

/**
 * Creates a Stripe Checkout Session for a pool contribution.
 * Returns the checkout session URL to redirect the user to.
 */
export async function createCheckoutSession(
  params: CreateCheckoutSessionParams
): Promise<string> {
  const {
    poolId,
    poolSlug,
    amountCents,
    feeCents,
    totalCents,
    childName,
    parentEmail,
    parentName,
    contributionId,
  } = params;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: parentEmail,
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `Gift for ${childName}'s teacher`,
            description: `Contribution to teacher appreciation pool`,
          },
          unit_amount: totalCents,
        },
        quantity: 1,
      },
    ],
    metadata: {
      pool_id: poolId,
      pool_slug: poolSlug,
      contribution_id: contributionId,
      amount_cents: String(amountCents),
      fee_cents: String(feeCents),
      total_cents: String(totalCents),
      parent_name: parentName,
      parent_email: parentEmail,
    },
    success_url: `${baseUrl}/p/${poolSlug}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/p/${poolSlug}`,
  });

  if (!session.url) {
    throw new Error("Stripe did not return a checkout session URL.");
  }

  return session.url;
}
