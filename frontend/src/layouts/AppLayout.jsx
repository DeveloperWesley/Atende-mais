import {
  BarChart3,
  Bell,
  CalendarDays,
  ChevronDown,
  FileSpreadsheet,
  Home,
  LogOut,
  Menu,
  Moon,
  ReceiptText,
  Sun,
  WalletCards
} from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import doctorProfile from "../assets/doctor-profile.png";
import { Logo } from "../components/Logo.jsx";

const nav = [
  { id: "dashboard", label: "Resumo", icon: Home },
  { id: "appointments", label: "Atendimentos", icon: CalendarDays },
  { id: "finance", label: "Receitas", icon: WalletCards },
  { id: "expenses", label: "Despesas", icon: ReceiptText },
  { id: "reports", label: "Relatórios", icon: BarChart3 },
  { id: "fiscal", label: "Contabilidade", icon: FileSpreadsheet }
];

export function AppLayout({ activePage, onNavigate, children, user, onLogout }) {
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem("atende_sidebar") === "collapsed");
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("atende_theme");
    if (saved) return saved;
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });
  const visibleNav = nav.filter((item) => item.id !== "fiscal" || user?.role === "admin");
  const activeLabel = visibleNav.find((item) => item.id === activePage)?.label || "Resumo";

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("atende_theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("atende_sidebar", collapsed ? "collapsed" : "expanded");
  }, [collapsed]);

  return (
    <div className={`app-shell ${collapsed ? "sidebar-collapsed" : ""}`}>
      <div className="app-frame">
        <header className="app-frame-top">
          <div className="app-brand-group">
            <button className="icon-action" onClick={() => setCollapsed((value) => !value)} aria-label="Recolher menu">
              <Menu size={19} />
            </button>
            <Logo />
          </div>
          <div className="app-context">
            <span>Você está em</span>
            <strong>{activeLabel}</strong>
          </div>
          <div className="app-user-actions">
            <button className="icon-action" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} aria-label="Alternar tema">
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button className="icon-action" aria-label="Notificações">
              <Bell size={18} />
            </button>
            <div className="topbar-profile">
              <img src={doctorProfile} alt={user?.name || "Usuário"} />
              <span>{user?.name || "Usuário"}</span>
              <ChevronDown size={16} />
            </div>
            <button className="logout icon-action" onClick={onLogout} aria-label="Sair">
              <LogOut size={17} />
            </button>
          </div>
        </header>

        <div className="app-frame-body">
          <aside className="sidebar">
            <nav>
              {visibleNav.map((item, index) => (
                <button
                  key={`${item.label}-${index}`}
                  className={activePage === item.id ? "active" : ""}
                  onClick={() => onNavigate(item.id)}
                  title={item.label}
                >
                  <item.icon size={16} />
                  {item.label}
                </button>
              ))}
            </nav>
          </aside>

          <motion.main
            className="workspace"
            key={activePage}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            {children}
          </motion.main>
        </div>
      </div>
    </div>
  );
}
