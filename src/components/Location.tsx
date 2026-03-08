import SectionTitle from "./SectionTitle";
import { CtaWhatsApp } from "./CtaWhatsApp";

export default function Location() {
  return (
    <section
      id="localizacao"
      className="section-spacing-lg bg-white border-t border-rose-100/40"
    >
      <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
        <SectionTitle
          title="Onde me encontrar"
          subtitle="Atendimento com horário agendado"
        />
        <div className="rounded-2xl md:rounded-3xl bg-nude-50/90 border border-rose-100/50 p-8 md:p-12">
          <p className="font-serif text-xl md:text-2xl text-nude-900">
            Ermelino Matarazzo, São Paulo
          </p>
          <p className="mt-3 text-nude-600 text-sm md:text-base leading-relaxed">
            O endereço completo envio no WhatsApp depois que a gente confirma o agendamento — assim fica mais seguro e tranquilo para você.
          </p>
          <div className="mt-8 md:mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <CtaWhatsApp
              message="Oi Sabrina! Gostaria de agendar um horário."
              variant="primary"
              className="w-full sm:w-auto"
            >
              Agendar atendimento
            </CtaWhatsApp>
            <CtaWhatsApp variant="secondary" className="w-full sm:w-auto">
              Só quero falar no WhatsApp
            </CtaWhatsApp>
          </div>
        </div>
      </div>
    </section>
  );
}
