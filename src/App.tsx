import { useState, useEffect, useCallback } from 'react';
import type { Session } from '@supabase/supabase-js';
import { CartProvider } from '@/context/CartContext';
import { supabase } from '@/lib/supabase';
import type { Service } from '@/types';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Services from '@/components/Services';
import About from '@/components/About';
import Process from '@/components/Process';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import CheckoutModal from '@/components/CheckoutModal';
import AdminPanel from '@/components/AdminPanel';
import AdminLogin from '@/components/AdminLogin';

const fallbackServiceImages = [
  'https://images.pexels.com/photos/3184423/pexels-photo-3184423.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'https://images.pexels.com/photos/3182794/pexels-photo-3182794.jpeg?auto=compress&cs=tinysrgb&w=1200',
];

function fallbackCategory(name: string) {
  const normalized = name.toLowerCase();
  if (normalized.includes('recrutement')) return 'Recrutement';
  if (normalized.includes('formation')) return 'Formation';
  if (normalized.includes('audit')) return 'Conseil & audit';
  if (normalized.includes('rh') || normalized.includes('ressources humaines')) return 'Ressources humaines';
  return 'Services professionnels';
}

function App() {
  const [isAdmin, setIsAdmin] = useState(() => window.location.pathname.startsWith('/admin'));
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isAdministrator, setIsAdministrator] = useState(false);
  const requireAdministratorRole = import.meta.env.VITE_REQUIRE_ADMIN_ROLE === 'true';
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  useEffect(() => {
    const fetchServices = async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*');

      if (error) {
        console.error('Error fetching services:', error);
      } else {
        // The current PLM database stores a lighter service record
        // (`price`, `tax_rate`, etc.). Convert it to the format used by the shop.
        setServices((data || [])
          .filter((s) => s.is_active !== false)
          .map((s, index) => ({
            ...s,
            slug: s.slug || `service-${s.id}`,
            short_description: s.short_description || s.description || null,
            price_tnd: Number(s.price_tnd ?? s.price ?? 0),
            category: s.category || fallbackCategory(s.name),
            image_url: s.image_url || fallbackServiceImages[index % fallbackServiceImages.length],
            icon_name: s.icon_name || null,
            features: Array.isArray(s.features) ? s.features : [],
            is_active: s.is_active ?? true,
            display_order: s.display_order ?? index,
          })));
      }
      setLoading(false);
    };

    fetchServices();
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthLoading(false);
      if (data.session) {
        supabase.from('profiles').select('role').eq('id', data.session.user.id).maybeSingle()
          .then(({ data: profile }) => setIsAdministrator(profile?.role === 'admin'));
      }
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (!nextSession) { setIsAdministrator(false); return; }
      supabase.from('profiles').select('role').eq('id', nextSession.user.id).maybeSingle()
        .then(({ data: profile }) => setIsAdministrator(profile?.role === 'admin'));
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const updateRoute = () => setIsAdmin(window.location.pathname.startsWith('/admin'));
    window.addEventListener('popstate', updateRoute);
    return () => window.removeEventListener('popstate', updateRoute);
  }, []);

  if (isAdmin) {
    if (authLoading) return <div className="min-h-screen bg-slate-950" />;
    return session ? ((!requireAdministratorRole || isAdministrator) ? <AdminPanel onLogout={() => supabase.auth.signOut()} /> : <AdminAccessDenied onLogout={() => supabase.auth.signOut()} />) : <AdminLogin />;
  }

  const handleNavigate = useCallback((section: string) => {
    const el = document.getElementById(section);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }, []);

  return (
    <CartProvider>
      <div className="min-h-screen bg-white">
        <Header onNavigate={handleNavigate} />
        <main>
          <Hero
            onShopNow={() => handleNavigate('services')}
            onLearnMore={() => handleNavigate('about')}
          />
          <Services services={services} loading={loading} />
          <About />
          <Process />
        </main>
        <Footer onNavigate={handleNavigate} />

        <CartDrawer onCheckout={() => setCheckoutOpen(true)} />
        {checkoutOpen && <CheckoutModal onClose={() => setCheckoutOpen(false)} />}
      </div>
    </CartProvider>
  );
}

function AdminAccessDenied({ onLogout }: { onLogout: () => void }) {
  return <main className="grid min-h-screen place-items-center bg-slate-950 p-5"><section className="max-w-md rounded-3xl bg-white p-8 text-center shadow-2xl"><h1 className="text-2xl font-bold text-slate-900">Accès administrateur en attente</h1><p className="mt-3 text-slate-600">Votre compte est créé, mais doit être autorisé comme administrateur par le propriétaire de l’application.</p><button onClick={onLogout} className="mt-6 rounded-xl bg-teal-600 px-5 py-3 font-bold text-white hover:bg-teal-700">Se déconnecter</button></section></main>;
}

export default App;
