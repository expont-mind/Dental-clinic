import { NextRequest, NextResponse } from "next/server";
import { fulfillPendingBooking } from "@/lib/actions/fulfill-booking";

/**
 * POST /api/qpay/callback
 * QPay webhook — called when a payment completes.
 * Acts as backup if user closes the page before polling picks it up.
 * Delegates all logic to fulfillPendingBooking (same mutex — no double booking).
 */
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const invoiceId = body.invoice_id as string | undefined;
  if (!invoiceId) {
    return NextResponse.json({ error: "Missing invoice_id" }, { status: 400 });
  }

  await fulfillPendingBooking({ invoiceId });
  return NextResponse.json({ received: true });
}
