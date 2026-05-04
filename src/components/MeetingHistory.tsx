import { useState, useEffect } from "react";
import { Calendar, Search, ChevronRight, Filter, FileText, Activity, AlertTriangle } from "lucide-react";
import { cn } from "@/src/lib/utils";
import AnalysisDetail from "./AnalysisDetail";

interface Meeting {
  id: string;
  clientName: string;
  csName: string;
  date: string;
  score: number;
  health: string;
  churnRisk: string;
}

export default function MeetingHistory() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const res = await fetch("/api/meetings");
        setMeetings(await res.json());
      } catch (error) {
        console.error("Error fetching meetings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMeetings();
  }, []);

  const filteredMeetings = meetings.filter(m => 
    m.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.csName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (selectedMeetingId) {
    return <AnalysisDetail id={selectedMeetingId} onBack={() => setSelectedMeetingId(null)} />;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-nibo-petroleo">Histórico de Reuniões</h2>
          <p className="text-slate-500">Acesse todas as análises realizadas pelo sistema.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por cliente ou CS..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-nibo-gelo/30 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-nibo-roxo/20 focus:border-nibo-roxo w-64"
            />
          </div>
          <button className="p-2 bg-white border border-nibo-gelo/30 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-nibo-card border border-nibo-gelo/30 shadow-nibo overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-nibo-gelo/10">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">CS Responsável</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Data da Reunião</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Nota</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Saúde</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-nibo-gelo/10">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nibo-roxo mx-auto"></div>
                  </td>
                </tr>
              ) : filteredMeetings.length > 0 ? (
                filteredMeetings.map((meeting) => (
                  <tr 
                    key={meeting.id} 
                    className="hover:bg-nibo-gelo/5 transition-colors cursor-pointer group"
                    onClick={() => setSelectedMeetingId(meeting.id)}
                  >
                    <td className="px-6 py-4">
                      <div className="font-semibold text-nibo-petroleo">{meeting.clientName}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-nibo-roxo/10 flex items-center justify-center text-[10px] font-bold text-nibo-roxo">
                          {meeting.csName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="text-sm text-slate-600">{meeting.csName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5" />
                        {meeting.date}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={cn(
                        "px-2.5 py-1 rounded-lg text-xs font-bold",
                        meeting.score >= 4.5 ? "bg-emerald-100 text-emerald-700" : "bg-nibo-amarelo/20 text-nibo-petroleo"
                      )}>
                        {meeting.score.toFixed(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center">
                        <HealthBadge health={meeting.health} />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="p-2 rounded-lg bg-slate-50 text-slate-400 group-hover:text-nibo-roxo group-hover:bg-nibo-roxo/5 transition-colors inline-block">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    Nenhuma reunião encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function HealthBadge({ health }: { health: string }) {
  if (health === "Saudável") {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-100">
        <Activity className="w-3 h-3" />
        Saudável
      </div>
    );
  }
  if (health === "Atenção") {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-nibo-amarelo/10 text-nibo-petroleo border border-nibo-amarelo/20">
        <AlertTriangle className="w-3 h-3" />
        Atenção
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-nibo-pink/10 text-nibo-pink border border-nibo-pink/20">
      <AlertTriangle className="w-3 h-3" />
      Crítica
    </div>
  );
}
