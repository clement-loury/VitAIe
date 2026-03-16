import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { stripe, PLANS } from "@/lib/stripe";
import { createSupabaseAdmin } from "@/lib/supabase";

export async function POST() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const supabase = createSupabaseAdmin();
  if (!supabase) return NextResponse.json({ plan: "free" });

  if (!stripe) return NextResponse.json({ plan: "free" });

  try {
    let plan: "free" | "pro" | "boost" = "free";

    // Chercher via Stripe Search API (filtre par metadata userId)
    const sessions = await stripe.checkout.sessions.search({
      query: `metadata['userId']:'${userId}' AND payment_status:'paid'`,
      limit: 5,
    });

    if (sessions.data.length > 0) {
      // Prendre la session la plus récente
      const latest = sessions.data[0];
      const sessionPlan = latest.metadata?.plan as "pro" | "boost" | undefined;
      if (sessionPlan === "pro" || sessionPlan === "boost") {
        plan = sessionPlan;

        // Vérifier que l'abonnement est encore actif si c'est une subscription
        if (latest.subscription) {
          const sub = await stripe.subscriptions.retrieve(latest.subscription as string);
          if (sub.status !== "active" && sub.status !== "trialing") {
            plan = "free";
          }
        }
      }
    }

    // Mettre à jour dans Supabase
    await supabase.from("users").update({ plan }).eq("clerk_id", userId);

    return NextResponse.json({ plan });
  } catch (err) {
    console.error("[sync-plan]", err);
    // En cas d'erreur, retourner le plan depuis Supabase
    const { data } = await supabase.from("users").select("plan").eq("clerk_id", userId).single();
    return NextResponse.json({ plan: data?.plan ?? "free" });
  }
}
