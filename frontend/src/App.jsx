import { useState } from "react";
import { AppLayout } from "./layouts/AppLayout.jsx";
import { LoginPage, RecoverPage, RegisterPage } from "./pages/AuthPages.jsx";
import { Dashboard } from "./pages/Dashboard.jsx";
import { AppointmentsPage, ExpensesPage, FinancePage, FiscalPage, PatientsPage, ReportsPage, SettingsPage } from "./pages/CrudPages.jsx";
import { LandingPage } from "./pages/LandingPage.jsx";

const protectedPages = new Set(["dashboard", "patients", "agenda", "appointments", "finance", "expenses", "reports", "fiscal", "settings"]);
const emptyStore = { patients: [], appointments: [], expenses: [] };

function loadJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch {
    return fallback;
  }
}

function formatCurrency(value) {
  const number = Number(value || 0);
  return number.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function App() {
  const [user, setUser] = useState(() => loadJson("atende_user", null));
  const [store, setStore] = useState(() => loadJson("atende_store", emptyStore));
  const [page, setPage] = useState(user ? "dashboard" : "landing");

  function persistStore(nextStore) {
    setStore(nextStore);
    localStorage.setItem("atende_store", JSON.stringify(nextStore));
  }

  function handleLogin(nextUser) {
    setUser(nextUser);
    localStorage.setItem("atende_user", JSON.stringify(nextUser));
  }

  function handleLogout() {
    setUser(null);
    localStorage.removeItem("atende_user");
    setPage("landing");
  }

  function addPatient(values) {
    persistStore({
      ...store,
      patients: [{ id: crypto.randomUUID(), pending: formatCurrency(0), ...values }, ...store.patients]
    });
  }

  function addAppointment(values) {
    const patient = store.patients.find((item) => item.name === values.patient);
    const status = values.payment || "Pendente";
    persistStore({
      ...store,
      appointments: [{
        id: crypto.randomUUID(),
        patient: values.patient,
        patientCpf: patient?.cpf || "",
        date: values.date,
        type: values.type || "Consulta",
        amount: formatCurrency(values.amount),
        amountNumber: Number(values.amount || 0),
        status,
        receivedAt: values.receivedAt,
        payer: values.payer || values.patient,
        payerCpf: values.payerCpf,
        payerRelation: values.payerRelation || "Próprio paciente",
        accounting: values.payerCpf ? "Dados completos" : "Falta CPF do pagador"
      }, ...store.appointments]
    });
  }

  function addExpense(values) {
    persistStore({
      ...store,
      expenses: [{
        id: crypto.randomUUID(),
        date: values.date,
        category: values.category,
        amount: formatCurrency(values.amount),
        amountNumber: Number(values.amount || 0),
        method: values.method,
        attachment: values.attachment,
        deductible: values.deductible || "Não"
      }, ...store.expenses]
    });
  }

  if (page === "login") return <LoginPage onNavigate={setPage} onLogin={handleLogin} />;
  if (page === "register") return <RegisterPage onNavigate={setPage} />;
  if (page === "recover") return <RecoverPage onNavigate={setPage} />;
  if (!user && protectedPages.has(page)) return <LoginPage onNavigate={setPage} onLogin={handleLogin} />;
  if (!protectedPages.has(page)) return <LandingPage onNavigate={setPage} />;
  if (page === "fiscal" && user?.role !== "admin") {
    return (
      <AppLayout activePage="dashboard" onNavigate={setPage} user={user} onLogout={handleLogout}>
        <Dashboard onNavigate={setPage} store={store} />
      </AppLayout>
    );
  }

  const pages = {
    dashboard: <Dashboard onNavigate={setPage} store={store} />,
    agenda: <AppointmentsPage patients={store.patients} appointments={store.appointments} onCreate={addAppointment} />,
    patients: <PatientsPage patients={store.patients} onCreate={addPatient} />,
    appointments: <AppointmentsPage patients={store.patients} appointments={store.appointments} onCreate={addAppointment} />,
    finance: <FinancePage appointments={store.appointments} expenses={store.expenses} />,
    expenses: <ExpensesPage expenses={store.expenses} onCreate={addExpense} />,
    reports: <ReportsPage />,
    fiscal: <FiscalPage appointments={store.appointments} expenses={store.expenses} />,
    settings: <SettingsPage />
  };

  return (
    <AppLayout activePage={page} onNavigate={setPage} user={user} onLogout={handleLogout}>
      {pages[page]}
    </AppLayout>
  );
}
