import { useState } from "react";
import { UploadCloud, Settings2, Sparkles, Loader2, FileText, ChevronDown } from "lucide-react";
import { cn } from "@/src/lib/utils";

export default function NewAnalysis() {
  const [transcript, setTranscript] = useState("");
  const [coordinator, setCoordinator] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasProblem, setHasProblem] = useState(false);

  const handleAnalyze = () => {
    if (!transcript.trim()) return;
    setIsAnalyzing(true);
    // Simulate analysis
    setTimeout(() => {
      setIsAnalyzing(false);
      alert("Análise concluída com sucesso! (Simulação)");
    }, 3000);
  };

  if (isAnalyzing) {
    return (
      <div className="max-w-lg mx-auto mt-32 text-center animate-in fade-in duration-500">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#6431e2]/10 mb-5 animate-pulse">
          <Loader2 className="w-7 h-7 text-[#6431e2] animate-spin" />
        </div>
        <h3 className="text-lg text-slate-800 font-semibold mb-2">Analisando a transcrição...</h3>
        <p className="text-sm text-slate-500">Isto pode demorar até 1 minuto dependendo do tamanho da reunião.</p>
      </div>
    );
  }

  return (
    <section className="max-w-4xl mx-auto space-y-nibo-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-nibo-petroleo mb-nibo-xs">Nova Análise</h2>
        <p className="text-sm text-slate-500">Cole a transcrição da reunião para a IA analisar a qualidade do atendimento.</p>
      </div>

      <div className="space-y-nibo-md">
        {/* Transcription Input */}
        <div className="bg-white border border-nibo-gelo/30 rounded-nibo-card p-nibo-lg shadow-nibo">
          <div className="flex justify-between items-center mb-nibo-md">
            <h3 className="text-sm font-semibold text-nibo-petroleo flex items-center gap-nibo-xs">
              <UploadCloud className="w-4 h-4 text-nibo-azul-escuro" />
              Transcrição
            </h3>
            <label className="text-xs font-medium text-nibo-roxo cursor-pointer hover:underline flex items-center gap-nibo-xs">
              Carregar PDF
              <input type="file" accept=".pdf" className="hidden" />
            </label>
          </div>
          
          <textarea 
            rows={10}
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            className="w-full p-nibo-md bg-slate-50 border border-nibo-gelo/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-nibo-roxo/20 focus:border-nibo-roxo transition-all text-sm resize-y text-nibo-petroleo placeholder-slate-400"
            placeholder="Cole aqui a transcrição completa da reunião..."
          ></textarea>
          
          <div className="flex justify-between items-center mt-nibo-sm">
            <span className="text-[11px] text-slate-400 font-medium">{transcript.length.toLocaleString('pt-BR')} caracteres</span>
            
            <label className="flex items-center gap-nibo-sm cursor-pointer select-none group">
              <input 
                type="checkbox" 
                checked={hasProblem}
                onChange={(e) => setHasProblem(e.target.checked)}
                className="hidden" 
              />
              <div className={cn(
                "w-8 h-4 rounded-full flex items-center px-0.5 transition-all duration-200",
                hasProblem ? "bg-nibo-pink" : "bg-slate-200"
              )}>
                <div className={cn(
                  "w-3 h-3 rounded-full bg-white shadow transition-all duration-200 transform",
                  hasProblem ? "translate-x-4" : "translate-x-0"
                )}></div>
              </div>
              <span className={cn(
                "text-[11px] font-medium transition-colors",
                hasProblem ? "text-nibo-pink" : "text-slate-500"
              )}>
                {hasProblem ? "Problema de produto (Nota isenta)" : "Houve problema técnico/imprevisto"}
              </span>
            </label>
          </div>
        </div>

        {/* Configuration */}
        <div className="bg-white border border-nibo-gelo/30 rounded-nibo-card p-nibo-lg shadow-nibo">
          <h3 className="text-sm font-semibold text-nibo-petroleo mb-nibo-md flex items-center gap-nibo-xs">
            <Settings2 className="w-4 h-4 text-nibo-azul-escuro" />
            Configuração
          </h3>
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-600 block mb-nibo-xs">Coordenador responsável (opcional)</label>
            <div className="relative">
              <select 
                value={coordinator}
                onChange={(e) => setCoordinator(e.target.value)}
                className="w-full appearance-none bg-slate-50 border border-nibo-gelo/30 rounded-xl py-3 pl-nibo-md pr-10 text-sm text-nibo-petroleo focus:outline-none focus:ring-2 focus:ring-nibo-roxo/20 focus:border-nibo-roxo transition-all cursor-pointer"
              >
                <option value="">Selecione o coordenador...</option>
                <option value="Sayuri">Sayuri</option>
                <option value="Taynara">Taynara</option>
                <option value="Túlio">Túlio</option>
                <option value="Michel">Michel</option>
                <option value="Jéssica">Jéssica</option>
              </select>
              <ChevronDown className="absolute right-4 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button 
          onClick={handleAnalyze}
          disabled={!transcript.trim()}
          className="w-full flex items-center justify-center gap-nibo-sm bg-nibo-pink hover:bg-[#e639a0] text-white py-4 rounded-nibo-pill font-semibold text-sm transition-all active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
        >
          <Sparkles className="w-4 h-4" />
          Analisar Reunião
        </button>
      </div>
    </section>

  );
}
