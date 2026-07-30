import { NextRequest, NextResponse } from "next/server";
import { fulfillPendingBooking } from "@/lib/actions/fulfill-booking";

/**
 * POST /api/qpay/callback
 * QPay webhook — called when a payment completes.
 * Acts as backup if user closes the page before polling picks it up.
 * Delegates all logic to fulfillPendingBooking (same mutex — no double booking).
 *
 * Authenticated by a shared token in the callback URL (QPay has no signature
 * scheme). bookSlotAction appends `?token=` when QPAY_CALLBACK_TOKEN is set;
 * with the variable unset the endpoint stays open, as it was before, but logs a
 * warning — fulfilment still verifies the payment against QPay itself, so an
 * unauthenticated call can't conjure a booking, only burn API quota.
 */
export async function POST(req: NextRequest) {
  const expected = process.env.QPAY_CALLBACK_TOKEN;
  if (expected) {
    const provided = req.nextUrl.searchParams.get("token");
    if (provided !== expected) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  } else {
    console.warn(
      "[qpay callback] QPAY_CALLBACK_TOKEN is not set — endpoint is unauthenticated.",
    );
  }

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
