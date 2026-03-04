import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db, apiKeys } from "@impersonatekit/db";
import { eq, and, isNull, isNotNull } from "drizzle-orm";

// DELETE /api/workspace/keys/[id] — revoke key
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json(
      { status: "fail", message: "Unauthorized" },
      { status: 401 },
    );
  }

  if (session.user.role !== "owner" && session.user.role !== "admin") {
    return NextResponse.json(
      { status: "fail", message: "Forbidden: owner or admin required" },
      { status: 403 },
    );
  }

  const { id } = await params;

  // Check if key exists and belongs to this workspace
  const [existing] = await db
    .select({ id: apiKeys.id, revokedAt: apiKeys.revokedAt })
    .from(apiKeys)
    .where(
      and(
        eq(apiKeys.id, id),
        eq(apiKeys.workspaceId, session.user.workspaceId),
      ),
    )
    .limit(1);

  if (!existing) {
    return NextResponse.json(
      { status: "fail", message: "Key not found" },
      { status: 404 },
    );
  }

  if (existing.revokedAt) {
    return NextResponse.json(
      { status: "fail", message: "Key already revoked" },
      { status: 409 },
    );
  }

  await db
    .update(apiKeys)
    .set({ revokedAt: new Date() })
    .where(eq(apiKeys.id, id));

  return new NextResponse(null, { status: 204 });
}
