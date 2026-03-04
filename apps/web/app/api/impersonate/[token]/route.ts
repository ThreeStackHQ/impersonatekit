import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: { token: string } }
): Promise<NextResponse> {
  const { token } = params;

  // TODO: Validate token hash, check expiry, mark as used, create session
  return NextResponse.json(
    {
      status: "fail",
      message: `Token handler not implemented: ${token.substring(0, 8)}...`,
    },
    { status: 501 }
  );
}
