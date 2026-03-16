"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

const temoignages = [
  {
    nom: "Lucas Bertin",
    poste: "Développeur Frontend — décroché chez Doctolib",
    avatar: "LB",
    couleur: "#5B2D8E",
    note: 5,
    texte:
      "J'envoyais des candidatures depuis 3 semaines sans réponse. Avec VitAIe, j'ai reformulé mon CV et générée une lettre en 2 minutes. J'ai eu un entretien chez Doctolib 4 jours après. Bluffant.",
  },
  {
    nom: "Camille Moreau",
    poste: "Chargée de Marketing — embauchée chez Sézane",
    avatar: "CM",
    couleur: "#1AA8A8",
    note: 5,
    texte:
      "Le score ATS m'a vraiment aidé à comprendre pourquoi mes candidatures ne passaient pas. J'avais des mots-clés manquants évidents. En 30 minutes, mon CV était optimisé et j'ai eu des retours beaucoup plus rapides.",
  },
  {
    nom: "Antoine Fabre",
    poste: "Data Analyst — en poste chez BNP Paribas",
    avatar: "AF",
    couleur: "#5B2D8E",
    note: 5,
    texte:
      "La simulation d'entretien est incroyable. Je me suis entraîné sur les questions générées par VitAIe la veille de mon entretien chez BNP. Le recruteur m'a félicité pour la qualité de mes réponses. Merci VitAIe !",
  },
];

export function Testimonials() {
  return (
    <section className="py-24 px-6 bg-[#F5F5FA]">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-sm font-semibold text-[#5B2D8E] uppercase tracking-wider mb-3">
            Témoignages
          </p>
          <h2 className="text-3xl font-bold text-[#1C1C2E] mb-4">
            Ils ont décroché leur poste grâce à VitAIe
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {temoignages.map((t, i) => (
            <motion.div
              key={t.nom}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-card"
            >
              {/* Étoiles */}
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.note }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                ))}
              </div>

              <p className="text-sm text-gray-600 leading-relaxed mb-6">
                &quot;{t.texte}&quot;
              </p>

              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                  style={{ backgroundColor: t.couleur }}
                >
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#1C1C2E]">{t.nom}</p>
                  <p className="text-xs text-gray-500">{t.poste}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
