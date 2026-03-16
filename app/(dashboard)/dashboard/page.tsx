"use client";

import { useEffect } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { StatCards } from "@/components/dashboard/StatCards";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Plus, FileText, Mail, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";

// Données d'exemple (à remplacer par Supabase)
const activiteRecente = [
  {
    id: "1",
    type: "cv",
    titre: "CV optimisé — Développeur React",
    date: new Date("2026-03-03"),
    score: 78,
  },
  {
    id: "2",
    type: "lettre",
    titre: "Lettre — Poste Product Manager chez Doctolib",
    date: new Date("2026-03-02"),
    score: null,
  },
  {
    id: "3",
    type: "cv",
    titre: "CV optimisé — UX Designer",
    date: new Date("2026-02-28"),
    score: 85,
  },
];

export default function DashboardPage() {
  // Sync plan si retour de paiement Stripe
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("upgraded") === "true") {
      fetch("/api/stripe/sync-plan", { method: "POST" })
        .then((r) => r.json())
        .then((d) => {
          if (d.plan && d.plan !== "free") {
            toast.success(`Plan ${d.plan.toUpperCase()} activé ! 🎉`);
          }
        })
        .catch(() => {});
    }
  }, []);

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Entête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#1C1C2E]">Bonjour 👋</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Prêt à décrocher ton prochain poste ?
          </p>
        </div>
        <Link href="/dashboard/cv">
          <Button>
            <Plus className="w-4 h-4" />
            Nouvelle candidature
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <StatCards />

      {/* Raccourcis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card padding="md" hover className="group">
          <Link href="/dashboard/cv" className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#F3EDFB] flex items-center justify-center">
              <FileText className="w-5 h-5 text-[#5B2D8E]" />
            </div>
            <div>
              <p className="font-semibold text-[#1C1C2E] group-hover:text-[#5B2D8E] transition">
                Optimiser mon CV
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                Colle ton CV + une offre → l'IA le reformule et le score ATS
              </p>
            </div>
          </Link>
        </Card>

        <Card padding="md" hover className="group">
          <Link href="/dashboard/lettres" className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#E6F7F7] flex items-center justify-center">
              <Mail className="w-5 h-5 text-[#1AA8A8]" />
            </div>
            <div>
              <p className="font-semibold text-[#1C1C2E] group-hover:text-[#1AA8A8] transition">
                Générer une lettre
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                Lettre personnalisée en 30 secondes, 4 tons disponibles
              </p>
            </div>
          </Link>
        </Card>
      </div>

      {/* Activité récente */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-400" />
          Activité récente
        </h3>
        <Card padding="sm">
          <div className="divide-y divide-gray-50">
            {activiteRecente.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-3 px-3">
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${item.type === "cv" ? "bg-[#F3EDFB]" : "bg-[#E6F7F7]"}`}>
                    {item.type === "cv" ? (
                      <FileText className="w-3.5 h-3.5 text-[#5B2D8E]" />
                    ) : (
                      <Mail className="w-3.5 h-3.5 text-[#1AA8A8]" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-800">{item.titre}</p>
                    <p className="text-xs text-gray-400">{formatDate(item.date)}</p>
                  </div>
                </div>
                {item.score !== null && (
                  <Badge variant={item.score >= 75 ? "green" : item.score >= 50 ? "orange" : "red"}>
                    ATS {item.score}%
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
