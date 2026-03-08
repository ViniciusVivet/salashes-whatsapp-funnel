export type ServiceCategory = {
  id: string;
  title: string;
  subtitle?: string;
  services: ServiceItem[];
};

export type ServiceItem = {
  id: string;
  name: string;
  price: number;
  description?: string;
};

export const servicesData: ServiceCategory[] = [
  {
    id: "cilios",
    title: "Extensão de Cílios",
    subtitle: "Técnicas que valorizam seu olhar com naturalidade ou drama",
    services: [
      { id: "brasileiro", name: "Brasileiro (preto/marrom)", price: 110 },
      { id: "volume-egipcio", name: "Volume egípcio", price: 130 },
      { id: "fox-eyes", name: "Fox eyes (efeito delineado)", price: 150 },
      { id: "mega-volume", name: "Mega volume (30 dias)", price: 150 },
    ],
  },
  {
    id: "sobrancelhas",
    title: "Sobrancelhas e Cuidados",
    subtitle: "Design e tratamentos para realçar a expressão",
    services: [
      { id: "design", name: "Design personalizado", price: 30 },
      { id: "design-henna", name: "Design com henna", price: 50 },
      { id: "brow-lamination", name: "Brow lamination", price: 90 },
      { id: "spa-labial", name: "Spa labial", price: 25 },
    ],
  },
];
