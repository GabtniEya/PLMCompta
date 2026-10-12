import { Search, ShoppingCart, CreditCard, Rocket } from 'lucide-react';

export default function Process() {
  const steps = [
    {
      icon: Search,
      title: '1. Choisissez vos services',
      description: 'Parcourez notre catalogue et sélectionnez les services adaptés à vos besoins.',
    },
    {
      icon: ShoppingCart,
      title: '2. Ajoutez au panier',
      description: 'Ajoutez plusieurs services à votre panier et ajustez les quantités.',
    },
    {
      icon: CreditCard,
      title: '3. Payez en ligne',
      description: 'Réglez vos achats en dinars tunisiens par carte bancaire en toute sécurité.',
    },
    {
      icon: Rocket,
      title: '4. Démarrez votre projet',
      description: 'Notre équipe vous contacte pour démarrer la prestation dans les 48h.',
    },
  ];

  return (
    <section id="process" className="py-24 bg-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-400 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-teal-500/15 text-teal-300 text-sm font-semibold mb-4">
            Comment ça marche
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Un processus simple en 4 étapes
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            De la sélection à la réalisation, nous rendons l''achat de services professionnels
            aussi simple que possible.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map(({ icon: Icon, title, description }, i) => (
            <div key={i} className="relative">
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all hover:-translate-y-1 duration-300 h-full">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center mb-5 shadow-lg shadow-teal-500/20">
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
              </div>
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-px bg-gradient-to-r from-teal-500/50 to-transparent" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
