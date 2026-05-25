# PharmaIQ — HQ Brand Analytics Assistant

> A conversational AI assistant for pharma commercial teams to monitor brand performance, launch uptake, market share, and competitor dynamics powered by real FDA + CMS data and Google Gemini AI.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Features](#2-features)
3. [Tech Stack](#3-tech-stack)
4. [Architecture](#4-architecture)
5. [Project Structure](#5-project-structure)
6. [Data Sources](#6-data-sources)
7. [AI Layer](#7-ai-layer)
8. [API Routes](#8-api-routes)
9. [Components](#9-components)
10. [Pharma Concepts](#10-pharma-concepts)
11. [Local Setup](#11-local-setup)
12. [Environment Variables](#12-environment-variables)
13. [Deploy to Vercel](#13-deploy-to-vercel)
14. [Push to GitHub](#14-push-to-github)
15. [Production Roadmap](#15-production-roadmap)

---

## 1. Project Overview

PharmaIQ is a full-stack web application that combines a **real-time pharma data layer** with a **conversational AI assistant**. It is designed for pharma HQ commercial teams brand directors, marketing analytics leads, and VPs — who need instant access to drug performance insights without writing SQL or navigating complex BI tools.

### The Problem It Solves

Traditional pharma dashboards are static. You see numbers but cannot ask follow-up questions. Analysts spend hours pulling reports from IQVIA, FDA, and CMS systems and assembling them into PowerPoints. PharmaIQ collapses that workflow into a single conversational interface search any drug, get live data, ask questions in plain English.

### How It Works

1. User searches for a drug (e.g. `alectinib`)
2. The app fetches live data from **FDA FAERS** (adverse events) and **CMS Medicare Part D** (prescription claims, spending)
3. That real data is injected into the AI system prompt as structured context
4. Google Gemini answers questions using only the real data no hallucination
5. Responses stream back word by word via Server Sent Events

---

## 2. Features

### Dashboard
- **8 KPI Cards** — TRx, NRx, Market Share, NBRx, Payer Coverage, Persistency, Weeks on Therapy, Days to First Rx
- **Launch Uptake Chart** — Actual vs Plan line chart with custom tooltips
- **Competitor Intelligence** — Horizontal bar chart comparing market share
- **Regional Performance** — 5-region heatmap vs national average
- **Prescriber Segmentation** — IQVIA decile analysis with action tags

### AI Assistant
- **Drug Search** — Type any real drug name to load live FDA + CMS data
- **Quick Chips** — Popular drug shortcuts
- **Streaming Chat** — Responses appear word-by-word via SSE
- **Dynamic Context** — AI grounded in real data for every drug searched
- **Conversation History** — Full multi-turn conversation per session

### Technical
- **Secure API Proxy** — API keys never exposed to the browser (BFF pattern)
- **Parallel Data Fetching** — FDA + CMS fetched simultaneously via Promise.all
- **24-hour Cache** — CMS responses cached to reduce API calls
- **Streaming Responses** — Server-Sent Events for real-time AI output
- **TypeScript Throughout** — Full type safety across all files

---

## 3. Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Framework | Next.js 14 (App Router) | API routes for secure server-side proxy + React frontend in one project |
| Language | TypeScript | Type safety across pharma data contracts |
| Styling | Tailwind CSS v4 | Utility-first dark theme |
| Charts | Recharts | Composable, responsive React charts |
| AI Model | Google Gemini 1.5 Flash | Free tier (1500 req/day), fast, strong reasoning |
| AI SDK | @google/generative-ai | Official SDK with streaming support |
| Markdown | react-markdown | Renders bold, bullets, code in AI responses |
| Icons | Lucide React | Clean, consistent icon set |
| Deployment | Vercel | Zero-config Next.js deployment |

---

## 4. Architecture

```
BROWSER (React)
├── KPIGrid        → 8 metric cards (mock IQVIA data)
├── ChatWindow     → drug search + streaming chat
├── UptakeChart    → Recharts line chart
└── CompetitorView → bar chart + regional heatmap
         |
         | Step 1: GET /api/pharma-data?drug=alectinib
         | Step 2: POST /api/chat { messages, systemPrompt }
         ▼
NEXT.JS SERVER (Node.js — API keys live here only)
├── /api/pharma-data/route.ts
│   → fetchDrugLabel + fetchAdverseEvents + fetchSpending + fetchPrescribers
│   → Promise.all (parallel, not sequential)
│   → buildContext() formats data into system prompt
│   → returns JSON to browser
│
└── /api/chat/route.ts
    → receives messages + system prompt
    → calls Gemini API with streaming
    → returns SSE stream to browser
         |
         ▼
EXTERNAL APIs (all free)
├── openFDA (api.fda.gov)       — adverse events, drug labels
├── CMS Medicare Part D         — prescription claims, spending
└── Google Gemini 1.5 Flash     — AI reasoning layer
```

### Key Architectural Decisions

**BFF Pattern (Backend For Frontend)**
The Next.js API routes act as a secure proxy. The Gemini API key is a server-side environment variable. The browser only ever calls `/api/chat` on your own domain the key is never exposed.

**Data Injection over Fine-tuning**
Real data is injected into the system prompt on every request. The model reasons over what you provide, it cannot hallucinate numbers. This is the correct pattern for regulated industries like pharma.

**Promise.all for Parallel Fetching**
All four external API calls (FDA label, FDA adverse events, CMS spending, CMS prescribers) fire simultaneously. Total wait time = the slowest single call, not the sum of all calls.

**SSE Streaming**
Without streaming, users wait 3-8 seconds for a full response. With SSE, the first token appears in ~300ms. The browser reads chunks and updates React state in real time.

---

## 5. Project Structure

```
pharmaiq/
├── app/
│   ├── api/
│   │   ├── chat/route.ts            # POST — Gemini AI proxy with SSE streaming
│   │   └── pharma-data/route.ts     # GET — FDA + CMS data orchestrator
│   ├── globals.css                  # Tailwind v4 base + dark theme
│   ├── layout.tsx                   # Root layout + metadata
│   └── page.tsx                     # Home page
│
├── components/
│   ├── Header.tsx                   # Sticky top bar
│   ├── Dashboard.tsx                # Tab controller
│   ├── KPIGrid.tsx                  # 8 metric cards
│   ├── ChatWindow.tsx               # Drug search + streaming chat
│   ├── MessageBubble.tsx            # Individual message renderer
│   ├── UptakeChart.tsx              # Launch uptake line chart
│   └── CompetitorView.tsx           # Bar chart + heatmap + cards
│
├── lib/
│   ├── fdaApi.ts                    # openFDA API client
│   ├── cmsApi.ts                    # CMS Medicare Part D API client
│   ├── buildContext.ts              # Formats real data into AI system prompt
│   ├── pharmaData.ts                # Mock IQVIA data for KPIs + charts
│   └── systemPrompt.ts             # Fallback system prompt (mock mode)
│
├── types/index.ts                   # TypeScript interfaces
├── .env.local                       # API keys — NEVER committed
├── .env.example                     # Template — safe to commit
└── .gitignore                       # Excludes .env.local, node_modules, .next
```

---

## 6. Data Sources

### openFDA — FAERS Adverse Event Database

**Base URL:** `https://api.fda.gov/drug`
**Auth:** None required
**Rate limit:** 240 requests/minute

What we fetch:

```
# Total adverse event reports
GET /drug/event.json?search=patient.drug.medicinalproduct:"alectinib"&limit=1
→ meta.results.total

# Serious reports only
GET /drug/event.json?search=...+AND+serious:1&limit=1
→ meta.results.total

# Top adverse reactions (aggregated count)
GET /drug/event.json?search=...&count=patient.reaction.reactionmeddrapt.exact&limit=8
→ [{ term: "NAUSEA", count: 1240 }, ...]

# Drug label (brand name, indication, warnings)
GET /drug/label.json?search=openfda.brand_name:"alectinib"&limit=1
→ indications_and_usage, warnings, adverse_reactions
```

**Why it matters in pharma:** FAERS monitoring is a core pharmacovigilance activity. A spike in serious adverse event reports can trigger FDA label updates, black box warnings, or market actions. This is real competitive intelligence — a competitor's safety signal is a commercial opportunity.

---

### CMS Medicare Part D

**Base URL:** `https://data.cms.gov/data-api/v1/dataset`
**Auth:** None required
**Data refresh:** Annual

| Dataset ID | Name | Key Fields |
|---|---|---|
| `9552-md9e` | Drug Spending by Drug | tot_clms, tot_benes, tot_spndng, avg_spnd_per_clm |
| `240a-5sxe` | Prescribers by Drug | nppes_provider_state, tot_clms |

```
# Drug spending (most recent year)
GET /dataset/9552-md9e/data?filter[brnd_name]=ALECTINIB&size=5&sort[year]=desc

# Prescriber data aggregated by state
GET /dataset/240a-5sxe/data?filter[brnd_name]=ALECTINIB&size=100
```

**Why it matters:** For oncology drugs, a large portion of patients are Medicare-eligible. This data provides real prescription volumes, patient counts, and cost burden the closest free equivalent to IQVIA TRx data.

**Known limitation:** CMS data is annual (not weekly like IQVIA) and covers Medicare only. In production this would be supplemented with IQVIA MIDAS for commercial + Medicare + Medicaid combined.

---

## 7. AI Layer

### The Data Injection Pattern

The model has no built in knowledge of current drug data. Instead of relying on training data, we inject real numbers into every request as a structured system prompt.

```
buildContext.ts formats raw API data into:

"You are PharmaIQ...

 ADVERSE EVENT SIGNALS (FDA FAERS):
 - Total Reports: 12,450
 - Serious Reports: 8,230 (66.1%)
 - Top Reactions: Nausea (1,240), Fatigue (980)...

 MEDICARE PART D (CMS):
 - Total Claims: 45,230
 - Total Spending: $892,000,000
 - Top State: California (8,200 claims)..."

This string becomes the system prompt → Gemini reads it → answers with real numbers
```

This prevents hallucination entirely. The model reasons over data you provide, it cannot invent numbers because real numbers are already in context. Critical for pharma compliance.

### Streaming with SSE

```typescript
// Server: sends chunks as SSE events
for await (const chunk of result.stream) {
  controller.enqueue(`data: {"text": "${chunk.text()}"}\n\n`);
}

// Browser: reads chunks, updates React state in real time
const reader = res.body?.getReader();
while (reader) {
  const { done, value } = await reader.read();
  accumulated += parsed.text;
  setMessages(prev => {
    updated[updated.length - 1] = { role: "assistant", content: accumulated };
    return updated;
  });
}
```

First token appears in ~300ms. No 5-second loading spinner.

### Conversation History

Full history is maintained in React state and sent with every request:

```typescript
messages: [
  { role: "user",  content: "What are the top adverse events?" },
  { role: "model", content: "Top reactions are nausea (1,240)..." },
  { role: "user",  content: "How does that compare to osimertinib?" }
  // ← current message appended here
]
```

---

## 8. API Routes

### `GET /api/pharma-data?drug={name}`

**What it does:**
1. Fires 4 external API calls in parallel (Promise.all)
2. Formats results into AI system prompt via `buildContext()`
3. Returns all data + system prompt as JSON

**Response:**
```json
{
  "drug": "alectinib",
  "label": { "brandName": "ALECENSA", "genericName": "alectinib" },
  "adverse": { "totalReports": 12450, "seriousReports": 8230, "topReactions": [...] },
  "spending": { "totalClaims": 45230, "totalSpending": 892000000 },
  "prescribers": { "totalPrescribers": 1240, "topStates": [...] },
  "systemPrompt": "You are PharmaIQ... [full context]"
}
```

### `POST /api/chat`

**Request:**
```json
{
  "messages": [{ "role": "user", "content": "What are the safety signals?" }],
  "systemPrompt": "...optional real data context..."
}
```

**Response:** `text/event-stream`
```
data: {"text": "The "}
data: {"text": "top "}
data: {"text": "adverse "}
data: {"done": true}
```

Falls back to mock system prompt if no `systemPrompt` provided (mock data mode).

---

## 9. Components

| Component | Responsibility |
|---|---|
| `Header.tsx` | Brand badge, IQVIA data source label, sticky top bar |
| `Dashboard.tsx` | Tab state, conditional rendering of tab content |
| `KPIGrid.tsx` | 8 metric cards from mock pharmaData — always visible |
| `ChatWindow.tsx` | Drug search, data loading, streaming chat, status indicator |
| `MessageBubble.tsx` | User (blue right) / AI (dark left) with markdown rendering |
| `UptakeChart.tsx` | Recharts LineChart — Actual vs Plan with custom tooltip |
| `CompetitorView.tsx` | Horizontal BarChart + regional heatmap + competitor cards |

---

## 10. Pharma Concepts

| Term | Definition |
|---|---|
| **TRx** | Total Prescriptions — all scripts including refills |
| **NRx** | New Prescriptions — first script for a patient |
| **NBRx** | New-to-Brand — patient switching from a competitor |
| **Market Share (pp)** | Brand share of total category scripts; change measured in percentage points |
| **Persistency** | % of patients still on therapy at X months |
| **Payer Coverage** | % of insurance plans covering the drug |
| **Launch Uptake Curve** | Market share growth trajectory post-FDA approval |
| **IQVIA MIDAS** | Industry standard commercial prescription data platform |
| **FAERS** | FDA Adverse Event Reporting System — post-market safety database |
| **Decile Segmentation** | Ranking prescribers 1–10 by volume for field force targeting |
| **NSCLC** | Non-Small Cell Lung Cancer — ~85% of lung cancers |
| **ALK+** | ALK gene rearrangement — targetable oncology mutation |

---

## 11. Local Setup

### Prerequisites
- Node.js 18+ (`node -v`)
- Free Gemini API key from [aistudio.google.com](https://aistudio.google.com)

### Steps

```bash
git clone https://github.com/YOUR_USERNAME/pharmaiq.git
cd pharmaiq
npm install
cp .env.example .env.local
# Add GEMINI_API_KEY to .env.local
npm run dev
# Open http://localhost:3000
```

### Scripts

```bash
npm run dev      # Dev server with hot reload
npm run build    # Production build (catches TypeScript errors)
npm run start    # Start production server
npm run lint     # ESLint
```

---

## 12. Environment Variables

| Variable | Required | Source |
|---|---|---|
| `GEMINI_API_KEY` | Yes | [aistudio.google.com](https://aistudio.google.com) → Get API Key |

```bash
# .env.local
GEMINI_API_KEY=AIza...your_key_here
```

**Security:** `.env.local` is in `.gitignore`. The key is only read in `app/api/chat/route.ts` — server-side only. Never reaches the browser.

Verify it is ignored before pushing:
```bash
git check-ignore -v .env.local
```

---

## 13. Deploy to Vercel

### GitHub Integration (Recommended)

1. Push to GitHub (see section 14)
2. Go to [vercel.com](https://vercel.com) → **Add New Project**
3. Import your repo
4. Add environment variable: `GEMINI_API_KEY`
5. Click **Deploy** (~60 seconds)

Auto-deploys on every `git push` to `main`.

### Vercel CLI

```bash
npm install -g vercel
vercel
vercel env add GEMINI_API_KEY
vercel --prod
```

---

## 14. Push to GitHub

```bash
git init
git add .
git status        # Verify .env.local is NOT listed
git commit -m "feat: PharmaIQ HQ analytics assistant with FDA + CMS live data"

# GitHub CLI
gh repo create pharmaiq --public --push

# Or manually
git remote add origin https://github.com/YOUR_USERNAME/pharmaiq.git
git branch -M main
git push -u origin main
```

---

## License

MIT

---

*Built by Shivabasava — Full-Stack Developer & GenAI Engineer*
*Stack: Next.js 14 · TypeScript · Tailwind CSS v4 · Google Gemini · openFDA · CMS Medicare Part D*
