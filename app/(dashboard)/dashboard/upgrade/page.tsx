"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Check, Zap, Shield } from "lucide-react";

const plans = [
  {
    id: "pro",
    name: "PRO",
    price: "12€",
    features: ["CV et lettres illimités", "Score ATS avancé", "Export PDF & DOCX", "3 templates premium", "Relance email IA"],
  },
  {
    id: "boost",
    name: "BOOST",
    price: "29€",
    features: ["Tout le plan PRO", "Simulation d'entretien IA", "Feedback personnalisé", "Suivi candidatures Kanban", "Support prioritaire"],
  },
];

export default function UpgradePage() {
  const [loading, setLoading] = useState<string | null>(null);

  async function checkout(planId: string) {
    setLoading(planId);
    try {
      const res = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Erreur Stripe");
        return;
      }
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      toast.error("Erreur lors de la redirection vers Stripe");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <div className="w-12 h-12 bg-[#F3EDFB] rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Zap className="w-6 h-6 text-[#5B2D8E]" />
        </div>
        <h2 className="text-2xl font-bold text-[#1C1C2E] mb-2">Passez à la vitesse supérieure</h2>
        <p className="text-gray-500 text-sm">Débloquez toutes les fonctionnalités pour maximiser vos candidatures.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {plans.map((plan) => (
          <Card key={plan.id} padding="md" className={plan.id === "pro" ? "border-2 border-[#5B2D8E]" : ""}>
            {plan.id === "pro" && (
              <div className="text-xs font-semibold text-[#5B2D8E] uppercase tracking-wide mb-3">⭐ Recommandé</div>
            )}
            <div className="mb-4">
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">{plan.name}</p>
              <p className="text-3xl font-bold text-[#1C1C2E] mt-1">{plan.price}<span className="text-sm text-gray-400 font-normal">/mois</span></p>
            </div>
            <ul className="space-y-2 mb-5">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-[#1AA8A8] shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Button
              onClick={() => checkout(plan.id)}
              loading={loading === plan.id}
              variant={plan.id === "pro" ? "primary" : "teal"}
              className="w-full"
            >
              Choisir {plan.name}
            </Button>
          </Card>
        ))}
      </div>

      <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
        <Shield className="w-3.5 h-3.5" />
        Paiement sécurisé par Stripe · Annulable à tout moment
      </div>
    </div>
  );
}
