import { NextRequest, NextResponse } from "next/server";
import { stripe, PLANS } from "@/lib/stripe";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    if (!stripe) {
      return NextResponse.json(
        { error: "Stripe non configuré. Ajoutez STRIPE_SECRET_KEY dans .env.local" },
        { status: 503 }
      );
    }

    const { plan } = await req.json();
    const planConfig = PLANS[plan as keyof typeof PLANS];

    if (!planConfig || !("priceId" in planConfig) || !planConfig.priceId) {
      return NextResponse.json({ error: "Plan invalide ou price ID manquant" }, { status: 400 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: planConfig.priceId, quantity: 1 }],
      success_url: `${appUrl}/dashboard?upgraded=true`,
      cancel_url: `${appUrl}/dashboard/upgrade`,
      metadata: { userId, plan },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[stripe/create-checkout]", message);
    return NextResponse.json(
      { error: `Erreur Stripe : ${message}` },
      { status: 500 }
    );
  }
}
