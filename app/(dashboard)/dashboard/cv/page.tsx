"use client";

import { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Skeleton, SkeletonText } from "@/components/ui/Skeleton";
import { ScoreATSDisplay } from "@/components/editor/ScoreATS";
import { ModernePreview } from "@/components/cv-templates/ModernePreview";
import { ClassiquePreview } from "@/components/cv-templates/ClassiquePreview";
import { MinimalistePreview } from "@/components/cv-templates/MinimalistePreview";
import { ATSProPreview } from "@/components/cv-templates/ATSProPreview";
import type { CVOptimise, ScoreATS, TemplateName } from "@/types";
import {
  Upload, Sparkles, Download, Printer, Plus, Trash2,
  User, Briefcase, GraduationCap, Zap, Globe, ChevronDown,
  Camera, X,
} from "lucide-react";
import { cn } from "@/lib/utils";

// --- Types internes ---

interface Experience {
  id: string;
  poste: string;
  entreprise: string;
  periode: string;
  description: string;
}

interface Formation {
  id: string;
  diplome: string;
  ecole: string;
  annee: string;
}

interface Langue {
  id: string;
  langue: string;
  niveau: string;
}

interface CVForm {
  prenom: string;
  nom: string;
  titre: string;
  email: string;
  telephone: string;
  ville: string;
  linkedin: string;
  photo: string;
  resume: string;
  experiences: Experience[];
  formations: Formation[];
  competences: string[];
  langues: Langue[];
}

const niveauxLangue = ["Natif", "Courant (C1/C2)", "Avancé (B2)", "Intermédiaire (B1)", "Débutant (A1/A2)"];

const templates: { id: TemplateName; label: string; desc: string }[] = [
  { id: "moderne", label: "Moderne", desc: "Sidebar colorée" },
  { id: "classique", label: "Classique", desc: "Une colonne" },
  { id: "minimaliste", label: "Épuré", desc: "Design pur" },
  { id: "ats-pro", label: "ATS Pro", desc: "Max. recruteurs" },
];

// --- Sérialisation du formulaire vers texte pour Claude ---

function serializerCV(form: CVForm): string {
  const lines: string[] = [];

  if (form.prenom || form.nom) lines.push(`${form.prenom} ${form.nom}`.trim());
  if (form.titre) lines.push(form.titre);
  const contacts = [form.email, form.telephone, form.ville, form.linkedin].filter(Boolean);
  if (contacts.length) lines.push(contacts.join(" | "));
  lines.push("");

  if (form.resume) {
    lines.push("RÉSUMÉ PROFESSIONNEL");
    lines.push(form.resume);
    lines.push("");
  }

  const expsValides = form.experiences.filter((e) => e.poste || e.entreprise);
  if (expsValides.length) {
    lines.push("EXPÉRIENCES PROFESSIONNELLES");
    for (const exp of expsValides) {
      lines.push(`${exp.poste} — ${exp.entreprise}${exp.periode ? ` (${exp.periode})` : ""}`);
      if (exp.description) lines.push(exp.description);
      lines.push("");
    }
  }

  const forsValides = form.formations.filter((f) => f.diplome || f.ecole);
  if (forsValides.length) {
    lines.push("FORMATIONS");
    for (const f of forsValides) {
      lines.push(`${f.diplome} — ${f.ecole}${f.annee ? ` (${f.annee})` : ""}`);
    }
    lines.push("");
  }

  if (form.competences.length) {
    lines.push("COMPÉTENCES");
    lines.push(form.competences.join(", "));
    lines.push("");
  }

  const languesValides = form.langues.filter((l) => l.langue);
  if (languesValides.length) {
    lines.push("LANGUES");
    lines.push(languesValides.map((l) => `${l.langue} (${l.niveau})`).join(", "));
  }

  return lines.join("\n");
}

// --- Helpers ---

function newId() {
  return Math.random().toString(36).slice(2, 9);
}

// --- Section collapsible ---

