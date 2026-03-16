import type { CVOptimise } from "@/types";
import { Mail, Phone, MapPin, Linkedin } from "lucide-react";

const L = {
  fr: { contact: "Contact", competences: "Compétences", langues: "Langues", experience: "Expérience professionnelle", formation: "Formation" },
  en: { contact: "Contact", competences: "Skills", langues: "Languages", experience: "Work Experience", formation: "Education" },
};

interface Props {
  data: CVOptimise;
  langue?: "fr" | "en";
}

// Template Moderne : sidebar colorée + corps principal
export function ModernePreview({ data, langue = "fr" }: Props) {
  const t = L[langue];
  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden text-xs font-sans flex min-h-[700px]">
      {/* Sidebar gauche violette */}
      <div className="w-48 bg-[#5B2D8E] text-white flex flex-col p-5 gap-5">
        {/* Avatar */}
        <div className="w-16 h-16 rounded-full bg-[#4a2478] border-2 border-[#1AA8A8] flex items-center justify-center mx-auto text-2xl font-bold">
          {data.nom?.charAt(0) ?? "?"}
        </div>

        {/* Infos de contact */}
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#1AA8A8] mb-1">{t.contact}</p>
          {data.email && (
            <div className="flex items-start gap-1.5">
              <Mail className="w-3 h-3 mt-0.5 shrink-0 opacity-70" />
              <span className="break-all opacity-90">{data.email}</span>
            </div>
          )}
          {data.telephone && (
            <div className="flex items-center gap-1.5">
              <Phone className="w-3 h-3 shrink-0 opacity-70" />
              <span className="opacity-90">{data.telephone}</span>
            </div>
          )}
          {data.localisation && (
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3 h-3 shrink-0 opacity-70" />
              <span className="opacity-90">{data.localisation}</span>
            </div>
          )}
          {data.linkedin && (
            <div className="flex items-center gap-1.5">
              <Linkedin className="w-3 h-3 shrink-0 opacity-70" />
              <span className="break-all opacity-90">{data.linkedin}</span>
            </div>
          )}
        </div>

        {/* Compétences */}
        {data.competences?.length > 0 && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#1AA8A8] mb-2">{t.competences}</p>
            <div className="space-y-1.5">
              {data.competences.slice(0, 10).map((c) => (
                <div key={c}>
                  <span className="text-[10px] opacity-90">{c}</span>
                  <div className="mt-0.5 h-1 bg-white/20 rounded-full">
                    <div className="h-1 bg-[#1AA8A8] rounded-full" style={{ width: "75%" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Langues */}
        {data.langues && data.langues.length > 0 && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#1AA8A8] mb-2">{t.langues}</p>
            {data.langues.map((l) => (
              <div key={l.langue} className="flex justify-between opacity-90">
                <span>{l.langue}</span>
                <span className="text-[#1AA8A8]">{l.niveau}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Corps principal */}
      <div className="flex-1 p-6 space-y-5">
        {/* En-tête */}
        <div className="border-b border-gray-100 pb-4">
          <h1 className="text-xl font-bold text-[#1C1C2E]">{data.nom}</h1>
          <p className="text-sm font-medium text-[#5B2D8E] mt-0.5">{data.titre}</p>
          {data.resume && (
            <p className="text-xs text-gray-500 mt-2 leading-relaxed">{data.resume}</p>
          )}
        </div>

        {/* Expériences */}
        {data.experience?.length > 0 && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#5B2D8E] mb-3 flex items-center gap-2">
              <div className="w-4 h-0.5 bg-[#1AA8A8]" />
              {t.experience}
            </h2>
            <div className="space-y-4">
              {data.experience.map((exp, i) => (
                <div key={i} className="relative pl-3 border-l-2 border-gray-100">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-[#1C1C2E]">{exp.poste}</p>
                      <p className="text-[#5B2D8E]">{exp.entreprise}</p>
                    </div>
                    <span className="text-gray-400 shrink-0 ml-2">{exp.periode}</span>
                  </div>
                  {exp.description && (
                    <ul className="mt-1.5 space-y-0.5">
                      {exp.description.map((d, j) => (
                        <li key={j} className="text-gray-600 before:content-['▸'] before:text-[#1AA8A8] before:mr-1">
                          {d}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Formation */}
        {data.formation?.length > 0 && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#5B2D8E] mb-3 flex items-center gap-2">
              <div className="w-4 h-0.5 bg-[#1AA8A8]" />
              {t.formation}
            </h2>
            <div className="space-y-2">
              {data.formation.map((f, i) => (
                <div key={i} className="flex justify-between">
                  <div>
                    <p className="font-semibold text-[#1C1C2E]">{f.diplome}</p>
                    <p className="text-gray-500">{f.etablissement}{f.mention && ` · ${f.mention}`}</p>
                  </div>
                  <span className="text-gray-400">{f.annee}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
