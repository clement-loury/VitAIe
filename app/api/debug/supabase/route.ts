import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase";

// Diagnostic Supabase — accessible à /api/debug/supabase
export async function GET() {
  const checks: Record<string, string> = {};

  checks.NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ défini" : "❌ MANQUANT";
  checks.NEXT_PUBLIC_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ défini" : "❌ MANQUANT";
  checks.SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ? "✅ défini" : "❌ MANQUANT — requis pour l'écriture";

  const supabase = createSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ checks, tables: {}, error: "Client admin non créé (clé service_role manquante ?)" });
  }

  // Vérifier si les tables existent
  const tables = ["users", "candidatures", "cvs", "lettres"];
  const tableStatus: Record<string, string> = {};

  for (const table of tables) {
    const { error } = await supabase.from(table).select("id").limit(1);
    tableStatus[table] = error ? `❌ ${error.message}` : "✅ OK";
  }

  return NextResponse.json({ checks, tables: tableStatus });
}
