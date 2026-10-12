import { useState, useEffect } from 'react';
import { ShoppingCart, Menu, X, Building2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';

interface HeaderProps {
  onNavigate: (section: string) => void;
}

export default function Header({ onNavigate }: HeaderProps) {
  const { totalItems, openCart } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Accueil', id: 'hero' },
    { label: 'Services', id: 'services' },
    { label: 'À propos', id: 'about' },
    { label: 'Processus', id: 'process' },
    { label: 'Contact', id: 'contact' },
  ];

  const handleNav = (id: string) => {
    onNavigate(id);
    setMobileOpen(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-md'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <button
            onClick={() => handleNav('hero')}
            className="flex items-center gap-3 group"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-teal-600 to-teal-700 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <span className={`block font-bold text-lg leading-tight ${scrolled ? 'text-slate-900' : 'text-white'}`}>
                PLM Ressource
              </span>
              <span className={`block text-xs font-medium ${scrolled ? 'text-teal-600' : 'text-teal-200'}`}>
                Services Professionnels
              </span>
            </div>
          </button>

          <nav className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`text-sm font-medium transition-colors hover:text-teal-500 ${
                  scrolled ? 'text-slate-700' : 'text-white/90'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="/admin"
              className={`hidden sm:inline-flex items-center rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
                scrolled ? 'text-teal-700 hover:bg-teal-50' : 'bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm'
              }`}
            >
              Administration
            </a>
            <button
              onClick={openCart}
              className={`relative p-2.5 rounded-xl transition-all hover:scale-105 ${
                scrolled
                  ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  : 'bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm'
              }`}
              aria-label="Panier"
            >
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-teal-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={`lg:hidden p-2.5 rounded-xl transition-colors ${
                scrolled
                  ? 'bg-slate-100 text-slate-700'
                  : 'bg-white/15 text-white backdrop-blur-sm'
              }`}
              aria-label="Menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <nav className="lg:hidden bg-white border-t border-slate-100 py-4 px-2 space-y-1 shadow-lg rounded-b-2xl">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className="block w-full text-left px-4 py-3 rounded-xl text-slate-700 font-medium hover:bg-slate-50 transition-colors"
              >
                {item.label}
              </button>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
