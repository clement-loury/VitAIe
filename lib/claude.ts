import Anthropic from "@anthropic-ai/sdk";
import type { CVOptimise, ScoreATS, Question, AnalyseReponse } from "@/types";

const client = new Anthropic();

// Persona RH pour tous les appels
const SYSTEM_RH = `Tu es Marie Dupont, experte RH française avec 15 ans d'expérience en recrutement. Tu as travaillé pour des cabinets de recrutement et de grandes entreprises dans tous les secteurs. Tu maîtrises parfaitement les attentes des recruteurs français, les filtres ATS, et l'art de valoriser un profil. Réponds toujours en français, avec professionnalisme et bienveillance.`;

// Extraire un JSON d'une réponse texte de façon robuste
// Stratégie : essayer plusieurs méthodes d'extraction dans l'ordre
function extraireJSON<T>(text: string, defaultVal: T): T {
  // 1. Nettoyer les balises markdown code block
  const clean = text
    .replace(/```(?:json|JSON)?\s*\n?/g, "")
    .replace(/```/g, "")
    .trim();

  // 2. Essayer de parser le texte nettoyé directement
  try { return JSON.parse(clean) as T; } catch { /* continue */ }

  // 3. Extraire le premier JSON valide avec un parser manuel
  // (évite le problème du regex greedy qui peut rater si le JSON est malformé à la fin)
  const isArray = Array.isArray(defaultVal);

  // Chercher soit tableau soit objet selon le type attendu
  const startChar = isArray ? "[" : "{";
  const endChar = isArray ? "]" : "}";
  const altStartChar = isArray ? "{" : "[";
  const altEndChar = isArray ? "}" : "]";

  function extraireBloc(str: string, open: string, close: string): string | null {
    const start = str.indexOf(open);
    if (start === -1) return null;
    let depth = 0;
    for (let i = start; i < str.length; i++) {
      if (str[i] === open) depth++;
      else if (str[i] === close) {
        depth--;
        if (depth === 0) return str.slice(start, i + 1);
      }
    }
    return null; // JSON tronqué
  }

  // Essayer d'abord le type attendu, puis l'autre
  for (const [o, c] of [[startChar, endChar], [altStartChar, altEndChar]]) {
    const bloc = extraireBloc(clean, o, c);
    if (bloc) {
      try { return JSON.parse(bloc) as T; } catch { /* continue */ }
    }
  }

  console.error("[extraireJSON] Impossible de parser:", clean.slice(0, 200));
  return defaultVal;
}

// Générer une lettre de motivation
export async function generateLettre(
  cv: string,
  offre: string,
  ton: string = "formel"
): Promise<string> {
  const tons: Record<string, string> = {
    formel: "professionnel et formel, respectueux des codes traditionnels",
    dynamique: "dynamique et enthousiaste, montrant de l'énergie",
    startup: "moderne et direct, adapté à la culture startup",
    créatif: "créatif et original, qui sort du lot tout en restant pro",
  };

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1500,
    system: SYSTEM_RH,
    messages: [
      {
        role: "user",
        content: `Génère une lettre de motivation au ton ${tons[ton] || tons.formel}.

CV du candidat :
${cv}

Offre d'emploi :
${offre}

Instructions :
- Détecte le secteur d'activité et adapte le vocabulaire
- 3 paragraphes : accroche forte + compétences clés + motivation pour l'entreprise
- Personnalise avec des éléments spécifiques du CV et de l'offre
- Maximum 350 mots
- Formules de politesse adaptées au ton
- NE PAS inclure les coordonnées ou l'objet, seulement le corps

Génère uniquement la lettre, sans commentaire.`,
      },
    ],
  });

  return message.content[0].type === "text" ? message.content[0].text : "";
}

