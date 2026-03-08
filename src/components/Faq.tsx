"use client";

import { useState } from "react";
import SectionTitle from "./SectionTitle";
import { faqData } from "@/data/faq";
import { cn } from "@/lib/utils";

export default function Faq() {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <section
      id="faq"
      className="section-spacing-lg bg-gradient-soft border-t border-rose-100/40"
    >
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <SectionTitle
          title="Perguntas frequentes"
          subtitle="Respostas rápidas para o que mais perguntam"
        />
        <div className="space-y-2 sm:space-y-3">
          {faqData.map((item) => {
            const isOpen = openId === item.id;
            return (
              <div
                key={item.id}
                className="bg-white/95 backdrop-blur-sm rounded-xl md:rounded-2xl border border-rose-100/50 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : item.id)}
                  className="w-full flex items-center justify-between gap-4 py-4 px-5 md:py-5 md:px-6 text-left font-medium text-nude-900 hover:bg-rose-50/50 transition-colors min-h-[56px] md:min-h-[60px]"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm md:text-base pr-2">{item.question}</span>
                  <span
                    className={cn(
                      "flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center bg-rose-100/70 text-rose-700 transition-transform duration-200",
                      isOpen && "rotate-180"
                    )}
                    aria-hidden
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </span>
                </button>
                <div
                  className={cn(
                    "overflow-hidden transition-all duration-200 ease-out",
                    isOpen ? "max-h-96" : "max-h-0"
                  )}
                >
                  <div className="py-0 px-5 pb-5 md:px-6 md:pb-6 text-nude-700 text-sm md:text-base leading-relaxed border-t border-rose-100/40 pt-3">
                    {item.answer}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
