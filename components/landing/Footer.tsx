import Link from "next/link";
import Image from "next/image";
import { Twitter, Linkedin, Github } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#1C1C2E] text-white py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Logo & description */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Image src="/logo.png" alt="VitAIe" width={32} height={32} className="rounded-xl" />
              <span className="font-bold text-lg">VitAIe</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
              L'IA qui transforme ton CV en candidature parfaite. Optimisé ATS,
              lettre personnalisée, en 30 secondes.
            </p>
            <div className="flex gap-3 mt-5">
              <a href="#" className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition">
                <Github className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Produit */}
          <div>
            <p className="text-sm font-semibold mb-4 text-gray-300">Produit</p>
            <ul className="space-y-2.5">
              {[
                ["Fonctionnalités", "#fonctionnalites"],
                ["Tarifs", "#tarifs"],
                ["FAQ", "#faq"],
                ["Dashboard", "/dashboard"],
              ].map(([label, href]) => (
                <li key={label}>
                  <Link href={href} className="text-sm text-gray-400 hover:text-white transition">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Légal */}
          <div>
            <p className="text-sm font-semibold mb-4 text-gray-300">Légal</p>
            <ul className="space-y-2.5">
              {[
                ["Mentions légales", "#"],
                ["Politique de confidentialité", "#"],
                ["CGU", "#"],
                ["Cookies", "#"],
              ].map(([label, href]) => (
                <li key={label}>
                  <a href={href} className="text-sm text-gray-400 hover:text-white transition">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            © 2026 VitAIe. Tous droits réservés.
          </p>
          <p className="text-xs text-gray-500">
            Propulsé par Claude AI · Hébergé sur Vercel
          </p>
        </div>
      </div>
    </footer>
  );
}
