import { type LucideIcon, Plus, Check } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatTND } from '@/lib/format';
import type { Service } from '@/types';
import * as Icons from 'lucide-react';

interface ServiceCardProps {
  service: Service;
  onView: (service: Service) => void;
}

export default function ServiceCard({ service, onView }: ServiceCardProps) {
  const { addItem, items } = useCart();
  const inCart = items.some((item) => item.service.id === service.id);

  const IconComponent = (Icons as unknown as Record<string, LucideIcon>)[service.icon_name || ''] || Icons.FileText;

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-2xl hover:border-teal-200 transition-all duration-300 flex flex-col">
      <div className="relative h-48 overflow-hidden cursor-pointer" onClick={() => onView(service)}>
        <img
          src={service.image_url || ''}
          alt={service.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm text-xs font-semibold text-teal-700">
            {service.category}
          </span>
        </div>
        <div className="absolute bottom-4 left-4 w-12 h-12 rounded-xl bg-teal-500/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
          <IconComponent className="w-6 h-6 text-white" />
        </div>
      </div>

      <div className="p-6 flex flex-col flex-1">
        <h3
          className="text-lg font-bold text-slate-900 mb-2 cursor-pointer hover:text-teal-600 transition-colors"
          onClick={() => onView(service)}
        >
          {service.name}
        </h3>
        <p className="text-sm text-slate-500 mb-4 line-clamp-2">
          {service.short_description || service.description}
        </p>

        <ul className="space-y-1.5 mb-5">
          {service.features.slice(0, 3).map((feature, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
              <Check className="w-4 h-4 text-teal-500 mt-0.5 shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        <div className="mt-auto flex items-center justify-between gap-3">
          <div>
            <span className="text-xs text-slate-400">À partir de</span>
            <div className="text-xl font-bold text-slate-900">
              {formatTND(service.price_tnd)} <span className="text-sm font-medium text-slate-500">TND</span>
            </div>
          </div>
          <button
            onClick={() => addItem(service)}
            className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all hover:scale-105 ${
              inCart
                ? 'bg-teal-50 text-teal-700 border border-teal-200'
                : 'bg-teal-500 text-white hover:bg-teal-400 shadow-md hover:shadow-teal-500/30'
            }`}
          >
            {inCart ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {inCart ? 'Ajouté' : 'Ajouter'}
          </button>
        </div>
      </div>
    </div>
  );
}
