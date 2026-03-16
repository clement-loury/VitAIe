import type { CVOptimise } from "@/types";

const L = {
  fr: {
    professionalSummary: "Résumé professionnel",
    coreCompetencies: "Compétences clés",
    workExperience: "Expérience professionnelle",
    education: "Formation",
    languages: "Langues",
  },
  en: {
    professionalSummary: "Professional Summary",
    coreCompetencies: "Core Competencies",
    workExperience: "Work Experience",
    education: "Education",
    languages: "Languages",
  },
};

interface Props {
  data: CVOptimise;
  langue?: "fr" | "en";
}

function SectionTitle({ label }: { label: string }) {
  return (
    <div className="mt-4 mb-1.5">
      <p className="text-[9px] font-bold uppercase tracking-widest text-black">{label}</p>
      <div className="h-[1.5px] bg-black mt-1" />
    </div>
  );
}

export function ATSProPreview({ data, langue = "fr" }: Props) {
  const t = L[langue];
  const contacts = [data.email, data.telephone, data.localisation, data.linkedin]
    .filter(Boolean)
    .join("  |  ");

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden text-[10px] font-sans p-10 min-h-[700px]" style={{ fontFamily: "Arial, Helvetica, sans-serif" }}>

      {/* En-tête */}
      <h1 className="text-lg font-bold text-black mb-0.5">{data.nom}</h1>
      {data.titre && <p className="text-xs text-gray-700 mb-1">{data.titre}</p>}
      {contacts && <p className="text-[9px] text-gray-600 mb-4">{contacts}</p>}

      {/* Résumé professionnel */}
      {data.resume && (
        <div>
          <SectionTitle label={t.professionalSummary} />
          <p className="text-[9px] text-gray-800 leading-relaxed">{data.resume}</p>
        </div>
      )}

      {/* Compétences clés */}
      {data.competences?.length > 0 && (
        <div>
          <SectionTitle label={t.coreCompetencies} />
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {data.competences.map((c, i) => (
              <span key={i} className="text-[9px] text-gray-800">▪ {c}</span>
            ))}
          </div>
        </div>
      )}

      {/* Expériences */}
      {data.experience?.length > 0 && (
        <div>
          <SectionTitle label={t.workExperience} />
          <div className="space-y-3">
            {data.experience.map((exp, i) => (
              <div key={i}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-black text-[9.5px]">{exp.poste}</p>
                    <p className="italic text-gray-700 text-[9px]">{exp.entreprise}</p>
                  </div>
                  <span className="text-gray-500 text-[8.5px] shrink-0 ml-2">{exp.periode}</span>
                </div>
                {exp.description?.length > 0 && (
                  <ul className="mt-1 space-y-0.5 ml-3">
                    {exp.description.map((d, j) => (
                      <li key={j} className="text-[9px] text-gray-800 leading-snug">• {d}</li>
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
          <SectionTitle label={t.education} />
          <div className="space-y-2">
            {data.formation.map((f, i) => (
              <div key={i} className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-black text-[9.5px]">{f.diplome}</p>
                  <p className="text-gray-700 text-[9px]">{f.etablissement}{f.mention ? ` — ${f.mention}` : ""}</p>
                </div>
                <span className="text-gray-500 text-[8.5px] shrink-0 ml-2">{f.annee}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Langues */}
      {data.langues?.length ? (
        <div>
          <SectionTitle label={t.languages} />
          <p className="text-[9px] text-gray-800">
            {data.langues.map((l) => `${l.langue} (${l.niveau})`).join("   •   ")}
          </p>
        </div>
      ) : null}
    </div>
  );
}
