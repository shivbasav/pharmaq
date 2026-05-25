const FDA_BASE = "https://api.fda.gov/drug";

export interface AdverseEventSummary {
  totalReports: number;
  seriousReports: number;
  topReactions: { term: string; count: number }[];
  topManufacturers: { term: string; count: number }[];
}

export interface DrugLabel {
  brandName: string;
  genericName: string;
  manufacturer: string;
  indication: string;
  warnings: string;
  adverseReactions: string;
}

// Fetch adverse event summary for a drug
export async function fetchAdverseEvents(
  drugName: string
): Promise<AdverseEventSummary> {
  try {
    const base = `${FDA_BASE}/event.json?search=patient.drug.medicinalproduct:"${encodeURIComponent(drugName)}"`;

    // Total reports
    const totalRes = await fetch(`${base}&limit=1`);
    const totalData = await totalRes.json();
    const totalReports = totalData.meta?.results?.total ?? 0;

    // Serious reports
    const seriousRes = await fetch(`${base}+AND+serious:1&limit=1`);
    const seriousData = await seriousRes.json();
    const seriousReports = seriousData.meta?.results?.total ?? 0;

    // Top reactions
    const reactionsRes = await fetch(
      `${base}&count=patient.reaction.reactionmeddrapt.exact&limit=8`
    );
    const reactionsData = await reactionsRes.json();
    const topReactions = (reactionsData.results ?? []).map(
      (r: { term: string; count: number }) => ({
        term: r.term,
        count: r.count,
      })
    );

    // Top manufacturers
    const mfgRes = await fetch(
      `${base}&count=companynumb.exact&limit=5`
    );
    const mfgData = await mfgRes.json();
    const topManufacturers = (mfgData.results ?? []).map(
      (r: { term: string; count: number }) => ({
        term: r.term,
        count: r.count,
      })
    );

    return { totalReports, seriousReports, topReactions, topManufacturers };
  } catch {
    return {
      totalReports: 0,
      seriousReports: 0,
      topReactions: [],
      topManufacturers: [],
    };
  }
}

// Fetch drug label information
export async function fetchDrugLabel(
  drugName: string
): Promise<DrugLabel | null> {
  try {
    const res = await fetch(
      `${FDA_BASE}/label.json?search=openfda.brand_name:"${encodeURIComponent(drugName)}"&limit=1`
    );
    const data = await res.json();
    const result = data.results?.[0];
    if (!result) return null;

    return {
      brandName:
        result.openfda?.brand_name?.[0] ?? drugName,
      genericName:
        result.openfda?.generic_name?.[0] ?? "N/A",
      manufacturer:
        result.openfda?.manufacturer_name?.[0] ?? "N/A",
      indication:
        result.indications_and_usage?.[0]?.slice(0, 300) ?? "N/A",
      warnings:
        result.warnings?.[0]?.slice(0, 300) ?? "N/A",
      adverseReactions:
        result.adverse_reactions?.[0]?.slice(0, 300) ?? "N/A",
    };
  } catch {
    return null;
  }
}