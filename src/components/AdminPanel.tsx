import React, { useEffect, useState, useRef } from 'react';
import { firebaseService } from '../service/firebaseService';
import { Advisor, PerformanceRecord } from '../types';
import { Save, Calendar, Trophy, CheckSquare, TrendingUp, AlertCircle, UserCog, UserPlus, Upload, Pencil, Plus, Trash2, Gauge, Star } from 'lucide-react';
import { collection, addDoc, Timestamp, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { cn } from '../lib/utils';

type AdminTab = 'performance' | 'meetings' | 'journey' | 'checklist' | 'advisors' | 'scorecard';

export function AdminPanel() {
  const [activeTab, setActiveTab] = useState<AdminTab>('performance');
  const [advisors, setAdvisors] = useState<Advisor[]>([]);
  const [selectedAdvisorId, setSelectedAdvisorId] = useState<string>('');
  const [message, setMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Advisor State
  const [advisorData, setAdvisorData] = useState({
    name: '',
    photoUrl: 'https://i.pravatar.cc/150?u=new',
    role: 'Consultor',
  });

  // Performance State
  const [perfData, setPerfData] = useState({
    month: new Date().toISOString().slice(0, 7),
    percentage: 100,
    status: 'normal' as const,
  });

  // Meeting State
  const [meetingData, setMeetingData] = useState({
    date: new Date().toISOString().slice(0, 16),
    notes: '',
    participants: 'Jonathan, ',
  });

  // Checklist State
  const [checklistData, setChecklistData] = useState({
    title: '',
    category: 'Technical',
  });

  // Journey State
  const [milestoneData, setMilestoneData] = useState({
    title: '',
    order: 1,
    isCompleted: false,
  });

  // Scorecard State
  const [scorecardData, setScorecardData] = useState({
    operational: 0,
    routine: 3,
    teamwork: 3,
    client: 3,
    values: 3,
    year: new Date().getFullYear().toString(),
  });

  const calculateOperationalScore = async (advisorId: string, year: string) => {
    try {
      const perf = await firebaseService.getPerformance(advisorId) as PerformanceRecord[];
      if (!perf || perf.length === 0) return 3; // Default to 3 if no data

      const y = parseInt(year);
      const months = [
        `${y-1}-08`, `${y-1}-09`, `${y-1}-10`, `${y-1}-11`, `${y-1}-12`,
        `${y}-01`, `${y}-02`, `${y}-03`, `${y}-04`, `${y}-05`, `${y}-06`, `${y}-07`
      ];

      const cycleMonths = perf.filter(p => months.includes(p.month) && p.status === 'normal');
      
      if (cycleMonths.length === 0) return 3;

      const avgPerf = cycleMonths.reduce((acc, curr) => acc + curr.percentage, 0) / cycleMonths.length;
      const metaHits = cycleMonths.filter(p => p.percentage >= 1.0).length;
      const hitRate = metaHits / cycleMonths.length;

      // Eval best to worst
      if (avgPerf > 1.1 && hitRate === 1) return 5;
      if (avgPerf > 1.0 && hitRate >= 0.8333) return 4;
      if (avgPerf >= 0.9 && hitRate >= 0.5) return 3;
      if (avgPerf >= 0.5 || hitRate >= 0.333) return 2;
      return 1;
    } catch (err) {
      console.error("Error calculating operational score:", err);
      return 1;
    }
  };

  useEffect(() => {
    if (selectedAdvisorId && activeTab === 'scorecard') {
      calculateOperationalScore(selectedAdvisorId, scorecardData.year).then(score => {
        setScorecardData(prev => ({ ...prev, operational: score }));
      });
    }
  }, [selectedAdvisorId, activeTab, scorecardData.year]);

  const fetchAdvisors = async () => {
    const data = await firebaseService.getAdvisors();
    if (data) {
      const advs = data as Advisor[];
      setAdvisors(advs);
      
      // Auto-migration for Jonathan to claim orphan advisors
      const email = auth.currentUser?.email;
      if (email === 'jonathan.dornelas@nibo.com.br') {
        const orphans = advs.filter(a => !a.ownerEmail);
        if (orphans.length > 0) {
          console.log(`Migrating ${orphans.length} orphan advisors to ${email}`);
          Promise.all(orphans.map(a => 
            firebaseService.updateAdvisor(a.id, { ownerEmail: email })
          )).then(() => fetchAdvisors());
        }
      }
    }
  };

  useEffect(() => {
    fetchAdvisors();
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAdvisorData({ ...advisorData, photoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdvisorSubmit = async (e?: React.BaseSyntheticEvent) => {
    e?.preventDefault();
    try {
      if (selectedAdvisorId) {
        await firebaseService.updateAdvisor(selectedAdvisorId, advisorData);
        setMessage('✅ Consultor atualizado!');
      } else {
        await firebaseService.createAdvisor({ ...advisorData, averageGrade: 5 });
        setMessage('✅ Novo consultor criado!');
      }
      await fetchAdvisors();
      setSelectedAdvisorId('');
      setAdvisorData({ name: '', photoUrl: 'https://i.pravatar.cc/150?u=new', role: 'Consultor' });
      showSuccess();
    } catch (err) { 
      console.error("Error saving advisor:", err);
      setError(); 
    }
  };

  const startEditAdvisor = (adv: Advisor) => {
    setSelectedAdvisorId(adv.id);
    setShowConfirmDelete(false);
    setAdvisorData({
      name: adv.name,
      photoUrl: adv.photoUrl,
      role: adv.role,
    });
  };

  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const handleDeleteAdvisor = async () => {
    if (!selectedAdvisorId) return;
    
    if (!showConfirmDelete) {
      setShowConfirmDelete(true);
      return;
    }

    setIsDeleting(true);
    try {
      await firebaseService.deleteAdvisor(selectedAdvisorId);
      setMessage('✅ Consultor removido com sucesso!');
      await fetchAdvisors();
      setSelectedAdvisorId('');
      setAdvisorData({ name: '', photoUrl: 'https://i.pravatar.cc/150?u=new', role: 'Consultor' });
      setShowConfirmDelete(false);
      showSuccess();
    } catch (err) {
      console.error("Error deleting advisor:", err);
      setError();
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePerformanceSubmit = async (e?: React.BaseSyntheticEvent) => {
    e?.preventDefault();
    if (!selectedAdvisorId) {
      setMessage('⚠️ Selecione um consultor primeiro!');
      return;
    }
    try {
      await addDoc(collection(db, 'performance'), {
        advisorId: selectedAdvisorId,
        month: perfData.month,
        percentage: perfData.percentage / 100,
        status: perfData.status,
      });
      showSuccess();
    } catch (err) { 
      console.error("Error saving performance:", err);
      setError(); 
    }
  };

  const handleMeetingSubmit = async (e?: React.BaseSyntheticEvent) => {
    e?.preventDefault();
    if (!selectedAdvisorId) {
      setMessage('⚠️ Selecione um consultor primeiro!');
      return;
    }
    try {
      await addDoc(collection(db, 'meetings'), {
        advisorId: selectedAdvisorId,
        date: Timestamp.fromDate(new Date(meetingData.date)),
        notes: meetingData.notes,
        participants: meetingData.participants.split(',').map(p => p.trim()).filter(p => p),
      });
      setMeetingData({ ...meetingData, notes: '' });
      showSuccess();
    } catch (err) { 
      console.error("Error saving meeting:", err);
      setError(); 
    }
  };

  const handleChecklistSubmit = async (e?: React.BaseSyntheticEvent) => {
    e?.preventDefault();
    if (!selectedAdvisorId) {
      setMessage('⚠️ Selecione um consultor primeiro!');
      return;
    }
    try {
      await addDoc(collection(db, 'checklists'), {
        advisorId: selectedAdvisorId,
        title: checklistData.title,
        category: checklistData.category,
        isCompleted: false,
        createdAt: Timestamp.now(),
      });
      setChecklistData({ ...checklistData, title: '' });
      showSuccess();
    } catch (err) { 
      console.error("Error saving checklist item:", err);
      setError(); 
    }
  };

  const handleMilestoneSubmit = async (e?: React.BaseSyntheticEvent) => {
    e?.preventDefault();
    if (!selectedAdvisorId) {
      setMessage('⚠️ Selecione um consultor primeiro!');
      return;
    }
    try {
      await addDoc(collection(db, 'milestones'), {
        advisorId: selectedAdvisorId,
        title: milestoneData.title,
        order: milestoneData.order,
        completedDate: milestoneData.isCompleted ? Timestamp.now() : null,
      });
      setMilestoneData({ ...milestoneData, title: '', order: milestoneData.order + 1 });
      showSuccess();
    } catch (err) { 
      console.error("Error saving milestone:", err);
      setError(); 
    }
  };

  const handleScorecardSubmit = async (e?: React.BaseSyntheticEvent) => {
    e?.preventDefault();
    if (!selectedAdvisorId) {
      setMessage('⚠️ Selecione um consultor primeiro!');
      return;
    }

    const operational = Number(scorecardData.operational) || 1;
    const routine = Number(scorecardData.routine) || 1;
    const teamwork = Number(scorecardData.teamwork) || 1;
    const client = Number(scorecardData.client) || 1;
    const values = Number(scorecardData.values) || 1;

    // Calculate final score based on 90% total weight provided (normalized to 1-5 scale)
    const weightedSum = (operational * 0.4) + (routine * 0.1) + (teamwork * 0.1) + (client * 0.1) + (values * 0.2);
    const finalScore = weightedSum / 0.9;

    let classification = 'Bom';
    if (finalScore < 2.5) classification = 'Crítico';
    else if (finalScore < 3.5) classification = 'Atenção';
    else if (finalScore < 4.5) classification = 'Bom';
    else classification = 'Excelente';

    try {
      await firebaseService.saveScorecard({
        advisorId: selectedAdvisorId,
        year: scorecardData.year,
        criteria: { operational, routine, teamwork, client, values },
        finalScore: Number(finalScore.toFixed(2)),
        classification
      });
      showSuccess();
    } catch (err) {
      console.error("Scorecard Save Error:", err);
      setMessage('❌ Erro ao salvar: Verifique os campos e tente novamente');
    }
  };

  const showSuccess = () => {
    setMessage('✅ Salvo com sucesso!');
    setTimeout(() => setMessage(''), 3000);
  };

  const setError = () => setMessage('❌ Erro ao salvar.');

  const handleTabChange = (tab: AdminTab) => {
    setActiveTab(tab);
    setShowConfirmDelete(false);
  };

  return (
    <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-xl max-w-4xl mx-auto min-h-[600px]">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-100">
            <Save className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Centro de Gestão</h2>
            <p className="text-sm text-slate-500 font-medium">Alimente as informações do ecossistema Nibo.</p>
          </div>
        </div>
        <img 
          src="https://www.nibo.com.br/wp-content/uploads/2019/12/logo-nibo-blue.png" 
          alt="Nibo" 
          className="h-8 object-contain"
          referrerPolicy="no-referrer"
        />
      </div>

      <div className="grid grid-cols-5 gap-2 mb-8 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
        {[
          { id: 'advisors', icon: UserCog, label: 'Consultores' },
          { id: 'scorecard', icon: Gauge, label: 'Avaliação' },
          { id: 'performance', icon: TrendingUp, label: 'Meta' },
          { id: 'meetings', icon: Calendar, label: 'One-a-One' },
          { id: 'journey', icon: Trophy, label: 'Jornada' },
          { id: 'checklist', icon: CheckSquare, label: 'Melhoria' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id as AdminTab)}
            className={cn(
              "flex flex-col items-center gap-1.5 py-3 rounded-xl transition-all",
              activeTab === tab.id 
                ? "bg-white text-blue-600 shadow-sm border border-slate-100" 
                : "text-slate-400 hover:text-slate-600"
            )}
          >
            <tab.icon className="w-5 h-5" />
            <span className="text-[10px] font-black uppercase tracking-widest">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="space-y-8">
        {/* Helper Context Box */}
        {activeTab !== 'advisors' && (
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Selecionar Consultor Alvo</label>
            <select 
              value={selectedAdvisorId}
              onChange={(e) => setSelectedAdvisorId(e.target.value)}
              className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-blue-500 transition-all font-bold text-slate-900 appearance-none"
              required
            >
              <option value="">Selecione um consultor...</option>
              {advisors.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
        )}

        {activeTab === 'advisors' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-500">
            {/* List Column */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Registrados</h3>
                <button 
                  onClick={() => { setSelectedAdvisorId(''); setAdvisorData({ name: '', photoUrl: 'https://i.pravatar.cc/150?u=new', role: 'Consultor' }); }}
                  className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                  title="Novo Consultor"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {advisors.map(adv => (
                  <div 
                    key={adv.id} 
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-2xl border transition-all",
                      selectedAdvisorId === adv.id ? "bg-slate-900 border-slate-900 text-white shadow-lg" : "bg-white border-slate-100 hover:border-slate-200"
                    )}
                  >
                    <img src={adv.photoUrl} className="w-10 h-10 rounded-xl object-cover" alt="" referrerPolicy="no-referrer" />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate">{adv.name}</p>
                      <p className={cn("text-[9px] uppercase font-black tracking-widest opacity-60")}>{adv.role}</p>
                    </div>
                    <button 
                      onClick={() => startEditAdvisor(adv)}
                      className={cn("p-2 rounded-lg transition-colors", selectedAdvisorId === adv.id ? "bg-white/10 hover:bg-white/20" : "bg-slate-50 hover:bg-slate-100 text-slate-400")}
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Form Column */}
            <div className="space-y-6 p-6 bg-slate-50 rounded-3xl border border-slate-100">
              <div className="flex flex-col items-center gap-4 mb-6">
                <div className="relative group">
                  <img 
                    src={advisorData.photoUrl} 
                    className="w-24 h-24 rounded-[32px] object-cover border-4 border-white shadow-xl" 
                    alt="Preview" 
                    referrerPolicy="no-referrer"
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-2 -right-2 p-3 bg-blue-600 text-white rounded-2xl shadow-lg hover:scale-110 transition-transform active:scale-95"
                  >
                    <Upload className="w-4 h-4" />
                  </button>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  className="hidden" 
                  accept="image/*" 
                />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Carregar Foto</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400">Nome</label>
                  <input value={advisorData.name} onChange={e => setAdvisorData({...advisorData, name:e.target.value})} className="w-full p-4 rounded-2xl bg-white border border-slate-100 font-bold" placeholder="Nome Completo" required />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400">Cargo</label>
                  <input value={advisorData.role} onChange={e => setAdvisorData({...advisorData, role:e.target.value})} className="w-full p-4 rounded-2xl bg-white border border-slate-100 font-bold" placeholder="Ex: Sênior" required />
                </div>
                
                {selectedAdvisorId && (
                  <div className="space-y-2 mt-4">
                    <button 
                      type="button"
                      disabled={isDeleting}
                      onClick={handleDeleteAdvisor}
                      className={cn(
                        "flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-xs transition-all",
                        showConfirmDelete 
                          ? "bg-red-600 text-white shadow-lg animate-pulse" 
                          : "bg-red-50 text-red-600 hover:bg-red-100"
                      )}
                    >
                      <Trash2 className="w-4 h-4" />
                      {isDeleting ? 'EXCLUINDO...' : showConfirmDelete ? 'CONFIRMAR EXCLUSÃO?' : 'EXCLUIR CONSULTOR'}
                    </button>
                    {showConfirmDelete && !isDeleting && (
                      <button 
                         type="button"
                         onClick={() => setShowConfirmDelete(false)}
                         className="w-full text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600"
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Other Tabs content */}
        {activeTab === 'scorecard' && (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-900 text-white rounded-lg">
                  <Gauge className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400">Ciclo de Referência</p>
                  <select 
                    value={scorecardData.year} 
                    onChange={e => setScorecardData({...scorecardData, year: e.target.value})} 
                    className="bg-transparent font-black text-sm outline-none cursor-pointer"
                  >
                    {['2024', '2025', '2026', '2027'].map(y => (
                      <option key={y} value={y}>Ago/{parseInt(y)-1} - Jul/{y}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black uppercase text-slate-400">Score Atual</p>
                <p className="text-xl font-black text-blue-600">
                  {((scorecardData.operational * 0.4 + scorecardData.routine * 0.1 + scorecardData.teamwork * 0.1 + scorecardData.client * 0.1 + scorecardData.values * 0.2) / 0.9).toFixed(1)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {[
                { key: 'operational', label: 'Performance Operacional', weight: '40%', desc: 'Meta % e consistência mensal' },
                { key: 'routine', label: 'Rotina Comercial', weight: '10%', desc: 'CRM, Agenda, SLAs e Volume' },
                { key: 'teamwork', label: 'Trabalho em Equipe', weight: '10%', desc: 'Espírito de equipe e apoio' },
                { key: 'client', label: 'Relacionamento Cliente', weight: '10%', desc: 'Cordialidade e contorno de objeções' },
                { key: 'values', label: 'Valores Nibo', weight: '20%', desc: 'Viver e influenciar os valores' }
              ].map(item => (
                <div key={item.key} className={cn(
                  "p-6 bg-white border border-slate-100 rounded-3xl shadow-sm transition-all",
                  item.key === 'operational' ? "opacity-90 bg-blue-50/30 border-blue-100" : "hover:shadow-md"
                )}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-black text-slate-900 tracking-tight">{item.label}</h4>
                        <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full font-black text-slate-400">{item.weight}</span>
                        {item.key === 'operational' && (
                          <span className="text-[9px] bg-blue-600 text-white px-2 py-0.5 rounded-full font-black uppercase tracking-widest">Calculado</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">{item.desc}</p>
                    </div>
                    <div className="text-2xl font-black text-slate-300">{(scorecardData as any)[item.key]}</div>
                  </div>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(note => (
                      <button
                        key={note}
                        type="button"
                        disabled={item.key === 'operational'}
                        onClick={() => setScorecardData({...scorecardData, [item.key]: note})}
                        className={cn(
                          "flex-1 py-3 rounded-xl flex flex-col items-center gap-1 transition-all",
                          (scorecardData as any)[item.key] === note
                            ? (item.key === 'operational' ? "bg-blue-600 text-white shadow-lg" : "bg-slate-900 text-white shadow-lg scale-105")
                            : "bg-slate-50 text-slate-300 hover:bg-slate-100",
                          item.key === 'operational' && "cursor-default"
                        )}
                      >
                        <Star className={cn("w-4 h-4", (scorecardData as any)[item.key] >= note ? "fill-current" : "")} />
                        <span className="text-[10px] font-black">{note}</span>
                      </button>
                    ))}
                  </div>
                  {item.key === 'operational' && (
                    <p className="mt-3 text-[9px] font-bold text-blue-600 uppercase tracking-widest">Baseado na média de performance e atingimento de metas do ciclo.</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'performance' && (
          <form onSubmit={handlePerformanceSubmit} className="space-y-6 animate-in slide-in-from-bottom-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400">Mês</label>
                <input type="month" value={perfData.month} onChange={e => setPerfData({...perfData, month:e.target.value})} className="w-full p-4 rounded-2xl bg-slate-100 font-bold" required />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400">Entrega %</label>
                <input type="number" value={perfData.percentage} onChange={e => setPerfData({...perfData, percentage:Number(e.target.value)})} className="w-full p-4 rounded-2xl bg-slate-100 font-bold" placeholder="100" required />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {['normal', 'vacation', 'ramp'].map(s => (
                <button key={s} type="button" onClick={() => setPerfData({...perfData, status:s as any})} className={cn("py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all", perfData.status === s ? "bg-slate-900 border-slate-900 text-white shadow-md" : "bg-white border-slate-100 text-slate-400 hover:border-slate-200")}>{s === 'normal' ? 'Ativo' : s === 'vacation' ? 'Férias' : 'Ramp Up'}</button>
              ))}
            </div>
          </form>
        )}

        {/* Meeting, Checklist, Journey tabs remain simplified for use */}
        {activeTab === 'meetings' && (
          <form onSubmit={handleMeetingSubmit} className="space-y-6 animate-in slide-in-from-bottom-2">
             <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400">Data e Hora</label>
              <input type="datetime-local" value={meetingData.date} onChange={e => setMeetingData({...meetingData, date:e.target.value})} className="w-full p-4 rounded-2xl bg-slate-100 font-bold" required />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400">Notas da Reunião</label>
              <textarea value={meetingData.notes} onChange={e => setMeetingData({...meetingData, notes:e.target.value})} className="w-full p-4 rounded-2xl bg-slate-100 font-bold h-32 resize-none" placeholder="O que foi abordado hoje?" required />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400">Participantes</label>
              <input value={meetingData.participants} onChange={e => setMeetingData({...meetingData, participants:e.target.value})} className="w-full p-4 rounded-2xl bg-slate-100 font-bold" placeholder="Lista de nomes..." />
            </div>
          </form>
        )}

        {activeTab === 'checklist' && (
          <form onSubmit={handleChecklistSubmit} className="space-y-6 animate-in slide-in-from-bottom-2">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400">Título do Item</label>
              <input value={checklistData.title} onChange={e => setChecklistData({...checklistData, title:e.target.value})} className="w-full p-4 rounded-2xl bg-slate-100 font-bold" placeholder="Ex: Melhorar dicção" required />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400">Categoria</label>
              <select value={checklistData.category} onChange={e => setChecklistData({...checklistData, category:e.target.value})} className="w-full p-4 rounded-2xl bg-slate-100 font-bold appearance-none">
                <option>Technical</option>
                <option>Soft Skills</option>
                <option>Sales</option>
              </select>
            </div>
          </form>
        )}

        {activeTab === 'journey' && (
          <form onSubmit={handleMilestoneSubmit} className="space-y-6 animate-in slide-in-from-bottom-2">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400">Título do Marco</label>
              <input value={milestoneData.title} onChange={e => setMilestoneData({...milestoneData, title:e.target.value})} className="w-full p-4 rounded-2xl bg-slate-100 font-bold" placeholder="Ex: Kickoff Concluído" required />
            </div>
             <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400">Ordem Sequencial</label>
              <input type="number" value={milestoneData.order} onChange={e => setMilestoneData({...milestoneData, order:Number(e.target.value)})} className="w-full p-4 rounded-2xl bg-slate-100 font-bold" required />
            </div>
            <label className="flex items-center gap-4 p-5 bg-slate-50 rounded-[20px] border border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors">
              <input type="checkbox" checked={milestoneData.isCompleted} onChange={e => setMilestoneData({...milestoneData, isCompleted:e.target.checked})} className="w-6 h-6 rounded-lg text-blue-600 focus:ring-blue-500" />
              <span className="text-sm font-bold text-slate-700">MARCAR COMO CONCLUÍDO</span>
            </label>
          </form>
        )}

        {message && (
          <div className={cn("p-4 rounded-2xl text-[10px] font-black text-center uppercase tracking-widest animate-in fade-in", message.includes('✅') ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600")}>
            {message}
          </div>
        )}

        <button
          onClick={(e) => {
            const handlers = {
              performance: handlePerformanceSubmit,
              meetings: handleMeetingSubmit,
              checklist: handleChecklistSubmit,
              advisors: handleAdvisorSubmit,
              journey: handleMilestoneSubmit,
              scorecard: handleScorecardSubmit
            };
            handlers[activeTab](e);
          }}
          className="w-full py-5 bg-slate-900 text-white rounded-[20px] font-black text-xs tracking-[0.2em] hover:bg-black transition-all shadow-xl active:scale-[0.98] mt-4"
        >
          {activeTab === 'advisors' ? (selectedAdvisorId ? 'ATUALIZAR DADOS' : 'CRIAR NOVO CONSULTOR') : `REGISTRAR ${activeTab.toUpperCase()}`}
        </button>
      </div>

      <div className="mt-12 p-6 bg-slate-900 rounded-[24px] flex gap-4 text-white/80">
        <AlertCircle className="w-6 h-6 flex-shrink-0 text-blue-400" />
        <p className="text-[10px] leading-relaxed font-bold uppercase tracking-tight">
          As informações cadastradas aqui refletem imediatamente nos dashboards dos consultores. 
          Use o botão "Grade" na barra superior para acompanhar o consolidado de todos.
        </p>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  );
}
