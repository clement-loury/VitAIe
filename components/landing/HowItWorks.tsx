"use client";

import { motion } from "framer-motion";
import { ClipboardPaste, Sparkles, Download } from "lucide-react";

const etapes = [
  {
    number: "01",
    icon: ClipboardPaste,
    title: "Colle ton CV + l'offre",
    description:
      "Copie-colle le texte de ton CV actuel et l'offre d'emploi qui t'intéresse. Ça prend 30 secondes.",
    color: "bg-[#5B2D8E]",
    light: "bg-[#F3EDFB]",
  },
  {
    number: "02",
    icon: Sparkles,
    title: "VitAIe analyse & optimise",
    description:
      "Notre IA (Claude) analyse les deux documents, identifie les mots-clés ATS et génère une lettre et un CV parfaits.",
    color: "bg-[#1AA8A8]",
    light: "bg-[#E6F7F7]",
  },
  {
    number: "03",
    icon: Download,
    title: "Télécharge & candidate",
    description:
      "Télécharge ton CV optimisé et ta lettre en PDF. Prêt à envoyer en un clic, avec un score de compatibilité.",
    color: "bg-[#5B2D8E]",
    light: "bg-[#F3EDFB]",
  },
];

export function HowItWorks() {
  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-sm font-semibold text-[#5B2D8E] uppercase tracking-wider mb-3">
            Comment ça marche
          </p>
          <h2 className="text-3xl font-bold text-[#1C1C2E]">
            Simple. Rapide. Efficace.
          </h2>
        </motion.div>

        <div className="relative">
          {/* Ligne de connexion */}
          <div className="hidden md:block absolute top-12 left-[calc(16.67%+2rem)] right-[calc(16.67%+2rem)] h-0.5 bg-gray-100 z-0" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {etapes.map((etape, i) => (
              <motion.div
                key={etape.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative text-center"
              >
                {/* Icône */}
                <div className={`w-16 h-16 ${etape.light} rounded-2xl flex items-center justify-center mx-auto mb-5 relative z-10`}>
                  <etape.icon className="w-7 h-7" style={{ color: etape.color.includes("5B2D8E") ? "#5B2D8E" : "#1AA8A8" }} />
                  <span className={`absolute -top-2 -right-2 w-6 h-6 ${etape.color} rounded-full text-white text-xs font-bold flex items-center justify-center`}>
                    {i + 1}
                  </span>
                </div>

                <h3 className="font-semibold text-[#1C1C2E] text-lg mb-2">
                  {etape.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {etape.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
