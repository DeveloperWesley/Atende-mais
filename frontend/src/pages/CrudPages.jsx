import { useMemo, useState } from "react";
import { Download, FileSpreadsheet } from "lucide-react";
import { Button } from "../components/Button.jsx";
import { ConfirmDialog } from "../components/ConfirmDialog.jsx";
import { DataTable } from "../components/DataTable.jsx";
import { DetailDrawer } from "../components/DetailDrawer.jsx";
import { Filters } from "../components/Filters.jsx";
import { QuickForm } from "../components/QuickForm.jsx";
import { reports } from "../data/mockData.js";
import { exportCsv, exportPrint } from "../utils/exporters.js";
import { formatDate, formatDateTime, isOverdue, money } from "../utils/formatters.js";

const paymentStatuses = ["Pago", "Pendente", "Vencido", "Cancelado"];
const paymentMethods = ["Pix", "Dinheiro", "Cartão", "Transferência", "Boleto"];
const documentNeeds = ["Não precisa", "Recibo", "Nota fiscal"];

function normalize(value) {
  return String(value || "").toLowerCase();
}

function useCrudState() {
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  return { editing, setEditing, viewing, setViewing, deleting, setDeleting };
}

export function PatientsPage({ patients = [], appointments = [], onCreate, onDelete }) {
  const crud = useCrudState();
  const [filters, setFilters] = useState({ search: "" });
  const rows = patients
    .filter((patient) => !filters.search || normalize(`${patient.name} ${patient.cpf} ${patient.phone}`).includes(normalize(filters.search)))
    .map((patient) => {
      const history = appointments.filter((item) => item.patient === patient.name);
      const pending = history.filter((item) => item.status !== "Pago").reduce((sum, item) => sum + Number(item.amountNumber || 0), 0);
      return {
        ...patient,
        birthFormatted: formatDate(patient.birth),
        pending: money(pending),
        historyCount: `${history.length} atend.`
      };
    });

  return (
    <ResourcePage title="Pacientes" eyebrow="Cadastro simples para atendimentos, contato e responsáveis">
      <QuickForm
        title={crud.editing ? "Editar paciente" : "Novo paciente"}
        editingItem={crud.editing}
        onCancelEdit={() => crud.setEditing(null)}
        onSubmit={(values) => { onCreate(values); crud.setEditing(null); }}
        fields={[
          { name: "name", label: "Nome completo", required: true },
          { name: "cpf", label: "CPF", mask: "cpfCnpj" },
          { name: "birth", label: "Data de nascimento", type: "date" },
          { name: "phone", label: "Telefone/WhatsApp", mask: "phone" },
          { name: "email", label: "E-mail", type: "email" },
          { name: "address", label: "Endereço" },
          { name: "responsible", label: "Responsável financeiro/pagador" },
          { name: "responsibleCpf", label: "CPF/CNPJ do responsável", mask: "cpfCnpj" },
          { name: "notes", label: "Observações" }
        ]}
      />
      <Filters
        filters={[{ name: "search", label: "Buscar", placeholder: "Nome, CPF ou telefone" }]}
        values={filters}
        onChange={(name, value) => setFilters((current) => ({ ...current, [name]: value }))}
        onClear={() => setFilters({ search: "" })}
      />
      <DataTable
        columns={[
          { key: "name", label: "Paciente", primary: true },
          { key: "cpf", label: "CPF" },
          { key: "phone", label: "WhatsApp" },
          { key: "responsible", label: "Pagador" },
          { key: "pending", label: "Pendente" },
          { key: "historyCount", label: "Histórico" }
        ]}
        rows={rows}
        onView={crud.setViewing}
        onEdit={crud.setEditing}
        onDelete={crud.setDeleting}
      />
      <DetailDrawer
        item={crud.viewing}
        title="Detalhes do paciente"
        onClose={() => crud.setViewing(null)}
        fields={[
          { key: "name", label: "Nome" },
          { key: "cpf", label: "CPF" },
          { key: "birthFormatted", label: "Nascimento" },
          { key: "phone", label: "Telefone/WhatsApp" },
          { key: "email", label: "E-mail" },
          { key: "address", label: "Endereço" },
          { key: "responsible", label: "Responsável financeiro" },
          { key: "responsibleCpf", label: "CPF/CNPJ do responsável" },
          { key: "notes", label: "Observações" }
        ]}
      />
      <ConfirmDialog item={crud.deleting} onCancel={() => crud.setDeleting(null)} onConfirm={(item) => { onDelete(item.id); crud.setDeleting(null); }} />
    </ResourcePage>
  );
}

