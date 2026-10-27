import { ImageResponse } from "next/og";
import { IconMark, ogFonts } from "@/lib/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default async function Icon() {
  return new ImageResponse(<IconMark px={size.width} />, { ...size, fonts: await ogFonts() });
}
