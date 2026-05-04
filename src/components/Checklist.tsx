import { useState } from 'react';
import { type ChecklistItem } from '../types';
import { cn } from '../lib/utils';
import { CheckCircle2, Circle, Plus, Heart, Zap, ShieldCheck, X } from 'lucide-react';
import { motion } from 'motion/react';

interface ChecklistProps {
  items: ChecklistItem[];
  onToggle: (id: string, currentStatus: boolean) => void;
  onAdd?: (title: string, category: string) => void;
}

const CATEGORY_ICONS: Record<string, any> = {
  'Soft Skills': Heart,
  'Technical': Zap,
  'Sales': ShieldCheck,
};

export function Checklist({ items, onToggle, onAdd }: ChecklistProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Technical');

  const handleAdd = async () => {
    if (!newTitle) return;
    onAdd?.(newTitle, newCategory);
    setNewTitle('');
    setIsAdding(false);
  };

  return (
    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Pontos de Melhoria</h3>
          <p className="text-sm text-slate-500">Acompanhamento tático para o One-a-One</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors",
            isAdding ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-slate-900 text-white hover:bg-black"
          )}
        >
          {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {isAdding ? 'CANCELAR' : 'ADICIONAR ITEM'}
        </button>
      </div>

      {isAdding && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-8 p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input 
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Descreva o ponto de melhoria..."
              className="p-3 rounded-xl bg-white border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <select 
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="p-3 rounded-xl bg-white border border-slate-200 text-sm font-bold"
            >
              <option>Technical</option>
              <option>Soft Skills</option>
              <option>Sales</option>
            </select>
          </div>
          <button 
            onClick={handleAdd}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold text-xs tracking-widest hover:bg-blue-700 transition-all"
          >
            CONFIRMAR ITEM
          </button>
        </motion.div>
      )}

      <div className="grid grid-cols-1 gap-3">
        {items.length === 0 && (
          <div className="py-12 border-2 border-dashed border-slate-100 rounded-2xl text-center">
            <p className="text-slate-400 font-medium text-sm">Nenhum ponto registrado.</p>
          </div>
        )}
        {items.map((item) => {
          const Icon = CATEGORY_ICONS[item.category] || Zap;
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={cn(
                "group flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer",
                item.isCompleted 
                  ? "bg-slate-50 border-slate-100 opacity-60" 
                  : "bg-white border-slate-100 hover:border-blue-200 hover:shadow-md hover:shadow-blue-50/50"
              )}
              onClick={() => onToggle(item.id, item.isCompleted)}
            >
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                item.isCompleted ? "bg-slate-200 text-slate-500" : "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white"
              )}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className={cn(
                  "font-bold text-sm transition-all",
                  item.isCompleted ? "text-slate-500 line-through" : "text-slate-900"
                )}>
                  {item.title}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    {item.category}
                  </span>
                </div>
              </div>
              <div className={cn(
                "w-6 h-6 rounded-lg flex items-center justify-center border-2 transition-all",
                item.isCompleted 
                  ? "bg-green-500 border-green-500 text-white" 
                  : "border-slate-200 group-hover:border-blue-500"
              )}>
                {item.isCompleted && <CheckCircle2 className="w-4 h-4" />}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
