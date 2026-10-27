import type { DocField, SynthDoc } from "@/content/documents";

const FONT = {
  serif: "var(--font-newsreader), Georgia, serif",
  sans: "var(--font-archivo), Arial, sans-serif",
  script: "var(--font-newsreader), Georgia, serif",
};

const INK = "#24221d";
const FAINT = "#6f6a60";
const LINE = "#b9b1a1";

function FieldText({ f, value }: { f: DocField; value: string }) {
  const [x, y, w, h] = f.px;
  const centred = f.font === "serif" || f.font === "script";
  return (
    <text
      x={centred ? x + w / 2 : x + 6}
      y={y + h * 0.74}
      textAnchor={centred ? "middle" : "start"}
      fontSize={f.size}
      fontFamily={FONT[f.font ?? "sans"]}
      fontStyle={f.font === "script" ? "italic" : "normal"}
      fontWeight={f.weight ?? 400}
      fill={INK}
    >
      {value}
    </text>
  );
}

/** Small-print filler: thin grey runs that read as body text at a glance. */
function Lines({ x, y, w, n, gap = 14 }: { x: number; y: number; w: number; n: number; gap?: number }) {
  return (
    <g fill="#cfc8b9">
      {Array.from({ length: n }, (_, i) => (
        <rect key={i} x={x} y={y + i * gap} width={i === n - 1 ? w * 0.55 : w - ((i * 37) % 60)} height={5} rx={2} />
      ))}
    </g>
  );
}

function Label({ x, y, children, size = 12 }: { x: number; y: number; children: string; size?: number }) {
  return (
    <text x={x} y={y} fontSize={size} fontFamily={FONT.sans} fill={FAINT} letterSpacing={0.4}>
      {children}
    </text>
  );
}

function License({ doc, read }: { doc: SynthDoc; read: (f: DocField) => string }) {
  const f = Object.fromEntries(doc.fields.map((x) => [x.key, x]));
  return (
    <>
      <rect x={18} y={18} width={864} height={584} fill="none" stroke="#8b7f66" strokeWidth={3} />
      <rect x={30} y={30} width={840} height={560} fill="none" stroke="#8b7f66" strokeWidth={1} />
      <circle cx={450} cy={96} r={34} fill="none" stroke="#8b7f66" strokeWidth={2} />
      <circle cx={450} cy={96} r={26} fill="none" stroke="#8b7f66" strokeWidth={1} strokeDasharray="3 3" />
      <text x={450} y={160} textAnchor="middle" fontSize={17} fontFamily={FONT.sans} letterSpacing={3} fill={FAINT}>
        STATE MEDICAL BOARD
      </text>
      <text x={450} y={196} textAnchor="middle" fontSize={26} fontFamily={FONT.serif} fontWeight={600} fill={INK}>
        License to Practice Medicine
      </text>
      <text x={450} y={228} textAnchor="middle" fontSize={15} fontFamily={FONT.serif} fontStyle="italic" fill={FAINT}>
        This certifies that
      </text>
      <FieldText f={f.practitioner_name} value={read(f.practitioner_name)} />
      <text x={450} y={312} textAnchor="middle" fontSize={15} fontFamily={FONT.serif} fontStyle="italic" fill={FAINT}>
        is duly licensed to practice as a
      </text>
      <FieldText f={f.license_type} value={read(f.license_type)} />
      <line x1={110} y1={470} x2={790} y2={470} stroke={LINE} />
      <Label x={124} y={422}>LICENSE NO.</Label>
      <Label x={372} y={422}>ISSUED</Label>
      <Label x={618} y={422}>EXPIRES</Label>
      <FieldText f={f.license_number} value={read(f.license_number)} />
      <FieldText f={f.issue_date} value={read(f.issue_date)} />
      <FieldText f={f.expiration_date} value={read(f.expiration_date)} />
      <path d="M560 540 C 590 515, 610 560, 640 532 S 690 520, 720 540" fill="none" stroke={INK} strokeWidth={1.5} />
      <line x1={540} y1={552} x2={790} y2={552} stroke={LINE} />
      <Label x={600} y={570} size={11}>Executive Director</Label>
    </>
  );
}

