"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import type { Candidature, StatutCandidature } from "@/types";
import {
  Plus,
  Mail,
  Calendar,
  ExternalLink,
  StickyNote,
  ChevronRight,
  ChevronLeft,
  Trash2,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

const colonnes: { id: StatutCandidature; label: string; couleur: string; bg: string }[] = [
  { id: "a_envoyer", label: "À envoyer", couleur: "#6B7280", bg: "#F9FAFB" },
  { id: "envoyee", label: "Envoyée", couleur: "#5B2D8E", bg: "#F3EDFB" },
  { id: "entretien", label: "Entretien", couleur: "#1AA8A8", bg: "#E6F7F7" },
  { id: "reponse", label: "Offre / Refus", couleur: "#22c55e", bg: "#F0FDF4" },
];


export default function CandidaturesPage() {
  const [candidatures, setCandidatures] = useState<Candidature[]>([]);
  const [chargementInitial, setChargementInitial] = useState(true);

  // Charger depuis Supabase au montage
  useEffect(() => {
    fetch("/api/candidatures")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) { toast.error(`Supabase : ${data.error}`); return; }
        if (data.candidatures) {
          setCandidatures(data.candidatures.map((c: Record<string, unknown>) => ({
            id: c.id as string,
            poste: c.poste as string,
            entreprise: c.entreprise as string,
            statut: c.statut as StatutCandidature,
            dateEnvoi: c.date_envoi as string | undefined,
            notes: c.notes as string | undefined,
            lien: c.lien as string | undefined,
            createdAt: c.created_at as string,
          })));
        }
      })
      .catch(() => toast.error("Impossible de charger les candidatures"))
      .finally(() => setChargementInitial(false));
  }, []);
  const [modalAjout, setModalAjout] = useState(false);
  const [modalRelance, setModalRelance] = useState(false);
  const [candidatureActive, setCandidatureActive] = useState<Candidature | null>(null);
  const [emailRelance, setEmailRelance] = useState("");
  const [relanceLoading, setRelanceLoading] = useState(false);

  // Formulaire d'ajout
  const [form, setForm] = useState({
    poste: "",
    entreprise: "",
    dateEnvoi: "",
    lien: "",
    notes: "",
    statut: "a_envoyer" as StatutCandidature,
  });

  async function ajouterCandidature() {
    if (!form.poste || !form.entreprise) {
      toast.error("Poste et entreprise requis");
      return;
    }

    try {
      const res = await fetch("/api/candidatures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          poste: form.poste,
          entreprise: form.entreprise,
          statut: form.statut,
          date_envoi: form.dateEnvoi || null,
          lien: form.lien || null,
          notes: form.notes || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Erreur lors de l'ajout");
        return;
      }
      if (data.candidature) {
        const c = data.candidature;
        setCandidatures((prev) => [{
          id: c.id, poste: c.poste, entreprise: c.entreprise,
          statut: c.statut, dateEnvoi: c.date_envoi, notes: c.notes,
          lien: c.lien, createdAt: c.created_at,
        }, ...prev]);
        setForm({ poste: "", entreprise: "", dateEnvoi: "", lien: "", notes: "", statut: "a_envoyer" });
        setModalAjout(false);
        toast.success("Candidature ajoutée !");
      }
    } catch {
      toast.error("Erreur lors de l'ajout");
    }
  }

  async function deplacerColonne(id: string, direction: "prev" | "next") {
    const cand = candidatures.find((c) => c.id === id);
    if (!cand) return;
    const idx = colonnes.findIndex((col) => col.id === cand.statut);
    const newIdx = direction === "next" ? idx + 1 : idx - 1;
    if (newIdx < 0 || newIdx >= colonnes.length) return;
    const newStatut = colonnes[newIdx].id;

    // Optimistic update
    setCandidatures((prev) =>
      prev.map((c) => c.id === id ? { ...c, statut: newStatut } : c)
    );

    try {
      await fetch("/api/candidatures", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, statut: newStatut }),
      });
    } catch {
      // Rollback
      setCandidatures((prev) =>
        prev.map((c) => c.id === id ? { ...c, statut: cand.statut } : c)
      );
    }
  }

  async function supprimerCandidature(id: string) {
    setCandidatures((prev) => prev.filter((c) => c.id !== id));
    try {
      await fetch("/api/candidatures", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      toast.success("Candidature supprimée");
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  }

  async function genererRelance(c: Candidature) {
    setCandidatureActive(c);
    setEmailRelance("");
    setModalRelance(true);
    setRelanceLoading(true);

    try {
      const res = await fetch("/api/generate/lettre", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cv: `Candidature pour ${c.poste} chez ${c.entreprise}`,
          offre: `Poste: ${c.poste} | Entreprise: ${c.entreprise}`,
          ton: "formel",
          typeGeneration: "relance",
          dateEnvoi: c.dateEnvoi,
        }),
      });
      const data = await res.json();
      setEmailRelance(data.lettre || "Erreur lors de la génération");
    } catch {
      setEmailRelance("Erreur lors de la génération");
    } finally {
      setRelanceLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">
            {candidatures.length} candidature{candidatures.length > 1 ? "s" : ""} au total
          </p>
        </div>
        <Button onClick={() => setModalAjout(true)}>
          <Plus className="w-4 h-4" />
          Ajouter une candidature
        </Button>
      </div>

      {/* Kanban */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
        {colonnes.map((col) => {
          const cards = candidatures.filter((c) => c.statut === col.id);
          const colIdx = colonnes.findIndex((c) => c.id === col.id);

          return (
            <div key={col.id}>
              {/* En-tête colonne */}
              <div
                className="flex items-center justify-between px-3 py-2 rounded-xl mb-3"
                style={{ backgroundColor: col.bg }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: col.couleur }} />
                  <p className="text-sm font-semibold" style={{ color: col.couleur }}>
                    {col.label}
                  </p>
                </div>
                <Badge variant="gray">{cards.length}</Badge>
              </div>

              {/* Cards */}
              <div className="space-y-3">
                {cards.map((c) => (
                  <Card key={c.id} padding="sm" className="group">
                    <div className="p-2 space-y-2">
                      {/* Titre */}
                      <div>
                        <p className="text-sm font-semibold text-gray-900 line-clamp-1">
                          {c.poste}
                        </p>
                        <p className="text-xs text-gray-500">{c.entreprise}</p>
                      </div>

                      {/* Date */}
                      {c.dateEnvoi && (
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <Calendar className="w-3 h-3" />
                          {formatDate(c.dateEnvoi)}
                        </div>
                      )}

                      {/* Lien */}
                      {c.lien && (
                        <a
                          href={c.lien}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-[#5B2D8E] hover:underline"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Voir l&apos;offre
                        </a>
                      )}

                      {/* Notes */}
                      {c.notes && (
                        <div className="flex items-start gap-1 text-xs text-gray-500 bg-gray-50 rounded-lg p-2">
                          <StickyNote className="w-3 h-3 mt-0.5 shrink-0" />
                          <span className="line-clamp-2">{c.notes}</span>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-1 pt-1 border-t border-gray-50">
                        {colIdx > 0 && (
                          <button
                            onClick={() => deplacerColonne(c.id, "prev")}
                            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
                          >
                            <ChevronLeft className="w-3 h-3" />
                          </button>
                        )}
                        {colIdx < colonnes.length - 1 && (
                          <button
                            onClick={() => deplacerColonne(c.id, "next")}
                            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
                          >
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        )}
                        <button
                          onClick={() => genererRelance(c)}
                          className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-[#F3EDFB] text-xs text-[#5B2D8E] transition ml-auto"
                        >
                          <Mail className="w-3 h-3" />
                          Relancer
                        </button>
                        <button
                          onClick={() => supprimerCandidature(c.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-400 transition"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </Card>
                ))}

                {cards.length === 0 && (
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center">
                    <p className="text-xs text-gray-400">Aucune candidature</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal ajout */}
      <Modal open={modalAjout} onClose={() => setModalAjout(false)} title="Ajouter une candidature">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Poste *</label>
              <input
                value={form.poste}
                onChange={(e) => setForm({ ...form, poste: e.target.value })}
                placeholder="Développeur React"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5B2D8E]/30"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Entreprise *</label>
              <input
                value={form.entreprise}
                onChange={(e) => setForm({ ...form, entreprise: e.target.value })}
                placeholder="Doctolib"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5B2D8E]/30"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Date d&apos;envoi</label>
              <input
                type="date"
                value={form.dateEnvoi}
                onChange={(e) => setForm({ ...form, dateEnvoi: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5B2D8E]/30"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Statut</label>
              <select
                value={form.statut}
                onChange={(e) => setForm({ ...form, statut: e.target.value as StatutCandidature })}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5B2D8E]/30"
              >
                {colonnes.map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Lien vers l&apos;offre</label>
            <input
              value={form.lien}
              onChange={(e) => setForm({ ...form, lien: e.target.value })}
              placeholder="https://..."
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5B2D8E]/30"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Entretien RH le 10/03, contact: Marie Dupont..."
              className="w-full h-24 px-3 py-2 rounded-xl border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#5B2D8E]/30"
            />
          </div>

          <Button onClick={ajouterCandidature} className="w-full">
            Ajouter la candidature
          </Button>
        </div>
      </Modal>

      {/* Modal relance */}
      <Modal open={modalRelance} onClose={() => setModalRelance(false)} title={`Relance — ${candidatureActive?.entreprise}`} size="lg">
        {relanceLoading ? (
          <div className="space-y-2 animate-pulse">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={`h-3 bg-gray-200 rounded ${i === 5 ? "w-2/3" : "w-full"}`} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <textarea
              value={emailRelance}
              onChange={(e) => setEmailRelance(e.target.value)}
              className="w-full h-64 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm leading-relaxed resize-none focus:outline-none"
            />
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => navigator.clipboard.writeText(emailRelance).then(() => toast.success("Copié !"))}>
                Copier
              </Button>
              <Button onClick={() => setModalRelance(false)}>Fermer</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
