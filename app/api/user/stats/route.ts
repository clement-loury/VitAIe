import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createSupabaseAdmin } from "@/lib/supabase";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const supabase = createSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ cvs: 0, lettres: 0, scoreAts: 0, candidatures: 0 });
  }

  // Récupérer l'ID interne et le plan de l'utilisateur
  const { data: user } = await supabase
    .from("users")
    .select("id, plan")
    .eq("clerk_id", userId)
    .single();

  if (!user) return NextResponse.json({ cvs: 0, lettres: 0, scoreAts: 0, candidatures: 0 });

  // Requêtes en parallèle
  const [cvsRes, lettresRes, candidaturesRes] = await Promise.all([
    supabase.from("cvs").select("score_ats").eq("user_id", user.id),
    supabase.from("lettres").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("candidatures").select("statut").eq("user_id", user.id),
  ]);

  const scores = (cvsRes.data ?? []).map((c) => c.score_ats).filter(Boolean);
  const scoreAts = scores.length > 0
    ? Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length)
    : 0;

  const entretiens = (candidaturesRes.data ?? []).filter(
    (c) => c.statut === "entretien"
  ).length;

  return NextResponse.json({
    cvs: cvsRes.data?.length ?? 0,
    lettres: lettresRes.count ?? 0,
    scoreAts,
    candidatures: candidaturesRes.data?.length ?? 0,
    entretiens,
    plan: user.plan ?? "free",
  });
}
