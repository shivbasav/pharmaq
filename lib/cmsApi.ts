const CMS_BASE = "https://data.cms.gov/data-api/v1/dataset";

// Medicare Part D Drug Spending by Drug dataset ID
const SPENDING_DATASET = "9552-md9e";

// Medicare Part D Prescribers by Drug dataset ID  
const PRESCRIBER_DATASET = "240a-5sxe";

export interface DrugSpending {
  brandName: string;
  genericName: string;
  totalClaims: number;
  totalBeneficiaries: number;
  totalSpending: number;
  avgCostPerClaim: number;
  avgCostPer30Days: number;
  year: string;
}

export interface PrescriberSummary {
  totalPrescribers: number;
  topStates: { state: string; claims: number }[];
  totalClaims: number;
}

// Fetch Medicare Part D spending data for a drug
export async function fetchDrugSpending(
  drugName: string
): Promise<DrugSpending | null> {
  try {
    const url = `${CMS_BASE}/${SPENDING_DATASET}/data?filter[brnd_name]=${encodeURIComponent(
      drugName.toUpperCase()
    )}&size=5&sort[year]=desc`;

    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: 86400 }, // cache 24 hours
    });

    const data = await res.json();
    const results = data?.data ?? data;

    if (!Array.isArray(results) || results.length === 0) return null;

    // Use the most recent year
    const latest = results[0];

    return {
      brandName: latest.brnd_name ?? drugName,
      genericName: latest.gnrc_name ?? "N/A",
      totalClaims: Number(latest.tot_clms ?? 0),
      totalBeneficiaries: Number(latest.tot_benes ?? 0),
      totalSpending: Number(latest.tot_spndng ?? 0),
      avgCostPerClaim: Number(latest.avg_spnd_per_clm ?? 0),
      avgCostPer30Days: Number(latest.avg_spnd_per_dsg_unt_wghtd ?? 0),
      year: latest.year ?? "N/A",
    };
  } catch {
    return null;
  }
}

// Fetch prescriber summary for a drug
export async function fetchPrescriberSummary(
  drugName: string
): Promise<PrescriberSummary | null> {
  try {
    const url = `${CMS_BASE}/${PRESCRIBER_DATASET}/data?filter[brnd_name]=${encodeURIComponent(
      drugName.toUpperCase()
    )}&size=100`;

    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: 86400 },
    });

    const data = await res.json();
    const results = data?.data ?? data;

    if (!Array.isArray(results) || results.length === 0) return null;

    // Aggregate by state
    const stateMap: Record<string, number> = {};
    let totalClaims = 0;

    for (const row of results) {
      const state = row.nppes_provider_state ?? "Unknown";
      const claims = Number(row.tot_clms ?? 0);
      stateMap[state] = (stateMap[state] ?? 0) + claims;
      totalClaims += claims;
    }

    const topStates = Object.entries(stateMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([state, claims]) => ({ state, claims }));

    return {
      totalPrescribers: results.length,
      topStates,
      totalClaims,
    };
  } catch {
    return null;
  }
}