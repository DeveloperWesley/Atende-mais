create extension if not exists "uuid-ossp";

create type user_profile_type as enum ('individual', 'company');
create type user_role as enum ('user', 'admin');
create type payment_status as enum ('paid', 'pending', 'installments');

create table users (
  id uuid primary key default uuid_generate_v4(),
  full_name varchar(160) not null,
  document varchar(20) not null unique,
  email varchar(160) not null unique,
  phone varchar(30),
  profession varchar(100),
  council varchar(60),
  password_hash text not null,
  profile_type user_profile_type not null,
  role user_role not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table patients (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  full_name varchar(160) not null,
  cpf varchar(14),
  birth_date date,
  phone varchar(30),
  email varchar(160),
  address text,
  notes text,
  financial_responsible varchar(160),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table appointments (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  patient_id uuid not null references patients(id) on delete restrict,
  service_date timestamptz not null,
  service_type varchar(100) not null,
  specialty varchar(100),
  description text,
  amount numeric(12,2) not null,
  payment_method varchar(60),
  payment_status payment_status not null default 'pending',
  received_at date,
  payer_cpf varchar(20),
  payer_name varchar(160),
  payer_is_patient boolean not null default true,
  payer_relationship varchar(60),
  include_carne_leao boolean not null default true,
  include_receita_saude boolean not null default true,
  include_irpf boolean not null default true,
  requires_invoice boolean not null default false,
  fiscal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table payments (
  id uuid primary key default uuid_generate_v4(),
  appointment_id uuid not null references appointments(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  amount numeric(12,2) not null,
  paid_at date,
  method varchar(60),
  status payment_status not null default 'pending',
  installment_number integer,
  created_at timestamptz not null default now()
);

create table expenses (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  expense_date date not null,
  category varchar(80) not null,
  amount numeric(12,2) not null,
  payment_method varchar(60),
  attachment_url text,
  notes text,
  is_deductible boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table fiscal_reports (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  report_type varchar(80) not null,
  period_start date not null,
  period_end date not null,
  payload jsonb not null default '{}'::jsonb,
  export_url text,
  created_at timestamptz not null default now()
);

create table notes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  patient_id uuid references patients(id) on delete set null,
  appointment_id uuid references appointments(id) on delete set null,
  title varchar(160),
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table audit_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete set null,
  action varchar(120) not null,
  entity varchar(80) not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  ip_address inet,
  created_at timestamptz not null default now()
);

create index idx_patients_user on patients(user_id);
create index idx_appointments_user_date on appointments(user_id, service_date);
create index idx_appointments_fiscal on appointments(user_id, include_carne_leao, include_receita_saude, include_irpf);
create index idx_expenses_user_date on expenses(user_id, expense_date);
create index idx_expenses_deductible on expenses(user_id, is_deductible);
create index idx_payments_user_status on payments(user_id, status);
