import { Target, Eye, Award, Users, Briefcase, TrendingUp } from 'lucide-react';

export default function About() {
  const stats = [
    { icon: Briefcase, value: '500+', label: 'Projets réalisés' },
    { icon: Users, value: '50+', label: 'Experts qualifiés' },
    { icon: TrendingUp, value: '98%', label: 'Clients satisfaits' },
    { icon: Award, value: '10+', label: "Années d'expérience" },
  ];

  return (
    <section id="about" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="inline-block px-4 py-1.5 rounded-full bg-teal-50 text-teal-700 text-sm font-semibold mb-4">
              À propos de nous
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6">
              PLM Ressource, votre partenaire de confiance
            </h2>
            <p className="text-slate-600 leading-relaxed mb-6">
              Fondée en Tunisie, PLM Ressource est une entreprise de services professionnels
              dédiée à l''accompagnement des entreprises dans leur croissance et leur transformation.
              Nous offrons une gamme complète de services allant du conseil stratégique au
              développement technologique, en passant par le marketing, la finance et les
              ressources humaines.
            </p>
            <p className="text-slate-600 leading-relaxed mb-8">
              Notre équipe d'experts combine expérience locale et standards internationaux
              pour vous offrir des solutions adaptées au marché tunisien. Nous nous engageons
              sur la qualité, les délais et la satisfaction de nos clients.
            </p>

            <div className="space-y-5">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
                  <Target className="w-6 h-6 text-teal-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">Notre Mission</h3>
                  <p className="text-sm text-slate-500">
                    Fournir des solutions professionnelles de haute qualité pour accélérer
                    la croissance des entreprises tunisiennes.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
                  <Eye className="w-6 h-6 text-teal-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">Notre Vision</h3>
                  <p className="text-sm text-slate-500">
                    Devenir le partenaire de référence pour les services professionnels
                    en Tunisie et en Afrique du Nord.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="grid grid-cols-2 gap-4">
              {stats.map(({ icon: Icon, value, label }) => (
                <div
                  key={label}
                  className="group p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-white border border-slate-100 hover:border-teal-200 hover:shadow-lg transition-all"
                >
                  <div className="w-12 h-12 rounded-xl bg-teal-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-slate-900 mb-1">{value}</div>
                  <div className="text-sm text-slate-500">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
