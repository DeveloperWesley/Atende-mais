import { ArrowRight, Bell, CalendarDays, CheckCircle2, ChevronDown, Cloud, LockKeyhole, Paperclip, ShieldCheck, WalletCards, BarChart3, BriefcaseMedical } from "lucide-react";
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
          <div className="product-window">
            <div className="product-top">
              <Logo compact />
              <span>ATENDE+</span>
              <div className="product-user">
                <Bell size={13} />
                <img className="avatar-img" src={doctorProfile} alt="Dra. Jennyff" />
                <small>Dra. Jennyff</small>
                <ChevronDown size={12} />
              </div>
            </div>
            <div className="product-body">
              <aside>
                {["Resumo", "Agenda", "Atendimentos", "Receitas", "Despesas", "Relatórios"].map((item, index) => (
                  <span className={index === 0 ? "selected" : ""} key={item}>{item}</span>
                ))}
              </aside>
              <div className="product-main">
                <h3>Olá, Dra. Jennyff</h3>
                <p>Aqui está o resumo do seu consultório hoje.</p>
                <div className="mini-metrics">
                  <article><CalendarDays size={17} /> <span>Atendimentos hoje</span><strong>12</strong></article>
                  <article><WalletCards size={17} /> <span>Receitas do mês</span><strong>R$ 28.540</strong></article>
                  <article><BarChart3 size={17} /> <span>Despesas do mês</span><strong>R$ 7.320</strong></article>
                </div>
                <div className="mini-grid">
                  <div className="fake-chart">
                    <strong>Receitas x Despesas</strong>
                    <svg viewBox="0 0 360 170" role="img">
                      <polyline points="0,105 55,70 110,82 165,38 220,92 275,76 340,112" fill="none" stroke="#18b889" strokeWidth="5" />
                      <polyline points="0,132 55,104 110,142 165,112 220,119 275,138 340,116" fill="none" stroke="#ff4d59" strokeWidth="5" />
                      {[0, 55, 110, 165, 220, 275, 340].map((x) => <circle key={x} cx={x} cy="105" r="4" fill="#18b889" />)}
                    </svg>
                  </div>
                  <div className="pending-card">
                    <strong>Pendências</strong>
                    <span>Paciente Carlos <b>R$ 350,00</b></span>
                    <span>Paciente Mariana <b>R$ 200,00</b></span>
                    <span>Paciente Ana <b>R$ 150,00</b></span>
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
            ["Agenda Inteligente", "Organize seus atendimentos e tenha uma visão clara do seu dia.", CalendarDays],
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
