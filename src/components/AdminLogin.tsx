import { FormEvent, useState } from 'react';
import { Building2, LockKeyhole, Mail, ShieldCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    const result = isSignup
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (result.error) {
      setMessage(result.error.message);
    } else if (isSignup && !result.data.session) {
      setMessage('Compte créé. Vérifiez votre boîte e-mail pour confirmer votre adresse avant de vous connecter.');
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 sm:flex sm:items-center sm:justify-center">
      <section className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="bg-gradient-to-br from-teal-600 to-slate-900 p-8 text-white">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15"><Building2 className="h-6 w-6" /></div>
          <p className="mt-6 text-sm font-bold uppercase tracking-[0.18em] text-teal-200">PLM Ressource</p>
          <h1 className="mt-2 text-3xl font-bold">Administration</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-200">Accédez à la gestion des clients, factures et paiements.</p>
        </div>
        <form onSubmit={submit} className="space-y-5 p-8">
          <div>
            <label className="text-sm font-bold text-slate-700">Adresse e-mail</label>
            <div className="relative mt-2"><Mail className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-slate-400" /><input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-3 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100" placeholder="admin@entreprise.tn" /></div>
          </div>
          <div>
            <label className="text-sm font-bold text-slate-700">Mot de passe</label>
            <div className="relative mt-2"><LockKeyhole className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-slate-400" /><input required minLength={6} type="password" autoComplete={isSignup ? 'new-password' : 'current-password'} value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-3 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100" placeholder="Minimum 6 caractères" /></div>
          </div>
          {message && <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">{message}</p>}
          <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-3 font-bold text-white transition hover:bg-teal-700 disabled:cursor-wait disabled:opacity-60"><ShieldCheck className="h-5 w-5" />{loading ? 'Chargement…' : isSignup ? 'Créer mon compte' : 'Se connecter'}</button>
          <button type="button" onClick={() => { setIsSignup(!isSignup); setMessage(''); }} className="w-full text-sm font-semibold text-teal-700 hover:text-teal-900">{isSignup ? 'J’ai déjà un compte' : 'Créer le premier compte administrateur'}</button>
          <a href="/" className="block text-center text-sm text-slate-500 hover:text-slate-800">Retour à la vitrine</a>
        </form>
      </section>
    </main>
  );
}
