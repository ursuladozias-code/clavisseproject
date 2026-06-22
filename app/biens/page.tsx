"use client";

import { Inter } from "next/font/google";
import { useMemo, useState, type ReactNode } from "react";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

/* ============================================================
   MODULE GESTION DES BIENS — FRONT-END AUTONOME
   Remplacez intégralement app/biens/page.tsx par ce fichier.
   ============================================================ */

type AssetKind = "property" | "building";
type PropertyType =
  | "appartement"
  | "maison"
  | "studio"
  | "cave"
  | "garage_box"
  | "parking";
type Status = "vacant" | "occupied" | "works";
type ChargeMode = "forfait" | "provision";
type AllocationMode = "tantiemes" | "surface" | "custom";
type FinancingType = "cash" | "loan";
type Tab = "general" | "rental" | "financial" | "documents" | "history";
type Screen =
  | { name: "list" }
  | { name: "choice" }
  | { name: "property-wizard" }
  | { name: "building-wizard" }
  | { name: "lot-wizard"; buildingId: string }
  | { name: "detail"; assetId: string }
  | { name: "lot-detail"; buildingId: string; lotId: string };

type Address = {
  street: string;
  extra: string;
  zip: string;
  city: string;
  country: string;
};

type Cadastre = { reference: string; section: string; parcel: string };

type Surfaces = {
  habitable: number;
  carrez: number;
  useful: number;
  total: number;
  land: number;
};

type Composition = {
  rooms: number;
  bedrooms: number;
  showerRooms: number;
  bathrooms: number;
  toilets: number;
};

type RentalInfo = {
  rentHC: number;
  monthlyCharges: number;
  chargeMode: ChargeMode;
  deposit: number;
  depositMonths: number;
};

type Indexation = {
  anniversary: string;
  quarter: "T1" | "T2" | "T3" | "T4" | "";
  year: string;
};

type FinancialInfo = {
  purchasePrice: number;
  notaryFees: number;
  agencyFees: number;
  works: number;
  financing: FinancingType;
  borrowedCapital: number;
  rate: number;
  durationMonths: number;
  monthlyPayment: number;
  insurance: number;
};

type DocumentItem = {
  id: string;
  name: string;
  category: string;
  createdAt: string;
  createdBy: string;
  archived: boolean;
  versions: { id: string; createdAt: string; createdBy: string }[];
};

type HistoryItem = {
  id: string;
  createdAt: string;
  actor: string;
  action: string;
  before: string;
  after: string;
};

type RentHistoryItem = {
  id: string;
  effectiveDate: string;
  reason: string;
  oldRent: number;
  newRent: number;
};

type PropertyRecord = {
  id: string;
  kind: "property";
  archived: boolean;
  name: string;
  reference: string;
  type: PropertyType;
  status: Status;
  acquiredAt: string;
  address: Address;
  cadastre: Cadastre;
  surfaces: Surfaces;
  composition: Composition;
  features: string[];
  rental: RentalInfo;
  indexation: Indexation;
  financial: FinancialInfo;
  documents: DocumentItem[];
  history: HistoryItem[];
  rentHistory: RentHistoryItem[];
};

type Lot = {
  id: string;
  buildingId: string;
  archived: boolean;
  lotNumber: string;
  reference: string;
  type: Exclude<PropertyType, "maison">;
  status: Status;
  floor: string;
  surfaces: Surfaces;
  composition: Composition;
  features: string[];
  rental: RentalInfo;
  indexation: Indexation;
  tantiemes: number;
  documents: DocumentItem[];
  history: HistoryItem[];
  rentHistory: RentHistoryItem[];
};

type BuildingRecord = {
  id: string;
  kind: "building";
  archived: boolean;
  name: string;
  reference: string;
  acquiredAt: string;
  address: Address;
  cadastre: Cadastre;
  totalSurface: number;
  totalHabitableSurface: number;
  commonSurface: number;
  capacity: { homes: number; caves: number; garages: number; parkings: number };
  features: string[];
  financial: FinancialInfo;
  charges: {
    mode: ChargeMode;
    allocation: AllocationMode;
    totalTantiemes: number;
  };
  documents: DocumentItem[];
  history: HistoryItem[];
  lots: Lot[];
};

type Asset = PropertyRecord | BuildingRecord;

const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: "appartement", label: "Appartement" },
  { value: "maison", label: "Maison" },
  { value: "studio", label: "Studio" },
  { value: "cave", label: "Cave" },
  { value: "garage_box", label: "Garage / Box" },
  { value: "parking", label: "Place de parking" },
];

const LOT_TYPES: { value: Exclude<PropertyType, "maison">; label: string }[] =
  PROPERTY_TYPES.filter((item) => item.value !== "maison") as {
    value: Exclude<PropertyType, "maison">;
    label: string;
  }[];

const STATUSES: { value: Status; label: string }[] = [
  { value: "vacant", label: "Vacant" },
  { value: "occupied", label: "Occupé" },
  { value: "works", label: "En travaux" },
];

const FEATURES_PROPERTY = [
  "Ascenseur",
  "Balcon",
  "Terrasse",
  "Jardin",
  "Cave",
  "Garage",
  "Parking",
  "Fibre",
  "Digicode",
  "Interphone",
  "Cuisine équipée",
  "Chauffage individuel",
  "Chauffage collectif",
  "Climatisation",
];

const FEATURES_BUILDING = [
  "Ascenseur",
  "Local vélos",
  "Cour intérieure",
  "Jardin collectif",
  "Local poubelles",
  "Fibre",
  "Digicode",
  "Interphone",
];

const DOCUMENT_CATEGORIES = [
  "DPE",
  "ERP",
  "Diagnostic électricité",
  "Diagnostic gaz",
  "Diagnostic amiante",
  "Diagnostic plomb",
  "Diagnostic bruit",
  "Acte d'acquisition",
  "Taxe foncière",
  "Règlement de copropriété",
  "Plans",
  "Photos",
  "Document libre",
];

const currentYear = new Date().getFullYear();
const IRL_YEARS = Array.from({ length: 10 }, (_, index) =>
  String(currentYear - index),
);

const palette = {
  ink: "#172033",
  muted: "#64748b",
  pale: "#f8fafc",
  line: "#e2e8f0",
  orange: "#f97316",
  orangeSoft: "#fff7ed",
  indigo: "#4f46e5",
  indigoSoft: "#eef2ff",
  green: "#16a34a",
  greenSoft: "#dcfce7",
  red: "#dc2626",
  redSoft: "#fee2e2",
  amber: "#d97706",
  amberSoft: "#fef3c7",
};

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function nowHistory(action: string, before = "", after = ""): HistoryItem {
  return {
    id: uid("hist"),
    createdAt: new Date().toLocaleString("fr-FR"),
    actor: "Utilisateur",
    action,
    before,
    after,
  };
}

function blankAddress(): Address {
  return { street: "", extra: "", zip: "", city: "", country: "France" };
}

function blankCadastre(): Cadastre {
  return { reference: "", section: "", parcel: "" };
}

function blankSurfaces(): Surfaces {
  return { habitable: 0, carrez: 0, useful: 0, total: 0, land: 0 };
}

function blankComposition(): Composition {
  return { rooms: 0, bedrooms: 0, showerRooms: 0, bathrooms: 0, toilets: 0 };
}

function blankRental(): RentalInfo {
  return {
    rentHC: 0,
    monthlyCharges: 0,
    chargeMode: "provision",
    deposit: 0,
    depositMonths: 0,
  };
}

function blankIndexation(): Indexation {
  return { anniversary: "", quarter: "", year: "" };
}

function blankFinancial(): FinancialInfo {
  return {
    purchasePrice: 0,
    notaryFees: 0,
    agencyFees: 0,
    works: 0,
    financing: "cash",
    borrowedCapital: 0,
    rate: 0,
    durationMonths: 0,
    monthlyPayment: 0,
    insurance: 0,
  };
}

