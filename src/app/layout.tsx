import type { Metadata } from "next";
import { Cormorant_Garamond, Outfit } from "next/font/google";
import "./globals.css";
import WhatsAppFloat from "@/components/WhatsAppFloat";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sabrina Lashes | Lash & Brow Designer — Ermelino Matarazzo, SP",
  description:
    "Sabrina Silva, Lash & Brow Designer. Extensão de cílios, design de sobrancelhas e procedimentos para realçar seu olhar. Atendimento em Ermelino Matarazzo, São Paulo. Agende pelo WhatsApp.",
  keywords: [
    "Sabrina Lashes",
    "cílios",
    "sobrancelhas",
    "Lash Designer",
    "Brow Designer",
    "extensão de cílios",
    "Ermelino Matarazzo",
    "São Paulo",
  ],
  authors: [{ name: "Sabrina Silva", url: "https://www.instagram.com/salashes__" }],
  openGraph: {
    title: "Sabrina Lashes | Lash & Brow Designer",
    description:
      "Realce seu olhar com atendimento especializado em cílios e sobrancelhas. Ermelino Matarazzo, São Paulo.",
    type: "website",
    images: [
      {
        url: "/images/og/og-sabrina-lashes.png",
        width: 1200,
        height: 630,
        alt: "Sabrina Lashes - Lash & Brow Designer em Ermelino Matarazzo, Sao Paulo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sabrina Lashes | Lash & Brow Designer",
    description:
      "Extensao de cilios e design de sobrancelhas com foco em valorizar o seu olhar em Ermelino Matarazzo, Sao Paulo.",
    images: ["/images/og/og-sabrina-lashes.png"],
  },
  robots: "index, follow",
  icons: {
    icon: [
      { url: "/icon.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${cormorant.variable} ${outfit.variable}`}
    >
      <body className="font-sans min-h-screen">
        {children}
        <WhatsAppFloat />
      </body>
    </html>
  );
}
