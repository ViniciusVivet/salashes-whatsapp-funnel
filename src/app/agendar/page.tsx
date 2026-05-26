import ScheduleRequestForm from "@/components/scheduling/ScheduleRequestForm";

export const metadata = {
  title: "Agendar horario | Sabrina Lashes",
  description:
    "Solicite seu horario na Sabrina Lashes e aguarde a confirmacao pelo WhatsApp.",
};

export default function SchedulePage() {
  return (
    <main className="min-h-screen bg-gradient-soft px-4 py-10 sm:px-6 sm:py-14">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 text-center">
          <p className="font-serif text-sm uppercase tracking-[0.22em] text-rose-600">
            Sabrina Lashes
          </p>
          <h1 className="mt-3 font-serif text-4xl font-semibold leading-tight text-nude-900 sm:text-5xl">
            Solicitar horario
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-nude-600 sm:text-lg">
            Preencha seus dados e escolha o procedimento. A confirmacao final
            acontece pelo WhatsApp para evitar conflito de agenda.
          </p>
        </div>

        <ScheduleRequestForm />
      </div>
    </main>
  );
}
