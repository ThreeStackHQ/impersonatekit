export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db, impersonationSessions } from "@impersonatekit/db";
import { eq, and, gte, lte, desc, SQL } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json(
      { status: "fail", message: "Unauthorized" },
      { status: 401 },
    );
  }

  const { searchParams } = request.nextUrl;
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

  const sessions = await db
    .select()
    .from(impersonationSessions)
    .where(and(...conditions))
    .orderBy(desc(impersonationSessions.startedAt));

  const header =
    "id,workspaceId,tokenId,adminId,targetUserId,ip,userAgent,startedAt,endedAt,exitedBy";
  const rows = sessions.map((s) =>
    [
      s.id,
      s.workspaceId,
      s.tokenId,
      s.adminId,
      s.targetUserId,
      s.ip ?? "",
      `"${(s.userAgent ?? "").replace(/"/g, '""')}"`,
      s.startedAt.toISOString(),
      s.endedAt?.toISOString() ?? "",
      s.exitedBy ?? "",
    ].join(","),
  );

  const csv = [header, ...rows].join("\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=audit-export.csv",
    },
  });
}
