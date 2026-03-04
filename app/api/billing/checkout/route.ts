export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { db, workspaces } from "@impersonatekit/db";
import { eq } from "drizzle-orm";
import { z } from "zod";

const checkoutSchema = z.object({
  plan: z.enum(["indie", "pro"]),
});

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json(
      { status: "fail", message: "Unauthorized" },
      { status: 401 },
    );
  }

  const body: unknown = await request.json();
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { status: "fail", message: "Invalid plan" },
      { status: 422 },
    );
  }

  const priceId =
    parsed.data.plan === "indie"
      ? process.env.STRIPE_INDIE_PRICE_ID!
      : process.env.STRIPE_PRO_PRICE_ID!;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // Get or create Stripe customer
  const [workspace] = await db
    .select()
    .from(workspaces)
    .where(eq(workspaces.id, session.user.workspaceId))
    .limit(1);

  let customerId = workspace?.stripeCustomerId;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: session.user.email,
      metadata: { workspaceId: session.user.workspaceId },
    });
    customerId = customer.id;
    await db
      .update(workspaces)
      .set({ stripeCustomerId: customerId, updatedAt: new Date() })
      .where(eq(workspaces.id, session.user.workspaceId));
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/dashboard?billing=success`,
    cancel_url: `${appUrl}/dashboard?billing=cancel`,
    metadata: { workspaceId: session.user.workspaceId },
  });

  return NextResponse.json({
    status: "success",
    data: { url: checkoutSession.url },
  });
}
