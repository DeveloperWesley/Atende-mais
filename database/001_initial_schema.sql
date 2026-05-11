create extension if not exists "uuid-ossp";

create type user_role as enum ('professional', 'accountant', 'admin');
create type profile_type as enum ('individual', 'company');
create type payment_status as enum ('paid', 'pending', 'overdue', 'cancelled', 'partial');
create type fiscal_status as enum ('pending', 'receipt_issued', 'invoice_issued');
create type expense_status as enum ('paid', 'pending', 'overdue');

create table users (
  id uuid primary key default uuid_generate_v4(),
  full_name varchar(160) not null,
  document varchar(20) not null unique,
  email varchar(160) not null unique,
  phone varchar(30),
  password_hash text not null,
  role user_role not null default 'professional',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table professionals (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null unique references users(id) on delete cascade,
  profile_type profile_type not null default 'individual',
  profession varchar(100),
  specialty varchar(100),
  council varchar(60),
  business_name varchar(160),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table accountant_access (
  id uuid primary key default uuid_generate_v4(),
  accountant_user_id uuid not null references users(id) on delete cascade,
  professional_user_id uuid not null references users(id) on delete cascade,
  can_export boolean not null default true,
  can_view_attachments boolean not null default true,
  created_at timestamptz not null default now(),
  unique (accountant_user_id, professional_user_id)
);

create table patients (
  id uuid primary key default uuid_generate_v4(),
  professional_user_id uuid not null references users(id) on delete cascade,
  full_name varchar(160) not null,
  cpf varchar(20),
  birth_date date,
  phone varchar(30),
  email varchar(160),
  address text,
  notes text,
  financial_responsible_name varchar(160),
  financial_responsible_document varchar(20),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table appointments (
  id uuid primary key default uuid_generate_v4(),
  professional_user_id uuid not null references users(id) on delete cascade,
  patient_id uuid not null references patients(id) on delete restrict,
  service_date timestamptz not null,
  service_type varchar(80) not null,
  specialty varchar(100),
  amount numeric(12,2) not null,
  payment_status payment_status not null default 'pending',
  payment_method varchar(60),
  card_fee numeric(12,2) not null default 0,
  net_amount numeric(12,2),
  received_at date,
  payer_name varchar(160),
  payer_document varchar(20),
  payer_relationship varchar(60),
  coverage varchar(40),
  service_location varchar(40),
  receipt_number varchar(80),
  fiscal_status fiscal_status not null default 'pending',
  receiving_account varchar(120),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table revenues (
  id uuid primary key default uuid_generate_v4(),
  professional_user_id uuid not null references users(id) on delete cascade,
  appointment_id uuid references appointments(id) on delete set null,
  patient_id uuid references patients(id) on delete set null,
  gross_amount numeric(12,2) not null,
  card_fee numeric(12,2) not null default 0,
  net_amount numeric(12,2) not null,
  paid_amount numeric(12,2) not null default 0,
  due_date date,
  received_at date,
  payment_method varchar(60),
  receiving_account varchar(120),
  status payment_status not null default 'pending',
  payer_name varchar(160),
  payer_document varchar(20),
  payer_relationship varchar(60),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table expenses (
  id uuid primary key default uuid_generate_v4(),
  professional_user_id uuid not null references users(id) on delete cascade,
  expense_date date not null,
  competence varchar(7),
  category varchar(80) not null,
  supplier_name varchar(160),
  supplier_document varchar(20),
  invoice_number varchar(80),
  amount numeric(12,2) not null,
  payment_method varchar(60),
  due_date date,
  paid_at date,
  status expense_status not null default 'pending',
  expense_type varchar(40),
  is_activity_expense boolean not null default true,
  is_deductible boolean not null default false,
  is_recurring boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table attachments (
  id uuid primary key default uuid_generate_v4(),
  professional_user_id uuid not null references users(id) on delete cascade,
  entity_type varchar(40) not null,
  entity_id uuid not null,
  file_name varchar(180) not null,
  file_url text not null,
  mime_type varchar(120),
  created_at timestamptz not null default now()
);

create table reports (
  id uuid primary key default uuid_generate_v4(),
  professional_user_id uuid not null references users(id) on delete cascade,
  requested_by_user_id uuid references users(id) on delete set null,
  report_type varchar(100) not null,
  period_start date,
  period_end date,
  filters jsonb not null default '{}'::jsonb,
  payload jsonb not null default '{}'::jsonb,
  export_url text,
  created_at timestamptz not null default now()
);

create table notes (
  id uuid primary key default uuid_generate_v4(),
  professional_user_id uuid not null references users(id) on delete cascade,
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

create index idx_patients_professional on patients(professional_user_id);
create index idx_appointments_professional_date on appointments(professional_user_id, service_date);
create index idx_appointments_payment_status on appointments(professional_user_id, payment_status);
create index idx_appointments_payer_document on appointments(professional_user_id, payer_document);
create index idx_revenues_professional_status on revenues(professional_user_id, status);
create index idx_revenues_received_at on revenues(professional_user_id, received_at);
create index idx_expenses_professional_date on expenses(professional_user_id, expense_date);
create index idx_expenses_status on expenses(professional_user_id, status);
create index idx_attachments_entity on attachments(entity_type, entity_id);
