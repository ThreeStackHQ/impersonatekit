import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { db, workspaces, workspaceMembers, users, impersonationSessions } from "@impersonatekit/db";
import { eq, and, gte, sql } from "drizzle-orm";
import { Resend } from "resend";

export async function POST(request: NextRequest) {
  // Verify CRON_SECRET
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || !authHeader) {
    return NextResponse.json(
      { status: "fail", message: "Unauthorized" },
      { status: 401 },
    );
  }

  const providedSecret = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : authHeader;

  const expected = Buffer.from(cronSecret);
  const provided = Buffer.from(providedSecret);

  if (
    expected.length !== provided.length ||
    !crypto.timingSafeEqual(expected, provided)
  ) {
    return NextResponse.json(
      { status: "fail", message: "Unauthorized" },
      { status: 401 },
    );
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  // Get all workspaces with session counts this month
  const workspaceStats = await db
    .select({
      workspaceId: workspaces.id,
      workspaceName: workspaces.name,
      sessionCount: sql<number>`count(${impersonationSessions.id})::int`,
    })
    .from(workspaces)
    .leftJoin(
      impersonationSessions,
      and(
        eq(impersonationSessions.workspaceId, workspaces.id),
        gte(impersonationSessions.startedAt, startOfMonth),
      ),
    )
    .groupBy(workspaces.id, workspaces.name);

  let emailsSent = 0;

  for (const stat of workspaceStats) {
    // Find owner(s) of each workspace
    const owners = await db
      .select({ email: users.email, name: users.name })
      .from(workspaceMembers)
      .innerJoin(users, eq(users.id, workspaceMembers.userId))
      .where(
        and(
          eq(workspaceMembers.workspaceId, stat.workspaceId),
          eq(workspaceMembers.role, "owner"),
        ),
      );

    for (const owner of owners) {
      const monthName = startOfMonth.toLocaleString("en-US", {
        month: "long",
        year: "numeric",
      });

      await resend.emails.send({
        from: "ImpersonateKit <noreply@impersonatekit.com>",
        to: owner.email,
        subject: `ImpersonateKit — ${monthName} Usage Digest`,
        html: `
          <h2>Monthly Usage Digest</h2>
          <p>Hi ${owner.name},</p>
          <p>Here's your impersonation usage for <strong>${stat.workspaceName}</strong> in ${monthName}:</p>
          <ul>
            <li><strong>${stat.sessionCount}</strong> impersonation sessions</li>
          </ul>
          <p>View the full audit log in your <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard">dashboard</a>.</p>
          <p>— ImpersonateKit</p>
        `,
      });
      emailsSent++;
    }
  }

  return NextResponse.json({
    status: "success",
    data: { emailsSent, workspacesProcessed: workspaceStats.length },
  });
}
