"use client";

import {
  LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { uptakeCurve } from "@/lib/pharmaData";

const CustomTooltip = ({
  active, payload, label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) => {
  if (active && payload && payload.length) {
    const actual = payload.find((p) => p.name === "Actual");
    const plan = payload.find((p) => p.name === "Plan");
    const diff = actual && plan ? (actual.value - plan.value).toFixed(1) : null;

    return (
      <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm">
        <p className="text-slate-300 font-medium mb-2">{label}</p>
        {payload.map((p) => (
          <p key={p.name} style={{ color: p.color }} className="font-mono">
            {p.name}: {p.value}%
          </p>
        ))}
        {diff !== null && (
          <p className="text-emerald-400 text-xs mt-1.5 font-mono border-t border-slate-700 pt-1.5">
            vs Plan: {Number(diff) >= 0 ? "+" : ""}{diff}pp
          </p>
        )}
      </div>
    );
  }
  return null;
};

export default function UptakeChart() {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">

      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-white">
            Launch Uptake Curve
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            TRx Market Share % — Actual vs Plan
          </p>
        </div>
        <span className="text-xs font-mono font-semibold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-1 rounded-md">
          +2.2pp ahead of plan
        </span>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <LineChart
          data={uptakeCurve}
          margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis
            dataKey="month"
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            axisLine={{ stroke: "#1e293b" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{
              fontSize: "12px",
              color: "#94a3b8",
              paddingTop: "8px",
            }}
          />
          <Line
            type="monotone"
            dataKey="actual"
            name="Actual"
            stroke="#3b82f6"
            strokeWidth={2.5}
            dot={{ fill: "#3b82f6", r: 4 }}
            activeDot={{ r: 6, fill: "#60a5fa" }}
          />
          <Line
            type="monotone"
            dataKey="plan"
            name="Plan"
            stroke="#475569"
            strokeWidth={2}
            strokeDasharray="5 4"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>

    </div>
  );
}