// Optimiser un CV selon une offre d'emploi
export async function optimiserCV(
  cv: string,
  offre: string,
  langue: "fr" | "en" = "fr"
): Promise<CVOptimise> {
  const isEn = langue === "en";
  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2000,
    system: SYSTEM_RH,
    messages: [
      {
        role: "user",
        content: isEn
          ? `Analyze this CV and job offer, rewrite the CV in ENGLISH to maximize ATS filter pass rate.

Original CV:
${cv}

Job offer:
${offre}

Return ONLY a valid JSON object:
{
  "nom": "First Last",
  "titre": "Professional title optimized for the job offer",
  "email": "email@example.com",
  "telephone": "+33 6 00 00 00 00",
  "localisation": "City, Country",
  "linkedin": "linkedin.com/in/profile",
  "resume": "Compelling 2-3 sentence summary with keywords from the job offer",
  "experience": [
    {
      "poste": "Job Title",
      "entreprise": "Company",
      "periode": "Jan 2022 - Present",
      "description": ["Action verb + measurable result", "..."]
    }
  ],
  "formation": [
    {
      "diplome": "Degree Name",
      "etablissement": "School",
      "annee": "2020",
      "mention": "Honors if applicable"
    }
  ],
  "competences": ["Skill 1", "Skill 2"],
  "langues": [{"langue": "English", "niveau": "Native"}]
}

Rules:
- Use exact keywords from the offer, strong action verbs (Developed, Led, Increased...), quantify results. Write everything in ENGLISH. Return raw JSON only, no markdown code blocks.
- "experience" and "formation": ONLY rewrite entries that already exist in the original CV. Do NOT add new ones. Rephrase descriptions to highlight what is most relevant to the job offer.
- "competences": You MAY add skills from the offer, BUT only those that are realistic and coherent with the candidate's education level, existing experiences and overall profile. Do NOT add advanced or highly specialized skills that someone with this profile couldn't plausibly have.`
          : `Analyse ce CV et cette offre d'emploi, reformule le CV pour maximiser les chances de passer les filtres ATS.

CV original :
${cv}

Offre d'emploi :
${offre}

Retourne UNIQUEMENT un objet JSON valide :
{
  "nom": "Prénom Nom",
  "titre": "Titre professionnel optimisé pour l'offre",
  "email": "email@example.com",
  "telephone": "+33 6 00 00 00 00",
  "localisation": "Ville, France",
  "linkedin": "linkedin.com/in/profil",
  "resume": "Résumé accrocheur 2-3 phrases avec mots-clés de l'offre",
  "experience": [
    {
      "poste": "Titre du poste",
      "entreprise": "Entreprise",
      "periode": "Jan 2022 - Présent",
      "description": ["Verbe d'action + résultat mesurable", "..."]
    }
  ],
  "formation": [
    {
      "diplome": "Nom du diplôme",
      "etablissement": "École",
      "annee": "2020",
      "mention": "Mention si applicable"
    }
  ],
  "competences": ["Compétence 1", "Compétence 2"],
  "langues": [{"langue": "Français", "niveau": "Natif"}]
}

Règles :
- Utilise les mots-clés exacts de l'offre, verbes d'action forts, quantifie les résultats. Retourne du JSON brut, sans balises markdown.
- "experience" et "formation" : reformule UNIQUEMENT les entrées déjà présentes dans le CV original. N'en invente pas de nouvelles. Réécris les descriptions pour mettre en avant ce qui est le plus pertinent pour le poste visé.
- "competences" : tu PEUX compléter avec des compétences de l'offre, MAIS seulement celles qui sont réalistes et cohérentes avec le niveau d'études, les expériences et le profil existant. N'ajoute pas de compétences avancées ou spécialisées que quelqu'un de ce profil ne pourrait pas avoir.`,
      },
    ],
  });

  const text =
    message.content[0].type === "text" ? message.content[0].text : "{}";
  return extraireJSON<CVOptimise>(text, {
    nom: "Candidat",
    titre: "Professionnel",
    email: "",
    resume: "",
    experience: [],
    formation: [],
    competences: [],
  });
}

