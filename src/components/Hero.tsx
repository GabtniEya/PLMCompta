import { ArrowRight, Sparkles, ShieldCheck, Clock } from 'lucide-react';

interface HeroProps {
  onShopNow: () => void;
  onLearnMore: () => void;
}

export default function Hero({ onShopNow, onLearnMore }: HeroProps) {
  return (
    <section id="hero" className="relative min-h-screen flex items-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.pexels.com/photos/36765718/pexels-photo-36765718.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
          alt="PLM Ressource"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/75 to-slate-900/40" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500/15 border border-teal-400/30 backdrop-blur-sm mb-6">
            <Sparkles className="w-4 h-4 text-teal-300" />
            <span className="text-teal-200 text-sm font-medium">Votre partenaire de croissance en Tunisie</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] mb-6">
            Des services professionnels{' '}
            <span className="text-teal-400">sur mesure</span> pour votre entreprise
          </h1>

          <p className="text-lg text-slate-300 mb-8 leading-relaxed max-w-xl">
            PLM Ressource vous accompagne dans tous vos projets : conseil, technologie,
            marketing, finance et plus encore. Choisissez vos services et payez en ligne
            en toute sécurité.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <button
              onClick={onShopNow}
              className="group inline-flex items-center justify-center gap-2 px-7 py-4 bg-teal-500 hover:bg-teal-400 text-white font-semibold rounded-xl transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-teal-500/30"
            >
              Découvrir nos services
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={onLearnMore}
              className="inline-flex items-center justify-center gap-2 px-7 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl backdrop-blur-sm border border-white/20 transition-all"
            >
              En savoir plus
            </button>
          </div>

          <div className="flex flex-wrap gap-6">
            {[
              { icon: ShieldCheck, label: 'Paiement sécurisé' },
              { icon: Clock, label: 'Livraison rapide' },
              { icon: Sparkles, label: 'Experts certifiés' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-slate-300">
                <Icon className="w-5 h-5 text-teal-400" />
                <span className="text-sm font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent z-10" />
    </section>
  );
}
