"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Zap } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useUser } from "@clerk/nextjs";


const plans = [
  {
    name: "FREE",
    price: "0€",
    period: "/mois",
    description: "Pour tester et décrocher ton premier entretien",
    features: [
      "1 CV optimisé / mois",
      "1 lettre de motivation / mois",
      "Templates standards",
      "Score ATS basique",
    ],
    cta: "Commencer gratuitement",
    href: "/sign-up",
    popular: false,
    variant: "secondary" as const,
  },
  {
    name: "PRO",
    price: "12€",
    period: "/mois",
    description: "Pour les chercheurs d'emploi sérieux",
    features: [
      "CV et lettres illimités",
      "Score ATS avancé + mots-clés",
      "Export PDF & DOCX",
      "3 templates premium",
      "Relance email IA",
      "Historique complet",
    ],
    cta: "Passer en PRO",
    href: "/sign-up?plan=pro",
    popular: true,
    variant: "primary" as const,
  },
  {
    name: "BOOST",
    price: "29€",
    period: "/mois",
    description: "Pour maximiser chaque candidature",
    features: [
      "Tout le plan PRO",
      "Simulation d'entretien IA",
      "Feedback personnalisé",
      "Suivi candidatures Kanban",
      "Coaching personnalisé",
      "Support prioritaire",
    ],
    cta: "Choisir BOOST",
    href: "/sign-up?plan=boost",
    popular: false,
    variant: "teal" as const,
  },
];

export function Pricing() {
  const { isSignedIn } = useUser();

  // Si connecté, rediriger vers upgrade ; sinon vers sign-up
  function getHref(plan: typeof plans[0]) {
    if (isSignedIn) {
      return plan.name === "FREE" ? "/dashboard" : "/dashboard/upgrade";
    }
    return plan.href;
  }

  return (
    <section id="tarifs" className="py-24 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-sm font-semibold text-[#5B2D8E] uppercase tracking-wider mb-3">
            Tarifs
          </p>
          <h2 className="text-3xl font-bold text-[#1C1C2E] mb-4">
            Simple et transparent
          </h2>
          <p className="text-gray-500">
            Commence gratuitement. Passe à la vitesse supérieure quand tu es
            prêt.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`relative rounded-2xl p-6 border-2 flex flex-col ${
                plan.popular
                  ? "border-[#5B2D8E] shadow-xl shadow-[#5B2D8E]/10"
                  : "border-gray-100 bg-[#F5F5FA]"
              } ${plan.popular ? "bg-white" : ""}`}
            >
              {/* Badge populaire */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-[#5B2D8E] text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                    <Zap className="w-3 h-3" /> Populaire
                  </span>
                </div>
              )}

              <div className="mb-6">
                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">
                  {plan.name}
                </p>
                <div className="flex items-end gap-1 mb-2">
                  <span className="text-4xl font-bold text-[#1C1C2E]">
                    {plan.price}
                  </span>
                  <span className="text-gray-400 text-sm pb-1">
                    {plan.period}
                  </span>
                </div>
                <p className="text-sm text-gray-500">{plan.description}</p>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2 text-sm text-gray-700"
                  >
                    <Check className="w-4 h-4 text-[#1AA8A8] mt-0.5 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Link href={getHref(plan)}>
                <Button variant={plan.variant} className="w-full">
                  {plan.cta}
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>

        <p className="text-center text-sm text-gray-400 mt-8">
          Annulable à tout moment · Sans engagement · Paiement sécurisé par Stripe
        </p>
      </div>
    </section>
  );
}
