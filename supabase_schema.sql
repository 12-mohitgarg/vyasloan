-- =============================================
-- VYAS FINSERV - Supabase Database Schema
-- Run this in your Supabase SQL Editor
-- =============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Loan Applications table
create table if not exists public.loan_applications (
  id              uuid default uuid_generate_v4() primary key,

  -- Personal Info
  full_name             text not null,
  mobile                text not null,
  personal_email        text not null,
  mother_name           text,
  residential_address   text,

  -- Employment
  employment_type       text,
  company_name          text,
  company_address       text,
  official_email        text,
  monthly_salary        numeric,
  years_employed        text,

  -- Loan Details
  loan_amount           text,
  loan_purpose          text,

  -- References
  ref1_name             text,
  ref1_mobile           text,
  ref1_email            text,
  ref2_name             text,
  ref2_mobile           text,
  ref2_email            text,

  -- Document URLs (Supabase Storage)
  bank_statement_url    text,
  pay_slips_url         text,
  form16_url            text,
  photo_url             text,

  -- CRM
  status                text default 'pending' check (status in ('pending','reviewing','approved','rejected')),
  notes                 text,
  assigned_to           text,

  -- EMI Calculator data (from sidebar calculator on apply page)
  calc_loan_amount      numeric,
  calc_tenure_months    integer,
  calc_interest_rate    numeric,
  calc_monthly_emi      numeric,
  calc_total_payable    numeric,
  calc_total_interest   numeric,

  -- Timestamps
  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);

-- Row Level Security
alter table public.loan_applications enable row level security;

-- Allow service role (backend) full access
create policy "Service role full access"
  on public.loan_applications
  for all
  using (true)
  with check (true);

-- Allow insert from anon (for form submission)
create policy "Allow anon insert"
  on public.loan_applications
  for insert
  to anon
  with check (true);

-- Create Storage bucket for documents
insert into storage.buckets (id, name, public)
values ('loan-documents', 'loan-documents', true)
on conflict (id) do nothing;

-- Storage policy: allow uploads
create policy "Allow document uploads"
  on storage.objects
  for insert
  to anon, authenticated
  with check (bucket_id = 'loan-documents');

-- Storage policy: allow reads
create policy "Allow document reads"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'loan-documents');

-- Index for faster queries
create index if not exists idx_applications_status on public.loan_applications(status);
create index if not exists idx_applications_created on public.loan_applications(created_at desc);
create index if not exists idx_applications_mobile on public.loan_applications(mobile);

-- =============================================
-- Done! Your Vyas Finserv database is ready.
-- =============================================
