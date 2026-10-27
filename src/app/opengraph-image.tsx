import { ImageResponse } from "next/og";
import { OG_SIZE, OgCard, ogFonts } from "@/lib/og";

export const alt = "Ilias Ait Barrehil, élève ingénieur IA & Data à l'EMSI Marrakech";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    <OgCard side="ai" kicker="IA & DATA · EMSI MARRAKECH" facts="Stage PFE de 4 mois · février 2027 · Maroc" />,
    { ...size, fonts: await ogFonts() },
  );
}
