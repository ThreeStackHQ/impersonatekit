export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { db, users, workspaces, workspaceMembers } from "@impersonatekit/db";
import { z } from "zod";
import crypto from "node:crypto";
import { signIn } from "@/lib/auth";

const signupSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
  name: z.string().min(2).max(255),
  workspaceName: z.string().min(2).max(255),
});

function slugify(str: string): string {
  const base = str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const suffix = crypto.randomBytes(2).toString("hex");
  return `${base}-${suffix}`;
}

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();
    const parsed = signupSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          status: "fail",
          message: "Validation failed",
          errors: parsed.error.issues.map((i) => ({
            field: i.path.join("."),
            message: i.message,
          })),
        },
        { status: 422 },
      );
    }

    const { email, password, name, workspaceName } = parsed.data;

    const passwordHash = await bcrypt.hash(password, 10);
    const slug = slugify(workspaceName);

    const [user] = await db
      .insert(users)
      .values({ email, passwordHash, name })
      .returning();

    const [workspace] = await db
      .insert(workspaces)
      .values({ name: workspaceName, slug })
      .returning();

    await db
      .insert(workspaceMembers)
      .values({ workspaceId: workspace.id, userId: user.id, role: "owner" });

    // Sign in after signup
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    return NextResponse.json(
      {
        status: "success",
        data: {
          user: { id: user.id, email: user.email, name: user.name },
          workspace: { id: workspace.id, name: workspace.name, slug: workspace.slug },
        },
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      error.message.includes("unique")
    ) {
      return NextResponse.json(
        { status: "fail", message: "Email already in use" },
        { status: 409 },
      );
    }
    console.error("Signup error:", error);
    return NextResponse.json(
      { status: "fail", message: "Internal server error" },
      { status: 500 },
    );
  }
}
