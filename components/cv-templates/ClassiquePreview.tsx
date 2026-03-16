import type { CVOptimise } from "@/types";

const L = {
  fr: { experience: "Expérience Professionnelle", formation: "Formation", competences: "Compétences", langues: "Langues" },
  en: { experience: "Work Experience", formation: "Education", competences: "Skills", langues: "Languages" },
};

interface Props {
  data: CVOptimise;
  langue?: "fr" | "en";
}

// Template Classique : une colonne, sobre, typographie élégante
export function ClassiquePreview({ data, langue = "fr" }: Props) {
  const t = L[langue];
  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden text-xs font-serif p-8 min-h-[700px]">
      {/* En-tête centré */}
      <div className="text-center mb-6 pb-6 border-b border-gray-300">
        <h1 className="text-2xl font-bold tracking-wide text-gray-900 uppercase">
          {data.nom}
        </h1>
        <p className="text-sm text-gray-600 mt-1 italic">{data.titre}</p>
        <div className="flex items-center justify-center gap-4 mt-3 text-gray-500 flex-wrap">
          {data.email && <span>{data.email}</span>}
          {data.telephone && <><span>·</span><span>{data.telephone}</span></>}
          {data.localisation && <><span>·</span><span>{data.localisation}</span></>}
          {data.linkedin && <><span>·</span><span>{data.linkedin}</span></>}
        </div>
      </div>

      {/* Résumé */}
      {data.resume && (
        <div className="mb-5">
          <p className="text-gray-700 leading-relaxed text-center italic">{data.resume}</p>
        </div>
      )}

      {/* Expérience */}
      {data.experience?.length > 0 && (
        <div className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-900 mb-3 border-b border-gray-200 pb-1">
            {t.experience}
          </h2>
          <div className="space-y-4">
            {data.experience.map((exp, i) => (
              <div key={i}>
                <div className="flex justify-between items-baseline">
                  <div>
                    <span className="font-bold text-gray-900">{exp.poste}</span>
                    <span className="text-gray-600"> · {exp.entreprise}</span>
                  </div>
                  <span className="text-gray-500 text-[10px]">{exp.periode}</span>
                </div>
                {exp.description && (
                  <ul className="mt-1.5 space-y-0.5 ml-4">
                    {exp.description.map((d, j) => (
                      <li key={j} className="text-gray-600 list-disc">{d}</li>
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
        <div className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-900 mb-3 border-b border-gray-200 pb-1">
            {t.formation}
          </h2>
          <div className="space-y-2">
            {data.formation.map((f, i) => (
              <div key={i} className="flex justify-between">
                <div>
                  <span className="font-bold text-gray-900">{f.diplome}</span>
                  <span className="text-gray-600"> · {f.etablissement}</span>
                  {f.mention && <span className="text-gray-500"> ({f.mention})</span>}
                </div>
                <span className="text-gray-500">{f.annee}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Compétences */}
      {data.competences?.length > 0 && (
        <div className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-900 mb-3 border-b border-gray-200 pb-1">
            {t.competences}
          </h2>
          <p className="text-gray-700">{data.competences.join(" · ")}</p>
        </div>
      )}

      {/* Langues */}
      {data.langues?.length && data.langues.length > 0 && (
        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-900 mb-3 border-b border-gray-200 pb-1">
            {t.langues}
          </h2>
          <p className="text-gray-700">
            {data.langues.map((l) => `${l.langue} (${l.niveau})`).join(" · ")}
          </p>
        </div>
      )}
    </div>
  );
}
