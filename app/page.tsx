import Header from "@/components/Header";
import Dashboard from "@/components/Dashboard";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#060d1a]">
      <Header />
      <main className="max-w-screen-xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Brand Command Center
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            NEXIVARA · ALK+ Metastatic NSCLC · HQ Analytics Dashboard
          </p>
        </div>
        <Dashboard />
      </main>
    </div>
  );
}