/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Journey } from './components/Journey';
import { Checklist } from './components/Checklist';
import { Meetings } from './components/Meetings';
import { firebaseService } from './services/firebaseService';
import { Advisor, PerformanceRecord, ChecklistItem, Milestone, Meeting } from './types';
import { LayoutGrid, Database, RefreshCw, LogIn } from 'lucide-react';
import { seedData } from './seed';
import { auth } from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { cn } from './lib/utils';
import { AdminPanel } from './components/AdminPanel';
import { PerformanceGrid } from './components/PerformanceGrid';
import { GoogleCalendarWidget } from './components/GoogleCalendarWidget';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [advisors, setAdvisors] = useState<Advisor[]>([]);
  const [selectedAdvisorId, setSelectedAdvisorId] = useState<string | null>(null);
  const [performance, setPerformance] = useState<PerformanceRecord[]>([]);
  const [allPerformance, setAllPerformance] = useState<PerformanceRecord[]>([]);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'dashboard' | 'admin'>('dashboard');

  const isAdmin = user?.email === 'jonathan.dornelas@nibo.com.br';

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) {
        fetchData();
        fetchAllPerformance();
      } else {
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await firebaseService.getAdvisors();
      if (data) {
        setAdvisors(data as Advisor[]);
        if (data.length > 0) {
          setSelectedAdvisorId(data[0].id);
        }
      }
    } catch (error) {
      console.error("Erro ao buscar consultores:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllPerformance = async () => {
    const { getDocs, collection, query, where } = await import('firebase/firestore');
    const { db } = await import('./lib/firebase');
    const email = auth.currentUser?.email;
    if (!email) return;

    try {
      const isAdmin = email === 'jonathan.dornelas@nibo.com.br';
      let q;
      if (isAdmin) {
        q = collection(db, 'performance');
      } else {
        const advisorIds = advisors.map(a => a.id);
        if (advisorIds.length === 0) {
          setAllPerformance([]);
          return;
        }
        q = query(collection(db, 'performance'), where('advisorId', 'in', advisorIds));
      }
      
      const snap = await getDocs(q);
      setAllPerformance(snap.docs.map(d => ({ id: d.id, ...d.data() })) as PerformanceRecord[]);
    } catch (e) {
      console.error("Error fetching all performance:", e);
    }
  };

  useEffect(() => {
    if (user && advisors.length > 0) {
      fetchAllPerformance();
    }
  }, [advisors, user]);

  useEffect(() => {
    if (!selectedAdvisorId || !user) return;

    const loadAdvisorData = async () => {
      const perf = await firebaseService.getPerformance(selectedAdvisorId);
      const checks = await firebaseService.getChecklist(selectedAdvisorId);
      const stones = await firebaseService.getMilestones(selectedAdvisorId);
      const meets = await firebaseService.getMeetings(selectedAdvisorId);

      setPerformance(perf as PerformanceRecord[]);
      setChecklist(checks as ChecklistItem[]);
      setMilestones(stones as Milestone[]);
      setMeetings(meets as Meeting[]);
    };

    loadAdvisorData();

    // Subscribe to performance changes
    const unsub = firebaseService.subscribeToPerformance(selectedAdvisorId, (data) => {
      setPerformance(data as PerformanceRecord[]);
    });

    return () => unsub();
  }, [selectedAdvisorId]);

  const handleToggleChecklist = async (id: string, currentStatus: boolean) => {
    await firebaseService.toggleChecklistItem(id, !currentStatus);
    setChecklist(prev => prev.map(item => item.id === id ? { ...item, isCompleted: !currentStatus } : item));
  };

  const handleAddChecklist = async (title: string, category: string) => {
    if (!selectedAdvisorId) return;
    try {
      const id = await firebaseService.createChecklistItem({
        advisorId: selectedAdvisorId,
        title,
        category,
        isCompleted: false,
        createdAt: new Date().toISOString(),
      });
      if (id) {
        setChecklist(prev => [{ id, advisorId: selectedAdvisorId, title, category, isCompleted: false }, ...prev]);
      }
    } catch (e) {
      console.error("Error adding checklist item:", e);
    }
  };

  const handleSeed = async () => {
    setLoading(true);
    await seedData();
    window.location.reload();
  };

  const selectedAdvisor = advisors.find(a => a.id === selectedAdvisorId);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-6">
          <img 
            src="https://www.nibo.com.br/wp-content/uploads/2019/12/logo-nibo-blue.png" 
            alt="Nibo" 
            className="h-12 object-contain animate-pulse"
            referrerPolicy="no-referrer"
          />
          <div className="flex flex-col items-center gap-2">
            <RefreshCw className="w-6 h-6 text-blue-600 animate-spin" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Carregando Ecossistema Nibo...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900 overflow-hidden relative">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#3b82f6,transparent_50%)]"></div>
        </div>
        <div className="z-10 bg-white p-12 rounded-[40px] shadow-2xl max-w-md w-full text-center border border-slate-100">
          <div className="mb-8 flex justify-center">
            <img 
              src="https://www.nibo.com.br/static/6e7e0e7a8e0e7a8e0e7a8e0e7a8e0e7a/c4d0b/logo-nibo.png" 
              alt="Nibo Logo" 
              className="h-16 object-contain"
              referrerPolicy="no-referrer"
              onError={(e) => {
                // Fallback to stylized N if image fails
                e.currentTarget.style.display = 'none';
                const parent = e.currentTarget.parentElement;
                if (parent) {
                  const fallback = document.createElement('div');
                  fallback.className = "w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto shadow-xl shadow-blue-200";
                  fallback.innerHTML = '<span class="text-white font-black text-3xl">N</span>';
                  parent.appendChild(fallback);
                }
              }}
            />
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Nibo Advisor</h1>
          <p className="text-slate-500 mb-10 leading-relaxed font-medium">Acesse o portal de acompanhamento de performance dos consultores.</p>
          <button
            onClick={() => firebaseService.login()}
            className="w-full py-5 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-black transition-all shadow-lg hover:shadow-2xl active:scale-95 group"
          >
            <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            ENTRAR COM GOOGLE
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      <Sidebar
        advisors={advisors}
        selectedId={selectedAdvisorId}
        onSelect={(id) => {
          setSelectedAdvisorId(id);
          setViewMode('dashboard');
        }}
      />

      <main className="flex-1 overflow-y-auto">
        {advisors.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-6">
            <div className="p-12 bg-white rounded-3xl border border-slate-200 text-center shadow-xl max-w-md">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Database className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Bem-vindo ao Dashboard!</h2>
              <p className="text-slate-500 mb-8 leading-relaxed">Não encontramos dados iniciais. Clique no botão abaixo para popular o ambiente com dados de exemplo baseados na sua planilha.</p>
              <button
                onClick={handleSeed}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-black transition-all shadow-lg hover:shadow-xl active:scale-95"
              >
                POPULAR DADOS DE EXEMPLO
              </button>
            </div>
          </div>
        ) : (
          <div className="p-10 max-w-7xl mx-auto space-y-10">
            {/* Page Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
              <div>
                <nav className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                  <LayoutGrid className="w-3 h-3" />
                  <span>DASHBOARD</span>
                  <span>/</span>
                  <span className="text-blue-600 uppercase">{viewMode}</span>
                </nav>
                <div className="flex items-center gap-4 mb-2">
                  <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                    Olá, <span className="text-blue-600 truncate">{selectedAdvisor?.name}</span>!
                  </h1>
                  {isAdmin && (
                    <div className="flex bg-slate-200 p-1 rounded-xl gap-1">
                      <button 
                        onClick={() => setViewMode('dashboard')}
                        className={cn("px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all", viewMode === 'dashboard' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700")}
                      >
                        Monitorar
                      </button>
                      <button 
                        onClick={() => setViewMode('grid')}
                        className={cn("px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all", viewMode === 'grid' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700")}
                      >
                        Grade
                      </button>
                      <button 
                        onClick={() => setViewMode('admin')}
                        className={cn("px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all", viewMode === 'admin' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700")}
                      >
                        Alimentar
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-slate-500 font-medium">Ciclo de Gestão: Agosto a Julho.</p>
              </div>
              
              <div className="flex flex-col md:flex-row items-center gap-4">
                <GoogleCalendarWidget />
                
                <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm w-full md:w-auto">
                  <img
                    src={selectedAdvisor?.photoUrl}
                    alt={selectedAdvisor?.name}
                    className="w-12 h-12 rounded-xl object-cover shadow-sm"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <p className="text-sm font-bold text-slate-900 leading-tight">{selectedAdvisor?.name}</p>
                    <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wide">{selectedAdvisor?.role}</p>
                  </div>
                </div>
              </div>
            </header>

            {viewMode === 'admin' ? (
              <AdminPanel />
            ) : viewMode === 'grid' ? (
              <PerformanceGrid advisors={advisors} performance={allPerformance} />
            ) : (
              <>
                {/* Performance Overview */}
                {selectedAdvisor && (
                  <Dashboard performance={performance} advisor={selectedAdvisor} />
                )}

                {/* Secondary Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-8">
                    <Checklist 
                      items={checklist} 
                      onToggle={handleToggleChecklist} 
                      onAdd={handleAddChecklist}
                    />
                    <Meetings meetings={meetings} />
                  </div>
                  <div className="lg:col-span-1">
                    <Journey milestones={milestones} />
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
