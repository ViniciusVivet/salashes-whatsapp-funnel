import SectionTitle from "./SectionTitle";

const galleryItems = [
  { id: "1", alt: "Extensão de cílios", featured: true },
  { id: "2", alt: "Design de sobrancelhas" },
  { id: "3", alt: "Fox eyes" },
  { id: "4", alt: "Brow lamination" },
  { id: "5", alt: "Detalhe dos cílios" },
  { id: "6", alt: "Atendimento" },
];

export default function Gallery() {
  return (
    <section
      id="galeria"
      className="section-spacing-lg bg-white border-t border-rose-100/40"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <SectionTitle
          title="Galeria"
          subtitle="Alguns resultados e momentos do meu trabalho"
        />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
          {galleryItems.map((item) => (
            <div
              key={item.id}
              className={`
                overflow-hidden rounded-xl md:rounded-2xl border border-rose-100/50
                card-hover bg-gradient-to-br from-rose-50 to-nude-100/80
                aspect-square
                ${item.featured ? "md:col-span-2 md:aspect-[2/1]" : ""}
              `}
            >
              <div
                className="w-full h-full flex items-center justify-center min-h-[120px] sm:min-h-[160px] md:min-h-[200px] group"
                role="img"
                aria-label={item.alt}
              >
                <span className="text-nude-400/60 text-[10px] sm:text-xs text-center px-2 font-medium group-hover:text-nude-500/80 transition-colors">
                  {item.alt}
                </span>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-6 text-center text-nude-500 text-sm">
          Estrutura pronta para suas fotos em{" "}
          <code className="text-nude-600 bg-nude-100/80 px-1.5 py-0.5 rounded text-xs">public/images</code>.
        </p>
      </div>
    </section>
  );
}
