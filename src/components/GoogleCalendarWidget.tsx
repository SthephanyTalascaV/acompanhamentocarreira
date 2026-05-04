import React, { useEffect, useState } from 'react';
import { Calendar, ExternalLink, RefreshCw, LogIn } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CalendarEvent {
  summary: string;
  start: {
    dateTime: string;
  };
  htmlLink: string;
}

export const GoogleCalendarWidget: React.FC = () => {
  const [nextMeeting, setNextMeeting] = useState<CalendarEvent | null>(null);
  const [loading, setLoading] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  const fetchNextMeeting = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/calendar/next-meeting');
      if (response.ok) {
        const data = await response.json();
        if (data.nextMeeting) {
          setNextMeeting(data.nextMeeting);
          setAuthenticated(true);
        }
      } else if (response.status === 401) {
        setAuthenticated(false);
      }
    } catch (error) {
      console.error('Error fetching meeting:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNextMeeting();

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        fetchNextMeeting();
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleConnect = async () => {
    try {
      const response = await fetch('/api/auth/google/url');
      const { url } = await response.json();
      
      const width = 600;
      const height = 700;
      const left = window.screenX + (window.innerWidth - width) / 2;
      const top = window.screenY + (window.innerHeight - height) / 2;
      
      window.open(
        url,
        'google_auth',
        `width=${width},height=${height},left=${left},top=${top}`
      );
    } catch (error) {
      console.error('Error getting auth URL:', error);
    }
  };

  if (!authenticated) {
    return (
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between gap-4 group hover:border-blue-200 transition-all cursor-pointer" onClick={handleConnect}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Agenda Google</p>
            <h4 className="text-sm font-bold text-slate-800">Conectar Calendário</h4>
          </div>
        </div>
        <div className="p-2 bg-slate-50 rounded-xl text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
          <LogIn className="w-4 h-4" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
          <Calendar className="w-6 h-6" />
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Próxima One-a-One</p>
          {loading ? (
            <div className="flex items-center gap-2">
              <RefreshCw className="w-3 h-3 animate-spin text-slate-400" />
              <span className="text-xs font-medium text-slate-400">Sincronizando...</span>
            </div>
          ) : nextMeeting ? (
            <div>
              <h4 className="text-sm font-bold text-slate-800 mb-0.5 truncate max-w-[150px]">{nextMeeting.summary}</h4>
              <p className="text-[11px] font-medium text-slate-500">
                {format(new Date(nextMeeting.start.dateTime), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
              </p>
            </div>
          ) : (
            <p className="text-sm font-bold text-slate-400 italic">Sem reuniões agendadas</p>
          )}
        </div>
      </div>
      {nextMeeting && (
        <a 
          href={nextMeeting.htmlLink} 
          target="_blank" 
          rel="noopener noreferrer"
          className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:bg-slate-900 hover:text-white transition-all shadow-sm"
          title="Ver no Google Agenda"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      )}
      {!nextMeeting && !loading && (
        <button 
          onClick={fetchNextMeeting}
          className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:bg-slate-900 hover:text-white transition-all"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