export function AppointmentsPage({ patients = [], appointments = [], onCreate, onDelete }) {
  const crud = useCrudState();
  const [filters, setFilters] = useState({ search: "", documentNeed: "", from: "", to: "" });
  const editingAppointment = crud.editing ? {
    ...crud.editing,
    patientName: crud.editing.patientName || crud.editing.patient,
    documentNeed: crud.editing.documentNeed || (crud.editing.fiscalStatus === "NF emitida" ? "Nota fiscal" : crud.editing.fiscalStatus === "Recibo emitido" ? "Recibo" : "Não precisa"),
    sameAsPayer: crud.editing.sameAsPayer ?? (crud.editing.patient === crud.editing.payer && crud.editing.patientCpf === crud.editing.payerCpf)
  } : null;
  const rows = appointments
    .filter((item) => !filters.search || normalize(`${item.patient} ${item.patientCpf} ${item.payer} ${item.payerCpf}`).includes(normalize(filters.search)))
    .filter((item) => !filters.documentNeed || item.documentNeed === filters.documentNeed)
    .filter((item) => !filters.from || item.date?.slice(0, 10) >= filters.from)
    .filter((item) => !filters.to || item.date?.slice(0, 10) <= filters.to)
    .map((item) => ({
      ...item,
      dateFormatted: formatDate(item.date),
      receivedFormatted: formatDate(item.receivedAt),
      documentNeed: item.documentNeed || (item.fiscalStatus === "NF emitida" ? "Nota fiscal" : item.fiscalStatus === "Recibo emitido" ? "Recibo" : "Não precisa")
    }));

  return (
    <ResourcePage title="Atendimentos" eyebrow="Cadastro enxuto com as informações necessárias para IRPF, recibos, NF e conferência contábil">
      <QuickForm
        title={crud.editing ? "Editar atendimento" : "Novo atendimento"}
        editingItem={editingAppointment}
        onCancelEdit={() => crud.setEditing(null)}
        onSubmit={(values) => { onCreate(values); crud.setEditing(null); }}
        fields={[
          { name: "date", label: "Data do atendimento", type: "date", required: true },
          { name: "amount", label: "Valor recebido (R$)", type: "text", placeholder: "Ex: 150,00", required: true },
          { type: "section", label: "Pagador" },
          { name: "payer", label: "Nome do pagador", placeholder: "Nome completo", required: true },
          { name: "payerCpf", label: "CPF/CNPJ do pagador (11 ou 14 dígitos)", placeholder: "Somente números", mask: "cpfCnpj", digits: [11, 14], required: true, help: "Use CPF para pessoa física ou CNPJ para empresa/responsável PJ." },
          { name: "sameAsPayer", label: "Paciente é o mesmo do pagador", type: "checkbox", defaultValue: false },
          { type: "section", label: "Paciente" },
          { name: "patientName", label: "Nome do paciente", placeholder: "Nome completo", required: (values) => !values.sameAsPayer, hiddenWhen: (values) => values.sameAsPayer },
          { name: "patientCpf", label: "CPF do paciente (11 dígitos)", placeholder: "Somente números", mask: "cpfCnpj", digits: 11, required: (values) => !values.sameAsPayer, hiddenWhen: (values) => values.sameAsPayer },
          { name: "documentNeed", label: "Paciente vai precisar de NF ou recibo?", type: "select", options: documentNeeds, required: true },
          { name: "notes", label: "Observações", type: "textarea", span: "full", placeholder: "Opcional" }
        ]}
      />
      <Filters
        filters={[
          { name: "search", label: "Buscar", placeholder: "Paciente, pagador ou CPF" },
          { name: "documentNeed", label: "NF/Recibo", type: "select", options: documentNeeds },
          { name: "from", label: "De", type: "date" },
          { name: "to", label: "Até", type: "date" }
        ]}
        values={filters}
        onChange={(name, value) => setFilters((current) => ({ ...current, [name]: value }))}
        onClear={() => setFilters({ search: "", documentNeed: "", from: "", to: "" })}
      />
      <DataTable
        columns={[
          { key: "patient", label: "Paciente", primary: true },
          { key: "patientCpf", label: "CPF paciente" },
          { key: "dateFormatted", label: "Atendimento" },
          { key: "amount", label: "Valor" },
          { key: "payer", label: "Pagador" },
          { key: "payerCpf", label: "CPF/CNPJ pagador" },
          { key: "documentNeed", label: "NF/Recibo", badge: true }
        ]}
        rows={rows}
        onView={crud.setViewing}
        onEdit={crud.setEditing}
        onDelete={crud.setDeleting}
      />
      <DetailDrawer item={crud.viewing} title="Detalhes do atendimento" onClose={() => crud.setViewing(null)} fields={[
        { key: "patient", label: "Paciente" },
        { key: "patientCpf", label: "CPF do paciente" },
        { key: "payer", label: "Pagador" },
        { key: "payerCpf", label: "CPF/CNPJ do pagador" },
        { key: "payerRelation", label: "Vínculo" },
        { key: "dateFormatted", label: "Data do atendimento" },
        { key: "receivedFormatted", label: "Data do recebimento" },
        { key: "amount", label: "Valor recebido" },
        { key: "documentNeed", label: "Precisa de NF/recibo?" },
        { key: "notes", label: "Observações" }
      ]} />
      <ConfirmDialog item={crud.deleting} onCancel={() => crud.setDeleting(null)} onConfirm={(item) => { onDelete(item.id); crud.setDeleting(null); }} />
    </ResourcePage>
  );
}

