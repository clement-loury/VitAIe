import React from "react";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  Document, Page, View, Text, Font, StyleSheet, renderToBuffer,
} from "@react-pdf/renderer";
import path from "path";
import type { CVOptimise, TemplateName } from "@/types";

// ─── Fonts Inter locaux (évite dépendance réseau au rendu) ────────────────────

const F = path.join(process.cwd(), "public", "fonts");

Font.register({
  family: "Inter",
  fonts: [
    { src: `${F}/Inter-Light.ttf`,    fontWeight: 300 },
    { src: `${F}/Inter-Regular.ttf`,  fontWeight: 400 },
    { src: `${F}/Inter-Italic.ttf`,   fontWeight: 400, fontStyle: "italic" },
    { src: `${F}/Inter-Medium.ttf`,   fontWeight: 500 },
    { src: `${F}/Inter-SemiBold.ttf`, fontWeight: 600 },
    { src: `${F}/Inter-Bold.ttf`,     fontWeight: 700 },
  ],
});

// Désactiver la césure automatique (rendu bien plus propre)
Font.registerHyphenationCallback((word) => [word]);

// ─── Palette & constantes ─────────────────────────────────────────────────────

const C = {
  violet:     "#5B2D8E",
  violetDark: "#4a2478",
  violetBg:   "#F3EEF9",
  teal:       "#1AA8A8",
  tealLight:  "#E6F7F7",
  dark:       "#1A1A2E",
  body:       "#374151",
  muted:      "#6B7280",
  light:      "#9CA3AF",
  border:     "#E5E7EB",
  white:      "#FFFFFF",
  black:      "#000000",
};

// ─── Traductions ───────────────────────────────────────────────────────────────

