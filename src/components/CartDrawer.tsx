import { X, Trash2, Minus, Plus, ShoppingBag, CreditCard } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatTND } from '@/lib/format';

interface CartDrawerProps {
  onCheckout: () => void;
}

export default function CartDrawer({ onCheckout }: CartDrawerProps) {
  const { items, isOpen, closeCart, removeItem, updateQuantity, totalPrice, totalItems } = useCart();

  return (
    <>
      <div
        className={`fixed inset-0 z-[55] bg-slate-950/50 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeCart}
      />
      <div
        className={`fixed right-0 top-0 bottom-0 z-[56] w-full max-w-md bg-white shadow-2xl transition-transform duration-300 flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900">Mon Panier</h2>
              <p className="text-xs text-slate-400">{totalItems} service{totalItems > 1 ? 's' : ''}</p>
            </div>
          </div>
          <button
            onClick={closeCart}
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
            <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-5">
              <ShoppingBag className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="font-semibold text-slate-700 mb-2">Votre panier est vide</h3>
            <p className="text-sm text-slate-400 mb-6">
              Parcourez notre catalogue et ajoutez les services qui vous intéressent.
            </p>
            <button
              onClick={closeCart}
              className="px-6 py-3 rounded-xl bg-teal-500 text-white font-semibold hover:bg-teal-400 transition-colors"
            >
              Voir les services
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
              {items.map((item) => (
                <div
                  key={item.service.id}
                  className="flex gap-3 p-3 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors"
                >
                  <img
                    src={item.service.image_url || ''}
                    alt={item.service.name}
                    className="w-16 h-16 rounded-xl object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm text-slate-900 truncate">
                      {item.service.name}
                    </h4>
                    <p className="text-xs text-slate-400 mb-2">{item.service.category}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 bg-slate-50 rounded-lg p-1">
                        <button
                          onClick={() => updateQuantity(item.service.id, item.quantity - 1)}
                          className="w-6 h-6 rounded-md bg-white hover:bg-slate-100 flex items-center justify-center transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5 text-slate-600" />
                        </button>
                        <span className="text-sm font-semibold text-slate-700 w-6 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.service.id, item.quantity + 1)}
                          className="w-6 h-6 rounded-md bg-white hover:bg-slate-100 flex items-center justify-center transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5 text-slate-600" />
                        </button>
                      </div>
                      <span className="text-sm font-bold text-slate-900">
                        {formatTND(item.service.price_tnd * item.quantity)} TND
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(item.service.id)}
                    className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center transition-colors shrink-0"
                    aria-label="Supprimer"
                  >
                    <Trash2 className="w-4 h-4 text-slate-400 hover:text-red-500" />
                  </button>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-100 px-6 py-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Sous-total</span>
                <span className="text-sm font-semibold text-slate-700">{formatTND(totalPrice)} TND</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Frais de service</span>
                <span className="text-sm font-semibold text-teal-600">Offerts</span>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <span className="font-bold text-slate-900">Total</span>
                <span className="text-2xl font-bold text-slate-900">
                  {formatTND(totalPrice)} <span className="text-base font-medium text-slate-500">TND</span>
                </span>
              </div>
              <button
                onClick={onCheckout}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-teal-500 hover:bg-teal-400 text-white font-semibold rounded-xl transition-all hover:scale-[1.02] shadow-lg shadow-teal-500/20"
              >
                <CreditCard className="w-5 h-5" />
                Passer au paiement
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
