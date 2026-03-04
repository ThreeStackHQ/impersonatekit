import { NextRequest, NextResponse } from "next/server";
import { db, impersonationSessions } from "@impersonatekit/db";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("ik_impersonation_session_id")?.value;

  if (!sessionId) {
    return NextResponse.json(
      { status: "fail", message: "No active impersonation session" },
      { status: 400 },
    );
  }

  // Look up and end session
  const [session] = await db
    .select()
    .from(impersonationSessions)
    .where(eq(impersonationSessions.id, sessionId))
    .limit(1);

  if (!session) {
    return NextResponse.json(
      { status: "fail", message: "Session not found" },
      { status: 404 },
    );
  }

  if (!session.endedAt) {
    await db
      .update(impersonationSessions)
      .set({ endedAt: new Date(), exitedBy: "admin" })
      .where(eq(impersonationSessions.id, sessionId));
  }

  // Clear cookie
  cookieStore.set("ik_impersonation_session_id", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });

  return NextResponse.redirect(new URL("/dashboard", request.nextUrl.origin));
}
