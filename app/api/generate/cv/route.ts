import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { optimiserCV } from "@/lib/claude";
import { createSupabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { cv, offre, template = "moderne", langue = "fr" } = await req.json();

    if (!cv?.trim() || !offre?.trim()) {
      return NextResponse.json({ error: "CV et offre requis" }, { status: 400 });
    }

    const cvOptimise = await optimiserCV(cv, offre, langue);

    // Sauvegarder dans Supabase (silencieux si non configuré)
    try {
      const { userId } = await auth();
      if (userId) {
        const supabase = createSupabaseAdmin();
        if (supabase) {
          const { data: user } = await supabase
            .from("users").select("id").eq("clerk_id", userId).single();
          if (user) {
            await supabase.from("cvs").insert({
              user_id: user.id,
              contenu_original: cv.slice(0, 5000),
              contenu_optimise: cvOptimise,
              template,
            });
          }
        }
      }
    } catch { /* silencieux */ }

    return NextResponse.json({ cvOptimise });
  } catch (err) {
    console.error("[generate/cv]", err);
    return NextResponse.json({ error: "Erreur lors de l'optimisation" }, { status: 500 });
  }
}
