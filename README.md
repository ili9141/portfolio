# Ilias Ait Barrehil — portfolio

Two sides of the same site: the AI work (`/`) and the backend work (`/dev`). The
**AI / DEV** switch in the navbar moves between them, through a point explosion.

Next.js 16 (App Router), React 19, Tailwind CSS 4, TypeScript. All copy, French
and English, lives in `src/content/site.ts`.

```bash
npm install
npm run dev     # http://localhost:3000
npm run build
```

- The point field behind every page is a canvas (`src/components/LatentField.tsx`).
- AI-side titles show their real Qwen3 tokens. `scripts/tokenize-titles.py`
  regenerates `src/content/tokens.ts` after a title changes.
- The documents in the reader demo are synthetic, drawn as SVG. No real document
  or patient data is in this repository.
- Fonts are self-hosted in `src/fonts`, each with its OFL licence.
