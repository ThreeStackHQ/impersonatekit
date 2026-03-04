import { NextResponse } from "next/server";

export async function POST(request: Request): Promise<NextResponse> {
  const apiKey = request.headers.get("authorization")?.replace("Bearer ", "");

  if (!apiKey) {
    return NextResponse.json(
      { status: "fail", message: "Missing API key" },
      { status: 401 }
    );
  }

  // TODO: Validate API key, generate token, store hash
  return NextResponse.json(
    { status: "fail", message: "Not implemented" },
    { status: 501 }
  );
}
