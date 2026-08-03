import { NextResponse } from "next/server";
import { fetchSimulasiDampakFinansialService } from "@/report/services/Simulasi-dampak-finansial/SimulasiDampakFinansial.service";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date") || undefined;
    const segment = searchParams.get("segment") || undefined;

    const result = await fetchSimulasiDampakFinansialService(date, segment);

    return NextResponse.json({
      success: true,
      latestDate: result.latestDate,
      data: result.data,
      summary: result.summary,
    });
  } catch (error: any) {
    console.error("Error fetching Simulasi Dampak Finansial:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}