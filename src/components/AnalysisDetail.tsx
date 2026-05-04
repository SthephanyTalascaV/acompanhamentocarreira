import { ArrowLeft, Download, Activity, AlertTriangle, Clock, CheckCircle2, XCircle, Lightbulb, TrendingUp, Target, Bug, AlertCircle } from "lucide-react";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from "recharts";
import { cn } from "@/src/lib/utils";

interface AnalysisDetailProps {
  id: string;
  onBack: () => void;
}

export default function AnalysisDetail({ id, onBack }: AnalysisDetailProps) {
  // Mock data for a specific analysis
  const data = {
    cliente_nome: "Contabilidade Express",
    data_analise: "14/04/2026",
    analista_nome: "Sthephany Talasca",
    resumo_executivo: "Reunião de acompanhamento mensal. O cliente demonstrou satisfação com as novas funcionalidades de conciliação bancária, mas relatou dificuldades pontuais na integração com o banco Itaú. O CS conduziu bem a reunião, mantendo o controle do tempo e focando nos próximos passos.",
    saude_cliente: "Saudável",
    risco_churn: "Baixo",
    produto_reuniao: "Nibo Gestão",
    tempo_fala_cs: "65%",
    tempo_fala_cliente: "35%",
    media_final: 4.8,
    radar_data: [
      { subject: 'Consultividade', A: 5 },
      { subject: 'Escuta Ativa', A: 4 },
      { subject: 'Jornada', A: 5 },
      { subject: 'Encantamento', A: 4 },
      { subject: 'Objeções', A: 5 },
      { subject: 'Rapport', A: 5 },
      { subject: 'Autoridade', A: 4 },
      { subject: 'Postura', A: 5 },
      { subject: 'Gestão Tempo', A: 5 },
    ],
    checklist: {
      apresentou: true,
      contextualizou: true,
      identificou: true,
      apresentou_solucao: true,
      proximos_passos: true,
      agendou_followup: false,
    },
    pontos_fortes: [
      "Excelente domínio técnico do produto",
      "Rapport muito bem estabelecido no início",
      "Condução objetiva e focada em resultados"
    ],
    pontos_atencao: [
      "Poderia ter explorado mais as dores de expansão",
      "Faltou agendar o follow-up exato durante a call"
    ],
    bugs: [
      { descricao: "Lentidão no carregamento do extrato Itaú", impacto: "Médio", frase_cliente: "Demora muito pra carregar quando tem muitas transações." }
    ],
    melhorias: [
      { descricao: "Exportação em massa de PDFs de notas", tipo: "Produto", frase_cliente: "Seria ótimo se desse pra baixar tudo de uma vez." }
    ]
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <button onClick={onBack} className="text-xs text-slate-400 hover:text-nibo-roxo flex items-center gap-1 mb-2 transition-colors">
            <ArrowLeft className="w-3 h-3" /> Voltar ao Histórico
          </button>
          <h2 className="text-2xl font-bold text-nibo-petroleo tracking-tight">{data.cliente_nome}</h2>
          <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
            <span>{data.data_analise}</span> • <span>{data.analista_nome}</span>
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-nibo-gelo/30 hover:bg-slate-50 text-nibo-petroleo rounded-xl text-xs font-semibold transition-all shadow-sm">
          <Download className="w-4 h-4" /> Exportar PDF
        </button>
      </div>

      {/* Row 1: Summary and Talk Time */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-nibo-gelo/30 rounded-nibo-card p-6 shadow-nibo">
          <h3 className="text-sm font-semibold text-nibo-petroleo mb-3">Resumo Executivo</h3>
          <p className="text-sm text-slate-600 leading-relaxed mb-4">{data.resumo_executivo}</p>
          
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-slate-100">
            <Badge icon={Activity} label={`Saúde: ${data.saude_cliente}`} color="emerald" />
            <Badge icon={AlertTriangle} label={`Risco Churn: ${data.risco_churn}`} color="emerald" />
            <Badge label={data.produto_reuniao} color="slate" />
          </div>
        </div>

        <div className="bg-white border border-nibo-gelo/30 rounded-nibo-card p-6 shadow-nibo">
          <h3 className="text-sm font-semibold text-nibo-petroleo mb-5 flex items-center gap-2">
            <Clock className="w-4 h-4 text-nibo-azul-escuro" /> Tempo de Fala
          </h3>
          <div className="space-y-5">
            <ProgressBar label="CS" value={data.tempo_fala_cs} color="purple" />
            <ProgressBar label="Cliente" value={data.tempo_fala_cliente} color="blue" />
          </div>
        </div>
      </div>

      {/* Row 2: Radar and Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-nibo-gelo/30 rounded-nibo-card p-6 shadow-nibo flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-semibold text-nibo-petroleo">Pilares de Qualidade</h3>
            <span className="text-xs font-bold px-2 py-1 rounded-md bg-nibo-gelo/10 text-slate-600">Nota média: <span className="text-nibo-petroleo">{data.media_final.toFixed(1)}</span></span>
          </div>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data.radar_data}>
                <PolarGrid stroke="#f1f5f9" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: "#64748b" }} />
                <Radar
                  name="CS"
                  dataKey="A"
                  stroke="#6431e2"
                  fill="#6431e2"
                  fillOpacity={0.1}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-nibo-gelo/30 rounded-nibo-card p-6 shadow-nibo">
          <h3 className="text-sm font-semibold text-nibo-petroleo mb-5">Checklist da Reunião</h3>
          <div className="space-y-3">
            <CheckItem label="Apresentou-se" checked={data.checklist.apresentou} />
            <CheckItem label="Contextualizou a reunião" checked={data.checklist.contextualizou} />
            <CheckItem label="Identificou necessidades" checked={data.checklist.identificou} />
            <CheckItem label="Apresentou solução" checked={data.checklist.apresentou_solucao} />
            <CheckItem label="Definiu próximos passos" checked={data.checklist.proximos_passos} />
            <CheckItem label="Agendou follow-up" checked={data.checklist.agendou_followup} />
          </div>
        </div>
      </div>

      {/* Row 3: Strengths and Improvements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-emerald-200 rounded-nibo-card p-6 shadow-nibo">
          <h3 className="text-sm font-semibold text-emerald-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" /> Pontos Fortes
          </h3>
          <ul className="space-y-2 text-sm text-slate-600">
            {data.pontos_fortes.map((p, i) => (
              <li key={i} className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0"></div> {p}
              </li>
            ))}
          </ul>
        </div>
        
        <div className="bg-white border border-nibo-amarelo/30 rounded-nibo-card p-6 shadow-nibo">
          <h3 className="text-sm font-semibold text-nibo-petroleo mb-4 flex items-center gap-2">
            <Target className="w-4 h-4 text-nibo-amarelo" /> Oportunidades de Melhoria
          </h3>
          <ul className="space-y-2 text-sm text-slate-600">
            {data.pontos_atencao.map((p, i) => (
              <li key={i} className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-nibo-amarelo mt-1.5 flex-shrink-0"></div> {p}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Row 4: Bugs and Product Improvements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-orange-200 rounded-nibo-card p-6 shadow-nibo">
          <h3 className="text-sm font-semibold text-orange-800 mb-4 flex items-center gap-2">
            <Bug className="w-4 h-4 text-orange-600" /> Bugs Relatados
          </h3>
          <div className="space-y-3">
            {data.bugs.map((bug, i) => (
              <div key={i} className="p-4 rounded-xl border border-orange-100 bg-orange-50">
                <div className="flex justify-between items-start gap-4 mb-1">
                  <p className="text-sm font-medium text-slate-800">{bug.descricao}</p>
                  <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-white/80 text-orange-800">{bug.impacto}</span>
                </div>
                <p className="text-xs text-slate-600 italic mt-2 border-l-2 border-orange-100 pl-3 py-0.5">"{bug.frase_cliente}"</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-nibo-azul-claro/30 rounded-nibo-card p-6 shadow-nibo">
          <h3 className="text-sm font-semibold text-nibo-azul-escuro mb-4 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-nibo-azul-claro" /> Sugestões de Produto
          </h3>
          <div className="space-y-3">
            {data.melhorias.map((m, i) => (
              <div key={i} className="p-4 rounded-xl border border-nibo-azul-claro/20 bg-nibo-azul-claro/5">
                <div className="flex justify-between items-start gap-4 mb-1">
                  <p className="text-sm font-medium text-nibo-petroleo">{m.descricao}</p>
                  <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-white/80 text-nibo-azul-escuro">{m.tipo}</span>
                </div>
                <p className="text-xs text-slate-600 italic mt-2 border-l-2 border-nibo-azul-claro/20 pl-3 py-0.5">"{m.frase_cliente}"</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Badge({ icon: Icon, label, color }: { icon?: any, label: string, color: "emerald" | "slate" }) {
  const colors = {
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
    slate: "bg-nibo-gelo/20 text-slate-600 border-nibo-gelo/30"
  };

  return (
    <div className={cn("flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border", colors[color])}>
      {Icon && <Icon className="w-3 h-3" />}
      {label}
    </div>
  );
}

function ProgressBar({ label, value, color }: { label: string, value: string, color: "purple" | "blue" }) {
  const colors = {
    purple: "bg-nibo-roxo",
    blue: "bg-nibo-azul-escuro"
  };

  return (
    <div>
      <div className="flex justify-between text-xs font-medium text-slate-600 mb-2">
        <span>{label}</span><span className="text-nibo-petroleo font-bold">{value}</span>
      </div>
      <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
        <div className={cn("h-full rounded-full", colors[color])} style={{ width: value }}></div>
      </div>
    </div>
  );
}

function CheckItem({ label, checked }: { label: string, checked: boolean }) {
  return (
    <div className="flex items-center gap-3">
      {checked ? (
        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
      ) : (
        <XCircle className="w-5 h-5 text-red-400" />
      )}
      <span className={cn("text-sm", checked ? "text-slate-700" : "text-slate-500")}>{label}</span>
    </div>
  );
}
