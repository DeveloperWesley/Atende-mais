export const metrics = [
  { label: "Atendimentos no mês", value: "128", tone: "blue" },
  { label: "Receitas do mês", value: "R$ 28.540,00", tone: "green" },
  { label: "Despesas do mês", value: "R$ 7.320,00", tone: "red" },
  { label: "Pendências", value: "R$ 4.180,00", tone: "yellow" }
];

export const chartData = [
  { month: "Jan", receitas: 25000, despesas: 14200 },
  { month: "Fev", receitas: 32000, despesas: 19800 },
  { month: "Mar", receitas: 30000, despesas: 9200 },
  { month: "Abr", receitas: 40000, despesas: 17200 },
  { month: "Mai", receitas: 28500, despesas: 16000 },
  { month: "Jun", receitas: 34800, despesas: 11800 }
];

export const patients = [
  { id: 1, name: "Carlos Ferreira", cpf: "123.456.789-10", phone: "(11) 98888-1001", email: "carlos@email.com", pending: "R$ 350,00" },
  { id: 2, name: "Mariana Lopes", cpf: "222.456.789-10", phone: "(21) 97777-2002", email: "mariana@email.com", pending: "R$ 200,00" },
  { id: 3, name: "Ana Paula Nunes", cpf: "333.456.789-10", phone: "(31) 96666-3003", email: "ana@email.com", pending: "R$ 150,00" }
];

export const appointments = [
  {
    id: 1,
    patient: "Carlos Ferreira",
    date: "2026-05-08 09:00",
    type: "Consulta",
    amount: "R$ 350,00",
    status: "Pendente",
    payer: "Carlos Ferreira",
    payerCpf: "123.456.789-10",
    payerRelation: "Próprio paciente",
    accounting: "Aguardando recebimento"
  },
  {
    id: 2,
    patient: "Mariana Lopes",
    date: "2026-05-08 11:30",
    type: "Retorno",
    amount: "R$ 200,00",
    status: "Pago",
    payer: "Patrícia Lopes",
    payerCpf: "555.456.789-10",
    payerRelation: "Mãe",
    accounting: "Pronto para conferência"
  },
  {
    id: 3,
    patient: "Ana Paula Nunes",
    date: "2026-05-09 14:00",
    type: "Procedimento",
    amount: "R$ 620,00",
    status: "Parcelado",
    payer: "Empresa Vida Plena",
    payerCpf: "12.345.678/0001-90",
    payerRelation: "Empresa",
    accounting: "Revisar parcelas"
  }
];

export const expenses = [
  { id: 1, date: "2026-05-02", category: "Aluguel", amount: "R$ 2.500,00", deductible: "Sim" },
  { id: 2, date: "2026-05-04", category: "Materiais", amount: "R$ 860,00", deductible: "Sim" },
  { id: 3, date: "2026-05-05", category: "Sistema", amount: "R$ 189,00", deductible: "Sim" }
];

export const reports = [
  "Atendimentos por período",
  "Receitas recebidas",
  "Receitas pendentes",
  "Despesas por categoria",
  "Resultado financeiro mensal",
  "Resumo mensal para o contador",
  "Recebimentos por CPF do pagador",
  "Vínculo entre paciente e pagador",
  "Despesas da atividade para conferência",
  "Base para emissão de notas fiscais"
];
