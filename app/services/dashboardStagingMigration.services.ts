import { getDataStagingMigration } from "@/app/services/Query/riskDashboard.service";

export async function getDashboardDataStagingMigration() {
    const raw = await getDataStagingMigration();

    console.log("RAW STAGING MIGRATION:", raw); // debug

    const safe = (v: number | null | undefined) => v ?? 0;

    // pastikan selalu array dan mapping data
    const stages = (Array.isArray(raw) ? raw : [raw]).map((row: any) => ({
        stage: row?.Stage ?? "",
        eclCurrent: safe(row?.ECL_Current),
        eclPrevious: safe(row?.ECL_Previous),
        eclDiff: safe(row?.ECL_Diff),
        eclDiffPercent: safe(row?.ECL_Diff_Percent),
    }));

    // optional: hitung ringkasan, misal lowest/highest stage
    const lowestStage = stages.reduce(
        (prev, curr) => (curr.eclCurrent < prev.eclCurrent ? curr : prev),
        stages[0] ?? { eclCurrent: 0 }
    );
    const highestStage = stages.reduce(
        (prev, curr) => (curr.eclCurrent > prev.eclCurrent ? curr : prev),
        stages[0] ?? { eclCurrent: 0 }
    );



    // contoh notes dalam bahasa Indonesia
    const notes = [
        `Stage Terendah: ${lowestStage.stage} - ${(lowestStage.eclCurrent)}`,
        `Stage Tertinggi: ${highestStage.stage} - ${(highestStage.eclCurrent)}`
    ];


    return {
        meta: {
            bankName: "BANK CONTOH",
            reportTitle: "Staging Migration Summary",
            periodLabel: "Current vs Previous Month",
            dataCutoff: new Date().toISOString(),
        },

        stagingMigration: {
            title: "Staging Migration",
            stages: stages,
            notes: notes,
        },
    };
}
