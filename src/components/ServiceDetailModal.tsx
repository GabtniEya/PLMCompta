import { type LucideIcon, X, Check, Plus, ShoppingCart } from 'lucide-react';
import * as Icons from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatTND } from '@/lib/format';
import type { Service } from '@/types';

interface ServiceDetailModalProps {
  service: Service;
  onClose: () => void;
}

export default function ServiceDetailModal({ service, onClose }: ServiceDetailModalProps) {
  const { addItem, items, openCart } = useCart();
  const inCart = items.some((item) => item.service.id === service.id);
  const IconComponent = (Icons as unknown as Record<string, LucideIcon>)[service.icon_name || ''] || Icons.FileText;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-56 overflow-hidden rounded-t-3xl">
          <img
            src={service.image_url || ''}
            alt={service.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors"
          >
            <X className="w-5 h-5 text-slate-700" />
          </button>
          <div className="absolute bottom-4 left-6 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-teal-500 flex items-center justify-center shadow-lg">
              <IconComponent className="w-6 h-6 text-white" />
            </div>
            <span className="px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm text-xs font-semibold text-teal-700">
              {service.category}
            </span>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-3">{service.name}</h2>
          <p className="text-slate-600 leading-relaxed mb-6">{service.description}</p>

          <div className="mb-6">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Ce qui est inclus :</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {service.features.map((feature, i) => (
                <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50">
                  <div className="w-5 h-5 rounded-full bg-teal-100 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-teal-600" />
                  </div>
                  <span className="text-sm text-slate-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 pt-6 border-t border-slate-100">
            <div>
              <span className="text-xs text-slate-400">Prix</span>
              <div className="text-3xl font-bold text-slate-900">
                {formatTND(service.price_tnd)} <span className="text-lg font-medium text-slate-500">TND</span>
              </div>
            </div>
            <div className="flex gap-3">
              {inCart ? (
                <button
                  onClick={() => { openCart(); onClose(); }}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-teal-50 text-teal-700 font-semibold border border-teal-200 hover:bg-teal-100 transition-colors"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Voir le panier
                </button>
              ) : (
                <button
                  onClick={() => addItem(service)}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-teal-500 text-white font-semibold hover:bg-teal-400 transition-all hover:scale-105 shadow-lg shadow-teal-500/20"
                >
                  <Plus className="w-5 h-5" />
                  Ajouter au panier
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
