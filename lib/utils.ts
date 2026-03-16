import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Fusion de classes Tailwind
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Formatage date en français
export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

// Compteur de mots
export function compterMots(texte: string): number {
  return texte.trim().split(/\s+/).filter(Boolean).length;
}

// Couleur du score ATS
export function couleurScore(score: number): string {
  if (score >= 75) return "#22c55e"; // vert
  if (score >= 50) return "#f59e0b"; // orange
  return "#ef4444"; // rouge
}

// Tronquer un texte
export function tronquer(texte: string, maxLength: number): string {
  if (texte.length <= maxLength) return texte;
  return texte.slice(0, maxLength) + "...";
}
