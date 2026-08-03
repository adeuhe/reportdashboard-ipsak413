// services/financial-impact-service/carImpact.service.ts
import { getDataCAR } from "../Query/financial-impact-query/queryFinancialImpact.query";

export async function getCARImpactServiceData() {
    const row = await getDataCAR();
    if (!row) return null;
    console.log("DATAAOWKOW",row);
    

    // Parse data JSON dari SQL
    const eclValues = JSON.parse(row.eclValues || "{}");
    const trendData = JSON.parse(row.trendData || "[]");

    return {
        eclValues: {
            Optimis: eclValues.Optimis || 0,
            Baseline: eclValues.Baseline || 0,
            Pesimis: eclValues.Pesimis || 0
        },
        modalAwal: row.modalAwal || 0,
        rwaAwal: row.rwaAwal || 0,
        trendData: trendData.map((t: any) => ({
            month: t.month,
            value: parseFloat(t.value.toFixed(2))
        }))
    };
}