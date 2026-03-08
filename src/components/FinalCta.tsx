import { CtaWhatsApp } from "./CtaWhatsApp";

export default function FinalCta() {
  return (
    <section className="section-spacing-lg bg-gradient-to-b from-rose-100/50 to-nude-100/70 border-t border-rose-100/40">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
        <h2 className="font-serif text-3xl md:text-4xl font-semibold text-nude-900 tracking-tight leading-tight">
          Pronta para realçar o olhar?
        </h2>
        <p className="mt-4 md:mt-5 text-nude-600 md:text-nude-700 text-base md:text-lg">
          Manda um oi no WhatsApp que a gente combina o melhor para você.
        </p>
        <div className="mt-8 md:mt-10">
          <CtaWhatsApp variant="primary" className="!px-10 !py-4 text-lg">
            Chamar no WhatsApp
          </CtaWhatsApp>
        </div>
      </div>
    </section>
  );
}
