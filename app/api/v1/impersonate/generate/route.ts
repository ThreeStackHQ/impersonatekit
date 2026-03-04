export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { db, impersonationTokens, impersonationSessions, workspaceMembers } from "@impersonatekit/db";
import { eq, and, gte, sql } from "drizzle-orm";
import { z } from "zod";
import { authenticateApiKey } from "@/lib/api-auth";
import { rateLimit } from "@/lib/rate-limit";

const generateSchema = z.object({
  adminId: z.string().min(1),
  targetUserId: z.string().min(1),
});

const FREE_MONTHLY_LIMIT = 5;

export async function POST(request: NextRequest) {
  // API key auth
  const apiKey = await authenticateApiKey(request);
  if (!apiKey) {
    return NextResponse.json(
      { status: "fail", message: "Invalid or missing API key" },
      { status: 401 },
    );
  }

  // Rate limit: 10/min per workspace
  const rl = rateLimit(`impersonate:${apiKey.workspaceId}`, 10);
  if (!rl.success) {
    return NextResponse.json(
      { status: "fail", message: "Rate limit exceeded" },
      { status: 429 },
    );
  }

  const body: unknown = await request.json();
  const parsed = generateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { status: "fail", message: "Validation failed", errors: parsed.error.issues },
      { status: 422 },
    );
  }

  const { adminId, targetUserId } = parsed.data;

  // RBAC: Check admin is owner or admin in this workspace
  const [membership] = await db
    .select({ role: workspaceMembers.role })
    .from(workspaceMembers)
    .where(
      and(
        eq(workspaceMembers.workspaceId, apiKey.workspaceId),
        eq(workspaceMembers.userId, adminId),
      ),
    )
    .limit(1);

  if (!membership || (membership.role !== "owner" && membership.role !== "admin")) {
    return NextResponse.json(
      { status: "fail", message: "Admin user lacks required role (owner or admin)" },
      { status: 403 },
    );
  }

  // Plan limits
  if (apiKey.plan === "free") {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(impersonationSessions)
      .where(
        and(
          eq(impersonationSessions.workspaceId, apiKey.workspaceId),
          gte(impersonationSessions.startedAt, startOfMonth),
        ),
      );

    if (count >= FREE_MONTHLY_LIMIT) {
      return NextResponse.json(
        {
          status: "fail",
          message: `Free plan limit reached (${FREE_MONTHLY_LIMIT}/month). Upgrade to Indie for unlimited.`,
        },
        { status: 403 },
      );
    }
  }

  // Generate token
  const nonce = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(nonce).digest("hex");
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  const [token] = await db
    .insert(impersonationTokens)
    .values({
      workspaceId: apiKey.workspaceId,
      adminId,
      targetUserId,
      tokenHash,
      nonce,
      expiresAt,
    })
    .returning({ id: impersonationTokens.id });

  // Sign JWT
  const secret = process.env.IMPERSONATE_SECRET;
  if (!secret) {
    return NextResponse.json(
      { status: "fail", message: "Server configuration error" },
      { status: 500 },
    );
  }

  const jwtToken = jwt.sign(
    { tokenId: token.id, nonce },
    secret,
    { expiresIn: "15m" },
  );

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://impersonatekit.threestack.io";
  const url = `${appUrl}/api/impersonate/${jwtToken}`;

  return NextResponse.json(
    {
      status: "success",
      data: { url, expiresAt: expiresAt.toISOString(), tokenId: token.id },
    },
    { status: 201 },
  );
}
