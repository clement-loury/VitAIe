"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useUser } from "@clerk/nextjs";

const stats = [
  { value: "2 400+", label: "candidats aidés" },
  { value: "30s", label: "pour générer" },
  { value: "94%", label: "taux de satisfaction" },
];

export function Hero() {
  const { isSignedIn } = useUser();

  return (
    <section className="pt-32 pb-20 px-6 bg-gradient-to-b from-white to-[#F5F5FA]">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Gauche — texte */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 bg-[#5B2D8E]/10 text-[#5B2D8E] px-3 py-1.5 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Propulsé par Claude AI
          </div>

          <h1 className="text-4xl lg:text-5xl font-bold text-[#1C1C2E] leading-tight mb-6">
            Ton CV.{" "}
            <span className="bg-gradient-to-r from-[#5B2D8E] to-[#1AA8A8] bg-clip-text text-transparent">
              Optimisé par l'IA.
            </span>{" "}
            En 30 secondes.
          </h1>

          <p className="text-lg text-gray-500 leading-relaxed mb-8">
            VitAIe analyse ton CV et l'offre d'emploi pour générer une lettre
            parfaite et un CV optimisé ATS — plus besoin de passer des heures à
            rédiger.
          </p>

          <div className="flex flex-wrap gap-3 mb-10">
            <Link href={isSignedIn ? "/dashboard" : "/sign-up"}>
              <Button size="lg">
                {isSignedIn ? "Mon Dashboard" : "Essayer gratuitement"}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="#fonctionnalites">
              <Button variant="secondary" size="lg">
                Voir une démo
              </Button>
            </Link>
          </div>

          {/* Preuves sociales */}
          <div className="flex flex-wrap gap-4">
            {["Sans CB requise", "1 CV + 1 lettre offerts", "Annulable à tout moment"].map((item) => (
              <div key={item} className="flex items-center gap-1.5 text-sm text-gray-500">
                <CheckCircle className="w-4 h-4 text-[#1AA8A8]" />
                {item}
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="flex gap-8 mt-10 pt-10 border-t border-gray-200">
            {stats.map((s) => (
              <div key={s.label}>
                <p className="text-2xl font-bold text-[#1C1C2E]">{s.value}</p>
                <p className="text-sm text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Droite — Mockup animé */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative"
          id="demo"
        >
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
            {/* Barre de titre */}
            <div className="bg-gray-50 border-b border-gray-100 px-4 py-3 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 mx-4 bg-gray-200 rounded-md h-5 text-xs text-gray-500 flex items-center px-3">
                vitaie.fr/dashboard
              </div>
            </div>

            {/* Contenu mockup */}
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-400 mb-1.5">Ton CV</p>
                  <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-500 h-28 space-y-1.5">
                    <div className="h-2 bg-gray-200 rounded w-3/4" />
                    <div className="h-2 bg-gray-200 rounded w-full" />
                    <div className="h-2 bg-gray-200 rounded w-2/3" />
                    <div className="h-2 bg-gray-200 rounded w-5/6" />
                    <div className="h-2 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1.5">Offre d'emploi</p>
                  <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-500 h-28 space-y-1.5">
                    <div className="h-2 bg-gray-200 rounded w-full" />
                    <div className="h-2 bg-gray-200 rounded w-4/5" />
                    <div className="h-2 bg-gray-200 rounded w-3/4" />
                    <div className="h-2 bg-gray-200 rounded w-full" />
                    <div className="h-2 bg-gray-200 rounded w-2/3" />
                  </div>
                </div>
              </div>

              {/* Score ATS */}
              <div className="flex items-center gap-4 bg-[#F3EDFB] rounded-xl p-3">
                <div className="relative w-12 h-12">
                  <svg viewBox="0 0 36 36" className="w-12 h-12 -rotate-90">
                    <circle cx="18" cy="18" r="15" fill="none" stroke="#E7DBFA" strokeWidth="3" />
                    <circle cx="18" cy="18" r="15" fill="none" stroke="#5B2D8E" strokeWidth="3"
                      strokeDasharray="78 100" strokeLinecap="round" />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-[#5B2D8E]">
                    78%
                  </span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#5B2D8E]">Score ATS</p>
                  <p className="text-xs text-gray-500">3 mots-clés à ajouter</p>
                </div>
              </div>

              {/* Lettre générée */}
              <div>
                <p className="text-xs text-gray-400 mb-1.5">Lettre générée ✨</p>
                <div className="bg-green-50 border border-green-100 rounded-xl p-3 space-y-1.5">
                  <div className="h-2 bg-green-200 rounded w-full" />
                  <div className="h-2 bg-green-200 rounded w-5/6" />
                  <div className="h-2 bg-green-200 rounded w-4/5" />
                  <div className="h-2 bg-green-200 rounded w-full" />
                  <div className="h-2 bg-green-200 rounded w-3/4" />
                </div>
              </div>
            </div>
          </div>

          {/* Badge flottant */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-4 -right-4 bg-[#1AA8A8] text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg"
          >
            ✨ Généré en 28s
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
