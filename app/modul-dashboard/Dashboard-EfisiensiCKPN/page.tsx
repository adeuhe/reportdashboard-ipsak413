import DashboardEfisiensiCKPN from "@/modul-dashboard/component/Dashboard-EfisiensiCKPN/DashboardEfisiensiCKPN";
import { fetchDashboardEfisiensiService } from "@/modul-dashboard/services/Dashboard-EfisiensiCKPN/Dashboard-EfisiensiCKPN.service";

interface PageProps {
  searchParams: Promise<{ segment?: string; date?: string }>;
}

export default async function DashboardEfisiensiPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const segment = resolvedSearchParams.segment || "ALL";
  const date = resolvedSearchParams.date;

  const initialData = await fetchDashboardEfisiensiService(date, segment);

  return (
    <main className="p-6 bg-slate-100 min-h-screen">
      <DashboardEfisiensiCKPN initialData={initialData} />
    </main>
  );
}