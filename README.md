# ATENDE+

Sistema SaaS para profissionais da saúde controlarem atendimentos, pacientes, receitas, pendências e despesas de forma simples. Os dados da rotina são estruturados para que o contador consiga depois conferir recebimentos, pagadores, vínculos, despesas e bases para obrigações como IRPF, Carnê-Leão, Receita Saúde e notas fiscais.

## Estrutura

- `frontend`: React + Vite com UI responsiva e dados mockados.
- `backend`: Node.js + Express + JWT + bcrypt + PostgreSQL.
- `database`: SQL inicial com tabelas, chaves e índices.

## Como rodar

```bash
npm install
npm run dev
```

Frontend: `http://localhost:5173`

Backend: `http://localhost:3333`

Copie `backend/.env.example` para `backend/.env` e ajuste `DATABASE_URL` antes de usar PostgreSQL.
