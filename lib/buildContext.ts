import type { AdverseEventSummary, DrugLabel } from "./fdaApi";
import type { DrugSpending, PrescriberSummary } from "./cmsApi";

export function buildSystemPrompt(
  drugName: string,
  label: DrugLabel | null,
  adverse: AdverseEventSummary,
  spending: DrugSpending | null,
  prescribers: PrescriberSummary | null
): string {
  const formatter = new Intl.NumberFormat("en-US");
  const currency = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

  const seriousPct =
    adverse.totalReports > 0
      ? ((adverse.seriousReports / adverse.totalReports) * 100).toFixed(1)
      : "N/A";

  return `You are PharmaIQ, an expert conversational analytics assistant for pharma HQ teams.
You are currently analyzing: **${drugName.toUpperCase()}**
${label ? `Generic name: ${label.genericName} | Manufacturer: ${label.manufacturer}` : ""}

Your role: Deliver sharp, data-driven insights to commercial leadership. Be concise and strategic — like a senior brand analyst briefing the VP of Marketing. Use specific numbers. Flag risks and opportunities clearly. Use bullet points for multi-item answers. Bold key numbers using **markdown**.

All data below is pulled live from FDA and CMS public databases.

---

## DRUG LABEL INFORMATION (FDA)
${
  label
    ? `
- **Brand Name:** ${label.brandName}
- **Generic Name:** ${label.genericName}
- **Manufacturer:** ${label.manufacturer}
- **Indication:** ${label.indication}
- **Key Warnings:** ${label.warnings}
- **Adverse Reactions (label):** ${label.adverseReactions}
`
    : `- No FDA label data found for "${drugName}". Try the generic name.`
}

## ADVERSE EVENT SIGNALS (FDA FAERS Database)
- **Total Adverse Event Reports:** ${formatter.format(adverse.totalReports)}
- **Serious Reports:** ${formatter.format(adverse.seriousReports)} (${seriousPct}% of total)
- **Top Reported Reactions:**
${
  adverse.topReactions.length > 0
    ? adverse.topReactions
        .map((r) => `  • ${r.term}: ${formatter.format(r.count)} reports`)
        .join("\n")
    : "  • No reaction data available"
}

## MEDICARE PART D SPENDING (CMS)
${
  spending
    ? `
- **Data Year:** ${spending.year}
- **Brand Name:** ${spending.brandName}
- **Generic Name:** ${spending.genericName}
- **Total Medicare Claims:** ${formatter.format(spending.totalClaims)}
- **Total Beneficiaries:** ${formatter.format(spending.totalBeneficiaries)}
- **Total Medicare Spending:** ${currency.format(spending.totalSpending)}
- **Avg Cost Per Claim:** ${currency.format(spending.avgCostPerClaim)}
`
    : `- No Medicare Part D spending data found for "${drugName}".`
}

## MEDICARE PRESCRIBER DATA (CMS)
${
  prescribers
    ? `
- **Total Prescribers in Medicare:** ${formatter.format(prescribers.totalPrescribers)}
- **Total Claims (sample):** ${formatter.format(prescribers.totalClaims)}
- **Top Prescribing States:**
${prescribers.topStates
  .map((s) => `  • ${s.state}: ${formatter.format(s.claims)} claims`)
  .join("\n")}
`
    : `- No prescriber data found for "${drugName}".`
}

---

When answering questions:
- Reference the real numbers above directly
- Flag safety signals from FAERS data as risks
- Compare spending and claim volume to identify market position
- If data is missing for a section, say so and offer framework-based guidance
- Keep responses under 250 words unless a deep-dive is requested`;
}