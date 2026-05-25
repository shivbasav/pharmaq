"use client";

import {
  BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { competitors, regions } from "@/lib/pharmaData";
import { TrendingDown, TrendingUp } from "lucide-react";

const statusColor: Record<string, string> = {
  growing:  "#3b82f6",
  declining: "#ef4444",
  stable:   "#64748b",
};

export default function CompetitorView() {
  return (
    <div className="space-y-4">

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Market Share Bar Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-1">
            Market Share — TRx
          </h3>
          <p className="text-xs text-slate-400 mb-4">Week 52, 2024</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart
              data={competitors}
              layout="vertical"
              margin={{ left: 10, right: 30, top: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#1e293b"
                horizontal={false}
              />
              <XAxis
                type="number"
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v}%`}
                domain={[0, 40]}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={75}
              />
              <Tooltip
                formatter={(value) => [`${value}%`, "TRx Share"]}
                contentStyle={{
                  background: "#0f172a",
                  border: "1px solid #1e293b",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                labelStyle={{ color: "#e2e8f0" }}
                itemStyle={{ color: "#94a3b8" }}
              />
              <Bar dataKey="share" radius={[0, 4, 4, 0]}>
                {competitors.map((c) => (
                  <Cell
                    key={c.name}
                    fill={statusColor[c.status]}
                    fillOpacity={c.name === "NEXIVARA" ? 1 : 0.5}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Regional Heatmap */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-1">
            Regional Performance
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            TRx Share vs National Average (34.2%)
          </p>
          <div className="flex flex-col gap-3">
            {regions.map((r) => {
              const isOver = r.vsNational >= 0;
              const barColor =
                r.vsNational > 2  ? "#3b82f6" :
                r.vsNational > 0  ? "#22c55e" :
                r.vsNational > -2 ? "#f59e0b" : "#ef4444";

              return (
                <div key={r.region} className="flex items-center gap-3">
                  <span className="text-xs text-slate-400 w-24 shrink-0">
                    {r.region}
                  </span>
                  <div className="flex-1 bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{
                        width: `${(r.share / 40) * 100}%`,
                        background: barColor,
                      }}
                    />
                  </div>
                  <span className="text-xs font-mono text-white w-10 text-right">
                    {r.share}%
                  </span>
                  <span className={`text-xs font-mono w-14 text-right ${
                    isOver ? "text-emerald-400" : "text-red-400"
                  }`}>
                    {isOver ? "+" : ""}{r.vsNational}pp
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Competitor Detail Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {competitors.slice(1).map((c) => (
          <div
            key={c.name}
            className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {c.status === "growing"
                  ? <TrendingUp size={13} className="text-blue-400" />
                  : <TrendingDown size={13} className="text-red-400" />
                }
                <span className="text-sm font-semibold text-white">
                  {c.name}
                </span>
              </div>
              <span className={`text-xs font-mono px-2 py-0.5 rounded-md border ${
                c.status === "growing"
                  ? "text-blue-400 bg-blue-400/10 border-blue-400/20"
                  : "text-red-400 bg-red-400/10 border-red-400/20"
              }`}>
                {c.yoyChange > 0 ? "+" : ""}{c.yoyChange}pp YoY
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-xs text-slate-500">TRx Share</p>
                <p className="text-xl font-mono font-semibold text-white">
                  {c.share}%
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">NBRx Share</p>
                <p className="text-xl font-mono font-semibold text-white">
                  {c.nbrxShare}%
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-400 border-t border-slate-800 pt-2">
              {c.note}
            </p>
          </div>
        ))}
      </div>

    </div>
  );
}