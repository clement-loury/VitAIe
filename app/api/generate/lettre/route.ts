import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { generateLettre, genererEmailRelance } from "@/lib/claude";
import { createSupabaseAdmin } from "@/lib/supabase";

async function getUserInternalId(clerkId: string) {
  const supabase = createSupabaseAdmin();
  if (!supabase) return null;
  const { data } = await supabase.from("users").select("id").eq("clerk_id", clerkId).single();
  return data?.id ?? null;
}

export async function POST(req: NextRequest) {
  try {
    const { cv, offre, ton = "formel", typeGeneration, dateEnvoi, entreprise, poste } = await req.json();

    // Génération email de relance (pas sauvegardé)
    if (typeGeneration === "relance") {
      const email = await genererEmailRelance({
        poste: poste || cv,
        entreprise: entreprise || offre,
        dateEnvoi: dateEnvoi || new Date().toLocaleDateString("fr-FR"),
      });
      return NextResponse.json({ lettre: email });
    }

    if (!cv?.trim() || !offre?.trim()) {
      return NextResponse.json({ error: "CV et offre requis" }, { status: 400 });
    }

    const lettre = await generateLettre(cv, offre, ton);

    // Sauvegarder dans Supabase (silencieux si non configuré)
    try {
      const { userId } = await auth();
      if (userId) {
        const internalId = await getUserInternalId(userId);
        const supabase = createSupabaseAdmin();
        if (supabase && internalId) {
          await supabase.from("lettres").insert({
            user_id: internalId,
            offre: offre.slice(0, 500),
            lettre_generee: lettre,
            ton,
          });
        }
      }
    } catch { /* silencieux */ }

    return NextResponse.json({ lettre });
  } catch (err) {
    console.error("[generate/lettre]", err);
    return NextResponse.json({ error: "Erreur lors de la génération" }, { status: 500 });
  }
}