const L = {
  fr: {
    contact: "Contact",
    experience: "Expérience professionnelle",
    formation: "Formation",
    competences: "Compétences",
    langues: "Langues",
    profil: "Profil",
    coreCompetencies: "Compétences clés",
    professionalSummary: "Résumé professionnel",
    workExperience: "Expérience professionnelle",
    education: "Formation",
    skills: "Compétences",
    languages: "Langues",
  },
  en: {
    contact: "Contact",
    experience: "Work Experience",
    formation: "Education",
    competences: "Skills",
    langues: "Languages",
    profil: "Profile",
    coreCompetencies: "Core Competencies",
    professionalSummary: "Professional Summary",
    workExperience: "Work Experience",
    education: "Education",
    skills: "Skills",
    languages: "Languages",
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function SectionTitle({ label, light = false }: { label: string; light?: boolean }) {
  return (
    <View style={{ marginTop: 18, marginBottom: 6 }}>
      <Text style={{
        fontFamily: "Inter", fontWeight: 600, fontSize: 7.5,
        letterSpacing: 1.8, textTransform: "uppercase",
        color: light ? "rgba(255,255,255,0.65)" : C.violet,
      }}>
        {label}
      </Text>
      <View style={{
        marginTop: 4, height: 0.75,
        backgroundColor: light ? "rgba(255,255,255,0.2)" : C.teal,
      }} />
    </View>
  );
}

function Bullet({ text, accent = C.teal }: { text: string; accent?: string }) {
  return (
    <View style={{ flexDirection: "row", marginBottom: 3, paddingRight: 4 }}>
      <Text style={{ fontSize: 8, color: accent, marginRight: 5, marginTop: 1.5, lineHeight: 1 }}>▸</Text>
      <Text style={{
        fontFamily: "Inter", fontWeight: 300, fontSize: 8.5,
        color: C.body, lineHeight: 1.5, flex: 1,
      }}>
        {text}
      </Text>
    </View>
  );
}

// ─── Template MODERNE ─────────────────────────────────────────────────────────
// Sidebar violette 33% + corps principal 67%

function ModernePDF({ data, langue = "fr" }: { data: CVOptimise; langue?: "fr" | "en" }) {
  const t = L[langue];
  const initial = (data.nom ?? "?").charAt(0).toUpperCase();

  const sidebar = StyleSheet.create({
    col: {
      width: "33%", backgroundColor: C.violet,
      paddingTop: 36, paddingBottom: 36, paddingLeft: 20, paddingRight: 18,
      minHeight: "100%",
    },
    avatarRing: {
      width: 70, height: 70, borderRadius: 35,
      backgroundColor: C.violetDark,
      borderWidth: 2.5, borderColor: C.teal,
      alignItems: "center", justifyContent: "center",
      alignSelf: "center", marginBottom: 16,
    },
    avatarLetter: { fontFamily: "Inter", fontWeight: 700, fontSize: 28, color: C.white },
    contactText: {
      fontFamily: "Inter", fontWeight: 300, fontSize: 8,
      color: "rgba(255,255,255,0.85)", lineHeight: 1.5, marginBottom: 2,
    },
    skillRow: { marginBottom: 7 },
    skillName: { fontFamily: "Inter", fontWeight: 400, fontSize: 8, color: "rgba(255,255,255,0.9)", marginBottom: 2 },
    skillTrack: { height: 3, backgroundColor: "rgba(255,255,255,0.18)", borderRadius: 2 },
    skillFill: { height: 3, backgroundColor: C.teal, borderRadius: 2 },
    langRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
    langName: { fontFamily: "Inter", fontWeight: 400, fontSize: 8, color: "rgba(255,255,255,0.85)" },
    langLevel: { fontFamily: "Inter", fontWeight: 500, fontSize: 7.5, color: C.teal },
  });

  const main = StyleSheet.create({
    col: { width: "67%", paddingTop: 36, paddingBottom: 36, paddingLeft: 26, paddingRight: 30 },
    name: {
      fontFamily: "Inter", fontWeight: 700, fontSize: 22,
      color: C.dark, letterSpacing: 0.3, lineHeight: 1.15, marginBottom: 4,
    },
    title: {
      fontFamily: "Inter", fontWeight: 500, fontSize: 10.5,
      color: C.teal, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 12,
    },
    resume: {
      fontFamily: "Inter", fontWeight: 300, fontSize: 8.5,
      color: C.muted, lineHeight: 1.6, marginBottom: 4,
    },
    headerBar: { height: 2, backgroundColor: C.border, marginBottom: 14 },
    expBlock: {
      marginBottom: 12, paddingLeft: 10,
      borderLeftWidth: 2, borderLeftColor: C.border,
    },
    expPoste: {
      fontFamily: "Inter", fontWeight: 600, fontSize: 9.5,
      color: C.dark, lineHeight: 1.3,
    },
    expEntreprise: {
      fontFamily: "Inter", fontWeight: 500, fontSize: 9,
      color: C.teal, marginTop: 1, marginBottom: 4,
    },
    expPeriode: {
      fontFamily: "Inter", fontWeight: 300, fontSize: 8,
      color: C.light, letterSpacing: 0.2,
    },
    expHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 2 },
    formRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 7 },
    formDiplome: { fontFamily: "Inter", fontWeight: 600, fontSize: 9.5, color: C.dark },
    formEcole: { fontFamily: "Inter", fontWeight: 300, fontSize: 8.5, color: C.muted, marginTop: 1 },
    formAnnee: { fontFamily: "Inter", fontWeight: 400, fontSize: 8, color: C.light },
  });

  return (
    <Document>
      <Page size="A4" style={{ fontFamily: "Inter", backgroundColor: C.white, flexDirection: "row" }}>
        {/* SIDEBAR */}
        <View style={sidebar.col}>
          <View style={sidebar.avatarRing}>
            <Text style={sidebar.avatarLetter}>{initial}</Text>
          </View>

          <SectionTitle label={t.contact} light />
          {data.email     && <Text style={sidebar.contactText}>{data.email}</Text>}
          {data.telephone && <Text style={sidebar.contactText}>{data.telephone}</Text>}
          {data.localisation && <Text style={sidebar.contactText}>{data.localisation}</Text>}
          {data.linkedin  && <Text style={sidebar.contactText}>{data.linkedin}</Text>}

          {data.competences?.length > 0 && (
            <View>
              <SectionTitle label={t.competences} light />
              {data.competences.slice(0, 10).map((c, i) => (
                <View key={i} style={sidebar.skillRow}>
                  <Text style={sidebar.skillName}>{c}</Text>
                  <View style={sidebar.skillTrack}>
                    <View style={[sidebar.skillFill, { width: `${70 + (i % 3) * 10}%` }]} />
                  </View>
                </View>
              ))}
            </View>
          )}

          {data.langues?.length ? (
            <View>
              <SectionTitle label={t.langues} light />
              {data.langues.map((l, i) => (
                <View key={i} style={sidebar.langRow}>
                  <Text style={sidebar.langName}>{l.langue}</Text>
                  <Text style={sidebar.langLevel}>{l.niveau}</Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>

        {/* MAIN */}
        <View style={main.col}>
          <Text style={main.name}>{data.nom}</Text>
          <Text style={main.title}>{data.titre}</Text>
          <View style={main.headerBar} />
          {data.resume ? <Text style={main.resume}>{data.resume}</Text> : null}

          {data.experience?.length > 0 && (
            <View>
              <SectionTitle label={t.experience} />
              {data.experience.map((exp, i) => (
                <View key={i} wrap={false} style={main.expBlock}>
                  <View style={main.expHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={main.expPoste}>{exp.poste}</Text>
                      <Text style={main.expEntreprise}>{exp.entreprise}</Text>
                    </View>
                    <Text style={main.expPeriode}>{exp.periode}</Text>
                  </View>
                  {(exp.description ?? []).map((d, j) => <Bullet key={j} text={d} />)}
                </View>
              ))}
            </View>
          )}

          {data.formation?.length > 0 && (
            <View>
              <SectionTitle label={t.formation} />
              {data.formation.map((f, i) => (
                <View key={i} wrap={false} style={main.formRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={main.formDiplome}>{f.diplome}</Text>
                    <Text style={main.formEcole}>{f.etablissement}{f.mention ? ` · ${f.mention}` : ""}</Text>
                  </View>
                  <Text style={main.formAnnee}>{f.annee}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </Page>
    </Document>
  );
}

// ─── Template CLASSIQUE ───────────────────────────────────────────────────────
// Bandeau header violet + colonne unique élégante

function ClassiquePDF({ data, langue = "fr" }: { data: CVOptimise; langue?: "fr" | "en" }) {
  const t = L[langue];

  const s = StyleSheet.create({
    page: { fontFamily: "Inter", backgroundColor: C.white },
    headerBand: {
      backgroundColor: C.violet, paddingTop: 28, paddingBottom: 24,
      paddingHorizontal: 40,
    },
    accentLine: { height: 3, backgroundColor: C.teal },
    name: {
      fontFamily: "Inter", fontWeight: 700, fontSize: 24,
      color: C.white, letterSpacing: 0.5, lineHeight: 1.2,
    },
    titleHeader: {
      fontFamily: "Inter", fontWeight: 400, fontSize: 10.5,
      color: "rgba(255,255,255,0.75)", letterSpacing: 1.5,
      textTransform: "uppercase", marginTop: 5,
    },
    contacts: {
      flexDirection: "row", flexWrap: "wrap", gap: 14, marginTop: 10,
    },
    contactItem: {
      fontFamily: "Inter", fontWeight: 300, fontSize: 8,
      color: "rgba(255,255,255,0.7)",
    },
    body: { paddingHorizontal: 40, paddingVertical: 24 },
    resume: {
      fontFamily: "Inter", fontWeight: 300, fontSize: 9,
      color: C.muted, lineHeight: 1.65, marginBottom: 4,
      borderLeftWidth: 2, borderLeftColor: C.teal,
      paddingLeft: 10,
    },
    expBlock: { marginBottom: 13 },
    expHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", marginBottom: 2 },
    expPoste: { fontFamily: "Inter", fontWeight: 600, fontSize: 10, color: C.dark },
    expEntreprise: { fontFamily: "Inter", fontWeight: 500, fontSize: 9, color: C.teal },
    expSeparator: { fontFamily: "Inter", fontSize: 9, color: C.light },
    expPeriode: { fontFamily: "Inter", fontWeight: 300, fontSize: 8, color: C.light, letterSpacing: 0.2 },
    formRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", marginBottom: 7 },
    formDiplome: { fontFamily: "Inter", fontWeight: 600, fontSize: 10, color: C.dark },
    formEcole: { fontFamily: "Inter", fontWeight: 300, fontSize: 8.5, color: C.muted },
    formAnnee: { fontFamily: "Inter", fontWeight: 300, fontSize: 8, color: C.light },
    competencesText: {
      fontFamily: "Inter", fontWeight: 300, fontSize: 9,
      color: C.body, lineHeight: 1.7,
    },
    langText: {
      fontFamily: "Inter", fontWeight: 300, fontSize: 9,
      color: C.body, lineHeight: 1.7,
    },
  });

  const contacts = [data.email, data.telephone, data.localisation, data.linkedin].filter(Boolean);

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* HEADER BAND */}
        <View style={s.headerBand}>
          <Text style={s.name}>{data.nom}</Text>
          <Text style={s.titleHeader}>{data.titre}</Text>
          <View style={s.contacts}>
            {contacts.map((c, i) => (
              <Text key={i} style={s.contactItem}>{c}</Text>
            ))}
          </View>
        </View>
        <View style={s.accentLine} />

        {/* BODY */}
        <View style={s.body}>
          {data.resume ? <Text style={s.resume}>{data.resume}</Text> : null}

          {data.experience?.length > 0 && (
            <View>
              <SectionTitle label={t.experience} />
              {data.experience.map((exp, i) => (
                <View key={i} wrap={false} style={s.expBlock}>
                  <View style={s.expHeader}>
                    <View style={{ flexDirection: "row", alignItems: "baseline", gap: 6, flex: 1 }}>
                      <Text style={s.expPoste}>{exp.poste}</Text>
                      <Text style={s.expSeparator}>·</Text>
                      <Text style={s.expEntreprise}>{exp.entreprise}</Text>
                    </View>
                    <Text style={s.expPeriode}>{exp.periode}</Text>
                  </View>
                  {(exp.description ?? []).map((d, j) => <Bullet key={j} text={d} accent={C.violet} />)}
                </View>
              ))}
            </View>
          )}

          {data.formation?.length > 0 && (
            <View>
              <SectionTitle label={t.formation} />
              {data.formation.map((f, i) => (
                <View key={i} wrap={false} style={s.formRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.formDiplome}>{f.diplome}</Text>
                    <Text style={s.formEcole}>{f.etablissement}{f.mention ? ` · ${f.mention}` : ""}</Text>
                  </View>
                  <Text style={s.formAnnee}>{f.annee}</Text>
                </View>
              ))}
            </View>
          )}

          {data.competences?.length > 0 && (
            <View>
              <SectionTitle label={t.competences} />
              <Text style={s.competencesText}>{data.competences.join("   ·   ")}</Text>
            </View>
          )}

          {data.langues?.length ? (
            <View>
              <SectionTitle label={t.langues} />
              <Text style={s.langText}>
                {data.langues.map((l) => `${l.langue}  (${l.niveau})`).join("   ·   ")}
              </Text>
            </View>
          ) : null}
        </View>
      </Page>
    </Document>
  );
}

// ─── Template MINIMALISTE ─────────────────────────────────────────────────────
// Pure typographie, grandes marges, grille date | contenu

function MinimalistePDF({ data, langue = "fr" }: { data: CVOptimise; langue?: "fr" | "en" }) {
  const t = L[langue];

  const s = StyleSheet.create({
    page: { fontFamily: "Inter", backgroundColor: C.white, padding: 52 },
    name: {
      fontFamily: "Inter", fontWeight: 300, fontSize: 30,
      color: C.dark, letterSpacing: -0.5, lineHeight: 1.1, marginBottom: 5,
    },
    title: { fontFamily: "Inter", fontWeight: 400, fontSize: 11, color: C.muted, marginBottom: 8 },
    contacts: { flexDirection: "row", gap: 20, marginBottom: 28 },
    contactItem: { fontFamily: "Inter", fontWeight: 300, fontSize: 8, color: C.light },
    divider: { height: 1, backgroundColor: C.border, marginBottom: 22 },
    resume: {
      fontFamily: "Inter", fontWeight: 300, fontSize: 9,
      color: C.muted, lineHeight: 1.7, marginBottom: 26, maxWidth: 430,
    },
    sectionLabel: {
      fontFamily: "Inter", fontWeight: 600, fontSize: 7,
      letterSpacing: 2.5, textTransform: "uppercase",
      color: C.light, marginBottom: 14,
    },
    gridRow: { flexDirection: "row", gap: 18, marginBottom: 16 },
    colLeft: {
      width: 100, fontFamily: "Inter", fontWeight: 300,
      fontSize: 8, color: C.light, paddingTop: 1.5, lineHeight: 1.5,
    },
    colRight: { flex: 1 },
    expPoste: { fontFamily: "Inter", fontWeight: 600, fontSize: 10, color: C.dark, lineHeight: 1.3 },
    expEntreprise: { fontFamily: "Inter", fontWeight: 400, fontSize: 9, color: C.muted, marginTop: 1, marginBottom: 5 },
    formDiplome: { fontFamily: "Inter", fontWeight: 600, fontSize: 10, color: C.dark },
    formEcole: { fontFamily: "Inter", fontWeight: 300, fontSize: 8.5, color: C.muted, marginTop: 2 },
    skillsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    skillItem: { fontFamily: "Inter", fontWeight: 300, fontSize: 8.5, color: C.body },
    dash: { fontFamily: "Inter", fontSize: 8.5, color: C.border },
    bottomRow: { flexDirection: "row", gap: 40, marginTop: 4 },
    langItem: {
      fontFamily: "Inter", fontWeight: 300, fontSize: 8.5,
      color: C.body, lineHeight: 1.7,
    },
  });

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <Text style={s.name}>{data.nom}</Text>
        <Text style={s.title}>{data.titre}</Text>
        <View style={s.contacts}>
          {[data.email, data.telephone, data.localisation, data.linkedin].filter(Boolean).map((c, i) => (
            <Text key={i} style={s.contactItem}>{c}</Text>
          ))}
        </View>
        <View style={s.divider} />

        {data.resume ? <Text style={s.resume}>{data.resume}</Text> : null}

        {data.experience?.length > 0 && (
          <View style={{ marginBottom: 24 }}>
            <Text style={s.sectionLabel}>{t.experience}</Text>
            {data.experience.map((exp, i) => (
              <View key={i} wrap={false} style={s.gridRow}>
                <Text style={s.colLeft}>{exp.periode}</Text>
                <View style={s.colRight}>
                  <Text style={s.expPoste}>{exp.poste}</Text>
                  <Text style={s.expEntreprise}>{exp.entreprise}</Text>
                  {(exp.description ?? []).map((d, j) => (
                    <Text key={j} style={{ fontFamily: "Inter", fontWeight: 300, fontSize: 8.5, color: C.body, lineHeight: 1.5 }}>— {d}</Text>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}

        {data.formation?.length > 0 && (
          <View style={{ marginBottom: 24 }}>
            <Text style={s.sectionLabel}>{t.formation}</Text>
            {data.formation.map((f, i) => (
              <View key={i} wrap={false} style={s.gridRow}>
                <Text style={s.colLeft}>{f.annee}</Text>
                <View style={s.colRight}>
                  <Text style={s.formDiplome}>{f.diplome}</Text>
                  <Text style={s.formEcole}>{f.etablissement}{f.mention ? ` · ${f.mention}` : ""}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={s.divider} />
        <View style={s.bottomRow}>
          {data.competences?.length > 0 && (
            <View style={{ flex: 1 }}>
              <Text style={s.sectionLabel}>{t.competences}</Text>
              <View style={s.skillsRow}>
                {data.competences.map((c, i) => (
                  <View key={i} style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    {i > 0 && <Text style={s.dash}>·</Text>}
                    <Text style={s.skillItem}>{c}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
          {data.langues?.length ? (
            <View style={{ width: 150 }}>
              <Text style={s.sectionLabel}>{t.langues}</Text>
              {data.langues.map((l, i) => (
                <Text key={i} style={s.langItem}>
                  {l.langue}{" "}
                  <Text style={{ color: C.light }}>({l.niveau})</Text>
                </Text>
              ))}
            </View>
          ) : null}
        </View>
      </Page>
    </Document>
  );
}

// ─── Template ATS PRO ─────────────────────────────────────────────────────────
// Colonne unique, zéro décoration, optimisé parseurs ATS

function ATSProPDF({ data, langue = "fr" }: { data: CVOptimise; langue?: "fr" | "en" }) {
  const t = L[langue];

  // Limites strictes pour tenir sur 1 page
  const resume     = data.resume ? data.resume.slice(0, 260) : "";
  const competences = (data.competences ?? []).slice(0, 12);
  const experiences = (data.experience  ?? []).slice(0, 4);
  const formations  = (data.formation   ?? []).slice(0, 3);

  const s = StyleSheet.create({
    page:          { fontFamily: "Inter", backgroundColor: C.white, paddingTop: 28, paddingBottom: 28, paddingHorizontal: 38 },
    name:          { fontFamily: "Inter", fontWeight: 700, fontSize: 14, color: C.black, marginBottom: 1 },
    titleLine:     { fontFamily: "Inter", fontWeight: 400, fontSize: 9, color: "#333", marginBottom: 2 },
    contactLine:   { fontFamily: "Inter", fontWeight: 300, fontSize: 8, color: "#555", marginBottom: 10 },
    sectionTitle:  { fontFamily: "Inter", fontWeight: 700, fontSize: 8, color: C.black, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2, marginTop: 9 },
    divider:       { height: 1, backgroundColor: C.black, marginBottom: 5 },
    summaryText:   { fontFamily: "Inter", fontWeight: 300, fontSize: 8.5, color: "#1a1a1a", lineHeight: 1.45 },
    coreGrid:      { flexDirection: "row", flexWrap: "wrap", marginBottom: 1 },
    coreItem:      { fontFamily: "Inter", fontWeight: 400, fontSize: 8, color: "#1a1a1a", marginRight: 14, marginBottom: 2.5 },
    expBlock:      { marginBottom: 6 },
    expHeader:     { flexDirection: "row", justifyContent: "space-between", marginBottom: 1 },
    expPoste:      { fontFamily: "Inter", fontWeight: 600, fontSize: 8.5, color: C.black },
    expEntreprise: { fontFamily: "Inter", fontWeight: 400, fontSize: 8, color: "#333", fontStyle: "italic" },
    expPeriode:    { fontFamily: "Inter", fontWeight: 300, fontSize: 7.5, color: "#555" },
    bullet:        { fontFamily: "Inter", fontWeight: 300, fontSize: 8, color: "#1a1a1a", lineHeight: 1.35, marginLeft: 7, marginBottom: 1 },
    // Formation + Langues côte à côte
    bottomRow:     { flexDirection: "row", gap: 16 },
    col:           { flex: 1 },
    formRow:       { flexDirection: "row", justifyContent: "space-between", marginBottom: 3 },
    formDiplome:   { fontFamily: "Inter", fontWeight: 600, fontSize: 8.5, color: C.black },
    formEcole:     { fontFamily: "Inter", fontWeight: 300, fontSize: 8, color: "#333", marginTop: 0.5 },
    formAnnee:     { fontFamily: "Inter", fontWeight: 300, fontSize: 7.5, color: "#555" },
    langText:      { fontFamily: "Inter", fontWeight: 300, fontSize: 8, color: "#1a1a1a", lineHeight: 1.4 },
  });

  const contacts = [data.email, data.telephone, data.localisation, data.linkedin].filter(Boolean).join("  |  ");

  return (
    <Document>
      <Page size="A4" style={s.page}>

        {/* En-tête */}
        <Text style={s.name}>{data.nom}</Text>
        {data.titre   ? <Text style={s.titleLine}>{data.titre}</Text>     : null}
        {contacts     ? <Text style={s.contactLine}>{contacts}</Text>     : null}

        {/* Résumé — tronqué à 260 caractères */}
        {resume ? (
          <View>
            <Text style={s.sectionTitle}>{t.professionalSummary}</Text>
            <View style={s.divider} />
            <Text style={s.summaryText}>{resume}</Text>
          </View>
        ) : null}

        {/* Compétences clés — max 12 */}
        {competences.length > 0 && (
          <View>
            <Text style={s.sectionTitle}>{t.coreCompetencies}</Text>
            <View style={s.divider} />
            <View style={s.coreGrid}>
              {competences.map((c, i) => (
                <Text key={i} style={s.coreItem}>▪ {c}</Text>
              ))}
            </View>
          </View>
        )}

        {/* Expériences — max 4, max 3 bullets chacune */}
        {experiences.length > 0 && (
          <View>
            <Text style={s.sectionTitle}>{t.workExperience}</Text>
            <View style={s.divider} />
            {experiences.map((exp, i) => (
              <View key={i} wrap={false} style={s.expBlock}>
                <View style={s.expHeader}>
                  <View>
                    <Text style={s.expPoste}>{exp.poste}</Text>
                    <Text style={s.expEntreprise}>{exp.entreprise}</Text>
                  </View>
                  <Text style={s.expPeriode}>{exp.periode}</Text>
                </View>
                {(exp.description ?? []).slice(0, 3).map((d, j) => (
                  <Text key={j} style={s.bullet}>• {d}</Text>
                ))}
              </View>
            ))}
          </View>
        )}

        {/* Formation + Langues côte à côte pour économiser de la place */}
        <View style={s.bottomRow}>
          {formations.length > 0 && (
            <View style={s.col}>
              <Text style={s.sectionTitle}>{t.education}</Text>
              <View style={s.divider} />
              {formations.map((f, i) => (
                <View key={i} wrap={false} style={s.formRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.formDiplome}>{f.diplome}</Text>
                    <Text style={s.formEcole}>{f.etablissement}{f.mention ? ` — ${f.mention}` : ""}</Text>
                  </View>
                  <Text style={s.formAnnee}>{f.annee}</Text>
                </View>
              ))}
            </View>
          )}

          {data.langues?.length ? (
            <View style={s.col}>
              <Text style={s.sectionTitle}>{t.languages}</Text>
              <View style={s.divider} />
              <Text style={s.langText}>
                {data.langues.map((l) => `${l.langue} (${l.niveau})`).join("\n")}
              </Text>
            </View>
          ) : null}
        </View>

      </Page>
    </Document>
  );
}

// ─── Route API ────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const {
    cv,
    template = "moderne",
    langue = "fr",
  }: { cv: CVOptimise; template: TemplateName; langue?: "fr" | "en" } = await req.json();

  if (!cv) return NextResponse.json({ error: "Données CV manquantes" }, { status: 400 });

  try {
    const doc =
      template === "classique"   ? <ClassiquePDF    data={cv} langue={langue} /> :
      template === "minimaliste" ? <MinimalistePDF  data={cv} langue={langue} /> :
      template === "ats-pro"     ? <ATSProPDF       data={cv} langue={langue} /> :
                                   <ModernePDF      data={cv} langue={langue} />;

    const buffer = await renderToBuffer(doc);
    const filename = `cv-vitaie-${(cv.nom ?? "export").toLowerCase().replace(/\s+/g, "-")}.pdf`;

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    console.error("[export/pdf]", err);
    return NextResponse.json({ error: "Erreur lors de la génération du PDF" }, { status: 500 });
  }
}
