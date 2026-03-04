export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { db, impersonationTokens, impersonationSessions } from "@impersonatekit/db";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";

interface TokenPayload {
  tokenId: string;
  nonce: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const secret = process.env.IMPERSONATE_SECRET;
  if (!secret) {
    return NextResponse.json(
      { status: "fail", message: "Server configuration error" },
      { status: 500 },
    );
  }

  // Verify JWT
  let payload: TokenPayload;
  try {
    payload = jwt.verify(token, secret) as TokenPayload;
  } catch {
    return NextResponse.json(
      { status: "fail", message: "Invalid or expired token" },
      { status: 401 },
    );
  }

  // Look up impersonation token
  const [storedToken] = await db
    .select()
    .from(impersonationTokens)
    .where(eq(impersonationTokens.id, payload.tokenId))
    .limit(1);

  if (!storedToken) {
    return NextResponse.json(
      { status: "fail", message: "Token not found" },
      { status: 401 },
    );
  }

  // Verify nonce with timing-safe comparison
  const storedNonceHash = Buffer.from(storedToken.tokenHash, "hex");
  const providedNonceHash = Buffer.from(
    crypto.createHash("sha256").update(payload.nonce).digest("hex"),
    "hex",
  );

  if (
    storedNonceHash.length !== providedNonceHash.length ||
    !crypto.timingSafeEqual(storedNonceHash, providedNonceHash)
  ) {
    return NextResponse.json(
      { status: "fail", message: "Invalid token" },
      { status: 401 },
    );
  }

  // Check: not used and not expired
  if (storedToken.usedAt !== null) {
    return NextResponse.json(
      { status: "fail", message: "Token already used" },
      { status: 401 },
    );
  }

  if (storedToken.expiresAt < new Date()) {
    return NextResponse.json(
      { status: "fail", message: "Token expired" },
      { status: 401 },
    );
  }

  // Mark token as used
  await db
    .update(impersonationTokens)
    .set({ usedAt: new Date() })
    .where(eq(impersonationTokens.id, storedToken.id));

  // Create session
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  const userAgent = request.headers.get("user-agent") || "";

  const [session] = await db
    .insert(impersonationSessions)
    .values({
      workspaceId: storedToken.workspaceId,
      tokenId: storedToken.id,
      adminId: storedToken.adminId,
      targetUserId: storedToken.targetUserId,
      ip,
      userAgent,
    })
    .returning({ id: impersonationSessions.id });

  // Set cookie
  const cookieStore = await cookies();
  cookieStore.set("ik_impersonation_session_id", session.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 1800, // 30 minutes
    path: "/",
  });

  // Determine redirect URL
  const returnUrl = request.nextUrl.searchParams.get("returnUrl");
  let redirectTo = "/dashboard";

  if (returnUrl) {
    try {
      const parsed = new URL(returnUrl, request.nextUrl.origin);
      if (parsed.origin === request.nextUrl.origin) {
        redirectTo = parsed.pathname + parsed.search;
      }
    } catch {
      // Invalid URL, use default
    }
  }

  return NextResponse.redirect(new URL(redirectTo, request.nextUrl.origin));
}
