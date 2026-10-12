-- Administration: services and invoice status workflow.
alter table public.admin_invoices drop constraint if exists admin_invoices_status_check;
alter table public.admin_invoices add constraint admin_invoices_status_check check (status in ('pending', 'paid', 'overdue'));
update public.admin_invoices set status = 'pending' where status in ('draft', 'sent');

drop policy if exists "admin_manage_services" on public.services;
create policy "admin_manage_services" on public.services for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
