"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "Est-ce que VitAIe remplace un vrai CV ?",
    reponse:
      "Non, VitAIe optimise ton CV existant. Tu gardes le contrôle total du contenu — l'IA reformule et restructure pour maximiser ton impact auprès des recruteurs et des filtres ATS. Tu valides chaque modification avant de télécharger.",
  },
  {
    question: "Comment fonctionne le score ATS ?",
    reponse:
      "Notre IA analyse les mots-clés de l'offre d'emploi et les compare à ceux présents dans ton CV. Elle calcule un score de 0 à 100% basé sur : les mots-clés (40%), l'expérience (30%), la formation (20%) et les soft skills (10%). Tu reçois la liste des mots-clés manquants à ajouter.",
  },
  {
    question: "Mes données sont-elles sécurisées ?",
    reponse:
      "Oui. Tes CV et lettres sont chiffrés en transit (HTTPS) et au repos dans notre base de données Supabase hébergée en Europe. Nous ne vendons jamais tes données à des tiers. Tu peux supprimer ton compte et toutes tes données à tout moment.",
  },
  {
    question: "Puis-je annuler mon abonnement ?",
    reponse:
      "Oui, à tout moment depuis ton tableau de bord. Ton abonnement reste actif jusqu'à la fin de la période payée, puis tu reviens automatiquement sur le plan gratuit. Aucun frais caché, aucune pénalité.",
  },
  {
    question: "VitAIe fonctionne pour tous les secteurs ?",
    reponse:
      "Oui ! Notre IA (Claude par Anthropic) détecte automatiquement le secteur d'activité de l'offre et adapte le vocabulaire, le ton et les mots-clés en conséquence. Tech, finance, marketing, santé, industrie — VitAIe s'adapte à chaque domaine.",
  },
];

export function FAQ() {
  const [ouvert, setOuvert] = useState<number | null>(null);

  return (
    <section id="faq" className="py-24 px-6 bg-white">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-sm font-semibold text-[#5B2D8E] uppercase tracking-wider mb-3">
            FAQ
          </p>
          <h2 className="text-3xl font-bold text-[#1C1C2E]">
            Questions fréquentes
          </h2>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="border border-gray-100 rounded-2xl overflow-hidden"
            >
              <button
                onClick={() => setOuvert(ouvert === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition"
              >
                <span className="font-medium text-[#1C1C2E] text-sm pr-4">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${
                    ouvert === i ? "rotate-180" : ""
                  }`}
                />
              </button>

              <AnimatePresence>
                {ouvert === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <p className="px-5 pb-5 text-sm text-gray-500 leading-relaxed">
                      {faq.reponse}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
