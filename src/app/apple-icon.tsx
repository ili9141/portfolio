import { ImageResponse } from "next/og";
import { IconMark, ogFonts } from "@/lib/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
  return new ImageResponse(<IconMark px={size.width} />, { ...size, fonts: await ogFonts() });
}
