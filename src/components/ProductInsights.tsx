import { useState, useEffect } from "react";
import { Bug, Lightbulb, Filter, Search, ChevronRight } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface Insight {
  id: number;
  type: "bug" | "improvement";
  description: string;
  product: string;
  frequency: number;
}

export default function ProductInsights() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [filter, setFilter] = useState("Todos");
  const [loading, setLoading] = useState(true);

  const products = ["Todos", "Nibo Gestão", "Nibo Contador"];

  useEffect(() => {
    const fetchInsights = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/insights?product=${filter}`);
        setInsights(await res.json());
      } catch (error) {
        console.error("Error fetching insights:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, [filter]);

  const bugs = insights.filter(i => i.type === "bug");
  const improvements = insights.filter(i => i.type === "improvement");

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-nibo-petroleo">Insights de Produto</h2>
          <p className="text-slate-500">Problemas e melhorias identificados nas transcrições.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-nibo-gelo/30 rounded-lg text-sm font-medium text-nibo-petroleo focus:outline-none focus:ring-2 focus:ring-nibo-roxo/20 focus:border-nibo-roxo appearance-none cursor-pointer"
            >
              {products.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Bugs Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-2">
            <div className="p-2 bg-nibo-pink/10 rounded-lg border border-nibo-pink/20">
              <Bug className="w-5 h-5 text-nibo-pink" />
            </div>
            <h3 className="font-bold text-nibo-petroleo">Bugs mais frequentes</h3>
            <span className="ml-auto text-xs font-bold text-slate-400 uppercase tracking-widest">{bugs.length} itens</span>
          </div>
          
          <div className="space-y-3">
            {loading ? (
              <div className="h-32 flex items-center justify-center bg-white rounded-nibo-card border border-nibo-gelo/30 border-dashed">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-nibo-roxo"></div>
              </div>
            ) : bugs.length > 0 ? (
              bugs.map(bug => (
                <div key={bug.id}>
                  <InsightCard insight={bug} />
                </div>
              ))
            ) : (
              <div className="p-8 text-center bg-white rounded-nibo-card border border-nibo-gelo/30 border-dashed">
                <p className="text-sm text-slate-500">Nenhum bug encontrado para este filtro.</p>
              </div>
            )}
          </div>
        </section>

        {/* Improvements Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-2">
            <div className="p-2 bg-nibo-azul-claro/10 rounded-lg border border-nibo-azul-claro/20">
              <Lightbulb className="w-5 h-5 text-nibo-azul-escuro" />
            </div>
            <h3 className="font-bold text-nibo-petroleo">Melhorias sugeridas</h3>
            <span className="ml-auto text-xs font-bold text-slate-400 uppercase tracking-widest">{improvements.length} itens</span>
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="h-32 flex items-center justify-center bg-white rounded-nibo-card border border-nibo-gelo/30 border-dashed">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-nibo-roxo"></div>
              </div>
            ) : improvements.length > 0 ? (
              improvements.map(improvement => (
                <div key={improvement.id}>
                  <InsightCard insight={improvement} />
                </div>
              ))
            ) : (
              <div className="p-8 text-center bg-white rounded-nibo-card border border-nibo-gelo/30 border-dashed">
                <p className="text-sm text-slate-500">Nenhuma melhoria encontrada para este filtro.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function InsightCard({ insight }: { insight: Insight }) {
  return (
    <div className="bg-white p-5 rounded-nibo-card border border-nibo-gelo/30 shadow-nibo hover:border-nibo-roxo/30 transition-all group cursor-pointer">
      <div className="flex justify-between items-start gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{insight.product}</span>
            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
            <span className="text-[10px] font-bold text-nibo-roxo">{insight.frequency} menções</span>
          </div>
          <p className="text-sm font-semibold text-nibo-petroleo leading-snug">{insight.description}</p>
        </div>
        <div className="p-2 rounded-lg bg-slate-50 text-slate-400 group-hover:text-nibo-roxo group-hover:bg-nibo-roxo/5 transition-colors">
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}
