"use client";

import { useState } from "react";
import Link from "next/link";
import { CtaWhatsApp } from "./CtaWhatsApp";

const INSTAGRAM_URL = "https://www.instagram.com/salashes__";

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

        <nav className="hidden md:flex items-center gap-1 lg:gap-1.5">
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-nude-600 hover:text-rose-600 hover:bg-rose-50 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
            >
              {item.label}
            </Link>
          ))}
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram @salashes__"
            className="text-nude-600 hover:text-rose-600 hover:bg-rose-50 p-2 rounded-lg transition-colors duration-200"
          >
            <InstagramIcon className="w-5 h-5" />
          </a>
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
                className="py-3.5 px-4 rounded-xl text-nude-700 font-medium hover:bg-rose-50 hover:text-rose-600 transition-colors duration-200 min-h-[48px] flex items-center"
              >
                {item.label}
              </Link>
            ))}
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="py-3.5 px-4 rounded-xl text-nude-700 font-medium hover:bg-rose-50 hover:text-rose-600 transition-colors duration-200 min-h-[48px] flex items-center gap-3"
            >
              <InstagramIcon className="w-5 h-5 flex-shrink-0" />
              Instagram
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}