export function FinancePage({ appointments = [], expenses = [] }) {
  const [filters, setFilters] = useState({ status: "", patient: "", method: "", from: "", to: "" });
  const rows = appointments
    .filter((item) => !filters.status || item.status === filters.status)
    .filter((item) => !filters.patient || item.patient === filters.patient)
    .filter((item) => !filters.method || item.paymentMethod === filters.method)
    .filter((item) => !filters.from || item.date?.slice(0, 10) >= filters.from)
    .filter((item) => !filters.to || item.date?.slice(0, 10) <= filters.to)
    .map((item) => ({ ...item, dateFormatted: formatDateTime(item.date) }));

  const received = appointments.filter((item) => item.status === "Pago").reduce((sum, item) => sum + Number(item.amountNumber || 0), 0);
  const pending = appointments.filter((item) => item.status === "Pendente" || item.status === "Parcelado").reduce((sum, item) => sum + Number(item.amountNumber || 0), 0);
  const canceled = appointments.filter((item) => item.status === "Cancelado").reduce((sum, item) => sum + Number(item.amountNumber || 0), 0);
  const fees = appointments.reduce((sum, item) => sum + Number(item.cardFeeNumber || 0), 0);
  const expenseTotal = expenses.reduce((sum, item) => sum + Number(item.amountNumber || 0), 0);

  return (
    <ResourcePage title="Receitas" eyebrow="Acompanhe recebidos, pendentes, vencidos, cancelados e valor líquido">
      <div className="finance-summary">
        <article><span>Receita bruta recebida</span><strong>{money(received)}</strong></article>
        <article><span>Receitas pendentes</span><strong>{money(pending)}</strong></article>
        <article><span>Taxas de cartão</span><strong>{money(fees)}</strong></article>
        <article><span>Resultado líquido</span><strong>{money(received - fees - expenseTotal)}</strong></article>
      </div>
      <Filters
        filters={[
          { name: "patient", label: "Paciente", type: "select", options: [...new Set(appointments.map((item) => item.patient).filter(Boolean))] },
          { name: "status", label: "Status", type: "select", options: paymentStatuses },
          { name: "method", label: "Forma", type: "select", options: paymentMethods },
          { name: "from", label: "De", type: "date" },
          { name: "to", label: "Até", type: "date" }
        ]}
        values={filters}
        onChange={(name, value) => setFilters((current) => ({ ...current, [name]: value }))}
        onClear={() => setFilters({ status: "", patient: "", method: "", from: "", to: "" })}
      />
      <DataTable
        columns={[
          { key: "patient", label: "Paciente", primary: true },
          { key: "dateFormatted", label: "Atendimento" },
          { key: "amount", label: "Bruto" },
          { key: "cardFee", label: "Taxa" },
          { key: "netAmount", label: "Líquido" },
          { key: "status", label: "Status", badge: true },
          { key: "paymentMethod", label: "Forma" },
          { key: "account", label: "Conta" }
        ]}
        rows={rows}
      />
    </ResourcePage>
  );
}

