import { NextResponse } from "next/server";
import { strategicDummy } from "@/data/strategicDashboard";

export async function GET() {
  // Nanti kalau sudah pakai database, ganti isi GET ini (query DB / call backend)
  return NextResponse.json(strategicDummy);
}
