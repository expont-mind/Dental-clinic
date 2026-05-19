import { NextRequest, NextResponse } from "next/server";
import { fulfillPendingBooking } from "@/lib/actions/fulfill-booking";

/**
 * GET /api/qpay/check?id=<pending_booking_id>
 * Polled by the payment page every 3s.
 * Delegates all logic (QPay check, mutex lock, IT Doctor booking) to fulfillPendingBooking.
 */
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const result = await fulfillPendingBooking({ id });
  return NextResponse.json(result);
}
