"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import {
  LayoutDashboard,
  FileText,
  Mail,
  MessageSquare,
  Target,
  Zap,
  Crown,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/cv", icon: FileText, label: "Mon CV" },
  { href: "/dashboard/lettres", icon: Mail, label: "Mes Lettres" },
  { href: "/dashboard/entretien", icon: MessageSquare, label: "Entretien" },
  { href: "/dashboard/candidatures", icon: Target, label: "Candidatures" },
];

const planLabels: Record<string, { label: string; couleur: string }> = {
  free:  { label: "FREE",  couleur: "text-gray-500" },
  pro:   { label: "PRO",   couleur: "text-[#5B2D8E]" },
  boost: { label: "BOOST", couleur: "text-[#1AA8A8]" },
};

export function Sidebar() {
  const pathname = usePathname();
  const [plan, setPlan] = useState<"free" | "pro" | "boost">("free");

  useEffect(() => {
    fetch("/api/user/stats")
      .then((r) => r.json())
      .then((d) => { if (d.plan) setPlan(d.plan); })
      .catch(() => {});
  }, []);

  const planInfo = planLabels[plan] ?? planLabels.free;
  const isPaid = plan === "pro" || plan === "boost";

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-white border-r border-gray-100 flex flex-col z-30">
      {/* Logo */}
      <div className="p-5 border-b border-gray-100">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="VitAIe" width={32} height={32} className="rounded-xl" />
          <span className="font-bold text-[#1C1C2E] text-lg">VitAIe</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const active =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                active
                  ? "bg-[#5B2D8E]/10 text-[#5B2D8E]"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bas : plan + user */}
      <div className="p-4 space-y-3 border-t border-gray-100">
        {/* Bouton upgrade seulement si FREE */}
        {!isPaid && (
          <Link
            href="/dashboard/upgrade"
            className="flex items-center gap-2 px-3 py-2.5 bg-gradient-to-r from-[#5B2D8E]/10 to-[#1AA8A8]/10 rounded-xl text-sm font-medium text-[#5B2D8E] hover:from-[#5B2D8E]/20 hover:to-[#1AA8A8]/20 transition"
          >
            <Zap className="w-4 h-4" />
            Passer en PRO
          </Link>
        )}

        <div className="flex items-center gap-3 px-2">
          <UserButton />
          <div className="min-w-0 flex-1">
            <p className="text-xs text-gray-400">Plan actuel</p>
            <div className="flex items-center gap-1">
              {isPaid && <Crown className="w-3 h-3 text-yellow-500" />}
              <p className={cn("text-sm font-semibold truncate", planInfo.couleur)}>
                {planInfo.label}
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
