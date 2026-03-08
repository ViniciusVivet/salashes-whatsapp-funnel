export type ServiceCategory = {
  id: string;
  title: string;
  subtitle?: string;
  services: ServiceItem[];
};

export type ServiceItem = {
  id: string;
  name: string;
  /** Optional short tagline or style (e.g. "Efeito delineado") */
  subtitle?: string;
  /** Main image path under public. Shown on the card only. Add path when file exists. */
  coverImage?: string;
  /** Extra images for the "Ver fotos" modal carousel. Not shown on the card. */
  galleryImages?: string[];
  /** Optional maintenance info (e.g. "Manutenção a cada 2–3 semanas") */
  maintenance?: string;
  price: number;
  description?: string;
};

export const servicesData: ServiceCategory[] = [
  {
    id: "cilios",
    title: "Extensão de Cílios",
    subtitle: "Técnicas que valorizam seu olhar com naturalidade ou drama",
    services: [
      {
        id: "brasileiro",
        name: "Volume brasileiro",
        subtitle: "Preto ou marrom",
        coverImage: "/images/services/brasileiro.png",
        galleryImages: [
          "/images/services/brasileiro-2.png",
          "/images/services/brasileiro-3.png",
          "/images/services/brasileiro-4.png",
        ],
        maintenance: "Manutenção a cada 2–3 semanas",
        price: 110,
      },
      {
        id: "volume-egipcio",
        name: "Volume egípcio",
        subtitle: "Volume e curvatura",
        coverImage: "/images/services/volume-egipcio.png",
        galleryImages: [
          "/images/services/volume-egipcio-2.png",
          "/images/services/volume-egipcio-3.png",
          "/images/services/volume-egipcio-4.png",
        ],
        maintenance: "Manutenção a cada 2–3 semanas",
        price: 130,
      },
      {
        id: "fox-eyes",
        name: "Fox eyes",
        subtitle: "Efeito sirena",
        coverImage: "/images/services/fox-eyes.png",
        galleryImages: [
          "/images/services/fox-eyes-2.png",
          "/images/services/fox-eyes-3.png",
          "/images/services/fox-eyes-4.png",
          "/images/services/fox-eyes-5.png",
        ],
        maintenance: "Manutenção a cada 2–3 semanas",
        price: 150,
      },
      {
        id: "mega-volume",
        name: "Mega volume",
        subtitle: "Até 30 dias",
        coverImage: "/images/services/mega-volume.png",
        galleryImages: [
          "/images/services/mega-volume-2.png",
          "/images/services/mega-volume-3.png",
        ],
        maintenance: "Manutenção conforme necessidade",
        price: 150,
      },
    ],
  },
  {
    id: "sobrancelhas",
    title: "Sobrancelhas e Cuidados",
    subtitle: "Design e tratamentos para realçar a expressão",
    services: [
      {
        id: "design",
        name: "Design personalizado",
        coverImage: "/images/services/design-personalizado.png",
        price: 30,
      },
      {
        id: "design-henna",
        name: "Design com henna",
        subtitle: "Cor e definição",
        coverImage: "/images/services/design-henna.png",
        price: 50,
      },
      {
        id: "brow-lamination",
        name: "Brow lamination",
        coverImage: "/images/services/brow-lamination.png",
        galleryImages: [
          "/images/services/brow-lamination-2.png",
          "/images/services/brow-lamination-3.png",
          "/images/services/brow-lamination-4.png",
        ],
        price: 90,
      },
      {
        id: "spa-labial",
        name: "Spa labial",
        coverImage: "/images/services/spa-labial.png",
        price: 25,
      },
    ],
  },
];
