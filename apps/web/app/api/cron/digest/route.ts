import { NextResponse } from "next/server";

export async function POST(request: Request): Promise<NextResponse> {
  const cronSecret = request.headers.get("authorization")?.replace(
    "Bearer ",
    ""
  );

  if (!cronSecret) {
    return NextResponse.json(
      { status: "fail", message: "Missing authorization" },
      { status: 401 }
    );
  }

  // TODO: Validate CRON_SECRET, send digest emails via Resend
  return NextResponse.json(
    { status: "success", message: "Digest not implemented" },
    { status: 501 }
  );
}
