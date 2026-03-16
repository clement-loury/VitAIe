"use client";

import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";

const titres: Record<string, { titre: string; description: string }> = {
  "/dashboard": { titre: "Dashboard", description: "Vue d'ensemble de tes candidatures" },
  "/dashboard/cv": { titre: "Mon CV", description: "Optimise ton CV avec l'IA" },
  "/dashboard/lettres": { titre: "Mes Lettres", description: "Génère des lettres de motivation parfaites" },
  "/dashboard/entretien": { titre: "Simulation d'entretien", description: "Prépare-toi avec l'IA" },
  "/dashboard/candidatures": { titre: "Candidatures", description: "Suis tes candidatures en temps réel" },
  "/dashboard/upgrade": { titre: "Passer à PRO", description: "Débloquer toutes les fonctionnalités" },
};

export function Header() {
  const pathname = usePathname();
  const info = titres[pathname] ?? { titre: "VitAIe", description: "" };

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6">
      <div>
        <h1 className="text-base font-semibold text-[#1C1C2E]">{info.titre}</h1>
        <p className="text-xs text-gray-400">{info.description}</p>
      </div>
      <button className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition relative">
        <Bell className="w-4 h-4" />
      </button>
    </header>
  );
}
