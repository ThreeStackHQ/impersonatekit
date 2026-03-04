import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db, subscriptions, workspaces } from "@impersonatekit/db";
import { eq } from "drizzle-orm";
import type Stripe from "stripe";

export async function POST(request: NextRequest) {
  const rawBody = await request.arrayBuffer();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { status: "fail", message: "Missing signature" },
      { status: 400 },
    );
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      Buffer.from(rawBody),
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err);
    return NextResponse.json(
      { status: "fail", message: "Invalid signature" },
      { status: 400 },
    );
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const workspaceId = session.metadata?.workspaceId;
      if (!workspaceId || !session.subscription) break;

      const sub = await stripe.subscriptions.retrieve(
        session.subscription as string,
      );
      const firstItem = sub.items.data[0];
      const priceId = firstItem?.price.id;
      const plan = determinePlan(priceId);
      const periodEnd = firstItem?.current_period_end
        ? new Date(firstItem.current_period_end * 1000)
        : new Date();

      await db
        .insert(subscriptions)
        .values({
          workspaceId,
          stripeCustomerId: session.customer as string,
          stripeSubId: sub.id,
          plan,
          status: "active",
          currentPeriodEnd: periodEnd,
        })
        .onConflictDoUpdate({
          target: subscriptions.workspaceId,
          set: {
            stripeSubId: sub.id,
            plan,
            status: "active",
            currentPeriodEnd: periodEnd,
            updatedAt: new Date(),
          },
        });

      await db
        .update(workspaces)
        .set({ plan, updatedAt: new Date() })
        .where(eq(workspaces.id, workspaceId));
      break;
    }

    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const updFirstItem = sub.items.data[0];
      const priceId = updFirstItem?.price.id;
      const plan = determinePlan(priceId);
      const status = mapStatus(sub.status);
      const updPeriodEnd = updFirstItem?.current_period_end
        ? new Date(updFirstItem.current_period_end * 1000)
        : new Date();

      await db
        .update(subscriptions)
        .set({
          plan,
          status,
          currentPeriodEnd: updPeriodEnd,
          updatedAt: new Date(),
        })
        .where(eq(subscriptions.stripeSubId, sub.id));

      // Update workspace plan
      const [existingSub] = await db
        .select({ workspaceId: subscriptions.workspaceId })
        .from(subscriptions)
        .where(eq(subscriptions.stripeSubId, sub.id))
        .limit(1);

      if (existingSub) {
        await db
          .update(workspaces)
          .set({ plan, updatedAt: new Date() })
          .where(eq(workspaces.id, existingSub.workspaceId));
      }
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;

      await db
        .update(subscriptions)
        .set({ status: "canceled", updatedAt: new Date() })
        .where(eq(subscriptions.stripeSubId, sub.id));

      const [existingSub] = await db
        .select({ workspaceId: subscriptions.workspaceId })
        .from(subscriptions)
        .where(eq(subscriptions.stripeSubId, sub.id))
        .limit(1);

      if (existingSub) {
        await db
          .update(workspaces)
          .set({ plan: "free", updatedAt: new Date() })
          .where(eq(workspaces.id, existingSub.workspaceId));
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}

function determinePlan(priceId: string | undefined): "free" | "indie" | "pro" {
  if (priceId === process.env.STRIPE_INDIE_PRICE_ID) return "indie";
  if (priceId === process.env.STRIPE_PRO_PRICE_ID) return "pro";
  return "free";
}

function mapStatus(
  stripeStatus: string,
): "active" | "canceled" | "past_due" {
  if (stripeStatus === "active" || stripeStatus === "trialing") return "active";
  if (stripeStatus === "past_due") return "past_due";
  return "canceled";
}