export function ExpensesPage({ expenses = [], onCreate, onDelete }) {
  const crud = useCrudState();
  const [filters, setFilters] = useState({ status: "", category: "", from: "", to: "" });
  const rows = expenses
    .filter((item) => !filters.status || item.status === filters.status)
    .filter((item) => !filters.category || item.category === filters.category)
    .filter((item) => !filters.from || item.date >= filters.from)
    .filter((item) => !filters.to || item.date <= filters.to)
    .map((item) => ({
      ...item,
      dateFormatted: formatDate(item.date),
      status: isOverdue(item.dueDate, item.status) ? "Vencida" : item.status
    }));

  return (
    <ResourcePage title="Despesas" eyebrow="Controle gastos, comprovantes, vencimentos e despesas da atividade">
      <QuickForm
        title={crud.editing ? "Editar despesa" : "Nova despesa"}
        editingItem={crud.editing}
        onCancelEdit={() => crud.setEditing(null)}
        onSubmit={(values) => { onCreate(values); crud.setEditing(null); }}
        fields={[
          { name: "date", label: "Data", type: "date", required: true },
          { name: "competence", label: "Competência", type: "month" },
          { name: "category", label: "Categoria", type: "select", options: ["Aluguel", "Energia", "Internet", "Materiais", "Equipamentos", "Contabilidade", "Sistemas", "Outras"], required: true },
          { name: "supplier", label: "Fornecedor" },
          { name: "supplierDocument", label: "CPF/CNPJ fornecedor", mask: "cpfCnpj" },
          { name: "invoiceNumber", label: "Número da nota fiscal" },
          { name: "amount", label: "Valor", type: "number", required: true },
          { name: "method", label: "Forma de pagamento", type: "select", options: paymentMethods },
          { name: "dueDate", label: "Data de vencimento", type: "date" },
          { name: "paidAt", label: "Data de pagamento", type: "date" },
          { name: "status", label: "Status", type: "select", options: ["Paga", "Pendente", "Vencida"] },
          { name: "type", label: "Tipo", type: "select", options: ["Fixa", "Variável", "Eventual"] },
          { name: "activityExpense", label: "Despesa da atividade?", type: "select", options: ["Sim", "Não"] },
          { name: "deductible", label: "Dedutível livro-caixa/IRPF?", type: "select", options: ["Sim", "Não"] },
          { name: "attachment", label: "Comprovante/anexo" },
          { name: "recurrence", label: "Recorrência mensal?", type: "select", options: ["Sim", "Não"] },
          { name: "notes", label: "Observações" }
        ]}
      />
      <Filters
        filters={[
          { name: "status", label: "Status", type: "select", options: ["Paga", "Pendente", "Vencida"] },
          { name: "category", label: "Categoria", type: "select", options: [...new Set(expenses.map((item) => item.category).filter(Boolean))] },
          { name: "from", label: "De", type: "date" },
          { name: "to", label: "Até", type: "date" }
        ]}
        values={filters}
        onChange={(name, value) => setFilters((current) => ({ ...current, [name]: value }))}
        onClear={() => setFilters({ status: "", category: "", from: "", to: "" })}
      />
      <DataTable
        columns={[
          { key: "category", label: "Categoria", primary: true },
          { key: "dateFormatted", label: "Data" },
          { key: "supplier", label: "Fornecedor" },
          { key: "amount", label: "Valor" },
          { key: "status", label: "Status", badge: true },
          { key: "activityExpense", label: "Atividade" },
          { key: "deductible", label: "Dedutível" },
          { key: "attachment", label: "Comprovante" }
        ]}
        rows={rows}
        onView={crud.setViewing}
        onEdit={crud.setEditing}
        onDelete={crud.setDeleting}
      />
      <DetailDrawer item={crud.viewing} title="Detalhes da despesa" onClose={() => crud.setViewing(null)} fields={[
        { key: "supplier", label: "Fornecedor" },
        { key: "supplierDocument", label: "CPF/CNPJ" },
        { key: "invoiceNumber", label: "NF" },
        { key: "dueDate", label: "Vencimento" },
        { key: "paidAt", label: "Pagamento" },
        { key: "method", label: "Forma" },
        { key: "type", label: "Tipo" },
        { key: "recurrence", label: "Recorrência" },
        { key: "notes", label: "Observações" }
      ]} />
      <ConfirmDialog item={crud.deleting} onCancel={() => crud.setDeleting(null)} onConfirm={(item) => { onDelete(item.id); crud.setDeleting(null); }} />
    </ResourcePage>
  );
}

