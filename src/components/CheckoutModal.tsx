import { useState, type FormEvent } from 'react';
import { X, CreditCard, Lock, CheckCircle2, Loader2, ArrowLeft, Download, FileText } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/lib/supabase';
import { formatTND } from '@/lib/format';
import type { CartItem } from '@/types';

interface CheckoutModalProps {
  onClose: () => void;
}

type Status = 'form' | 'processing' | 'success' | 'error';

export default function CheckoutModal({ onClose }: CheckoutModalProps) {
  const { items, totalPrice, clearCart } = useCart();
  const paymeeEnabled = import.meta.env.VITE_PAYMENT_MODE === 'paymee';
  const [status, setStatus] = useState<Status>('form');
  const [orderNumber, setOrderNumber] = useState<string>('');
  const [completedItems, setCompletedItems] = useState<CartItem[]>([]);
  const [completedTotal, setCompletedTotal] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [form, setForm] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    customer_address: '',
    notes: '',
    card_number: '',
    card_expiry: '',
    card_cvc: '',
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const downloadInvoice = () => {
    const document = new jsPDF();
    const date = new Date().toLocaleDateString('fr-TN');
    document.setFillColor(13, 148, 136);
    document.rect(0, 0, 210, 38, 'F');
    document.setTextColor(255, 255, 255);
    document.setFontSize(22);
    document.text('PLM Ressource', 16, 18);
    document.setFontSize(10);
    document.text('FACTURE / BON DE COMMANDE', 16, 27);
    document.setTextColor(30, 41, 59);
    document.setFontSize(11);
    document.text(`Numero : ${orderNumber}`, 16, 52);
    document.text(`Date : ${date}`, 16, 59);
    document.setFontSize(13);
    document.text('Facturee a', 16, 75);
    document.setFontSize(10);
    document.text(form.customer_name, 16, 83);
    document.text(form.customer_email, 16, 89);
    if (form.customer_phone) document.text(form.customer_phone, 16, 95);
    if (form.customer_address) document.text(form.customer_address, 16, 101);

    let y = 120;
    document.setFillColor(241, 245, 249);
    document.rect(16, y - 7, 178, 10, 'F');
    document.setFontSize(9);
    document.setFont('helvetica', 'bold');
    document.text('PRESTATION', 19, y);
    document.text('QTE', 140, y);
    document.text('MONTANT (TND)', 158, y);
    document.setFont('helvetica', 'normal');
    completedItems.forEach((item) => {
      y += 12;
      document.text(item.service.name, 19, y);
      document.text(String(item.quantity), 141, y);
      document.text(formatTND(item.service.price_tnd * item.quantity), 164, y, { align: 'right' });
      document.setDrawColor(226, 232, 240);
      document.line(16, y + 5, 194, y + 5);
    });
    y += 18;
    document.setFillColor(240, 253, 250);
    document.roundedRect(112, y - 10, 78, 17, 2, 2, 'F');
    document.setTextColor(15, 118, 110);
    document.setFont('helvetica', 'bold');
    document.setFontSize(10);
    document.text('TOTAL A PAYER', 116, y - 2);
    document.setFontSize(12);
    document.text(`${completedTotal.toFixed(3)} TND`, 186, y + 3, { align: 'right' });
    document.setFont('helvetica', 'normal');
    document.setFontSize(9);
    document.setTextColor(100, 116, 139);
    const note = 'Statut : en attente de paiement. Conservez ce document et utilisez le numero de commande pour tout echange avec notre equipe.';
    document.text(document.splitTextToSize(note, 178), 16, y + 17);
    document.text('PLM Ressource - Tunis, Tunisie - contact@plmressource.tn', 16, 282);
    document.save(`Facture-${orderNumber}.pdf`);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('processing');
    setErrorMsg('');

    try {
      const orderNum = `PLM-${Date.now().toString().slice(-8)}`;

      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: orderNum,
          customer_name: form.customer_name,
          customer_email: form.customer_email,
          customer_phone: form.customer_phone,
          customer_address: form.customer_address,
          total_tnd: totalPrice,
          status: 'pending',
          payment_method: 'card',
          notes: form.notes,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = items.map((item) => ({
        order_id: orderData.id,
        service_id: item.service.id,
        service_name: item.service.name,
        price_tnd: item.service.price_tnd,
        quantity: item.quantity,
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
      if (itemsError) throw itemsError;

      setOrderNumber(orderNum);
      setCompletedItems(items);
      setCompletedTotal(totalPrice);
      clearCart();

      void supabase.functions.invoke('send-order-confirmation', {
        body: { orderNumber: orderNum, customerName: form.customer_name, customerEmail: form.customer_email, total: totalPrice },
      });

      if (!paymeeEnabled) {
        setStatus('success');
        return;
      }

      const { data: payment, error: paymentError } = await supabase.functions.invoke('create-paymee-payment', {
        body: {
          orderId: orderData.id,
          orderNumber: orderNum,
          amount: totalPrice,
          customerName: form.customer_name,
          customerEmail: form.customer_email,
          customerPhone: form.customer_phone,
        },
      });
      if (paymentError || !payment?.payment_url) throw new Error(paymentError?.message || 'Impossible de créer la session Paymee.');
      window.location.assign(payment.payment_url);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Une erreur est survenue lors de la commande.');
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
        <div className="bg-white rounded-3xl max-w-md w-full p-8 text-center shadow-2xl">
          <div className="w-20 h-20 rounded-full bg-teal-50 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12 text-teal-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Commande enregistrée !</h2>
          <p className="text-slate-500 mb-2">
            Merci pour votre confiance. Votre commande a été enregistrée avec succès.
          </p>
          <p className="text-sm text-slate-400 mb-6">
            Notre équipe vous contactera dans les 48h pour finaliser le paiement et démarrer la prestation.
          </p>
          <div className="p-4 rounded-xl bg-slate-50 mb-6">
            <span className="text-xs text-slate-400">Numéro de commande</span>
            <div className="text-lg font-bold text-teal-600">{orderNumber}</div>
          </div>
          <div className="mb-6 rounded-xl border border-slate-100 p-4 text-left">
            <div className="flex items-center gap-2 font-bold text-slate-800"><FileText className="h-5 w-5 text-teal-600" />Facture prête</div>
            <p className="mt-1 text-sm text-slate-500">Elle contient vos coordonnées, les prestations choisies et le total de la commande.</p>
          </div>
          <button
            onClick={downloadInvoice}
            className="mb-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-teal-200 bg-teal-50 px-6 py-3.5 font-semibold text-teal-700 transition hover:bg-teal-100"
          >
            <Download className="h-5 w-5" />Télécharger la facture PDF
          </button>
          <button
            onClick={onClose}
            className="w-full px-6 py-3.5 bg-teal-500 hover:bg-teal-400 text-white font-semibold rounded-xl transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
        <div className="bg-white rounded-3xl max-w-md w-full p-8 text-center shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-5">
            <X className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-3">Une erreur est survenue</h2>
          <p className="text-sm text-slate-500 mb-6">{errorMsg}</p>
          <button
            onClick={() => setStatus('form')}
            className="w-full px-6 py-3.5 bg-teal-500 hover:bg-teal-400 text-white font-semibold rounded-xl transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 sticky top-0 bg-white rounded-t-3xl z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
            <h2 className="font-bold text-lg text-slate-900">Paiement</h2>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Lock className="w-3.5 h-3.5" />
            <span>Paiement sécurisé</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Vos informations</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Nom complet *</label>
                <input
                  type="text"
                  required
                  value={form.customer_name}
                  onChange={(e) => handleChange('customer_name', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all text-sm"
                  placeholder="Mohamed Ben Ali"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Email *</label>
                <input
                  type="email"
                  required
                  value={form.customer_email}
                  onChange={(e) => handleChange('customer_email', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all text-sm"
                  placeholder="contact@entreprise.tn"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Téléphone</label>
                <input
                  type="tel"
                  required
                  value={form.customer_phone}
                  onChange={(e) => handleChange('customer_phone', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all text-sm"
                  placeholder="+216 XX XXX XXX"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Adresse</label>
                <input
                  type="text"
                  value={form.customer_address}
                  onChange={(e) => handleChange('customer_address', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all text-sm"
                  placeholder="Rue, ville, Tunisie"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-4">{paymeeEnabled ? 'Paiement par carte' : 'Mode test'}</h3>
            <div className="flex gap-3 rounded-2xl border border-teal-100 bg-teal-50 p-4">
              <CreditCard className="mt-0.5 h-6 w-6 shrink-0 text-teal-600" />
              <div>{paymeeEnabled ? <><p className="font-semibold text-slate-800">Paiement sécurisé via Paymee</p><p className="mt-1 text-sm text-slate-600">Après confirmation, vous serez redirigé vers la passerelle Paymee pour saisir votre carte tunisienne, internationale ou e-dinar.</p></> : <><p className="font-semibold text-slate-800">Paiement simulé</p><p className="mt-1 text-sm text-slate-600">Aucune carte ni compte n’est nécessaire. Une commande de test et sa facture PDF seront générées.</p></>}</div>
            </div>
            {!paymeeEnabled && <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 space-y-4">
              <div className="flex items-center justify-between gap-3"><p className="text-sm font-semibold text-slate-700">Carte de test</p><button type="button" onClick={() => setForm((previous) => ({ ...previous, card_number: '4242 4242 4242 4242', card_expiry: '12/30', card_cvc: '123' }))} className="text-xs font-bold text-teal-700 hover:text-teal-900">Utiliser une carte test</button></div>
              <div><label className="block text-xs font-medium text-slate-500 mb-1.5">Numéro de carte *</label><div className="relative"><input required={!paymeeEnabled} maxLength={19} value={form.card_number} onChange={(event) => handleChange('card_number', event.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 pr-11 font-mono text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100" placeholder="4242 4242 4242 4242" /><CreditCard className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-300" /></div></div>
              <div className="grid grid-cols-2 gap-4"><div><label className="block text-xs font-medium text-slate-500 mb-1.5">Expiration *</label><input required={!paymeeEnabled} maxLength={5} value={form.card_expiry} onChange={(event) => handleChange('card_expiry', event.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 font-mono text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100" placeholder="12/30" /></div><div><label className="block text-xs font-medium text-slate-500 mb-1.5">CVC *</label><input required={!paymeeEnabled} maxLength={4} value={form.card_cvc} onChange={(event) => handleChange('card_cvc', event.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 font-mono text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100" placeholder="123" /></div></div>
            </div>}
            <p className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              {paymeeEnabled ? 'Les informations de carte ne transitent jamais par PLM Ressource.' : 'Utilisez seulement les valeurs de test : elles ne sont jamais envoyées ni enregistrées.'}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Récapitulatif</h3>
            <div className="space-y-2 mb-4">
              {items.map((item) => (
                <div key={item.service.id} className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">
                    {item.service.name} <span className="text-slate-400">× {item.quantity}</span>
                  </span>
                  <span className="font-semibold text-slate-700">
                    {formatTND(item.service.price_tnd * item.quantity)} TND
                  </span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <span className="font-bold text-slate-900">Total à payer</span>
              <span className="text-2xl font-bold text-teal-600">
                {formatTND(totalPrice)} <span className="text-base font-medium text-slate-500">TND</span>
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={status === 'processing'}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-teal-500 hover:bg-teal-400 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all hover:scale-[1.01] shadow-lg shadow-teal-500/20"
          >
            {status === 'processing' ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Traitement en cours...
              </>
            ) : (
              <>
                <Lock className="w-5 h-5" />
                {paymeeEnabled ? `Continuer vers Paymee - ${formatTND(totalPrice)} TND` : `Valider la commande test - ${formatTND(totalPrice)} TND`}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
