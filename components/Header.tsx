import { Brain, Database, TrendingUp } from "lucide-react";
import { BRAND_NAME, DATA_PERIOD, INDICATION } from "@/lib/pharmaData";

export default function Header() {
  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="max-w-screen-xl mx-auto px-6 py-4 flex items-center justify-between">

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
            <Brain size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight">
              PharmaIQ
            </h1>
            <p className="text-xs text-slate-500">HQ Brand Analytics Assistant</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5">
            <TrendingUp size={12} className="text-blue-400" />
            <span className="font-medium text-slate-300">{BRAND_NAME}</span>
            <span className="text-slate-600">·</span>
            <span>{INDICATION}</span>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5">
            <Database size={12} className="text-emerald-400" />
            <span>IQVIA MIDAS</span>
            <span className="text-slate-600">·</span>
            <span className="text-emerald-400">{DATA_PERIOD}</span>
          </div>
        </div>

      </div>
    </header>
  );
}