export function ReportsPage({ appointments = [], expenses = [], patients = [] }) {
  const [filters, setFilters] = useState({ month: "", year: "", patient: "", status: "" });
  const patientOptions = [...new Set([...patients.map((item) => item.name), ...appointments.map((item) => item.patient)].filter(Boolean))];
  const filteredAppointments = appointments
    .filter((item) => !filters.patient || item.patient === filters.patient)
    .filter((item) => !filters.status || item.status === filters.status)
    .filter((item) => !filters.month || item.date?.slice(5, 7) === filters.month)
    .filter((item) => !filters.year || item.date?.slice(0, 4) === filters.year);

  const reportRows = filteredAppointments.map((item) => ({
    paciente: item.patient,
    cpfPaciente: item.patientCpf,
    pagador: item.payer,
    cpfPagador: item.payerCpf,
    vinculo: item.payerRelation,
    data: formatDateTime(item.date),
    recebidoEm: formatDate(item.receivedAt),
    valor: item.amount,
    status: item.status,
    forma: item.paymentMethod,
    documento: item.documentNeed || item.fiscalStatus
  }));

  return (
    <ResourcePage title="Relatórios" eyebrow="Filtros e exportações para gestão, contador e obrigações">
      <Filters
        filters={[
          { name: "month", label: "Mês", type: "select", options: ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"] },
          { name: "year", label: "Ano", placeholder: "2026" },
          { name: "patient", label: "Paciente", type: "select", options: patientOptions },
          { name: "status", label: "Status", type: "select", options: paymentStatuses }
        ]}
        values={filters}
        onChange={(name, value) => setFilters((current) => ({ ...current, [name]: value }))}
        onClear={() => setFilters({ month: "", year: "", patient: "", status: "" })}
      />
      <div className="report-grid">
        {reports.concat(["Relatório anual para IRPF", "Livro-caixa", "Inadimplência", "Atendimentos sem documentação fiscal"]).map((report) => (
          <article className="report-card" key={report}>
            <FileSpreadsheet size={26} />
            <strong>{report}</strong>
            <div>
              <Button variant="soft" onClick={() => exportCsv(`${report}.csv`, reportRows.length ? reportRows : [{ aviso: "Sem dados para exportar" }])}><Download size={16} /> CSV</Button>
              <Button variant="soft" onClick={() => exportPrint(report)}><Download size={16} /> PDF</Button>
            </div>
          </article>
        ))}
      </div>
    </ResourcePage>
  );
}

export function FiscalPage({ appointments = [], expenses = [], patients = [] }) {
  const revenue = appointments.reduce((sum, item) => sum + Number(item.amountNumber || 0), 0);
  const expenseTotal = expenses.reduce((sum, item) => sum + Number(item.amountNumber || 0), 0);
  const missingCpf = appointments.filter((item) => !item.payerCpf).length;
  const missingPatientCpf = appointments.filter((item) => !item.patientCpf).length;
  const noExpenseReceipt = expenses.filter((item) => !item.attachment).length;
  const incompletePatients = patients.filter((item) => !item.cpf || !item.phone).length;

  return (
    <ResourcePage title="Painel do contador/admin" eyebrow="Conferência dos dados alimentados pelos profissionais">
      <div className="accountant-summary">
        <article><span>Profissionais vinculados</span><strong>1</strong><small>Dra. Jennyff</small></article>
        <article><span>Receita mensal</span><strong>{money(revenue)}</strong><small>Paciente, pagador e vínculo</small></article>
        <article><span>Despesas da atividade</span><strong>{money(expenseTotal)}</strong><small>Com dedutibilidade e comprovantes</small></article>
        <article><span>Pendências documentais</span><strong>{missingCpf + missingPatientCpf + noExpenseReceipt + incompletePatients}</strong><small>Itens para cobrar do cliente</small></article>
      </div>
      <div className="fiscal-grid accountant-grid">
        {[
          ["Atendimentos sem CPF do pagador", `${missingCpf} registros precisam de CPF/CNPJ do pagador.`],
          ["Atendimentos sem CPF do paciente", `${missingPatientCpf} registros precisam de CPF do paciente.`],
          ["Despesas sem comprovante", `${noExpenseReceipt} despesas sem anexo ou referência de comprovante.`],
          ["Pacientes incompletos", `${incompletePatients} pacientes sem CPF ou telefone para conferência.`]
        ].map(([title, text]) => (
          <article className="panel" key={title}>
            <h2>{title}</h2>
            <p>{text}</p>
            <Button variant="dark" onClick={() => exportCsv(`${title}.csv`, appointments.concat(expenses))}>Exportar base</Button>
          </article>
        ))}
      </div>
    </ResourcePage>
  );
}

export function SettingsPage() {
  return (
    <ResourcePage title="Configurações" eyebrow="Perfil, segurança e preferências">
      <QuickForm
        title="Dados profissionais"
        fields={[
          { name: "name", label: "Nome completo" },
          { name: "document", label: "CPF/CNPJ", mask: "cpfCnpj" },
          { name: "profession", label: "Profissão" },
          { name: "council", label: "Conselho profissional" },
          { name: "email", label: "E-mail", type: "email" },
          { name: "phone", label: "Telefone", mask: "phone" }
        ]}
      />
    </ResourcePage>
  );
}

function ResourcePage({ title, eyebrow, children }) {
  return (
    <section className="page">
      <div className="page-title">
        <div>
          <span>{eyebrow}</span>
          <h1>{title}</h1>
        </div>
      </div>
      <div className="resource-stack">{children}</div>
    </section>
  );
}
