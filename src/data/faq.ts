export type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

export const faqData: FaqItem[] = [
  {
    id: "agendar",
    question: "Como faço para agendar?",
    answer:
      "Chama no WhatsApp. Eu mando os horários que tenho e a gente combina o melhor dia. O atendimento é sempre com horário marcado.",
  },
  {
    id: "procedimento",
    question: "Qual procedimento combina mais comigo?",
    answer:
      "Depende do seu estilo e da sua rotina. No WhatsApp eu te oriento: se você curte algo mais natural ou marcante e quanto tempo dura cada um.",
  },
  {
    id: "manutencao",
    question: "Fazem manutenção?",
    answer:
      "Sim. Em extensão de cílios a manutenção ajuda a manter o resultado por mais tempo. Valores e de quanto em quanto tempo a gente combina no atendimento.",
  },
  {
    id: "duracao",
    question: "Quanto tempo demora o procedimento?",
    answer:
      "Varia: design de sobrancelha é mais rápido; extensão de cílios leva em média 1h30 a 2h. Quando você for agendar, te passo o tempo certinho do que você escolher.",
  },
  {
    id: "horario",
    question: "Atende com horário marcado?",
    answer:
      "Sim. Só com agendamento pelo WhatsApp, para eu conseguir te dar atenção e tempo sem pressa.",
  },
  {
    id: "local",
    question: "Onde fica o atendimento?",
    answer:
      "No Ermelino Matarazzo, São Paulo. O endereço completo eu envio depois que a gente confirma o agendamento pelo WhatsApp.",
  },
];
