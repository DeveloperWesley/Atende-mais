import { Download, FileSpreadsheet } from "lucide-react";
import { Button } from "../components/Button.jsx";
import { DataTable } from "../components/DataTable.jsx";
import { QuickForm } from "../components/QuickForm.jsx";
import { appointments, expenses, patients, reports } from "../data/mockData.js";

function money(value) {
  return Number(value || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function PatientsPage({ patients: patientRows = patients, onCreate }) {
  return (
    <ResourcePage title="Pacientes" eyebrow="Cadastro simples para atendimentos e recebimentos">
      <QuickForm
        title="Novo paciente"
        fields={[
          { name: "name", label: "Nome completo", required: true },
          { name: "cpf", label: "CPF" },
          { name: "birth", label: "Data de nascimento", type: "date" },
          { name: "phone", label: "Telefone" },
          { name: "email", label: "E-mail", type: "email" },
          { name: "responsible", label: "Responsável pelo pagamento, se houver" }
        ]}
        onSubmit={onCreate}
      />
      <DataTable
        columns={[
          { key: "name", label: "Nome" },
          { key: "cpf", label: "CPF" },
          { key: "phone", label: "Telefone" },
          { key: "email", label: "E-mail" },
          { key: "pending", label: "Pendente" }
        ]}
        rows={patientRows}
      />
    </ResourcePage>
  );
}

export function AppointmentsPage({ patients: patientRows = patients, appointments: appointmentRows = appointments, onCreate }) {
  return (
    <ResourcePage title="Atendimentos" eyebrow="Registre a rotina do atendimento; o sistema organiza os dados para o contador">
      <QuickForm
        title="Novo atendimento"
        fields={[
          { name: "patient", label: "Paciente", type: "select", options: patientRows.map((item) => item.name), required: true },
          { name: "date", label: "Data do atendimento", type: "datetime-local", required: true },
          { name: "type", label: "Tipo", placeholder: "Consulta, retorno, procedimento" },
          { name: "specialty", label: "Especialidade" },
          { name: "amount", label: "Valor", type: "number" },
          { name: "payment", label: "Pagamento", type: "select", options: ["Pago", "Pendente", "Parcelado"] },
          { name: "receivedAt", label: "Data do recebimento", type: "date" },
          { name: "payer", label: "Quem pagou?", placeholder: "Paciente, pai, mãe ou responsável" },
          { name: "payerCpf", label: "CPF de quem pagou" },
          { name: "payerRelation", label: "Vínculo com o paciente", type: "select", options: ["Próprio paciente", "Pai", "Mãe", "Responsável", "Empresa", "Outro"] }
        ]}
        onSubmit={onCreate}
      />
      <DataTable
        columns={[
          { key: "patient", label: "Paciente" },
          { key: "date", label: "Data" },
          { key: "type", label: "Tipo" },
          { key: "amount", label: "Valor" },
          { key: "status", label: "Status" },
          { key: "payer", label: "Pagador" },
          { key: "payerRelation", label: "Vínculo" },
          { key: "accounting", label: "Status dos dados" }
        ]}
        rows={appointmentRows}
      />
    </ResourcePage>
  );
}

export function FinancePage({ appointments: appointmentRows = appointments, expenses: expenseRows = expenses }) {
  const received = appointmentRows.filter((item) => item.status === "Pago").reduce((sum, item) => sum + Number(item.amountNumber || 0), 0);
  const pending = appointmentRows.filter((item) => item.status !== "Pago").reduce((sum, item) => sum + Number(item.amountNumber || 0), 0);
  const expenseTotal = expenseRows.reduce((sum, item) => sum + Number(item.amountNumber || 0), 0);

  return (
    <ResourcePage title="Financeiro" eyebrow="Receitas, despesas e resultado">
      <div className="finance-summary">
        <article><span>Receitas recebidas</span><strong>{money(received)}</strong></article>
        <article><span>Receitas pendentes</span><strong>{money(pending)}</strong></article>
        <article><span>Despesas</span><strong>{money(expenseTotal)}</strong></article>
        <article><span>Resultado mensal</span><strong>{money(received - expenseTotal)}</strong></article>
      </div>
      <DataTable
        columns={[
          { key: "patient", label: "Origem" },
          { key: "date", label: "Data" },
          { key: "amount", label: "Valor" },
          { key: "status", label: "Status" }
        ]}
        rows={appointmentRows}
      />
    </ResourcePage>
  );
}

export function ExpensesPage({ expenses: expenseRows = expenses, onCreate }) {
  return (
    <ResourcePage title="Despesas" eyebrow="Controle os gastos da rotina profissional">
      <QuickForm
        title="Nova despesa"
        fields={[
          { name: "date", label: "Data", type: "date", required: true },
          { name: "category", label: "Categoria", type: "select", options: ["Aluguel", "Energia", "Internet", "Materiais", "Equipamentos", "Contabilidade", "Sistemas", "Outras"] },
          { name: "amount", label: "Valor", type: "number" },
          { name: "method", label: "Forma de pagamento" },
          { name: "attachment", label: "Comprovante/anexo" },
          { name: "deductible", label: "Despesa da atividade?", type: "select", options: ["Sim", "Não"] }
        ]}
        onSubmit={onCreate}
      />
      <DataTable
        columns={[
          { key: "date", label: "Data" },
          { key: "category", label: "Categoria" },
          { key: "amount", label: "Valor" },
          { key: "deductible", label: "Da atividade" }
        ]}
        rows={expenseRows}
      />
    </ResourcePage>
  );
}

export function ReportsPage() {
  return (
    <ResourcePage title="Relatórios" eyebrow="Exportações financeiras para gestão e contabilidade">
      <div className="report-grid">
        {reports.map((report) => (
          <article className="report-card" key={report}>
            <FileSpreadsheet size={26} />
            <strong>{report}</strong>
            <div>
              <Button variant="soft"><Download size={16} /> CSV</Button>
              <Button variant="soft"><Download size={16} /> PDF</Button>
            </div>
          </article>
        ))}
      </div>
    </ResourcePage>
  );
}

export function FiscalPage({ appointments: appointmentRows = appointments, expenses: expenseRows = expenses }) {
  const revenue = appointmentRows.reduce((sum, item) => sum + Number(item.amountNumber || 0), 0);
  const expenseTotal = expenseRows.reduce((sum, item) => sum + Number(item.amountNumber || 0), 0);
  const missingData = appointmentRows.filter((item) => !item.payerCpf || !item.receivedAt && item.status === "Pago").length;

  return (
    <ResourcePage title="Contabilidade" eyebrow="Dados organizados para o contador cumprir as obrigações sem complicar a rotina do profissional">
      <div className="accountant-summary">
        <article>
          <span>Mês em organização</span>
          <strong>Maio/2026</strong>
          <small>Lançamentos feitos na rotina do consultório</small>
        </article>
        <article>
          <span>Receitas organizadas</span>
          <strong>{money(revenue)}</strong>
          <small>Paciente, pagador, vínculo e recebimento</small>
        </article>
        <article>
          <span>Despesas registradas</span>
          <strong>{money(expenseTotal)}</strong>
          <small>Categoria, comprovante e uso na atividade</small>
        </article>
        <article>
          <span>Pendências para corrigir</span>
          <strong>{missingData} itens</strong>
          <small>Itens simples que faltam para fechar o mês</small>
        </article>
      </div>

      <div className="fiscal-grid accountant-grid">
        {[
          ["Conferência do contador", "Validar os dados lançados pelo profissional sem exigir que ele entenda regras fiscais."],
          ["Base para obrigações", "Exportar informações para IRPF, Carnê-Leão, Receita Saúde, notas fiscais ou rotina definida pela contabilidade."],
          ["Pendências simples", "Mostrar atendimentos sem CPF do pagador, recebimentos sem data, despesas sem comprovante e vínculos não informados."],
          ["Pacote contábil", "Gerar CSV/PDF com receitas, despesas, pacientes, pagadores, vínculos e anexos para fechamento do mês."]
        ].map(([title, text]) => (
          <article className="panel" key={title}>
            <h2>{title}</h2>
            <p>{text}</p>
            <Button variant={title === "Pendências para o cliente" ? "soft" : "dark"}>
              {title === "Pendências para o cliente" ? "Ver pendências" : "Gerar base"}
            </Button>
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
          { name: "document", label: "CPF/CNPJ" },
          { name: "profession", label: "Profissão" },
          { name: "council", label: "Conselho profissional" },
          { name: "email", label: "E-mail", type: "email" },
          { name: "phone", label: "Telefone" }
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
