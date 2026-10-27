// Synthetic documents for the reader demo. Every name, number and institution
// here is invented; none of it comes from Lama data.
//
// Boxes are written in the document's own pixel space and converted to the
// model's real output shape ({ x0, y0, x1, y1 }, normalised 0-1, origin top-left)
// at render time, so the drawn text and its box can never drift apart.

export type Kind = "institution" | "provider";

export type DocField = {
  key: string;
  value: string;
  /** x, y, width, height in document pixels */
  px: [number, number, number, number];
  size: number;
  /** What the model reads when the page is fax quality, if it misreads. */
  faxValue?: string;
  weight?: number;
  font?: "serif" | "sans" | "script";
};

export type SynthDoc = {
  id: "license" | "attestation" | "diploma";
  name: { fr: string; en: string };
  kind: Kind;
  /** Whether the verifier is routed to this type (measured loss, not custody). */
  verifier: boolean;
  why: { fr: string; en: string };
  width: number;
  height: number;
  fields: DocField[];
};

export const documents: SynthDoc[] = [
  {
    id: "license",
    name: { fr: "Licence d'exercice", en: "Medical licence" },
    kind: "institution",
    verifier: false,
    why: {
      fr: "Imprimée par une institution, nette même faxée : 100 % → 98,3 %.",
      en: "Printed by an institution, sharp even when faxed: 100% → 98.3%.",
    },
    width: 900,
    height: 620,
    fields: [
      { key: "practitioner_name", value: "Jordan A. Reyes, MD", px: [235, 236, 430, 52], size: 38, font: "serif", weight: 600 },
      { key: "license_type", value: "Physician and Surgeon", px: [300, 322, 300, 34], size: 22, font: "serif" },
      { key: "license_number", value: "PS-58213", px: [118, 430, 170, 34], size: 21, font: "sans", weight: 600 },
      { key: "issue_date", value: "03/14/2019", px: [366, 430, 170, 34], size: 21, font: "sans", weight: 600 },
      { key: "expiration_date", value: "06/30/2027", px: [612, 430, 170, 34], size: 21, font: "sans", weight: 600 },
    ],
  },
  {
    id: "attestation",
    name: { fr: "Attestation du praticien", en: "Practitioner attestation" },
    kind: "provider",
    verifier: true,
    why: {
      fr: "Petits caractères, souvent photographiée : 96,7 % → 53,8 % en qualité fax.",
      en: "Small type, often photographed: 96.7% → 53.8% at fax quality.",
    },
    width: 850,
    height: 1000,
    fields: [
      { key: "practitioner_name", value: "Jordan A. Reyes", px: [262, 196, 220, 26], size: 15, font: "sans" },
      { key: "specialty", value: "Internal Medicine", px: [262, 236, 200, 26], size: 15, font: "sans" },
      { key: "hospital_affiliation", value: "St. Clare Regional Hospital", px: [262, 368, 280, 26], size: 15, font: "sans" },
      { key: "affiliation_start", value: "08/01/2021", faxValue: "08/07/2021", px: [262, 408, 120, 26], size: 15, font: "sans" },
      { key: "malpractice_carrier", value: "Northbridge Mutual", px: [262, 540, 210, 26], size: 15, font: "sans" },
      { key: "policy_number", value: "NBM-447120-B", faxValue: "NBM-441120-B", px: [262, 580, 160, 26], size: 15, font: "sans" },
      { key: "signed_date", value: "01/09/2026", px: [600, 868, 130, 26], size: 15, font: "sans" },
    ],
  },
  {
    id: "diploma",
    name: { fr: "Diplôme d'infirmier", en: "Nursing diploma" },
    kind: "provider",
    verifier: false,
    why: {
      fr: "Imprimé en très gros caractères, il se dégrade à peine (−5 pts). On route sur la perte mesurée, pas sur la provenance.",
      en: "Printed in very large type, it barely degrades (−5 pts). Routing follows measured loss, not where a document comes from.",
    },
    width: 900,
    height: 660,
    fields: [
      { key: "institution", value: "Westbrook State University", px: [170, 92, 560, 56], size: 40, font: "serif", weight: 600 },
      { key: "graduate_name", value: "Camille T. Ortiz", px: [240, 268, 420, 64], size: 50, font: "script" },
      { key: "degree", value: "Bachelor of Science in Nursing", px: [185, 392, 530, 46], size: 31, font: "serif", weight: 600 },
      { key: "conferral_date", value: "May 18, 2016", px: [330, 486, 240, 38], size: 24, font: "serif" },
    ],
  },
];

export function normalisedBox(doc: SynthDoc, f: DocField) {
  const [x, y, w, h] = f.px;
  const r = (n: number) => Math.round(n * 1000) / 1000;
  return { x0: r(x / doc.width), y0: r(y / doc.height), x1: r((x + w) / doc.width), y1: r((y + h) / doc.height) };
}
