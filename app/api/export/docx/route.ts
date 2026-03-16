import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  AlignmentType, BorderStyle, Table, TableRow, TableCell,
  WidthType, ShadingType,
} from "docx";
import type { CVOptimise } from "@/types";

function makeSection(title: string) {
  return new Paragraph({
    children: [new TextRun({ text: title.toUpperCase(), bold: true, color: "5B2D8E", size: 22 })],
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "5B2D8E" } },
    spacing: { before: 240, after: 120 },
  });
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { cv }: { cv: CVOptimise } = await req.json();
  if (!cv) return NextResponse.json({ error: "Données CV manquantes" }, { status: 400 });

  const children: (Paragraph | Table)[] = [];

  // En-tête : Nom + titre
  children.push(
    new Paragraph({
      children: [new TextRun({ text: cv.nom, bold: true, size: 36, color: "1C1C2E" })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
    }),
    new Paragraph({
      children: [new TextRun({ text: cv.titre, size: 24, color: "5B2D8E", bold: true })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
    })
  );

  // Contacts
  const contacts = [cv.email, cv.telephone, cv.localisation, cv.linkedin].filter(Boolean).join("  |  ");
  if (contacts) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: contacts, size: 18, color: "6B7280" })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      })
    );
  }

  // Résumé
  if (cv.resume) {
    children.push(makeSection("Profil"));
    children.push(
      new Paragraph({
        children: [new TextRun({ text: cv.resume, size: 20 })],
        spacing: { after: 80 },
      })
    );
  }

  // Expériences
  if (cv.experience?.length) {
    children.push(makeSection("Expérience professionnelle"));
    for (const exp of cv.experience) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: exp.poste, bold: true, size: 22 }),
            new TextRun({ text: `  —  ${exp.entreprise}`, size: 22, color: "5B2D8E" }),
            new TextRun({ text: `  ·  ${exp.periode}`, size: 18, color: "9CA3AF" }),
          ],
          spacing: { before: 160, after: 60 },
        })
      );
      for (const desc of (exp.description ?? [])) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: `▸  ${desc}`, size: 18, color: "374151" })],
            spacing: { after: 40 },
          })
        );
      }
    }
  }

  // Formations
  if (cv.formation?.length) {
    children.push(makeSection("Formation"));
    for (const f of cv.formation) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: f.diplome, bold: true, size: 20 }),
            new TextRun({ text: `  —  ${f.etablissement}`, size: 20, color: "5B2D8E" }),
            new TextRun({ text: `  ·  ${f.annee}`, size: 18, color: "9CA3AF" }),
            ...(f.mention ? [new TextRun({ text: `  ·  ${f.mention}`, size: 18, color: "1AA8A8" })] : []),
          ],
          spacing: { before: 120, after: 60 },
        })
      );
    }
  }

  // Compétences
  if (cv.competences?.length) {
    children.push(makeSection("Compétences"));
    children.push(
      new Paragraph({
        children: [new TextRun({ text: cv.competences.join("   ·   "), size: 20 })],
        spacing: { after: 80 },
      })
    );
  }

  // Langues
  if (cv.langues?.length) {
    children.push(makeSection("Langues"));
    children.push(
      new Paragraph({
        children: [new TextRun({ text: cv.langues.map((l) => `${l.langue} (${l.niveau})`).join("   ·   "), size: 20 })],
      })
    );
  }

  const doc = new Document({
    sections: [{ children }],
    styles: {
      default: {
        document: {
          run: { font: "Calibri", size: 20, color: "1C1C2E" },
        },
      },
    },
  });

  const buffer = await Packer.toBuffer(doc);

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="cv-${(cv.nom ?? "export").toLowerCase().replace(/\s+/g, "-")}.docx"`,
    },
  });
}
