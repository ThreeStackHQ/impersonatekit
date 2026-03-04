export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db, impersonationSessions } from "@impersonatekit/db";
import { eq, and, gte, lte, lt, desc, SQL } from "drizzle-orm";

const DEFAULT_LIMIT = 50;

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json(
      { status: "fail", message: "Unauthorized" },
      { status: 401 },
    );
  }

  const { searchParams } = request.nextUrl;
  const cursor = searchParams.get("cursor");
  const adminId = searchParams.get("adminId");
  const targetUserId = searchParams.get("targetUserId");
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");

  const conditions: SQL[] = [
    eq(impersonationSessions.workspaceId, session.user.workspaceId),
  ];

  if (adminId) {
    conditions.push(eq(impersonationSessions.adminId, adminId));
  }
  if (targetUserId) {
    conditions.push(eq(impersonationSessions.targetUserId, targetUserId));
  }
  if (dateFrom) {
    conditions.push(gte(impersonationSessions.startedAt, new Date(dateFrom)));
  }
  if (dateTo) {
    conditions.push(lte(impersonationSessions.startedAt, new Date(dateTo)));
  }
  if (cursor) {
    conditions.push(lt(impersonationSessions.startedAt, new Date(cursor)));
  }

  const sessions = await db
    .select()
    .from(impersonationSessions)
    .where(and(...conditions))
    .orderBy(desc(impersonationSessions.startedAt))
    .limit(DEFAULT_LIMIT + 1);

  const hasMore = sessions.length > DEFAULT_LIMIT;
  const data = hasMore ? sessions.slice(0, DEFAULT_LIMIT) : sessions;
  const nextCursor = hasMore
    ? data[data.length - 1]?.startedAt.toISOString()
    : null;

  return NextResponse.json({
    status: "success",
    data,
    pagination: { nextCursor, hasMore },
  });
}
