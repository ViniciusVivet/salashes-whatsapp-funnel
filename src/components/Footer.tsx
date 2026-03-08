import { getWhatsAppLink, whatsAppDisplay } from "@/lib/whatsapp";

const INSTAGRAM = "https://www.instagram.com/salashes__";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-nude-900 text-nude-200 py-14 md:py-16 px-4 sm:px-6 border-t border-nude-800">
      <div className="max-w-4xl mx-auto text-center">
        <p className="font-serif text-xl md:text-2xl font-semibold text-white">
          Sabrina Lashes
        </p>
        <p className="mt-1.5 text-sm text-nude-400">
          Sabrina Silva — Lash & Brow Designer
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm">
          <a
            href={INSTAGRAM}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-rose-300 transition-colors"
          >
            @salashes__
          </a>
          <a
            href={getWhatsAppLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-rose-300 transition-colors"
          >
            WhatsApp {whatsAppDisplay}
          </a>
        </div>

        <p className="mt-6 text-nude-500 text-sm">
          Ermelino Matarazzo, São Paulo — SP
        </p>

        <p className="mt-10 text-nude-600 text-xs">
          © {year} Sabrina Lashes
        </p>
      </div>
    </footer>
  );
}