function Attestation({ doc, read }: { doc: SynthDoc; read: (f: DocField) => string }) {
  const f = Object.fromEntries(doc.fields.map((x) => [x.key, x]));
  const row = (y: number, label: string, field?: DocField) => (
    <g key={label}>
      <Label x={70} y={y + 18} size={13}>{label}</Label>
      <line x1={256} y1={y + 26} x2={780} y2={y + 26} stroke={LINE} />
      {field && <FieldText f={field} value={read(field)} />}
    </g>
  );
  const section = (y: number, title: string) => (
    <g>
      <rect x={60} y={y} width={730} height={26} fill="#ebe5d8" />
      <text x={70} y={y + 18} fontSize={13} fontFamily={FONT.sans} fontWeight={600} fill={INK} letterSpacing={0.6}>
        {title}
      </text>
    </g>
  );
  return (
    <>
      <text x={60} y={78} fontSize={24} fontFamily={FONT.sans} fontWeight={700} fill={INK}>
        Practitioner Attestation
      </text>
      <text x={60} y={104} fontSize={13} fontFamily={FONT.sans} fill={FAINT}>
        Professional history and liability coverage · Form PA-2
      </text>
      <Lines x={60} y={126} w={730} n={2} />
      {section(160, "1. IDENTIFICATION")}
      {row(196, "Full legal name", f.practitioner_name)}
      {row(236, "Primary specialty", f.specialty)}
      {row(276, "Board status")}
      {section(332, "2. HOSPITAL AFFILIATION")}
      {row(368, "Facility", f.hospital_affiliation)}
      {row(408, "Start date", f.affiliation_start)}
      {row(448, "Privileges")}
      {section(504, "3. PROFESSIONAL LIABILITY")}
      {row(540, "Carrier", f.malpractice_carrier)}
      {row(580, "Policy number", f.policy_number)}
      {row(620, "Limits")}
      {section(676, "4. ATTESTATION")}
      <Lines x={60} y={718} w={730} n={7} />
      <path d="M300 880 C 330 850, 350 900, 380 868 S 430 860, 460 878" fill="none" stroke={INK} strokeWidth={1.3} />
      <line x1={256} y1={894} x2={500} y2={894} stroke={LINE} />
      <Label x={256} y={912} size={11}>Signature</Label>
      <Label x={540} y={886} size={13}>Date</Label>
      <line x1={590} y1={894} x2={780} y2={894} stroke={LINE} />
      <FieldText f={f.signed_date} value={read(f.signed_date)} />
      <Label x={60} y={966} size={10}>PA-2 · Rev. 2025 · Page 1 of 1</Label>
    </>
  );
}

function Diploma({ doc, read }: { doc: SynthDoc; read: (f: DocField) => string }) {
  const f = Object.fromEntries(doc.fields.map((x) => [x.key, x]));
  return (
    <>
      <rect x={16} y={16} width={868} height={628} fill="none" stroke="#9a8a63" strokeWidth={6} />
      <rect x={32} y={32} width={836} height={596} fill="none" stroke="#9a8a63" strokeWidth={1} />
      <FieldText f={f.institution} value={read(f.institution)} />
      <text x={450} y={196} textAnchor="middle" fontSize={17} fontFamily={FONT.serif} fontStyle="italic" fill={FAINT}>
        upon the recommendation of the faculty has conferred upon
      </text>
      <FieldText f={f.graduate_name} value={read(f.graduate_name)} />
      <text x={450} y={372} textAnchor="middle" fontSize={17} fontFamily={FONT.serif} fontStyle="italic" fill={FAINT}>
        the degree of
      </text>
      <FieldText f={f.degree} value={read(f.degree)} />
      <text x={450} y={476} textAnchor="middle" fontSize={15} fontFamily={FONT.serif} fontStyle="italic" fill={FAINT}>
        given on
      </text>
      <FieldText f={f.conferral_date} value={read(f.conferral_date)} />
      <circle cx={450} cy={578} r={30} fill="#c9a96133" stroke="#9a8a63" strokeWidth={2} />
      <line x1={110} y1={590} x2={330} y2={590} stroke={LINE} />
      <line x1={570} y1={590} x2={790} y2={590} stroke={LINE} />
      <Label x={180} y={608} size={11}>President</Label>
      <Label x={652} y={608} size={11}>Registrar</Label>
    </>
  );
}

export function DocSvg({ doc, fax }: { doc: SynthDoc; fax: boolean }) {
  // The page always shows the true value; only the model's reading changes.
  const read = (f: DocField) => f.value;
  const Body = { license: License, attestation: Attestation, diploma: Diploma }[doc.id];
  const filterId = `fax-${doc.id}`;
  return (
    <svg viewBox={`0 0 ${doc.width} ${doc.height}`} className="block h-auto w-full" role="img" aria-label={doc.name.en}>
      <defs>
        <filter id={filterId} x="0" y="0" width="100%" height="100%">
          <feGaussianBlur stdDeviation={doc.id === "attestation" ? 1.1 : 0.7} result="blur" />
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={4} result="noise" />
          <feColorMatrix in="noise" type="saturate" values="0" result="mono" />
          <feComponentTransfer in="mono" result="speckle">
            <feFuncA type="discrete" tableValues="0 0 0 0 0 0 0.35 0.7" />
          </feComponentTransfer>
          <feComposite in="speckle" in2="blur" operator="over" result="noisy" />
          <feColorMatrix in="noisy" type="saturate" values="0" />
        </filter>
      </defs>
      <rect width={doc.width} height={doc.height} fill="#fffdf8" />
      <g filter={fax ? `url(#${filterId})` : undefined} transform={fax ? `rotate(-0.6 ${doc.width / 2} ${doc.height / 2})` : undefined}>
        <rect width={doc.width} height={doc.height} fill="#fffdf8" />
        <Body doc={doc} read={read} />
      </g>
      <text
        x={doc.width / 2}
        y={doc.height / 2}
        textAnchor="middle"
        fontSize={54}
        fontFamily={FONT.sans}
        fontWeight={700}
        fill="#b45309"
        opacity={0.09}
        transform={`rotate(-24 ${doc.width / 2} ${doc.height / 2})`}
        letterSpacing={6}
      >
        SPECIMEN · SYNTHETIC
      </text>
    </svg>
  );
}
