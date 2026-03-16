"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { FileText, Mail, BarChart3, Target, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";

interface Stats {
  cvs: number;
  lettres: number;
  scoreAts: number;
  candidatures: number;
  entretiens: number;
}

export function StatCards() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/user/stats")
      .then((r) => r.json())
      .then((data) => setStats(data))
      .catch(() => setStats({ cvs: 0, lettres: 0, scoreAts: 0, candidatures: 0, entretiens: 0 }))
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    {
      label: "CVs optimisés",
      valeur: stats?.cvs ?? 0,
      sous: "total",
      icon: FileText,
      couleur: "#5B2D8E",
      bg: "#F3EDFB",
    },
    {
      label: "Lettres générées",
      valeur: stats?.lettres ?? 0,
      sous: "total",
      icon: Mail,
      couleur: "#1AA8A8",
      bg: "#E6F7F7",
    },
    {
      label: "Score ATS moyen",
      valeur: stats?.scoreAts ? `${stats.scoreAts}%` : "—",
      sous: "sur tes CVs",
      icon: BarChart3,
      couleur: "#5B2D8E",
      bg: "#F3EDFB",
    },
    {
      label: "Candidatures",
      valeur: stats?.candidatures ?? 0,
      sous: stats?.entretiens ? `${stats.entretiens} en entretien` : "total",
      icon: Target,
      couleur: "#1AA8A8",
      bg: "#E6F7F7",
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} padding="md">
            <Skeleton className="h-8 w-16 mb-2" />
            <Skeleton className="h-3 w-24" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((stat) => (
        <Card key={stat.label} padding="md" className="flex items-start gap-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: stat.bg }}
          >
            <stat.icon className="w-5 h-5" style={{ color: stat.couleur }} />
          </div>
          <div>
            <p className="text-2xl font-bold text-[#1C1C2E]">{stat.valeur}</p>
            <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3 text-green-500" />
              <span className="text-xs text-green-600">{stat.sous}</span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
