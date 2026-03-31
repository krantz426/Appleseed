import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/client";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import type Stripe from "stripe";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createAdminSupabaseClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const contributionId = session.metadata?.contribution_id;

      if (!contributionId) {
        console.error("No contribution_id in session metadata");
        break;
      }

      // Idempotency: check if already completed
      const { data: existing } = await supabase
        .from("contributions")
        .select("status")
        .eq("id", contributionId)
        .single();

      if (existing?.status === "completed") {
        break; // Already processed
      }

      await supabase
        .from("contributions")
        .update({
          status: "completed",
          stripe_payment_intent_id:
            typeof session.payment_intent === "string"
              ? session.payment_intent
              : session.payment_intent?.id || null,
          stripe_checkout_session_id: session.id,
        })
        .eq("id", contributionId);

      break;
    }

    case "charge.refunded": {
      const charge = event.data.object as Stripe.Charge;
      const paymentIntentId =
        typeof charge.payment_intent === "string"
          ? charge.payment_intent
          : charge.payment_intent?.id;

      if (paymentIntentId) {
        await supabase
          .from("contributions")
          .update({ status: "refunded" })
          .eq("stripe_payment_intent_id", paymentIntentId);
      }
      break;
    }

    case "checkout.session.expired": {
      const session = event.data.object as Stripe.Checkout.Session;
      const contributionId = session.metadata?.contribution_id;

      if (contributionId) {
        await supabase
          .from("contributions")
          .update({ status: "failed" })
          .eq("id", contributionId)
          .eq("status", "pending");
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
