import React, { useEffect, useState } from 'react';
import { Scorecard } from '../types';
import { firebaseService } from '../service/firebaseService';
import { Gauge, Target, UserCheck, Users, Heart, ClipboardList, AlertTriangle, ChevronRight, Award } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface ScorecardViewProps {
  advisorId: string;
}

export function ScorecardView({ advisorId }: ScorecardViewProps) {
  const [scorecard, setScorecard] = useState<Scorecard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScorecard = async () => {
      setLoading(true);
      const data = await firebaseService.getLatestScorecard(advisorId);
      if (data) setScorecard(data as Scorecard);
      setLoading(false);
    };
    fetchScorecard();
  }, [advisorId]);

  if (loading) return (
    <div className="h-48 bg-white rounded-[32px] border border-slate-100 flex items-center justify-center">
      <div className="animate-pulse text-[10px] font-black uppercase text-slate-400 tracking-widest">Carregando Avaliação...</div>
    </div>
  );

  if (!scorecard) return (
    <div className="p-8 bg-slate-50 rounded-[32px] border border-dashed border-slate-200 text-center">
      <ClipboardList className="w-8 h-8 text-slate-300 mx-auto mb-3" />
      <p className="text-sm font-bold text-slate-500 uppercase tracking-tight">Nenhuma avaliação registrada para este ciclo.</p>
    </div>
  );

  const criteria = [
    { 
      key: 'operational', 
      label: 'Performance Operacional', 
      weight: '40%', 
      score: scorecard.criteria.operational, 
      icon: Target,
      goal5: 'Acima de 110% de performance e atingir meta em 100% dos meses.'
    },
    { 
      key: 'routine', 
      label: 'Rotina Comercial', 
      weight: '10%', 
      score: scorecard.criteria.routine, 
      icon: ClipboardList,
      goal5: 'Pensar de forma sistêmica e ajudar a repensar o modelo vigente.'
    },
    { 
      key: 'teamwork', 
      label: 'Trabalho em Equipe', 
      weight: '10%', 
      score: scorecard.criteria.teamwork, 
      icon: Users,
      goal5: 'Alta capacidade de influenciar positivamente os pares.'
    },
    { 
      key: 'client', 
      label: 'Relacionamento Cliente', 
      weight: '10%', 
      score: scorecard.criteria.client, 
      icon: UserCheck,
      goal5: 'Entender e surpreender proativamente excedendo o escopo da função.'
    },
    { 
      key: 'values', 
      label: 'Valores Nibo', 
      weight: '20%', 
      score: scorecard.criteria.values, 
      icon: Heart,
      goal5: 'Evangelista: estimular outros a seguirem e praticarem os valores.'
    }
  ];

  const getInterpretation = (score: number) => {
    if (score === 1) return "Crítico / Muito Abaixo";
    if (score === 2) return "Insuficiente / Abaixo";
    if (score === 3) return "Atende / Normal";
    if (score === 4) return "Supera / Acima";
    if (score === 5) return "Referência / Excepcional";
    return "";
  };

  const getClassificationColor = (classification: string) => {
    switch (classification) {
      case 'Crítico': return 'bg-red-600';
      case 'Atenção': return 'bg-amber-500';
      case 'Bom': return 'bg-blue-600';
      case 'Excelente': return 'bg-emerald-600';
      default: return 'bg-slate-900';
    }
  };

  // Generate O1O Agenda
  const criticalItems = criteria.filter(c => c.score <= 2);
  const developmentItems = criteria.filter(c => c.score === 3);
  const recognitionItems = criteria.filter(c => c.score >= 4);

  return (
    <div className="space-y-8">
      {/* Header & Final Score */}
      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-slate-900 text-white rounded-2xl shadow-xl">
            <Gauge className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Scorecard Annual — {scorecard.year}</h3>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-widest">Avaliação de Desempenho e Comportamental</p>
          </div>
        </div>

        <div className={cn(
          "px-8 py-6 rounded-3xl text-white shadow-2xl flex flex-col items-center gap-1",
          getClassificationColor(scorecard.classification)
        )}>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Pontuação Final</p>
          <p className="text-4xl font-black">{scorecard.finalScore.toFixed(1)}</p>
          <p className="text-sm font-black uppercase tracking-widest">{scorecard.classification}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Scorecard Table */}
        <div className="bg-white rounded-[32px] border border-slate-100 shadow-xl overflow-hidden p-8">
          <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
            <Award className="w-4 h-4 text-blue-600" />
            Detalhamento de Critérios
          </h4>
          <div className="space-y-4">
            {criteria.map((item) => (
              <div key={item.key} className="group p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-slate-300 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <item.icon className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                    <span className="text-xs font-black text-slate-900 uppercase tracking-tight">{item.label}</span>
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white px-2 py-1 rounded-lg border border-slate-100">Peso {item.weight}</span>
                </div>
                <div className="flex items-end justify-between">
                  <div className="flex gap-1.5 overflow-hidden">
                    {[1, 2, 3, 4, 5].map(note => (
                      <div key={note} className={cn(
                        "w-5 h-2 rounded-full",
                        item.score >= note ? (item.score <= 2 ? 'bg-red-400' : item.score === 3 ? 'bg-amber-400' : 'bg-emerald-400') : 'bg-slate-200'
                      )} />
                    ))}
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-slate-900 leading-none">{item.score}</p>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-tight">{getInterpretation(item.score)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* O1O Agenda */}
        <div className="bg-slate-900 rounded-[32px] shadow-2xl p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <AlertTriangle className="w-24 h-24 text-white" />
          </div>
          
          <h4 className="text-sm font-black text-white uppercase tracking-widest mb-8 flex items-center gap-2">
             <ClipboardList className="w-4 h-4 text-blue-400" />
             Pauta para o One-a-One
          </h4>

          <div className="space-y-6 relative z-10">
            {/* URGENCY FIRST */}
            {criticalItems.length > 0 && (
              <div className="space-y-3">
                <p className="text-[10px] font-black text-red-400 uppercase tracking-[0.2em] mb-2">Urgente: Focar Imediatamente</p>
                {criticalItems.map((item, idx) => (
                  <motion.div 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    key={item.key} 
                    className="flex gap-3 items-start bg-red-400/10 p-4 rounded-2xl border border-red-400/20"
                  >
                    <div className="w-5 h-5 bg-red-400 rounded-full flex items-center justify-center text-red-900 text-[10px] font-black mt-0.5">!</div>
                    <div>
                      <p className="text-[11px] font-black text-white uppercase tracking-wide">{item.label}</p>
                      <p className="text-xs text-white/60 leading-relaxed mt-1">A nota {item.score} é crítica. <span className="text-white font-bold">Onde queremos chegar (Nota 5):</span> {item.goal5}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* DEVELOPMENT */}
            {developmentItems.length > 0 && (
              <div className="space-y-3">
                <p className="text-[10px] font-black text-amber-400 uppercase tracking-[0.2em] mb-2">Pontos de Desenvolvimento</p>
                {developmentItems.map((item, idx) => (
                  <motion.div 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: (criticalItems.length + idx) * 0.1 }}
                    key={item.key} 
                    className="flex gap-3 items-start bg-amber-400/10 p-4 rounded-2xl border border-amber-400/20"
                  >
                    <ChevronRight className="w-4 h-4 text-amber-400 mt-1" />
                    <div>
                      <p className="text-[11px] font-black text-white uppercase tracking-wide">{item.label}</p>
                      <p className="text-xs text-white/60 leading-relaxed mt-1">Nível de entrega padrão. <span className="text-white font-bold">Para evoluir (Nota 5):</span> {item.goal5}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* RECOGNITION */}
            {recognitionItems.length > 0 && (
              <div className="space-y-3">
                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-2">Reconhecimento</p>
                {recognitionItems.map((item, idx) => (
                  <motion.div 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: (criticalItems.length + developmentItems.length + idx) * 0.1 }}
                    key={item.key} 
                    className="flex gap-3 items-start bg-emerald-400/10 p-4 rounded-2xl border border-emerald-400/20"
                  >
                    <Award className="w-5 h-5 text-emerald-400 mt-0.5" />
                    <div>
                      <p className="text-[11px] font-black text-white uppercase tracking-wide">{item.label}</p>
                      <p className="text-xs text-white/60 leading-relaxed mt-1">
                        {item.score === 5 
                          ? 'Performance excepcional atingida! Manter consistentemente este patamar.' 
                          : `Excelente trabalho (Nota ${item.score}). Para o nível máximo: ${item.goal5}`}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
