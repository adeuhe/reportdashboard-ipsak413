export type RiskLevel = "Low" | "Medium" | "High" | "Critical";

export const strategicDummy = {
  meta: {
    title: "Strategic Dashboard",
    subtitle: "Comprehensive Risk Management Analysis - PSAK 413",
    actions: ["Executive Report", "Export PDF"],
    tabs: ["1. Analisis Tren", "2. Konsentrasi Risiko"],
    activeTabIndex: 0,
  },

  kpis: [
    { key: "totalEcl", label: "Total ECL", value: "Rp 210M", delta: "-7.7% from last month", tone: "down" as const },
    { key: "npf", label: "NPF Ratio", value: "5.35%", delta: "+0.23% from last month", tone: "up" as const },
    { key: "wavg", label: "Weighted Avg PD", value: "3.8%", delta: "-0.3% from last month", tone: "down" as const },
  ],
    trend: {
    title: "ECL vs NPF Growth Comparison",
    subtitle: "Forward-looking risk cushion analysis",
    series: [
      { period: "2025-07", eclAmount: 210, npfAmount: 5.1, eclGrowth: 1.1, npfGrowth: 0.6 },
      { period: "2025-08", eclAmount: 218, npfAmount: 5.2, eclGrowth: 1.6, npfGrowth: 0.8 },
      { period: "2025-09", eclAmount: 226, npfAmount: 5.3, eclGrowth: 2.2, npfGrowth: 1.0 },
      { period: "2025-10", eclAmount: 235, npfAmount: 5.35, eclGrowth: 3.4, npfGrowth: 1.8 },
      { period: "2025-11", eclAmount: 242, npfAmount: 5.4, eclGrowth: 4.2, npfGrowth: 2.6 },
      { period: "2025-12", eclAmount: 248, npfAmount: 5.5, eclGrowth: 5.6, npfGrowth: 3.3 },
      { period: "2026-01", eclAmount: 252, npfAmount: 5.55, eclGrowth: 7.7, npfGrowth: 4.5 },
    ],
    cards: [
      { label: "ECL Growth Trend", value: "7.7%", note: "Increasing", tone: "blue" as const },
      { label: "NPF Growth Trend", value: "4.5%", note: "Decreasing", tone: "red" as const },
    ],
  },


  heatmap: {
    title: "Sectoral Risk Heatmap",
    subtitle: "Industry concentration and risk hotspots",
    tiles: [
      {
        sector: "Konstruksi",
        subsector: "Infrastruktur",
        eclRatio: 5.0,
        eclAmount: "Rp 125M",
        accounts: 45,
        stage: "Stage 2.1",
        risk: "High" as RiskLevel,
      },
      {
        sector: "Konstruksi",
        subsector: "Properti",
        eclRatio: 5.0,
        eclAmount: "Rp 90M",
        accounts: 32,
        stage: "Stage 2.0",
        risk: "High" as RiskLevel,
      },
      {
        sector: "UMKM",
        subsector: "Perdagangan",
        eclRatio: 3.0,
        eclAmount: "Rp 96M",
        accounts: 450,
        stage: "Stage 1.5",
        risk: "Medium" as RiskLevel,
      },
      {
        sector: "UMKM",
        subsector: "Jasa",
        eclRatio: 2.5,
        eclAmount: "Rp 53M",
        accounts: 320,
        stage: "Stage 1.4",
        risk: "Medium" as RiskLevel,
      },
      {
        sector: "Manufacturing",
        subsector: "Tekstil",
        eclRatio: 1.5,
        eclAmount: "Rp 23M",
        accounts: 28,
        stage: "Stage 1.2",
        risk: "Low" as RiskLevel,
      },
      {
        sector: "Manufacturing",
        subsector: "Elektronik",
        eclRatio: 1.5,
        eclAmount: "Rp 18M",
        accounts: 22,
        stage: "Stage 1.3",
        risk: "Low" as RiskLevel,
      },
      {
        sector: "Pertanian",
        subsector: "Perkebunan",
        eclRatio: 4.0,
        eclAmount: "Rp 36M",
        accounts: 67,
        stage: "Stage 1.8",
        risk: "Medium" as RiskLevel,
      },
      {
        sector: "Transportasi",
        subsector: "Logistik",
        eclRatio: 6.0,
        eclAmount: "Rp 66M",
        accounts: 34,
        stage: "Stage 2.1",
        risk: "Critical" as RiskLevel,
      },
    ],
  },

  table: {
    columns: ["Sector", "Subsector", "Exposure", "ECL Amount", "ECL Ratio", "Accounts", "Risk Level"],
    rows: [
      { sector: "Konstruksi", subsector: "Infrastruktur", exposure: "Rp 2.50B", eclAmount: "Rp 125M", eclRatio: "5.0%", accounts: 45, risk: "High" as RiskLevel },
      { sector: "Konstruksi", subsector: "Properti", exposure: "Rp 1.80B", eclAmount: "Rp 90M", eclRatio: "5.0%", accounts: 32, risk: "High" as RiskLevel },
      { sector: "UMKM", subsector: "Perdagangan", exposure: "Rp 3.20B", eclAmount: "Rp 96M", eclRatio: "3.0%", accounts: 450, risk: "Medium" as RiskLevel },
      { sector: "UMKM", subsector: "Jasa", exposure: "Rp 2.10B", eclAmount: "Rp 53M", eclRatio: "2.5%", accounts: 320, risk: "Medium" as RiskLevel },
      { sector: "Manufacturing", subsector: "Tekstil", exposure: "Rp 1.50B", eclAmount: "Rp 23M", eclRatio: "1.5%", accounts: 28, risk: "Low" as RiskLevel },
      { sector: "Manufacturing", subsector: "Elektronik", exposure: "Rp 1.20B", eclAmount: "Rp 18M", eclRatio: "1.5%", accounts: 22, risk: "Low" as RiskLevel },
      { sector: "Pertanian", subsector: "Perkebunan", exposure: "Rp 0.90B", eclAmount: "Rp 36M", eclRatio: "4.0%", accounts: 67, risk: "Medium" as RiskLevel },
      { sector: "Transportasi", subsector: "Logistik", exposure: "Rp 1.10B", eclAmount: "Rp 66M", eclRatio: "6.0%", accounts: 34, risk: "Critical" as RiskLevel },
    ],
  },
};
