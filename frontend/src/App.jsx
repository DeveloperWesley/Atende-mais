import { useState } from "react";
import { AppLayout } from "./layouts/AppLayout.jsx";
import { LoginPage, RecoverPage, RegisterPage } from "./pages/AuthPages.jsx";
import { Dashboard } from "./pages/Dashboard.jsx";
import { AppointmentsPage, ExpensesPage, FinancePage, FiscalPage, PatientsPage, ReportsPage, SettingsPage } from "./pages/CrudPages.jsx";
import { LandingPage } from "./pages/LandingPage.jsx";
import { DashboardSkeleton } from "./components/Skeleton.jsx";
import { money, parseCurrency } from "./utils/formatters.js";

const protectedPages = new Set(["dashboard", "patients", "appointments", "finance", "expenses", "reports", "fiscal", "settings"]);
const emptyStore = { patients: [], appointments: [], expenses: [] };

function loadJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch {
    return fallback;
  }
}

export function App() {
  const [user, setUser] = useState(() => loadJson("atende_user", null));
  const [store, setStore] = useState(() => loadJson("atende_store", emptyStore));
  const [page, setPage] = useState(user ? "dashboard" : "landing");
  const [booting, setBooting] = useState(false);

  function persistStore(nextStore) {
    setStore(nextStore);
    localStorage.setItem("atende_store", JSON.stringify(nextStore));
  }

  function handleLogin(nextUser) {
    setBooting(true);
    setUser(nextUser);
    localStorage.setItem("atende_user", JSON.stringify(nextUser));
    window.setTimeout(() => setBooting(false), 450);
  }

  function handleLogout() {
    setUser(null);
    localStorage.removeItem("atende_user");
    setPage("landing");
  }

  function addPatient(values) {
    const patient = {
      id: values.id || crypto.randomUUID(),
      name: values.name,
      cpf: values.cpf,
      birth: values.birth,
      phone: values.phone,
      email: values.email,
      address: values.address,
      notes: values.notes,
      responsible: values.responsible,
      responsibleCpf: values.responsibleCpf,
      pending: money(0)
    };

    persistStore({
      ...store,
      patients: values.id ? store.patients.map((item) => item.id === values.id ? patient : item) : [patient, ...store.patients]
    });
  }

  function addAppointment(values) {
    const patient = store.patients.find((item) => item.name === values.patient);
    const status = values.payment || "Pendente";
    const amountNumber = parseCurrency(values.amount);
    const cardFeeNumber = parseCurrency(values.cardFee);
    const netAmountNumber = Math.max(amountNumber - cardFeeNumber, 0);
    const appointment = {
      id: values.id || crypto.randomUUID(),
      patient: values.patient,
      patientCpf: patient?.cpf || "",
      date: values.date,
      type: values.type || "Consulta",
      specialty: values.specialty,
      amount: money(amountNumber),
      amountNumber,
      status,
      paymentMethod: values.paymentMethod,
      cardFee: money(cardFeeNumber),
      cardFeeNumber,
      netAmount: money(netAmountNumber),
      netAmountNumber,
      receivedAt: values.receivedAt,
      payer: values.payer || values.patient,
      payerCpf: values.payerCpf,
      payerRelation: values.payerRelation || "Próprio paciente",
      coverage: values.coverage,
      location: values.location,
      receiptNumber: values.receiptNumber,
      fiscalStatus: values.fiscalStatus || "Pendente",
      account: values.account,
      attachment: values.attachment,
      notes: values.notes,
      accounting: values.payerCpf ? "Dados completos" : "Falta CPF do pagador"
    };

    persistStore({
      ...store,
      appointments: values.id ? store.appointments.map((item) => item.id === values.id ? appointment : item) : [appointment, ...store.appointments]
    });
  }

  function addExpense(values) {
    const amountNumber = parseCurrency(values.amount);
    const expense = {
      id: values.id || crypto.randomUUID(),
      date: values.date,
      competence: values.competence,
      category: values.category,
      supplier: values.supplier,
      supplierDocument: values.supplierDocument,
      invoiceNumber: values.invoiceNumber,
      amount: money(amountNumber),
      amountNumber,
      method: values.method,
      dueDate: values.dueDate,
      paidAt: values.paidAt,
      status: values.status || "Pendente",
      type: values.type,
      activityExpense: values.activityExpense || "Sim",
      deductible: values.deductible || "Não",
      attachment: values.attachment,
      notes: values.notes,
      recurrence: values.recurrence || "Não"
    };

    persistStore({
      ...store,
      expenses: values.id ? store.expenses.map((item) => item.id === values.id ? expense : item) : [expense, ...store.expenses]
    });
  }

  function deleteRecord(collection, id) {
    persistStore({ ...store, [collection]: store[collection].filter((item) => item.id !== id) });
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
    dashboard: booting ? <DashboardSkeleton /> : <Dashboard onNavigate={setPage} store={store} />,
    patients: <PatientsPage patients={store.patients} appointments={store.appointments} onCreate={addPatient} onDelete={(id) => deleteRecord("patients", id)} />,
    appointments: <AppointmentsPage patients={store.patients} appointments={store.appointments} onCreate={addAppointment} onDelete={(id) => deleteRecord("appointments", id)} />,
    finance: <FinancePage appointments={store.appointments} expenses={store.expenses} />,
    expenses: <ExpensesPage expenses={store.expenses} onCreate={addExpense} onDelete={(id) => deleteRecord("expenses", id)} />,
    reports: <ReportsPage appointments={store.appointments} expenses={store.expenses} patients={store.patients} />,
    fiscal: <FiscalPage appointments={store.appointments} expenses={store.expenses} patients={store.patients} />,
    settings: <SettingsPage />
  };

  return (
    <AppLayout activePage={page} onNavigate={setPage} user={user} onLogout={handleLogout}>
      {pages[page]}
    </AppLayout>
  );
}
