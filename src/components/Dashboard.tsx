import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { type PerformanceRecord, type Advisor } from '../types';
import { formatPercentage, cn } from '../lib/utils';
import { TrendingUp, Award, Clock, Calendar, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { ScorecardView } from './ScorecardView';

interface DashboardProps {
  performance: PerformanceRecord[];
  advisor: Advisor;
}

export function Dashboard({ performance, advisor }: DashboardProps) {
  const latestPerformance = performance[performance.length - 1]?.percentage || 0;
  const prevPerformance = performance[performance.length - 2]?.percentage || 0;
  const diff = latestPerformance - prevPerformance;

  // Alert Logic
  const getAlertStatus = () => {
    const cycleMonths = ['2025-08', '2025-09', '2025-10', '2025-11', '2025-12', '2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06', '2026-07'];
    const failuresInCycle = performance.filter(p => 
      cycleMonths.includes(p.month) && 
      p.status === 'normal' && 
      p.percentage < 1.0
    );

    if (failuresInCycle.length >= 3) return { type: 'danger', message: 'RISCO DE DESLIGAMENTO', count: failuresInCycle.length };
    if (failuresInCycle.length >= 2) return { type: 'warning', message: 'RISCO DE CARTÃO', count: failuresInCycle.length };
    return null;
  };

  const alert = getAlertStatus();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Risk Alert Banner */}
      {alert && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "p-4 rounded-2xl flex items-center gap-4 border shadow-sm",
            alert.type === 'danger' ? "bg-red-50 border-red-100 text-red-700" : "bg-orange-50 border-orange-100 text-orange-700"
          )}
        >
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center shadow-sm",
            alert.type === 'danger' ? "bg-red-600 text-white" : "bg-orange-600 text-white"
          )}>
            <TrendingUp className="w-6 h-6 rotate-180" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] uppercase font-black tracking-[0.2em] opacity-70">Atenção Crítica</p>
            <h4 className="text-lg font-black tracking-tight">{alert.message}</h4>
            <p className="text-sm font-medium opacity-80">O consultor acumulou {alert.count} meses abaixo da meta no ciclo atual.</p>
          </div>
        </motion.div>
      )}

      {/* Header Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          whileHover={{ y: -4 }}
          className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className={cn(
              "p-2 rounded-lg",
              latestPerformance >= 1.0 ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
            )}>
              <TrendingUp className="w-5 h-5" />
            </div>
            <p className="text-sm font-semibold text-slate-500">Performance Atual</p>
          </div>
          <p className={cn(
            "text-3xl font-black tracking-tight",
            latestPerformance >= 1.0 ? "text-green-600" : "text-red-600"
          )}>
            {formatPercentage(latestPerformance)}
          </p>
          <p className={`text-xs mt-2 font-medium ${diff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {diff >= 0 ? '+' : ''}{(diff * 100).toFixed(1)}% em relação ao mês anterior
          </p>
        </motion.div>

        <motion.div
          whileHover={{ y: -4 }}
          className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <Award className="w-5 h-5" />
            </div>
            <p className="text-sm font-semibold text-slate-500">Média (12 meses)</p>
          </div>
          <p className="text-3xl font-bold text-slate-900">136%</p>
          <div className="flex mt-2 gap-1 text-slate-300">
            {[1, 2, 3, 4, 5].map((i) => (
              <span key={i} className={i <= advisor.averageGrade ? 'text-yellow-400' : ''}>★</span>
            ))}
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -4 }}
          className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
              <Clock className="w-5 h-5" />
            </div>
            <p className="text-sm font-semibold text-slate-500">Ramp Up</p>
          </div>
          <p className="text-3xl font-bold text-slate-900">Concluído</p>
          <p className="text-xs mt-2 text-slate-500 font-medium">85 dias desde o onboarding</p>
        </motion.div>

        <motion.div
          whileHover={{ y: -4 }}
          className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <Calendar className="w-5 h-5" />
            </div>
            <p className="text-sm font-semibold text-slate-500">Próximo One-a-One</p>
          </div>
          <p className="text-xl font-bold text-slate-900">20 de Março</p>
          <p className="text-xs mt-2 text-slate-500 font-medium tracking-tight">Quinta-feira, às 14:00</p>
        </motion.div>
      </div>

      {/* Monthly Summary Grid */}
      <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm overflow-hidden relative">
        {alert && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className={cn(
              "absolute top-8 right-8 px-4 py-2 rounded-full border flex items-center gap-2 shadow-sm z-10",
              alert.type === 'danger' ? "bg-red-600 text-white border-red-500" : "bg-orange-500 text-white border-orange-400"
            )}
          >
            <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.1em]">{alert.message}</span>
          </motion.div>
        )}

        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Grade de Evolução</h3>
              {alert && (
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  alert.type === 'danger' ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" : "bg-orange-500"
                )} />
              )}
            </div>
            <p className="text-sm text-slate-500 font-medium">Ciclo de Gestão: Agosto a Julho</p>
          </div>
          <div className="flex bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-[10px] font-black uppercase text-slate-400">Batida</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-[10px] font-black uppercase text-slate-400">Abaixo</span>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto pb-4 scrollbar-hide">
          <div className="flex gap-4 min-w-max px-1">
            {['08', '09', '10', '11', '12', '01', '02', '03', '04', '05', '06', '07'].map(monthNum => {
              const year = parseInt(monthNum) >= 8 ? '2025' : '2026';
              const monthKey = `${year}-${monthNum}`;
              const p = performance.find(perf => perf.month === monthKey);
              
              return (
                <div key={monthKey} className="flex flex-col items-center gap-3">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{monthNum}/{year.slice(-2)}</div>
                  <motion.div 
                    whileHover={{ scale: 1.05, y: -2 }}
                    className={cn(
                      "w-20 h-20 rounded-[28px] flex items-center justify-center border-2 text-xs font-black shadow-sm transition-all relative overflow-hidden",
                      !p ? "bg-slate-50 border-slate-100 text-slate-200 border-dashed" :
                      p.status === 'ramp' ? "bg-blue-50 border-blue-200 text-blue-600" :
                      p.status === 'vacation' ? "bg-slate-50 border-slate-200 text-slate-400" :
                      p.percentage >= 1.0 
                        ? "bg-green-50 border-green-200 text-green-600 shadow-green-100/50" 
                        : "bg-red-50 border-red-200 text-red-600 shadow-red-100/50"
                    )}
                  >
                    {!p ? '-' : p.status === 'ramp' ? 'RAMP' : p.status === 'vacation' ? 'FÉRIAS' : formatPercentage(p.percentage)}
                    
                    {p && p.percentage < 1.0 && p.status === 'normal' && (
                      <div className="absolute bottom-0 left-0 w-full h-1 bg-red-500/20" />
                    )}
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>

        {alert && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={cn(
              "mt-6 p-4 rounded-2xl flex items-center gap-3 border",
              alert.type === 'danger' ? "bg-red-50 border-red-100" : "bg-orange-50 border-orange-100"
            )}
          >
            <AlertCircle className={cn("w-5 h-5", alert.type === 'danger' ? "text-red-600" : "text-orange-600")} />
            <p className={cn("text-xs font-bold", alert.type === 'danger' ? "text-red-700" : "text-orange-700")}>
              {alert.type === 'danger' ? 'Atenção Crítica:' : 'Aviso de Performance:'} {alert.message} detectado. Recomenda-se uma reunião de alinhamento imediata.
            </p>
          </motion.div>
        )}
      </div>

      {/* Main Chart */}
      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Evolução do Consultor</h3>
            <p className="text-sm text-slate-500">Acompanhamento da meta mensal entregue</p>
          </div>
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-slate-50 text-slate-600 rounded-full text-xs font-semibold border border-slate-100">Ano 2026</span>
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={performance}>
              <defs>
                <linearGradient id="colorPerf" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#64748b' }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickFormatter={(val) => `${(val * 100)}%`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                }}
                formatter={(val: number) => [formatPercentage(val), 'Performance']}
              />
              <Area
                type="monotone"
                dataKey="percentage"
                stroke="#2563eb"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorPerf)"
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Scorecard and O1O Agenda */}
      <ScorecardView advisorId={advisor.id} />
    </div>
  );
}
