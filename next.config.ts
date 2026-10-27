import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // The tab icon and the link-preview cards read these fonts from disk at
  // request time (src/lib/og.tsx); ship them with those functions explicitly
  // rather than trusting the tracer to follow a path.join.
  outputFileTracingIncludes: {
    "/icon": ["src/fonts/static/*.ttf"],
    "/apple-icon": ["src/fonts/static/*.ttf"],
    "/opengraph-image": ["src/fonts/static/*.ttf"],
    "/dev/opengraph-image": ["src/fonts/static/*.ttf"],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
