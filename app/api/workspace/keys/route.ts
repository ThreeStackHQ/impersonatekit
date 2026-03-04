export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { auth } from "@/lib/auth";
import { db, apiKeys } from "@impersonatekit/db";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

const createKeySchema = z.object({
  name: z.string().min(1).max(100),
});

// POST /api/workspace/keys — generate new API key
export async function POST(request: NextRequest) {
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

  const body: unknown = await request.json();
  const parsed = createKeySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { status: "fail", message: "Validation failed", errors: parsed.error.issues },
      { status: 422 },
    );
  }

  const rawKey = `ik_live_${crypto.randomBytes(24).toString("hex")}`;
  const keyHash = crypto.createHash("sha256").update(rawKey).digest("hex");
  const keyPrefix = rawKey.slice(0, 8);

  const [key] = await db
    .insert(apiKeys)
    .values({
      workspaceId: session.user.workspaceId,
      keyHash,
      keyPrefix,
      name: parsed.data.name,
    })
    .returning({
      id: apiKeys.id,
      keyPrefix: apiKeys.keyPrefix,
      name: apiKeys.name,
      createdAt: apiKeys.createdAt,
    });

  return NextResponse.json(
    {
      status: "success",
      data: { ...key, plainKey: rawKey },
    },
    { status: 201 },
  );
}

// GET /api/workspace/keys — list keys
export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json(
      { status: "fail", message: "Unauthorized" },
      { status: 401 },
    );
  }

  const keys = await db
    .select({
      id: apiKeys.id,
      keyPrefix: apiKeys.keyPrefix,
      name: apiKeys.name,
      createdAt: apiKeys.createdAt,
      revokedAt: apiKeys.revokedAt,
    })
    .from(apiKeys)
    .where(eq(apiKeys.workspaceId, session.user.workspaceId));

  return NextResponse.json({ status: "success", data: keys });
}
