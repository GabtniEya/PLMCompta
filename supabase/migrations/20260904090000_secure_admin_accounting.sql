-- Production administration: isolated data, roles, and row-level security.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'client' check (role in ('admin', 'client')),
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function public.handle_new_profile()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id) values (new.id) on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile after insert on auth.users for each row execute procedure public.handle_new_profile();

create table if not exists public.admin_clients (
  id uuid primary key default gen_random_uuid(), admin_id uuid not null references public.profiles(id) on delete cascade,
  name text not null, email text, phone text, company text, created_at timestamptz not null default now()
);
create table if not exists public.admin_invoices (
  id uuid primary key default gen_random_uuid(), admin_id uuid not null references public.profiles(id) on delete cascade,
  invoice_number text not null, client_id uuid references public.admin_clients(id) on delete set null,
  client_name text not null, description text not null, total numeric(12,3) not null check (total >= 0),
  status text not null default 'draft' check (status in ('draft','sent','paid')), created_at timestamptz not null default now(),
  unique (admin_id, invoice_number)
);
create table if not exists public.admin_payments (
  id uuid primary key default gen_random_uuid(), admin_id uuid not null references public.profiles(id) on delete cascade,
  invoice_id uuid not null references public.admin_invoices(id) on delete cascade,
  invoice_number text not null, amount numeric(12,3) not null check (amount > 0), method text not null,
  created_at timestamptz not null default now()
);
create table if not exists public.company_settings (
  admin_id uuid primary key references public.profiles(id) on delete cascade,
  company_name text not null default 'PLM Ressource', tax_id text, address text, email text, phone text,
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.admin_clients enable row level security;
alter table public.admin_invoices enable row level security;
alter table public.admin_payments enable row level security;
alter table public.company_settings enable row level security;

drop policy if exists "profile self read" on public.profiles;
create policy "profile self read" on public.profiles for select to authenticated using (id = auth.uid());
drop policy if exists "admin clients" on public.admin_clients;
create policy "admin clients" on public.admin_clients for all to authenticated using (admin_id = auth.uid() and public.is_admin()) with check (admin_id = auth.uid() and public.is_admin());
drop policy if exists "admin invoices" on public.admin_invoices;
create policy "admin invoices" on public.admin_invoices for all to authenticated using (admin_id = auth.uid() and public.is_admin()) with check (admin_id = auth.uid() and public.is_admin());
drop policy if exists "admin payments" on public.admin_payments;
create policy "admin payments" on public.admin_payments for all to authenticated using (admin_id = auth.uid() and public.is_admin()) with check (admin_id = auth.uid() and public.is_admin());
drop policy if exists "admin company settings" on public.company_settings;
create policy "admin company settings" on public.company_settings for all to authenticated using (admin_id = auth.uid() and public.is_admin()) with check (admin_id = auth.uid() and public.is_admin());

-- After creating the first user, promote that user's e-mail once in the SQL editor:
-- update public.profiles set role = 'admin' where id = (select id from auth.users where email = 'votre-email@domaine.tn');
