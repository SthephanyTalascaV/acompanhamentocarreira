import { type Meeting } from '../types';
import { Calendar, Users, MessageSquare } from 'lucide-react';

interface MeetingsProps {
  meetings: Meeting[];
}

export function Meetings({ meetings }: MeetingsProps) {
  return (
    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm h-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Histórico de Reuniões</h3>
          <p className="text-sm text-slate-500">Notas e alinhamentos de One-a-One</p>
        </div>
      </div>

      <div className="space-y-4">
        {meetings.map((meeting) => (
          <div key={meeting.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-bold text-slate-900">
                  {meeting.date.toDate().toLocaleDateString('pt-BR')}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3 text-slate-400" />
                <span className="text-[10px] text-slate-500 font-medium">
                  {meeting.participants.join(', ')}
                </span>
              </div>
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-100">
              <div className="flex items-start gap-2">
                <MessageSquare className="w-3 h-3 text-slate-400 mt-1" />
                <p className="text-xs text-slate-600 leading-relaxed italic">
                  "{meeting.notes}"
                </p>
              </div>
            </div>
          </div>
        ))}

        {meetings.length === 0 && (
          <div className="py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <p className="text-slate-400 text-xs italic">Nenhuma reunião registrada.</p>
          </div>
        )}
      </div>
    </div>
  );
}
