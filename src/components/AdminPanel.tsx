import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft, BarChart3, BriefcaseBusiness, CheckCircle2, CreditCard,
  FileText, LayoutDashboard, LogOut, Pencil, RefreshCw, Settings, Trash2, Users
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Order, Service } from '@/types';

type Section = 'dashboard' | 'clients' | 'orders' | 'payments' | 'services' | 'settings';
type ClientRecord = { id: string; name: string; email: string; phone: string; company: string; createdAt: string };
type InvoiceStatus = 'pending' | 'paid' | 'overdue';
type InvoiceRecord = { id: string; number: string; clientId: string; clientName: string; description: string; total: number; status: InvoiceStatus; createdAt: string };
type PaymentRecord = { id: string; invoiceId: string; invoiceNumber: string; amount: number; method: string; createdAt: string };

const demoClients: ClientRecord[] = [
  { id: 'demo-client-1', name: 'Noura Ben Salem', email: 'noura.bensalem@atlas-conseil.tn', phone: '+216 22 451 879', company: 'Atlas Conseil', createdAt: '2026-08-12T09:00:00.000Z' },
  { id: 'demo-client-2', name: 'Sami Gharbi', email: 'sami.gharbi@novatek.tn', phone: '+216 55 208 431', company: 'NovaTek Solutions', createdAt: '2026-08-18T09:00:00.000Z' },
  { id: 'demo-client-3', name: 'Leïla Trabelsi', email: 'leila.trabelsi@medina-design.tn', phone: '+216 98 641 052', company: 'Medina Design', createdAt: '2026-08-25T09:00:00.000Z' },
];
const demoInvoices: InvoiceRecord[] = [
  { id: 'demo-invoice-1', number: 'FAC-0001', clientId: 'demo-client-1', clientName: 'Noura Ben Salem', description: 'Accompagnement stratégique trimestriel', total: 2850, status: 'paid', createdAt: '2026-08-14T09:00:00.000Z' },
  { id: 'demo-invoice-2', number: 'FAC-0002', clientId: 'demo-client-2', clientName: 'Sami Gharbi', description: 'Développement du portail client', total: 6400, status: 'pending', createdAt: '2026-08-22T09:00:00.000Z' },
  { id: 'demo-invoice-3', number: 'FAC-0003', clientId: 'demo-client-3', clientName: 'Leïla Trabelsi', description: 'Identité visuelle et supports digitaux', total: 1950, status: 'overdue', createdAt: '2026-09-01T09:00:00.000Z' },
];
const demoPayments: PaymentRecord[] = [
  { id: 'demo-payment-1', invoiceId: 'demo-invoice-1', invoiceNumber: 'FAC-0001', amount: 2850, method: 'virement', createdAt: '2026-08-20T10:15:00.000Z' },
];

const money = (value: number) => new Intl.NumberFormat('fr-TN', {
  style: 'currency', currency: 'TND', minimumFractionDigits: 0,
}).format(value);

const navigation: { id: Section; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { id: 'clients', label: 'Clients', icon: Users },
  { id: 'orders', label: 'Factures & commandes', icon: FileText },
  { id: 'payments', label: 'Paiements', icon: CreditCard },
  { id: 'services', label: 'Services', icon: BriefcaseBusiness },
  { id: 'settings', label: 'Paramètres', icon: Settings },
];

