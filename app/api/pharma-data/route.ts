import { NextRequest, NextResponse } from "next/server";
import { fetchAdverseEvents, fetchDrugLabel } from "@/lib/fdaApi";
import { fetchDrugSpending, fetchPrescriberSummary } from "@/lib/cmsApi";
import { buildSystemPrompt } from "@/lib/buildContext";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const drug = searchParams.get("drug")?.trim();

  if (!drug) {
    return NextResponse.json(
      { error: "Missing drug query parameter" },
      { status: 400 }
    );
  }

  try {
    // Fetch all sources in parallel
    const [label, adverse, spending, prescribers] = await Promise.all([
      fetchDrugLabel(drug),
      fetchAdverseEvents(drug),
      fetchDrugSpending(drug),
      fetchPrescriberSummary(drug),
    ]);

    // Build dynamic system prompt from real data
    const systemPrompt = buildSystemPrompt(
      drug,
      label,
      adverse,
      spending,
      prescribers
    );

    return NextResponse.json({
      drug,
      label,
      adverse,
      spending,
      prescribers,
      systemPrompt,
    });
  } catch (error) {
    console.error("pharma-data error:", error);
    return NextResponse.json(
      { error: "Failed to fetch pharma data" },
      { status: 500 }
    );
  }
}