import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createSupabaseAdmin } from "@/lib/supabase";

// Récupérer l'ID interne de l'utilisateur
async function getUserId(clerkId: string) {
  const supabase = createSupabaseAdmin();
  if (!supabase) return null;
  const { data } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_id", clerkId)
    .single();
  return data?.id ?? null;
}

// GET — lister les candidatures
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const supabase = createSupabaseAdmin();
  if (!supabase) return NextResponse.json({ candidatures: [] });

  const internalId = await getUserId(userId);
  if (!internalId) return NextResponse.json({ candidatures: [] });

  const { data, error } = await supabase
    .from("candidatures")
    .select("*")
    .eq("user_id", internalId)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ candidatures: data });
}

// POST — créer une candidature
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const supabase = createSupabaseAdmin();
  if (!supabase) return NextResponse.json({ error: "Supabase non configuré" }, { status: 503 });

  const internalId = await getUserId(userId);
  if (!internalId) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });

  const body = await req.json();
  const { data, error } = await supabase
    .from("candidatures")
    .insert({ ...body, user_id: internalId })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ candidature: data });
}

// PATCH — mettre à jour (statut, notes…)
export async function PATCH(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const supabase = createSupabaseAdmin();
  if (!supabase) return NextResponse.json({ error: "Supabase non configuré" }, { status: 503 });

  const { id, ...updates } = await req.json();
  const internalId = await getUserId(userId);
  if (!internalId) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });

  const { data, error } = await supabase
    .from("candidatures")
    .update(updates)
    .eq("id", id)
    .eq("user_id", internalId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ candidature: data });
}

// DELETE — supprimer
export async function DELETE(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const supabase = createSupabaseAdmin();
  if (!supabase) return NextResponse.json({ error: "Supabase non configuré" }, { status: 503 });

  const { id } = await req.json();
  const internalId = await getUserId(userId);
  if (!internalId) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });

  await supabase
    .from("candidatures")
    .delete()
    .eq("id", id)
    .eq("user_id", internalId);

  return NextResponse.json({ ok: true });
}