// Calculer le score ATS
export async function calculerScoreATS(
  cv: string,
  offre: string
): Promise<ScoreATS> {
  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1200,
    system: "Tu es un expert ATS et recrutement. Tu réponds TOUJOURS uniquement avec un objet JSON valide, sans aucun texte avant ou après, sans balises markdown.",
    messages: [
      {
        role: "user",
        content: `Analyse la compatibilité entre ce profil et ce poste. Réponds UNIQUEMENT avec le JSON demandé.

PROFIL :
${cv || "(profil vide)"}

POSTE VISÉ :
${offre}

Règles :
- Profil vide = score 5-25%. Quelques correspondances = 30-55%. Bon match = 60-80%. Excellent = 81-95%.
- Génère exactement 3 conseils concrets et actionnables.
- motsClesManquants = compétences importantes du poste absentes du profil.

JSON attendu (commence directement par "{", rien avant) :
{"score":45,"motsClesPresents":["..."],"motsClesManquants":["..."],"conseils":["...","...","..."]}`,
      },
    ],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "{}";
  return extraireJSON<ScoreATS>(text, {
    score: 0,
    motsClesPresents: [],
    motsClesManquants: [],
    conseils: [],
  });
}

// Générer les questions d'entretien
export async function genererQuestionsEntretien(
  poste: string,
  fichePoste: string
): Promise<Question[]> {
  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1500,
    system: SYSTEM_RH,
    messages: [
      {
        role: "user",
        content: `Prépare un candidat à un entretien pour le poste : "${poste}"

Fiche de poste :
${fichePoste}

Génère 10 questions d'entretien réalistes. Retourne UNIQUEMENT ce JSON :
[
  {"id": 1, "categorie": "motivation", "question": "Pourquoi ce poste vous attire-t-il ?"},
  {"id": 2, "categorie": "technique", "question": "..."},
  {"id": 3, "categorie": "comportemental", "question": "Décrivez une situation où..."},
  {"id": 4, "categorie": "situationnel", "question": "Si vous étiez confronté à..."}
]

Répartition : 2 motivation, 3 technique, 3 comportemental, 2 situationnel`,
      },
    ],
  });

  const text =
    message.content[0].type === "text" ? message.content[0].text : "[]";
  return extraireJSON<Question[]>(text, []);
}

// Analyser une réponse d'entretien
export async function analyserReponseEntretien(
  question: string,
  reponse: string,
  poste: string
): Promise<AnalyseReponse> {
  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 800,
    system: SYSTEM_RH,
    messages: [
      {
        role: "user",
        content: `Analyse cette réponse d'entretien pour le poste "${poste}".

Question : ${question}
Réponse du candidat : ${reponse}

Retourne UNIQUEMENT ce JSON :
{
  "pointsForts": ["Point fort 1", "Point fort 2"],
  "aAmeliorer": ["À améliorer 1", "À améliorer 2"],
  "suggestionReformulation": "Voici une meilleure formulation : ...",
  "scoreGlobal": 72
}`,
      },
    ],
  });

  const text =
    message.content[0].type === "text" ? message.content[0].text : "{}";
  return extraireJSON<AnalyseReponse>(text, {
    pointsForts: [],
    aAmeliorer: [],
    suggestionReformulation: "",
    scoreGlobal: 0,
  });
}

// Générer un email de relance
export async function genererEmailRelance(candidature: {
  poste: string;
  entreprise: string;
  dateEnvoi: string;
}): Promise<string> {
  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 500,
    system: SYSTEM_RH,
    messages: [
      {
        role: "user",
        content: `Génère un email de relance pour une candidature au poste "${candidature.poste}" chez "${candidature.entreprise}", envoyée le ${candidature.dateEnvoi}.

L'email doit être : court (4-5 phrases), poli, montrer de l'intérêt sans être intrusif, se terminer par une question ouverte.

Génère uniquement le corps de l'email (pas l'objet, pas les signatures).`,
      },
    ],
  });

  return message.content[0].type === "text" ? message.content[0].text : "";
}
