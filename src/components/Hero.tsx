import Link from "next/link";
import { CtaWhatsApp } from "./CtaWhatsApp";

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative min-h-[88vh] sm:min-h-[90vh] flex flex-col justify-center pt-28 sm:pt-32 pb-20 sm:pb-24 px-4 sm:px-6 bg-gradient-hero overflow-hidden"
    >
      <div
        className="absolute inset-0 pointer-events-none opacity-25 sm:opacity-30"
        aria-hidden
      >
        <div className="absolute top-16 right-0 w-56 h-56 sm:w-64 sm:h-64 rounded-full bg-rose-200/50 blur-3xl" />
        <div className="absolute bottom-24 left-0 w-40 h-40 sm:w-48 sm:h-48 rounded-full bg-nude-300/40 blur-3xl" />
      </div>

      <div className="relative max-w-3xl mx-auto text-center">
        <p className="font-serif text-rose-600/90 text-xs sm:text-sm uppercase tracking-[0.22em] mb-5 animate-fade-in">
          Lash & Brow Designer
        </p>
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-nude-900 tracking-tight leading-[1.15] animate-fade-in-up">
          Seu olhar em destaque, com cuidado que faz diferença
        </h1>
        <p className="mt-6 sm:mt-7 text-base sm:text-lg md:text-xl text-nude-600 max-w-xl mx-auto leading-relaxed animate-fade-in-up">
          Atendimento personalizado em cílios e sobrancelhas no Ermelino Matarazzo. Aqui o foco é você: combinamos o procedimento certo e um resultado que você vai amar.
        </p>
        <div className="mt-10 sm:mt-12 flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 justify-center items-center animate-fade-in-up">
          <CtaWhatsApp variant="primary" className="w-full sm:w-auto">
            Quero falar no WhatsApp
          </CtaWhatsApp>
          <Link
            href="#servicos"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border-2 border-wine-200/80 text-nude-800 px-6 py-3.5 sm:px-8 sm:py-4 rounded-full text-base font-medium hover:border-rose-300 hover:bg-rose-50/60 transition-all"
          >
            Ver serviços
          </Link>
        </div>
      </div>

      <div className="relative mt-14 sm:mt-16 max-w-4xl mx-auto px-4" aria-hidden>
        <div className="relative aspect-[16/9] sm:aspect-[4/2] max-h-56 sm:max-h-64 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-rose-100/90 via-rose-50/70 to-nude-200/60 border border-rose-100/40 overflow-hidden">
          <div className="absolute inset-0 opacity-15" aria-hidden>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full border border-rose-300/60" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full border border-rose-200/50" />
          </div>
        </div>
      </div>
    </section>
  );
}
