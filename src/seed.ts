import { collection, doc, writeBatch, Timestamp } from 'firebase/firestore';
import { db } from './lib/firebase';

const ADVISORS = [
  { id: 'yuri', name: 'Yuri', role: 'Consultor', photoUrl: 'https://i.pravatar.cc/150?u=yuri', averageGrade: 5 },
  { id: 'charles', name: 'Charles', role: 'Consultor', photoUrl: 'https://i.pravatar.cc/150?u=charles', averageGrade: 5 },
  { id: 'antonio', name: 'Antonio', role: 'Consultor', photoUrl: 'https://i.pravatar.cc/150?u=antonio', averageGrade: 5 },
  { id: 'bruno', name: 'Bruno', role: 'Consultor', photoUrl: 'https://i.pravatar.cc/150?u=bruno', averageGrade: 5 },
  { id: 'caio', name: 'Caio', role: 'Consultor', photoUrl: 'https://i.pravatar.cc/150?u=caio', averageGrade: 5 },
  { id: 'emelin', name: 'Emelin', role: 'Consultor', photoUrl: 'https://i.pravatar.cc/150?u=emelin', averageGrade: 5 },
  { id: 'leandro', name: 'Leandro', role: 'Consultor', photoUrl: 'https://i.pravatar.cc/150?u=leandro', averageGrade: 5 },
  { id: 'matheus', name: 'Matheus', role: 'Consultor', photoUrl: 'https://i.pravatar.cc/150?u=matheus', averageGrade: 5 },
];

const PERFORMANCE = [
  // Yuri
  { advisorId: 'yuri', month: '2025-08', percentage: 1.40, status: 'normal' },
  { advisorId: 'yuri', month: '2025-09', percentage: 1.27, status: 'normal' },
  { advisorId: 'yuri', month: '2025-10', percentage: 1.62, status: 'normal' },
  { advisorId: 'yuri', month: '2025-11', percentage: 1.36, status: 'normal' },
  { advisorId: 'yuri', month: '2025-12', percentage: 1.08, status: 'normal' },
  { advisorId: 'yuri', month: '2026-01', percentage: 1.36, status: 'normal' },
  { advisorId: 'yuri', month: '2026-02', percentage: 1.21, status: 'normal' },
  { advisorId: 'yuri', month: '2026-03', percentage: 1.36, status: 'normal' },
  // Charles
  { advisorId: 'charles', month: '2025-08', percentage: 1.54, status: 'normal' },
  { advisorId: 'charles', month: '2025-09', percentage: 1.24, status: 'normal' },
  { advisorId: 'charles', month: '2025-10', percentage: 1.55, status: 'normal' },
  { advisorId: 'charles', month: '2025-11', percentage: 1.39, status: 'normal' },
  { advisorId: 'charles', month: '2025-12', percentage: 1.21, status: 'normal' },
  { advisorId: 'charles', month: '2026-01', percentage: 0.88, status: 'normal' },
  { advisorId: 'charles', month: '2026-02', percentage: 1.61, status: 'normal' },
  { advisorId: 'charles', month: '2026-03', percentage: 1.36, status: 'normal' },
  // Antonio (Case for risk warning)
  { advisorId: 'antonio', month: '2025-12', percentage: 0.45, status: 'normal' },
  { advisorId: 'antonio', month: '2026-01', percentage: 1.02, status: 'normal' },
  { advisorId: 'antonio', month: '2026-02', percentage: 0.77, status: 'normal' },
  { advisorId: 'antonio', month: '2026-03', percentage: 1.06, status: 'normal' },
  // Matheus
  { advisorId: 'matheus', month: '2025-11', percentage: 0.0, status: 'ramp' },
  { advisorId: 'matheus', month: '2025-12', percentage: 1.22, status: 'normal' },
  { advisorId: 'matheus', month: '2026-01', percentage: 0.82, status: 'normal' },
  { advisorId: 'matheus', month: '2026-02', percentage: 1.28, status: 'normal' },
  { advisorId: 'matheus', month: '2026-03', percentage: 0.70, status: 'normal' },
];

const MILESTONES = [
  { advisorId: 'yuri', title: 'Reunião de Kickoff', order: 1, completedDate: Timestamp.now() },
  { advisorId: 'yuri', title: 'Configuração Inicial', order: 2, completedDate: Timestamp.now() },
  { advisorId: 'yuri', title: 'Integração Bancária', order: 3, completedDate: null },
  { advisorId: 'yuri', title: 'Lançamento de Obrigações', order: 4, completedDate: null },
  { advisorId: 'yuri', title: 'Treinamento de Equipe', order: 5, completedDate: null },
];

const CHECKLIST = [
  { advisorId: 'yuri', title: 'Melhorar oratória em reuniões', category: 'Soft Skills', isCompleted: false, createdAt: Timestamp.now() },
  { advisorId: 'yuri', title: 'Dominar o módulo de conciliação', category: 'Technical', isCompleted: true, createdAt: Timestamp.now() },
  { advisorId: 'yuri', title: 'Reduzir tempo de resposta no ticket', category: 'Technical', isCompleted: false, createdAt: Timestamp.now() },
];

export async function seedData() {
  const batch = writeBatch(db);

  const email = 'jonathan.dornelas@nibo.com.br';

  ADVISORS.forEach(a => {
    batch.set(doc(db, 'advisors', a.id), { ...a, ownerEmail: email });
  });

  PERFORMANCE.forEach((p, i) => {
    batch.set(doc(collection(db, 'performance')), { ...p, ownerEmail: email });
  });

  MILESTONES.forEach(m => {
    batch.set(doc(collection(db, 'milestones')), { ...m, ownerEmail: email });
  });

  CHECKLIST.forEach(c => {
    batch.set(doc(collection(db, 'checklists')), { ...c, ownerEmail: email });
  });

  await batch.commit();
  console.log('Seed completed');
}
