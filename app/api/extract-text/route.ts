import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Fichier manquant" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Fichier texte simple
    if (file.type === "text/plain" || file.name.endsWith(".txt")) {
      return NextResponse.json({ texte: buffer.toString("utf-8") });
    }

    // Fichier PDF — utilise unpdf (compatible Next.js 16 / Turbopack)
    if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
      try {
        const { extractText } = await import("unpdf");
        const { text } = await extractText(new Uint8Array(buffer), { mergePages: true });
        if (!text?.trim()) {
          return NextResponse.json(
            { error: "Le PDF ne contient pas de texte extractible (PDF scanné ?). Essayez de copier-coller le texte directement." },
            { status: 422 }
          );
        }
        return NextResponse.json({ texte: text });
      } catch (e) {
        console.error("[extract-text/pdf]", e);
        return NextResponse.json(
          { error: "Impossible d'extraire le texte du PDF. Essayez .txt ou copiez-collez." },
          { status: 422 }
        );
      }
    }

    return NextResponse.json(
      { error: "Format non supporté. Utilisez .txt ou .pdf" },
      { status: 400 }
    );
  } catch (err) {
    console.error("[extract-text]", err);
    return NextResponse.json({ error: "Erreur lors de l'extraction" }, { status: 500 });
  }
}
