import type { Metadata } from "next";
import localFont from "next/font/local";
import { LangProvider } from "@/components/lang";
import { LatentField } from "@/components/LatentField";
import "./globals.css";

// Self-hosted variable fonts (SIL OFL, licences in src/fonts), so neither
// `next dev` nor a build depends on reaching Google Fonts.

// Archivo carries the site: its width axis gives the wide, heavy headings.
const archivo = localFont({
  src: "../fonts/Archivo-Variable.ttf",
  variable: "--font-archivo",
  weight: "100 900",
  declarations: [{ prop: "font-stretch", value: "62% 125%" }],
});

const martian = localFont({
  src: "../fonts/MartianMono-Variable.ttf",
  variable: "--font-martian",
  weight: "100 800",
  declarations: [{ prop: "font-stretch", value: "75% 112.5%" }],
});

// Only the synthetic documents use a serif, so they read as real paperwork.
const newsreader = localFont({
  src: [
    { path: "../fonts/Newsreader-Variable.ttf", style: "normal" },
    { path: "../fonts/Newsreader-Italic-Variable.ttf", style: "italic" },
  ],
  variable: "--font-newsreader",
  weight: "200 800",
});

export const metadata: Metadata = {
  title: "Ilias Ait Barrehil — Ingénieur IA & Data",
  description:
    "Élève ingénieur IA & Data Science à l'EMSI Marrakech. J'entraîne un modèle qui lit des documents médicaux scannés et montre où il a lu chaque valeur. Stage PFE de 4 mois à partir de février 2027.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${archivo.variable} ${martian.variable} ${newsreader.variable} antialiased`}>
      <body className="min-h-screen">
        {/* In the layout, not a page: the points must survive a navigation to
            fly from one page into the next. */}
        <LatentField />
        <LangProvider>{children}</LangProvider>
      </body>
    </html>
  );
}
