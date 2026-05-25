"use client";

import {
  Pill, PieChart, UserPlus, ShieldCheck,
  Activity, Calendar, TrendingUp, Clock,
} from "lucide-react";
import { kpis } from "@/lib/pharmaData";
import type { KPI } from "@/types";

const iconMap: Record<string, React.ElementType> = {
  "pill": Pill,
  "pie-chart": PieChart,
  "user-plus": UserPlus,
  "shield-check": ShieldCheck,
  "activity": Activity,
  "calendar": Calendar,
  "trending-up": TrendingUp,
  "clock": Clock,
};

function KPICard({ kpi }: { kpi: KPI }) {
  const Icon = iconMap[kpi.icon] || Activity;
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-2 hover:border-blue-500/40 transition-colors duration-200">
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">
          {kpi.label}
        </span>
        <Icon size={13} className="text-blue-400 opacity-60" />
      </div>
      <div className="text-2xl font-mono font-semibold text-white tracking-tight">
        {kpi.value}
      </div>
      <div className={`text-xs font-medium ${
        kpi.trend === "up" ? "text-emerald-400" :
        kpi.trend === "down" ? "text-red-400" :
        "text-slate-500"
      }`}>
        {kpi.delta}
      </div>
    </div>
  );
}

export default function KPIGrid() {
  return (
    <section>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {kpis.slice(0, 4).map((kpi) => (
          <KPICard key={kpi.label} kpi={kpi} />
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
        {kpis.slice(4).map((kpi) => (
          <KPICard key={kpi.label} kpi={kpi} />
        ))}
      </div>
    </section>
  );
}