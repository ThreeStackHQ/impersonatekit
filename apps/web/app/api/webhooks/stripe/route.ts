import { NextResponse } from "next/server";

export async function POST(request: Request): Promise<NextResponse> {
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { status: "fail", message: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  // TODO: Verify webhook signature, process event
  return NextResponse.json(
    { status: "success", message: "Webhook received" },
    { status: 200 }
  );
}
