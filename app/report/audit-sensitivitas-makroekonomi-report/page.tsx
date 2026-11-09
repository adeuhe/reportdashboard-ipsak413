import React from "react";
import { getDashboardDataAuditSensitivitas } from "@/report/services/audit-sensitivitas-makroekonomi-report/dashboardAuditSensitivitas.service";
import AuditSensitivitasMakroekonomiClient from "@/report/component/audit-sensitivitas-makroekonomi-report/AuditSensitivitasMakroekonomiClient";

export default async function AuditSensitivitasMakroekonomiPage({
  searchParams,
}: {
  searchParams?: Promise<{
    tanggal_mulai?: string;
    tanggal_selesai?: string;
  }>;
}) {
  const params = await searchParams;
  const initialData = await getDashboardDataAuditSensitivitas(
    params?.tanggal_mulai,
    params?.tanggal_selesai
  );

  return (
    <main className="min-h-screen bg-slate-100 pb-12">
      <AuditSensitivitasMakroekonomiClient initialData={initialData} />
    </main>
  );
}
