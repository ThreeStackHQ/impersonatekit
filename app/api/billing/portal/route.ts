import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { db, workspaces } from "@impersonatekit/db";
import { eq } from "drizzle-orm";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json(
      { status: "fail", message: "Unauthorized" },
      { status: 401 },
    );
  }

  const [workspace] = await db
    .select({ stripeCustomerId: workspaces.stripeCustomerId })
    .from(workspaces)
    .where(eq(workspaces.id, session.user.workspaceId))
    .limit(1);

  if (!workspace?.stripeCustomerId) {
    return NextResponse.json(
      { status: "fail", message: "No billing account found" },
      { status: 404 },
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: workspace.stripeCustomerId,
    return_url: `${appUrl}/dashboard`,
  });

  return NextResponse.json({
    status: "success",
    data: { url: portalSession.url },
  });
}
