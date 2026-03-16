"use client";

import { motion } from "framer-motion";
import {
  FileText,
  BarChart3,
  LayoutTemplate,
  MessageSquare,
  Target,
  Mail,
} from "lucide-react";

const features = [
  {
    icon: Mail,
    title: "Lettre de motivation personnalisée",
    description:
      "L'IA rédige une lettre unique, adaptée à l'offre et à ton profil, avec le bon ton et les bons mots-clés.",
    color: "#5B2D8E",
    bg: "#F3EDFB",
  },
  {
    icon: FileText,
    title: "CV reformulé & optimisé ATS",
    description:
      "Ton CV est restructuré et enrichi avec les mots-clés de l'offre pour passer les filtres des RH.",
    color: "#1AA8A8",
    bg: "#E6F7F7",
  },
  {
    icon: BarChart3,
    title: "Score de compatibilité ATS",
    description:
      "Un score de 0 à 100% avec la liste des mots-clés présents et manquants pour améliorer ton CV.",
    color: "#5B2D8E",
    bg: "#F3EDFB",
  },
  {
    icon: LayoutTemplate,
    title: "3 templates professionnels",
    description:
      "Moderne, Classique ou Minimaliste — choisis le design qui correspond à ton secteur.",
    color: "#1AA8A8",
    bg: "#E6F7F7",
  },
  {
    icon: MessageSquare,
    title: "Simulation d'entretien IA",
    description:
      "Prépare-toi avec 10 questions générées par l'IA et reçois un feedback détaillé sur tes réponses.",
    color: "#5B2D8E",
    bg: "#F3EDFB",
  },
  {
    icon: Target,
    title: "Suivi de candidatures",
    description:
      "Un tableau Kanban pour suivre tes candidatures de l'envoi à l'offre, avec rappels automatiques.",
    color: "#1AA8A8",
    bg: "#E6F7F7",
  },
];

export function Features() {
  return (
    <section id="fonctionnalites" className="py-24 px-6 bg-[#F5F5FA]">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-sm font-semibold text-[#5B2D8E] uppercase tracking-wider mb-3">
            Fonctionnalités
          </p>
          <h2 className="text-3xl font-bold text-[#1C1C2E] mb-4">
            Tout ce dont tu as besoin pour décrocher le poste
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            VitAIe combine les meilleurs outils RH avec l'IA pour maximiser tes
            chances à chaque étape du processus de recrutement.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ backgroundColor: feature.bg }}
              >
                <feature.icon
                  className="w-5 h-5"
                  style={{ color: feature.color }}
                />
              </div>
              <h3 className="font-semibold text-[#1C1C2E] mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
