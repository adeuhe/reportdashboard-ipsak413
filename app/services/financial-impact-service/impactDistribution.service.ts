import { getPool } from "@/lib/db";
import { getDataImpactDIstribution } from "../Query/financial-impact-query/queryFinancialImpact.query";

export async function getImpactDistributionData() {
    const rawData =  await getDataImpactDIstribution();

    if (!rawData || rawData.length === 0) return null;

    // Mapping untuk Pie Chart (Impact Distribution)
    const distributionData = rawData.map((row: any) => ({
        name: row.name,
        value: row.value
    }));

    // Mapping untuk Key Indicators (Ratios)
    // Karena kita pakai CROSS JOIN, nilai car/npl sama di setiap row, ambil dari index 0
    const ratios = {
        car: rawData[0].car_value,
        npl: rawData[0].npl_value
    };

    return {
        distributionData,
        ratios
    };
}