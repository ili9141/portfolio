import { ImageResponse } from "next/og";
import { OG_SIZE, OgCard, ogFonts } from "@/lib/og";

export const alt = "Ilias Ait Barrehil, côté dev : backend et full stack";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    <OgCard side="dev" prompt kicker="BACKEND · NEXT.JS · POSTGRESQL" facts="119 routes d'API · 46 migrations · 44 suites de vérification" />,
    { ...size, fonts: await ogFonts() },
  );
}
