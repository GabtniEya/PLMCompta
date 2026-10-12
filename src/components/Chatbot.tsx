import { useState, type FormEvent } from 'react';
import { Bot, MessageCircle, Send, ShoppingCart, Sparkles, X } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatTND } from '@/lib/format';
import type { Service } from '@/types';

type Message = { from: 'bot' | 'user'; text: string };
type Action = 'services' | 'cart' | 'payment';

interface ChatbotProps {
  services: Service[];
  onNavigate: (section: string) => void;
}

const welcome: Message = {
  from: 'bot',
  text: 'Bonjour ! Je suis l’assistant PLM. Je peux vous aider à choisir un service, consulter votre panier ou tester une commande.',
};

function answer(question: string, services: Service[]) {
  const text = question.toLocaleLowerCase('fr');
  const matchingService = services.find((service) => text.includes(service.name.toLocaleLowerCase('fr').split(' ')[0]));
  if (matchingService) return `« ${matchingService.name} » est disponible à partir de ${formatTND(matchingService.price_tnd)} TND. Vous pouvez le consulter dans la section Services.`;
  if (text.includes('service') || text.includes('prestation') || text.includes('conseil')) return services.length ? `Nous proposons actuellement ${services.length} services : ${services.map((service) => service.name).join(', ')}.` : 'Les services seront affichés ici dès que le catalogue est chargé.';
  if (text.includes('paiement') || text.includes('carte')) return 'Vous pouvez effectuer une commande test avec une carte de démonstration. Aucune donnée bancaire réelle n’est enregistrée.';
  if (text.includes('commande') || text.includes('facture')) return 'Après validation, vous recevez un numéro de commande et pouvez télécharger la facture PDF. Conservez ce numéro pour le suivi.';
  if (text.includes('prix') || text.includes('tarif')) return 'Les prix sont affichés en dinars tunisiens. Le total est calculé automatiquement dans le panier.';
  if (text.includes('bonjour') || text.includes('salut')) return 'Bonjour ! Cliquez sur une suggestion ou écrivez le nom d’un service pour obtenir son prix.';
  return 'Je peux vous guider vers les services, le panier ou le paiement test. Essayez par exemple : « quels services ? » ou « prix formation ».';
}

export default function Chatbot({ services, onNavigate }: ChatbotProps) {
  const { items, totalPrice, openCart } = useCart();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([welcome]);

  const ask = (question: string) => {
    const trimmed = question.trim();
    if (!trimmed) return;
    setMessages((current) => [...current, { from: 'user', text: trimmed }, { from: 'bot', text: answer(trimmed, services) }]);
    setInput('');
  };

  const send = (event: FormEvent) => { event.preventDefault(); ask(input); };
  const perform = (action: Action) => {
    if (action === 'cart') { openCart(); setOpen(false); return; }
    onNavigate('services');
    setOpen(false);
  };

  return <div className="fixed bottom-5 right-5 z-[70]">
    {open && <section className="mb-3 flex h-[31rem] w-[min(24rem,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
      <header className="flex items-center justify-between bg-slate-900 px-4 py-4 text-white"><div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-teal-500"><Bot className="h-5 w-5" /></span><div><p className="font-bold">Assistant PLM</p><p className="text-xs text-teal-200">Assistant virtuel · En ligne</p></div></div><button onClick={() => setOpen(false)} aria-label="Fermer le chat" className="rounded-lg p-2 hover:bg-white/10"><X className="h-5 w-5" /></button></header>
      <div className="border-b border-teal-100 bg-teal-50 px-3 py-2"><div className="flex items-center justify-between text-xs text-teal-800"><span className="inline-flex items-center gap-1 font-semibold"><ShoppingCart className="h-3.5 w-3.5" /> Panier : {items.length} article{items.length !== 1 ? 's' : ''}</span><span>{formatTND(totalPrice)} TND</span></div></div>
      <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4">{messages.map((message, index) => <div key={index} className={`flex ${message.from === 'user' ? 'justify-end' : 'justify-start'}`}><p className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${message.from === 'user' ? 'rounded-br-sm bg-teal-600 text-white' : 'rounded-bl-sm bg-white text-slate-700 shadow-sm'}`}>{message.text}</p></div>)}</div>
      <div className="border-t border-slate-100 bg-white p-3"><div className="mb-2 flex flex-wrap gap-1.5"><button type="button" onClick={() => ask('Quels services proposez-vous ?')} className="rounded-full border border-teal-200 px-2.5 py-1 text-xs font-medium text-teal-700 hover:bg-teal-50">Nos services</button><button type="button" onClick={() => perform('cart')} className="rounded-full border border-teal-200 px-2.5 py-1 text-xs font-medium text-teal-700 hover:bg-teal-50">Mon panier</button><button type="button" onClick={() => perform('payment')} className="rounded-full border border-teal-200 px-2.5 py-1 text-xs font-medium text-teal-700 hover:bg-teal-50">Paiement test</button></div><form onSubmit={send} className="flex gap-2"><input value={input} onChange={(event) => setInput(event.target.value)} className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-400" placeholder="Écrivez votre question…" /><button type="submit" aria-label="Envoyer" className="grid h-10 w-10 place-items-center rounded-xl bg-teal-600 text-white hover:bg-teal-700"><Send className="h-4 w-4" /></button></form></div>
    </section>}
    <button onClick={() => setOpen((value) => !value)} aria-label="Ouvrir l’assistant PLM" className="relative grid h-14 w-14 place-items-center rounded-full bg-teal-600 text-white shadow-lg shadow-teal-700/30 transition hover:scale-105 hover:bg-teal-700"><MessageCircle className="h-6 w-6" /><Sparkles className="absolute -right-1 -top-1 h-4 w-4 text-amber-300" /></button>
  </div>;
}
