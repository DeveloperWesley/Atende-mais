import { useMemo, useState } from "react";
import { Download, FileSpreadsheet } from "lucide-react";
import { Button } from "../components/Button.jsx";
import { ConfirmDialog } from "../components/ConfirmDialog.jsx";
import { DataTable } from "../components/DataTable.jsx";
import { DetailDrawer } from "../components/DetailDrawer.jsx";
import { Filters } from "../components/Filters.jsx";
import { QuickForm } from "../components/QuickForm.jsx";
import { exportCsv, exportJson, exportPrint } from "../utils/exporters.js";
import { formatDate, formatDateTime, isOverdue, money } from "../utils/formatters.js";

const paymentStatuses = ["Pago", "Pendente", "Vencido", "Cancelado"];
const paymentMethods = ["Pix", "Dinheiro", "Cartão", "Transferência", "Boleto"];
const documentNeeds = ["Não precisa", "Recibo", "Nota fiscal"];

function normalize(value) {
  return String(value || "").toLowerCase();
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

const monthNames = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

function competenceFromDate(value) {
  if (!value) return "Sem data";
  const date = new Date(`${value.slice(0, 10)}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "Sem data";
  return `${monthNames[date.getMonth()]}-${date.getFullYear()}`;
}

function documentNeedOf(item) {
  if (item.documentNeed) return item.documentNeed;
  if (item.fiscalStatus === "NF emitida" || item.fiscalStatus === "NF solicitada") return "Nota fiscal";
  if (item.fiscalStatus === "Recibo emitido" || item.fiscalStatus === "Recibo solicitado") return "Recibo";
  return "Não precisa";
}

function appointmentExportRows(items) {
  return items.map((item) => ({
    Data: formatDate(item.date),
    Competencia: competenceFromDate(item.date),
    Pagador_Nome: item.payer,
    Pagador_CPF_CNPJ: item.payerCpf,
    Paciente_Nome: item.patient,
    Paciente_CPF_CNPJ: item.patientCpf,
    NF_ou_Recibo: documentNeedOf(item),
    Valor: item.amount,
    Observacoes: item.notes || ""
  }));
}

function groupedCompetences(appointments) {
  const groups = new Map();
  appointments.forEach((item) => {
    const competence = competenceFromDate(item.date);
    const current = groups.get(competence) || { id: competence, competence, count: 0, totalNumber: 0, fiscalCount: 0, items: [] };
    current.count += 1;
    current.totalNumber += Number(item.amountNumber || 0);
    if (["Recibo", "Nota fiscal"].includes(documentNeedOf(item))) current.fiscalCount += 1;
    current.items.push(item);
    groups.set(competence, current);
  });

  return [...groups.values()]
    .map((group) => ({ ...group, total: money(group.totalNumber), fiscal: `${group.fiscalCount} solicitação(ões)` }))
    .sort((a, b) => a.competence.localeCompare(b.competence, "pt-BR", { numeric: true }));
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
          { name: "cpf", label: "CPF/CNPJ", mask: "cpfCnpj" },
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
        filters={[{ name: "search", label: "Buscar", placeholder: "Nome, CPF/CNPJ ou telefone" }]}
        values={filters}
        onChange={(name, value) => setFilters((current) => ({ ...current, [name]: value }))}
        onClear={() => setFilters({ search: "" })}
      />
      <DataTable
        columns={[
          { key: "name", label: "Paciente", primary: true },
          { key: "cpf", label: "CPF/CNPJ" },
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
          { key: "cpf", label: "CPF/CNPJ" },
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
  const patientSuggestions = unique([...patients.map((item) => item.name), ...appointments.map((item) => item.patient)]);
  const payerSuggestions = unique([
    ...patients.map((item) => item.name),
    ...patients.map((item) => item.responsible),
    ...appointments.map((item) => item.payer)
  ]);
  const patientByName = new Map([
    ...patients.map((item) => [normalize(item.name), item]),
    ...appointments.map((item) => [normalize(item.patient), { name: item.patient, cpf: item.patientCpf }])
  ]);
  const payerByName = new Map([
    ...patients.map((item) => [normalize(item.name), { name: item.name, cpf: item.cpf }]),
    ...patients.filter((item) => item.responsible).map((item) => [normalize(item.responsible), { name: item.responsible, cpf: item.responsibleCpf }]),
    ...appointments.map((item) => [normalize(item.payer), { name: item.payer, cpf: item.payerCpf }])
  ]);
  const editingAppointment = crud.editing ? {
    ...crud.editing,
    patientName: crud.editing.patientName || crud.editing.patient,
    documentNeed: documentNeedOf(crud.editing),
    sameAsPayer: crud.editing.sameAsPayer ?? (crud.editing.patient === crud.editing.payer && crud.editing.patientCpf === crud.editing.payerCpf)
  } : null;
  const rows = appointments
    .filter((item) => !filters.search || normalize(`${item.patient} ${item.patientCpf} ${item.payer} ${item.payerCpf}`).includes(normalize(filters.search)))
    .filter((item) => !filters.documentNeed || documentNeedOf(item) === filters.documentNeed)
    .filter((item) => !filters.from || item.date?.slice(0, 10) >= filters.from)
    .filter((item) => !filters.to || item.date?.slice(0, 10) <= filters.to)
    .map((item) => ({
      ...item,
      dateFormatted: formatDate(item.date),
      receivedFormatted: formatDate(item.receivedAt),
      documentNeed: documentNeedOf(item)
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
          {
            name: "payer",
            label: "Nome do pagador",
            placeholder: "Digite para buscar ou cadastrar novo",
            required: true,
            suggestions: payerSuggestions,
            onValueChange: (value) => {
              const payer = payerByName.get(normalize(value));
              return payer?.cpf ? { payerCpf: payer.cpf } : {};
            }
          },
          { name: "payerCpf", label: "CPF/CNPJ do pagador (11 ou 14 dígitos)", placeholder: "Somente números", mask: "cpfCnpj", digits: [11, 14], required: true, help: "Use CPF para pessoa física ou CNPJ para empresa/responsável PJ." },
          { name: "sameAsPayer", label: "Paciente é o mesmo do pagador", type: "checkbox", defaultValue: false },
          { type: "section", label: "Paciente" },
          {
            name: "patientName",
            label: "Nome do paciente",
            placeholder: "Digite para buscar ou cadastrar novo",
            required: (values) => !values.sameAsPayer,
            hiddenWhen: (values) => values.sameAsPayer,
            suggestions: patientSuggestions,
            onValueChange: (value) => {
              const patient = patientByName.get(normalize(value));
              return patient?.cpf ? { patientCpf: patient.cpf } : {};
            }
          },
          { name: "patientCpf", label: "CPF/CNPJ do paciente (11 ou 14 dígitos)", placeholder: "Somente números", mask: "cpfCnpj", digits: [11, 14], required: (values) => !values.sameAsPayer, hiddenWhen: (values) => values.sameAsPayer },
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
          { key: "patientCpf", label: "CPF/CNPJ paciente" },
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
        { key: "patientCpf", label: "CPF/CNPJ do paciente" },
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
  const [selectedCompetence, setSelectedCompetence] = useState("");
  const groups = groupedCompetences(appointments);
  const selectedGroup = groups.find((group) => group.competence === selectedCompetence);
  const detailRows = (selectedGroup?.items || appointments).map((item) => ({
    ...item,
    dateFormatted: formatDate(item.date),
    documentNeed: documentNeedOf(item)
  }));
  const exportRows = appointmentExportRows(selectedGroup?.items || appointments);

  return (
    <ResourcePage title="Competências" eyebrow="Agrupe atendimentos por mês e exporte a base para conferência">
      <div className="finance-summary">
        <article><span>Competências</span><strong>{groups.length}</strong></article>
        <article><span>Atendimentos</span><strong>{appointments.length}</strong></article>
        <article><span>Total recebido</span><strong>{money(appointments.reduce((sum, item) => sum + Number(item.amountNumber || 0), 0))}</strong></article>
        <article><span>NF/Recibo</span><strong>{appointments.filter((item) => ["Recibo", "Nota fiscal"].includes(documentNeedOf(item))).length}</strong></article>
      </div>

      <DataTable
        columns={[
          { key: "competence", label: "Mês", primary: true },
          { key: "count", label: "Qtd" },
          { key: "total", label: "Total" },
          { key: "fiscal", label: "NF/Recibo" }
        ]}
        rows={groups}
        onView={(group) => setSelectedCompetence(group.competence)}
      />

      <div className="report-grid">
        <article className="report-card">
          <FileSpreadsheet size={26} />
          <strong>{selectedGroup ? `Base de ${selectedGroup.competence}` : "Base completa de atendimentos"}</strong>
          <div>
            <Button variant="soft" onClick={() => exportCsv(selectedGroup ? `atendimentos-${selectedGroup.competence}.csv` : "atendimentos-todos.csv", exportRows.length ? exportRows : [{ aviso: "Sem dados para exportar" }])}><Download size={16} /> CSV</Button>
            <Button variant="soft" onClick={() => exportPrint(selectedGroup ? `Atendimentos - ${selectedGroup.competence}` : "Atendimentos") }><Download size={16} /> PDF</Button>
          </div>
        </article>
      </div>

      <DataTable
        columns={[
          { key: "patient", label: "Paciente", primary: true },
          { key: "payer", label: "Pagador" },
          { key: "dateFormatted", label: "Data" },
          { key: "amount", label: "Valor" },
          { key: "documentNeed", label: "NF/Recibo", badge: true }
        ]}
        rows={detailRows}
      />
    </ResourcePage>
  );
}

export function FiscalPage({ appointments = [], expenses = [], patients = [] }) {
  const [filters, setFilters] = useState({ competence: "", documentNeed: "", search: "" });
  const groups = groupedCompetences(appointments);
  const filtered = appointments
    .filter((item) => !filters.competence || competenceFromDate(item.date) === filters.competence)
    .filter((item) => !filters.documentNeed || documentNeedOf(item) === filters.documentNeed)
    .filter((item) => !filters.search || normalize(`${item.patient} ${item.patientCpf} ${item.payer} ${item.payerCpf}`).includes(normalize(filters.search)));
  const rows = filtered.map((item) => ({
    ...item,
    dateFormatted: formatDate(item.date),
    competence: competenceFromDate(item.date),
    documentNeed: documentNeedOf(item)
  }));
  const revenue = filtered.reduce((sum, item) => sum + Number(item.amountNumber || 0), 0);
  const missingCpf = appointments.filter((item) => !item.payerCpf).length;
  const missingPatientCpf = appointments.filter((item) => !item.patientCpf).length;
  const fiscalRequests = filtered.filter((item) => ["Recibo", "Nota fiscal"].includes(documentNeedOf(item))).length;
  const exportRows = appointmentExportRows(filtered);

  return (
    <ResourcePage title="Admin fiscal" eyebrow="Extraia dados para emissão de nota, Carnê-Leão, IRPF, IRRF e Receita Saúde">
      <div className="accountant-summary">
        <article><span>Registros filtrados</span><strong>{filtered.length}</strong><small>Atendimentos prontos para conferência</small></article>
        <article><span>Total recebido</span><strong>{money(revenue)}</strong><small>Base para Carnê-Leão/IRPF</small></article>
        <article><span>NF/Recibo</span><strong>{fiscalRequests}</strong><small>Solicitações documentais</small></article>
        <article><span>Pendências</span><strong>{missingCpf + missingPatientCpf}</strong><small>CPF/CNPJ ausente</small></article>
      </div>

      <Filters
        filters={[
          { name: "competence", label: "Competência", type: "select", options: groups.map((group) => group.competence) },
          { name: "documentNeed", label: "NF/Recibo", type: "select", options: documentNeeds },
          { name: "search", label: "Buscar", placeholder: "Paciente, pagador ou CPF/CNPJ" }
        ]}
        values={filters}
        onChange={(name, value) => setFilters((current) => ({ ...current, [name]: value }))}
        onClear={() => setFilters({ competence: "", documentNeed: "", search: "" })}
      />

      <div className="report-grid">
        {[
          ["Base para emissão de notas", rows.filter((item) => item.documentNeed === "Nota fiscal")],
          ["Base Carnê-Leão / IRPF", rows],
          ["Base Receita Saúde", rows],
          ["Atendimentos com pendência de documento", rows.filter((item) => !item.payerCpf || !item.patientCpf)]
        ].map(([title, list]) => (
          <article className="report-card" key={title}>
            <FileSpreadsheet size={26} />
            <strong>{title}</strong>
            <div>
              <Button variant="soft" onClick={() => exportCsv(`${title}.csv`, appointmentExportRows(list).length ? appointmentExportRows(list) : [{ aviso: "Sem dados para exportar" }])}><Download size={16} /> CSV</Button>
            </div>
          </article>
        ))}
        <article className="report-card">
          <FileSpreadsheet size={26} />
          <strong>Backup JSON completo</strong>
          <div>
            <Button variant="soft" onClick={() => exportJson(`backup-atendimentos-${new Date().toISOString().slice(0, 10)}.json`, { exportedAt: new Date().toISOString(), appointments, patients })}><Download size={16} /> JSON</Button>
          </div>
        </article>
      </div>

      <DataTable
        columns={[
          { key: "competence", label: "Competência" },
          { key: "dateFormatted", label: "Data" },
          { key: "payer", label: "Pagador", primary: true },
          { key: "payerCpf", label: "CPF/CNPJ pagador" },
          { key: "patient", label: "Paciente" },
          { key: "patientCpf", label: "CPF/CNPJ paciente" },
          { key: "documentNeed", label: "NF/Recibo", badge: true },
          { key: "amount", label: "Valor" }
        ]}
        rows={rows}
      />
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
