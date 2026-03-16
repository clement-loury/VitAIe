"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

// Composant invisible : sync le plan Stripe si ?upgraded=true dans l'URL
export function PlanSync() {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("upgraded") !== "true") return;

    const sessionId = searchParams.get("session_id");

    fetch("/api/stripe/sync-plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.plan && d.plan !== "free") {
          toast.success(`Plan ${d.plan.toUpperCase()} activé ! 🎉`);
          // Recharger pour mettre à jour la sidebar
          window.history.replaceState({}, "", window.location.pathname);
          window.location.reload();
        }
      })
      .catch(() => {});
  }, [searchParams]);

  return null;
}
