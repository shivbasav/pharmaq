"use client";

import { useState } from "react";
import { MessageSquare, BarChart2, Trophy } from "lucide-react";
import KPIGrid from "./KPIGrid";
import ChatWindow from "./ChatWindow";
import UptakeChart from "./UptakeChart";
import CompetitorView from "./CompetitorView";

const tabs = [
  { id: "chat",        label: "AI Assistant", icon: MessageSquare },
  { id: "performance", label: "Performance",  icon: BarChart2     },
  { id: "competitors", label: "Competitors",  icon: Trophy        },
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("chat");

  return (
    <div className="space-y-6">

      {/* KPI cards — always visible */}
      <KPIGrid />

      {/* Tab bar */}
      <div className="flex gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1 w-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {activeTab === "chat" && <ChatWindow />}

      {activeTab === "performance" && (
        <div className="space-y-4">
          <UptakeChart />

          {/* Prescriber Segmentation */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-1">
              Prescriber Segmentation
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              IQVIA Decile · NEXIVARA TRx Market Share
            </p>
            <div className="space-y-3">
              {[
                { label: "Decile 10 — Top 200 HCPs", trx: "24.3/mo", share: 89, tag: "Defend",        color: "emerald" },
                { label: "Decile 8–9 — High Value",  trx: "8.7/mo",  share: 67, tag: "Grow",          color: "blue"    },
                { label: "Decile 5–7 — Mid Tier",    trx: "3.2/mo",  share: 41, tag: "Opportunity",   color: "amber"   },
                { label: "Decile 1–4 — Low Volume",  trx: "0.8/mo",  share: 23, tag: "De-prioritize", color: "slate"   },
              ].map((row) => (
                <div key={row.label} className="flex items-center gap-3">
                  <div className="w-44 shrink-0">
                    <p className="text-xs text-slate-300">{row.label}</p>
                    <p className="text-xs text-slate-500 font-mono">{row.trx} avg TRx</p>
                  </div>
                  <div className="flex-1 bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-2 rounded-full bg-blue-500 transition-all"
                      style={{ width: `${row.share}%`, opacity: 0.3 + (row.share / 100) * 0.7 }}
                    />
                  </div>
                  <span className="text-sm font-mono font-semibold text-white w-8 text-right">
                    {row.share}%
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-md border shrink-0 ${
                    row.color === "emerald" ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" :
                    row.color === "blue"    ? "text-blue-400 bg-blue-400/10 border-blue-400/20"         :
                    row.color === "amber"   ? "text-amber-400 bg-amber-400/10 border-amber-400/20"       :
                                             "text-slate-500 bg-slate-500/10 border-slate-500/20"
                  }`}>
                    {row.tag}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "competitors" && <CompetitorView />}

    </div>
  );
}