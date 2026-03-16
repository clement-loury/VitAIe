import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "VitAIe — CV & Lettres optimisés par l'IA",
  description:
    "Génère une lettre de motivation parfaite et optimise ton CV pour les filtres ATS en 30 secondes.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="fr">
        <body className={`${inter.className} antialiased`}>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                borderRadius: "12px",
                fontFamily: "Inter, sans-serif",
                fontSize: "14px",
              },
              success: { iconTheme: { primary: "#5B2D8E", secondary: "white" } },
            }}
          />
        </body>
      </html>
    </ClerkProvider>
  );
}