export default function AdminPanel({ onLogout }: { onLogout: () => void }) {
  const [section, setSection] = useState<Section>('dashboard');
  const [services, setServices] = useState<Service[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [clientRecords, setClientRecords] = useState<ClientRecord[]>(() => JSON.parse(localStorage.getItem('plm-admin-clients') || JSON.stringify(demoClients)));
  const [invoices, setInvoices] = useState<InvoiceRecord[]>(() => JSON.parse(localStorage.getItem('plm-admin-invoices') || JSON.stringify(demoInvoices)));
  const [payments, setPayments] = useState<PaymentRecord[]>(() => JSON.parse(localStorage.getItem('plm-admin-payments') || JSON.stringify(demoPayments)));
  const [cloudAdmin, setCloudAdmin] = useState(false);
  const [modal, setModal] = useState<'client' | 'invoice' | 'payment' | 'service' | null>(null);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const loadData = async () => {
    setLoading(true);
    const [servicesResult, ordersResult, clientsResult, invoicesResult, paymentsResult] = await Promise.all([
      supabase.from('services').select('*').order('display_order'),
      supabase.from('orders').select('*').order('created_at', { ascending: false }),
      supabase.from('admin_clients').select('*').order('created_at', { ascending: false }),
      supabase.from('admin_invoices').select('*').order('created_at', { ascending: false }),
      supabase.from('admin_payments').select('*').order('created_at', { ascending: false }),
    ]);
    if (!servicesResult.error) setServices((servicesResult.data || []).map((service) => ({ ...service, features: Array.isArray(service.features) ? service.features : [] })));
    if (!ordersResult.error) setOrders(ordersResult.data || []);
    if (!clientsResult.error) { setCloudAdmin(true); setClientRecords((clientsResult.data || []).map((client) => ({ id: client.id, name: client.name, email: client.email || '', phone: client.phone || '', company: client.company || '', createdAt: client.created_at }))); }
    if (!invoicesResult.error) setInvoices((invoicesResult.data || []).map((invoice) => ({ id: invoice.id, number: invoice.invoice_number, clientId: invoice.client_id || '', clientName: invoice.client_name, description: invoice.description, total: Number(invoice.total), status: invoice.status === 'paid' ? 'paid' : invoice.status === 'overdue' ? 'overdue' : 'pending', createdAt: invoice.created_at })));
    if (!paymentsResult.error) setPayments((paymentsResult.data || []).map((payment) => ({ id: payment.id, invoiceId: payment.invoice_id, invoiceNumber: payment.invoice_number, amount: Number(payment.amount), method: payment.method, createdAt: payment.created_at })));
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);
  useEffect(() => { if (!cloudAdmin) localStorage.setItem('plm-admin-clients', JSON.stringify(clientRecords)); }, [clientRecords, cloudAdmin]);
  useEffect(() => { if (!cloudAdmin) localStorage.setItem('plm-admin-invoices', JSON.stringify(invoices)); }, [invoices, cloudAdmin]);
  useEffect(() => { if (!cloudAdmin) localStorage.setItem('plm-admin-payments', JSON.stringify(payments)); }, [payments, cloudAdmin]);
  const savedClients = clientRecords;
  const savedInvoices = invoices;
  const savedPayments = payments;

  const orderClients = useMemo(() => {
    const known = new Map<string, { name: string; email: string; orders: number; total: number }>();
    orders.forEach((order) => {
      const existing = known.get(order.customer_email) || { name: order.customer_name, email: order.customer_email, orders: 0, total: 0 };
      existing.orders += 1;
      existing.total += Number(order.total_tnd);
      known.set(order.customer_email, existing);
    });
    return [...known.values()];
  }, [orders]);
  const clients = useMemo(() => {
    const fromOrders = orderClients.map((client) => ({ ...client, id: `order-${client.email}`, phone: '', company: '', createdAt: '' }));
    return [...savedClients, ...fromOrders.filter((client) => !savedClients.some((saved) => saved.email === client.email))];
  }, [savedClients, orderClients]);
  const paidTotal = orders.filter((order) => order.status === 'paid').reduce((total, order) => total + Number(order.total_tnd), 0) + savedPayments.reduce((total, payment) => total + payment.amount, 0);
  const pendingTotal = orders.filter((order) => order.status === 'pending').reduce((total, order) => total + Number(order.total_tnd), 0);

  const title = navigation.find((item) => item.id === section)?.label;
  const isEmpty = !loading && orders.length === 0;
  const saveClient = async (client: Omit<ClientRecord, 'id' | 'createdAt'>) => { if (!cloudAdmin) { setClientRecords((items) => [...items, { ...client, id: crypto.randomUUID(), createdAt: new Date().toISOString() }]); setModal(null); return; } const { data: auth } = await supabase.auth.getUser(); const { error } = await supabase.from('admin_clients').insert({ ...client, admin_id: auth.user?.id }); if (!error) { setModal(null); loadData(); } };
  const saveInvoice = async (invoice: Omit<InvoiceRecord, 'id' | 'createdAt' | 'number'>) => { const invoice_number = `FAC-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`; if (!cloudAdmin) { setInvoices((items) => [...items, { ...invoice, id: crypto.randomUUID(), number: invoice_number, createdAt: new Date().toISOString() }]); setModal(null); return; } const { data: auth } = await supabase.auth.getUser(); const { error } = await supabase.from('admin_invoices').insert({ admin_id: auth.user?.id, invoice_number, client_id: invoice.clientId, client_name: invoice.clientName, description: invoice.description, total: invoice.total, status: invoice.status }); if (!error) { setModal(null); loadData(); } };
  const savePayment = async (payment: Omit<PaymentRecord, 'id' | 'createdAt'>) => { if (!cloudAdmin) { setPayments((items) => [...items, { ...payment, id: crypto.randomUUID(), createdAt: new Date().toISOString() }]); setInvoices((items) => items.map((invoice) => invoice.id === payment.invoiceId ? { ...invoice, status: 'paid' } : invoice)); setModal(null); return; } const { data: auth } = await supabase.auth.getUser(); const { error } = await supabase.from('admin_payments').insert({ ...payment, admin_id: auth.user?.id }); if (!error) { await supabase.from('admin_invoices').update({ status: 'paid' }).eq('id', payment.invoiceId); setModal(null); loadData(); } };
  const updateInvoiceStatus = async (id: string, status: InvoiceStatus) => { if (!cloudAdmin) { setInvoices((items) => items.map((invoice) => invoice.id === id ? { ...invoice, status } : invoice)); return; } await supabase.from('admin_invoices').update({ status }).eq('id', id); loadData(); };
  const saveService = async (service: Service) => { const { error } = await supabase.from('services').update({ name: service.name, description: service.description, short_description: service.short_description, category: service.category, price_tnd: service.price_tnd, is_active: service.is_active }).eq('id', service.id); if (!error) { setServices((items) => items.map((item) => item.id === service.id ? service : item)); setModal(null); } };
  const deleteService = async (service: Service) => { if (!window.confirm(`Supprimer définitivement le service « ${service.name} » ?`)) return; const { error } = await supabase.from('services').delete().eq('id', service.id); if (!error) setServices((items) => items.filter((item) => item.id !== service.id)); };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 bg-slate-950 p-6 text-slate-200 lg:block">
        <a href="/" className="mb-10 flex items-center gap-3 text-white">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-500"><BarChart3 className="h-6 w-6" /></span>
          <span><strong className="block text-lg">PLM Ressource</strong><small className="text-teal-300">Administration</small></span>
        </a>
        <nav className="space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            return <button key={item.id} onClick={() => setSection(item.id)} className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition ${section === item.id ? 'bg-teal-500 text-white shadow-lg shadow-teal-900/30' : 'hover:bg-slate-800'}`}><Icon className="h-5 w-5" />{item.label}</button>;
          })}
        </nav>
        <div className="absolute bottom-7 left-6 right-6 rounded-xl border border-slate-800 bg-slate-900 p-4 text-xs leading-relaxed text-slate-400">Espace centralisé pour gérer le catalogue, les demandes et les règlements.</div>
      </aside>

      <main className="lg:ml-72">
        <header className="flex min-h-20 items-center justify-between border-b border-slate-200 bg-white px-5 sm:px-8">
          <div className="flex items-center gap-3"><a href="/" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"><ArrowLeft className="h-5 w-5" /></a><div><p className="text-xs font-semibold uppercase tracking-wider text-teal-600">PLMCompta</p><h1 className="text-xl font-bold">{title}</h1></div></div>
          <div className="flex items-center gap-2"><button onClick={loadData} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />Actualiser</button><button onClick={onLogout} className="rounded-xl p-2.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600" title="Se déconnecter"><LogOut className="h-4 w-4" /></button></div>
        </header>
        <div className="mx-auto max-w-7xl p-5 sm:p-8">
          {section === 'dashboard' && <>
            <div className="mb-7"><h2 className="text-2xl font-bold">Bonjour, voici votre activité</h2><p className="mt-1 text-slate-500">Vue consolidée de votre vitrine et de votre gestion commerciale.</p></div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <Metric label="Chiffre d'affaires encaissé" value={money(paidTotal)} icon={CheckCircle2} color="teal" />
              <Metric label="À encaisser" value={money(pendingTotal)} icon={CreditCard} color="amber" />
              <Metric label="Clients" value={String(clients.length)} icon={Users} color="violet" />
              <Metric label="Services actifs" value={String(services.filter((item) => item.is_active).length)} icon={BriefcaseBusiness} color="blue" />
            </div>
            <div className="mt-7 grid gap-6 xl:grid-cols-5">
              <Panel title="Dernières commandes" className="xl:col-span-3"><OrdersTable orders={orders.slice(0, 5)} loading={loading} /></Panel>
              <Panel title="Accès rapide" className="xl:col-span-2"><div className="space-y-3">{[{ label: 'Gérer les clients', id: 'clients' }, { label: 'Voir les factures', id: 'orders' }, { label: 'Mettre à jour le catalogue', id: 'services' }].map((action) => <button key={action.id} onClick={() => setSection(action.id as Section)} className="flex w-full items-center justify-between rounded-xl bg-slate-50 p-4 text-left font-semibold hover:bg-teal-50 hover:text-teal-700"><span>{action.label}</span><span>→</span></button>)}</div></Panel>
            </div>
          </>}
          {section === 'clients' && <Panel title="Répertoire clients" description="Ajoutez vos clients, ou retrouvez ceux issus des commandes."><ActionButton label="Nouveau client" onClick={() => setModal('client')} /><ClientsTable clients={clients} /></Panel>}
          {section === 'orders' && <><Panel title="Factures" description="Créez et suivez vos factures manuelles."><ActionButton label="Nouvelle facture" onClick={() => setModal('invoice')} /><InvoicesTable invoices={savedInvoices} onStatusChange={updateInvoiceStatus} /></Panel><div className="mt-6"><Panel title="Commandes de la vitrine"><OrdersTable orders={orders} loading={loading} /></Panel></div></>}
          {section === 'payments' && <Panel title="Suivi des paiements" description="Enregistrez un règlement pour mettre la facture à jour."><ActionButton label="Enregistrer un paiement" onClick={() => setModal('payment')} /><PaymentsTable payments={savedPayments} /></Panel>}
          {section === 'services' && <Panel title="Catalogue de services" description="Modifiez, masquez ou supprimez les prestations publiées."><ServicesTable services={services} onEdit={(service) => { setEditingService(service); setModal('service'); }} onDelete={deleteService} /></Panel>}
          {section === 'settings' && <Panel title="Paramètres de l'entreprise"><div className="grid max-w-2xl gap-5 sm:grid-cols-2"><Setting label="Entreprise" value="PLM Ressource" /><Setting label="Devise" value="Dinar tunisien (TND)" /><Setting label="Canal de vente" value="Vitrine en ligne" /><Setting label="Paiement" value="Carte bancaire" /></div></Panel>}
          {isEmpty && section === 'dashboard' && <p className="mt-5 rounded-xl border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-500">Aucune commande n’est encore enregistrée. Les indicateurs se rempliront dès la première commande depuis la vitrine.</p>}
        </div>
      </main>
      {modal === 'client' && <ClientModal onClose={() => setModal(null)} onSave={saveClient} />}
      {modal === 'invoice' && <InvoiceModal clients={savedClients} onClose={() => setModal(null)} onSave={saveInvoice} />}
      {modal === 'payment' && <PaymentModal invoices={savedInvoices.filter((invoice) => invoice.status !== 'paid')} onClose={() => setModal(null)} onSave={savePayment} />}
      {modal === 'service' && editingService && <ServiceModal service={editingService} onClose={() => setModal(null)} onSave={saveService} />}
    </div>
  );
}

