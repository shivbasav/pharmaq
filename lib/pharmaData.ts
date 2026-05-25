import type { KPI, Competitor, RegionData, UptakePoint } from "@/types";

export const BRAND_NAME = "NEXIVARA";
export const INDICATION = "ALK+ Metastatic NSCLC";
export const DATA_PERIOD = "Week 52, 2024";

export const kpis: KPI[] = [
  { label: "Total TRx", value: "18,234", delta: "↑ 12% YoY", trend: "up", icon: "pill" },
  { label: "Market Share TRx", value: "34.2%", delta: "↑ +2.1pp vs LY", trend: "up", icon: "pie-chart" },
  { label: "NRx (New Patients)", value: "4,102", delta: "↑ 8% YoY", trend: "up", icon: "user-plus" },
  { label: "Payer Coverage", value: "87%", delta: "Commercial", trend: "neutral", icon: "shield-check" },
  { label: "6-Month Persistency", value: "71%", delta: "↑ vs 58% cat. avg", trend: "up", icon: "activity" },
  { label: "Avg Weeks on Therapy", value: "18.3 wks", delta: "↑ from 15.1 at launch", trend: "up", icon: "calendar" },
  { label: "NBRx Market Share", value: "38.7%", delta: "↑ +3.2pp vs LY", trend: "up", icon: "trending-up" },
  { label: "Days to First Rx", value: "6.2 days", delta: "↓ from 8.1 at launch", trend: "up", icon: "clock" },
];

export const uptakeCurve: UptakePoint[] = [
  { month: "M1",  actual: 0.8,  plan: 1.0  },
  { month: "M3",  actual: 4.2,  plan: 4.0  },
  { month: "M6",  actual: 12.8, plan: 11.5 },
  { month: "M9",  actual: 20.4, plan: 19.0 },
  { month: "M12", actual: 27.1, plan: 25.0 },
  { month: "M15", actual: 30.9, plan: 29.5 },
  { month: "M18", actual: 33.0, plan: 31.0 },
  { month: "M21", actual: 34.2, plan: 32.0 },
];

export const competitors: Competitor[] = [
  { name: "NEXIVARA", share: 34.2, nbrxShare: 38.7, yoyChange: 2.1,  status: "growing",  note: "M21 — ahead of plan by +2.2pp" },
  { name: "CARBETIX", share: 28.1, nbrxShare: 24.3, yoyChange: -1.4, status: "declining", note: "FDA label update: hepatotoxicity warning Jan 2024" },
  { name: "LUMIVEX",  share: 22.7, nbrxShare: 21.4, yoyChange: 0.9,  status: "growing",  note: "ASCO 2024 Phase 3 data — potential 1L expansion Q2 2025" },
  { name: "TARGONEX", share: 15.0, nbrxShare: 15.6, yoyChange: -1.6, status: "declining", note: "3L+ pool shrinking as patients move to earlier lines" },
];

export const regions: RegionData[] = [
  { region: "Northeast",    share: 36.4, vsNational:  2.2 },
  { region: "Midwest",      share: 35.0, vsNational:  0.8 },
  { region: "West",         share: 33.8, vsNational: -0.4 },
  { region: "Southeast",    share: 32.1, vsNational: -2.1 },
  { region: "South Central",share: 31.2, vsNational: -3.0 },
];

export const suggestedQuestions = [
  "What's our current market share trend?",
  "Where are we losing share to CARBETIX?",
  "How does our launch uptake compare to plan?",
  "Which regions need the most attention?",
  "What's the LUMIVEX threat level?",
  "Where are the prescriber opportunity gaps?",
  "Why are patients discontinuing?",
  "What are our payer coverage gaps?",
];