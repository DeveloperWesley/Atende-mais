import {
  BarChart3,
  Bell,
  CalendarDays,
  ChevronDown,
  FileSpreadsheet,
  Home,
  LogOut,
  ReceiptText,
  WalletCards
} from "lucide-react";
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
  const visibleNav = nav.filter((item) => item.id !== "fiscal" || user?.role === "admin");

  return (
    <div className="app-shell">
      <div className="app-frame">
        <header className="app-frame-top">
          <Logo />
          <div className="app-user-actions">
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

          <main className="workspace">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
