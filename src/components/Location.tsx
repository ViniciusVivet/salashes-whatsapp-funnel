import SectionTitle from "./SectionTitle";
import { CtaWhatsApp } from "./CtaWhatsApp";

const GOOGLE_MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=Rua+Ba%C3%ADa+dos+Pinheiros,+S%C3%A3o+Paulo,+SP";

const highlights = [
  "Fácil acesso – Ermelino Matarazzo",
  "Atendimento com horário marcado",
  "Veja a rota direto no Maps",
];

function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  );
}

export default function Location() {
  return (
    <section
      id="localizacao"
      className="section-spacing-lg bg-white border-t border-rose-100/40"
    >
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <SectionTitle
          title="Onde me encontrar"
          subtitle="Atendimento com horário agendado"
        />

        <div className="mt-8 md:mt-10 rounded-2xl md:rounded-3xl bg-gradient-to-br from-nude-50 to-rose-50/40 border border-rose-100/50 shadow-sm overflow-hidden">
          <div className="p-8 md:p-10 lg:p-12">
            {/* Endereço em destaque */}
            <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4 text-left">
              <span className="flex-shrink-0 w-10 h-10 rounded-full bg-rose-100/80 flex items-center justify-center text-rose-600">
                <MapPinIcon className="w-5 h-5" />
              </span>
              <div>
                <p className="font-serif text-xl md:text-2xl text-nude-900 leading-snug">
                  Rua Baía dos Pinheiros
                </p>
                <p className="mt-1 text-nude-700 text-base md:text-lg">
                  Ermelino Matarazzo / Vila Paranaguá
                </p>
                <p className="mt-0.5 text-nude-600 text-sm md:text-base">
                  São Paulo, SP
                </p>
              </div>
            </div>

            <p className="mt-5 text-nude-600 text-sm md:text-base leading-relaxed">
              Confira a rota e o tempo de deslocamento antes de agendar.
            </p>

            {/* Destaques */}
            <ul className="mt-6 flex flex-wrap gap-2 sm:gap-3" aria-hidden>
              {highlights.map((label) => (
                <li
                  key={label}
                  className="inline-flex items-center rounded-full bg-white/80 border border-rose-100/60 px-3.5 py-1.5 text-xs md:text-sm text-nude-700"
                >
                  {label}
                </li>
              ))}
            </ul>

            {/* CTAs */}
            <div className="mt-8 md:mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <CtaWhatsApp
                message="Oi Sabrina! Gostaria de agendar um horário."
                variant="primary"
                className="w-full sm:w-auto"
              >
                Agendar atendimento
              </CtaWhatsApp>
              <a
                href={GOOGLE_MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Abrir localização no Google Maps"
                className="inline-flex items-center justify-center gap-2 font-medium border-2 border-rose-200/80 text-nude-800 px-6 py-3.5 sm:px-8 sm:py-4 rounded-full text-base hover:border-rose-300 hover:bg-rose-50/70 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-rose-400 w-full sm:w-auto"
              >
                <MapPinIcon className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                Abrir no Google Maps
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
