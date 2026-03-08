import Image from "next/image";
import SectionTitle from "./SectionTitle";

const galleryItems = [
  {
    id: "1",
    alt: "Detalhe de extensao de cilios em close",
    src: "/images/gallery/cliente-closeup-1.png",
    featured: true,
  },
  {
    id: "2",
    alt: "Extensao de cilios e sobrancelha desenhada",
    src: "/images/gallery/cliente-closeup-2.png",
  },
  {
    id: "3",
    alt: "Cliente em maca apos procedimento de cilios e sobrancelhas",
    src: "/images/gallery/cliente-retrato-1.png",
  },
  {
    id: "4",
    alt: "Cliente com cachos e sobrancelhas alinhadas",
    src: "/images/gallery/cliente-retrato-2.png",
  },
  {
    id: "5",
    alt: "Cliente com cilios marcantes em ambiente colorido",
    src: "/images/gallery/cliente-retrato-3.png",
  },
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
          subtitle="Alguns olhares que ja passaram pela minha maca"
        />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
          {galleryItems.map((item) => (
            <div
              key={item.id}
              className={`
                relative overflow-hidden rounded-xl md:rounded-2xl border border-rose-100/60
                card-hover bg-gradient-to-br from-rose-50 to-nude-100/80
                aspect-[4/5] sm:aspect-square
                ${item.featured ? "md:col-span-2 md:aspect-[16/9]" : ""}
              `}
            >
              <Image
                src={item.src}
                alt={item.alt}
                fill
                sizes="(min-width: 1024px) 520px, (min-width: 768px) 33vw, 50vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
