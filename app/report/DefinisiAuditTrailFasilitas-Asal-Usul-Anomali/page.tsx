import React from "react";
import DefinisiAuditTrailFasilitasAsalUsulAnomali from "@/report/component/DefinisiAuditTrailFasilitas-Asal-Usul-Anomali/DefinisiAuditTrailFasilitasAsalUsulAnomali";
import { getDefinisiAuditTrailFasilitasAsalUsulAnomaliService } from "@/report/services/DefinisiAuditTrailFasilitas-Asal-Usul-Anomali/DefinisiAuditTrailFasilitasAsalUsulAnomali.service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }> | { [key: string]: string | string[] | undefined };
}

export default async function DefinisiAuditTrailFasilitasAsalUsulAnomaliPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const segment = typeof resolvedParams?.segment === "string" ? resolvedParams.segment : "ALL";

  const reportData = await getDefinisiAuditTrailFasilitasAsalUsulAnomaliService(segment);

  return (
    <main className="min-h-screen bg-white">
      <DefinisiAuditTrailFasilitasAsalUsulAnomali initialData={reportData} />
    </main>
  );
}