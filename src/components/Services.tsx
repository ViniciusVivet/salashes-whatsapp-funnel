import SectionTitle from "./SectionTitle";
import { servicesData } from "@/data/services";
import { CtaWhatsApp } from "./CtaWhatsApp";
import { cn } from "@/lib/utils";

function formatPrice(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export default function Services() {
  return (
    <section
      id="servicos"
      className="section-spacing-lg bg-gradient-soft border-t border-rose-100/40"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <SectionTitle
          title="Serviços"
          subtitle="Procedimentos pensados para valorizar seu olhar"
        />

        <div className="space-y-20 md:space-y-24">
          {servicesData.map((category, catIndex) => (
            <div key={category.id} className="relative">
              {catIndex > 0 && (
                <div
                  className="absolute -top-10 left-1/2 -translate-x-1/2 w-px h-8 bg-gradient-to-b from-transparent to-rose-200/60"
                  aria-hidden
                />
              )}
              <div className="text-center mb-10 md:mb-12">
                <h3 className="font-serif text-2xl md:text-3xl font-semibold text-nude-900 tracking-tight">
                  {category.title}
                </h3>
                {category.subtitle && (
                  <p className="mt-2 text-nude-600 text-sm md:text-base max-w-md mx-auto">
                    {category.subtitle}
                  </p>
                )}
              </div>
              <div className="grid sm:grid-cols-2 gap-4 md:gap-5">
                {category.services.map((service) => (
                  <div
                    key={service.id}
                    className={cn(
                      "group relative bg-white/90 backdrop-blur-sm rounded-2xl p-5 md:p-6 border border-rose-100/50",
                      "card-hover"
                    )}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <h4 className="font-medium text-nude-900 text-base md:text-lg pr-2">
                        {service.name}
                      </h4>
                      <span
                        className="inline-flex items-center font-semibold text-rose-700 text-base shrink-0 w-fit py-1 px-3 rounded-full bg-rose-50 border border-rose-100/80"
                        aria-label={`Preço: ${formatPrice(service.price)}`}
                      >
                        {formatPrice(service.price)}
                      </span>
                    </div>
                    {service.description && (
                      <p className="mt-2 text-sm text-nude-600">
                        {service.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 md:mt-20 text-center">
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
    </section>
  );
}
