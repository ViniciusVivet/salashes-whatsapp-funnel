import Image from "next/image";
import SectionTitle from "./SectionTitle";
import { CtaWhatsApp } from "./CtaWhatsApp";

export default function About() {
  return (
    <section
      id="sobre"
      className="section-spacing-lg bg-white border-t border-rose-100/40"
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <SectionTitle
          title="Sobre a Sabrina"
          subtitle="Quem cuida do seu olhar com dedicação e técnica"
        />
        <div className="space-y-5 text-nude-700 leading-relaxed">
          <p className="text-lg md:text-xl text-nude-800">
            Sou a <strong className="text-nude-900 font-semibold">Sabrina Silva</strong>, Lash & Brow Designer. Atendo no Ermelino Matarazzo e adoro quando a cliente sai sentindo que o olhar combina com ela — nem exagerado, nem sem graça.
          </p>
          <p>
            Cada procedimento é pensado no seu rosto, no seu dia a dia e no que você curte. Seja extensão de cílios, design de sobrancelhas ou brow lamination, o objetivo é sempre realçar o que você já tem de bonito.
          </p>
          <p>
            Atendo com horário marcado, uma cliente por vez. Assim consigo dedicar tempo e atenção. Se quiser conversar antes de agendar, é só chamar.
          </p>
        </div>
        <div className="mt-8 flex flex-wrap gap-3 sm:gap-4">
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border border-rose-100/70 bg-rose-50/60">
            <Image
              src="/images/gallery/cliente-closeup-2.png"
              alt="Extensao de cilios em cliente real"
              fill
              sizes="96px"
              className="object-cover"
            />
          </div>
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border border-rose-100/70 bg-rose-50/60">
            <Image
              src="/images/gallery/cliente-retrato-1.png"
              alt="Cliente apos procedimento na maca"
              fill
              sizes="96px"
              className="object-cover"
            />
          </div>
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border border-rose-100/70 bg-rose-50/60 hidden sm:block">
            <Image
              src="/images/gallery/cliente-retrato-2.png"
              alt="Cliente com sobrancelhas alinhadas"
              fill
              sizes="96px"
              className="object-cover"
            />
          </div>
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border border-rose-100/70 bg-rose-50/60 hidden sm:block">
            <Image
              src="/images/gallery/cliente-retrato-5.png"
              alt="Cliente apos procedimento"
              fill
              sizes="96px"
              className="object-cover"
            />
          </div>
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border border-rose-100/70 bg-rose-50/60 hidden sm:block">
            <Image
              src="/images/gallery/cliente-retrato-6.png"
              alt="Cliente no studio"
              fill
              sizes="96px"
              className="object-cover"
            />
          </div>
        </div>
        <div className="mt-10">
          <CtaWhatsApp variant="secondary">
            Conte comigo — chame no WhatsApp
          </CtaWhatsApp>
        </div>
      </div>
    </section>
  );
}
