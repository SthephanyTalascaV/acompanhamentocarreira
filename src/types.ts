export interface Advisor {
  id: string;
  name: string;
  role: string;
  photoUrl: string;
  ownerEmail: string;
  averageGrade: number;
  currentProgress?: number;
  totalMilestones?: number;
  completedMilestones?: number;
}

export interface PerformanceRecord {
  id: string;
  advisorId: string;
  month: string;
  percentage: number;
  status: 'normal' | 'vacation' | 'ramp';
}

export interface ChecklistItem {
  id: string;
  advisorId: string;
  title: string;
  description?: string;
  category: string;
  isCompleted: boolean;
  createdAt: any;
}

export interface Meeting {
  id: string;
  advisorId: string;
  date: any;
  notes: string;
  nextMeetingDate: any;
  participants: string[];
}

export interface Milestone {
  id: string;
  advisorId: string;
  title: string;
  description?: string;
  dueDate: any;
  completedDate?: any | null;
  order: number;
}

export interface Scorecard {
  id: string;
  advisorId: string;
  year: string;
  criteria: {
    operational: number; // 40% (Automated)
    routine: number;     // 10%
    teamwork: number;    // 10%
    client: number;      // 10%
    values: number;      // 20%
  };
  finalScore: number;
  classification: string;
  createdAt: any;
}
