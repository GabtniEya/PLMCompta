import { Building2, Mail, Phone, MapPin, Linkedin, Facebook } from 'lucide-react';

interface FooterProps {
  onNavigate: (section: string) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  return (
    <footer id="contact" className="bg-slate-950 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-teal-600 to-teal-700 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="block font-bold text-lg text-white">PLM Ressource</span>
                <span className="block text-xs text-teal-400">Services Professionnels</span>
              </div>
            </div>
            <p className="text-sm leading-relaxed mb-5">
              Votre partenaire de croissance en Tunisie. Des services professionnels
              sur mesure pour propulser votre entreprise.
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-teal-500 flex items-center justify-center transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-teal-500 flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-5">Navigation</h3>
            <ul className="space-y-3 text-sm">
              {[
                { label: 'Accueil', id: 'hero' },
                { label: 'Services', id: 'services' },
                { label: 'À propos', id: 'about' },
                { label: 'Processus', id: 'process' },
              ].map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => onNavigate(item.id)}
                    className="hover:text-teal-400 transition-colors"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-5">Nos services</h3>
            <ul className="space-y-3 text-sm">
              <li>Conseil Stratégique</li>
              <li>Développement Logiciel</li>
              <li>Marketing Digital</li>
              <li>Comptabilité & Finance</li>
              <li>Ressources Humaines</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-5">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-teal-400 mt-0.5 shrink-0" />
                <span>Tunis, Tunisie</span>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-teal-400 mt-0.5 shrink-0" />
                <span>+216 71 000 000</span>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-teal-400 mt-0.5 shrink-0" />
                <span>contact@plmressource.tn</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm">
            © {new Date().getFullYear()} PLM Ressource. Tous droits réservés.
          </p>
          <p className="text-sm">Paiement sécurisé en dinars tunisiens (TND)</p>
        </div>
      </div>
    </footer>
  );
}
