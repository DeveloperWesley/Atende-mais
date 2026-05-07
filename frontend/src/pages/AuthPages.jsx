import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Cloud,
  LockKeyhole,
  Mail,
  Phone,
  ShieldCheck,
  UserRound,
  WalletCards
} from "lucide-react";
import doctorProfile from "../assets/doctor-profile.png";
import { Button } from "../components/Button.jsx";
import { Logo } from "../components/Logo.jsx";

const demoLogin = {
  email: "jennyff@atendemais.com.br",
  password: "Atende123",
  role: "professional",
  name: "Dra. Jennyff"
};

const adminLogin = {
  email: "admin@atendemais.com.br",
  password: "Admin123",
  role: "admin",
  name: "Administrador"
};

export function LoginPage({ onNavigate, onLogin }) {
  const [email, setEmail] = useState(demoLogin.email);
  const [password, setPassword] = useState(demoLogin.password);
  const [error, setError] = useState("");

  function handleLogin(event) {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();
    const user = [demoLogin, adminLogin].find((account) => account.email === normalizedEmail && account.password === password);

    if (!user) {
      setError("E-mail ou senha inválidos. Use um acesso padrão de demonstração.");
      return;
    }

    onLogin(user);
    setError("");
    onNavigate("dashboard");
  }

  return (
    <div className="login-reference">
      <header className="site-header login-header">
        <Logo />
        <nav>
          <a href="#recursos">Recursos</a>
          <a href="#beneficios">Benefícios</a>
          <a href="#como-funciona">Como funciona</a>
          <a href="#depoimentos">Depoimentos</a>
          <a href="#precos">Preços</a>
        </nav>
        <div className="header-actions">
          <Button variant="ghost" onClick={() => onNavigate("landing")}>Início</Button>
          <Button onClick={() => onNavigate("register")}>Cadastrar</Button>
        </div>
      </header>

      <main className="login-hero">
        <section className="login-copy">
          <span className="eyebrow"><LockKeyhole size={15} /> Acesso seguro para profissionais da saúde</span>
          <h1>Controle de atendimentos, receitas e despesas para <strong>profissionais da saúde</strong></h1>
          <p>
            Entre no ATENDE+ para acompanhar sua agenda, pendências, recebimentos,
            despesas e dados fiscais em um painel visual, rápido e seguro.
          </p>
          <div className="trust-row login-trust">
            <span><Cloud size={18} />100% em nuvem</span>
            <span><ShieldCheck size={18} />Dados seguros</span>
            <span><CheckCircle2 size={18} />Interface intuitiva</span>
          </div>
        </section>

        <section className="login-card-wrap">
          <div className="login-card">
            <Logo />
            <div className="login-card-title">
              <span>Bem-vindo de volta</span>
              <h2>Fazer login</h2>
              <p>Acesse seu painel financeiro e mantenha sua contabilidade organizada.</p>
            </div>
            <div className="demo-access">
              <span>Acesso padrão</span>
              <strong>{demoLogin.email}</strong>
              <small>Senha: {demoLogin.password}</small>
              <small>Admin: {adminLogin.email} / {adminLogin.password}</small>
            </div>
            <form className="auth-form" onSubmit={handleLogin}>
              <label>
                <span>E-mail</span>
                <input
                  type="email"
                  placeholder="voce@consultorio.com.br"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </label>
              <label>
                <span>Senha</span>
                <input
                  type="password"
                  placeholder="Sua senha"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </label>
              {error && <p className="form-error">{error}</p>}
              <div className="login-options">
                <label className="remember-check"><input type="checkbox" /> <span>Lembrar acesso</span></label>
                <button className="text-link" type="button" onClick={() => onNavigate("recover")}>Esqueci minha senha</button>
              </div>
              <Button type="submit"><ArrowRight size={18} /> Entrar</Button>
            </form>
            <p className="login-create">Ainda não tem conta? <button onClick={() => onNavigate("register")}>Cadastrar agora</button></p>
          </div>

          <div className="login-product">
            <div className="product-window compact-product">
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
              <div className="product-main">
                <h3>Resumo da clínica</h3>
                <p>Indicadores financeiros e fiscais do mês.</p>
                <div className="mini-metrics">
                  <article><CalendarDays size={17} /> <span>Atendimentos hoje</span><strong>12</strong></article>
                  <article><WalletCards size={17} /> <span>Receitas do mês</span><strong>R$ 28.540</strong></article>
                  <article><BarChart3 size={17} /> <span>Pendências</span><strong>8</strong></article>
                </div>
                <div className="pending-card">
                  <strong>Próximos recebimentos</strong>
                  <span>Paciente Carlos <b>R$ 350,00</b></span>
                  <span>Paciente Mariana <b>R$ 200,00</b></span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export function RegisterPage({ onNavigate }) {
  return (
    <AuthFrame wide>
      <button className="back-link" onClick={() => onNavigate("landing")}><ArrowLeft size={16} /> Voltar</button>
      <Logo />
      <h1>Crie sua conta</h1>
      <p>Cadastre seu perfil de pessoa física ou jurídica.</p>
      <form className="auth-form" onSubmit={(event) => { event.preventDefault(); onNavigate("dashboard"); }}>
        <div className="form-grid">
          <label><span>Nome completo</span><input required placeholder="Dra. Jennyff" /></label>
          <label><span>CPF ou CNPJ</span><input required placeholder="000.000.000-00" /></label>
          <label><span>E-mail</span><input type="email" required placeholder="voce@email.com" /></label>
          <label><span>Telefone</span><input required placeholder="(11) 99999-9999" /></label>
          <label><span>Profissão</span><input placeholder="Psicólogo, médico, dentista..." /></label>
          <label><span>Conselho profissional</span><input placeholder="CRM, CRP, CRO..." /></label>
          <label><span>Perfil</span><select><option>Pessoa Física</option><option>Pessoa Jurídica</option><option>Administrador</option></select></label>
          <label><span>Senha</span><input type="password" minLength="8" required /></label>
        </div>
        <Button type="submit">Cadastrar</Button>
      </form>
    </AuthFrame>
  );
}

export function RecoverPage({ onNavigate }) {
  return (
    <AuthFrame>
      <button className="back-link" onClick={() => onNavigate("login")}><ArrowLeft size={16} /> Voltar</button>
      <Logo />
      <h1>Recuperar senha</h1>
      <p>Informe seu e-mail para receber instruções de recuperação.</p>
      <form className="auth-form" onSubmit={(event) => event.preventDefault()}>
        <label><span>E-mail</span><input type="email" placeholder="voce@email.com" required /></label>
        <Button type="submit">Enviar instruções</Button>
      </form>
    </AuthFrame>
  );
}

function AuthFrame({ children, wide = false }) {
  return (
    <main className="auth-page">
      <section className={`auth-card ${wide ? "auth-card-wide" : ""}`}>{children}</section>
      <aside className="auth-aside">
        <span><UserRound size={20} /> Pacientes organizados</span>
        <span><Mail size={20} /> Relatórios fiscais exportáveis</span>
        <span><Phone size={20} /> Pendências sob controle</span>
      </aside>
    </main>
  );
}
