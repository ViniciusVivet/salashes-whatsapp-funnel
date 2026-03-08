import SectionTitle from "./SectionTitle";
import { testimonialsData } from "@/data/testimonials";
import { cn } from "@/lib/utils";

export default function Testimonials() {
  return (
    <section
      id="depoimentos"
      className="relative overflow-hidden section-spacing-lg bg-testimonials-soft border-t border-rose-100/40"
    >
      <div className="ornament-floral-right" aria-hidden />
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <SectionTitle
          title="Depoimentos"
          subtitle="O que quem passou por aqui comenta"
        />
        <div className="grid md:grid-cols-3 gap-5 md:gap-6">
          {testimonialsData.map((t) => (
            <div
              key={t.id}
              className={cn(
                "relative bg-white/95 backdrop-blur-sm rounded-2xl p-6 md:p-7 border border-rose-100/50",
                "card-hover"
              )}
            >
              <span
                className="absolute top-5 left-6 font-serif text-3xl text-rose-200/80 leading-none select-none"
                aria-hidden
              >
                “
              </span>
              <div className="flex items-center gap-3 mb-4 mt-1">
                <div className="w-11 h-11 rounded-full bg-rose-100/80 flex items-center justify-center text-rose-700 font-semibold text-sm shrink-0">
                  {t.initials ?? t.name.slice(0, 2).toUpperCase()}
                </div>
                <span className="font-medium text-nude-900">{t.name}</span>
              </div>
              <p className="text-nude-700 leading-relaxed text-sm md:text-base pl-0">
                {t.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
