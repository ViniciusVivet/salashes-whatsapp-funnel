"use client";

import { useState } from "react";
import Link from "next/link";
import { CtaWhatsApp } from "./CtaWhatsApp";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "#sobre", label: "Sobre" },
  { href: "#servicos", label: "Serviços" },
  { href: "#galeria", label: "Galeria" },
  { href: "#depoimentos", label: "Depoimentos" },
  { href: "#localizacao", label: "Onde fico" },
  { href: "#faq", label: "FAQ" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-nude-50/98 backdrop-blur-md border-b border-rose-100/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16 sm:h-[4.25rem]">
        <Link
          href="#hero"
          className="font-serif text-xl sm:text-2xl font-semibold text-nude-900 hover:text-wine-700 transition-colors py-2"
          onClick={() => setOpen(false)}
        >
          Sabrina Lashes
        </Link>

        <nav className="hidden md:flex items-center gap-7 lg:gap-8">
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-nude-600 hover:text-wine-600 text-sm font-medium transition-colors py-2"
            >
              {item.label}
            </Link>
          ))}
          <CtaWhatsApp
            variant="primary"
            className="!py-2.5 !px-5 text-sm rounded-full"
          >
            Falar no WhatsApp
          </CtaWhatsApp>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3 md:hidden">
          <CtaWhatsApp
            variant="primary"
            className="!py-3 !px-4 text-sm rounded-full min-h-[44px]"
          >
            WhatsApp
          </CtaWhatsApp>
          <button
            type="button"
            aria-expanded={open}
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            onClick={() => setOpen(!open)}
            className="min-w-[44px] min-h-[44px] p-2 rounded-xl text-nude-700 hover:bg-rose-100/50 transition-colors flex items-center justify-center"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              {open ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div
          className="md:hidden border-t border-rose-100/50 bg-nude-50/98 backdrop-blur-md animate-fade-in"
          role="dialog"
          aria-label="Menu de navegação"
        >
          <nav className="max-w-6xl mx-auto px-4 py-5 flex flex-col gap-0.5">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="py-3.5 px-4 rounded-xl text-nude-700 font-medium hover:bg-rose-100/50 hover:text-wine-700 transition-colors min-h-[48px] flex items-center"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
