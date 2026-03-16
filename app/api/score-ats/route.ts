import { NextRequest, NextResponse } from "next/server";
import { calculerScoreATS } from "@/lib/claude";

export async function POST(req: NextRequest) {
  try {
    const { cv, offre } = await req.json();

    if (!cv?.trim() || !offre?.trim()) {
      return NextResponse.json(
        { error: "CV et offre requis" },
        { status: 400 }
      );
    }

    const score = await calculerScoreATS(cv, offre);
    return NextResponse.json({ score });
  } catch (err) {
    console.error("[score-ats]", err);
    return NextResponse.json(
      { error: "Erreur lors du calcul du score ATS" },
      { status: 500 }
    );
  }
}