function Section({
  icon: Icon,
  title,
  children,
  defaultOpen = true,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border border-gray-100 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition text-left"
      >
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-[#5B2D8E]" />
          <span className="text-sm font-semibold text-gray-800">{title}</span>
        </div>
        <ChevronDown className={cn("w-4 h-4 text-gray-400 transition-transform", open && "rotate-180")} />
      </button>
      {open && <div className="p-4 space-y-3">{children}</div>}
    </div>
  );
}

// --- Input simple ---

function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  className,
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      {label && <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5B2D8E]/30 focus:border-[#5B2D8E] bg-white transition"
      />
    </div>
  );
}

// === COMPOSANT PRINCIPAL ===

export default function CVPage() {
  const [form, setForm] = useState<CVForm>({
    prenom: "",
    nom: "",
    titre: "",
    email: "",
    telephone: "",
    ville: "",
    linkedin: "",
    photo: "",
    resume: "",
    experiences: [{ id: newId(), poste: "", entreprise: "", periode: "", description: "" }],
    formations: [{ id: newId(), diplome: "", ecole: "", annee: "" }],
    competences: [],
    langues: [{ id: newId(), langue: "", niveau: "Courant (C1/C2)" }],
  });

  const [offre, setOffre] = useState("");
  const [template, setTemplate] = useState<TemplateName>("moderne");
  const [langue, setLangue] = useState<"fr" | "en">("fr");
  const [chargement, setChargement] = useState(false);
  const [cvOptimise, setCvOptimise] = useState<CVOptimise | null>(null);
  const [score, setScore] = useState<ScoreATS | null>(null);
  const [competenceInput, setCompetenceInput] = useState("");
  const [plan, setPlan] = useState<"free" | "pro" | "boost">("free");
  const [docxLoading, setDocxLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  const LS_KEY = "vitaie_cv_form";
  const [hydrated, setHydrated] = useState(false);

  // 1. Restaurer depuis localStorage au montage, puis activer la sauvegarde
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) setForm(JSON.parse(saved));
    } catch { /* ignore */ }
    setHydrated(true); // autorise la sauvegarde seulement après restauration
  }, []);

  // 2. Sauvegarder uniquement après hydration (évite d'écraser avec le form vide initial)
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(form));
    } catch { /* ignore */ }
  }, [form, hydrated]);

  // Récupérer le plan + sync Stripe si retour de paiement
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const upgraded = params.get("upgraded");

    if (upgraded === "true") {
      // Sync le plan depuis Stripe
      fetch("/api/stripe/sync-plan", { method: "POST" })
        .then((r) => r.json())
        .then((d) => { if (d.plan) setPlan(d.plan); })
        .catch(() => {});
    } else {
      fetch("/api/user/stats")
        .then((r) => r.json())
        .then((d) => { if (d.plan) setPlan(d.plan); })
        .catch(() => {});
    }
  }, []);

  const photoRef = useRef<HTMLInputElement>(null);
  const pdfRef = useRef<HTMLInputElement>(null);

  // --- Photo ---

  function importerPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm((f) => ({ ...f, photo: reader.result as string }));
    reader.readAsDataURL(file);
  }

  const [importLoading, setImportLoading] = useState(false);

  // --- Import PDF/TXT → extraction texte puis parse IA → remplir tous les champs ---

  async function importerCV(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    // Reset l'input pour permettre de réimporter le même fichier
    e.target.value = "";

    setImportLoading(true);
    const toastId = toast.loading("Extraction du PDF...");

    try {
      // 1. Extraire le texte brut
      const formData = new FormData();
      formData.append("file", file);
      const resExtract = await fetch("/api/extract-text", { method: "POST", body: formData });
      const dataExtract = await resExtract.json();
      if (!resExtract.ok) throw new Error(dataExtract.error);

      toast.loading("Analyse par l'IA...", { id: toastId });

      // 2. Parser avec Claude → champs structurés
      const resParse = await fetch("/api/parse-cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texte: dataExtract.texte }),
      });
      const dataParse = await resParse.json();
      if (!resParse.ok) throw new Error(dataParse.error);

      const cv = dataParse.cv;

      // 3. Remplir le formulaire avec les données parsées
      setForm((f) => ({
        ...f,
        prenom: cv.prenom || f.prenom,
        nom: cv.nom || f.nom,
        titre: cv.titre || f.titre,
        email: cv.email || f.email,
        telephone: cv.telephone || f.telephone,
        ville: cv.ville || f.ville,
        linkedin: cv.linkedin || f.linkedin,
        resume: cv.resume || f.resume,
        experiences: cv.experiences?.length ? cv.experiences : f.experiences,
        formations: cv.formations?.length ? cv.formations : f.formations,
        competences: cv.competences?.length ? cv.competences : f.competences,
        langues: cv.langues?.length ? cv.langues : f.langues,
      }));

      toast.success("CV importé et rempli automatiquement !", { id: toastId });
    } catch (err) {
      toast.error((err as Error).message || "Erreur lors de l'import", { id: toastId });
    } finally {
      setImportLoading(false);
    }
  }

  // --- Compétences (tags) ---

  function ajouterCompetence(val: string) {
    const tags = val.split(/[,;]+/).map((t) => t.trim()).filter((t) => t && !form.competences.includes(t));
    if (tags.length) setForm((f) => ({ ...f, competences: [...f.competences, ...tags] }));
    setCompetenceInput("");
  }

  function supprimerCompetence(tag: string) {
    setForm((f) => ({ ...f, competences: f.competences.filter((c) => c !== tag) }));
  }

  // --- Expériences ---

  function updateExp(id: string, field: keyof Omit<Experience, "id">, value: string) {
    setForm((f) => ({
      ...f,
      experiences: f.experiences.map((e) => e.id === id ? { ...e, [field]: value } : e),
    }));
  }

  function ajouterExp() {
    setForm((f) => ({
      ...f,
      experiences: [...f.experiences, { id: newId(), poste: "", entreprise: "", periode: "", description: "" }],
    }));
  }

  function supprimerExp(id: string) {
    setForm((f) => ({ ...f, experiences: f.experiences.filter((e) => e.id !== id) }));
  }

  // --- Formations ---

  function updateFor(id: string, field: keyof Omit<Formation, "id">, value: string) {
    setForm((f) => ({
      ...f,
      formations: f.formations.map((e) => e.id === id ? { ...e, [field]: value } : e),
    }));
  }

  function ajouterFor() {
    setForm((f) => ({
      ...f,
      formations: [...f.formations, { id: newId(), diplome: "", ecole: "", annee: "" }],
    }));
  }

  function supprimerFor(id: string) {
    setForm((f) => ({ ...f, formations: f.formations.filter((e) => e.id !== id) }));
  }

  // --- Langues ---

  function updateLangue(id: string, field: keyof Omit<Langue, "id">, value: string) {
    setForm((f) => ({
      ...f,
      langues: f.langues.map((l) => l.id === id ? { ...l, [field]: value } : l),
    }));
  }

  function ajouterLangue() {
    setForm((f) => ({
      ...f,
      langues: [...f.langues, { id: newId(), langue: "", niveau: "Courant (C1/C2)" }],
    }));
  }

  function supprimerLangue(id: string) {
    setForm((f) => ({ ...f, langues: f.langues.filter((l) => l.id !== id) }));
  }

  // --- Export DOCX ---

  async function exportDocx() {
    if (!cvOptimise) return;
    setDocxLoading(true);
    try {
      const res = await fetch("/api/export/docx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cv: cvOptimise }),
      });
      if (!res.ok) throw new Error("Erreur export");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `cv-${(cvOptimise.nom ?? "export").toLowerCase().replace(/\s+/g, "-")}.docx`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("CV exporté en DOCX !");
    } catch {
      toast.error("Erreur lors de l'export DOCX");
    } finally {
      setDocxLoading(false);
    }
  }

  // --- Génération ---

  async function optimiser() {
    const cvTexte = serializerCV(form);
    if (cvTexte.trim().length < 30) {
      toast.error("Remplis au moins quelques infos dans le formulaire");
      return;
    }
    if (!offre.trim()) {
      toast.error("Ajoute l'offre d'emploi");
      return;
    }

    setChargement(true);
    setCvOptimise(null);
    setScore(null);

    try {
      const [resCV, resScore] = await Promise.all([
        fetch("/api/generate/cv", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cv: cvTexte, offre, template, langue }),
        }),
        fetch("/api/score-ats", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cv: cvTexte, offre }),
        }),
      ]);

      const dataCV = await resCV.json();
      const dataScore = await resScore.json();

      if (!resCV.ok) throw new Error(dataCV.error);
      if (!resScore.ok) throw new Error(dataScore.error);

      setCvOptimise(dataCV.cvOptimise);
      setScore(dataScore.score);
      toast.success("CV optimisé !");
    } catch (err) {
      toast.error((err as Error).message || "Erreur lors de l'optimisation");
    } finally {
      setChargement(false);
    }
  }

  const TemplatePreview =
    template === "moderne" ? ModernePreview :
    template === "classique" ? ClassiquePreview :
    template === "ats-pro" ? ATSProPreview :
    MinimalistePreview;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 max-w-7xl">

      {/* === GAUCHE : Formulaire CV === */}
      <div className="space-y-3">

        {/* Bouton import PDF */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500">
            Remplis ton CV ou importe-le
            <span className="ml-1 text-green-600 font-medium">· sauvegardé automatiquement</span>
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                localStorage.removeItem(LS_KEY);
                setForm({ prenom: "", nom: "", titre: "", email: "", telephone: "", ville: "", linkedin: "", photo: "", resume: "", experiences: [{ id: newId(), poste: "", entreprise: "", periode: "", description: "" }], formations: [{ id: newId(), diplome: "", ecole: "", annee: "" }], competences: [], langues: [{ id: newId(), langue: "", niveau: "Courant (C1/C2)" }] });
                toast.success("Formulaire réinitialisé");
              }}
              className="text-xs text-gray-400 hover:text-red-400 transition"
            >
              Réinitialiser
            </button>
            <button
              onClick={() => !importLoading && pdfRef.current?.click()}
              disabled={importLoading}
              className="flex items-center gap-1.5 text-xs text-[#5B2D8E] hover:underline font-medium disabled:opacity-50"
            >
              <Upload className={`w-3 h-3 ${importLoading ? "animate-spin" : ""}`} />
              {importLoading ? "Analyse en cours..." : "Importer .pdf / .txt"}
            </button>
          </div>
          <input ref={pdfRef} type="file" accept=".txt,.pdf" className="hidden" onChange={importerCV} />
        </div>

        {/* Section: Infos personnelles */}
        <Section icon={User} title="Informations personnelles">
          {/* Photo + nom/prénom */}
          <div className="flex items-start gap-4">
            {/* Photo */}
            <div className="flex flex-col items-center gap-1.5 shrink-0">
              <div
                onClick={() => photoRef.current?.click()}
                className="w-16 h-16 rounded-2xl border-2 border-dashed border-gray-200 hover:border-[#5B2D8E] cursor-pointer flex items-center justify-center overflow-hidden bg-gray-50 transition"
              >
                {form.photo ? (
                  <img src={form.photo} alt="photo" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="w-5 h-5 text-gray-300" />
                )}
              </div>
              {form.photo && (
                <button
                  onClick={() => setForm((f) => ({ ...f, photo: "" }))}
                  className="text-[10px] text-red-400 hover:underline"
                >
                  Supprimer
                </button>
              )}
              <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={importerPhoto} />
            </div>

            {/* Nom/prénom/titre */}
            <div className="flex-1 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <Input label="Prénom" value={form.prenom} onChange={(v) => setForm((f) => ({ ...f, prenom: v }))} placeholder="Marie" />
                <Input label="Nom" value={form.nom} onChange={(v) => setForm((f) => ({ ...f, nom: v }))} placeholder="Dupont" />
              </div>
              <Input label="Titre / poste visé" value={form.titre} onChange={(v) => setForm((f) => ({ ...f, titre: v }))} placeholder="Développeuse React Senior" />
            </div>
          </div>

          {/* Contacts */}
          <div className="grid grid-cols-2 gap-2">
            <Input label="Email" value={form.email} onChange={(v) => setForm((f) => ({ ...f, email: v }))} placeholder="marie@email.com" type="email" />
            <Input label="Téléphone" value={form.telephone} onChange={(v) => setForm((f) => ({ ...f, telephone: v }))} placeholder="06 12 34 56 78" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input label="Ville" value={form.ville} onChange={(v) => setForm((f) => ({ ...f, ville: v }))} placeholder="Paris, France" />
            <Input label="LinkedIn (URL)" value={form.linkedin} onChange={(v) => setForm((f) => ({ ...f, linkedin: v }))} placeholder="linkedin.com/in/marie" />
          </div>
        </Section>

        {/* Section: Résumé */}
        <Section icon={Upload} title="Résumé / Accroche" defaultOpen={false}>
          <textarea
            value={form.resume}
            onChange={(e) => setForm((f) => ({ ...f, resume: e.target.value }))}
            placeholder="3-4 phrases qui résument ton profil, tes points forts et ce que tu apportes..."
            className="w-full h-28 px-3 py-2 rounded-xl border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#5B2D8E]/30 focus:border-[#5B2D8E] transition"
          />
        </Section>

        {/* Section: Expériences */}
        <Section icon={Briefcase} title="Expériences professionnelles">
          <div className="space-y-4">
            {form.experiences.map((exp, i) => (
              <div key={exp.id} className="relative p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-semibold text-gray-500">Expérience {i + 1}</p>
                  {form.experiences.length > 1 && (
                    <button onClick={() => supprimerExp(exp.id)} className="p-1 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-400 transition">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input label="Poste" value={exp.poste} onChange={(v) => updateExp(exp.id, "poste", v)} placeholder="Développeur React" />
                  <Input label="Entreprise" value={exp.entreprise} onChange={(v) => updateExp(exp.id, "entreprise", v)} placeholder="Doctolib" />
                </div>
                <Input label="Période" value={exp.periode} onChange={(v) => updateExp(exp.id, "periode", v)} placeholder="Mars 2022 — Aujourd'hui" />
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Description (missions, résultats...)</label>
                  <textarea
                    value={exp.description}
                    onChange={(e) => updateExp(exp.id, "description", e.target.value)}
                    placeholder="• Développement de features React/TypeScript&#10;• Réduction du temps de chargement de 40%&#10;• Mentorat de 2 développeurs juniors"
                    className="w-full h-24 px-3 py-2 rounded-xl border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#5B2D8E]/30 transition"
                  />
                </div>
              </div>
            ))}
            <button
              onClick={ajouterExp}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border-2 border-dashed border-gray-200 hover:border-[#5B2D8E] text-xs text-gray-400 hover:text-[#5B2D8E] transition"
            >
              <Plus className="w-3.5 h-3.5" />
              Ajouter une expérience
            </button>
          </div>
        </Section>

        {/* Section: Formations */}
        <Section icon={GraduationCap} title="Formations" defaultOpen={false}>
          <div className="space-y-3">
            {form.formations.map((f, i) => (
              <div key={f.id} className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-gray-500">Formation {i + 1}</p>
                  {form.formations.length > 1 && (
                    <button onClick={() => supprimerFor(f.id)} className="p-1 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-400 transition">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input label="Diplôme" value={f.diplome} onChange={(v) => updateFor(f.id, "diplome", v)} placeholder="Master Informatique" />
                  <Input label="Année" value={f.annee} onChange={(v) => updateFor(f.id, "annee", v)} placeholder="2022" />
                </div>
                <Input label="École / Université" value={f.ecole} onChange={(v) => updateFor(f.id, "ecole", v)} placeholder="Université Paris-Saclay" />
              </div>
            ))}
            <button
              onClick={ajouterFor}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border-2 border-dashed border-gray-200 hover:border-[#5B2D8E] text-xs text-gray-400 hover:text-[#5B2D8E] transition"
            >
              <Plus className="w-3.5 h-3.5" />
              Ajouter une formation
            </button>
          </div>
        </Section>

        {/* Section: Compétences */}
        <Section icon={Zap} title="Compétences" defaultOpen={false}>
          <div>
            <input
              value={competenceInput}
              onChange={(e) => setCompetenceInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === ",") {
                  e.preventDefault();
                  ajouterCompetence(competenceInput);
                }
              }}
              onBlur={() => competenceInput.trim() && ajouterCompetence(competenceInput)}
              placeholder="Tape une compétence et appuie sur Entrée (ex: React, TypeScript, Figma...)"
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5B2D8E]/30 transition"
            />
            {form.competences.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {form.competences.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 px-2.5 py-1 bg-[#F3EDFB] text-[#5B2D8E] text-xs rounded-lg font-medium"
                  >
                    {tag}
                    <button onClick={() => supprimerCompetence(tag)} className="hover:text-red-500 transition">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </Section>

        {/* Section: Langues */}
        <Section icon={Globe} title="Langues" defaultOpen={false}>
          <div className="space-y-2">
            {form.langues.map((l, i) => (
              <div key={l.id} className="flex items-end gap-2">
                <Input
                  label={i === 0 ? "Langue" : undefined}
                  value={l.langue}
                  onChange={(v) => updateLangue(l.id, "langue", v)}
                  placeholder="Français"
                  className="flex-1"
                />
                <div className="flex-1">
                  {i === 0 && <label className="block text-xs font-medium text-gray-600 mb-1">Niveau</label>}
                  <select
                    value={l.niveau}
                    onChange={(e) => updateLangue(l.id, "niveau", e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5B2D8E]/30 transition"
                  >
                    {niveauxLangue.map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                {form.langues.length > 1 && (
                  <button onClick={() => supprimerLangue(l.id)} className="p-2 rounded-xl hover:bg-red-50 text-gray-300 hover:text-red-400 transition mb-0.5">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={ajouterLangue}
              className="flex items-center gap-1.5 text-xs text-[#5B2D8E] hover:underline"
            >
              <Plus className="w-3 h-3" />
              Ajouter une langue
            </button>
          </div>
        </Section>
      </div>

      {/* === DROITE : Offre + Génération + Résultat === */}
      <div className="space-y-4">

        {/* Offre d'emploi */}
        <Card padding="md">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Offre d&apos;emploi cible
              </label>
              <textarea
                value={offre}
                onChange={(e) => setOffre(e.target.value)}
                placeholder="Colle l'offre d'emploi ici...&#10;&#10;Exemple :&#10;Développeur Frontend React Senior — Doctolib&#10;Missions : Développer des features React/TypeScript, Agile Scrum...&#10;Profil : 3+ ans React, TypeScript, GraphQL..."
                className="w-full h-44 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#5B2D8E]/30 focus:border-[#5B2D8E] focus:bg-white transition"
              />
            </div>

            {/* Langue du CV */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Langue du CV</p>
              <div className="grid grid-cols-2 gap-2">
                {(["fr", "en"] as const).map((l) => (
                  <button
                    key={l}
                    onClick={() => setLangue(l)}
                    className={cn(
                      "px-3 py-2.5 rounded-xl border-2 text-left transition",
                      langue === l ? "border-[#5B2D8E] bg-[#F3EDFB]" : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <p className={cn("text-sm font-medium", langue === l ? "text-[#5B2D8E]" : "text-gray-700")}>
                      {l === "fr" ? "🇫🇷 Français" : "🇬🇧 English"}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {l === "fr" ? "Marché francophone" : "International / GAFAM"}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Template */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Template du CV</p>
              <div className="grid grid-cols-4 gap-2">
                {templates.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTemplate(t.id)}
                    className={cn(
                      "px-3 py-2.5 rounded-xl border-2 text-left transition",
                      template === t.id ? "border-[#5B2D8E] bg-[#F3EDFB]" : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <p className={cn("text-sm font-medium", template === t.id ? "text-[#5B2D8E]" : "text-gray-700")}>{t.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{t.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <Button onClick={optimiser} loading={chargement} className="w-full" size="lg">
              <Sparkles className="w-4 h-4" />
              {chargement ? "Optimisation en cours..." : "Optimiser mon CV avec l'IA"}
            </Button>
          </div>
        </Card>

        {/* Score ATS */}
        {(chargement || score) && (
          <Card padding="md">
            {chargement ? (
              <div className="space-y-3">
                <Skeleton className="h-5 w-1/2" />
                <Skeleton className="h-20 w-20 rounded-full" />
                <SkeletonText lines={4} />
              </div>
            ) : score ? (
              <ScoreATSDisplay
                score={score}
                onAddKeywords={(mots) => setForm((f) => ({
                  ...f,
                  competences: [...new Set([...f.competences, ...mots])],
                }))}
              />
            ) : null}
          </Card>
        )}

        {/* Preview CV */}
        {(chargement || cvOptimise) && (
          <Card padding="sm">
            <div className="flex items-center justify-between mb-3 px-2 no-print">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-gray-900">
                  Aperçu — {templates.find((t) => t.id === template)?.label}
                </p>
                {template === "ats-pro" && (
                  <span className="text-[10px] font-medium px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                    ✓ Optimisé ATS
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={!cvOptimise}
                  loading={pdfLoading}
                  onClick={async () => {
                    if (!cvOptimise) return;
                    setPdfLoading(true);
                    try {
                      const res = await fetch("/api/export/pdf", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ cv: cvOptimise, template, langue }),
                      });
                      if (!res.ok) throw new Error("Erreur PDF");
                      const blob = await res.blob();
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `cv-${(cvOptimise.nom ?? "export").toLowerCase().replace(/\s+/g, "-")}.pdf`;
                      a.click();
                      URL.revokeObjectURL(url);
                    } catch {
                      toast.error("Erreur lors de la génération PDF");
                    } finally {
                      setPdfLoading(false);
                    }
                  }}
                >
                  <Printer className="w-3.5 h-3.5" />
                  PDF
                </Button>
                {plan === "free" ? (
                  <Button variant="secondary" size="sm" onClick={() => toast("Export DOCX disponible en plan PRO 🔒")}>
                    <Download className="w-3.5 h-3.5" />
                    DOCX 🔒
                  </Button>
                ) : (
                  <Button variant="secondary" size="sm" onClick={exportDocx} loading={docxLoading} disabled={!cvOptimise}>
                    <Download className="w-3.5 h-3.5" />
                    DOCX
                  </Button>
                )}
              </div>
            </div>

            {chargement ? (
              <div className="space-y-3 p-4">
                <Skeleton className="h-40 w-full" />
                <SkeletonText lines={6} />
              </div>
            ) : cvOptimise ? (
              <div id="cv-print-area" className="cv-preview overflow-hidden rounded-xl scale-[0.85] origin-top">
                <TemplatePreview data={cvOptimise} langue={langue} />
              </div>
            ) : null}
          </Card>
        )}

        {/* État vide */}
        {!chargement && !cvOptimise && (
          <Card padding="lg" className="text-center">
            <div className="w-16 h-16 bg-[#F3EDFB] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-7 h-7 text-[#5B2D8E]" />
            </div>
            <p className="font-semibold text-gray-900 mb-1">
              Remplis ton CV à gauche
            </p>
            <p className="text-sm text-gray-500">
              L&apos;IA va l&apos;optimiser pour l&apos;offre choisie et calculer ton score ATS.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
