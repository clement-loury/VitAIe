"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { useUser, UserButton } from "@clerk/nextjs";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { isSignedIn, isLoaded } = useUser();

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="VitAIe" width={44} height={44} className="rounded-xl" />
          <span className="font-bold text-gray-900 text-xl">VitAIe</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#fonctionnalites" className="text-sm text-gray-600 hover:text-gray-900 transition">
            Fonctionnalités
          </a>
          <a href="#tarifs" className="text-sm text-gray-600 hover:text-gray-900 transition">
            Tarifs
          </a>
          <a href="#faq" className="text-sm text-gray-600 hover:text-gray-900 transition">
            FAQ
          </a>
        </div>

        {/* CTAs desktop */}
        <div className="hidden md:flex items-center gap-3">
          {isLoaded && isSignedIn ? (
            <>
              <Link href="/dashboard">
                <Button variant="secondary" size="sm">Mon Dashboard</Button>
              </Link>
              <UserButton />
            </>
          ) : (
            <>
              <Link href="/sign-in">
                <Button variant="ghost" size="sm">Connexion</Button>
              </Link>
              <Link href="/sign-up">
                <Button size="sm">Essayer gratuitement</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 rounded-xl hover:bg-gray-100"
          onClick={() => setOpen(!open)}
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Menu mobile */}
      {open && (
        <div className="md:hidden bg-white border-t border-gray-100 px-6 py-4 space-y-3">
          <a href="#fonctionnalites" className="block text-sm text-gray-700 py-2">Fonctionnalités</a>
          <a href="#tarifs" className="block text-sm text-gray-700 py-2">Tarifs</a>
          <a href="#faq" className="block text-sm text-gray-700 py-2">FAQ</a>
          <div className="pt-2 flex flex-col gap-2">
            {isLoaded && isSignedIn ? (
              <Link href="/dashboard">
                <Button className="w-full">Mon Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link href="/sign-in"><Button variant="secondary" className="w-full">Connexion</Button></Link>
                <Link href="/sign-up"><Button className="w-full">Essayer gratuitement</Button></Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
