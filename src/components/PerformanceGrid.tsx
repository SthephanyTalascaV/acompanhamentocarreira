import { type Advisor, type PerformanceRecord } from '../types';
import { cn, formatPercentage } from '../lib/utils';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

interface PerformanceGridProps {
  advisors: Advisor[];
  performance: PerformanceRecord[];
}

const MONTHS = [
  '2025-08', '2025-09', '2025-10', '2025-11', '2025-12', 
  '2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06', '2026-07'
];

export function PerformanceGrid({ advisors, performance }: PerformanceGridProps) {
  const getPerf = (advisorId: string, month: string) => {
    return performance.find(p => p.advisorId === advisorId && p.month === month);
  };

  const getStatusColor = (percentage: number) => {
    if (percentage >= 1.0) return 'bg-green-100 text-green-700 border-green-200';
    return 'bg-red-100 text-red-700 border-red-200';
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-8 border-b border-slate-50 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Grade de Resultados</h3>
          <p className="text-sm text-slate-500">Visão consolidada do ciclo Agosto a Julho</p>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-50">
              <th className="sticky left-0 bg-slate-50 p-4 border-b border-slate-100 text-left text-[10px] font-black uppercase tracking-widest text-slate-400 z-10 w-48">
                Consultor
              </th>
              {MONTHS.map(m => (
                <th key={m} className="p-4 border-b border-slate-100 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                  {m.split('-')[1]}/{m.split('-')[0].slice(-2)}
                </th>
              ))}
              <th className="p-4 border-b border-slate-100 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                Media
              </th>
            </tr>
          </thead>
          <tbody>
            {advisors.map(advisor => {
              const advisorPerf = performance.filter(p => p.advisorId === advisor.id && p.status === 'normal');
              const average = advisorPerf.length > 0 
                ? advisorPerf.reduce((acc, curr) => acc + curr.percentage, 0) / advisorPerf.length 
                : 0;

              return (
                <tr key={advisor.id} className="hover:bg-slate-50 transition-colors">
                  <td className="sticky left-0 bg-white group-hover:bg-slate-50 p-4 border-b border-slate-50 font-bold text-sm text-slate-900 z-10 whitespace-nowrap border-r border-slate-100 flex items-center gap-2">
                    <img src={advisor.photoUrl} className="w-6 h-6 rounded-full" alt="" />
                    {advisor.name}
                  </td>
                  {MONTHS.map(m => {
                    const p = getPerf(advisor.id, m);
                    return (
                      <td key={m} className="p-2 border-b border-slate-50 text-center">
                        {p ? (
                          <div className={cn(
                            "py-1.5 px-2 rounded-lg text-xs font-bold border",
                            p.status === 'ramp' ? "bg-blue-50 text-blue-600 border-blue-100" :
                            p.status === 'vacation' ? "bg-slate-100 text-slate-400 border-slate-200" :
                            getStatusColor(p.percentage)
                          )}>
                            {p.status === 'ramp' ? 'Ramp' : p.status === 'vacation' ? 'Ferias' : formatPercentage(p.percentage)}
                          </div>
                        ) : (
                          <div className="text-[10px] text-slate-200">-</div>
                        )}
                      </td>
                    );
                  })}
                  <td className="p-4 border-b border-slate-50 text-center bg-slate-50/50">
                    <div className={cn("inline-flex items-center gap-1 font-black text-xs", average >= 1.0 ? "text-green-600" : "text-red-500")}>
                      {formatPercentage(average)}
                      {average >= 1.0 ? <ShieldCheck className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
