import type { CVOptimise } from "@/types";

const L = {
  fr: { experience: "Expérience", formation: "Formation", competences: "Compétences", langues: "Langues" },
  en: { experience: "Experience", formation: "Education", competences: "Skills", langues: "Languages" },
};

interface Props {
  data: CVOptimise;
  langue?: "fr" | "en";
}

// Template Minimaliste : typographie pure, beaucoup d'espace
export function MinimalistePreview({ data, langue = "fr" }: Props) {
  const t = L[langue];
  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden text-xs font-sans p-10 min-h-[700px]">
      {/* En-tête aéré */}
      <div className="mb-10">
        <h1 className="text-3xl font-light tracking-tight text-gray-900 mb-1">
          {data.nom}
        </h1>
        <p className="text-sm text-gray-500">{data.titre}</p>
        <div className="flex gap-6 mt-3 text-gray-400">
          {data.email && <span>{data.email}</span>}
          {data.telephone && <span>{data.telephone}</span>}
          {data.localisation && <span>{data.localisation}</span>}
        </div>
      </div>

      {/* Résumé */}
      {data.resume && (
        <div className="mb-10">
          <p className="text-gray-600 leading-relaxed max-w-2xl">{data.resume}</p>
        </div>
      )}

      {/* Expérience */}
      {data.experience?.length > 0 && (
        <div className="mb-10">
          <h2 className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-5">
            {t.experience}
          </h2>
          <div className="space-y-7">
            {data.experience.map((exp, i) => (
              <div key={i} className="grid grid-cols-5 gap-4">
                <div className="col-span-2 text-gray-400">
                  <span>{exp.periode}</span>
                </div>
                <div className="col-span-3">
                  <p className="font-medium text-gray-900">{exp.poste}</p>
                  <p className="text-gray-500 mb-2">{exp.entreprise}</p>
                  {exp.description && (
                    <ul className="space-y-1 text-gray-600">
                      {exp.description.map((d, j) => (
                        <li key={j}>— {d}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Formation */}
      {data.formation?.length > 0 && (
        <div className="mb-10">
          <h2 className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-5">
            {t.formation}
          </h2>
          <div className="space-y-3">
            {data.formation.map((f, i) => (
              <div key={i} className="grid grid-cols-5 gap-4">
                <div className="col-span-2 text-gray-400">{f.annee}</div>
                <div className="col-span-3">
                  <p className="font-medium text-gray-900">{f.diplome}</p>
                  <p className="text-gray-500">{f.etablissement}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Compétences + Langues */}
      <div className="grid grid-cols-2 gap-8">
        {data.competences?.length > 0 && (
          <div>
            <h2 className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-4">
              {t.competences}
            </h2>
            <div className="space-y-1">
              {data.competences.map((c) => (
                <p key={c} className="text-gray-700">— {c}</p>
              ))}
            </div>
          </div>
        )}
        {data.langues?.length && data.langues.length > 0 && (
          <div>
            <h2 className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-4">
              {t.langues}
            </h2>
            <div className="space-y-1">
              {data.langues.map((l) => (
                <p key={l.langue} className="text-gray-700">
                  — {l.langue} <span className="text-gray-400">({l.niveau})</span>
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
