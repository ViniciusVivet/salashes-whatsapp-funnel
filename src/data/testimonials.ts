export type Testimonial = {
  id: string;
  name: string;
  text: string;
  initials?: string;
};

export const testimonialsData: Testimonial[] = [
  {
    id: "1",
    name: "Marina F.",
    text: "Fui na Sabrina pela primeira vez e amei. Ficou natural e ela é super atenciosa. Recomendo.",
    initials: "MF",
  },
  {
    id: "2",
    name: "Juliana R.",
    text: "Já fiz brasileiro e fox eyes com ela. Sempre impecável e o ambiente é bem aconchegante. Nota 10.",
    initials: "JR",
  },
  {
    id: "3",
    name: "Camila S.",
    text: "Minha sobrancelha nunca ficou tão boa. O design com henna dura bastante e o atendimento é de outro nível.",
    initials: "CS",
  },
];
