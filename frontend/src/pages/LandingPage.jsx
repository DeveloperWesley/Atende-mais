import {
  ArrowRight,
  BarChart3,
  Bell,
  BriefcaseMedical,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Cloud,
  FileText,
  Home,
  LockKeyhole,
  LogOut,
  Moon,
  Paperclip,
  Plus,
  ReceiptText,
  ShieldCheck,
  UserPlus,
  WalletCards
} from "lucide-react";
import doctorProfile from "../assets/doctor-profile.png";
import { Button } from "../components/Button.jsx";
import { Logo } from "../components/Logo.jsx";

export function LandingPage({ onNavigate }) {
  return (
    <div className="site">
      <header className="site-header">
        <Logo />
        <nav>
          <a href="#recursos">Recursos</a>
          <a href="#beneficios">Benefícios</a>
          <a href="#como-funciona">Como funciona</a>
          <a href="#precos">Preços</a>
        </nav>
        <div className="header-actions">
          <Button variant="ghost" onClick={() => onNavigate("login")}>Entrar</Button>
          <Button onClick={() => onNavigate("register")}>Cadastrar</Button>
        </div>
      </header>

      <section className="hero">
        <div className="hero-content">
          <span className="eyebrow"><Paperclip size={13} /> Feito para profissionais da saúde</span>
          <h1>Controle de atendimentos, receitas e despesas para <strong>profissionais da saúde</strong></h1>
          <p>
            Organize sua rotina financeira com clareza: atendimentos, valores recebidos,
            pendências, documentos e dados fiscais em uma experiência rápida, visual e segura.
          </p>
          <div className="hero-actions">
            <Button onClick={() => onNavigate("register")}><ArrowRight size={19} /> Começar agora</Button>
            <Button variant="outline" onClick={() => onNavigate("login")}><LockKeyhole size={18} /> Fazer login</Button>
          </div>
          <div className="trust-row">
            <span><Cloud size={18} />100% em nuvem</span>
            <span><ShieldCheck size={18} />Dados seguros</span>
            <span><CheckCircle2 size={18} />Interface intuitiva</span>
          </div>
        </div>

        <div className="hero-product" aria-label="Prévia do painel ATENDE+">
          <div className="product-window hero-dashboard-preview">
            <div className="product-top">
              <Logo compact />
              <span>ATENDE+</span>
              <div className="product-user">
                <Moon size={13} />
                <span className="preview-bell">
                  <Bell size={13} />
                  <i />
                </span>
                <img className="avatar-img" src={doctorProfile} alt="Dra. Jennyff" />
                <small>Dra. Jennyff</small>
                <ChevronDown size={12} />
                <LogOut size={13} />
              </div>
            </div>
            <div className="product-body">
              <aside>
                {[
                  ["Resumo", Home],
                  ["Atendimentos", CalendarDays],
                  ["Receitas", WalletCards],
                  ["Despesas", ReceiptText],
                  ["Relatórios", FileText]
                ].map(([item, Icon], index) => (
                  <span className={index === 0 ? "selected" : ""} key={item}><Icon size={13} />{item}</span>
                ))}
                <button type="button">Recolher menu</button>
              </aside>
              <div className="product-main">
                <h3>Olá, Dra. Jennyff <span aria-hidden="true">👋</span></h3>
                <p>Aqui está o resumo do seu consultório hoje.</p>
                <div className="preview-actions">
                  <button className="active" type="button"><Plus size={13} />Novo atendimento</button>
                  <button type="button"><UserPlus size={13} />Novo paciente</button>
                  <button className="success" type="button"><Plus size={13} />Nova receita</button>
                  <button className="danger" type="button"><Plus size={13} />Nova despesa</button>
                  <button type="button"><FileText size={13} />Relatórios</button>
                </div>
                <div className="mini-metrics">
                  <article className="metric-blue"><CalendarDays size={17} /> <span>Atendimentos hoje</span><strong>12</strong><small>+20% vs ontem</small></article>
                  <article className="metric-green"><WalletCards size={17} /> <span>Receitas do mês</span><strong>R$ 28.540,00</strong><small>+15% vs mês anterior</small></article>
                  <article className="metric-red"><BarChart3 size={17} /> <span>Despesas do mês</span><strong>R$ 7.320,00</strong><small>-8% vs mês anterior</small></article>
                  <article className="metric-green"><BarChart3 size={17} /> <span>Resultado do mês</span><strong>R$ 21.220,00</strong><small>+17% vs mês anterior</small></article>
                </div>
                <div className="mini-grid">
                  <div className="fake-chart">
                    <div className="fake-chart-head">
                      <div>
                        <strong>Receitas x Despesas</strong>
                        <small>Comparativo financeiro dos últimos meses</small>
                      </div>
                      <em>Este mês</em>
                    </div>
                    <svg viewBox="0 0 360 170" role="img">
                      <g stroke="#dfe8f5" strokeDasharray="4 8">
                        {[28, 58, 88, 118, 148].map((y) => <line key={y} x1="0" x2="360" y1={y} y2={y} />)}
                      </g>
                      <polyline points="0,126 55,86 110,94 165,58 220,106 275,84 340,112" fill="none" stroke="#18b889" strokeWidth="5" />
                      <polyline points="0,142 55,114 110,138 165,112 220,119 275,132 340,122" fill="none" stroke="#ff4d59" strokeWidth="5" />
                      {[0, 55, 110, 165, 220, 275, 340].map((x) => <circle key={x} cx={x} cy="126" r="4" fill="#18b889" />)}
                    </svg>
                  </div>
                  <div className="pending-card">
                    <strong>Pendências</strong>
                    <small>Itens que precisam de atenção</small>
                    <CheckCircle2 size={42} />
                    <span>Nenhuma pendência cadastrada.</span>
                    <b>Tudo em dia!</b>
                    <button type="button">Ver todas as pendências</button>
                  </div>
                  <div className="preview-timeline">
                    <strong>Linha do tempo financeira</strong>
                    <span><FileText size={14} />Tudo pronto para começar <small>Hoje</small></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="recursos" className="features">
        <h2>Tudo que você precisa em um só lugar</h2>
        <p>Ferramentas completas para gerenciar seu consultório com eficiência e tranquilidade.</p>
        <div className="feature-grid">
          {[
            ["Atendimentos Inteligentes", "Organize seus atendimentos e tenha uma visão clara da sua rotina.", CalendarDays],
            ["Receitas e Atendimentos", "Registre consultas, procedimentos e recebimentos com dados fiscais.", BriefcaseMedical],
            ["Financeiro Completo", "Acompanhe receitas, despesas, pendências e pagamentos.", WalletCards],
            ["Base para o Contador", "Organize dados financeiros para sua contabilidade apurar obrigações com segurança.", BarChart3]
          ].map(([title, text, Icon]) => (
            <article className="feature-card" key={title}>
              <span><Icon size={28} /></span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
