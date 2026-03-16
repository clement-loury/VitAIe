import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { stripe, PLANS } from "@/lib/stripe";
import { createSupabaseAdmin } from "@/lib/supabase";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const supabase = createSupabaseAdmin();
  if (!supabase) return NextResponse.json({ plan: "free" });
  if (!stripe)   return NextResponse.json({ plan: "free" });

  try {
    let plan: "free" | "pro" | "boost" = "free";

    // Essayer de récupérer le session_id passé depuis le redirect Stripe
    const body = await req.json().catch(() => ({}));
    const sessionId = body?.sessionId as string | undefined;

    if (sessionId) {
      // Récupération directe — instantanée, pas de délai d'indexation
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (
        session.metadata?.userId === userId &&
        session.payment_status === "paid"
      ) {
        const sessionPlan = session.metadata?.plan as "pro" | "boost" | undefined;
        if (sessionPlan === "pro" || sessionPlan === "boost") {
          plan = sessionPlan;
          // Vérifier que l'abonnement est actif
          if (session.subscription) {
            const sub = await stripe.subscriptions.retrieve(session.subscription as string);
            if (sub.status !== "active" && sub.status !== "trialing") plan = "free";
          }
        }
      }
    } else {
      // Pas de sessionId = pas de paiement récent à synchroniser
      return NextResponse.json({ plan: "free" });
    }

    // Mettre à jour dans Supabase
    await supabase.from("users").update({ plan }).eq("clerk_id", userId);

    return NextResponse.json({ plan });
  } catch (err) {
    console.error("[sync-plan]", err);
    const { data } = await supabase.from("users").select("plan").eq("clerk_id", userId).single();
    return NextResponse.json({ plan: data?.plan ?? "free" });
  }
}
