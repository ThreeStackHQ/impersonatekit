import { NextRequest } from "next/server";
import crypto from "node:crypto";
import { db, apiKeys, workspaces } from "@impersonatekit/db";
import { eq, and, isNull } from "drizzle-orm";

export interface ApiKeyContext {
  workspaceId: string;
  keyId: string;
  plan: "free" | "indie" | "pro";
}

export async function authenticateApiKey(
  request: NextRequest,
): Promise<ApiKeyContext | null> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const plainKey = authHeader.slice(7);
  if (!plainKey.startsWith("ik_live_")) return null;

  const keyHash = crypto.createHash("sha256").update(plainKey).digest("hex");

  const [key] = await db
    .select({
      id: apiKeys.id,
      workspaceId: apiKeys.workspaceId,
      keyHash: apiKeys.keyHash,
      revokedAt: apiKeys.revokedAt,
    })
    .from(apiKeys)
    .where(and(eq(apiKeys.keyHash, keyHash), isNull(apiKeys.revokedAt)))
    .limit(1);

  if (!key) return null;

  // Timing-safe comparison
  const storedBuffer = Buffer.from(key.keyHash, "hex");
  const providedBuffer = Buffer.from(keyHash, "hex");
  if (
    storedBuffer.length !== providedBuffer.length ||
    !crypto.timingSafeEqual(storedBuffer, providedBuffer)
  ) {
    return null;
  }

  const [workspace] = await db
    .select({ plan: workspaces.plan })
    .from(workspaces)
    .where(eq(workspaces.id, key.workspaceId))
    .limit(1);

  if (!workspace) return null;

  return {
    workspaceId: key.workspaceId,
    keyId: key.id,
    plan: workspace.plan,
  };
}