function Metric({ label, value, icon: Icon, color }: { label: string; value: string; icon: typeof Users; color: string }) { const colors: Record<string, string> = { teal: 'bg-teal-100 text-teal-700', amber: 'bg-amber-100 text-amber-700', violet: 'bg-violet-100 text-violet-700', blue: 'bg-blue-100 text-blue-700' }; return <div className="rounded-2xl bg-white p-5 shadow-sm"><div className="flex justify-between"><p className="text-sm font-medium text-slate-500">{label}</p><span className={`rounded-xl p-2 ${colors[color]}`}><Icon className="h-5 w-5" /></span></div><p className="mt-4 text-2xl font-bold">{value}</p></div>; }
function Panel({ title, description, children, className = '' }: { title: string; description?: string; children: React.ReactNode; className?: string }) { return <section className={`rounded-2xl bg-white p-5 shadow-sm ${className}`}><h2 className="text-lg font-bold">{title}</h2>{description && <p className="mt-1 text-sm text-slate-500">{description}</p>}<div className="mt-5">{children}</div></section>; }
function Status({ value }: { value: string }) { const paid = value === 'paid'; const overdue = value === 'overdue'; return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${paid ? 'bg-teal-100 text-teal-700' : overdue || value === 'cancelled' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>{paid ? 'Payée' : overdue ? 'En retard' : value === 'cancelled' ? 'Annulée' : 'En attente'}</span>; }
function OrdersTable({ orders, loading }: { orders: Order[]; loading: boolean }) { if (loading) return <p className="py-6 text-sm text-slate-500">Chargement des données…</p>; if (!orders.length) return <p className="py-6 text-sm text-slate-500">Aucune donnée disponible.</p>; return <div className="overflow-x-auto"><table className="w-full min-w-[600px] text-left text-sm"><thead className="border-b border-slate-100 text-xs uppercase text-slate-400"><tr><th className="pb-3 font-semibold">Référence</th><th className="pb-3 font-semibold">Client</th><th className="pb-3 font-semibold">Montant</th><th className="pb-3 font-semibold">Statut</th></tr></thead><tbody>{orders.map((order) => <tr key={order.id} className="border-b border-slate-50 last:border-0"><td className="py-4 font-semibold text-slate-700">{order.order_number}</td><td className="py-4"><span className="block font-medium">{order.customer_name}</span><span className="text-xs text-slate-400">{order.customer_email}</span></td><td className="py-4 font-semibold">{money(Number(order.total_tnd))}</td><td className="py-4"><Status value={order.status} /></td></tr>)}</tbody></table></div>; }
function ClientsTable({ clients }: { clients: (ClientRecord & { orders?: number; total?: number })[] }) { if (!clients.length) return <p className="py-6 text-sm text-slate-500">Aucun client pour le moment.</p>; return <div className="overflow-x-auto"><table className="w-full min-w-[550px] text-left text-sm"><thead className="border-b border-slate-100 text-xs uppercase text-slate-400"><tr><th className="pb-3">Client</th><th className="pb-3">E-mail</th><th className="pb-3">Contact</th><th className="pb-3">Activité</th></tr></thead><tbody>{clients.map((client) => <tr key={client.id} className="border-b border-slate-50"><td className="py-4 font-semibold">{client.name}<span className="block text-xs font-normal text-slate-400">{client.company}</span></td><td className="py-4 text-slate-500">{client.email || '—'}</td><td className="py-4 text-slate-500">{client.phone || '—'}</td><td className="py-4 font-semibold">{client.orders ? `${client.orders} commande${client.orders > 1 ? 's' : ''} · ${money(client.total || 0)}` : 'Ajouté manuellement'}</td></tr>)}</tbody></table></div>; }
function ServicesTable({ services, onEdit, onDelete }: { services: Service[]; onEdit: (service: Service) => void; onDelete: (service: Service) => void }) { if (!services.length) return <p className="py-6 text-sm text-slate-500">Aucun service disponible.</p>; return <div className="space-y-3">{services.map((service) => <div key={service.id} className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 p-4"><div><p className="font-bold">{service.name}</p><p className="mt-1 text-sm text-slate-500">{service.category} · {service.short_description}</p></div><div className="flex items-center gap-3"><div className="text-right"><p className="font-bold">{money(Number(service.price_tnd))}</p><span className={`text-xs font-semibold ${service.is_active ? 'text-teal-600' : 'text-slate-400'}`}>{service.is_active ? 'Actif' : 'Masqué'}</span></div><button onClick={() => onEdit(service)} className="rounded-lg p-2 text-teal-700 hover:bg-teal-50" title="Modifier"><Pencil className="h-4 w-4" /></button><button onClick={() => onDelete(service)} className="rounded-lg p-2 text-rose-600 hover:bg-rose-50" title="Supprimer"><Trash2 className="h-4 w-4" /></button></div></div>)}</div>; }
function Setting({ label, value }: { label: string; value: string }) { return <div className="rounded-xl bg-slate-50 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p><p className="mt-2 font-bold">{value}</p></div>; }
function ActionButton({ label, onClick }: { label: string; onClick: () => void }) { return <button onClick={onClick} className="mb-5 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-teal-700">+ {label}</button>; }
function InvoicesTable({ invoices, onStatusChange }: { invoices: InvoiceRecord[]; onStatusChange: (id: string, status: InvoiceStatus) => void }) { if (!invoices.length) return <p className="py-6 text-sm text-slate-500">Aucune facture créée. Utilisez « Nouvelle facture » pour commencer.</p>; return <div className="overflow-x-auto"><table className="w-full min-w-[600px] text-left text-sm"><thead className="border-b border-slate-100 text-xs uppercase text-slate-400"><tr><th className="pb-3">N°</th><th className="pb-3">Client</th><th className="pb-3">Objet</th><th className="pb-3">Total</th><th className="pb-3">Statut</th></tr></thead><tbody>{invoices.map((invoice) => <tr key={invoice.id} className="border-b border-slate-50"><td className="py-4 font-bold">{invoice.number}</td><td className="py-4">{invoice.clientName}</td><td className="py-4 text-slate-500">{invoice.description}</td><td className="py-4 font-bold">{money(invoice.total)}</td><td className="py-4"><select aria-label={`Statut ${invoice.number}`} value={invoice.status} onChange={(event) => onStatusChange(invoice.id, event.target.value as InvoiceStatus)} className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold"><option value="pending">En attente</option><option value="paid">Payée</option><option value="overdue">En retard</option></select></td></tr>)}</tbody></table></div>; }
function PaymentsTable({ payments }: { payments: PaymentRecord[] }) { if (!payments.length) return <p className="py-6 text-sm text-slate-500">Aucun paiement enregistré.</p>; return <div className="overflow-x-auto"><table className="w-full min-w-[520px] text-left text-sm"><thead className="border-b border-slate-100 text-xs uppercase text-slate-400"><tr><th className="pb-3">Facture</th><th className="pb-3">Montant</th><th className="pb-3">Méthode</th><th className="pb-3">Date</th></tr></thead><tbody>{payments.map((payment) => <tr key={payment.id} className="border-b border-slate-50"><td className="py-4 font-bold">{payment.invoiceNumber}</td><td className="py-4 font-bold text-teal-700">{money(payment.amount)}</td><td className="py-4 capitalize">{payment.method}</td><td className="py-4 text-slate-500">{new Date(payment.createdAt).toLocaleDateString('fr-TN')}</td></tr>)}</tbody></table></div>; }
function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) { return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"><div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"><div className="mb-5 flex items-center justify-between"><h2 className="text-xl font-bold">{title}</h2><button onClick={onClose} className="rounded-lg px-2 py-1 text-slate-500 hover:bg-slate-100">✕</button></div>{children}</div></div>; }
const inputClass = 'mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100';
function ClientModal({ onClose, onSave }: { onClose: () => void; onSave: (client: Omit<ClientRecord, 'id' | 'createdAt'>) => void }) { const [form, setForm] = useState({ name: '', email: '', phone: '', company: '' }); return <Modal title="Nouveau client" onClose={onClose}><form onSubmit={(event) => { event.preventDefault(); onSave(form); }} className="space-y-4"><label className="block text-sm font-semibold">Nom / raison sociale<input required className={inputClass} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label><label className="block text-sm font-semibold">Entreprise<input className={inputClass} value={form.company} onChange={(event) => setForm({ ...form, company: event.target.value })} /></label><div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm font-semibold">E-mail<input type="email" className={inputClass} value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label><label className="block text-sm font-semibold">Téléphone<input className={inputClass} value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></label></div><Submit label="Ajouter le client" /></form></Modal>; }
function InvoiceModal({ clients, onClose, onSave }: { clients: ClientRecord[]; onClose: () => void; onSave: (invoice: Omit<InvoiceRecord, 'id' | 'createdAt' | 'number'>) => void }) { const [form, setForm] = useState({ clientId: clients[0]?.id || '', description: '', total: '', status: 'pending' as InvoiceStatus }); return <Modal title="Nouvelle facture" onClose={onClose}>{clients.length ? <form onSubmit={(event) => { event.preventDefault(); const client = clients.find((item) => item.id === form.clientId)!; onSave({ ...form, clientName: client.name, total: Number(form.total) }); }} className="space-y-4"><label className="block text-sm font-semibold">Client<select required className={inputClass} value={form.clientId} onChange={(event) => setForm({ ...form, clientId: event.target.value })}>{clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}</select></label><label className="block text-sm font-semibold">Prestation / objet<input required className={inputClass} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label><div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm font-semibold">Montant TTC (TND)<input required min="0" step="0.001" type="number" className={inputClass} value={form.total} onChange={(event) => setForm({ ...form, total: event.target.value })} /></label><label className="block text-sm font-semibold">Statut<select className={inputClass} value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as InvoiceStatus })}><option value="pending">En attente</option><option value="paid">Payée</option><option value="overdue">En retard</option></select></label></div><Submit label="Créer la facture" /></form> : <p className="text-sm text-slate-500">Ajoutez d’abord un client avant de créer une facture.</p>}</Modal>; }
function PaymentModal({ invoices, onClose, onSave }: { invoices: InvoiceRecord[]; onClose: () => void; onSave: (payment: Omit<PaymentRecord, 'id' | 'createdAt'>) => void }) { const [form, setForm] = useState({ invoiceId: invoices[0]?.id || '', amount: '', method: 'virement' }); return <Modal title="Enregistrer un paiement" onClose={onClose}>{invoices.length ? <form onSubmit={(event) => { event.preventDefault(); const invoice = invoices.find((item) => item.id === form.invoiceId)!; onSave({ ...form, invoiceNumber: invoice.number, amount: Number(form.amount) }); }} className="space-y-4"><label className="block text-sm font-semibold">Facture<select className={inputClass} value={form.invoiceId} onChange={(event) => setForm({ ...form, invoiceId: event.target.value })}>{invoices.map((invoice) => <option key={invoice.id} value={invoice.id}>{invoice.number} · {invoice.clientName}</option>)}</select></label><label className="block text-sm font-semibold">Montant reçu (TND)<input required min="0" step="0.001" type="number" className={inputClass} value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} /></label><label className="block text-sm font-semibold">Méthode<select className={inputClass} value={form.method} onChange={(event) => setForm({ ...form, method: event.target.value })}><option value="virement">Virement</option><option value="espèces">Espèces</option><option value="carte">Carte</option></select></label><Submit label="Valider le paiement" /></form> : <p className="text-sm text-slate-500">Aucune facture à régler.</p>}</Modal>; }
function Submit({ label }: { label: string }) { return <button type="submit" className="w-full rounded-xl bg-teal-600 px-4 py-3 font-bold text-white hover:bg-teal-700">{label}</button>; }
function ServiceModal({ service, onClose, onSave }: { service: Service; onClose: () => void; onSave: (service: Service) => void }) { const [form, setForm] = useState(service); return <Modal title="Modifier le service" onClose={onClose}><form onSubmit={(event) => { event.preventDefault(); onSave({ ...form, price_tnd: Number(form.price_tnd) }); }} className="space-y-4"><label className="block text-sm font-semibold">Nom<input required className={inputClass} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label><label className="block text-sm font-semibold">Description courte<input className={inputClass} value={form.short_description || ''} onChange={(event) => setForm({ ...form, short_description: event.target.value })} /></label><label className="block text-sm font-semibold">Description<textarea required className={inputClass} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label><div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm font-semibold">Catégorie<input required className={inputClass} value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} /></label><label className="block text-sm font-semibold">Prix TND<input required type="number" min="0" step="0.001" className={inputClass} value={form.price_tnd} onChange={(event) => setForm({ ...form, price_tnd: Number(event.target.value) })} /></label></div><label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={form.is_active} onChange={(event) => setForm({ ...form, is_active: event.target.checked })} />Afficher ce service sur le site</label><Submit label="Enregistrer les modifications" /></form></Modal>; }
