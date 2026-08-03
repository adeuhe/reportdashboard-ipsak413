import { getDataKPICard } from "@/app/services/Query/riskDashboard.service";

export async function getDashboardDataKPI() {
    const kpi = await getDataKPICard();
    const safe = (v: number | null | undefined) => v ?? 0;
    const raw = Array.isArray(kpi) ? kpi[0] : kpi;

    const row = {
        Current_ECL: safe(raw?.Current_ECL),
        Prev_ECL: safe(raw?.Prev_ECL),
        Current_NPF: safe(raw?.Current_NPF),
        Prev_NPF: safe(raw?.Prev_NPF),
        Current_Cov: safe(raw?.Current_Cov),
        Prev_Cov: safe(raw?.Prev_Cov),
    };

    return {
        meta: {
            bankName: "BANK CONTOH",
            reportTitle: "Risk Monitoring Dashboard",
            periodLabel: "Current Period",
            dataCutoff: new Date().toISOString(),
        },

        kpis: [
            {
                key: "ecl",
                label: "Total ECL",
                valueText: formatCurrency(row.Current_ECL),
                mom: calcMoM(row.Current_ECL, row.Prev_ECL),
            },
            {
                key: "npf",
                label: "NPF Ratio",
                valueText: formatPercent(row.Current_NPF),
                mom: calcMoM(row.Current_NPF, row.Prev_NPF),
            },
            {
                key: "cov",
                label: "Coverage",
                valueText: formatPercent(row.Current_Cov),
                mom: calcMoM(row.Current_Cov, row.Prev_Cov),
            },
        ],

        eclNpfTrend: [],
        stagingMigration: { title: "", stages: [], notes: "" },
        sectorRisk: [],
        status: {},
        bucketDpd: { title: "", stages: [] },
        slik: { value: 0, note: "", actions: [] },
        table: { titleLeft: "", titleCenter: "", rows: [], footer: "" },
    };
}

/* helpers */
function calcMoM(curr: number, prev: number) {
    if (!prev) return 0;

    const value = ((curr - prev) / prev) * 100;

    return Number(value.toFixed(2)); // ← 2 desimal saja
}


function formatCurrency(val: number) {
    return "Rp " + Number(val || 0).toLocaleString("id-ID");
}

function formatPercent(val: number) {
    return (Number(val || 0) * 100).toFixed(2) + "%";
}
