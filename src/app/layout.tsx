import type { Metadata } from "next";
import { Cormorant_Garamond, Jost, Great_Vibes } from "next/font/google";
import "./globals.css";
import RevealProvider from "@/components/RevealProvider";
import MusicPlayer from "@/components/MusicPlayer";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const greatVibes = Great_Vibes({
  variable: "--font-great-vibes",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://karen-y-aldo.com"
  ),
  title: "Karen & Aldo · 07 · 11 · 2026",
  description:
    "Nos casamos. Ceremonia religiosa y celebración en Tepatitlán de Morelos, Jalisco. Acompáñanos el 07 de noviembre de 2026.",
  openGraph: {
    title: "Karen & Aldo · 07 · 11 · 2026",
    description:
      "Con inmensa alegría queremos compartir con ustedes este día tan especial.",
    type: "website",
    images: [
      {
        url: "/media/fotos/IMG_7738.jpg",
        width: 1200,
        height: 800,
        alt: "Karen & Aldo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Karen & Aldo · 07 · 11 · 2026",
    description:
      "Con inmensa alegría queremos compartir con ustedes este día tan especial.",
    images: ["/media/fotos/IMG_7738.jpg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: "Boda de Karen & Aldo",
    startDate: "2026-11-07T16:00:00-06:00",
    endDate: "2026-11-08T02:00:00-06:00",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    location: {
      "@type": "Place",
      name: "Santuario de San Tranquilino Ubiarco Robles",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Tepatitlán de Morelos",
        addressRegion: "Jalisco",
        addressCountry: "MX",
      },
    },
    image: "https://karen-y-aldo.com/media/fotos/IMG_7738.jpg",
    description:
      "Nos casamos. Ceremonia religiosa y celebración en Tepatitlán de Morelos, Jalisco. Acompáñanos el 07 de noviembre de 2026.",
    organizer: {
      "@type": "Person",
      name: "Karen & Aldo",
    },
  };

  return (
    <html
      lang="es"
      className={`${cormorant.variable} ${jost.variable} ${greatVibes.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <RevealProvider>{children}</RevealProvider>
        <MusicPlayer />
      </body>
    </html>
  );
}
