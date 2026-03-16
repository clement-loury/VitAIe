import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createSupabaseAdmin } from "@/lib/supabase";

// GET — historique des 5 dernières lettres
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ lettres: [] });

  const supabase = createSupabaseAdmin();
  if (!supabase) return NextResponse.json({ lettres: [] });

  const { data: user } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_id", userId)
    .single();

  if (!user) return NextResponse.json({ lettres: [] });

  const { data } = await supabase
    .from("lettres")
    .select("id, offre, lettre_generee, ton, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  return NextResponse.json({ lettres: data ?? [] });
}
