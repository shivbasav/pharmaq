"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Brain, Search, Database } from "lucide-react";
import MessageBubble from "./MessageBubble";
import type { ChatMessage } from "@/types";

const POPULAR_DRUGS = [
  "alectinib",
  "osimertinib",
  "pembrolizumab",
  "nivolumab",
  "trastuzumab",
  "bevacizumab",
];

const WELCOME: ChatMessage = {
  role: "assistant",
  content: `Hello — I'm **PharmaIQ**, your real-time pharma analytics assistant.

Search for any drug above to load live data from **FDA** and **CMS Medicare Part D**. I'll analyze adverse events, prescriber patterns, Medicare spending, and safety signals.

Try: \`alectinib\`, \`pembrolizumab\`, or \`osimertinib\``,
};

export default function ChatWindow() {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [drugQuery, setDrugQuery] = useState("");
  const [activeDrug, setActiveDrug] = useState<string | null>(null);
  const [systemPrompt, setSystemPrompt] = useState<string | null>(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch real FDA + CMS data for a drug
  const loadDrug = async (name: string) => {
    const drug = name.trim().toLowerCase();
    if (!drug) return;

    setDataLoading(true);
    setDataError(null);
    setActiveDrug(drug);
    setMessages([
      {
        role: "assistant",
        content: `Loading live FDA and CMS data for **${drug}**...`,
      },
    ]);

    try {
      const res = await fetch(`/api/pharma-data?drug=${encodeURIComponent(drug)}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error ?? "Failed to fetch");

      setSystemPrompt(data.systemPrompt);

      // Build a summary message from real data
      const spending = data.spending;
      const adverse = data.adverse;
      const prescribers = data.prescribers;
      const label = data.label;

      const fmt = (n: number) => n.toLocaleString("en-US");
      const usd = (n: number) =>
        n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

      let summary = `✅ Live data loaded for **${drug.toUpperCase()}**\n\n`;

      if (label) {
        summary += `**Drug:** ${label.brandName} (${label.genericName})\n`;
        summary += `**Manufacturer:** ${label.manufacturer}\n\n`;
      }

      if (adverse.totalReports > 0) {
        summary += `**FDA Adverse Events:** ${fmt(adverse.totalReports)} total reports`;
        summary += ` (${fmt(adverse.seriousReports)} serious)\n`;
        if (adverse.topReactions.length > 0) {
          summary += `**Top reaction:** ${adverse.topReactions[0].term}\n`;
        }
        summary += "\n";
      }

      if (spending) {
        summary += `**Medicare Part D (${spending.year}):**\n`;
        summary += `• Total Claims: ${fmt(spending.totalClaims)}\n`;
        summary += `• Total Beneficiaries: ${fmt(spending.totalBeneficiaries)}\n`;
        summary += `• Total Medicare Spending: ${usd(spending.totalSpending)}\n`;
        summary += `• Avg Cost Per Claim: ${usd(spending.avgCostPerClaim)}\n\n`;
      }

      if (prescribers) {
        summary += `**Prescribers in Medicare:** ${fmt(prescribers.totalPrescribers)}\n`;
        if (prescribers.topStates.length > 0) {
          summary += `**Top state:** ${prescribers.topStates[0].state} `;
          summary += `(${fmt(prescribers.topStates[0].claims)} claims)\n\n`;
        }
      }

      summary += `Ask me anything about this drug's safety profile, spending trends, prescriber patterns, or market position.`;

      setMessages([{ role: "assistant", content: summary }]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setDataError(msg);
      setMessages([
        {
          role: "assistant",
          content: `❌ Could not load data for **${drug}**. ${msg}\n\nTry a different drug name or check the spelling.`,
        },
      ]);
    } finally {
      setDataLoading(false);
      inputRef.current?.focus();
    }
  };

  const sendMessage = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;

    const userMsg: ChatMessage = { role: "user", content };
    const history = messages.filter(
      (m) => m.role !== "assistant" || messages.indexOf(m) !== 0
    );
    const newHistory = [...history, userMsg];

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: "" },
    ]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newHistory,
          systemPrompt: systemPrompt ?? undefined,
        }),
      });

      if (!res.ok) throw new Error("API error");

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        const lines = decoder.decode(value).split("\n");
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const parsed = JSON.parse(line.slice(6));
            if (parsed.done) break;
            if (parsed.text) {
              accumulated += parsed.text;
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  role: "assistant",
                  content: accumulated,
                };
                return updated;
              });
            }
          } catch {
            // skip malformed chunks
          }
        }
      }
    } catch {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: "Connection error. Please check your API key and try again.",
        };
        return updated;
      });
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="flex flex-col bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden">

      {/* Drug search bar */}
      <div className="px-4 py-3 border-b border-slate-800 bg-slate-900/60">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              type="text"
              value={drugQuery}
              onChange={(e) => setDrugQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && loadDrug(drugQuery)}
              placeholder="Search any drug name (e.g. alectinib, pembrolizumab)…"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-4 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
            />
          </div>
          <button
            onClick={() => loadDrug(drugQuery)}
            disabled={dataLoading || !drugQuery.trim()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
          >
            {dataLoading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Database size={14} />
            )}
            Load Data
          </button>
        </div>

        {/* Popular drug chips */}
        <div className="flex gap-2 mt-2 flex-wrap">
          <span className="text-xs text-slate-600">Try:</span>
          {POPULAR_DRUGS.map((d) => (
            <button
              key={d}
              onClick={() => {
                setDrugQuery(d);
                loadDrug(d);
              }}
              className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                activeDrug === d
                  ? "border-blue-500/50 text-blue-300 bg-blue-500/10"
                  : "border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-300"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Chat header */}
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-slate-800 bg-slate-900/40">
        <div className="w-7 h-7 rounded-full bg-slate-800 border border-blue-500/30 flex items-center justify-center">
          <Brain size={14} className="text-blue-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white leading-none">
            PharmaIQ Assistant
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            {activeDrug
              ? `Analyzing: ${activeDrug.toUpperCase()} · FDA + CMS Live Data`
              : "Search a drug to load live data"}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <span
            className={`w-2 h-2 rounded-full ${
              activeDrug && !dataLoading
                ? "bg-emerald-400 animate-pulse"
                : "bg-slate-600"
            }`}
          />
          <span
            className={`text-xs ${
              activeDrug && !dataLoading
                ? "text-emerald-400"
                : "text-slate-500"
            }`}
          >
            {dataLoading ? "Loading…" : activeDrug ? "Live" : "Idle"}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="h-[420px] overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} />
        ))}

        {loading && messages[messages.length - 1]?.content === "" && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full bg-slate-800 border border-blue-500/20 flex items-center justify-center shrink-0">
              <Brain size={13} className="text-blue-400" />
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1.5 items-center h-4">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 px-4 py-3 border-t border-slate-800 bg-slate-900/60">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder={
            activeDrug
              ? `Ask about ${activeDrug}…`
              : "Load a drug first, then ask questions…"
          }
          disabled={loading || !activeDrug}
          className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all disabled:opacity-50"
        />
        <button
          onClick={() => sendMessage()}
          disabled={loading || !input.trim() || !activeDrug}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
        >
          {loading
            ? <Loader2 size={15} className="text-white animate-spin" />
            : <Send size={15} className="text-white" />
          }
        </button>
      </div>

    </div>
  );
}