import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import { LayoutDashboard, PlusCircle, History, Bug, LogOut } from "lucide-react";
import { cn } from "@/src/lib/utils";
import Dashboard from "./components/Dashboard";
import NewAnalysis from "./components/NewAnalysis";
import MeetingHistory from "./components/MeetingHistory";
import ProductInsights from "./components/ProductInsights";

function Sidebar() {
  const location = useLocation();

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/" },
    { icon: PlusCircle, label: "Nova Análise", path: "/new" },
    { icon: History, label: "Histórico", path: "/history" },
    { icon: Bug, label: "Insights de Produto", path: "/insights" },
  ];

  return (
    <aside className="w-[260px] flex-shrink-0 flex flex-col text-white transition-all duration-300 z-20 nibo-gradient-1">
      <div className="p-7 mb-4">
        <h1 className="text-3xl font-black tracking-tighter">nibo</h1>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-white/80 mt-1">CS Quality Analysis</p>
      </div>
      <nav className="flex-1 px-4 space-y-1.5">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm transition-colors",
              location.pathname === item.path
                ? "font-semibold text-white bg-white/20 shadow-md"
                : "font-medium text-white/70 hover:text-white hover:bg-white/10"
            )}
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="p-4 mt-auto border-t border-white/10">
        <div className="flex items-center gap-3 px-4 py-3 text-white/70 hover:text-white cursor-pointer transition-colors">
          <LogOut className="w-4 h-4" />
          <span className="text-sm font-medium">Sair</span>
        </div>
      </div>
    </aside>
  );
}

function Header() {
  return (
    <header className="bg-white border-b border-nibo-gelo/30 h-[72px] flex items-center justify-between px-8 flex-shrink-0 z-10 shadow-sm">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-bold text-nibo-petroleo">Auditor de Qualidade CS</h2>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-bold text-nibo-petroleo leading-none mb-0.5">Nibo Team</p>
          <p className="text-xs text-slate-500 leading-none">cs@nibo.com.br</p>
        </div>
        <div className="w-9 h-9 rounded-full bg-nibo-roxo text-white flex items-center justify-center text-xs font-bold shadow-sm">NT</div>
      </div>
    </header>
  );
}

export default function App() {
  return (
    <Router>
      <div className="flex h-screen bg-slate-50 w-full overflow-hidden font-sans">
        <Sidebar />
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-nibo-xl bg-[#f1f5f9]">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/new" element={<NewAnalysis />} />
              <Route path="/history" element={<MeetingHistory />} />
              <Route path="/insights" element={<ProductInsights />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}
