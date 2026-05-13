import { useState } from "react";
import { AppLayout } from "./layouts/AppLayout.jsx";
import { LoginPage, RecoverPage, RegisterPage } from "./pages/AuthPages.jsx";
import { Dashboard } from "./pages/Dashboard.jsx";
import { AppointmentsPage, ExpensesPage, FinancePage, FiscalPage, PatientsPage, ReportsPage, SettingsPage } from "./pages/CrudPages.jsx";
import { LandingPage } from "./pages/LandingPage.jsx";
import { DashboardSkeleton } from "./components/Skeleton.jsx";
import { money, onlyDigits, parseCurrency } from "./utils/formatters.js";

const protectedPages = new Set(["dashboard", "patients", "appointments", "finance", "expenses", "reports", "fiscal", "settings"]);
const emptyStore = { patients: [], appointments: [], expenses: [] };

function loadJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch {
    return fallback;
  }
}

function normalizeName(value) {
  return String(value || "").trim().toLowerCase();
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
    const sameAsPayer = Boolean(values.sameAsPayer);
    const patientName = sameAsPayer ? values.payer : values.patientName;
    const patientCpf = sameAsPayer ? values.payerCpf : values.patientCpf;
    const amountNumber = parseCurrency(values.amount);
    const cardFeeNumber = 0;
    const netAmountNumber = Math.max(amountNumber - cardFeeNumber, 0);
    const documentNeed = values.documentNeed || "Não precisa";
    const appointment = {
      id: values.id || crypto.randomUUID(),
      patient: patientName,
      patientName,
      patientCpf,
      date: values.date,
      type: "Atendimento",
      specialty: "",
      amount: money(amountNumber),
      amountNumber,
      status: "Pago",
      paymentMethod: "Não informado",
      cardFee: money(cardFeeNumber),
      cardFeeNumber,
      netAmount: money(netAmountNumber),
      netAmountNumber,
      receivedAt: values.date,
      payer: values.payer,
      payerCpf: values.payerCpf,
      payerRelation: sameAsPayer ? "Próprio paciente" : "Terceiro/responsável",
      sameAsPayer,
      documentNeed,
      coverage: "",
      location: "",
      receiptNumber: "",
      fiscalStatus: documentNeed === "Nota fiscal" ? "NF solicitada" : documentNeed === "Recibo" ? "Recibo solicitado" : "Não precisa",
      account: "",
      attachment: "",
      notes: values.notes,
      accounting: values.payerCpf && patientCpf ? "Dados completos" : "Dados incompletos"
    };
    const existingPatientIndex = store.patients.findIndex((item) => {
      const sameDocument = patientCpf && item.cpf && onlyDigits(item.cpf) === onlyDigits(patientCpf);
      const sameName = normalizeName(item.name) === normalizeName(patientName);
      return sameDocument || sameName;
    });
    const nextPatients = [...store.patients];
    const patientData = {
      name: patientName,
      cpf: patientCpf,
      responsible: sameAsPayer ? "" : values.payer,
      responsibleCpf: sameAsPayer ? "" : values.payerCpf
    };

    if (patientName && existingPatientIndex >= 0) {
      const current = nextPatients[existingPatientIndex];
      nextPatients[existingPatientIndex] = {
        ...current,
        cpf: current.cpf || patientData.cpf,
        responsible: current.responsible || patientData.responsible,
        responsibleCpf: current.responsibleCpf || patientData.responsibleCpf,
        pending: current.pending || money(0)
      };
    } else if (patientName) {
      nextPatients.unshift({
        id: crypto.randomUUID(),
        name: patientData.name,
        cpf: patientData.cpf,
        birth: "",
        phone: "",
        email: "",
        address: "",
        notes: "Criado automaticamente a partir de um atendimento.",
        responsible: patientData.responsible,
        responsibleCpf: patientData.responsibleCpf,
        pending: money(0)
      });
    }

    persistStore({
      ...store,
      patients: nextPatients,
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
