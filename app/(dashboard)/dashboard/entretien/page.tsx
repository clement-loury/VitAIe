"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import type { Question, AnalyseReponse, CategorieQuestion } from "@/types";
import {
  Sparkles,
  MessageSquare,
  ChevronRight,
  ThumbsUp,
  AlertCircle,
  Lightbulb,
} from "lucide-react";

const categorieConfig: Record<CategorieQuestion, { label: string; couleur: "violet" | "teal" | "green" | "orange" }> = {
  motivation: { label: "Motivation", couleur: "violet" },
  technique: { label: "Technique", couleur: "teal" },
  comportemental: { label: "Comportemental", couleur: "orange" },
  situationnel: { label: "Situationnel", couleur: "green" },
};

export default function EntretienPage() {
  const [poste, setPoste] = useState("");
  const [fichePoste, setFichePoste] = useState("");
  const [chargement, setChargement] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);

  // Modal entraînement
  const [modalOpen, setModalOpen] = useState(false);
  const [questionActive, setQuestionActive] = useState<Question | null>(null);
  const [reponse, setReponse] = useState("");
  const [analyseLoading, setAnalyseLoading] = useState(false);
  const [analyse, setAnalyse] = useState<AnalyseReponse | null>(null);

  async function genererQuestions() {
    if (!poste.trim()) {
      toast.error("Indique le poste visé");
      return;
    }

    setChargement(true);
    setQuestions([]);

    try {
      const res = await fetch("/api/generate/entretien", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ poste, fichePoste }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setQuestions(data.questions);
      toast.success(`${data.questions.length} questions générées !`);
    } catch (err) {
      toast.error((err as Error).message || "Erreur");
    } finally {
      setChargement(false);
    }
  }

  function ouvrirEntrainement(q: Question) {
    setQuestionActive(q);
    setReponse("");
    setAnalyse(null);
    setModalOpen(true);
  }

  async function analyserReponse() {
    if (!reponse.trim() || !questionActive) return;
    setAnalyseLoading(true);

    try {
      const res = await fetch("/api/generate/entretien", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: questionActive.question,
          reponse,
          poste,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAnalyse(data.analyse);
    } catch (err) {
      toast.error((err as Error).message || "Erreur");
    } finally {
      setAnalyseLoading(false);
    }
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Formulaire */}
      <Card padding="md">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pour quel poste passes-tu un entretien ?
            </label>
            <input
              type="text"
              value={poste}
              onChange={(e) => setPoste(e.target.value)}
              placeholder="Ex: Développeur React Senior, Product Manager, Data Analyst..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#5B2D8E]/30 focus:border-[#5B2D8E] focus:bg-white transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fiche de poste (optionnel mais recommandé)
            </label>
            <textarea
              value={fichePoste}
              onChange={(e) => setFichePoste(e.target.value)}
              placeholder="Colle la fiche de poste pour des questions ultra-personnalisées..."
              className="w-full h-36 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#5B2D8E]/30 focus:border-[#5B2D8E] focus:bg-white transition"
            />
          </div>

          <Button
            onClick={genererQuestions}
            loading={chargement}
            disabled={!poste.trim()}
            className="w-full sm:w-auto"
            size="lg"
          >
            <Sparkles className="w-4 h-4" />
            {chargement ? "Génération..." : "Générer les questions"}
          </Button>
        </div>
      </Card>

      {/* Questions */}
      {chargement && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} padding="md">
              <div className="flex items-start gap-4">
                <Skeleton className="w-6 h-6 rounded-full shrink-0" />
                <Skeleton className="h-4 flex-1" />
              </div>
            </Card>
          ))}
        </div>
      )}

      {questions.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-900">
              {questions.length} questions d&apos;entretien pour{" "}
              <span className="text-[#5B2D8E]">{poste}</span>
            </p>
            <div className="flex gap-2 flex-wrap">
              {(Object.keys(categorieConfig) as CategorieQuestion[]).map((cat) => (
                <Badge key={cat} variant={categorieConfig[cat].couleur}>
                  {categorieConfig[cat].label}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {questions.map((q, i) => (
              <Card key={q.id} padding="md">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-7 h-7 rounded-full bg-[#F3EDFB] flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-[#5B2D8E]">{i + 1}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-800 leading-relaxed">
                        {q.question}
                      </p>
                      <Badge
                        variant={categorieConfig[q.categorie].couleur}
                        className="mt-2"
                      >
                        {categorieConfig[q.categorie].label}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => ouvrirEntrainement(q)}
                    className="shrink-0"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    S&apos;entraîner
                    <ChevronRight className="w-3 h-3" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* État vide */}
      {!chargement && questions.length === 0 && (
        <Card padding="lg" className="text-center">
          <div className="w-16 h-16 bg-[#F3EDFB] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-7 h-7 text-[#5B2D8E]" />
          </div>
          <p className="font-semibold text-gray-900 mb-2">
            Prépare-toi comme un pro
          </p>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">
            L&apos;IA génère 10 questions réalistes par catégorie (motivation, technique,
            comportemental, situationnel) adaptées à ton poste.
          </p>
        </Card>
      )}

      {/* Modal entraînement */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="S'entraîner à la réponse"
        size="lg"
      >
        {questionActive && (
          <div className="space-y-4">
            {/* Question */}
            <div className="bg-[#F3EDFB] rounded-xl p-4">
              <p className="text-xs font-semibold text-[#5B2D8E] mb-1 uppercase tracking-wide">
                Question
              </p>
              <p className="text-sm text-gray-800 font-medium">
                {questionActive.question}
              </p>
            </div>

            {/* Réponse */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ta réponse
              </label>
              <textarea
                value={reponse}
                onChange={(e) => setReponse(e.target.value)}
                placeholder="Écris ta réponse ici. Pense à utiliser la méthode STAR (Situation, Tâche, Action, Résultat) pour les questions comportementales..."
                className="w-full h-44 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#5B2D8E]/30 focus:border-[#5B2D8E] focus:bg-white transition"
              />
            </div>

            <Button
              onClick={analyserReponse}
              loading={analyseLoading}
              disabled={!reponse.trim()}
              className="w-full"
            >
              <Sparkles className="w-4 h-4" />
              Analyser ma réponse
            </Button>

            {/* Analyse */}
            {analyse && (
              <div className="space-y-4 pt-2 border-t border-gray-100">
                {/* Score */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#F3EDFB] flex items-center justify-center">
                    <span className="text-sm font-bold text-[#5B2D8E]">
                      {analyse.scoreGlobal}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Score global</p>
                    <p className="text-xs text-gray-400">/100</p>
                  </div>
                </div>

                {/* Points forts */}
                {analyse.pointsForts.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-green-700 flex items-center gap-1 mb-2">
                      <ThumbsUp className="w-3.5 h-3.5" /> Points forts
                    </p>
                    <ul className="space-y-1">
                      {analyse.pointsForts.map((p, i) => (
                        <li key={i} className="text-xs text-gray-600 flex gap-2">
                          <span className="text-green-500">✓</span> {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* À améliorer */}
                {analyse.aAmeliorer.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-orange-700 flex items-center gap-1 mb-2">
                      <AlertCircle className="w-3.5 h-3.5" /> À améliorer
                    </p>
                    <ul className="space-y-1">
                      {analyse.aAmeliorer.map((a, i) => (
                        <li key={i} className="text-xs text-gray-600 flex gap-2">
                          <span className="text-orange-500">→</span> {a}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Suggestion */}
                {analyse.suggestionReformulation && (
                  <div className="bg-blue-50 rounded-xl p-3">
                    <p className="text-xs font-semibold text-blue-700 flex items-center gap-1 mb-1">
                      <Lightbulb className="w-3.5 h-3.5" /> Suggestion de reformulation
                    </p>
                    <p className="text-xs text-blue-800 leading-relaxed">
                      {analyse.suggestionReformulation}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
