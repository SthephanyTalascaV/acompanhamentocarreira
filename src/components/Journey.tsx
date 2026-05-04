import { type Milestone } from '../types';
import { cn } from '../lib/utils';
import { CheckCircle2, Circle, Trophy } from 'lucide-react';
import { motion } from 'motion/react';

interface JourneyProps {
  milestones: Milestone[];
}

export function Journey({ milestones }: JourneyProps) {
  const completedCount = milestones.filter(m => m.completedDate).length;
  const progress = milestones.length > 0 ? (completedCount / milestones.length) * 100 : 0;

  return (
    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm h-full">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Jornada do Consultor</h3>
          <p className="text-sm text-slate-500">Seu progresso até a autonomia total</p>
        </div>
        <div className="text-right">
          <div className="relative w-16 h-16 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="currentColor"
                strokeWidth="4"
                fill="transparent"
                className="text-slate-100"
              />
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="currentColor"
                strokeWidth="4"
                strokeDasharray={2 * Math.PI * 28}
                strokeDashoffset={2 * Math.PI * 28 * (1 - progress / 100)}
                strokeLinecap="round"
                fill="transparent"
                className="text-blue-600 transition-all duration-1000 ease-out"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-slate-900">
              {progress.toFixed(0)}%
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-6 relative">
        {/* Connection Line */}
        <div className="absolute left-[15px] top-2 bottom-6 w-0.5 bg-slate-100" />

        {milestones.map((milestone, idx) => {
          const isCompleted = !!milestone.completedDate;
          const isNext = !isCompleted && (idx === 0 || !!milestones[idx - 1]?.completedDate);

          return (
            <motion.div
              key={milestone.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex items-start gap-4"
            >
              <div className="relative z-10 flex-shrink-0 mt-1">
                {isCompleted ? (
                  <CheckCircle2 className="w-8 h-8 text-blue-600 bg-white" />
                ) : isNext ? (
                  <div className="w-8 h-8 rounded-full border-2 border-blue-600 bg-blue-50 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                  </div>
                ) : (
                  <Circle className="w-8 h-8 text-slate-200 bg-white" />
                )}
              </div>
              <div className="pt-0.5">
                <h4 className={cn(
                  "font-bold text-sm",
                  isCompleted ? "text-slate-900" : isNext ? "text-blue-600" : "text-slate-400"
                )}>
                  {milestone.title}
                </h4>
                {milestone.description && (
                  <p className="text-xs text-slate-500 mt-0.5">{milestone.description}</p>
                )}
                {isCompleted && (
                  <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-bold uppercase mt-2 inline-block">
                    CONCLUÍDO
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-8 pt-6 border-t border-slate-50 flex items-center gap-4 bg-slate-50 -mx-8 -mb-8 p-8 rounded-b-3xl">
        <div className="p-3 bg-white rounded-xl shadow-sm">
          <Trophy className="w-6 h-6 text-yellow-500" />
        </div>
        <div>
          <p className="text-xs font-bold text-slate-900 uppercase">Próximo Marco</p>
          <p className="text-sm text-slate-600 font-medium">Você já alcançou {completedCount} de {milestones.length} marcos.</p>
        </div>
      </div>
    </div>
  );
}
