import Stripe from "stripe";
import { stripe } from "./client";
import { createAdminSupabaseClient } from "../supabase/admin";

function getWebhookSecret(): string {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error(
      "Missing STRIPE_WEBHOOK_SECRET environment variable. " +
        "Add it to your .env.local file."
    );
  }
  return secret;
}

/**
 * Verifies and handles incoming Stripe webhook events.
 * Uses the admin Supabase client to bypass RLS.
 */
export async function handleStripeWebhook(
  rawBody: string | Buffer,
  signature: string
): Promise<{ received: true }> {
  const event = stripe.webhooks.constructEvent(
    rawBody,
    signature,
    getWebhookSecret()
  );

  const supabase = createAdminSupabaseClient();

  switch (event.type) {
    case "checkout.session.completed": {
      await handleCheckoutCompleted(supabase, event.data.object);
      break;
    }
    case "charge.refunded": {
      await handleChargeRefunded(supabase, event.data.object);
      break;
    }
    case "checkout.session.expired": {
      await handleCheckoutExpired(supabase, event.data.object);
      break;
    }
    default:
      // Unhandled event type -- no action needed
      break;
  }

  return { received: true };
}

// ---------------------------------------------------------------------------
// Event handlers
// ---------------------------------------------------------------------------

type AdminClient = ReturnType<typeof createAdminSupabaseClient>;

async function handleCheckoutCompleted(
  supabase: AdminClient,
  session: Stripe.Checkout.Session
) {
  const contributionId = session.metadata?.contribution_id;
  const poolId = session.metadata?.pool_id;

  if (!contributionId || !poolId) {
    console.error(
      "checkout.session.completed: missing contribution_id or pool_id in metadata"
    );
    return;
  }

  // Mark the contribution as completed
  const { error: updateError } = await supabase
    .from("contributions")
    .update({
      status: "completed",
      stripe_session_id: session.id,
      stripe_payment_intent_id:
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent?.id ?? null,
      paid_at: new Date().toISOString(),
    })
    .eq("id", contributionId);

  if (updateError) {
    console.error(
      "Failed to update contribution to completed:",
      updateError.message
    );
    return;
  }

  // Recalculate pool totals from all completed contributions
  await recalculatePoolTotals(supabase, poolId);
}

async function handleChargeRefunded(
  supabase: AdminClient,
  charge: Stripe.Charge
) {
  const paymentIntentId =
    typeof charge.payment_intent === "string"
      ? charge.payment_intent
      : charge.payment_intent?.id;

  if (!paymentIntentId) {
    console.error("charge.refunded: missing payment_intent on charge");
    return;
  }

  // Find the contribution by payment intent
  const { data: contribution, error: findError } = await supabase
    .from("contributions")
    .select("id, pool_id")
    .eq("stripe_payment_intent_id", paymentIntentId)
    .single();

  if (findError || !contribution) {
    console.error(
      "charge.refunded: could not find contribution for payment intent:",
      paymentIntentId
    );
    return;
  }

  const { error: updateError } = await supabase
    .from("contributions")
    .update({ status: "refunded" })
    .eq("id", contribution.id);

  if (updateError) {
    console.error(
      "Failed to update contribution to refunded:",
      updateError.message
    );
    return;
  }

  await recalculatePoolTotals(supabase, contribution.pool_id);
}

async function handleCheckoutExpired(
  supabase: AdminClient,
  session: Stripe.Checkout.Session
) {
  const contributionId = session.metadata?.contribution_id;

  if (!contributionId) {
    console.error(
      "checkout.session.expired: missing contribution_id in metadata"
    );
    return;
  }

  const { error: updateError } = await supabase
    .from("contributions")
    .update({ status: "failed" })
    .eq("id", contributionId);

  if (updateError) {
    console.error(
      "Failed to update contribution to failed:",
      updateError.message
    );
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function recalculatePoolTotals(supabase: AdminClient, poolId: string) {
  const { data: contributions, error } = await supabase
    .from("contributions")
    .select("amount_cents, fee_cents")
    .eq("pool_id", poolId)
    .eq("status", "completed");

  if (error) {
    console.error("Failed to fetch contributions for pool totals:", error.message);
    return;
  }

  const totalAmountCents = contributions.reduce(
    (sum, c) => sum + (c.amount_cents ?? 0),
    0
  );
  const totalFeeCents = contributions.reduce(
    (sum, c) => sum + (c.fee_cents ?? 0),
    0
  );
  const contributorCount = contributions.length;

  const { error: poolUpdateError } = await supabase
    .from("pools")
    .update({
      total_amount_cents: totalAmountCents,
      total_fee_cents: totalFeeCents,
      contributor_count: contributorCount,
    })
    .eq("id", poolId);

  if (poolUpdateError) {
    console.error("Failed to update pool totals:", poolUpdateError.message);
  }
}
