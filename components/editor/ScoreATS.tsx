"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/Badge";
import { couleurScore } from "@/lib/utils";
import type { ScoreATS } from "@/types";
import { Lightbulb, Plus, Check, Zap } from "lucide-react";
import toast from "react-hot-toast";

interface Props {
  score: ScoreATS;
  onAddKeywords?: (mots: string[]) => void;
}

export function ScoreATSDisplay({ score, onAddKeywords }: Props) {
  const couleur = couleurScore(score.score);
  const circumference = 2 * Math.PI * 40;
  const dash = (score.score / 100) * circumference;
  const [ajoutes, setAjoutes] = useState<Set<string>>(new Set());

  function ajouterMot(mot: string) {
    if (!onAddKeywords || ajoutes.has(mot)) return;
    onAddKeywords([mot]);
    setAjoutes((prev) => new Set([...prev, mot]));
    toast.success(`"${mot}" ajouté aux compétences`);
  }

  function ajouterTout() {
    if (!onAddKeywords) return;
    const restants = score.motsClesManquants.filter((m) => !ajoutes.has(m));
    if (!restants.length) return;
    onAddKeywords(restants);
    setAjoutes(new Set(score.motsClesManquants));
    toast.success(`${restants.length} mots-clés ajoutés aux compétences`);
  }

  return (
    <div className="space-y-5">
      {/* Cercle de score */}
      <div className="flex items-center gap-6">
        <div className="relative w-24 h-24 shrink-0">
          <svg viewBox="0 0 100 100" className="w-24 h-24 -rotate-90">
            <circle cx="50" cy="50" r="40" fill="none" stroke="#E5E7EB" strokeWidth="8" />
            <motion.circle
              cx="50" cy="50" r="40"
              fill="none" stroke={couleur} strokeWidth="8" strokeLinecap="round"
              initial={{ strokeDasharray: `0 ${circumference}` }}
              animate={{ strokeDasharray: `${dash} ${circumference}` }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold" style={{ color: couleur }}>{score.score}%</span>
          </div>
        </div>

        <div>
          <p className="font-semibold text-gray-900 text-sm">Score de compatibilité ATS</p>
          <p className="text-xs text-gray-500 mt-1">
            {score.score >= 75
              ? "Excellent ! Ton profil correspond bien à l'offre."
              : score.score >= 50
              ? "Correct, mais quelques mots-clés manquants."
              : "À améliorer — ajoute les mots-clés manquants."}
          </p>
        </div>
      </div>

      {/* Mots-clés présents */}
      {score.motsClesPresents.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-700 mb-2">
            ✅ Mots-clés présents ({score.motsClesPresents.length})
          </p>
          <div className="flex flex-wrap gap-1.5">
            {score.motsClesPresents.map((mot) => (
              <Badge key={mot} variant="green">{mot}</Badge>
            ))}
          </div>
        </div>
      )}

      {/* Mots-clés manquants */}
      {score.motsClesManquants.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-gray-700">
              ❌ Mots-clés manquants ({score.motsClesManquants.length})
            </p>
            {onAddKeywords && ajoutes.size < score.motsClesManquants.length && (
              <button
                onClick={ajouterTout}
                className="flex items-center gap-1 text-[10px] font-medium text-[#5B2D8E] hover:underline"
              >
                <Zap className="w-3 h-3" />
                Tout ajouter au CV
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {score.motsClesManquants.map((mot) => {
              const fait = ajoutes.has(mot);
              return (
                <button
                  key={mot}
                  onClick={() => ajouterMot(mot)}
                  disabled={!onAddKeywords || fait}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium transition ${
                    fait
                      ? "bg-green-100 text-green-700 cursor-default"
                      : onAddKeywords
                      ? "bg-red-100 text-red-600 hover:bg-[#F3EDFB] hover:text-[#5B2D8E] cursor-pointer"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {fait ? <Check className="w-2.5 h-2.5" /> : onAddKeywords ? <Plus className="w-2.5 h-2.5" /> : null}
                  {mot}
                </button>
              );
            })}
          </div>
          {onAddKeywords && (
            <p className="text-[10px] text-gray-400 mt-2">
              Clique sur un mot-clé pour l'ajouter à tes compétences
            </p>
          )}
        </div>
      )}

      {/* Conseils */}
      {score.conseils.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            Conseils d'amélioration
          </p>
          <ul className="space-y-1.5">
            {score.conseils.map((conseil, i) => (
              <li key={i} className="text-xs text-gray-600 flex gap-2">
                <span className="text-amber-500 shrink-0">→</span>
                {conseil}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
