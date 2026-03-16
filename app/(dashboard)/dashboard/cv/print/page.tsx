"use client";

import { useEffect, useState } from "react";
import { ModernePreview } from "@/components/cv-templates/ModernePreview";
import { ClassiquePreview } from "@/components/cv-templates/ClassiquePreview";
import { MinimalistePreview } from "@/components/cv-templates/MinimalistePreview";
import type { CVOptimise, TemplateName } from "@/types";

export default function CVPrintPage() {
  const [cv, setCv] = useState<CVOptimise | null>(null);
  const [template, setTemplate] = useState<TemplateName>("moderne");

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("vitaie_cv_print");
      if (saved) {
        const { cv: data, template: tpl } = JSON.parse(saved);
        setCv(data);
        setTemplate(tpl ?? "moderne");
      }
    } catch { /* ignore */ }
  }, []);

  // Auto-print une fois le CV chargé
  useEffect(() => {
    if (!cv) return;
    const timer = setTimeout(() => window.print(), 400);
    return () => clearTimeout(timer);
  }, [cv]);

  const Preview =
    template === "moderne" ? ModernePreview :
    template === "classique" ? ClassiquePreview :
    MinimalistePreview;

  if (!cv) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-400 text-sm">
        Chargement du CV...
      </div>
    );
  }

  return (
    <>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { width: 210mm; background: white; }
        @media print {
          html, body { width: 210mm; height: 297mm; }
          @page { size: A4; margin: 0; }
          .no-print { display: none !important; }
        }
      `}</style>

      {/* Bouton fermer (masqué à l'impression) */}
      <div className="no-print fixed top-3 right-3 z-50 flex gap-2">
        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-[#5B2D8E] text-white text-sm rounded-lg shadow hover:bg-[#4a2478]"
        >
          Imprimer / Sauvegarder PDF
        </button>
        <button
          onClick={() => window.close()}
          className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded-lg shadow hover:bg-gray-300"
        >
          Fermer
        </button>
      </div>

      {/* CV pleine page */}
      <div style={{ width: "210mm", minHeight: "297mm" }}>
        <Preview data={cv} />
      </div>
    </>
  );
}
