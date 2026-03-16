"use client";

import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Skeleton, SkeletonText } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";
import type { TonLettre, LettreHistorique } from "@/types";
import {
  Sparkles,
  RefreshCw,
  Copy,
  Download,
  Clock,
  ChevronRight,
  Upload,
} from "lucide-react";
import { cn, compterMots, formatDate } from "@/lib/utils";

const tons: { id: TonLettre; label: string; desc: string; emoji: string }[] = [
  { id: "formel", label: "Formel", desc: "Grands groupes, secteurs traditionnels", emoji: "🎩" },
  { id: "dynamique", label: "Dynamique", desc: "PME, secteurs en croissance", emoji: "⚡" },
  { id: "startup", label: "Startup", desc: "Startups, scale-ups, tech", emoji: "🚀" },
  { id: "créatif", label: "Créatif", desc: "Agences, design, médias", emoji: "🎨" },
];

export default function LettresPage() {
  const [cv, setCv] = useState("");
  const [offre, setOffre] = useState("");
  const cvFileRef = useRef<HTMLInputElement>(null);

  async function importerCV(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/extract-text", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCv(data.texte);
      toast.success("CV importé !");
    } catch (err) {
      toast.error((err as Error).message || "Erreur lors de l'import");
    }
  }
  const [ton, setTon] = useState<TonLettre>("formel");
  const [inclureAccroche, setInclureAccroche] = useState(true);
  const [chargement, setChargement] = useState(false);
  const [lettre, setLettre] = useState("");
  const [historique, setHistorique] = useState<LettreHistorique[]>([]);

  // Charger l'historique depuis Supabase au montage
  useEffect(() => {
    fetch("/api/lettres")
      .then((r) => r.json())
      .then((data) => {
        if (data.lettres) {
          setHistorique(data.lettres.map((l: Record<string, unknown>) => ({
            id: l.id as string,
            offre: l.offre as string,
            lettre: l.lettre_generee as string,
            ton: l.ton as TonLettre,
            createdAt: l.created_at as string,
          })));
        }
      })
      .catch(() => {});
  }, []);

  async function generer() {
    if (!cv.trim() || !offre.trim()) {
      toast.error("Remplis le CV et l'offre d'emploi");
      return;
    }

    setChargement(true);

    try {
      const res = await fetch("/api/generate/lettre", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cv, offre, ton, inclureAccroche }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setLettre(data.lettre);
      toast.success("Lettre générée !");

      // Recharger l'historique depuis Supabase
      fetch("/api/lettres")
        .then((r) => r.json())
        .then((d) => {
          if (d.lettres) {
            setHistorique(d.lettres.map((l: Record<string, unknown>) => ({
              id: l.id as string,
              offre: l.offre as string,
              lettre: l.lettre_generee as string,
              ton: l.ton as TonLettre,
              createdAt: l.created_at as string,
            })));
          }
        })
        .catch(() => {});
    } catch (err) {
      toast.error((err as Error).message || "Erreur lors de la génération");
    } finally {
      setChargement(false);
    }
  }

  function copier() {
    navigator.clipboard.writeText(lettre);
    toast.success("Lettre copiée !");
  }

  function telecharger() {
    const blob = new Blob([lettre], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "lettre-de-motivation.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 max-w-7xl">
      {/* === GAUCHE : Inputs === */}
      <div className="space-y-4">
        <Card padding="md">
          <div className="space-y-4">
            {/* CV */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">
                  Ton CV (ou résumé de profil)
                </label>
                <button
                  onClick={() => cvFileRef.current?.click()}
                  className="flex items-center gap-1.5 text-xs text-[#5B2D8E] hover:underline font-medium"
                >
                  <Upload className="w-3 h-3" />
                  Importer .pdf / .txt
                </button>
                <input ref={cvFileRef} type="file" accept=".txt,.pdf" className="hidden" onChange={importerCV} />
              </div>
              <textarea
                value={cv}
                onChange={(e) => setCv(e.target.value)}
                placeholder="Colle ton CV ou un résumé de ton profil..."
                className="w-full h-44 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#5B2D8E]/30 focus:border-[#5B2D8E] focus:bg-white transition"
              />
            </div>

            {/* Offre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Offre d&apos;emploi
              </label>
              <textarea
                value={offre}
                onChange={(e) => setOffre(e.target.value)}
                placeholder="Colle l'offre d'emploi cible..."
                className="w-full h-40 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#5B2D8E]/30 focus:border-[#5B2D8E] focus:bg-white transition"
              />
            </div>

            {/* Ton */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">
                Ton de la lettre
              </p>
              <div className="grid grid-cols-2 gap-2">
                {tons.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTon(t.id)}
                    className={cn(
                      "px-3 py-2.5 rounded-xl border-2 text-left transition",
                      ton === t.id
                        ? "border-[#5B2D8E] bg-[#F3EDFB]"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{t.emoji}</span>
                      <p className={cn("text-sm font-medium", ton === t.id ? "text-[#5B2D8E]" : "text-gray-700")}>
                        {t.label}
                      </p>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{t.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Option */}
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => setInclureAccroche(!inclureAccroche)}
                className={cn(
                  "w-10 h-5 rounded-full transition-colors",
                  inclureAccroche ? "bg-[#5B2D8E]" : "bg-gray-300"
                )}
              >
                <div
                  className={cn(
                    "w-4 h-4 bg-white rounded-full shadow mt-0.5 transition-transform",
                    inclureAccroche ? "translate-x-5.5" : "translate-x-0.5"
                  )}
                />
              </div>
              <span className="text-sm text-gray-700">
                Inclure une accroche personnalisée
              </span>
            </label>

            {/* Bouton */}
            <Button
              onClick={generer}
              loading={chargement}
              disabled={!cv.trim() || !offre.trim()}
              className="w-full"
              size="lg"
            >
              <Sparkles className="w-4 h-4" />
              {chargement ? "Génération en cours..." : "Générer ma lettre"}
            </Button>
          </div>
        </Card>

        {/* Historique */}
        {historique.length > 0 && (
          <Card padding="md">
            <p className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              Dernières lettres
            </p>
            <div className="space-y-2">
              {historique.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setLettre(item.lettre)}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition text-left group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-700 truncate">{item.offre}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="violet">{item.ton}</Badge>
                      <span className="text-[10px] text-gray-400">
                        {formatDate(item.createdAt)}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500" />
                </button>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* === DROITE : Résultat === */}
      <div>
        {chargement ? (
          <Card padding="md">
            <div className="space-y-3">
              <Skeleton className="h-5 w-1/3" />
              <SkeletonText lines={12} />
            </div>
          </Card>
        ) : lettre ? (
          <Card padding="md">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Ta lettre de motivation
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {compterMots(lettre)} mots
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={generer}>
                  <RefreshCw className="w-3.5 h-3.5" />
                  Régénérer
                </Button>
                <Button variant="ghost" size="sm" onClick={copier}>
                  <Copy className="w-3.5 h-3.5" />
                  Copier
                </Button>
                <Button variant="secondary" size="sm" onClick={telecharger}>
                  <Download className="w-3.5 h-3.5" />
                  TXT
                </Button>
              </div>
            </div>

            {/* Zone éditable */}
            <textarea
              value={lettre}
              onChange={(e) => setLettre(e.target.value)}
              className="w-full h-[500px] px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 text-sm text-gray-800 leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-[#5B2D8E]/20 focus:border-[#5B2D8E] focus:bg-white transition"
            />
          </Card>
        ) : (
          <Card padding="lg" className="text-center h-full flex flex-col items-center justify-center min-h-80">
            <div className="w-16 h-16 bg-[#E6F7F7] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-7 h-7 text-[#1AA8A8]" />
            </div>
            <p className="font-semibold text-gray-900 mb-1">
              Ta lettre apparaîtra ici
            </p>
            <p className="text-sm text-gray-500 max-w-xs">
              Remplis les champs à gauche et clique sur &quot;Générer ma lettre&quot;.
              Tu pourras ensuite la modifier directement.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
