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

        <div className="space-y-12 md:space-y-16">
          {servicesData.map((category, catIndex) => (
            <div key={category.id} className="relative">
              <div
                className="flex items-center gap-4 mb-8 md:mb-10"
                aria-hidden
              >
                <span className="h-px flex-1 bg-gradient-to-r from-transparent via-rose-200/60 to-transparent" />
                <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-nude-400">
                  {category.title}
                </span>
                <span className="h-px flex-1 bg-gradient-to-r from-transparent via-rose-200/60 to-transparent" />
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-5 md:gap-6">
                {category.services.map((service) => (
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
          ))}
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
