-- Orders created from the public checkout.
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  customer_name text not null,
  customer_email text not null,
  customer_phone text,
  customer_address text,
  total_tnd numeric(10,3) not null check (total_tnd >= 0),
  status text not null default 'pending' check (status in ('pending', 'paid', 'overdue', 'cancelled')),
  payment_method text not null default 'card',
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  service_id uuid references public.services(id) on delete set null,
  service_name text not null,
  price_tnd numeric(10,3) not null check (price_tnd >= 0),
  quantity integer not null default 1 check (quantity > 0),
  created_at timestamptz not null default now()
);

alter table public.orders enable row level security;
alter table public.order_items enable row level security;

drop policy if exists "public_insert_orders" on public.orders;
create policy "public_insert_orders" on public.orders
  for insert to anon, authenticated with check (true);

drop policy if exists "public_insert_order_items" on public.order_items;
create policy "public_insert_order_items" on public.order_items
  for insert to anon, authenticated with check (true);
