import { type Advisor } from '../types';
import { cn } from '../lib/utils';
import { User, ChevronRight, LogOut } from 'lucide-react';
import { firebaseService } from '../service/firebaseService';
import { auth } from '../lib/firebase';

interface SidebarProps {
  advisors: Advisor[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function Sidebar({ advisors, selectedId, onSelect }: SidebarProps) {
  const user = auth.currentUser;

  return (
    <aside className="w-80 border-r border-slate-200 bg-white flex flex-col h-screen">
      <div className="p-6 border-bottom border-slate-100">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm overflow-hidden border border-slate-100">
            <img 
              src="https://www.nibo.com.br/wp-content/uploads/2019/12/logo-nibo-blue.png" 
              alt="Nibo" 
              className="w-full h-full object-cover scale-150"
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const parent = e.currentTarget.parentElement;
                if (parent) {
                  const span = document.createElement('span');
                  span.className = "text-white font-bold text-xs";
                  span.innerText = "N";
                  parent.appendChild(span);
                }
              }}
            />
          </div>
          <h2 className="font-bold text-slate-900 tracking-tight text-lg">NIBO ADVISORS</h2>
        </div>
        <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-black">Consultores</p>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {advisors.map((advisor) => (
          <button
            key={advisor.id}
            onClick={() => onSelect(advisor.id)}
            className={cn(
              "w-full flex items-center gap-3 p-3 rounded-xl transition-all group",
              selectedId === advisor.id
                ? "bg-slate-900 text-white shadow-lg"
                : "hover:bg-slate-50 text-slate-600"
            )}
          >
            <div className="relative flex-shrink-0">
              <img
                src={advisor.photoUrl}
                alt={advisor.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-slate-100 group-hover:border-blue-400 transition-colors"
                referrerPolicy="no-referrer"
              />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <div className="text-left flex-1 min-w-0">
              <p className="font-bold truncate text-sm">{advisor.name}</p>
              <p className={cn("text-[9px] truncate uppercase tracking-widest font-black opacity-50")}>
                {advisor.role}
              </p>
            </div>
            <ChevronRight className={cn("w-4 h-4 opacity-30 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all", selectedId === advisor.id && "opacity-100")} />
          </button>
        ))}
      </nav>

      <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center flex-shrink-0">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Profile" className="w-full h-full rounded-xl object-cover" referrerPolicy="no-referrer" />
            ) : (
              <User className="w-5 h-5 text-slate-400" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-black text-slate-900 uppercase tracking-tight truncate">
              {user?.displayName || 'Admin Manager'}
            </p>
            <p className="text-[10px] text-slate-400 font-medium truncate">Online agora</p>
          </div>
        </div>
        <button
          onClick={() => firebaseService.logout()}
          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
          title="Sair"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
