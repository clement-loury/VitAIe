import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

function extraireJSON<T>(text: string, fallback: T): T {
  // Supprimer les blocs markdown éventuels
  const clean = text.replace(/```(?:json|JSON)?\s*\n?/g, "").replace(/```/g, "").trim();
  // Essai direct
  try { return JSON.parse(clean) as T; } catch {}
  // Extraction par profondeur d'accolades
  let depth = 0, start = -1;
  for (let i = 0; i < clean.length; i++) {
    if (clean[i] === "{") { if (depth === 0) start = i; depth++; }
    else if (clean[i] === "}") {
      depth--;
      if (depth === 0 && start !== -1) {
        try { return JSON.parse(clean.slice(start, i + 1)) as T; } catch {}
      }
    }
  }
  return fallback;
}

export async function POST(req: NextRequest) {
  try {
    const { texte } = await req.json();
    if (!texte?.trim()) return NextResponse.json({ error: "Texte manquant" }, { status: 400 });

    // Haiku : rapide et ~0.3 cts par appel
    const msg = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2048,
      messages: [{
        role: "user",
        content: `Extrais les informations de ce CV en JSON. Retourne UNIQUEMENT le JSON, rien d'autre.

CV (extrait) :
${texte.slice(0, 3000)}

JSON attendu :
{
  "prenom": "",
  "nom": "",
  "titre": "",
  "email": "",
  "telephone": "",
  "ville": "",
  "linkedin": "",
  "resume": "",
  "experiences": [{"id":"1","poste":"","entreprise":"","periode":"","description":""}],
  "formations": [{"id":"1","diplome":"","ecole":"","annee":""}],
  "competences": [""],
  "langues": [{"id":"1","langue":"","niveau":"Courant (C1/C2)"}]
}

Règles : chaîne vide si info absente, max 5 expériences, max 15 compétences, niveaux langue parmi : Natif / Courant (C1/C2) / Avancé (B2) / Intermédiaire (B1) / Débutant (A1/A2)`,
      }],
    });

    const text = msg.content[0].type === "text" ? msg.content[0].text : "{}";
    const cv = extraireJSON(text, null);
    if (!cv) return NextResponse.json({ error: "Impossible de parser le CV" }, { status: 422 });

    return NextResponse.json({ cv });
  } catch (err) {
    console.error("[parse-cv]", err);
    return NextResponse.json({ error: "Erreur lors de l'analyse" }, { status: 500 });
  }
}
