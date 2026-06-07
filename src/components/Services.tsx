"use client";

import { useState } from "react";
import Image from "next/image";
import SectionTitle from "./SectionTitle";
import { servicesData } from "@/data/services";
import { CtaWhatsApp } from "./CtaWhatsApp";
import ServiceGalleryModal from "./ServiceGalleryModal";
import type { ServiceItem } from "@/data/services";
import { cn } from "@/lib/utils";

function formatPrice(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function ServiceCard({
  service,
  message,
  onOpenGallery,
}: {
  service: ServiceItem;
  message?: string;
  onOpenGallery?: (service: ServiceItem) => void;
}) {
  const [imageError, setImageError] = useState(false);
  const hasImage = service.coverImage && !imageError;
  const hasCarousel =
    (service.coverImage || (service.galleryImages?.length ?? 0) > 0) && onOpenGallery;
  const defaultMessage = `Oi Sabrina! Gostaria de saber mais sobre ${service.name}.`;

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-rose-100/50",
        "bg-white/95 backdrop-blur-sm shadow-sm",
        "card-hover"
      )}
    >
      {/* Cover image or placeholder — clicável abre carrossel; hover mantém zoom */}
      <div
        className={cn(
          "relative aspect-[3/4] w-full flex-shrink-0 overflow-hidden bg-gradient-to-br from-rose-50 to-nude-100/80",
          hasCarousel && "cursor-pointer"
        )}
        onClick={hasCarousel ? () => onOpenGallery?.(service) : undefined}
        onKeyDown={
          hasCarousel
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onOpenGallery?.(service);
                }
              }
            : undefined
        }
        role={hasCarousel ? "button" : undefined}
        tabIndex={hasCarousel ? 0 : undefined}
        aria-label={hasCarousel ? `Ver fotos de ${service.name}` : undefined}
      >
        {service.coverImage && (
          <Image
            src={service.coverImage}
            alt=""
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className={cn(
              "object-cover transition-transform duration-300 group-hover:scale-[1.02]",
              !hasImage && "hidden"
            )}
            onError={() => setImageError(true)}
          />
        )}
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center",
            hasImage ? "hidden" : "flex"
          )}
          aria-hidden
        >
          <span className="font-serif text-nude-400/60 text-sm text-center px-4">
            {service.name}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5 md:p-6">
        <div className="mb-3">
          <h4 className="font-serif text-xl font-semibold text-nude-900 tracking-tight">
            {service.name}
          </h4>
          {service.subtitle && (
            <p className="mt-0.5 text-sm text-nude-600">{service.subtitle}</p>
          )}
        </div>

        {service.maintenance && (
          <p className="mb-3 text-xs text-nude-500 leading-relaxed">
            {service.maintenance}
          </p>
        )}

        <div className="mt-auto flex flex-col gap-3 pt-2">
          <p className="font-semibold text-rose-700">
            {formatPrice(service.price)}
          </p>
          <CtaWhatsApp
            message={message ?? defaultMessage}
            variant="primary"
            className="!py-2.5 !px-4 text-sm rounded-full w-full sm:w-auto"
          >
            Agendar no WhatsApp
          </CtaWhatsApp>
          {hasCarousel && (
            <button
              type="button"
              onClick={() => onOpenGallery(service)}
              className="text-sm text-nude-600 hover:text-rose-600 transition-colors underline underline-offset-2"
            >
              Ver fotos
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

export default function Services() {
  const [galleryService, setGalleryService] = useState<ServiceItem | null>(null);
  const [activeCategoryId, setActiveCategoryId] = useState(servicesData[0]?.id);
  const activeCategoryIndex = Math.max(
    servicesData.findIndex((category) => category.id === activeCategoryId),
    0
  );
  const activeCategory = servicesData[activeCategoryIndex] ?? servicesData[0];
  const hasMultipleCategories = servicesData.length > 1;

  function selectAdjacentCategory(direction: -1 | 1) {
    if (!hasMultipleCategories) {
      return;
    }

    const nextIndex =
      (activeCategoryIndex + direction + servicesData.length) %
      servicesData.length;
    setActiveCategoryId(servicesData[nextIndex].id);
  }

  return (
    <section
      id="servicos"
      className="section-spacing-lg bg-gradient-soft border-t border-rose-100/40"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <SectionTitle
          title="Serviços"
          subtitle="Procedimentos pensados para valorizar seu olhar"
        />

        <div className="relative">
          <div className="mb-8 md:mb-10">
            <div
              className="flex gap-3 overflow-x-auto rounded-full border border-rose-100/70 bg-white/65 p-2 shadow-sm backdrop-blur-sm"
              role="tablist"
              aria-label="Categorias de servicos"
            >
              {servicesData.map((category) => {
                const isActive = category.id === activeCategory.id;

                return (
                  <button
                    key={category.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-controls={`servicos-${category.id}`}
                    onClick={() => setActiveCategoryId(category.id)}
                    className={cn(
                      "min-w-[72%] sm:min-w-0 sm:flex-1 rounded-full px-5 py-3 text-left transition-all duration-300",
                      "focus-visible:outline-rose-400",
                      isActive
                        ? "bg-nude-950 text-white shadow-md shadow-nude-900/10"
                        : "bg-white/70 text-nude-700 hover:bg-rose-50 hover:text-nude-950"
                    )}
                  >
                    <span className="block font-serif text-xl font-semibold leading-tight">
                      {category.title}
                    </span>
                    {category.subtitle && (
                      <span
                        className={cn(
                          "mt-1 block text-xs leading-snug",
                          isActive ? "text-rose-100" : "text-nude-500"
                        )}
                      >
                        {category.subtitle}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div
            id={`servicos-${activeCategory.id}`}
            role="tabpanel"
            aria-live="polite"
            className="animate-fade-in"
          >
            <div className="mb-7 flex flex-col gap-4 md:mb-9 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-rose-500">
                  Categoria
                </p>
                <h3 className="mt-2 font-serif text-3xl font-semibold leading-tight text-nude-900 md:text-4xl">
                  {activeCategory.title}
                </h3>
                {activeCategory.subtitle && (
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-nude-600 md:text-base">
                    {activeCategory.subtitle}
                  </p>
                )}
              </div>

              {hasMultipleCategories && (
                <div className="flex items-center gap-2 self-start md:self-auto">
                  <button
                    type="button"
                    onClick={() => selectAdjacentCategory(-1)}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-rose-100 bg-white/80 text-xl text-nude-700 shadow-sm transition-colors hover:bg-rose-50 hover:text-rose-700"
                    aria-label="Categoria anterior"
                  >
                    <span aria-hidden>&larr;</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => selectAdjacentCategory(1)}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-rose-100 bg-white/80 text-xl text-nude-700 shadow-sm transition-colors hover:bg-rose-50 hover:text-rose-700"
                    aria-label="Proxima categoria"
                  >
                    <span aria-hidden>&rarr;</span>
                  </button>
                </div>
              )}
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-5 md:gap-6">
              {activeCategory.services.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  onOpenGallery={
                    service.coverImage || (service.galleryImages?.length ?? 0) > 0
                      ? setGalleryService
                      : undefined
                  }
                />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-14 md:mt-16 text-center">
          <p className="text-nude-600 text-sm md:text-base mb-4">
            Dúvida sobre qual procedimento combina com você? Posso te orientar.
          </p>
          <CtaWhatsApp
            message="Oi Sabrina! Gostaria de agendar ou tirar dúvidas sobre os serviços."
            variant="primary"
          >
            Agendar ou tirar dúvidas no WhatsApp
          </CtaWhatsApp>
        </div>
      </div>

      {galleryService && (() => {
        const images = [
          ...(galleryService.galleryImages ?? []),
          ...(galleryService.coverImage ? [galleryService.coverImage] : []),
        ].filter(Boolean);
        return images.length > 0 ? (
          <ServiceGalleryModal
            serviceName={galleryService.name}
            images={images}
            isOpen={true}
            onClose={() => setGalleryService(null)}
          />
        ) : null;
      })()}
    </section>
  );
}
