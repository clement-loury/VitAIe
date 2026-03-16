// Types principaux de VitAIe

export type Plan = "free" | "pro" | "boost";
export type TemplateName = "moderne" | "classique" | "minimaliste" | "ats-pro";
export type TonLettre = "formel" | "dynamique" | "startup" | "créatif";
export type StatutCandidature =
  | "a_envoyer"
  | "envoyee"
  | "entretien"
  | "reponse";
export type CategorieQuestion =
  | "motivation"
  | "technique"
  | "comportemental"
  | "situationnel";

export interface CVOptimise {
  nom: string;
  titre: string;
  email: string;
  telephone?: string;
  localisation?: string;
  linkedin?: string;
  resume: string;
  experience: Experience[];
  formation: Formation[];
  competences: string[];
  langues?: { langue: string; niveau: string }[];
}

export interface Experience {
  poste: string;
  entreprise: string;
  periode: string;
  description: string[];
}

export interface Formation {
  diplome: string;
  etablissement: string;
  annee: string;
  mention?: string;
}

export interface ScoreATS {
  score: number;
  motsClesPresents: string[];
  motsClesManquants: string[];
  conseils: string[];
}

export interface Question {
  id: number;
  categorie: CategorieQuestion;
  question: string;
}

export interface AnalyseReponse {
  pointsForts: string[];
  aAmeliorer: string[];
  suggestionReformulation: string;
  scoreGlobal: number;
}

export interface Candidature {
  id: string;
  poste: string;
  entreprise: string;
  statut: StatutCandidature;
  dateEnvoi?: string;
  notes?: string;
  lien?: string;
  createdAt: string;
}

export interface LettreHistorique {
  id: string;
  offre: string;
  lettre: string;
  ton: TonLettre;
  createdAt: string;
}
