import { NextRequest, NextResponse } from "next/server";
import { getSlots, ITDoctorError } from "@/lib/itdoctor/client";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const dentistId = Number(sp.get("dentist_id") ?? "0");
  const date = sp.get("date");
  const branchId = Number(sp.get("branch_id") ?? "1");

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json(
      { error: "date is required (YYYY-MM-DD)" },
      { status: 400 },
    );
  }

  try {
    const slots = await getSlots(dentistId, date, branchId);
    return NextResponse.json({ slots });
  } catch (e) {
    if (e instanceof ITDoctorError) {
      return NextResponse.json(
        { error: e.message },
        { status: e.status },
      );
    }
    throw e;
  }
}
