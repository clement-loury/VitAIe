import { auth, currentUser } from "@clerk/nextjs/server";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { PlanSync } from "@/components/dashboard/PlanSync";
import { createSupabaseAdmin } from "@/lib/supabase";
import { Suspense } from "react";

// Synchronise l'utilisateur Clerk avec la table users de Supabase
async function syncUser() {
  try {
    const { userId } = await auth();
    if (!userId) return;

    const supabase = createSupabaseAdmin();
    if (!supabase) return;

    const user = await currentUser();
    if (!user) return;

    await supabase.from("users").upsert(
      {
        clerk_id: userId,
        email: user.emailAddresses[0]?.emailAddress ?? "",
        plan: "free",
      },
      { onConflict: "clerk_id", ignoreDuplicates: true }
    );
  } catch (err) {
    console.error("[syncUser] Erreur Supabase:", err);
  }
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await syncUser();

  return (
    <div className="min-h-screen bg-[#F5F5FA]">
      <Suspense><PlanSync /></Suspense>
      <Sidebar />
      <div className="ml-60 flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
