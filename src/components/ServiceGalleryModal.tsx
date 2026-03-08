"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

type ServiceGalleryModalProps = {
  serviceName: string;
  images: string[];
  isOpen: boolean;
  onClose: () => void;
  /** Índice inicial ao abrir (ex.: foto clicada na galeria) */
  initialIndex?: number;
};

export default function ServiceGalleryModal({
  serviceName,
  images,
  isOpen,
  onClose,
  initialIndex = 0,
}: ServiceGalleryModalProps) {
  const [index, setIndex] = useState(initialIndex);

  useEffect(() => {
    if (isOpen && images.length > 0)
      setIndex(Math.min(images.length - 1, Math.max(0, initialIndex)));
    else setIndex(0);
  }, [isOpen, initialIndex, images.length]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen || images.length === 0) return null;

  const goPrev = () => setIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  const goNext = () => setIndex((i) => (i === images.length - 1 ? 0 : i + 1));

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Galeria: ${serviceName}`}
    >
      <div
        className="absolute inset-0 bg-nude-900/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative w-full max-w-lg rounded-2xl overflow-hidden bg-nude-900/95 shadow-xl border border-nude-700/50 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-3 py-2.5 sm:px-4 sm:py-3 border-b border-nude-700/50 flex-shrink-0">
          <h3 className="font-serif text-base sm:text-lg font-semibold text-white truncate pr-2">
            {serviceName}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full text-nude-300 hover:bg-nude-700/60 hover:text-white transition-colors touch-manipulation"
            aria-label="Fechar"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Área da foto: fundo escuro + blur da própria imagem — zero branco na moldura */}
        <div className="relative aspect-[3/4] min-h-[280px] overflow-hidden bg-nude-900">
          <Image
            src={images[index]}
            alt=""
            fill
            sizes="(max-width: 512px) 100vw, 32rem"
            className="object-cover scale-[1.15] blur-2xl opacity-80"
            aria-hidden
          />
          <Image
            src={images[index]}
            alt=""
            fill
            sizes="(max-width: 512px) 100vw, 32rem"
            className="object-contain drop-shadow-2xl"
          />
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); goPrev(); }}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-black/60 transition-colors"
                aria-label="Foto anterior"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); goNext(); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-black/60 transition-colors"
                aria-label="Próxima foto"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
        </div>

        {images.length > 1 && (
          <div className="flex justify-center flex-wrap gap-1.5 sm:gap-2 py-3 px-2 bg-nude-900/95 flex-shrink-0">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                className={cn(
                  "w-2.5 h-2.5 sm:w-2 sm:h-2 rounded-full transition-colors touch-manipulation",
                  i === index ? "bg-rose-400" : "bg-white/40 hover:bg-white/60 active:bg-white/70"
                )}
                aria-label={`Ir para foto ${i + 1} de ${images.length}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
