import { NextRequest, NextResponse } from "next/server";
import { genererQuestionsEntretien, analyserReponseEntretien } from "@/lib/claude";

// POST → Générer les questions
export async function POST(req: NextRequest) {
  try {
    const { poste, fichePoste = "" } = await req.json();

    if (!poste?.trim()) {
      return NextResponse.json({ error: "Poste requis" }, { status: 400 });
    }

    const questions = await genererQuestionsEntretien(poste, fichePoste);
    return NextResponse.json({ questions });
  } catch (err) {
    console.error("[generate/entretien POST]", err);
    return NextResponse.json(
      { error: "Erreur lors de la génération des questions" },
      { status: 500 }
    );
  }
}

// PUT → Analyser une réponse
export async function PUT(req: NextRequest) {
  try {
    const { question, reponse, poste } = await req.json();

    if (!question?.trim() || !reponse?.trim()) {
      return NextResponse.json(
        { error: "Question et réponse requises" },
        { status: 400 }
      );
    }

    const analyse = await analyserReponseEntretien(question, reponse, poste || "");
    return NextResponse.json({ analyse });
  } catch (err) {
    console.error("[generate/entretien PUT]", err);
    return NextResponse.json(
      { error: "Erreur lors de l'analyse" },
      { status: 500 }
    );
  }
}
