import { NextResponse } from "next/server";
import { dashboardDummy } from "@/data/dashboard";

export async function GET() {
  return NextResponse.json(dashboardDummy);
}