function euros(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function labelPropertyType(value: PropertyType) {
  return PROPERTY_TYPES.find((item) => item.value === value)?.label ?? value;
}

function labelStatus(value: Status) {
  return STATUSES.find((item) => item.value === value)?.label ?? value;
}

function addressLabel(address: Address) {
  return (
    [address.street, address.zip, address.city].filter(Boolean).join(", ") ||
    "Adresse non renseignée"
  );
}

function acquisitionTotal(financial: FinancialInfo) {
  return (
    financial.purchasePrice +
    financial.notaryFees +
    financial.agencyFees +
    financial.works
  );
}

function statusTone(status: Status) {
  if (status === "occupied")
    return { color: palette.green, background: palette.greenSoft };
  if (status === "vacant")
    return { color: palette.amber, background: palette.amberSoft };
  return { color: palette.muted, background: "#e2e8f0" };
}

const DEMO_ASSETS: Asset[] = [
  {
    id: "property-001",
    kind: "property",
    archived: false,
    name: "Appartement Belleville",
    reference: "BIEN-000001",
    type: "appartement",
    status: "occupied",
    acquiredAt: "2021-03-15",
    address: {
      street: "12 rue de Belleville",
      extra: "",
      zip: "75020",
      city: "Paris",
      country: "France",
    },
    cadastre: { reference: "000 AB 0123", section: "AB", parcel: "123" },
    surfaces: { habitable: 52, carrez: 50, useful: 54, total: 55, land: 0 },
    composition: {
      rooms: 3,
      bedrooms: 2,
      showerRooms: 1,
      bathrooms: 0,
      toilets: 1,
    },
    features: ["Balcon", "Fibre", "Interphone", "Digicode"],
    rental: {
      rentHC: 950,
      monthlyCharges: 80,
      chargeMode: "provision",
      deposit: 1900,
      depositMonths: 2,
    },
    indexation: { anniversary: "2026-07-01", quarter: "T2", year: "2025" },
    financial: {
      purchasePrice: 280000,
      notaryFees: 22000,
      agencyFees: 0,
      works: 0,
      financing: "loan",
      borrowedCapital: 220000,
      rate: 1.85,
      durationMonths: 240,
      monthlyPayment: 1050,
      insurance: 35,
    },
    documents: [
      {
        id: "doc-1",
        name: "DPE 2024.pdf",
        category: "DPE",
        createdAt: "10/01/2024",
        createdBy: "Utilisateur",
        archived: false,
        versions: [],
      },
    ],
    history: [nowHistory("Création du bien", "", "Appartement Belleville")],
    rentHistory: [
      {
        id: "rent-1",
        effectiveDate: "01/07/2024",
        reason: "Révision IRL",
        oldRent: 928,
        newRent: 950,
      },
    ],
  },
  {
    id: "building-001",
    kind: "building",
    archived: false,
    name: "Immeuble Gambetta",
    reference: "IMM-000001",
    acquiredAt: "2018-06-20",
    address: {
      street: "45 rue de Bagnolet",
      extra: "",
      zip: "75020",
      city: "Paris",
      country: "France",
    },
    cadastre: { reference: "000 AC 0456", section: "AC", parcel: "456" },
    totalSurface: 450,
    totalHabitableSurface: 380,
    commonSurface: 70,
    capacity: { homes: 5, caves: 5, garages: 0, parkings: 3 },
    features: ["Ascenseur", "Digicode", "Interphone", "Local vélos"],
    financial: {
      purchasePrice: 1200000,
      notaryFees: 90000,
      agencyFees: 0,
      works: 30000,
      financing: "loan",
      borrowedCapital: 900000,
      rate: 1.9,
      durationMonths: 300,
      monthlyPayment: 4200,
      insurance: 180,
    },
    charges: {
      mode: "provision",
      allocation: "tantiemes",
      totalTantiemes: 10000,
    },
    documents: [],
    history: [nowHistory("Création de l'immeuble", "", "Immeuble Gambetta")],
    lots: [
      {
        id: "lot-001",
        buildingId: "building-001",
        archived: false,
        lotNumber: "101",
        reference: "LOT-000001",
        type: "appartement",
        status: "occupied",
        floor: "1",
        surfaces: { habitable: 65, carrez: 63, useful: 65, total: 65, land: 0 },
        composition: {
          rooms: 3,
          bedrooms: 2,
          showerRooms: 1,
          bathrooms: 0,
          toilets: 1,
        },
        features: ["Fibre", "Digicode"],
        rental: {
          rentHC: 1100,
          monthlyCharges: 120,
          chargeMode: "provision",
          deposit: 2200,
          depositMonths: 2,
        },
        indexation: { anniversary: "2026-01-01", quarter: "T1", year: "2025" },
        tantiemes: 2000,
        documents: [],
        history: [],
        rentHistory: [],
      },
      {
        id: "lot-002",
        buildingId: "building-001",
        archived: false,
        lotNumber: "201",
        reference: "LOT-000002",
        type: "appartement",
        status: "vacant",
        floor: "2",
        surfaces: { habitable: 72, carrez: 70, useful: 72, total: 72, land: 0 },
        composition: {
          rooms: 3,
          bedrooms: 2,
          showerRooms: 1,
          bathrooms: 0,
          toilets: 1,
        },
        features: ["Fibre"],
        rental: {
          rentHC: 1250,
          monthlyCharges: 130,
          chargeMode: "provision",
          deposit: 2500,
          depositMonths: 2,
        },
        indexation: blankIndexation(),
        tantiemes: 2200,
        documents: [],
        history: [],
        rentHistory: [],
      },
    ],
  },
];

/* ---------- UI primitives ---------- */

function Page({ children }: { children: ReactNode }) {
  return (
    <div
      className={`${inter.className} min-h-screen`}
      style={{
        backgroundColor: palette.pale,
        color: palette.ink,
        letterSpacing: "-0.015em",
      }}
    >
      {children}
    </div>
  );
}

function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-3xl p-4 sm:p-6 ${className}`}
      style={{
        background: "#ffffff",
        border: `1px solid ${palette.line}`,
        boxShadow: "0 12px 28px rgba(127, 73, 0, 0.06)",
      }}
    >
      {children}
    </section>
  );
}

function Button({
  children,
  onClick,
  tone = "primary",
  disabled = false,
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  tone?: "primary" | "secondary" | "danger" | "success";
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  const tones = {
    primary: { background: palette.orange, color: "#fff" },
    secondary: {
      background: "#fff",
      color: palette.muted,
      border: `1px solid ${palette.line}`,
    },
    danger: { background: palette.redSoft, color: palette.red },
    success: { background: palette.green, color: "#fff" },
  };
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className="px-4 py-2.5 rounded-2xl text-sm font-extrabold transition disabled:opacity-40"
      style={{
        ...tones[tone],
        fontFamily: "inherit",
        fontWeight: 800,
        letterSpacing: "-0.01em",
      }}
    >
      {children}
    </button>
  );
}

function Badge({ children, status }: { children: ReactNode; status: Status }) {
  const tone = statusTone(status);
  return (
    <span
      className="px-2.5 py-1 rounded-full text-xs font-extrabold"
      style={tone}
    >
      {children}
    </span>
  );
}

function Field({
  label,
  children,
  required = false,
  className = "",
}: {
  label: string;
  children: ReactNode;
  required?: boolean;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label
        className="text-xs font-extrabold"
        style={{ color: palette.muted }}
      >
        {label}
        {required ? <span style={{ color: palette.red }}> *</span> : null}
      </label>
      {children}
    </div>
  );
}

const controlStyle: React.CSSProperties = {
  border: `1px solid ${palette.line}`,
  color: palette.ink,
  background: "#fff",
  fontFamily: "inherit",
  fontWeight: 600,
};

function Input({
  value,
  onChange,
  type = "text",
  placeholder,
  disabled = false,
}: {
  value: string | number;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <input
      disabled={disabled}
      type={type}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="w-full px-3.5 py-2.5 rounded-2xl text-sm outline-none disabled:opacity-60"
      style={controlStyle}
    />
  );
}

function Select({
  value,
  onChange,
  children,
  disabled = false,
}: {
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
  disabled?: boolean;
}) {
  return (
    <select
      disabled={disabled}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-full px-3.5 py-2.5 rounded-2xl text-sm outline-none"
      style={controlStyle}
    >
      {children}
    </select>
  );
}

function Checkboxes({
  options,
  selected,
  onChange,
}: {
  options: string[];
  selected: string[];
  onChange: (items: string[]) => void;
}) {
  function toggle(option: string) {
    onChange(
      selected.includes(option)
        ? selected.filter((item) => item !== option)
        : [...selected, option],
    );
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
      {options.map((option) => {
        const active = selected.includes(option);
        return (
          <button
            key={option}
            type="button"
            onClick={() => toggle(option)}
            className="text-left px-3 py-2.5 rounded-2xl text-xs font-bold"
            style={{
              background: active ? palette.orangeSoft : palette.pale,
              color: active ? palette.orange : palette.muted,
              border: `1px solid ${active ? palette.orange : palette.line}`,
            }}
          >
            <span className="mr-2">{active ? "✓" : "○"}</span>
            {option}
          </button>
        );
      })}
    </div>
  );
}

function InlineAdd({
  label,
  onAdd,
}: {
  label: string;
  onAdd: (value: string) => void;
}) {
  const [value, setValue] = useState("");
  return (
    <div className="flex flex-col sm:flex-row gap-2 mt-3">
      <Input value={value} onChange={setValue} placeholder={label} />
      <Button
        tone="secondary"
        onClick={() => {
          const clean = value.trim();
          if (clean) {
            onAdd(clean);
            setValue("");
          }
        }}
      >
        + Ajouter
      </Button>
    </div>
  );
}

function Progress({ steps, current }: { steps: string[]; current: number }) {
  const denominator = Math.max(steps.length - 1, 1);
  return (
    <div className="mb-6">
      <div className="flex gap-2 overflow-x-auto pb-2">
        {steps.map((step, index) => (
          <div
            key={step}
            className="min-w-max text-xs font-extrabold px-3 py-2 rounded-2xl"
            style={{
              background:
                index === current
                  ? palette.orange
                  : index < current
                    ? palette.greenSoft
                    : "#fff",
              color:
                index === current
                  ? "#fff"
                  : index < current
                    ? palette.green
                    : palette.muted,
              border: `1px solid ${index === current ? palette.orange : palette.line}`,
            }}
          >
            {index < current ? "✓ " : `${index + 1}. `}
            {step}
          </div>
        ))}
      </div>
      <div
        className="h-1.5 rounded-full overflow-hidden"
        style={{ background: palette.line }}
      >
        <div
          className="h-full"
          style={{
            width: `${(current / denominator) * 100}%`,
            background: palette.orange,
          }}
        />
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2
      className="text-sm font-black uppercase tracking-wide mb-4"
      style={{ color: palette.ink }}
    >
      {children}
    </h2>
  );
}

function KeyValue({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div
      className="flex justify-between gap-4 py-2 border-b"
      style={{ borderColor: "#f1f5f9" }}
    >
      <span className="text-xs font-extrabold" style={{ color: palette.muted }}>
        {label}
      </span>
      <span
        className="text-sm text-right font-bold"
        style={{ color: palette.ink }}
      >
        {value || "—"}
      </span>
    </div>
  );
}

/* ---------- documents ---------- */

function DocumentsEditor({
  documents,
  onChange,
}: {
  documents: DocumentItem[];
  onChange: (documents: DocumentItem[]) => void;
}) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState(DOCUMENT_CATEGORIES[0]);

  function addDocument() {
    const clean = name.trim();
    if (!clean) return;
    onChange([
      ...documents,
      {
        id: uid("doc"),
        name: clean,
        category,
        createdAt: new Date().toLocaleDateString("fr-FR"),
        createdBy: "Utilisateur",
        archived: false,
        versions: [],
      },
    ]);
    setName("");
  }

  function archive(id: string) {
    onChange(
      documents.map((doc) =>
        doc.id === id ? { ...doc, archived: !doc.archived } : doc,
      ),
    );
  }

  function newVersion(id: string) {
    onChange(
      documents.map((doc) =>
        doc.id === id
          ? {
              ...doc,
              archived: false,
              versions: [
                ...doc.versions,
                {
                  id: uid("version"),
                  createdAt: new Date().toLocaleDateString("fr-FR"),
                  createdBy: "Utilisateur",
                },
              ],
            }
          : doc,
      ),
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_220px_auto] gap-2">
        <Input
          value={name}
          onChange={setName}
          placeholder="Nom du document (ex. DPE 2026.pdf)"
        />
        <Select value={category} onChange={setCategory}>
          {DOCUMENT_CATEGORIES.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </Select>
        <Button onClick={addDocument}>+ Ajouter</Button>
      </div>
      {documents.length === 0 ? (
        <p
          className="text-sm py-6 text-center"
          style={{ color: palette.muted }}
        >
          Aucun document ajouté.
        </p>
      ) : (
        <div className="space-y-2">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="p-3 rounded-2xl flex flex-col sm:flex-row sm:items-center gap-3 justify-between"
              style={{
                background: palette.pale,
                border: `1px solid ${palette.line}`,
              }}
            >
              <div>
                <p className="text-sm font-black">{doc.name}</p>
                <p
                  className="text-xs font-bold"
                  style={{ color: palette.muted }}
                >
                  {doc.category} · {doc.createdAt} ·{" "}
                  {doc.archived ? "Archivé" : "Actif"} · {doc.versions.length}{" "}
                  version(s)
                </p>
              </div>
              <div className="flex gap-2">
                <Button tone="secondary" onClick={() => newVersion(doc.id)}>
                  Nouvelle version
                </Button>
                <Button
                  tone={doc.archived ? "success" : "danger"}
                  onClick={() => archive(doc.id)}
                >
                  {doc.archived ? "Réactiver" : "Archiver"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- generic property / lot wizard ---------- */

type PropertyDraft = {
  name: string;
  reference: string;
  type: PropertyType;
  status: Status;
  acquiredAt: string;
  address: Address;
  cadastre: Cadastre;
  surfaces: Surfaces;
  composition: Composition;
  features: string[];
  rental: RentalInfo;
  indexation: Indexation;
  financial: FinancialInfo;
  documents: DocumentItem[];
};

function propertyDraftFrom(record?: PropertyRecord): PropertyDraft {
  return record
    ? {
        name: record.name,
        reference: record.reference,
        type: record.type,
        status: record.status,
        acquiredAt: record.acquiredAt,
        address: record.address,
        cadastre: record.cadastre,
        surfaces: record.surfaces,
        composition: record.composition,
        features: record.features,
        rental: record.rental,
        indexation: record.indexation,
        financial: record.financial,
        documents: record.documents,
      }
    : {
        name: "",
        reference: "",
        type: "appartement",
        status: "vacant",
        acquiredAt: "",
        address: blankAddress(),
        cadastre: blankCadastre(),
        surfaces: blankSurfaces(),
        composition: blankComposition(),
        features: [],
        rental: blankRental(),
        indexation: blankIndexation(),
        financial: blankFinancial(),
        documents: [],
      };
}

function PropertyWizard({
  reference,
  onBack,
  onSave,
}: {
  reference: string;
  onBack: () => void;
  onSave: (record: PropertyRecord) => void;
}) {
  const steps = [
    "Informations générales",
    "Caractéristiques",
    "Informations locatives",
    "Indexation",
    "Informations financières",
    "Documents",
    "Validation",
  ];
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<PropertyDraft>(() => ({
    ...propertyDraftFrom(),
    reference,
  }));

  function patch(next: Partial<PropertyDraft>) {
    setDraft((current) => ({ ...current, ...next }));
  }
  function canMove() {
    if (step !== 0) return true;
    return Boolean(
      draft.name.trim() &&
      draft.reference.trim() &&
      draft.address.street.trim() &&
      draft.address.zip.trim() &&
      draft.address.city.trim(),
    );
  }
  function save() {
    const record: PropertyRecord = {
      id: uid("property"),
      kind: "property",
      archived: false,
      ...draft,
      history: [nowHistory("Création du bien", "", draft.name)],
      rentHistory:
        draft.rental.rentHC > 0
          ? [
              {
                id: uid("rent"),
                effectiveDate: new Date().toLocaleDateString("fr-FR"),
                reason: "Création du loyer initial",
                oldRent: 0,
                newRent: draft.rental.rentHC,
              },
            ]
          : [],
    };
    onSave(record);
  }

  return (
    <WizardLayout
      title="Nouveau bien individuel"
      subtitle="Création guidée d'un bien louable directement."
      steps={steps}
      step={step}
      onBack={onBack}
      onPrev={() => setStep((value) => Math.max(0, value - 1))}
      onNext={() => {
        if (canMove())
          setStep((value) => Math.min(steps.length - 1, value + 1));
      }}
      onSave={save}
      disabledNext={!canMove()}
    >
      {step === 0 && <GeneralPropertyForm draft={draft} patch={patch} />}
      {step === 1 && <PropertyCharacteristics draft={draft} patch={patch} />}
      {step === 2 && (
        <RentalForm
          rental={draft.rental}
          onChange={(rental) => patch({ rental })}
        />
      )}
      {step === 3 && (
        <IndexationForm
          indexation={draft.indexation}
          onChange={(indexation) => patch({ indexation })}
        />
      )}
      {step === 4 && (
        <FinancialForm
          financial={draft.financial}
          onChange={(financial) => patch({ financial })}
        />
      )}
      {step === 5 && (
        <DocumentsEditor
          documents={draft.documents}
          onChange={(documents) => patch({ documents })}
        />
      )}
      {step === 6 && <PropertySummary draft={draft} />}
    </WizardLayout>
  );
}

function GeneralPropertyForm({
  draft,
  patch,
}: {
  draft: PropertyDraft;
  patch: (value: Partial<PropertyDraft>) => void;
}) {
  return (
    <div className="space-y-7">
      <div>
        <SectionTitle>Identification</SectionTitle>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Nom du bien" required>
            <Input
              value={draft.name}
              onChange={(name) => patch({ name })}
              placeholder="Ex. Appartement Belleville"
            />
          </Field>
          <Field label="Référence interne" required>
            <Input
              value={draft.reference}
              onChange={(reference) => patch({ reference })}
              placeholder="BIEN-000001"
            />
          </Field>
          <Field label="Type de bien">
            <Select
              value={draft.type}
              onChange={(type) => patch({ type: type as PropertyType })}
            >
              {PROPERTY_TYPES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Statut">
            <Select
              value={draft.status}
              onChange={(status) => patch({ status: status as Status })}
            >
              {STATUSES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Date d'acquisition">
            <Input
              type="date"
              value={draft.acquiredAt}
              onChange={(acquiredAt) => patch({ acquiredAt })}
            />
          </Field>
        </div>
      </div>
      <div>
        <SectionTitle>Adresse</SectionTitle>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Adresse" required className="sm:col-span-2">
            <Input
              value={draft.address.street}
              onChange={(street) =>
                patch({ address: { ...draft.address, street } })
              }
              placeholder="12 rue de Belleville"
            />
          </Field>
          <Field label="Complément">
            <Input
              value={draft.address.extra}
              onChange={(extra) =>
                patch({ address: { ...draft.address, extra } })
              }
            />
          </Field>
          <Field label="Pays">
            <Input
              value={draft.address.country}
              onChange={(country) =>
                patch({ address: { ...draft.address, country } })
              }
            />
          </Field>
          <Field label="Code postal" required>
            <Input
              value={draft.address.zip}
              onChange={(zip) => patch({ address: { ...draft.address, zip } })}
            />
          </Field>
          <Field label="Ville" required>
            <Input
              value={draft.address.city}
              onChange={(city) =>
                patch({ address: { ...draft.address, city } })
              }
            />
          </Field>
        </div>
      </div>
      <div>
        <SectionTitle>Références cadastrales</SectionTitle>
        <div className="grid sm:grid-cols-3 gap-4">
          <Field label="Référence cadastrale">
            <Input
              value={draft.cadastre.reference}
              onChange={(reference) =>
                patch({ cadastre: { ...draft.cadastre, reference } })
              }
            />
          </Field>
          <Field label="Section cadastrale">
            <Input
              value={draft.cadastre.section}
              onChange={(section) =>
                patch({ cadastre: { ...draft.cadastre, section } })
              }
            />
          </Field>
          <Field label="N° de parcelle">
            <Input
              value={draft.cadastre.parcel}
              onChange={(parcel) =>
                patch({ cadastre: { ...draft.cadastre, parcel } })
              }
            />
          </Field>
        </div>
      </div>
    </div>
  );
}

function PropertyCharacteristics({
  draft,
  patch,
}: {
  draft: PropertyDraft;
  patch: (value: Partial<PropertyDraft>) => void;
}) {
  const [options, setOptions] = useState(FEATURES_PROPERTY);
  const updateSurface = (key: keyof Surfaces, value: string) =>
    patch({ surfaces: { ...draft.surfaces, [key]: Number(value) || 0 } });
  const updateComposition = (key: keyof Composition, value: string) =>
    patch({ composition: { ...draft.composition, [key]: Number(value) || 0 } });
  return (
    <div className="space-y-7">
      <div>
        <SectionTitle>Surfaces</SectionTitle>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {(
            [
              ["habitable", "Surface habitable (m²)"],
              ["carrez", "Surface Loi Carrez (m²)"],
              ["useful", "Surface utile (m²)"],
              ["total", "Surface totale (m²)"],
              ["land", "Surface terrain (m²)"],
            ] as [keyof Surfaces, string][]
          ).map(([key, label]) => (
            <Field key={key} label={label}>
              <Input
                type="number"
                value={draft.surfaces[key] || ""}
                onChange={(value) => updateSurface(key, value)}
              />
            </Field>
          ))}
        </div>
      </div>
      <div>
        <SectionTitle>Composition</SectionTitle>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {(
            [
              ["rooms", "Nombre de pièces"],
              ["bedrooms", "Chambres"],
              ["showerRooms", "Salles d'eau"],
              ["bathrooms", "Salles de bain"],
              ["toilets", "WC"],
            ] as [keyof Composition, string][]
          ).map(([key, label]) => (
            <Field key={key} label={label}>
              <Input
                type="number"
                value={draft.composition[key] || ""}
                onChange={(value) => updateComposition(key, value)}
              />
            </Field>
          ))}
        </div>
      </div>
      <div>
        <SectionTitle>Caractéristiques et équipements</SectionTitle>
        <Checkboxes
          options={options}
          selected={draft.features}
          onChange={(features) => patch({ features })}
        />
        <InlineAdd
          label="Nouvelle caractéristique"
          onAdd={(item) => {
            if (!options.includes(item)) setOptions([...options, item]);
            if (!draft.features.includes(item))
              patch({ features: [...draft.features, item] });
          }}
        />
      </div>
    </div>
  );
}

function RentalForm({
  rental,
  onChange,
}: {
  rental: RentalInfo;
  onChange: (rental: RentalInfo) => void;
}) {
  const update = (key: keyof RentalInfo, value: string | ChargeMode) =>
    onChange({
      ...rental,
      [key]: ["rentHC", "monthlyCharges", "deposit", "depositMonths"].includes(
        key,
      )
        ? Number(value) || 0
        : value,
    });
  return (
    <div className="space-y-7">
      <div>
        <SectionTitle>Loyer et charges</SectionTitle>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Loyer hors charges (€)">
            <Input
              type="number"
              value={rental.rentHC || ""}
              onChange={(value) => update("rentHC", value)}
            />
          </Field>
          <Field label="Provision mensuelle sur charges (€)">
            <Input
              type="number"
              value={rental.monthlyCharges || ""}
              onChange={(value) => update("monthlyCharges", value)}
            />
          </Field>
          <Field label="Mode de récupération">
            <Select
              value={rental.chargeMode}
              onChange={(chargeMode) =>
                update("chargeMode", chargeMode as ChargeMode)
              }
            >
              <option value="forfait">Forfait</option>
              <option value="provision">
                Provision avec régularisation annuelle
              </option>
            </Select>
          </Field>
          <div
            className="rounded-2xl p-4 flex justify-between items-center"
            style={{ background: palette.greenSoft }}
          >
            <span
              className="text-xs font-black"
              style={{ color: palette.green }}
            >
              Loyer charges comprises
            </span>
            <strong style={{ color: palette.green }}>
              {euros(rental.rentHC + rental.monthlyCharges)}
            </strong>
          </div>
        </div>
      </div>
      <div>
        <SectionTitle>Dépôt de garantie</SectionTitle>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Montant (€)">
            <Input
              type="number"
              value={rental.deposit || ""}
              onChange={(value) => update("deposit", value)}
            />
          </Field>
          <Field label="Nombre de mois">
            <Input
              type="number"
              value={rental.depositMonths || ""}
              onChange={(value) => update("depositMonths", value)}
            />
          </Field>
        </div>
      </div>
      <p
        className="text-xs p-4 rounded-2xl font-bold"
        style={{ background: palette.indigoSoft, color: palette.indigo }}
      >
        Les tantièmes, clés de répartition et catégories de charges ne sont pas
        demandés pour un bien individuel.
      </p>
    </div>
  );
}

function IndexationForm({
  indexation,
  onChange,
}: {
  indexation: Indexation;
  onChange: (indexation: Indexation) => void;
}) {
  return (
    <div className="space-y-4">
      <SectionTitle>Paramètres d'indexation IRL</SectionTitle>
      <div className="grid sm:grid-cols-3 gap-4">
        <Field label="Date anniversaire">
          <Input
            type="date"
            value={indexation.anniversary}
            onChange={(anniversary) => onChange({ ...indexation, anniversary })}
          />
        </Field>
        <Field label="Trimestre IRL">
          <Select
            value={indexation.quarter}
            onChange={(quarter) =>
              onChange({
                ...indexation,
                quarter: quarter as Indexation["quarter"],
              })
            }
          >
            <option value="">Sélectionner…</option>
            {["T1", "T2", "T3", "T4"].map((quarter) => (
              <option key={quarter}>{quarter}</option>
            ))}
          </Select>
        </Field>
        <Field label="Année de référence">
          <Select
            value={indexation.year}
            onChange={(year) => onChange({ ...indexation, year })}
          >
            <option value="">Sélectionner…</option>
            {IRL_YEARS.map((year) => (
              <option key={year}>{year}</option>
            ))}
          </Select>
        </Field>
      </div>
      <p
        className="text-xs p-4 rounded-2xl font-bold"
        style={{ background: palette.indigoSoft, color: palette.indigo }}
      >
        La plateforme gère uniquement l'IRL. Les données sont destinées au
        module de révision des loyers.
      </p>
    </div>
  );
}

function FinancialForm({
  financial,
  onChange,
}: {
  financial: FinancialInfo;
  onChange: (financial: FinancialInfo) => void;
}) {
  const numberUpdate = (key: keyof FinancialInfo, value: string) =>
    onChange({ ...financial, [key]: Number(value) || 0 });
  return (
    <div className="space-y-7">
      <div>
        <SectionTitle>Acquisition</SectionTitle>
        <div className="grid sm:grid-cols-2 gap-4">
          {(
            [
              ["purchasePrice", "Prix d'achat (€)"],
              ["notaryFees", "Frais de notaire (€)"],
              ["agencyFees", "Frais d'agence (€)"],
              ["works", "Travaux avant mise en location (€)"],
            ] as [keyof FinancialInfo, string][]
          ).map(([key, label]) => (
            <Field key={key} label={label}>
              <Input
                type="number"
                value={Number(financial[key]) || ""}
                onChange={(value) => numberUpdate(key, value)}
              />
            </Field>
          ))}
        </div>
        <div
          className="mt-4 p-4 rounded-2xl flex justify-between"
          style={{ background: palette.orangeSoft }}
        >
          <span
            className="text-sm font-black"
            style={{ color: palette.orange }}
          >
            Coût total d'acquisition
          </span>
          <strong style={{ color: palette.orange }}>
            {euros(acquisitionTotal(financial))}
          </strong>
        </div>
      </div>
      <div>
        <SectionTitle>Financement</SectionTitle>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Type de financement">
            <Select
              value={financial.financing}
              onChange={(financing) =>
                onChange({
                  ...financial,
                  financing: financing as FinancingType,
                })
              }
            >
              <option value="cash">Achat comptant</option>
              <option value="loan">Achat financé</option>
            </Select>
          </Field>
        </div>
        {financial.financing === "loan" ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {(
              [
                ["borrowedCapital", "Capital emprunté (€)"],
                ["rate", "Taux (%)"],
                ["durationMonths", "Durée (mois)"],
                ["monthlyPayment", "Mensualité (€)"],
                ["insurance", "Assurance emprunteur (€/mois)"],
              ] as [keyof FinancialInfo, string][]
            ).map(([key, label]) => (
              <Field key={key} label={label}>
                <Input
                  type="number"
                  value={Number(financial[key]) || ""}
                  onChange={(value) => numberUpdate(key, value)}
                />
              </Field>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function PropertySummary({ draft }: { draft: PropertyDraft }) {
  return (
    <div>
      <SectionTitle>Récapitulatif</SectionTitle>
      <div className="rounded-2xl p-4" style={{ background: palette.pale }}>
        <KeyValue label="Nom" value={draft.name} />
        <KeyValue label="Référence" value={draft.reference} />
        <KeyValue label="Type" value={labelPropertyType(draft.type)} />
        <KeyValue label="Statut" value={labelStatus(draft.status)} />
        <KeyValue label="Adresse" value={addressLabel(draft.address)} />
        <KeyValue
          label="Surface habitable"
          value={`${draft.surfaces.habitable || 0} m²`}
        />
        <KeyValue label="Loyer HC" value={euros(draft.rental.rentHC)} />
        <KeyValue
          label="Prix d'achat"
          value={euros(draft.financial.purchasePrice)}
        />
      </div>
    </div>
  );
}

/* ---------- building wizard ---------- */

type BuildingDraft = Omit<
  BuildingRecord,
  "id" | "kind" | "archived" | "history" | "lots"
>;

function blankBuildingDraft(reference: string): BuildingDraft {
  return {
    name: "",
    reference,
    acquiredAt: "",
    address: blankAddress(),
    cadastre: blankCadastre(),
    totalSurface: 0,
    totalHabitableSurface: 0,
    commonSurface: 0,
    capacity: { homes: 0, caves: 0, garages: 0, parkings: 0 },
    features: [],
    financial: blankFinancial(),
    charges: { mode: "provision", allocation: "tantiemes", totalTantiemes: 0 },
    documents: [],
  };
}

function BuildingWizard({
  reference,
  onBack,
  onSave,
}: {
  reference: string;
  onBack: () => void;
  onSave: (building: BuildingRecord) => void;
}) {
  const steps = [
    "Informations générales",
    "Caractéristiques",
    "Informations financières",
    "Gestion des charges",
    "Documents",
    "Validation",
  ];
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<BuildingDraft>(() =>
    blankBuildingDraft(reference),
  );
  const patch = (value: Partial<BuildingDraft>) =>
    setDraft((current) => ({ ...current, ...value }));
  const canMove =
    step !== 0 ||
    Boolean(
      draft.name.trim() &&
      draft.address.street.trim() &&
      draft.address.zip.trim() &&
      draft.address.city.trim(),
    );
  function save() {
    onSave({
      id: uid("building"),
      kind: "building",
      archived: false,
      ...draft,
      lots: [],
      history: [nowHistory("Création de l'immeuble", "", draft.name)],
    });
  }

  return (
    <WizardLayout
      title="Nouvel immeuble de rapport"
      subtitle="L'immeuble ne peut pas être loué directement : les locations sont rattachées à ses lots."
      steps={steps}
      step={step}
      onBack={onBack}
      onPrev={() => setStep((value) => Math.max(0, value - 1))}
      onNext={() => {
        if (canMove) setStep((value) => Math.min(steps.length - 1, value + 1));
      }}
      onSave={save}
      disabledNext={!canMove}
    >
      {step === 0 && <BuildingGeneral draft={draft} patch={patch} />}
      {step === 1 && <BuildingCharacteristics draft={draft} patch={patch} />}
      {step === 2 && (
        <FinancialForm
          financial={draft.financial}
          onChange={(financial) => patch({ financial })}
        />
      )}
      {step === 3 && <BuildingCharges draft={draft} patch={patch} />}
      {step === 4 && (
        <DocumentsEditor
          documents={draft.documents}
          onChange={(documents) => patch({ documents })}
        />
      )}
      {step === 5 && (
        <div>
          <SectionTitle>Récapitulatif</SectionTitle>
          <div className="rounded-2xl p-4" style={{ background: palette.pale }}>
            <KeyValue label="Nom" value={draft.name} />
            <KeyValue label="Référence" value={draft.reference} />
            <KeyValue label="Adresse" value={addressLabel(draft.address)} />
            <KeyValue
              label="Surface totale"
              value={`${draft.totalSurface} m²`}
            />
            <KeyValue
              label="Tantièmes totaux"
              value={draft.charges.totalTantiemes}
            />
            <KeyValue
              label="Mode de répartition"
              value={
                draft.charges.allocation === "tantiemes"
                  ? "Par tantièmes"
                  : draft.charges.allocation === "surface"
                    ? "Par surface"
                    : "Clé personnalisée"
              }
            />
          </div>
        </div>
      )}
    </WizardLayout>
  );
}

function BuildingGeneral({
  draft,
  patch,
}: {
  draft: BuildingDraft;
  patch: (value: Partial<BuildingDraft>) => void;
}) {
  return (
    <div className="space-y-7">
      <div>
        <SectionTitle>Identification</SectionTitle>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Nom de l'immeuble" required>
            <Input
              value={draft.name}
              onChange={(name) => patch({ name })}
              placeholder="Ex. Immeuble Saint-Georges"
            />
          </Field>
          <Field label="Référence interne">
            <Input
              value={draft.reference}
              onChange={(reference) => patch({ reference })}
            />
          </Field>
          <Field label="Date d'acquisition">
            <Input
              type="date"
              value={draft.acquiredAt}
              onChange={(acquiredAt) => patch({ acquiredAt })}
            />
          </Field>
        </div>
      </div>
      <div>
        <SectionTitle>Adresse</SectionTitle>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Adresse" required className="sm:col-span-2">
            <Input
              value={draft.address.street}
              onChange={(street) =>
                patch({ address: { ...draft.address, street } })
              }
            />
          </Field>
          <Field label="Complément">
            <Input
              value={draft.address.extra}
              onChange={(extra) =>
                patch({ address: { ...draft.address, extra } })
              }
            />
          </Field>
          <Field label="Pays">
            <Input
              value={draft.address.country}
              onChange={(country) =>
                patch({ address: { ...draft.address, country } })
              }
            />
          </Field>
          <Field label="Code postal" required>
            <Input
              value={draft.address.zip}
              onChange={(zip) => patch({ address: { ...draft.address, zip } })}
            />
          </Field>
          <Field label="Ville" required>
            <Input
              value={draft.address.city}
              onChange={(city) =>
                patch({ address: { ...draft.address, city } })
              }
            />
          </Field>
        </div>
      </div>
      <div>
        <SectionTitle>Références cadastrales</SectionTitle>
        <div className="grid sm:grid-cols-3 gap-4">
          <Field label="Référence cadastrale">
            <Input
              value={draft.cadastre.reference}
              onChange={(reference) =>
                patch({ cadastre: { ...draft.cadastre, reference } })
              }
            />
          </Field>
          <Field label="Section">
            <Input
              value={draft.cadastre.section}
              onChange={(section) =>
                patch({ cadastre: { ...draft.cadastre, section } })
              }
            />
          </Field>
          <Field label="Parcelle">
            <Input
              value={draft.cadastre.parcel}
              onChange={(parcel) =>
                patch({ cadastre: { ...draft.cadastre, parcel } })
              }
            />
          </Field>
        </div>
      </div>
    </div>
  );
}

function BuildingCharacteristics({
  draft,
  patch,
}: {
  draft: BuildingDraft;
  patch: (value: Partial<BuildingDraft>) => void;
}) {
  const [options, setOptions] = useState(FEATURES_BUILDING);
  const updateCapacity = (
    key: keyof BuildingDraft["capacity"],
    value: string,
  ) => patch({ capacity: { ...draft.capacity, [key]: Number(value) || 0 } });
  return (
    <div className="space-y-7">
      <div>
        <SectionTitle>Surfaces globales</SectionTitle>
        <div className="grid sm:grid-cols-3 gap-4">
          {(
            [
              ["totalSurface", "Surface totale (m²)"],
              ["totalHabitableSurface", "Surface habitable totale (m²)"],
              ["commonSurface", "Surface des parties communes (m²)"],
            ] as [keyof BuildingDraft, string][]
          ).map(([key, label]) => (
            <Field key={String(key)} label={label}>
              <Input
                type="number"
                value={Number(draft[key]) || ""}
                onChange={(value) =>
                  patch({ [key]: Number(value) || 0 } as Partial<BuildingDraft>)
                }
              />
            </Field>
          ))}
        </div>
      </div>
      <div>
        <SectionTitle>Capacité</SectionTitle>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {(
            [
              ["homes", "Logements"],
              ["caves", "Caves"],
              ["garages", "Garages / box"],
              ["parkings", "Parkings"],
            ] as [keyof BuildingDraft["capacity"], string][]
          ).map(([key, label]) => (
            <Field key={key} label={label}>
              <Input
                type="number"
                value={draft.capacity[key] || ""}
                onChange={(value) => updateCapacity(key, value)}
              />
            </Field>
          ))}
        </div>
      </div>
      <div>
        <SectionTitle>Caractéristiques</SectionTitle>
        <Checkboxes
          options={options}
          selected={draft.features}
          onChange={(features) => patch({ features })}
        />
        <InlineAdd
          label="Nouvelle caractéristique"
          onAdd={(item) => {
            if (!options.includes(item)) setOptions([...options, item]);
            if (!draft.features.includes(item))
              patch({ features: [...draft.features, item] });
          }}
        />
      </div>
    </div>
  );
}

function BuildingCharges({
  draft,
  patch,
}: {
  draft: BuildingDraft;
  patch: (value: Partial<BuildingDraft>) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Mode de récupération">
          <Select
            value={draft.charges.mode}
            onChange={(mode) =>
              patch({ charges: { ...draft.charges, mode: mode as ChargeMode } })
            }
          >
            <option value="forfait">Forfait</option>
            <option value="provision">
              Provision avec régularisation annuelle
            </option>
          </Select>
        </Field>
        <Field label="Méthode de répartition">
          <Select
            value={draft.charges.allocation}
            onChange={(allocation) =>
              patch({
                charges: {
                  ...draft.charges,
                  allocation: allocation as AllocationMode,
                },
              })
            }
          >
            <option value="tantiemes">Répartition par tantièmes</option>
            <option value="surface">Répartition par surface</option>
            <option value="custom">Clé de répartition personnalisée</option>
          </Select>
        </Field>
      </div>
      <Field label="Nombre total de tantièmes">
        <Input
          type="number"
          value={draft.charges.totalTantiemes || ""}
          onChange={(value) =>
            patch({
              charges: { ...draft.charges, totalTantiemes: Number(value) || 0 },
            })
          }
        />
      </Field>
      <p
        className="rounded-2xl p-4 text-xs font-bold"
        style={{ background: palette.indigoSoft, color: palette.indigo }}
      >
        Les montants détaillés des charges sont saisis dans le module de
        régularisation des charges. Les tantièmes seront affectés lors de la
        création des lots.
      </p>
    </div>
  );
}

/* ---------- lot wizard ---------- */

function LotWizard({
  building,
  reference,
  onBack,
  onSave,
}: {
  building: BuildingRecord;
  reference: string;
  onBack: () => void;
  onSave: (lot: Lot) => void;
}) {
  const steps = [
    "Informations générales",
    "Caractéristiques",
    "Informations locatives",
    "Indexation",
    "Validation",
  ];
  const [step, setStep] = useState(0);
  const [lotNumber, setLotNumber] = useState("");
  const [type, setType] = useState<Lot["type"]>("appartement");
  const [status, setStatus] = useState<Status>("vacant");
  const [floor, setFloor] = useState("");
  const [surfaces, setSurfaces] = useState(blankSurfaces());
  const [composition, setComposition] = useState(blankComposition());
  const [features, setFeatures] = useState<string[]>([]);
  const [rental, setRental] = useState(blankRental());
  const [indexation, setIndexation] = useState(blankIndexation());
  const [tantiemes, setTantiemes] = useState(0);

  const usedSurface = building.lots
    .filter((lot) => !lot.archived)
    .reduce((sum, lot) => sum + lot.surfaces.habitable, 0);
  const remainingSurface = Math.max(
    0,
    building.totalHabitableSurface - usedSurface,
  );
  const usedTantiemes = building.lots
    .filter((lot) => !lot.archived)
    .reduce((sum, lot) => sum + lot.tantiemes, 0);
  const remainingTantiemes = Math.max(
    0,
    building.charges.totalTantiemes - usedTantiemes,
  );
  const invalidSurface =
    surfaces.habitable > remainingSurface && building.totalHabitableSurface > 0;
  const invalidTantiemes =
    tantiemes > remainingTantiemes && building.charges.totalTantiemes > 0;
  const canMove = step !== 0 || Boolean(lotNumber.trim() && reference.trim());
  const canSave = !invalidSurface && !invalidTantiemes;

  function save() {
    if (!canSave) return;
    onSave({
      id: uid("lot"),
      buildingId: building.id,
      archived: false,
      lotNumber,
      reference,
      type,
      status,
      floor,
      surfaces,
      composition,
      features,
      rental,
      indexation,
      tantiemes,
      documents: [],
      history: [nowHistory("Création du lot", "", `Lot ${lotNumber}`)],
      rentHistory:
        rental.rentHC > 0
          ? [
              {
                id: uid("rent"),
                effectiveDate: new Date().toLocaleDateString("fr-FR"),
                reason: "Création du loyer initial",
                oldRent: 0,
                newRent: rental.rentHC,
              },
            ]
          : [],
    });
  }

  return (
    <WizardLayout
      title={`Nouveau lot — ${building.name}`}
      subtitle={`Surface disponible : ${remainingSurface} m² · tantièmes disponibles : ${remainingTantiemes}`}
      steps={steps}
      step={step}
      onBack={onBack}
      onPrev={() => setStep((value) => Math.max(0, value - 1))}
      onNext={() => {
        if (canMove) setStep((value) => Math.min(steps.length - 1, value + 1));
      }}
      onSave={save}
      disabledNext={!canMove}
      disabledSave={!canSave}
    >
      {step === 0 && (
        <div className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Numéro du lot" required>
              <Input
                value={lotNumber}
                onChange={setLotNumber}
                placeholder="Ex. 101"
              />
            </Field>
            <Field label="Référence interne">
              <Input value={reference} onChange={() => {}} disabled />
            </Field>
            <Field label="Type de lot">
              <Select
                value={type}
                onChange={(value) => setType(value as Lot["type"])}
              >
                {LOT_TYPES.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Statut">
              <Select
                value={status}
                onChange={(value) => setStatus(value as Status)}
              >
                {STATUSES.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Étage">
              <Input value={floor} onChange={setFloor} placeholder="Ex. 1" />
            </Field>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <Field label="Surface habitable (m²)">
              <Input
                type="number"
                value={surfaces.habitable || ""}
                onChange={(value) =>
                  setSurfaces({ ...surfaces, habitable: Number(value) || 0 })
                }
              />
            </Field>
            <Field label="Surface Loi Carrez (m²)">
              <Input
                type="number"
                value={surfaces.carrez || ""}
                onChange={(value) =>
                  setSurfaces({ ...surfaces, carrez: Number(value) || 0 })
                }
              />
            </Field>
            <Field label="Tantièmes">
              <Input
                type="number"
                value={tantiemes || ""}
                onChange={(value) => setTantiemes(Number(value) || 0)}
              />
            </Field>
          </div>
          {invalidSurface ? (
            <p
              className="p-3 rounded-2xl text-xs font-bold"
              style={{ background: palette.redSoft, color: palette.red }}
            >
              La surface du lot dépasse la surface habitable disponible.
            </p>
          ) : null}
          {invalidTantiemes ? (
            <p
              className="p-3 rounded-2xl text-xs font-bold"
              style={{ background: palette.redSoft, color: palette.red }}
            >
              Les tantièmes du lot dépassent le solde disponible.
            </p>
          ) : null}
        </div>
      )}
      {step === 1 && (
        <LotCharacteristics
          composition={composition}
          setComposition={setComposition}
          features={features}
          setFeatures={setFeatures}
        />
      )}
      {step === 2 && <RentalForm rental={rental} onChange={setRental} />}
      {step === 3 && (
        <IndexationForm indexation={indexation} onChange={setIndexation} />
      )}
      {step === 4 && (
        <div>
          <SectionTitle>Récapitulatif du lot</SectionTitle>
          <div className="rounded-2xl p-4" style={{ background: palette.pale }}>
            <KeyValue label="N° lot" value={lotNumber} />
            <KeyValue label="Référence" value={reference} />
            <KeyValue
              label="Surface habitable"
              value={`${surfaces.habitable} m²`}
            />
            <KeyValue label="Tantièmes" value={tantiemes} />
            <KeyValue label="Loyer HC" value={euros(rental.rentHC)} />
          </div>
        </div>
      )}
    </WizardLayout>
  );
}

function LotCharacteristics({
  composition,
  setComposition,
  features,
  setFeatures,
}: {
  composition: Composition;
  setComposition: (value: Composition) => void;
  features: string[];
  setFeatures: (value: string[]) => void;
}) {
  const [options, setOptions] = useState(FEATURES_PROPERTY);
  return (
    <div className="space-y-7">
      <div>
        <SectionTitle>Composition</SectionTitle>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {(
            [
              ["rooms", "Nombre de pièces"],
              ["bedrooms", "Chambres"],
              ["showerRooms", "Salles d'eau"],
              ["bathrooms", "Salles de bain"],
              ["toilets", "WC"],
            ] as [keyof Composition, string][]
          ).map(([key, label]) => (
            <Field key={key} label={label}>
              <Input
                type="number"
                value={composition[key] || ""}
                onChange={(value) =>
                  setComposition({ ...composition, [key]: Number(value) || 0 })
                }
              />
            </Field>
          ))}
        </div>
      </div>
      <div>
        <SectionTitle>Caractéristiques</SectionTitle>
        <Checkboxes
          options={options}
          selected={features}
          onChange={setFeatures}
        />
        <InlineAdd
          label="Nouvelle caractéristique"
          onAdd={(item) => {
            if (!options.includes(item)) setOptions([...options, item]);
            if (!features.includes(item)) setFeatures([...features, item]);
          }}
        />
      </div>
    </div>
  );
}

/* ---------- common wizard ---------- */

function WizardLayout({
  title,
  subtitle,
  steps,
  step,
  onBack,
  onPrev,
  onNext,
  onSave,
  disabledNext,
  disabledSave = false,
  children,
}: {
  title: string;
  subtitle: string;
  steps: string[];
  step: number;
  onBack: () => void;
  onPrev: () => void;
  onNext: () => void;
  onSave: () => void;
  disabledNext: boolean;
  disabledSave?: boolean;
  children: ReactNode;
}) {
  const last = step === steps.length - 1;
  return (
    <Page>
      <header
        className="px-4 sm:px-6 py-6"
        style={{ background: "linear-gradient(135deg,#fff7ed,#fff)" }}
      >
        <div className="max-w-5xl mx-auto">
          <Button tone="secondary" onClick={onBack}>
            ← Retour à la liste
          </Button>
          <h1 className="text-2xl sm:text-3xl font-black mt-5">{title}</h1>
          <p
            className="text-sm font-bold mt-1"
            style={{ color: palette.muted }}
          >
            {subtitle}
          </p>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-7">
        <Progress steps={steps} current={step} />
        <Card>{children}</Card>
        <div className="flex justify-between gap-3 mt-5">
          <Button tone="secondary" disabled={step === 0} onClick={onPrev}>
            ← Précédent
          </Button>
          {last ? (
            <Button tone="success" disabled={disabledSave} onClick={onSave}>
              ✓ Enregistrer
            </Button>
          ) : (
            <Button disabled={disabledNext} onClick={onNext}>
              Suivant →
            </Button>
          )}
        </div>
        <p className="text-xs font-bold mt-3" style={{ color: palette.muted }}>
          Les données saisies sont conservées dans l'état du front-end pendant
          cette session.
        </p>
      </main>
    </Page>
  );
}

/* ---------- details ---------- */

function Detail({
  asset,
  onBack,
  onArchive,
  onAddLot,
  onEdit,
  onOpenLot,
}: {
  asset: Asset;
  onBack: () => void;
  onArchive: () => void;
  onAddLot: () => void;
  onEdit: () => void;
  onOpenLot: (lotId: string) => void;
}) {
  const [tab, setTab] = useState<Tab>("general");
  const tabs: { value: Tab; label: string }[] = [
    { value: "general", label: "Général" },
    { value: "rental", label: "Locatif" },
    { value: "financial", label: "Financier" },
    { value: "documents", label: "Documents" },
    { value: "history", label: "Historique" },
  ];
  const isBuilding = asset.kind === "building";
  const rental = isBuilding ? undefined : asset.rental;
  const docs = asset.documents;
  const history = asset.history;
  return (
    <Page>
      <header
        className="bg-white px-4 sm:px-6 py-5"
        style={{ borderBottom: `1px solid ${palette.line}` }}
      >
        <div className="max-w-[1070px] mx-auto flex flex-wrap items-center gap-3">
          <Button tone="secondary" onClick={onBack}>
            ← Retour
          </Button>
          <div className="flex-1 min-w-[220px]">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-black">{asset.name}</h1>
              {!isBuilding ? (
                <Badge status={asset.status}>{labelStatus(asset.status)}</Badge>
              ) : (
                <span
                  className="px-2.5 py-1 rounded-full text-xs font-extrabold"
                  style={{
                    background: palette.indigoSoft,
                    color: palette.indigo,
                  }}
                >
                  Immeuble de rapport
                </span>
              )}
            </div>
            <p
              className="text-xs font-bold mt-1"
              style={{ color: palette.muted }}
            >
              {asset.reference} · {addressLabel(asset.address)}
            </p>
          </div>
          <Button tone="secondary" onClick={onEdit}>
            ✏️ Modifier
          </Button>
          {isBuilding ? (
            <Button onClick={onAddLot}>+ Ajouter un lot</Button>
          ) : null}
          <Button tone="danger" onClick={onArchive}>
            {asset.archived ? "Réactiver" : "Archiver"}
          </Button>
        </div>
      </header>
      <main className="max-w-[1070px] mx-auto px-4 sm:px-6 py-6 space-y-5">
        <div className="flex gap-2 overflow-x-auto">
          {tabs.map((item) => (
            <button
              key={item.value}
              onClick={() => setTab(item.value)}
              className="px-4 py-2 rounded-2xl text-sm font-extrabold whitespace-nowrap"
              style={{
                background: tab === item.value ? palette.orange : "#fff",
                color: tab === item.value ? "#fff" : palette.muted,
                border: `1px solid ${tab === item.value ? palette.orange : palette.line}`,
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
        {tab === "general" ? <GeneralDetail asset={asset} /> : null}
        {tab === "rental" ? (
          <RentalDetail asset={asset} onOpenLot={onOpenLot} />
        ) : null}
        {tab === "financial" ? (
          <FinancialDetail financial={asset.financial} />
        ) : null}
        {tab === "documents" ? (
          <Card>
            <SectionTitle>Documents</SectionTitle>
            {docs.length === 0 ? (
              <p
                className="text-sm text-center py-7"
                style={{ color: palette.muted }}
              >
                Aucun document.
              </p>
            ) : (
              <div className="space-y-2">
                {docs.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3 rounded-2xl"
                    style={{ background: palette.pale }}
                  >
                    <p className="font-black text-sm">{doc.name}</p>
                    <p
                      className="text-xs font-bold"
                      style={{ color: palette.muted }}
                    >
                      {doc.category} · {doc.archived ? "Archivé" : "Actif"} ·{" "}
                      {doc.versions.length} version(s)
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        ) : null}
        {tab === "history" ? (
          <HistoryDetail
            history={history}
            rentHistory={isBuilding ? [] : asset.rentHistory}
          />
        ) : null}
      </main>
    </Page>
  );
}

function GeneralDetail({ asset }: { asset: Asset }) {
  const building = asset.kind === "building" ? asset : undefined;
  return (
    <div className="grid lg:grid-cols-2 gap-5">
      <Card>
        <SectionTitle>Informations générales</SectionTitle>
        <KeyValue label="Référence" value={asset.reference} />
        <KeyValue label="Date d'acquisition" value={asset.acquiredAt || "—"} />
        <KeyValue label="Adresse" value={addressLabel(asset.address)} />
        <KeyValue
          label="Cadastre"
          value={
            [
              asset.cadastre.reference,
              asset.cadastre.section,
              asset.cadastre.parcel,
            ]
              .filter(Boolean)
              .join(" · ") || "—"
          }
        />
        {asset.kind === "property" ? (
          <>
            <KeyValue label="Type" value={labelPropertyType(asset.type)} />
            <KeyValue label="Statut" value={labelStatus(asset.status)} />
            <KeyValue
              label="Surface habitable"
              value={`${asset.surfaces.habitable} m²`}
            />
            <KeyValue label="Pièces" value={asset.composition.rooms} />
          </>
        ) : (
          <>
            <KeyValue
              label="Surface totale"
              value={`${building?.totalSurface || 0} m²`}
            />
            <KeyValue
              label="Surface habitable totale"
              value={`${building?.totalHabitableSurface || 0} m²`}
            />
            <KeyValue
              label="Parties communes"
              value={`${building?.commonSurface || 0} m²`}
            />
            <KeyValue
              label="Capacité logements"
              value={building?.capacity.homes || 0}
            />
          </>
        )}
      </Card>
      {asset.kind === "property" ? (
        <Card>
          <SectionTitle>Caractéristiques</SectionTitle>
          <div className="flex flex-wrap gap-2">
            {asset.features.length ? (
              asset.features.map((feature) => (
                <span
                  key={feature}
                  className="px-3 py-1.5 rounded-2xl text-xs font-bold"
                  style={{
                    background: palette.orangeSoft,
                    color: palette.orange,
                  }}
                >
                  {feature}
                </span>
              ))
            ) : (
              <span className="text-sm" style={{ color: palette.muted }}>
                Aucune caractéristique.
              </span>
            )}
          </div>
        </Card>
      ) : (
        <LotsPanel building={building!} />
      )}
    </div>
  );
}

function LotsPanel({ building }: { building: BuildingRecord }) {
  const usedSurface = building.lots
    .filter((lot) => !lot.archived)
    .reduce((total, lot) => total + lot.surfaces.habitable, 0);
  const usedTantiemes = building.lots
    .filter((lot) => !lot.archived)
    .reduce((total, lot) => total + lot.tantiemes, 0);
  return (
    <Card>
      <SectionTitle>Synthèse locative</SectionTitle>
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-2xl" style={{ background: palette.pale }}>
          <p className="text-xs font-bold" style={{ color: palette.muted }}>
            Lots créés
          </p>
          <p className="font-black">
            {building.lots.filter((lot) => !lot.archived).length}
          </p>
        </div>
        <div className="p-3 rounded-2xl" style={{ background: palette.pale }}>
          <p className="text-xs font-bold" style={{ color: palette.muted }}>
            Surface restante
          </p>
          <p className="font-black">
            {Math.max(0, building.totalHabitableSurface - usedSurface)} m²
          </p>
        </div>
        <div className="p-3 rounded-2xl" style={{ background: palette.pale }}>
          <p className="text-xs font-bold" style={{ color: palette.muted }}>
            Tantièmes restants
          </p>
          <p className="font-black">
            {Math.max(0, building.charges.totalTantiemes - usedTantiemes)}
          </p>
        </div>
        <div className="p-3 rounded-2xl" style={{ background: palette.pale }}>
          <p className="text-xs font-bold" style={{ color: palette.muted }}>
            Loyers HC des lots
          </p>
          <p className="font-black">
            {euros(
              building.lots
                .filter((lot) => !lot.archived)
                .reduce((sum, lot) => sum + lot.rental.rentHC, 0),
            )}
          </p>
        </div>
      </div>
      <p className="text-xs font-bold mt-4" style={{ color: palette.muted }}>
        Les lots sont disponibles dans l'onglet « Locatif ».
      </p>
    </Card>
  );
}

function RentalDetail({
  asset,
  onOpenLot,
}: {
  asset: Asset;
  onOpenLot: (lotId: string) => void;
}) {
  if (asset.kind === "building") {
    const activeLots = asset.lots.filter((lot) => !lot.archived);
    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-lg font-black">Lots locatifs</h2>
            <p className="text-sm font-bold" style={{ color: palette.muted }}>
              Cliquez sur un lot pour consulter ses informations puis le
              modifier.
            </p>
          </div>
        </div>
        {activeLots.length === 0 ? (
          <Card>
            <p
              className="py-8 text-center text-sm font-bold"
              style={{ color: palette.muted }}
            >
              Aucun lot créé dans cet immeuble.
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {activeLots.map((lot) => (
              <button
                key={lot.id}
                type="button"
                onClick={() => onOpenLot(lot.id)}
                className="w-full text-left rounded-[28px] px-5 py-4 transition hover:-translate-y-0.5 hover:shadow-lg"
                style={{
                  background: "#fff",
                  border: `1px solid ${palette.line}`,
                  boxShadow: "0 4px 12px rgba(15,23,42,.08)",
                }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-none"
                    style={{
                      background: "linear-gradient(135deg,#f97316,#fb923c)",
                    }}
                  >
                    🔑
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-black">
                      Lot {lot.lotNumber}
                    </h3>
                    <p
                      className="text-sm font-bold"
                      style={{ color: palette.muted }}
                    >
                      {labelPropertyType(lot.type)} • {lot.reference}
                    </p>
                    <p
                      className="text-xs font-bold mt-0.5"
                      style={{ color: "#94a3b8" }}
                    >
                      Étage {lot.floor || "—"} · {lot.surfaces.habitable} m² ·{" "}
                      {lot.tantiemes} tantièmes
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge status={lot.status}>{labelStatus(lot.status)}</Badge>
                    <span
                      className="text-sm font-black"
                      style={{ color: palette.orange }}
                    >
                      {euros(lot.rental.rentHC)}
                    </span>
                    <span
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{
                        background: palette.orangeSoft,
                        color: palette.orange,
                      }}
                    >
                      →
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }
  return (
    <div className="grid lg:grid-cols-2 gap-5">
      <Card>
        <SectionTitle>Loyer et charges</SectionTitle>
        <KeyValue
          label="Loyer hors charges"
          value={euros(asset.rental.rentHC)}
        />
        <KeyValue
          label="Provision mensuelle"
          value={euros(asset.rental.monthlyCharges)}
        />
        <KeyValue
          label="Loyer charges comprises"
          value={euros(asset.rental.rentHC + asset.rental.monthlyCharges)}
        />
        <KeyValue
          label="Mode de récupération"
          value={
            asset.rental.chargeMode === "forfait"
              ? "Forfait"
              : "Provision avec régularisation"
          }
        />
        <KeyValue
          label="Dépôt de garantie"
          value={`${euros(asset.rental.deposit)} · ${asset.rental.depositMonths} mois`}
        />
      </Card>
      <Card>
        <SectionTitle>Indexation IRL</SectionTitle>
        <KeyValue
          label="Date anniversaire"
          value={asset.indexation.anniversary || "—"}
        />
        <KeyValue label="Trimestre" value={asset.indexation.quarter || "—"} />
        <KeyValue label="Année" value={asset.indexation.year || "—"} />
      </Card>
    </div>
  );
}

function FinancialDetail({ financial }: { financial: FinancialInfo }) {
  return (
    <Card>
      <SectionTitle>Acquisition et financement</SectionTitle>
      <div className="grid lg:grid-cols-2 gap-x-8">
        <div>
          <KeyValue
            label="Prix d'achat"
            value={euros(financial.purchasePrice)}
          />
          <KeyValue
            label="Frais de notaire"
            value={euros(financial.notaryFees)}
          />
          <KeyValue
            label="Frais d'agence"
            value={euros(financial.agencyFees)}
          />
          <KeyValue label="Travaux" value={euros(financial.works)} />
          <KeyValue
            label="Coût total"
            value={euros(acquisitionTotal(financial))}
          />
        </div>
        <div>
          <KeyValue
            label="Type de financement"
            value={
              financial.financing === "cash"
                ? "Achat comptant"
                : "Achat financé"
            }
          />
          {financial.financing === "loan" ? (
            <>
              <KeyValue
                label="Capital emprunté"
                value={euros(financial.borrowedCapital)}
              />
              <KeyValue label="Taux" value={`${financial.rate} %`} />
              <KeyValue
                label="Durée"
                value={`${financial.durationMonths} mois`}
              />
              <KeyValue
                label="Mensualité"
                value={euros(financial.monthlyPayment)}
              />
              <KeyValue label="Assurance" value={euros(financial.insurance)} />
            </>
          ) : null}
        </div>
      </div>
    </Card>
  );
}

function HistoryDetail({
  history,
  rentHistory,
}: {
  history: HistoryItem[];
  rentHistory: RentHistoryItem[];
}) {
  return (
    <div className="grid lg:grid-cols-2 gap-5">
      <Card>
        <SectionTitle>Historique des modifications</SectionTitle>
        {history.length === 0 ? (
          <p className="text-sm" style={{ color: palette.muted }}>
            Aucune modification.
          </p>
        ) : (
          <div className="space-y-2">
            {history.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-2xl"
                style={{ background: palette.pale }}
              >
                <p className="font-black text-sm">{item.action}</p>
                <p
                  className="text-xs font-bold"
                  style={{ color: palette.muted }}
                >
                  {item.createdAt} · {item.actor}
                </p>
                <p className="text-xs mt-1" style={{ color: palette.muted }}>
                  {item.before || "—"} → {item.after || "—"}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>
      <Card>
        <SectionTitle>Historique des loyers</SectionTitle>
        {rentHistory.length === 0 ? (
          <p className="text-sm" style={{ color: palette.muted }}>
            Aucun historique de loyer.
          </p>
        ) : (
          <div className="space-y-2">
            {rentHistory.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-2xl"
                style={{ background: palette.pale }}
              >
                <p className="font-black text-sm">{item.reason}</p>
                <p
                  className="text-xs font-bold"
                  style={{ color: palette.muted }}
                >
                  {item.effectiveDate}
                </p>
                <p className="text-xs mt-1" style={{ color: palette.muted }}>
                  {euros(item.oldRent)} → {euros(item.newRent)} ·{" "}
                  {item.oldRent
                    ? `${(((item.newRent - item.oldRent) / item.oldRent) * 100).toFixed(2)} %`
                    : "—"}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

/* ---------- list ---------- */

function ListView({
  assets,
  onNew,
  onOpen,
}: {
  assets: Asset[];
  onNew: () => void;
  onOpen: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | AssetKind>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | Status>("all");
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const getAssetStatus = (asset: Asset): Status => {
    if (asset.kind === "property") return asset.status;
    const activeLots = asset.lots.filter((lot) => !lot.archived);
    if (activeLots.some((lot) => lot.status === "occupied")) return "occupied";
    if (activeLots.some((lot) => lot.status === "vacant")) return "vacant";
    return "works";
  };

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return assets.filter((asset) => {
      if (asset.archived) return false;
      if (typeFilter !== "all" && asset.kind !== typeFilter) return false;
      if (statusFilter !== "all" && getAssetStatus(asset) !== statusFilter) return false;

      return (
        !normalized ||
        [asset.name, asset.reference, asset.address.city, asset.address.street]
          .join(" ")
          .toLowerCase()
          .includes(normalized)
      );
    });
  }, [assets, query, typeFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const rentable = assets.flatMap((asset) =>
    asset.kind === "property"
      ? asset.archived
        ? []
        : [{ status: asset.status, rent: asset.rental.rentHC }]
      : asset.lots
          .filter((lot) => !lot.archived)
          .map((lot) => ({ status: lot.status, rent: lot.rental.rentHC })),
  );

  const occupied = rentable.filter((row) => row.status === "occupied").length;
  const vacant = rentable.filter((row) => row.status === "vacant").length;
  const revenue = rentable
    .filter((row) => row.status === "occupied")
    .reduce((sum, row) => sum + row.rent, 0);

  const cards = [
    {
      emoji: "🏠",
      value: rentable.length,
      label: "Biens",
      bg: "linear-gradient(135deg,#f97316,#fb923c)",
    },
    {
      emoji: "✅",
      value: occupied,
      label: "Occupés",
      bg: "linear-gradient(135deg,#22c55e,#4ade80)",
    },
    {
      emoji: "🔑",
      value: vacant,
      label: "Vacants",
      bg: "linear-gradient(135deg,#ec4899,#f472b6)",
    },
    {
      emoji: "💰",
      value: euros(revenue),
      label: "Revenus mensuels",
      bg: "linear-gradient(135deg,#8b5cf6,#a78bfa)",
    },
  ];

  return (
    <Page>
      <header
        className="px-4 sm:px-6 py-5"
        style={{ background: "linear-gradient(135deg,#fff7ed,#fff)" }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex items-start justify-between gap-4 flex-wrap mb-5">
            <div>
              <h1 className="text-2xl font-black" style={{ color: palette.ink }}>
                🏠 Mes biens
              </h1>
              <p className="text-sm mt-1" style={{ color: palette.muted }}>
                Gérez vos biens individuels, immeubles de rapport et lots locatifs.
              </p>
            </div>

            <button
              onClick={onNew}
              className="px-5 py-2.5 rounded-2xl text-white text-sm font-extrabold shadow-lg transition hover:opacity-90"
              style={{ background: "linear-gradient(135deg,#f97316,#fb923c)" }}
            >
              + Nouveau bien
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {cards.map((card) => (
              <div
                key={card.label}
                className="rounded-3xl p-4 text-white"
                style={{ background: card.bg }}
              >
                <div className="text-2xl mb-1">{card.emoji}</div>
                <p className="text-2xl font-black">{card.value}</p>
                <p className="text-xs font-bold opacity-90">{card.label}</p>
              </div>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-5">
        <div className="flex flex-col lg:flex-row gap-3 mb-5">
          <Input
            value={query}
            onChange={(value) => {
              setQuery(value);
              setPage(1);
            }}
            placeholder="Rechercher par nom, référence ou ville..."
          />

          <div className="flex gap-2 flex-wrap">
            {[
              { value: "all", label: "Tous les types" },
              { value: "property", label: "Biens individuels" },
              { value: "building", label: "Immeubles" },
            ].map((item) => (
              <button
                key={item.value}
                onClick={() => {
                  setTypeFilter(item.value as "all" | AssetKind);
                  setPage(1);
                }}
                className="px-3 py-2 rounded-2xl text-xs font-bold border-2"
                style={{
                  borderColor: typeFilter === item.value ? "#f97316" : "#e2e8f0",
                  backgroundColor: typeFilter === item.value ? "#fff7ed" : "#fff",
                  color: typeFilter === item.value ? "#f97316" : "#64748b",
                }}
              >
                {item.label}
              </button>
            ))}
          </div>

          <Select
            value={statusFilter}
            onChange={(value) => {
              setStatusFilter(value as "all" | Status);
              setPage(1);
            }}
          >
            <option value="all">Tous les statuts</option>
            {STATUSES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </Select>
        </div>

        {paginated.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">🏠</div>
            <p className="font-bold text-base" style={{ color: palette.ink }}>
              Aucun bien trouvé
            </p>
            <p className="text-sm mt-1" style={{ color: palette.muted }}>
              Créez votre premier bien ou modifiez vos filtres.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {paginated.map((asset) => {
              const isBuilding = asset.kind === "building";
              const activeLots = isBuilding
                ? asset.lots.filter((lot) => !lot.archived)
                : [];
              const rent = isBuilding
                ? activeLots.reduce((sum, lot) => sum + lot.rental.rentHC, 0)
                : asset.rental.rentHC;
              const status = getAssetStatus(asset);
              const avatar = isBuilding
                ? "linear-gradient(135deg,#8b5cf6,#a78bfa)"
                : "linear-gradient(135deg,#f97316,#fb923c)";

              return (
                <button
                  key={asset.id}
                  type="button"
                  onClick={() => onOpen(asset.id)}
                  className="w-full bg-white rounded-3xl p-4 shadow-sm hover:shadow-md transition text-left"
                >
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl"
                        style={{ background: avatar }}
                      >
                        {isBuilding ? "🏢" : "🏠"}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-extrabold text-sm" style={{ color: palette.ink }}>
                            {asset.name}
                          </p>
                          <Badge status={status}>{labelStatus(status)}</Badge>
                        </div>

                        <p className="text-xs mt-0.5" style={{ color: palette.muted }}>
                          {isBuilding
                            ? `Immeuble de rapport · ${asset.reference}`
                            : `${labelPropertyType(asset.type)} · ${asset.reference}`}
                        </p>

                        <p className="text-xs mt-0.5" style={{ color: "#cbd5e1" }}>
                          {addressLabel(asset.address)}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-extrabold" style={{ color: "#f97316" }}>
                        {isBuilding ? `${activeLots.length} lot${activeLots.length > 1 ? "s" : ""}` : euros(rent)}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: palette.muted }}>
                        {isBuilding ? `Loyers : ${euros(rent)}` : `${asset.surfaces.habitable || 0} m²`}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        <div className="flex items-center justify-between mt-5">
          <p className="text-xs font-bold" style={{ color: palette.muted }}>
            {filtered.length} résultat(s) · page {page}/{totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              tone="secondary"
              disabled={page === 1}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
            >
              ←
            </Button>
            <Button
              tone="secondary"
              disabled={page === totalPages}
              onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
            >
              →
            </Button>
          </div>
        </div>
      </main>
    </Page>
  );
}

function LotDetail({
  building,
  lot,
  onBack,
  onEdit,
}: {
  building: BuildingRecord;
  lot: Lot;
  onBack: () => void;
  onEdit: () => void;
}) {
  const [tab, setTab] = useState<"general" | "rental" | "history">("general");
  return (
    <Page>
      <header
        className="bg-white px-4 sm:px-6 py-5"
        style={{ borderBottom: `1px solid ${palette.line}` }}
      >
        <div className="max-w-[1070px] mx-auto flex flex-wrap items-center gap-3">
          <Button tone="secondary" onClick={onBack}>
            ← Retour à l'immeuble
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-black">🔑 Lot {lot.lotNumber}</h1>
            <p
              className="text-xs font-bold mt-1"
              style={{ color: palette.muted }}
            >
              {building.name} · {lot.reference} · Étage {lot.floor || "—"}
            </p>
          </div>
          <Button tone="secondary" onClick={onEdit}>
            ✏️ Modifier
          </Button>
          <Badge status={lot.status}>{labelStatus(lot.status)}</Badge>
        </div>
      </header>
      <main className="max-w-[1070px] mx-auto px-4 sm:px-6 py-6 space-y-5">
        <div className="flex gap-2">
          <button
            onClick={() => setTab("general")}
            className="px-4 py-2 rounded-2xl text-sm font-extrabold"
            style={{
              background: tab === "general" ? palette.orange : "#fff",
              color: tab === "general" ? "#fff" : palette.muted,
              border: `1px solid ${palette.line}`,
            }}
          >
            Général
          </button>
          <button
            onClick={() => setTab("rental")}
            className="px-4 py-2 rounded-2xl text-sm font-extrabold"
            style={{
              background: tab === "rental" ? palette.orange : "#fff",
              color: tab === "rental" ? "#fff" : palette.muted,
              border: `1px solid ${palette.line}`,
            }}
          >
            Locatif
          </button>
          <button
            onClick={() => setTab("history")}
            className="px-4 py-2 rounded-2xl text-sm font-extrabold"
            style={{
              background: tab === "history" ? palette.orange : "#fff",
              color: tab === "history" ? "#fff" : palette.muted,
              border: `1px solid ${palette.line}`,
            }}
          >
            Historique
          </button>
        </div>
        {tab === "general" ? (
          <div className="grid lg:grid-cols-2 gap-5">
            <Card>
              <SectionTitle>Informations générales</SectionTitle>
              <KeyValue label="Référence" value={lot.reference} />
              <KeyValue label="Type" value={labelPropertyType(lot.type)} />
              <KeyValue label="Étage" value={lot.floor || "—"} />
              <KeyValue
                label="Surface habitable"
                value={`${lot.surfaces.habitable} m²`}
              />
              <KeyValue label="Tantièmes" value={lot.tantiemes} />
            </Card>
            <Card>
              <SectionTitle>Caractéristiques</SectionTitle>
              <div className="flex flex-wrap gap-2">
                {lot.features.length ? (
                  lot.features.map((feature) => (
                    <span
                      key={feature}
                      className="px-3 py-1.5 rounded-2xl text-xs font-bold"
                      style={{
                        background: palette.orangeSoft,
                        color: palette.orange,
                      }}
                    >
                      {feature}
                    </span>
                  ))
                ) : (
                  <span className="text-sm" style={{ color: palette.muted }}>
                    Aucune caractéristique.
                  </span>
                )}
              </div>
            </Card>
          </div>
        ) : null}
        {tab === "rental" ? (
          <RentalDetail
            asset={{
              kind: "property",
              id: lot.id,
              archived: lot.archived,
              name: `Lot ${lot.lotNumber}`,
              reference: lot.reference,
              type: lot.type,
              status: lot.status,
              acquiredAt: "",
              address: building.address,
              cadastre: building.cadastre,
              surfaces: lot.surfaces,
              composition: lot.composition,
              features: lot.features,
              rental: lot.rental,
              indexation: lot.indexation,
              financial: blankFinancial(),
              documents: lot.documents,
              history: lot.history,
              rentHistory: lot.rentHistory,
            }}
            onOpenLot={() => {}}
          />
        ) : null}
        {tab === "history" ? (
          <HistoryDetail history={lot.history} rentHistory={lot.rentHistory} />
        ) : null}
      </main>
    </Page>
  );
}

function Choice({
  onBack,
  onProperty,
  onBuilding,
}: {
  onBack: () => void;
  onProperty: () => void;
  onBuilding: () => void;
}) {
  return (
    <Page>
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <Button tone="secondary" onClick={onBack}>
          ← Retour
        </Button>
        <h1 className="text-3xl font-black mt-6">
          Quel actif souhaitez-vous créer ?
        </h1>
        <p className="font-bold mt-2" style={{ color: palette.muted }}>
          Choisissez le parcours correspondant à votre patrimoine.
        </p>
        <div className="grid md:grid-cols-2 gap-5 mt-7">
          <Card>
            <p className="text-4xl">🏠</p>
            <h2 className="text-xl font-black mt-3">Bien individuel</h2>
            <p
              className="text-sm font-bold mt-2 min-h-16"
              style={{ color: palette.muted }}
            >
              Un actif autonome, louable directement : appartement, maison,
              studio, cave, garage ou parking.
            </p>
            <Button onClick={onProperty}>Créer un bien individuel</Button>
          </Card>
          <Card>
            <p className="text-4xl">🏢</p>
            <h2 className="text-xl font-black mt-3">Immeuble de rapport</h2>
            <p
              className="text-sm font-bold mt-2 min-h-16"
              style={{ color: palette.muted }}
            >
              Un ensemble immobilier non louable directement. Les locations
              seront rattachées aux lots créés dans l'immeuble.
            </p>
            <Button onClick={onBuilding}>Créer un immeuble</Button>
          </Card>
        </div>
      </main>
    </Page>
  );
}

/* ---------- module root ---------- */

export default function PageBiens() {
  const [assets, setAssets] = useState<Asset[]>(DEMO_ASSETS);
  const [screen, setScreen] = useState<Screen>({ name: "list" });
  const propertyReference = `BIEN-${String(assets.filter((asset) => asset.kind === "property").length + 1).padStart(6, "0")}`;
  const buildingReference = `IMM-${String(assets.filter((asset) => asset.kind === "building").length + 1).padStart(6, "0")}`;
  const selectedAsset =
    screen.name === "detail"
      ? assets.find((asset) => asset.id === screen.assetId)
      : undefined;
  const selectedBuilding =
    screen.name === "lot-wizard" || screen.name === "lot-detail"
      ? assets.find(
          (asset): asset is BuildingRecord =>
            asset.id === screen.buildingId && asset.kind === "building",
        )
      : undefined;
  const selectedLot =
    screen.name === "lot-detail" && selectedBuilding
      ? selectedBuilding.lots.find((lot) => lot.id === screen.lotId)
      : undefined;
  const lotReference = selectedBuilding
    ? `LOT-${String(selectedBuilding.lots.length + 1).padStart(6, "0")}`
    : "LOT-000001";
  const notifyEdit = () =>
    alert(
      "Le bouton Modifier est prêt côté interface. Les champs réellement modifiables, les droits et l'enregistrement seront gérés par le back-end.",
    );
  if (screen.name === "choice")
    return (
      <Choice
        onBack={() => setScreen({ name: "list" })}
        onProperty={() => setScreen({ name: "property-wizard" })}
        onBuilding={() => setScreen({ name: "building-wizard" })}
      />
    );
  if (screen.name === "property-wizard")
    return (
      <PropertyWizard
        reference={propertyReference}
        onBack={() => setScreen({ name: "list" })}
        onSave={(record) => {
          setAssets((current) => [...current, record]);
          setScreen({ name: "list" });
        }}
      />
    );
  if (screen.name === "building-wizard")
    return (
      <BuildingWizard
        reference={buildingReference}
        onBack={() => setScreen({ name: "list" })}
        onSave={(building) => {
          setAssets((current) => [...current, building]);
          setScreen({ name: "list" });
        }}
      />
    );
  if (screen.name === "lot-wizard" && selectedBuilding)
    return (
      <LotWizard
        building={selectedBuilding}
        reference={lotReference}
        onBack={() =>
          setScreen({ name: "detail", assetId: selectedBuilding.id })
        }
        onSave={(lot) => {
          setAssets((current) =>
            current.map((asset) =>
              asset.kind === "building" && asset.id === selectedBuilding.id
                ? {
                    ...asset,
                    lots: [...asset.lots, lot],
                    history: [
                      ...asset.history,
                      nowHistory(
                        "Création d'un lot",
                        "",
                        `Lot ${lot.lotNumber}`,
                      ),
                    ],
                  }
                : asset,
            ),
          );
          setScreen({ name: "detail", assetId: selectedBuilding.id });
        }}
      />
    );
  if (screen.name === "lot-detail" && selectedBuilding && selectedLot)
    return (
      <LotDetail
        building={selectedBuilding}
        lot={selectedLot}
        onBack={() =>
          setScreen({ name: "detail", assetId: selectedBuilding.id })
        }
        onEdit={notifyEdit}
      />
    );
  if (screen.name === "detail" && selectedAsset)
    return (
      <Detail
        asset={selectedAsset}
        onBack={() => setScreen({ name: "list" })}
        onEdit={notifyEdit}
        onArchive={() =>
          setAssets((current) =>
            current.map((asset) =>
              asset.id === selectedAsset.id
                ? {
                    ...asset,
                    archived: !asset.archived,
                    history: [
                      ...asset.history,
                      nowHistory(
                        selectedAsset.archived ? "Réactivation" : "Archivage",
                        "",
                        selectedAsset.name,
                      ),
                    ],
                  }
                : asset,
            ),
          )
        }
        onAddLot={() =>
          selectedAsset.kind === "building" &&
          setScreen({ name: "lot-wizard", buildingId: selectedAsset.id })
        }
        onOpenLot={(lotId) =>
          selectedAsset.kind === "building" &&
          setScreen({ name: "lot-detail", buildingId: selectedAsset.id, lotId })
        }
      />
    );
  return (
    <ListView
      assets={assets}
      onNew={() => setScreen({ name: "choice" })}
      onOpen={(assetId) => setScreen({ name: "detail", assetId })}
    />
  );
}
