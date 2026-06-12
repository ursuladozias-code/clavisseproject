"use client";
import { useState } from "react";

// ============================================================
// TYPES
// ============================================================
type TypeActif = "bien_individuel" | "immeuble_rapport";
type TypeBien = "appartement" | "maison" | "studio" | "garage" | "parking" | "cave" | "box";
type StatutBien = "vacant" | "occupe" | "archive";
type RegimeCharges = "provision" | "forfait";
type ClasseEnergie = "A" | "B" | "C" | "D" | "E" | "F" | "G";

interface ChargeItem {
  id: string;
  libelle: string;
  description?: string;
  montantAnnuel: number;
  selected?: boolean;
}

interface Document {
  id: string;
  nom: string;
  fichier?: File | null;
  dateValidite?: string;
}

interface HistoriqueItem {
  id: string;
  date: string;
  heure: string;
  utilisateur: string;
  champ: string;
  ancienneValeur: string;
  nouvelleValeur: string;
}

interface LotImmeuble {
  id: string;
  immeubleId: string;
  reference: string;
  nom: string;
  type: TypeBien;
  etage?: string;
  complementAdresse?: string;

  surface: number;
  surfaceSol?: number;
  nbPieces: number;
  nbChambres: number;
  nbSDB: number;
  nbWC: number;

  quotePartTantiemes: number;

  loyer: number;
  regimeCharges: RegimeCharges;
  charges: number;
  statut: StatutBien;

  equipements: string[];

  chargesRecup: ChargeItem[];
  chargesNonRecup: ChargeItem[];

  classeEnergie: ClasseEnergie;
  classeClimat: ClasseEnergie;
  consoEnergie: number;
  dateDPE: string;

  documents: Document[];
  historique: HistoriqueItem[];
}

interface BienIndividuel {
  id: string;
  typeActif: "bien_individuel";
  reference: string;
  nom: string;
  proprietaireId: string;

  type: TypeBien;

  numeroVoie: string;
  typeVoie: string;
  nomVoie: string;
  complementAdresse?: string;
  codePostal: string;
  ville: string;
  departement: string;
  region: string;
  pays: string;

  surface: number;
  surfaceSol?: number;
  nbPieces: number;
  nbChambres: number;
  nbSDB: number;
  nbWC: number;

  equipements: string[];

  loyer: number;
  regimeCharges: RegimeCharges;
  charges: number;

  chargesRecup: ChargeItem[];
  chargesNonRecup: ChargeItem[];

  classeEnergie: ClasseEnergie;
  classeClimat: ClasseEnergie;
  consoEnergie: number;
  dateDPE: string;

  nomCopropriete?: string;
  syndic?: string;
  numeroLot?: string;

  statut: StatutBien;

  documents: Document[];
  historique: HistoriqueItem[];
}

interface ImmeubleRapport {
  id: string;
  typeActif: "immeuble_rapport";
  reference: string;
  nom: string;
  proprietaireId: string;

  numeroVoie: string;
  typeVoie: string;
  nomVoie: string;
  complementAdresse?: string;
  codePostal: string;
  ville: string;
  departement: string;
  region: string;
  pays: string;

  nbEtages: number;
  nbLotsTotal: number;
  surfaceTotale: number;

  totalTantiemes: number;

  chargesImmeubleRecup: ChargeItem[];
  chargesImmeubleNonRecup: ChargeItem[];

  commentaires?: string;

  documents: Document[];
  lots: LotImmeuble[];
  historique: HistoriqueItem[];
}

type Actif = BienIndividuel | ImmeubleRapport;

// ============================================================
// MOCK DATA
// ============================================================
const mockProprietaires = [
  { id: "p1", nom: "Dubois", prenom: "Michel", email: "michel.dubois@email.com" },
  { id: "p2", nom: "Laurent", prenom: "Sophie", email: "sophie.laurent@email.com" },
];

const chargesRecupDefaut: ChargeItem[] = [
  { id: "cr1", libelle: "Eau froide", montantAnnuel: 0, selected: false },
  { id: "cr2", libelle: "Eau chaude", montantAnnuel: 0, selected: false },
  { id: "cr3", libelle: "Chauffage", montantAnnuel: 0, selected: false },
  { id: "cr4", libelle: "Électricité des parties communes", montantAnnuel: 0, selected: false },
  { id: "cr5", libelle: "Entretien des parties communes", montantAnnuel: 0, selected: false },
  { id: "cr6", libelle: "Ascenseur", montantAnnuel: 0, selected: false },
  { id: "cr7", libelle: "Espaces verts", montantAnnuel: 0, selected: false },
  { id: "cr8", libelle: "Taxe d'enlèvement des ordures ménagères", montantAnnuel: 0, selected: false },
  { id: "cr9", libelle: "Contrat de nettoyage", montantAnnuel: 0, selected: false },
  { id: "cr10", libelle: "VMC", montantAnnuel: 0, selected: false },
];

const chargesNonRecupDefaut: ChargeItem[] = [
  { id: "cnr1", libelle: "Honoraires de syndic", montantAnnuel: 0, selected: false },
  { id: "cnr2", libelle: "Assurance PNO", montantAnnuel: 0, selected: false },
  { id: "cnr3", libelle: "Taxe foncière", montantAnnuel: 0, selected: false },
  { id: "cnr4", libelle: "Frais de gestion locative", montantAnnuel: 0, selected: false },
  { id: "cnr5", libelle: "Comptabilité", montantAnnuel: 0, selected: false },
  { id: "cnr6", libelle: "Frais bancaires", montantAnnuel: 0, selected: false },
  { id: "cnr7", libelle: "Travaux non récupérables", montantAnnuel: 0, selected: false },
  { id: "cnr8", libelle: "Diagnostics", montantAnnuel: 0, selected: false },
  { id: "cnr9", libelle: "Frais juridiques", montantAnnuel: 0, selected: false },
];

const cloneCharges = (charges: ChargeItem[]) =>
  charges.map(charge => ({ ...charge }));

const mockActifs: Actif[] = [
  {
    id: "bi001",
    typeActif: "bien_individuel",
    reference: "BI-000001",
    nom: "Appartement T3 Centre-ville",
    proprietaireId: "p1",

    type: "appartement",

    numeroVoie: "12",
    typeVoie: "Rue",
    nomVoie: "Victor Hugo",
    codePostal: "69001",
    ville: "Lyon",
    departement: "Rhône",
    region: "Auvergne-Rhône-Alpes",
    pays: "France",

    surface: 68,
    nbPieces: 3,
    nbChambres: 2,
    nbSDB: 1,
    nbWC: 1,

    equipements: ["Cuisine équipée", "Balcon", "Fibre"],

    loyer: 920,
    regimeCharges: "provision",
    charges: 80,

    chargesRecup: cloneCharges(chargesRecupDefaut),
    chargesNonRecup: cloneCharges(chargesNonRecupDefaut),

    classeEnergie: "C",
    classeClimat: "B",
    consoEnergie: 145,
    dateDPE: "2026-01-15",

    statut: "occupe",

    documents: [
      { id: "d1", nom: "DPE", dateValidite: "2036-01-15" },
      { id: "d2", nom: "ERP", dateValidite: "2027-06-01" },
    ],
    historique: [
      {
        id: "h1",
        date: "2026-01-10",
        heure: "09:30",
        utilisateur: "Michel Dubois",
        champ: "Loyer",
        ancienneValeur: "880 €",
        nouvelleValeur: "920 €",
      },
    ],
  },
  {
    id: "im001",
    typeActif: "immeuble_rapport",
    reference: "IMR-000001",
    nom: "Immeuble Les Lilas",
    proprietaireId: "p2",

    numeroVoie: "8",
    typeVoie: "Avenue",
    nomVoie: "Jean Jaurès",
    codePostal: "69007",
    ville: "Lyon",
    departement: "Rhône",
    region: "Auvergne-Rhône-Alpes",
    pays: "France",

    nbEtages: 4,
    nbLotsTotal: 8,
    surfaceTotale: 520,

    totalTantiemes: 1000,

    chargesImmeubleRecup: cloneCharges(chargesRecupDefaut),
    chargesImmeubleNonRecup: cloneCharges(chargesNonRecupDefaut),

    documents: [],
    lots: [
      {
        id: "lot001",
        immeubleId: "im001",
        reference: "LOT-000001",
        nom: "Appartement 1A",
        type: "appartement",
        etage: "1",

        surface: 55,
        nbPieces: 2,
        nbChambres: 1,
        nbSDB: 1,
        nbWC: 1,

        quotePartTantiemes: 250,

        loyer: 750,
        regimeCharges: "provision",
        charges: 60,
        statut: "occupe",

        equipements: ["Cuisine équipée"],

        chargesRecup: cloneCharges(chargesRecupDefaut),
        chargesNonRecup: cloneCharges(chargesNonRecupDefaut),

        classeEnergie: "D",
        classeClimat: "C",
        consoEnergie: 185,
        dateDPE: "2025-06-01",

        documents: [],
        historique: [],
      },
      {
        id: "lot002",
        immeubleId: "im001",
        reference: "LOT-000002",
        nom: "Appartement 2B",
        type: "appartement",
        etage: "2",

        surface: 72,
        nbPieces: 3,
        nbChambres: 2,
        nbSDB: 1,
        nbWC: 1,

        quotePartTantiemes: 320,

        loyer: 950,
        regimeCharges: "provision",
        charges: 80,
        statut: "vacant",

        equipements: ["Balcon", "Fibre"],

        chargesRecup: cloneCharges(chargesRecupDefaut),
        chargesNonRecup: cloneCharges(chargesNonRecupDefaut),

        classeEnergie: "C",
        classeClimat: "B",
        consoEnergie: 130,
        dateDPE: "2025-09-01",

        documents: [],
        historique: [],
      },
    ],
    historique: [],
  },
];

// ============================================================
// COMPOSANTS UI PARTAGÉS
// ============================================================
function StatutBadge({ statut }: { statut: StatutBien }) {
  const cfg: Record<StatutBien, { label: string; bg: string; color: string }> = {
    vacant: { label: "Vacant", bg: "#fef9c3", color: "#854d0e" },
    occupe: { label: "Occupé", bg: "#dcfce7", color: "#166534" },
    archive: { label: "Archivé", bg: "#f1f5f9", color: "#64748b" },
  };

  const c = cfg[statut];

  return (
    <span
      className="px-2 py-0.5 rounded-full text-xs font-bold"
      style={{ backgroundColor: c.bg, color: c.color }}
    >
      {c.label}
    </span>
  );
}

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-3xl p-5 shadow-sm">
      {children}
    </div>
  );
}

function SectionTitle({ emoji, title }: { emoji: string; title: string }) {
  return (
    <p
      className="text-xs font-extrabold uppercase tracking-wide mb-3"
      style={{ color: "#94a3b8" }}
    >
      {emoji} {title}
    </p>
  );
}

function InfoRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="p-3 rounded-2xl" style={{ backgroundColor: "#f8fafc" }}>
      <p className="text-xs font-bold mb-0.5" style={{ color: "#94a3b8" }}>
        {label}
      </p>
      <p className="text-sm font-extrabold" style={{ color: "#1e293b" }}>
        {value}
      </p>
    </div>
  );
}

function FormInput({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
  required = false,
  readOnly = false,
}: {
  label: string;
  value: string | number;
  onChange?: (v: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  readOnly?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-bold mb-1" style={{ color: "#64748b" }}>
        {label}
        {required && <span style={{ color: "#f97316" }}> *</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange?.(e.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
        className="w-full px-4 py-2.5 rounded-2xl text-sm border outline-none transition"
        style={{
          borderColor: "#e2e8f0",
          backgroundColor: readOnly ? "#f8fafc" : "#fff",
          color: "#1e293b",
        }}
      />
    </div>
  );
}

function FormSelect({
  label,
  value,
  onChange,
  options,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-bold mb-1" style={{ color: "#64748b" }}>
        {label}
        {required && <span style={{ color: "#f97316" }}> *</span>}
      </label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-4 py-2.5 rounded-2xl text-sm border outline-none"
        style={{
          borderColor: "#e2e8f0",
          color: "#1e293b",
          backgroundColor: "#fff",
        }}
      >
        <option value="">— Sélectionner —</option>
        {options.map(o => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function StepIndicator({ steps, current }: { steps: string[]; current: number }) {
  return (
    <div className="flex items-center gap-1 flex-wrap mb-6">
      {steps.map((s, i) => (
        <div key={i} className="flex items-center gap-1">
          <div className="flex items-center gap-1.5">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-extrabold"
              style={{
                backgroundColor:
                  i < current ? "#22c55e" : i === current ? "#f97316" : "#e2e8f0",
                color: i <= current ? "#fff" : "#94a3b8",
              }}
            >
              {i < current ? "✓" : i + 1}
            </div>
            <span
              className="text-xs font-bold hidden sm:block"
              style={{
                color:
                  i === current ? "#f97316" : i < current ? "#22c55e" : "#94a3b8",
              }}
            >
              {s}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className="w-4 h-px mx-1"
              style={{
                backgroundColor: i < current ? "#22c55e" : "#e2e8f0",
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function NavButtons({
  onPrev,
  onNext,
  onSave,
  isFirst,
  isLast,
  saveLabel = "Enregistrer",
}: {
  onPrev: () => void;
  onNext: () => void;
  onSave?: () => void;
  isFirst: boolean;
  isLast: boolean;
  saveLabel?: string;
}) {
  return (
    <div className="flex justify-between gap-3 pt-4">
      {!isFirst ? (
        <button
          onClick={onPrev}
          className="px-5 py-2.5 rounded-2xl text-sm font-bold border-2 transition"
          style={{ borderColor: "#e2e8f0", color: "#64748b" }}
        >
          ← Précédent
        </button>
      ) : (
        <div />
      )}

      {isLast ? (
        <button
          onClick={onSave}
          className="px-6 py-2.5 rounded-2xl text-white text-sm font-extrabold shadow"
          style={{ background: "linear-gradient(135deg,#22c55e,#4ade80)" }}
        >
          ✅ {saveLabel}
        </button>
      ) : (
        <button
          onClick={onNext}
          className="px-6 py-2.5 rounded-2xl text-white text-sm font-extrabold shadow"
          style={{ background: "linear-gradient(135deg,#f97316,#fb923c)" }}
        >
          Suivant →
        </button>
      )}
    </div>
  );
}

// ============================================================
// FORMULAIRE CHARGES
// ============================================================
function ChargesSection({
  title,
  charges,
  onChange,
  onAdd,
  onRemove,
}: {
  title: string;
  charges: ChargeItem[];
  onChange: (
    id: string,
    field: keyof ChargeItem,
    value: string | number | boolean
  ) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div>
      <p
        className="text-xs font-extrabold uppercase tracking-wide mb-3"
        style={{ color: "#94a3b8" }}
      >
        {title}
      </p>

      <div className="space-y-2">
        {charges.map(c => (
          <div
            key={c.id}
            className="flex items-center gap-2 p-3 rounded-2xl"
            style={{ backgroundColor: c.selected ? "#fff7ed" : "#f8fafc" }}
          >
            <input
              type="checkbox"
              checked={!!c.selected}
              onChange={e => onChange(c.id, "selected", e.target.checked)}
              className="w-4 h-4 accent-orange-500 flex-shrink-0"
            />

            <span className="text-sm font-semibold flex-1" style={{ color: "#1e293b" }}>
              {c.libelle}
            </span>

            {c.selected && (
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={c.montantAnnuel}
                  onChange={e =>
                    onChange(c.id, "montantAnnuel", Number(e.target.value))
                  }
                  placeholder="Montant/an"
                  className="w-28 px-2 py-1 rounded-xl text-xs border"
                  style={{ borderColor: "#e2e8f0" }}
                />
                <span className="text-xs" style={{ color: "#94a3b8" }}>
                  €/an
                </span>
              </div>
            )}

            {c.id.startsWith("custom") && (
              <button
                onClick={() => onRemove(c.id)}
                className="text-red-400 hover:text-red-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={onAdd}
        className="mt-3 flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl border-2 border-dashed transition hover:border-orange-300"
        style={{ borderColor: "#e2e8f0", color: "#f97316" }}
      >
        + Ajouter une charge
      </button>
    </div>
  );
}
// ============================================================
// WIZARD BIEN INDIVIDUEL
// ============================================================
const stepsBienIndividuel = [
    "Propriétaire",
    "Identification",
    "Adresse",
    "Caractéristiques",
    "Finances",
    "Documents",
    "Récap",
  ];
  
  function WizardBienIndividuel({
    onSave,
    onRetour,
  }: {
    onSave: (b: BienIndividuel) => void;
    onRetour: () => void;
  }) {
    const [step, setStep] = useState(0);
  
    const [proprietaireId, setProprietaireId] = useState("");
    const [nom, setNom] = useState("");
    const [type, setType] = useState<TypeBien>("appartement");
  
    const [numeroVoie, setNumeroVoie] = useState("");
    const [typeVoie, setTypeVoie] = useState("Rue");
    const [nomVoie, setNomVoie] = useState("");
    const [complement, setComplement] = useState("");
    const [codePostal, setCodePostal] = useState("");
    const [ville, setVille] = useState("");
    const [departement, setDepartement] = useState("");
    const [region, setRegion] = useState("");
    const [pays, setPays] = useState("France");
  
    const [surface, setSurface] = useState<number>(0);
    const [surfaceSol, setSurfaceSol] = useState<number>(0);
    const [nbPieces, setNbPieces] = useState<number>(1);
    const [nbChambres, setNbChambres] = useState<number>(1);
    const [nbSDB, setNbSDB] = useState<number>(1);
    const [nbWC, setNbWC] = useState<number>(1);
  
    const [equipements, setEquipements] = useState<string[]>([]);
  
    const [loyer, setLoyer] = useState<number>(0);
    const [regimeCharges, setRegimeCharges] = useState<RegimeCharges>("provision");
    const [charges, setCharges] = useState<number>(0);
  
    const [chargesRecup, setChargesRecup] = useState<ChargeItem[]>(
      cloneCharges(chargesRecupDefaut)
    );
    const [chargesNonRecup, setChargesNonRecup] = useState<ChargeItem[]>(
      cloneCharges(chargesNonRecupDefaut)
    );
  
    const [classeEnergie, setClasseEnergie] = useState<ClasseEnergie>("D");
    const [classeClimat, setClasseClimat] = useState<ClasseEnergie>("D");
    const [consoEnergie, setConsoEnergie] = useState<number>(0);
    const [dateDPE, setDateDPE] = useState("");
  
    const [nomCopro, setNomCopro] = useState("");
    const [syndic, setSyndic] = useState("");
    const [numLot, setNumLot] = useState("");
  
    const equipListe = [
      "Cuisine équipée",
      "Balcon",
      "Terrasse",
      "Jardin",
      "Cave",
      "Garage",
      "Parking",
      "Ascenseur",
      "Climatisation",
      "Fibre",
      "Meublé",
    ];
  
    const toggleEquip = (equipement: string) => {
      setEquipements(prev =>
        prev.includes(equipement)
          ? prev.filter(item => item !== equipement)
          : [...prev, equipement]
      );
    };
  
    const handleChargeChange = (
      setter: React.Dispatch<React.SetStateAction<ChargeItem[]>>,
      id: string,
      field: keyof ChargeItem,
      value: string | number | boolean
    ) => {
      setter(prev =>
        prev.map(charge =>
          charge.id === id ? { ...charge, [field]: value } : charge
        )
      );
    };
  
    const addCharge = (
      setter: React.Dispatch<React.SetStateAction<ChargeItem[]>>,
      prefix: string
    ) => {
      setter(prev => [
        ...prev,
        {
          id: `custom-${prefix}-${Date.now()}`,
          libelle: "Nouvelle charge",
          montantAnnuel: 0,
          selected: true,
        },
      ]);
    };
  
    const removeCharge = (
      setter: React.Dispatch<React.SetStateAction<ChargeItem[]>>,
      id: string
    ) => {
      setter(prev => prev.filter(charge => charge.id !== id));
    };
  
    const handleSave = () => {
      const reference = `BI-${String(Date.now()).slice(-6)}`;
  
      const bien: BienIndividuel = {
        id: `bi-${Date.now()}`,
        typeActif: "bien_individuel",
        reference,
        nom,
        proprietaireId,
  
        type,
  
        numeroVoie,
        typeVoie,
        nomVoie,
        complementAdresse: complement,
        codePostal,
        ville,
        departement,
        region,
        pays,
  
        surface,
        surfaceSol,
        nbPieces,
        nbChambres,
        nbSDB,
        nbWC,
  
        equipements,
  
        loyer,
        regimeCharges,
        charges,
  
        chargesRecup: chargesRecup.filter(charge => charge.selected),
        chargesNonRecup: chargesNonRecup.filter(charge => charge.selected),
  
        classeEnergie,
        classeClimat,
        consoEnergie,
        dateDPE,
  
        nomCopropriete: nomCopro,
        syndic,
        numeroLot: numLot,
  
        statut: "vacant",
  
        documents: [],
        historique: [],
      };
  
      onSave(bien);
    };
  
    const renderStep = () => {
      switch (step) {
        case 0:
          return (
            <SectionCard>
              <SectionTitle emoji="👤" title="Propriétaire" />
              <FormSelect
                label="Sélectionner le propriétaire"
                value={proprietaireId}
                onChange={setProprietaireId}
                required
                options={mockProprietaires.map(proprietaire => ({
                  value: proprietaire.id,
                  label: `${proprietaire.prenom} ${proprietaire.nom}`,
                }))}
              />
  
              {proprietaireId && (
                <div
                  className="mt-3 p-3 rounded-2xl"
                  style={{ backgroundColor: "#f0fdf4" }}
                >
                  <p className="text-xs font-bold" style={{ color: "#166534" }}>
                    ✅{" "}
                    {
                      mockProprietaires.find(
                        proprietaire => proprietaire.id === proprietaireId
                      )?.email
                    }
                  </p>
                </div>
              )}
            </SectionCard>
          );
  
        case 1:
          return (
            <SectionCard>
              <SectionTitle emoji="🏠" title="Identification du bien individuel" />
              <div className="space-y-4">
                <FormInput label="Référence automatique" value="BI-AUTO" readOnly />
  
                <FormInput
                  label="Nom du bien individuel"
                  value={nom}
                  onChange={setNom}
                  required
                  placeholder="Ex : Appartement T2 Centre-ville"
                />
  
                <FormSelect
                  label="Type de bien"
                  value={type}
                  onChange={value => setType(value as TypeBien)}
                  required
                  options={[
                    { value: "appartement", label: "Appartement" },
                    { value: "maison", label: "Maison" },
                    { value: "studio", label: "Studio" },
                    { value: "garage", label: "Garage" },
                    { value: "parking", label: "Parking" },
                    { value: "cave", label: "Cave" },
                    { value: "box", label: "Box" },
                  ]}
                />
  
                <div
                  className="p-3 rounded-2xl"
                  style={{ backgroundColor: "#eff6ff" }}
                >
                  <p className="text-xs font-bold" style={{ color: "#1d4ed8" }}>
                    Ce parcours crée un bien autonome. Il pourra recevoir directement
                    un bail, un contrat de location et un locataire.
                  </p>
                </div>
              </div>
            </SectionCard>
          );
  
        case 2:
          return (
            <SectionCard>
              <SectionTitle emoji="📍" title="Adresse du bien individuel" />
              <div className="grid sm:grid-cols-2 gap-4">
                <FormInput
                  label="Numéro de voie"
                  value={numeroVoie}
                  onChange={setNumeroVoie}
                  required
                  placeholder="12"
                />
  
                <FormSelect
                  label="Type de voie"
                  value={typeVoie}
                  onChange={setTypeVoie}
                  required
                  options={[
                    "Rue",
                    "Avenue",
                    "Boulevard",
                    "Allée",
                    "Impasse",
                    "Chemin",
                    "Route",
                    "Place",
                    "Quai",
                    "Résidence",
                    "Autre",
                  ].map(value => ({ value, label: value }))}
                />
  
                <div className="sm:col-span-2">
                  <FormInput
                    label="Nom de la voie"
                    value={nomVoie}
                    onChange={setNomVoie}
                    required
                    placeholder="Victor Hugo"
                  />
                </div>
  
                <div className="sm:col-span-2">
                  <FormInput
                    label="Complément d'adresse"
                    value={complement}
                    onChange={setComplement}
                    placeholder="Bâtiment A, appartement 12..."
                  />
                </div>
  
                <FormInput
                  label="Code postal"
                  value={codePostal}
                  onChange={setCodePostal}
                  required
                  placeholder="69001"
                />
  
                <FormInput
                  label="Ville"
                  value={ville}
                  onChange={setVille}
                  required
                  placeholder="Lyon"
                />
  
                <FormInput
                  label="Département"
                  value={departement}
                  onChange={setDepartement}
                  placeholder="Rhône"
                />
  
                <FormInput
                  label="Région"
                  value={region}
                  onChange={setRegion}
                  placeholder="Auvergne-Rhône-Alpes"
                />
  
                <FormSelect
                  label="Pays"
                  value={pays}
                  onChange={setPays}
                  required
                  options={[
                    { value: "France", label: "France" },
                    { value: "Belgique", label: "Belgique" },
                    { value: "Suisse", label: "Suisse" },
                  ]}
                />
              </div>
            </SectionCard>
          );
  
        case 3:
          return (
            <div className="space-y-4">
              <SectionCard>
                <SectionTitle emoji="📐" title="Surfaces & pièces" />
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <FormInput
                    label="Surface habitable (m²)"
                    value={surface}
                    onChange={value => setSurface(Number(value))}
                    type="number"
                    required
                  />
  
                  <FormInput
                    label="Surface au sol (m²)"
                    value={surfaceSol}
                    onChange={value => setSurfaceSol(Number(value))}
                    type="number"
                  />
  
                  <FormInput
                    label="Nombre de pièces"
                    value={nbPieces}
                    onChange={value => setNbPieces(Number(value))}
                    type="number"
                    required
                  />
  
                  <FormInput
                    label="Chambres"
                    value={nbChambres}
                    onChange={value => setNbChambres(Number(value))}
                    type="number"
                  />
  
                  <FormInput
                    label="Salles de bains"
                    value={nbSDB}
                    onChange={value => setNbSDB(Number(value))}
                    type="number"
                  />
  
                  <FormInput
                    label="WC"
                    value={nbWC}
                    onChange={value => setNbWC(Number(value))}
                    type="number"
                  />
                </div>
              </SectionCard>
  
              <SectionCard>
                <SectionTitle emoji="✅" title="Équipements du bien" />
                <div className="flex flex-wrap gap-2">
                  {equipListe.map(equipement => (
                    <button
                      key={equipement}
                      onClick={() => toggleEquip(equipement)}
                      className="px-3 py-1.5 rounded-2xl text-xs font-bold border-2 transition"
                      style={{
                        borderColor: equipements.includes(equipement)
                          ? "#f97316"
                          : "#e2e8f0",
                        backgroundColor: equipements.includes(equipement)
                          ? "#fff7ed"
                          : "#f8fafc",
                        color: equipements.includes(equipement)
                          ? "#f97316"
                          : "#64748b",
                      }}
                    >
                      {equipement}
                    </button>
                  ))}
                </div>
              </SectionCard>
  
              <SectionCard>
                <SectionTitle emoji="🌿" title="Informations énergétiques" />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <FormSelect
                    label="Classe énergie"
                    value={classeEnergie}
                    onChange={value => setClasseEnergie(value as ClasseEnergie)}
                    options={["A", "B", "C", "D", "E", "F", "G"].map(value => ({
                      value,
                      label: value,
                    }))}
                  />
  
                  <FormSelect
                    label="Classe climat"
                    value={classeClimat}
                    onChange={value => setClasseClimat(value as ClasseEnergie)}
                    options={["A", "B", "C", "D", "E", "F", "G"].map(value => ({
                      value,
                      label: value,
                    }))}
                  />
  
                  <FormInput
                    label="Conso. énergie"
                    value={consoEnergie}
                    onChange={value => setConsoEnergie(Number(value))}
                    type="number"
                  />
  
                  <FormInput
                    label="Date du DPE"
                    value={dateDPE}
                    onChange={setDateDPE}
                    type="date"
                  />
                </div>
              </SectionCard>
  
              <SectionCard>
                <SectionTitle emoji="🏢" title="Copropriété éventuelle" />
                <div
                  className="p-3 rounded-2xl mb-4"
                  style={{ backgroundColor: "#f8fafc" }}
                >
                  <p className="text-xs font-bold" style={{ color: "#64748b" }}>
                    Ces informations concernent uniquement un bien individuel situé
                    dans une copropriété. Elles ne créent pas un immeuble de rapport
                    et ne déclenchent aucune gestion de tantièmes.
                  </p>
                </div>
  
                <div className="grid sm:grid-cols-3 gap-4">
                  <FormInput
                    label="Nom de la copropriété"
                    value={nomCopro}
                    onChange={setNomCopro}
                  />
  
                  <FormInput
                    label="Syndic"
                    value={syndic}
                    onChange={setSyndic}
                  />
  
                  <FormInput
                    label="N° de lot copropriété"
                    value={numLot}
                    onChange={setNumLot}
                  />
                </div>
              </SectionCard>
            </div>
          );
  
        case 4:
          return (
            <div className="space-y-4">
              <SectionCard>
                <SectionTitle emoji="💶" title="Informations financières du bien" />
                <div className="grid sm:grid-cols-2 gap-4">
                  <FormInput
                    label="Loyer hors charges (€)"
                    value={loyer}
                    onChange={value => setLoyer(Number(value))}
                    type="number"
                    required
                  />
  
                  <FormSelect
                    label="Régime des charges"
                    value={regimeCharges}
                    onChange={value => setRegimeCharges(value as RegimeCharges)}
                    options={[
                      {
                        value: "provision",
                        label: "Provision avec régularisation annuelle",
                      },
                      {
                        value: "forfait",
                        label: "Forfait de charges",
                      },
                    ]}
                  />
  
                  <FormInput
                    label="Charges mensuelles (€)"
                    value={charges}
                    onChange={value => setCharges(Number(value))}
                    type="number"
                    required
                  />
  
                  <div
                    className="p-3 rounded-2xl"
                    style={{ backgroundColor: "#fff7ed" }}
                  >
                    <p className="text-xs font-bold" style={{ color: "#94a3b8" }}>
                      Total mensuel
                    </p>
                    <p className="text-lg font-extrabold" style={{ color: "#f97316" }}>
                      {loyer + charges} €
                    </p>
                  </div>
                </div>
              </SectionCard>
  
              <SectionCard>
                <ChargesSection
                  title="💧 Charges récupérables directement liées au bien"
                  charges={chargesRecup}
                  onChange={(id, field, value) =>
                    handleChargeChange(setChargesRecup, id, field, value)
                  }
                  onAdd={() => addCharge(setChargesRecup, "cr-bi")}
                  onRemove={id => removeCharge(setChargesRecup, id)}
                />
              </SectionCard>
  
              <SectionCard>
                <ChargesSection
                  title="🏦 Charges non récupérables directement liées au bien"
                  charges={chargesNonRecup}
                  onChange={(id, field, value) =>
                    handleChargeChange(setChargesNonRecup, id, field, value)
                  }
                  onAdd={() => addCharge(setChargesNonRecup, "cnr-bi")}
                  onRemove={id => removeCharge(setChargesNonRecup, id)}
                />
              </SectionCard>
            </div>
          );
  
        case 5:
          return (
            <SectionCard>
              <SectionTitle emoji="📎" title="Documents du bien individuel" />
  
              {[
                "DPE",
                "ERP",
                "Diagnostic gaz",
                "Diagnostic électricité",
                "CREP",
                "Inventaire mobilier",
                "Règlement de copropriété",
              ].map(document => (
                <div
                  key={document}
                  className="flex items-center justify-between p-3 rounded-2xl mb-2"
                  style={{ backgroundColor: "#f8fafc" }}
                >
                  <span className="text-sm font-semibold" style={{ color: "#1e293b" }}>
                    📄 {document}
                  </span>
  
                  <label
                    className="px-3 py-1 rounded-xl text-xs font-bold cursor-pointer"
                    style={{ backgroundColor: "#fff7ed", color: "#f97316" }}
                  >
                    + Ajouter
                    <input type="file" className="hidden" />
                  </label>
                </div>
              ))}
  
              <p
                className="text-xs font-bold mt-4 mb-2"
                style={{ color: "#94a3b8" }}
              >
                Documents complémentaires
              </p>
  
              {[
                "Assurance PNO",
                "Taxe foncière",
                "Contrats d'entretien",
                "Plans",
                "Photos",
              ].map(document => (
                <div
                  key={document}
                  className="flex items-center justify-between p-3 rounded-2xl mb-2"
                  style={{ backgroundColor: "#f8fafc" }}
                >
                  <span className="text-sm font-semibold" style={{ color: "#1e293b" }}>
                    📄 {document}
                  </span>
  
                  <label
                    className="px-3 py-1 rounded-xl text-xs font-bold cursor-pointer"
                    style={{ backgroundColor: "#eff6ff", color: "#3b82f6" }}
                  >
                    + Ajouter
                    <input type="file" className="hidden" />
                  </label>
                </div>
              ))}
            </SectionCard>
          );
  
        case 6:
          return (
            <div className="space-y-4">
              <div
                className="p-4 rounded-3xl text-center"
                style={{ background: "linear-gradient(135deg,#fff7ed,#fff)" }}
              >
                <div className="text-4xl mb-2">🏠</div>
                <h2 className="text-lg font-extrabold" style={{ color: "#1e293b" }}>
                  {nom || "—"}
                </h2>
                <p className="text-sm" style={{ color: "#94a3b8" }}>
                  {numeroVoie} {typeVoie} {nomVoie}, {codePostal} {ville}
                </p>
              </div>
  
              <SectionCard>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <InfoRow label="Parcours" value="Bien individuel autonome" />
                  <InfoRow label="Type" value={type} />
                  <InfoRow label="Surface" value={`${surface} m²`} />
                  <InfoRow label="Pièces" value={nbPieces} />
                  <InfoRow label="Loyer HC" value={`${loyer} €`} />
                  <InfoRow label="Charges" value={`${charges} €`} />
                  <InfoRow label="Total" value={`${loyer + charges} €/mois`} />
                  <InfoRow label="DPE" value={`Classe ${classeEnergie}`} />
                  <InfoRow
                    label="Propriétaire"
                    value={
                      mockProprietaires.find(
                        proprietaire => proprietaire.id === proprietaireId
                      )?.nom || "—"
                    }
                  />
                  <InfoRow label="Statut initial" value="Vacant" />
                </div>
              </SectionCard>
  
              <SectionCard>
                <SectionTitle emoji="🔒" title="Règle métier appliquée" />
                <p className="text-sm font-semibold" style={{ color: "#334155" }}>
                  Ce bien est autonome : il pourra recevoir directement un bail, un
                  contrat de location et un locataire. Il ne possède pas de gestion
                  de tantièmes.
                </p>
              </SectionCard>
            </div>
          );
  
        default:
          return null;
      }
    };
  
    return (
      <div
        className="min-h-screen"
        style={{
          backgroundColor: "#f8fafc",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <div
          className="px-4 sm:px-6 py-5"
          style={{ background: "linear-gradient(135deg,#fff7ed,#fff)" }}
        >
          <div className="max-w-3xl mx-auto">
            <div
              className="flex items-center gap-2 text-xs font-bold mb-3"
              style={{ color: "#94a3b8" }}
            >
              <button
                onClick={onRetour}
                className="hover:underline"
                style={{ color: "#f97316" }}
              >
                ← Mes biens
              </button>
              <span>›</span>
              <span style={{ color: "#1e293b" }}>Nouveau bien individuel</span>
            </div>
  
            <h1 className="text-lg font-black" style={{ color: "#1e293b" }}>
              🏠 Nouveau bien individuel
            </h1>
  
            <p className="text-sm mt-1 font-semibold" style={{ color: "#64748b" }}>
              Création d’un bien autonome directement louable.
            </p>
          </div>
        </div>
  
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
          <StepIndicator steps={stepsBienIndividuel} current={step} />
  
          {renderStep()}
  
          <NavButtons
            onPrev={() => setStep(currentStep => Math.max(0, currentStep - 1))}
            onNext={() =>
              setStep(currentStep =>
                Math.min(stepsBienIndividuel.length - 1, currentStep + 1)
              )
            }
            onSave={handleSave}
            isFirst={step === 0}
            isLast={step === stepsBienIndividuel.length - 1}
            saveLabel="Enregistrer le bien individuel"
          />
        </div>
      </div>
    );
  }

// ============================================================
// WIZARD IMMEUBLE DE RAPPORT
// ============================================================
const stepsImmeubleRapport = [
    "Propriétaire",
    "Identification",
    "Adresse",
    "Détails",
    "Charges immeuble",
    "Documents",
    "Lots locatifs",
    "Récap",
  ];
  
  function WizardImmeubleRapport({
    onSave,
    onRetour,
  }: {
    onSave: (im: ImmeubleRapport) => void;
    onRetour: () => void;
  }) {
    const [step, setStep] = useState(0);
  
    const [proprietaireId, setProprietaireId] = useState("");
    const [nom, setNom] = useState("");
  
    const [numeroVoie, setNumeroVoie] = useState("");
    const [typeVoie, setTypeVoie] = useState("Rue");
    const [nomVoie, setNomVoie] = useState("");
    const [complement, setComplement] = useState("");
    const [codePostal, setCodePostal] = useState("");
    const [ville, setVille] = useState("");
    const [departement, setDepartement] = useState("");
    const [region, setRegion] = useState("");
    const [pays, setPays] = useState("France");
  
    const [nbEtages, setNbEtages] = useState<number>(1);
    const [nbLotsTotal, setNbLotsTotal] = useState<number>(1);
    const [surfaceTotale, setSurfaceTotale] = useState<number>(0);
    const [commentaires, setCommentaires] = useState("");
  
    const [totalTantiemes, setTotalTantiemes] = useState<number>(1000);
  
    const [chargesImmeubleRecup, setChargesImmeubleRecup] = useState<ChargeItem[]>(
      cloneCharges(chargesRecupDefaut)
    );
    const [chargesImmeubleNonRecup, setChargesImmeubleNonRecup] = useState<
      ChargeItem[]
    >(cloneCharges(chargesNonRecupDefaut));
  
    const [lots, setLots] = useState<LotImmeuble[]>([]);
    const [showLotForm, setShowLotForm] = useState(false);
  
    const tantiemesUtilises = lots.reduce(
      (total, lot) => total + lot.quotePartTantiemes,
      0
    );
    const tantiemesRestants = totalTantiemes - tantiemesUtilises;
  
    const handleChargeChange = (
      setter: React.Dispatch<React.SetStateAction<ChargeItem[]>>,
      id: string,
      field: keyof ChargeItem,
      value: string | number | boolean
    ) => {
      setter(prev =>
        prev.map(charge =>
          charge.id === id ? { ...charge, [field]: value } : charge
        )
      );
    };
  
    const addCharge = (
      setter: React.Dispatch<React.SetStateAction<ChargeItem[]>>,
      prefix: string
    ) => {
      setter(prev => [
        ...prev,
        {
          id: `custom-${prefix}-${Date.now()}`,
          libelle: "Nouvelle charge",
          montantAnnuel: 0,
          selected: true,
        },
      ]);
    };
  
    const removeCharge = (
      setter: React.Dispatch<React.SetStateAction<ChargeItem[]>>,
      id: string
    ) => {
      setter(prev => prev.filter(charge => charge.id !== id));
    };
  
    const handleSave = () => {
      const immeubleId = `im-${Date.now()}`;
  
      const immeuble: ImmeubleRapport = {
        id: immeubleId,
        typeActif: "immeuble_rapport",
        reference: `IMR-${String(Date.now()).slice(-6)}`,
        nom,
        proprietaireId,
  
        numeroVoie,
        typeVoie,
        nomVoie,
        complementAdresse: complement,
        codePostal,
        ville,
        departement,
        region,
        pays,
  
        nbEtages,
        nbLotsTotal,
        surfaceTotale,
        commentaires,
  
        totalTantiemes,
  
        chargesImmeubleRecup: chargesImmeubleRecup.filter(charge => charge.selected),
        chargesImmeubleNonRecup: chargesImmeubleNonRecup.filter(
          charge => charge.selected
        ),
  
        documents: [],
        lots: lots.map(lot => ({
          ...lot,
          immeubleId,
        })),
        historique: [],
      };
  
      onSave(immeuble);
    };
  
    const renderStep = () => {
      switch (step) {
        case 0:
          return (
            <SectionCard>
              <SectionTitle emoji="👤" title="Propriétaire" />
  
              <FormSelect
                label="Sélectionner le propriétaire"
                value={proprietaireId}
                onChange={setProprietaireId}
                required
                options={mockProprietaires.map(proprietaire => ({
                  value: proprietaire.id,
                  label: `${proprietaire.prenom} ${proprietaire.nom}`,
                }))}
              />
  
              {proprietaireId && (
                <div
                  className="mt-3 p-3 rounded-2xl"
                  style={{ backgroundColor: "#f0fdf4" }}
                >
                  <p className="text-xs font-bold" style={{ color: "#166534" }}>
                    ✅{" "}
                    {
                      mockProprietaires.find(
                        proprietaire => proprietaire.id === proprietaireId
                      )?.email
                    }
                  </p>
                </div>
              )}
            </SectionCard>
          );
  
        case 1:
          return (
            <SectionCard>
              <SectionTitle emoji="🏢" title="Identification de l'immeuble de rapport" />
  
              <div className="space-y-4">
                <FormInput label="Référence automatique" value="IMR-AUTO" readOnly />
  
                <FormInput
                  label="Nom de l'immeuble"
                  value={nom}
                  onChange={setNom}
                  required
                  placeholder="Ex : Immeuble Les Lilas"
                />
  
                <div
                  className="p-3 rounded-2xl"
                  style={{ backgroundColor: "#eff6ff" }}
                >
                  <p className="text-xs font-bold" style={{ color: "#1d4ed8" }}>
                    Ce parcours crée un immeuble parent. L’immeuble ne peut pas
                    recevoir directement un bail, un contrat de location ou un
                    locataire. Seuls ses lots locatifs sont louables.
                  </p>
                </div>
              </div>
            </SectionCard>
          );
  
        case 2:
          return (
            <SectionCard>
              <SectionTitle emoji="📍" title="Adresse de l'immeuble" />
  
              <div className="grid sm:grid-cols-2 gap-4">
                <FormInput
                  label="Numéro de voie"
                  value={numeroVoie}
                  onChange={setNumeroVoie}
                  required
                  placeholder="8"
                />
  
                <FormSelect
                  label="Type de voie"
                  value={typeVoie}
                  onChange={setTypeVoie}
                  required
                  options={[
                    "Rue",
                    "Avenue",
                    "Boulevard",
                    "Allée",
                    "Impasse",
                    "Chemin",
                    "Route",
                    "Place",
                    "Quai",
                    "Résidence",
                    "Autre",
                  ].map(value => ({ value, label: value }))}
                />
  
                <div className="sm:col-span-2">
                  <FormInput
                    label="Nom de la voie"
                    value={nomVoie}
                    onChange={setNomVoie}
                    required
                    placeholder="Jean Jaurès"
                  />
                </div>
  
                <div className="sm:col-span-2">
                  <FormInput
                    label="Complément d'adresse"
                    value={complement}
                    onChange={setComplement}
                    placeholder="Bâtiment, entrée, résidence..."
                  />
                </div>
  
                <FormInput
                  label="Code postal"
                  value={codePostal}
                  onChange={setCodePostal}
                  required
                  placeholder="69007"
                />
  
                <FormInput
                  label="Ville"
                  value={ville}
                  onChange={setVille}
                  required
                  placeholder="Lyon"
                />
  
                <FormInput
                  label="Département"
                  value={departement}
                  onChange={setDepartement}
                  placeholder="Rhône"
                />
  
                <FormInput
                  label="Région"
                  value={region}
                  onChange={setRegion}
                  placeholder="Auvergne-Rhône-Alpes"
                />
  
                <FormSelect
                  label="Pays"
                  value={pays}
                  onChange={setPays}
                  required
                  options={[
                    { value: "France", label: "France" },
                    { value: "Belgique", label: "Belgique" },
                    { value: "Suisse", label: "Suisse" },
                  ]}
                />
              </div>
            </SectionCard>
          );
  
        case 3:
          return (
            <SectionCard>
              <SectionTitle emoji="📋" title="Détails de l'immeuble" />
  
              <div className="grid sm:grid-cols-2 gap-4">
                <FormInput
                  label="Nombre d'étages"
                  value={nbEtages}
                  onChange={value => setNbEtages(Number(value))}
                  type="number"
                  required
                />
  
                <FormInput
                  label="Nombre total de lots prévus"
                  value={nbLotsTotal}
                  onChange={value => setNbLotsTotal(Number(value))}
                  type="number"
                  required
                />
  
                <FormInput
                  label="Surface totale de l'immeuble (m²)"
                  value={surfaceTotale}
                  onChange={value => setSurfaceTotale(Number(value))}
                  type="number"
                  required
                />
  
                <FormSelect
                  label="Total des tantièmes de l'immeuble"
                  value={String(totalTantiemes)}
                  onChange={value => setTotalTantiemes(Number(value))}
                  required
                  options={[10, 100, 1000, 10000, 100000].map(nombre => ({
                    value: String(nombre),
                    label: String(nombre),
                  }))}
                />
  
                <div className="sm:col-span-2">
                  <label
                    className="block text-xs font-bold mb-1"
                    style={{ color: "#64748b" }}
                  >
                    Commentaires
                  </label>
  
                  <textarea
                    value={commentaires}
                    onChange={event => setCommentaires(event.target.value)}
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-2xl text-sm border outline-none"
                    style={{ borderColor: "#e2e8f0" }}
                    placeholder="Informations complémentaires sur l'immeuble..."
                  />
                </div>
              </div>
            </SectionCard>
          );
  
        case 4:
          return (
            <div className="space-y-4">
              <SectionCard>
                <SectionTitle emoji="💶" title="Charges de l'immeuble parent" />
  
                <div
                  className="p-3 rounded-2xl"
                  style={{ backgroundColor: "#f8fafc" }}
                >
                  <p className="text-xs font-bold" style={{ color: "#64748b" }}>
                    Ces charges sont portées par l’immeuble. Leur répartition pourra
                    être calculée selon la quote-part de tantièmes de chaque lot.
                    Elles ne rendent pas l’immeuble directement louable.
                  </p>
                </div>
              </SectionCard>
  
              <SectionCard>
                <ChargesSection
                  title="💧 Charges récupérables de l'immeuble"
                  charges={chargesImmeubleRecup}
                  onChange={(id, field, value) =>
                    handleChargeChange(setChargesImmeubleRecup, id, field, value)
                  }
                  onAdd={() => addCharge(setChargesImmeubleRecup, "cr-imr")}
                  onRemove={id => removeCharge(setChargesImmeubleRecup, id)}
                />
              </SectionCard>
  
              <SectionCard>
                <ChargesSection
                  title="🏦 Charges non récupérables de l'immeuble"
                  charges={chargesImmeubleNonRecup}
                  onChange={(id, field, value) =>
                    handleChargeChange(setChargesImmeubleNonRecup, id, field, value)
                  }
                  onAdd={() => addCharge(setChargesImmeubleNonRecup, "cnr-imr")}
                  onRemove={id => removeCharge(setChargesImmeubleNonRecup, id)}
                />
              </SectionCard>
            </div>
          );
  
        case 5:
          return (
            <SectionCard>
              <SectionTitle emoji="📎" title="Documents de l'immeuble" />
  
              {[
                "Taxe foncière",
                "Assurance immeuble",
                "Contrats d'entretien",
                "Factures fournisseurs",
                "Plans",
                "Photos",
              ].map(document => (
                <div
                  key={document}
                  className="flex items-center justify-between p-3 rounded-2xl mb-2"
                  style={{ backgroundColor: "#f8fafc" }}
                >
                  <span className="text-sm font-semibold" style={{ color: "#1e293b" }}>
                    📄 {document}
                  </span>
  
                  <label
                    className="px-3 py-1 rounded-xl text-xs font-bold cursor-pointer"
                    style={{ backgroundColor: "#fff7ed", color: "#f97316" }}
                  >
                    + Ajouter
                    <input type="file" className="hidden" />
                  </label>
                </div>
              ))}
            </SectionCard>
          );
  
        case 6:
          return (
            <div className="space-y-4">
              <SectionCard>
                <SectionTitle emoji="⚖️" title="Gestion des tantièmes" />
  
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold" style={{ color: "#64748b" }}>
                    Utilisés : {tantiemesUtilises} / {totalTantiemes}
                  </span>
  
                  <span
                    className={`text-xs font-extrabold ${
                      tantiemesRestants < 0
                        ? "text-red-500"
                        : tantiemesRestants === 0
                          ? "text-green-600"
                          : "text-orange-500"
                    }`}
                  >
                    Restants : {tantiemesRestants}
                  </span>
                </div>
  
                <div
                  className="w-full h-3 rounded-full overflow-hidden"
                  style={{ backgroundColor: "#e2e8f0" }}
                >
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(
                        (tantiemesUtilises / totalTantiemes) * 100,
                        100
                      )}%`,
                      backgroundColor:
                        tantiemesRestants < 0
                          ? "#ef4444"
                          : tantiemesUtilises === totalTantiemes
                            ? "#22c55e"
                            : "#f97316",
                    }}
                  />
                </div>
              </SectionCard>
  
              <div className="space-y-3">
                {lots.map(lot => (
                  <div
                    key={lot.id}
                    className="bg-white rounded-3xl p-4 shadow-sm flex items-center justify-between gap-3"
                  >
                    <div>
                      <p
                        className="font-extrabold text-sm"
                        style={{ color: "#1e293b" }}
                      >
                        {lot.nom}
                      </p>
  
                      <p className="text-xs" style={{ color: "#94a3b8" }}>
                        {lot.surface} m² · {lot.quotePartTantiemes}/
                        {totalTantiemes} tantièmes · {lot.loyer} €/mois
                      </p>
                    </div>
  
                    <div className="flex items-center gap-2">
                      <StatutBadge statut={lot.statut} />
  
                      <button
                        onClick={() =>
                          setLots(prev => prev.filter(item => item.id !== lot.id))
                        }
                        className="text-red-400 hover:text-red-600 text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
  
              {showLotForm ? (
                <WizardLotImmeuble
                  immeubleId="pending"
                  totalTantiemes={totalTantiemes}
                  tantiemesRestants={tantiemesRestants}
                  onSave={lot => {
                    setLots(prev => [...prev, lot]);
                    setShowLotForm(false);
                  }}
                  onCancel={() => setShowLotForm(false)}
                />
              ) : (
                <button
                  onClick={() => setShowLotForm(true)}
                  className="w-full py-3 rounded-3xl border-2 border-dashed text-sm font-bold transition hover:border-orange-300"
                  style={{ borderColor: "#e2e8f0", color: "#f97316" }}
                >
                  + Ajouter un lot locatif
                </button>
              )}
            </div>
          );
  
        case 7:
          return (
            <div className="space-y-4">
              <div
                className="p-4 rounded-3xl text-center"
                style={{ background: "linear-gradient(135deg,#fff7ed,#fff)" }}
              >
                <div className="text-4xl mb-2">🏢</div>
  
                <h2 className="text-lg font-extrabold" style={{ color: "#1e293b" }}>
                  {nom || "—"}
                </h2>
  
                <p className="text-sm" style={{ color: "#94a3b8" }}>
                  {numeroVoie} {typeVoie} {nomVoie}, {codePostal} {ville}
                </p>
              </div>
  
              <SectionCard>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <InfoRow label="Parcours" value="Immeuble de rapport" />
                  <InfoRow label="Étages" value={nbEtages} />
                  <InfoRow label="Lots créés" value={lots.length} />
                  <InfoRow label="Lots prévus" value={nbLotsTotal} />
                  <InfoRow label="Surface totale" value={`${surfaceTotale} m²`} />
                  <InfoRow
                    label="Tantièmes"
                    value={`${tantiemesUtilises}/${totalTantiemes}`}
                  />
                  <InfoRow
                    label="Propriétaire"
                    value={
                      mockProprietaires.find(
                        proprietaire => proprietaire.id === proprietaireId
                      )?.nom || "—"
                    }
                  />
                </div>
              </SectionCard>
  
              <SectionCard>
                <SectionTitle emoji="🔒" title="Règle métier appliquée" />
                <p className="text-sm font-semibold" style={{ color: "#334155" }}>
                  L’immeuble est une structure parent : il ne recevra jamais
                  directement de bail, de contrat de location ou de locataire. Les
                  baux, contrats et locataires seront rattachés uniquement aux lots
                  locatifs.
                </p>
              </SectionCard>
  
              {tantiemesRestants !== 0 && (
                <div
                  className="p-3 rounded-2xl"
                  style={{
                    backgroundColor: "#fef9c3",
                    border: "1px solid #fde68a",
                  }}
                >
                  <p className="text-xs font-bold" style={{ color: "#854d0e" }}>
                    ⚠️ Attention :{" "}
                    {tantiemesRestants > 0
                      ? `Il reste ${tantiemesRestants} tantièmes non attribués.`
                      : `Dépassement de ${Math.abs(
                          tantiemesRestants
                        )} tantièmes.`}
                  </p>
                </div>
              )}
            </div>
          );
  
        default:
          return null;
      }
    };
  
    return (
      <div
        className="min-h-screen"
        style={{
          backgroundColor: "#f8fafc",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <div
          className="px-4 sm:px-6 py-5"
          style={{ background: "linear-gradient(135deg,#fff7ed,#fff)" }}
        >
          <div className="max-w-3xl mx-auto">
            <div
              className="flex items-center gap-2 text-xs font-bold mb-3"
              style={{ color: "#94a3b8" }}
            >
              <button
                onClick={onRetour}
                className="hover:underline"
                style={{ color: "#f97316" }}
              >
                ← Mes biens
              </button>
  
              <span>›</span>
              <span style={{ color: "#1e293b" }}>Nouvel immeuble de rapport</span>
            </div>
  
            <h1 className="text-lg font-black" style={{ color: "#1e293b" }}>
              🏢 Nouvel immeuble de rapport
            </h1>
  
            <p className="text-sm mt-1 font-semibold" style={{ color: "#64748b" }}>
              Création d’une structure parent contenant des lots locatifs.
            </p>
          </div>
        </div>
  
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
          <StepIndicator steps={stepsImmeubleRapport} current={step} />
  
          {renderStep()}
  
          <NavButtons
            onPrev={() => setStep(currentStep => Math.max(0, currentStep - 1))}
            onNext={() =>
              setStep(currentStep =>
                Math.min(stepsImmeubleRapport.length - 1, currentStep + 1)
              )
            }
            onSave={handleSave}
            isFirst={step === 0}
            isLast={step === stepsImmeubleRapport.length - 1}
            saveLabel="Enregistrer l'immeuble"
          />
        </div>
      </div>
    );
  }
  
  // ============================================================
  // WIZARD LOT D'IMMEUBLE
  // ============================================================
  function WizardLotImmeuble({
    immeubleId,
    totalTantiemes,
    tantiemesRestants,
    onSave,
    onCancel,
  }: {
    immeubleId: string;
    totalTantiemes: number;
    tantiemesRestants: number;
    onSave: (lot: LotImmeuble) => void;
    onCancel: () => void;
  }) {
    const [nom, setNom] = useState("");
    const [type, setType] = useState<TypeBien>("appartement");
    const [etage, setEtage] = useState("");
    const [complementAdresse, setComplementAdresse] = useState("");
  
    const [surface, setSurface] = useState<number>(0);
    const [surfaceSol, setSurfaceSol] = useState<number>(0);
    const [nbPieces, setNbPieces] = useState<number>(1);
    const [nbChambres, setNbChambres] = useState<number>(1);
    const [nbSDB, setNbSDB] = useState<number>(1);
    const [nbWC, setNbWC] = useState<number>(1);
  
    const [quotePartTantiemes, setQuotePartTantiemes] = useState<number>(0);
  
    const [loyer, setLoyer] = useState<number>(0);
    const [charges, setCharges] = useState<number>(0);
    const [regimeCharges, setRegimeCharges] = useState<RegimeCharges>("provision");
  
    const [equipements, setEquipements] = useState<string[]>([]);
  
    const [chargesRecup, setChargesRecup] = useState<ChargeItem[]>(
      cloneCharges(chargesRecupDefaut)
    );
    const [chargesNonRecup, setChargesNonRecup] = useState<ChargeItem[]>(
      cloneCharges(chargesNonRecupDefaut)
    );
  
    const [classeEnergie, setClasseEnergie] = useState<ClasseEnergie>("D");
    const [classeClimat, setClasseClimat] = useState<ClasseEnergie>("D");
    const [consoEnergie, setConsoEnergie] = useState<number>(0);
    const [dateDPE, setDateDPE] = useState("");
  
    const equipListe = [
      "Cuisine équipée",
      "Balcon",
      "Terrasse",
      "Jardin",
      "Cave",
      "Garage",
      "Parking",
      "Ascenseur",
      "Climatisation",
      "Fibre",
      "Meublé",
    ];
  
    const isDepassement = quotePartTantiemes > tantiemesRestants;
  
    const toggleEquip = (equipement: string) => {
      setEquipements(prev =>
        prev.includes(equipement)
          ? prev.filter(item => item !== equipement)
          : [...prev, equipement]
      );
    };
  
    const handleChargeChange = (
      setter: React.Dispatch<React.SetStateAction<ChargeItem[]>>,
      id: string,
      field: keyof ChargeItem,
      value: string | number | boolean
    ) => {
      setter(prev =>
        prev.map(charge =>
          charge.id === id ? { ...charge, [field]: value } : charge
        )
      );
    };
  
    const addCharge = (
      setter: React.Dispatch<React.SetStateAction<ChargeItem[]>>,
      prefix: string
    ) => {
      setter(prev => [
        ...prev,
        {
          id: `custom-${prefix}-${Date.now()}`,
          libelle: "Nouvelle charge",
          montantAnnuel: 0,
          selected: true,
        },
      ]);
    };
  
    const removeCharge = (
      setter: React.Dispatch<React.SetStateAction<ChargeItem[]>>,
      id: string
    ) => {
      setter(prev => prev.filter(charge => charge.id !== id));
    };
  
    const handleSave = () => {
      const lot: LotImmeuble = {
        id: `lot-${Date.now()}`,
        immeubleId,
        reference: `LOT-${String(Date.now()).slice(-6)}`,
        nom,
        type,
        etage,
        complementAdresse,
  
        surface,
        surfaceSol,
        nbPieces,
        nbChambres,
        nbSDB,
        nbWC,
  
        quotePartTantiemes,
  
        loyer,
        regimeCharges,
        charges,
  
        statut: "vacant",
  
        equipements,
  
        chargesRecup: chargesRecup.filter(charge => charge.selected),
        chargesNonRecup: chargesNonRecup.filter(charge => charge.selected),
  
        classeEnergie,
        classeClimat,
        consoEnergie,
        dateDPE,
  
        documents: [],
        historique: [],
      };
  
      onSave(lot);
    };
  
    return (
      <div
        className="bg-white rounded-3xl p-5 shadow-sm border-2"
        style={{ borderColor: "#f97316" }}
      >
        <p className="text-sm font-extrabold mb-2" style={{ color: "#f97316" }}>
          ➕ Nouveau lot locatif
        </p>
  
        <p className="text-xs font-bold mb-4" style={{ color: "#64748b" }}>
          Ce lot appartient à l’immeuble de rapport. Il est directement louable et
          pourra recevoir un bail, un contrat de location et un locataire.
        </p>
  
        <div className="grid sm:grid-cols-2 gap-4">
          <FormInput
            label="Nom du lot"
            value={nom}
            onChange={setNom}
            required
            placeholder="Appartement 1A"
          />
  
          <FormSelect
            label="Type de lot"
            value={type}
            onChange={value => setType(value as TypeBien)}
            required
            options={[
              { value: "appartement", label: "Appartement" },
              { value: "maison", label: "Maison" },
              { value: "studio", label: "Studio" },
              { value: "garage", label: "Garage" },
              { value: "parking", label: "Parking" },
              { value: "cave", label: "Cave" },
              { value: "box", label: "Box" },
            ]}
          />
  
          <FormInput
            label="Étage"
            value={etage}
            onChange={setEtage}
            placeholder="Ex : 2"
          />
  
          <FormInput
            label="Complément d'adresse du lot"
            value={complementAdresse}
            onChange={setComplementAdresse}
            placeholder="Porte droite, lot 12..."
          />
  
          <FormInput
            label="Surface habitable (m²)"
            value={surface}
            onChange={value => setSurface(Number(value))}
            type="number"
            required
          />
  
          <FormInput
            label="Surface au sol (m²)"
            value={surfaceSol}
            onChange={value => setSurfaceSol(Number(value))}
            type="number"
          />
  
          <FormInput
            label="Nombre de pièces"
            value={nbPieces}
            onChange={value => setNbPieces(Number(value))}
            type="number"
            required
          />
  
          <FormInput
            label="Nombre de chambres"
            value={nbChambres}
            onChange={value => setNbChambres(Number(value))}
            type="number"
          />
  
          <FormInput
            label="Nombre de SDB"
            value={nbSDB}
            onChange={value => setNbSDB(Number(value))}
            type="number"
          />
  
          <FormInput
            label="Nombre de WC"
            value={nbWC}
            onChange={value => setNbWC(Number(value))}
            type="number"
          />
  
          <FormInput
            label="Loyer hors charges (€)"
            value={loyer}
            onChange={value => setLoyer(Number(value))}
            type="number"
            required
          />
  
          <FormSelect
            label="Régime des charges"
            value={regimeCharges}
            onChange={value => setRegimeCharges(value as RegimeCharges)}
            options={[
              {
                value: "provision",
                label: "Provision avec régularisation",
              },
              {
                value: "forfait",
                label: "Forfait de charges",
              },
            ]}
          />
  
          <FormInput
            label="Charges mensuelles du lot (€)"
            value={charges}
            onChange={value => setCharges(Number(value))}
            type="number"
          />
  
          <div>
            <label
              className="block text-xs font-bold mb-1"
              style={{ color: "#64748b" }}
            >
              Quote-part de tantièmes <span style={{ color: "#f97316" }}>*</span>
            </label>
  
            <input
              type="number"
              value={quotePartTantiemes}
              onChange={event => setQuotePartTantiemes(Number(event.target.value))}
              className="w-full px-4 py-2.5 rounded-2xl text-sm border outline-none"
              style={{ borderColor: isDepassement ? "#ef4444" : "#e2e8f0" }}
            />
  
            {quotePartTantiemes > 0 && (
              <p
                className="text-xs mt-1 font-bold"
                style={{ color: isDepassement ? "#ef4444" : "#94a3b8" }}
              >
                {quotePartTantiemes} / {totalTantiemes}
                {isDepassement && " — Dépassement des tantièmes restants"}
              </p>
            )}
          </div>
  
          <FormSelect
            label="Classe énergie"
            value={classeEnergie}
            onChange={value => setClasseEnergie(value as ClasseEnergie)}
            options={["A", "B", "C", "D", "E", "F", "G"].map(classe => ({
              value: classe,
              label: `Classe ${classe}`,
            }))}
          />
  
          <FormSelect
            label="Classe climat"
            value={classeClimat}
            onChange={value => setClasseClimat(value as ClasseEnergie)}
            options={["A", "B", "C", "D", "E", "F", "G"].map(classe => ({
              value: classe,
              label: `Classe ${classe}`,
            }))}
          />
  
          <FormInput
            label="Conso. énergétique"
            value={consoEnergie}
            onChange={value => setConsoEnergie(Number(value))}
            type="number"
          />
  
          <FormInput
            label="Date du DPE"
            value={dateDPE}
            onChange={setDateDPE}
            type="date"
          />
        </div>
  
        <div className="mt-5">
          <SectionTitle emoji="✅" title="Équipements du lot" />
  
          <div className="flex flex-wrap gap-2">
            {equipListe.map(equipement => (
              <button
                key={equipement}
                onClick={() => toggleEquip(equipement)}
                className="px-3 py-1.5 rounded-2xl text-xs font-bold border-2 transition"
                style={{
                  borderColor: equipements.includes(equipement)
                    ? "#f97316"
                    : "#e2e8f0",
                  backgroundColor: equipements.includes(equipement)
                    ? "#fff7ed"
                    : "#f8fafc",
                  color: equipements.includes(equipement) ? "#f97316" : "#64748b",
                }}
              >
                {equipement}
              </button>
            ))}
          </div>
        </div>
  
        <div className="grid sm:grid-cols-2 gap-4 mt-5">
          <ChargesSection
            title="💧 Charges récupérables du lot"
            charges={chargesRecup}
            onChange={(id, field, value) =>
              handleChargeChange(setChargesRecup, id, field, value)
            }
            onAdd={() => addCharge(setChargesRecup, "cr-lot")}
            onRemove={id => removeCharge(setChargesRecup, id)}
          />
  
          <ChargesSection
            title="🏦 Charges non récupérables du lot"
            charges={chargesNonRecup}
            onChange={(id, field, value) =>
              handleChargeChange(setChargesNonRecup, id, field, value)
            }
            onAdd={() => addCharge(setChargesNonRecup, "cnr-lot")}
            onRemove={id => removeCharge(setChargesNonRecup, id)}
          />
        </div>
  
        <div className="flex gap-3 mt-5">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-2xl text-sm font-bold border-2 transition"
            style={{ borderColor: "#e2e8f0", color: "#64748b" }}
          >
            Annuler
          </button>
  
          <button
            onClick={handleSave}
            disabled={isDepassement || !nom || surface <= 0 || quotePartTantiemes <= 0}
            className="flex-1 py-2.5 rounded-2xl text-white text-sm font-extrabold shadow disabled:opacity-50"
            style={{ background: "linear-gradient(135deg,#f97316,#fb923c)" }}
          >
            ✅ Ajouter le lot locatif
          </button>
        </div>
      </div>
    );
  }
    
    // ============================================================
// VUE DÉTAIL ACTIF
// ============================================================
function VueDetailBien({
    actif,
    onBack,
    onEdit,
  }: {
    actif: Actif;
    onBack: () => void;
    onEdit: () => void;
  }) {
    const [onglet, setOnglet] = useState<
      "infos" | "charges" | "documents" | "historique"
    >("infos");
    const [lotOuvert, setLotOuvert] = useState<string | null>(null);
  
    const proprietaire = mockProprietaires.find(
      proprietaire => proprietaire.id === actif.proprietaireId
    );
  
    const isBienIndividuel = actif.typeActif === "bien_individuel";
    const isImmeubleRapport = actif.typeActif === "immeuble_rapport";
  
    const onglets: { id: typeof onglet; label: string; emoji: string }[] = [
      { id: "infos", label: "Informations", emoji: "📋" },
      { id: "charges", label: "Charges", emoji: "💶" },
      { id: "documents", label: "Documents", emoji: "📎" },
      { id: "historique", label: "Historique", emoji: "🕐" },
    ];
  
    const chargesRecuperables = isBienIndividuel
      ? actif.chargesRecup
      : actif.chargesImmeubleRecup;
  
    const chargesNonRecuperables = isBienIndividuel
      ? actif.chargesNonRecup
      : actif.chargesImmeubleNonRecup;
  
    return (
      <div
        className="min-h-screen"
        style={{
          backgroundColor: "#f8fafc",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        {/* Header */}
        <div
          className="px-4 sm:px-6 py-5"
          style={{ background: "linear-gradient(135deg,#fff7ed,#fff)" }}
        >
          <div className="max-w-4xl mx-auto">
            <div
              className="flex items-center gap-2 text-xs font-bold mb-3"
              style={{ color: "#94a3b8" }}
            >
              <button
                onClick={onBack}
                className="hover:underline"
                style={{ color: "#f97316" }}
              >
                ← Mes biens
              </button>
  
              <span>›</span>
  
              <span style={{ color: "#1e293b" }}>{actif.nom}</span>
            </div>
  
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div
                  className="w-14 h-14 rounded-3xl flex items-center justify-center text-2xl shadow"
                  style={{ background: "linear-gradient(135deg,#f97316,#fb923c)" }}
                >
                  {isImmeubleRapport ? "🏢" : "🏠"}
                </div>
  
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h1
                      className="text-lg font-black"
                      style={{ color: "#1e293b" }}
                    >
                      {actif.nom}
                    </h1>
  
                    {isBienIndividuel && <StatutBadge statut={actif.statut} />}
  
                    {isImmeubleRapport && (
                      <span
                        className="px-2 py-0.5 rounded-full text-xs font-bold"
                        style={{ backgroundColor: "#eff6ff", color: "#1d4ed8" }}
                      >
                        Immeuble parent
                      </span>
                    )}
                  </div>
  
                  <p className="text-xs" style={{ color: "#94a3b8" }}>
                    {actif.reference} · {actif.numeroVoie} {actif.typeVoie}{" "}
                    {actif.nomVoie}, {actif.codePostal} {actif.ville}
                  </p>
  
                  <p className="text-xs mt-0.5" style={{ color: "#cbd5e1" }}>
                    Propriétaire : {proprietaire?.prenom} {proprietaire?.nom}
                  </p>
                </div>
              </div>
  
              <button
                onClick={onEdit}
                className="px-4 py-2 rounded-2xl text-sm font-bold border-2 transition"
                style={{
                  borderColor: "#f97316",
                  color: "#f97316",
                  backgroundColor: "#fff7ed",
                }}
              >
                ✏️ Modifier
              </button>
            </div>
  
            {/* Onglets */}
            <div className="flex gap-2 mt-5 overflow-x-auto pb-1">
              {onglets.map(ongletItem => (
                <button
                  key={ongletItem.id}
                  onClick={() => setOnglet(ongletItem.id)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition"
                  style={{
                    backgroundColor: onglet === ongletItem.id ? "#f97316" : "#fff",
                    color: onglet === ongletItem.id ? "#fff" : "#64748b",
                    boxShadow:
                      onglet === ongletItem.id
                        ? "0 2px 8px rgba(249,115,22,0.3)"
                        : "none",
                  }}
                >
                  {ongletItem.emoji} {ongletItem.label}
                </button>
              ))}
            </div>
          </div>
        </div>
  
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-4">
          {/* ── ONGLET INFOS ── */}
          {onglet === "infos" && (
            <>
              {isBienIndividuel ? (
                <>
                  <SectionCard>
                    <SectionTitle emoji="🔒" title="Règle métier" />
                    <p className="text-sm font-semibold" style={{ color: "#334155" }}>
                      Ce bien est autonome : il peut recevoir directement un bail,
                      un contrat de location et un locataire. Il ne possède pas de
                      gestion de tantièmes.
                    </p>
                  </SectionCard>
  
                  <SectionCard>
                    <SectionTitle emoji="🏠" title="Caractéristiques du bien" />
  
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <InfoRow label="Type" value={actif.type} />
                      <InfoRow
                        label="Surface habitable"
                        value={`${actif.surface} m²`}
                      />
                      <InfoRow label="Pièces" value={actif.nbPieces} />
                      <InfoRow label="Chambres" value={actif.nbChambres} />
                      <InfoRow label="Salles de bain" value={actif.nbSDB} />
                      <InfoRow label="WC" value={actif.nbWC} />
                    </div>
                  </SectionCard>
  
                  {actif.equipements.length > 0 && (
                    <SectionCard>
                      <SectionTitle emoji="✅" title="Équipements" />
  
                      <div className="flex flex-wrap gap-2">
                        {actif.equipements.map(equipement => (
                          <span
                            key={equipement}
                            className="px-3 py-1 rounded-full text-xs font-bold"
                            style={{
                              backgroundColor: "#fff7ed",
                              color: "#f97316",
                            }}
                          >
                            {equipement}
                          </span>
                        ))}
                      </div>
                    </SectionCard>
                  )}
  
                  <SectionCard>
                    <SectionTitle emoji="💰" title="Informations financières" />
  
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <InfoRow label="Loyer HC" value={`${actif.loyer} €/mois`} />
                      <InfoRow label="Charges" value={`${actif.charges} €/mois`} />
                      <InfoRow
                        label="Total"
                        value={`${actif.loyer + actif.charges} €/mois`}
                      />
                      <InfoRow
                        label="Régime charges"
                        value={
                          actif.regimeCharges === "provision"
                            ? "Provision"
                            : "Forfait"
                        }
                      />
                    </div>
                  </SectionCard>
  
                  <SectionCard>
                    <SectionTitle emoji="⚡" title="Informations énergétiques" />
  
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <InfoRow
                        label="Classe énergie"
                        value={`Classe ${actif.classeEnergie}`}
                      />
                      <InfoRow
                        label="Classe climat"
                        value={`Classe ${actif.classeClimat}`}
                      />
                      <InfoRow
                        label="Conso. énergie"
                        value={actif.consoEnergie}
                      />
                      <InfoRow label="Date du DPE" value={actif.dateDPE || "—"} />
                    </div>
                  </SectionCard>
  
                  {actif.nomCopropriete && (
                    <SectionCard>
                      <SectionTitle emoji="🏛️" title="Copropriété éventuelle" />
  
                      <div className="grid sm:grid-cols-3 gap-3">
                        <InfoRow
                          label="Nom copropriété"
                          value={actif.nomCopropriete}
                        />
  
                        {actif.syndic && (
                          <InfoRow label="Syndic" value={actif.syndic} />
                        )}
  
                        {actif.numeroLot && (
                          <InfoRow label="N° lot copropriété" value={actif.numeroLot} />
                        )}
                      </div>
                    </SectionCard>
                  )}
                </>
              ) : (
                <>
                  <SectionCard>
                    <SectionTitle emoji="🔒" title="Règle métier" />
                    <p className="text-sm font-semibold" style={{ color: "#334155" }}>
                      Cet immeuble est une structure parent : il ne peut pas
                      recevoir directement un bail, un contrat de location ou un
                      locataire. Seuls ses lots locatifs sont louables.
                    </p>
                  </SectionCard>
  
                  <SectionCard>
                    <SectionTitle emoji="🏢" title="Informations générales" />
  
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <InfoRow label="Nb étages" value={actif.nbEtages} />
                      <InfoRow label="Lots créés" value={actif.lots.length} />
                      <InfoRow label="Lots prévus" value={actif.nbLotsTotal} />
                      <InfoRow
                        label="Surface totale"
                        value={`${actif.surfaceTotale} m²`}
                      />
                      <InfoRow
                        label="Total tantièmes"
                        value={actif.totalTantiemes}
                      />
                      <InfoRow
                        label="Tantièmes attribués"
                        value={actif.lots.reduce(
                          (total, lot) => total + lot.quotePartTantiemes,
                          0
                        )}
                      />
                      <InfoRow
                        label="Tantièmes restants"
                        value={
                          actif.totalTantiemes -
                          actif.lots.reduce(
                            (total, lot) => total + lot.quotePartTantiemes,
                            0
                          )
                        }
                      />
                    </div>
                  </SectionCard>
  
                  {/* Jauge tantièmes */}
                  <SectionCard>
                    <SectionTitle emoji="⚖️" title="Répartition des tantièmes" />
  
                    {(() => {
                      const tantiemesUtilises = actif.lots.reduce(
                        (total, lot) => total + lot.quotePartTantiemes,
                        0
                      );
                      const tantiemesRestants =
                        actif.totalTantiemes - tantiemesUtilises;
                      const pct = Math.min(
                        (tantiemesUtilises / actif.totalTantiemes) * 100,
                        100
                      );
  
                      return (
                        <>
                          <div className="flex justify-between text-xs font-bold mb-2">
                            <span style={{ color: "#64748b" }}>
                              {tantiemesUtilises} attribués
                            </span>
  
                            <span
                              style={{
                                color:
                                  tantiemesRestants === 0 ? "#22c55e" : "#f97316",
                              }}
                            >
                              {tantiemesRestants} restants
                            </span>
                          </div>
  
                          <div
                            className="w-full h-4 rounded-full overflow-hidden"
                            style={{ backgroundColor: "#e2e8f0" }}
                          >
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${pct}%`,
                                backgroundColor:
                                  tantiemesRestants === 0 ? "#22c55e" : "#f97316",
                              }}
                            />
                          </div>
  
                          <div className="flex flex-wrap gap-2 mt-3">
                            {actif.lots.map(lot => (
                              <div
                                key={lot.id}
                                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
                                style={{
                                  backgroundColor: "#fff7ed",
                                  color: "#f97316",
                                }}
                              >
                                <span>{lot.nom}</span>
                                <span style={{ color: "#94a3b8" }}>
                                  {lot.quotePartTantiemes}/{actif.totalTantiemes}
                                </span>
                              </div>
                            ))}
                          </div>
                        </>
                      );
                    })()}
                  </SectionCard>
  
                  {/* Liste des lots */}
                  <div>
                    <p
                      className="text-xs font-extrabold uppercase tracking-wide mb-3 px-1"
                      style={{ color: "#94a3b8" }}
                    >
                      🏘️ Lots locatifs ({actif.lots.length})
                    </p>
  
                    <div className="space-y-3">
                      {actif.lots.map(lot => (
                        <div
                          key={lot.id}
                          className="bg-white rounded-3xl shadow-sm overflow-hidden"
                        >
                          <button
                            className="w-full p-4 flex items-center justify-between gap-3 hover:bg-orange-50 transition"
                            onClick={() =>
                              setLotOuvert(lotOuvert === lot.id ? null : lot.id)
                            }
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg"
                                style={{ backgroundColor: "#fff7ed" }}
                              >
                                🏠
                              </div>
  
                              <div className="text-left">
                                <p
                                  className="font-extrabold text-sm"
                                  style={{ color: "#1e293b" }}
                                >
                                  {lot.nom}
                                </p>
  
                                <p className="text-xs" style={{ color: "#94a3b8" }}>
                                  {lot.surface} m² · {lot.quotePartTantiemes}/
                                  {actif.totalTantiemes} tantièmes
                                </p>
                              </div>
                            </div>
  
                            <div className="flex items-center gap-2">
                              <StatutBadge statut={lot.statut} />
  
                              <span
                                className="font-extrabold text-sm"
                                style={{ color: "#f97316" }}
                              >
                                {lot.loyer + lot.charges} €/mois
                              </span>
  
                              <span className="text-xs" style={{ color: "#94a3b8" }}>
                                {lotOuvert === lot.id ? "▲" : "▼"}
                              </span>
                            </div>
                          </button>
  
                          {lotOuvert === lot.id && (
                            <div
                              className="px-4 pb-4 border-t"
                              style={{ borderColor: "#f1f5f9" }}
                            >
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                                <InfoRow label="Type" value={lot.type} />
                                <InfoRow
                                  label="Surface"
                                  value={`${lot.surface} m²`}
                                />
                                <InfoRow label="Pièces" value={lot.nbPieces} />
                                <InfoRow
                                  label="Étage"
                                  value={lot.etage || "RDC"}
                                />
                                <InfoRow
                                  label="Loyer HC"
                                  value={`${lot.loyer} €`}
                                />
                                <InfoRow
                                  label="Charges"
                                  value={`${lot.charges} €`}
                                />
                                <InfoRow
                                  label="Total"
                                  value={`${lot.loyer + lot.charges} €/mois`}
                                />
                                <InfoRow
                                  label="DPE"
                                  value={`Classe ${lot.classeEnergie}`}
                                />
                                <InfoRow
                                  label="Quote-part"
                                  value={`${lot.quotePartTantiemes}/${actif.totalTantiemes}`}
                                />
                                <InfoRow
                                  label="Référence"
                                  value={lot.reference}
                                />
                              </div>
  
                              {lot.equipements.length > 0 && (
                                <div className="mt-4">
                                  <p
                                    className="text-xs font-bold mb-2"
                                    style={{ color: "#94a3b8" }}
                                  >
                                    Équipements du lot
                                  </p>
  
                                  <div className="flex flex-wrap gap-2">
                                    {lot.equipements.map(equipement => (
                                      <span
                                        key={equipement}
                                        className="px-3 py-1 rounded-full text-xs font-bold"
                                        style={{
                                          backgroundColor: "#fff7ed",
                                          color: "#f97316",
                                        }}
                                      >
                                        {equipement}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </>
          )}
  
          {/* ── ONGLET CHARGES ── */}
          {onglet === "charges" && (
            <>
              <SectionCard>
                <SectionTitle
                  emoji="💧"
                  title={
                    isBienIndividuel
                      ? "Charges récupérables du bien"
                      : "Charges récupérables de l'immeuble"
                  }
                />
  
                {chargesRecuperables.filter(charge => charge.selected).length === 0 ? (
                  <p
                    className="text-sm text-center py-4"
                    style={{ color: "#94a3b8" }}
                  >
                    Aucune charge récupérable renseignée
                  </p>
                ) : (
                  <div className="space-y-2">
                    {chargesRecuperables
                      .filter(charge => charge.selected)
                      .map(charge => (
                        <div
                          key={charge.id}
                          className="flex justify-between items-center p-3 rounded-2xl"
                          style={{ backgroundColor: "#f0fdf4" }}
                        >
                          <span
                            className="text-sm font-semibold"
                            style={{ color: "#1e293b" }}
                          >
                            {charge.libelle}
                          </span>
  
                          <span
                            className="text-sm font-extrabold"
                            style={{ color: "#166534" }}
                          >
                            {charge.montantAnnuel > 0
                              ? `${charge.montantAnnuel} €/an`
                              : "Montant non défini"}
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </SectionCard>
  
              <SectionCard>
                <SectionTitle
                  emoji="🏦"
                  title={
                    isBienIndividuel
                      ? "Charges non récupérables du bien"
                      : "Charges non récupérables de l'immeuble"
                  }
                />
  
                {chargesNonRecuperables.filter(charge => charge.selected).length ===
                0 ? (
                  <p
                    className="text-sm text-center py-4"
                    style={{ color: "#94a3b8" }}
                  >
                    Aucune charge non récupérable renseignée
                  </p>
                ) : (
                  <div className="space-y-2">
                    {chargesNonRecuperables
                      .filter(charge => charge.selected)
                      .map(charge => (
                        <div
                          key={charge.id}
                          className="flex justify-between items-center p-3 rounded-2xl"
                          style={{ backgroundColor: "#fef2f2" }}
                        >
                          <span
                            className="text-sm font-semibold"
                            style={{ color: "#1e293b" }}
                          >
                            {charge.libelle}
                          </span>
  
                          <span
                            className="text-sm font-extrabold"
                            style={{ color: "#991b1b" }}
                          >
                            {charge.montantAnnuel > 0
                              ? `${charge.montantAnnuel} €/an`
                              : "Montant non défini"}
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </SectionCard>
  
              {isImmeubleRapport && (
                <SectionCard>
                  <SectionTitle
                    emoji="⚖️"
                    title="Répartition théorique par tantièmes"
                  />
  
                  {actif.lots.length === 0 ? (
                    <p
                      className="text-sm text-center py-4"
                      style={{ color: "#94a3b8" }}
                    >
                      Aucun lot locatif créé pour calculer la répartition.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {actif.lots.map(lot => {
                        const quotePart =
                          actif.totalTantiemes > 0
                            ? lot.quotePartTantiemes / actif.totalTantiemes
                            : 0;
  
                        const chargesRecupAnnuel = chargesRecuperables
                          .filter(charge => charge.selected)
                          .reduce(
                            (total, charge) => total + charge.montantAnnuel,
                            0
                          );
  
                        const chargesNonRecupAnnuel = chargesNonRecuperables
                          .filter(charge => charge.selected)
                          .reduce(
                            (total, charge) => total + charge.montantAnnuel,
                            0
                          );
  
                        return (
                          <div
                            key={lot.id}
                            className="p-3 rounded-2xl"
                            style={{ backgroundColor: "#f8fafc" }}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <p
                                  className="text-sm font-extrabold"
                                  style={{ color: "#1e293b" }}
                                >
                                  {lot.nom}
                                </p>
                                <p
                                  className="text-xs"
                                  style={{ color: "#94a3b8" }}
                                >
                                  {lot.quotePartTantiemes}/{actif.totalTantiemes}{" "}
                                  tantièmes
                                </p>
                              </div>
  
                              <div className="text-right">
                                <p
                                  className="text-xs font-bold"
                                  style={{ color: "#166534" }}
                                >
                                  Récup. :{" "}
                                  {Math.round(chargesRecupAnnuel * quotePart)} €/an
                                </p>
                                <p
                                  className="text-xs font-bold"
                                  style={{ color: "#991b1b" }}
                                >
                                  Non récup. :{" "}
                                  {Math.round(chargesNonRecupAnnuel * quotePart)}{" "}
                                  €/an
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </SectionCard>
              )}
            </>
          )}
  
          {/* ── ONGLET DOCUMENTS ── */}
          {onglet === "documents" && (
            <SectionCard>
              <SectionTitle
                emoji="📎"
                title={
                  isBienIndividuel
                    ? "Documents du bien individuel"
                    : "Documents de l'immeuble"
                }
              />
  
              {actif.documents.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">📂</div>
  
                  <p className="text-sm font-bold" style={{ color: "#94a3b8" }}>
                    Aucun document associé
                  </p>
  
                  <button
                    className="mt-3 px-4 py-2 rounded-2xl text-sm font-bold text-white shadow"
                    style={{ background: "linear-gradient(135deg,#f97316,#fb923c)" }}
                  >
                    + Ajouter un document
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {actif.documents.map(document => (
                    <div
                      key={document.id}
                      className="flex items-center justify-between p-3 rounded-2xl"
                      style={{ backgroundColor: "#f8fafc" }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">📄</span>
  
                        <div>
                          <p
                            className="text-sm font-bold"
                            style={{ color: "#1e293b" }}
                          >
                            {document.nom}
                          </p>
  
                          {document.dateValidite && (
                            <p className="text-xs" style={{ color: "#94a3b8" }}>
                              Valide jusqu'au {document.dateValidite}
                            </p>
                          )}
                        </div>
                      </div>
  
                      <button
                        className="px-3 py-1 rounded-xl text-xs font-bold"
                        style={{ backgroundColor: "#eff6ff", color: "#3b82f6" }}
                      >
                        ⬇ Télécharger
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>
          )}
  
          {/* ── ONGLET HISTORIQUE ── */}
          {onglet === "historique" && (
            <SectionCard>
              <SectionTitle emoji="🕐" title="Journal des modifications" />
  
              {actif.historique.length === 0 ? (
                <p
                  className="text-sm text-center py-6"
                  style={{ color: "#94a3b8" }}
                >
                  Aucune modification enregistrée
                </p>
              ) : (
                <div className="space-y-2">
                  {actif.historique.map(historique => (
                    <div
                      key={historique.id}
                      className="p-3 rounded-2xl"
                      style={{ backgroundColor: "#f8fafc" }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className="text-xs font-extrabold"
                          style={{ color: "#1e293b" }}
                        >
                          {historique.champ}
                        </span>
  
                        <span className="text-xs" style={{ color: "#94a3b8" }}>
                          {historique.date} à {historique.heure}
                        </span>
                      </div>
  
                      <div className="flex items-center gap-2">
                        <span
                          className="px-2 py-0.5 rounded-lg text-xs font-bold line-through"
                          style={{ backgroundColor: "#fef2f2", color: "#991b1b" }}
                        >
                          {historique.ancienneValeur}
                        </span>
  
                        <span style={{ color: "#94a3b8" }}>→</span>
  
                        <span
                          className="px-2 py-0.5 rounded-lg text-xs font-bold"
                          style={{ backgroundColor: "#f0fdf4", color: "#166534" }}
                        >
                          {historique.nouvelleValeur}
                        </span>
                      </div>
  
                      <p className="text-xs mt-1" style={{ color: "#94a3b8" }}>
                        Par {historique.utilisateur}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>
          )}
        </div>
      </div>
    );
  }
    
    // ============================================================
// VUE LISTE DES BIENS
// ============================================================
function VueListeBiens({
    actifs,
    onNouvelActif,
    onSelectActif,
  }: {
    actifs: Actif[];
    onNouvelActif: () => void;
    onSelectActif: (a: Actif) => void;
  }) {
    const [recherche, setRecherche] = useState("");
    const [filtreType, setFiltreType] = useState<
      "tous" | "bien_individuel" | "immeuble_rapport" | "vacant" | "occupe"
    >("tous");
  
    const filtres = [
      { id: "tous", label: "Tous" },
      { id: "bien_individuel", label: "Biens individuels" },
      { id: "immeuble_rapport", label: "Immeubles de rapport" },
      { id: "vacant", label: "Biens vacants" },
      { id: "occupe", label: "Biens occupés" },
    ] as const;
  
    const actifsFiltres = actifs.filter(actif => {
      const rechercheNormalisee = recherche.toLowerCase();
  
      const matchRecherche =
        actif.nom.toLowerCase().includes(rechercheNormalisee) ||
        actif.ville.toLowerCase().includes(rechercheNormalisee) ||
        actif.reference.toLowerCase().includes(rechercheNormalisee);
  
      if (!matchRecherche) return false;
  
      if (filtreType === "bien_individuel") {
        return actif.typeActif === "bien_individuel";
      }
  
      if (filtreType === "immeuble_rapport") {
        return actif.typeActif === "immeuble_rapport";
      }
  
      if (filtreType === "vacant") {
        if (actif.typeActif === "bien_individuel") {
          return actif.statut === "vacant";
        }
  
        return actif.lots.some(lot => lot.statut === "vacant");
      }
  
      if (filtreType === "occupe") {
        if (actif.typeActif === "bien_individuel") {
          return actif.statut === "occupe";
        }
  
        return actif.lots.some(lot => lot.statut === "occupe");
      }
  
      return true;
    });
  
    const totalBiensIndividuels = actifs.filter(
      actif => actif.typeActif === "bien_individuel"
    ).length;
  
    const totalImmeublesRapport = actifs.filter(
      actif => actif.typeActif === "immeuble_rapport"
    ).length;
  
    const totalLotsLocatifs = actifs
      .filter((actif): actif is ImmeubleRapport => actif.typeActif === "immeuble_rapport")
      .reduce((total, immeuble) => total + immeuble.lots.length, 0);
  
    const totalVacants = actifs.reduce((total, actif) => {
      if (actif.typeActif === "bien_individuel") {
        return total + (actif.statut === "vacant" ? 1 : 0);
      }
  
      return total + actif.lots.filter(lot => lot.statut === "vacant").length;
    }, 0);
  
    const stats = [
      {
        emoji: "🏠",
        value: totalBiensIndividuels,
        label: "Biens individuels",
        bg: "linear-gradient(135deg,#f97316,#fb923c)",
      },
      {
        emoji: "🏢",
        value: totalImmeublesRapport,
        label: "Immeubles",
        bg: "linear-gradient(135deg,#8b5cf6,#a78bfa)",
      },
      {
        emoji: "🔑",
        value: totalLotsLocatifs,
        label: "Lots locatifs",
        bg: "linear-gradient(135deg,#06b6d4,#22d3ee)",
      },
      {
        emoji: "🟡",
        value: totalVacants,
        label: "Louables vacants",
        bg: "linear-gradient(135deg,#f59e0b,#fbbf24)",
      },
    ];
  
    return (
      <div
        className="min-h-screen"
        style={{
          backgroundColor: "#f8fafc",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        {/* Header */}
        <div
          className="px-4 sm:px-6 py-5"
          style={{ background: "linear-gradient(135deg,#fff7ed,#fff)" }}
        >
          <div className="max-w-5xl mx-auto">
            <div className="flex items-start justify-between gap-4 flex-wrap mb-5">
              <div>
                <h1 className="text-2xl font-black" style={{ color: "#1e293b" }}>
                  🏠 Mes biens
                </h1>
  
                <p className="text-sm mt-0.5" style={{ color: "#94a3b8" }}>
                  {actifs.length} actif(s) enregistré(s)
                </p>
              </div>
  
              <button
                onClick={onNouvelActif}
                className="px-5 py-2.5 rounded-2xl text-white text-sm font-extrabold shadow-lg transition hover:opacity-90"
                style={{ background: "linear-gradient(135deg,#f97316,#fb923c)" }}
              >
                + Ajouter un actif
              </button>
            </div>
  
            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {stats.map(stat => (
                <div
                  key={stat.label}
                  className="rounded-3xl p-4 text-white"
                  style={{ background: stat.bg }}
                >
                  <div className="text-2xl mb-1">{stat.emoji}</div>
                  <p className="text-2xl font-black">{stat.value}</p>
                  <p className="text-xs font-bold opacity-90">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
  
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5">
          {/* Recherche + filtres */}
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="flex-1 relative">
              <span
                className="absolute left-4 top-1/2 -translate-y-1/2 text-sm"
                style={{ color: "#94a3b8" }}
              >
                🔍
              </span>
  
              <input
                value={recherche}
                onChange={event => setRecherche(event.target.value)}
                placeholder="Rechercher par nom, ville, référence..."
                className="w-full pl-9 pr-4 py-3 rounded-2xl text-sm border outline-none"
                style={{ borderColor: "#e2e8f0", backgroundColor: "#fff" }}
              />
            </div>
  
            <div className="flex gap-2 flex-wrap">
              {filtres.map(filtre => (
                <button
                  key={filtre.id}
                  onClick={() => setFiltreType(filtre.id)}
                  className="px-3 py-2 rounded-2xl text-xs font-bold transition"
                  style={{
                    backgroundColor: filtreType === filtre.id ? "#f97316" : "#fff",
                    color: filtreType === filtre.id ? "#fff" : "#64748b",
                    border: `2px solid ${
                      filtreType === filtre.id ? "#f97316" : "#e2e8f0"
                    }`,
                  }}
                >
                  {filtre.label}
                </button>
              ))}
            </div>
          </div>
  
          {/* Liste */}
          {actifsFiltres.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-3">🏗️</div>
  
              <p className="font-bold text-base" style={{ color: "#1e293b" }}>
                Aucun actif trouvé
              </p>
  
              <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>
                Ajoutez un bien individuel ou un immeuble de rapport.
              </p>
  
              <button
                onClick={onNouvelActif}
                className="mt-4 px-5 py-2.5 rounded-2xl text-white text-sm font-bold shadow"
                style={{ background: "linear-gradient(135deg,#f97316,#fb923c)" }}
              >
                + Ajouter un actif
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {actifsFiltres.map(actif => {
                const proprietaire = mockProprietaires.find(
                  p => p.id === actif.proprietaireId
                );
  
                const isImmeubleRapport = actif.typeActif === "immeuble_rapport";
  
                const lotsCount = isImmeubleRapport ? actif.lots.length : null;
  
                const loyerMensuel = !isImmeubleRapport
                  ? actif.loyer + actif.charges
                  : null;
  
                const tantiemesUtilises = isImmeubleRapport
                  ? actif.lots.reduce(
                      (total, lot) => total + lot.quotePartTantiemes,
                      0
                    )
                  : null;
  
                return (
                  <button
                    key={actif.id}
                    onClick={() => onSelectActif(actif)}
                    className="w-full bg-white rounded-3xl p-4 shadow-sm hover:shadow-md transition text-left"
                  >
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
                          style={{
                            background: isImmeubleRapport
                              ? "linear-gradient(135deg,#8b5cf6,#a78bfa)"
                              : "linear-gradient(135deg,#f97316,#fb923c)",
                          }}
                        >
                          {isImmeubleRapport ? "🏢" : "🏠"}
                        </div>
  
                        <div>
                          <div className="flex items-center gap-2 flex-wrap mb-0.5">
                            <p
                              className="font-extrabold text-sm"
                              style={{ color: "#1e293b" }}
                            >
                              {actif.nom}
                            </p>
  
                            {!isImmeubleRapport && (
                              <StatutBadge statut={actif.statut} />
                            )}
  
                            {isImmeubleRapport && (
                              <span
                                className="px-2 py-0.5 rounded-full text-xs font-bold"
                                style={{
                                  backgroundColor: "#f3e8ff",
                                  color: "#7c3aed",
                                }}
                              >
                                Immeuble parent
                              </span>
                            )}
                          </div>
  
                          <p className="text-xs" style={{ color: "#94a3b8" }}>
                            {actif.reference} · {actif.numeroVoie} {actif.typeVoie}{" "}
                            {actif.nomVoie}, {actif.ville}
                          </p>
  
                          <p className="text-xs mt-0.5" style={{ color: "#cbd5e1" }}>
                            {proprietaire?.prenom} {proprietaire?.nom}
                            {isImmeubleRapport && ` · ${lotsCount} lot(s) locatif(s)`}
                          </p>
                        </div>
                      </div>
  
                      <div className="text-right">
                        {loyerMensuel !== null && (
                          <p
                            className="font-extrabold text-sm"
                            style={{ color: "#f97316" }}
                          >
                            {loyerMensuel} €
                            <span className="font-normal text-xs">/mois</span>
                          </p>
                        )}
  
                        {isImmeubleRapport && (
                          <p
                            className="text-xs font-bold"
                            style={{ color: "#8b5cf6" }}
                          >
                            {tantiemesUtilises}/{actif.totalTantiemes} tantièmes
                          </p>
                        )}
  
                        <p className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>
                          {!isImmeubleRapport
                            ? `${actif.surface} m²`
                            : `${actif.surfaceTotale} m²`}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }
  
  // ============================================================
  // CHOIX TYPE ACTIF
  // ============================================================
  function ChoixTypeActif({
    onChoix,
    onRetour,
  }: {
    onChoix: (t: TypeActif) => void;
    onRetour: () => void;
  }) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-4"
        style={{
          backgroundColor: "#f8fafc",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <div className="w-full max-w-lg">
          <button
            onClick={onRetour}
            className="text-xs font-bold mb-6 hover:underline"
            style={{ color: "#f97316" }}
          >
            ← Retour
          </button>
  
          <h1 className="text-2xl font-black mb-2" style={{ color: "#1e293b" }}>
            Quel type d’actif souhaitez-vous créer ?
          </h1>
  
          <p className="text-sm mb-8" style={{ color: "#94a3b8" }}>
            Sélectionnez le bon parcours métier pour éviter toute confusion entre
            un bien individuel autonome et un immeuble de rapport.
          </p>
  
          <div className="grid sm:grid-cols-2 gap-4">
            <button
              onClick={() => onChoix("bien_individuel")}
              className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-lg transition text-left border-2 hover:border-orange-300"
              style={{ borderColor: "#e2e8f0" }}
            >
              <div
                className="w-14 h-14 rounded-3xl flex items-center justify-center text-3xl mb-4"
                style={{ background: "linear-gradient(135deg,#f97316,#fb923c)" }}
              >
                🏠
              </div>
  
              <p className="font-extrabold text-base mb-1" style={{ color: "#1e293b" }}>
                Bien individuel
              </p>
  
              <p className="text-xs" style={{ color: "#94a3b8" }}>
                Appartement, maison, studio, garage, parking, cave ou box autonome.
                Ce bien est directement louable.
              </p>
  
              <div
                className="mt-4 p-3 rounded-2xl"
                style={{ backgroundColor: "#fff7ed" }}
              >
                <p className="text-xs font-bold" style={{ color: "#f97316" }}>
                  Peut recevoir un bail, un contrat de location et un locataire.
                </p>
              </div>
            </button>
  
            <button
              onClick={() => onChoix("immeuble_rapport")}
              className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-lg transition text-left border-2 hover:border-purple-300"
              style={{ borderColor: "#e2e8f0" }}
            >
              <div
                className="w-14 h-14 rounded-3xl flex items-center justify-center text-3xl mb-4"
                style={{ background: "linear-gradient(135deg,#8b5cf6,#a78bfa)" }}
              >
                🏢
              </div>
  
              <p className="font-extrabold text-base mb-1" style={{ color: "#1e293b" }}>
                Immeuble de rapport
              </p>
  
              <p className="text-xs" style={{ color: "#94a3b8" }}>
                Structure parent contenant plusieurs lots locatifs. La répartition
                des charges se fait par tantièmes.
              </p>
  
              <div
                className="mt-4 p-3 rounded-2xl"
                style={{ backgroundColor: "#f3e8ff" }}
              >
                <p className="text-xs font-bold" style={{ color: "#7c3aed" }}>
                  L’immeuble n’est pas louable directement. Seuls ses lots le sont.
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // ============================================================
  // MODULE PRINCIPAL
  // ============================================================
  type ViewState =
    | { name: "liste" }
    | { name: "choix" }
    | { name: "wizardBienIndividuel" }
    | { name: "wizardImmeubleRapport" }
    | { name: "detail"; actif: Actif };
  
  export default function ModuleBiens() {
    const [view, setView] = useState<ViewState>({ name: "liste" });
    const [actifs, setActifs] = useState<Actif[]>(mockActifs);
  
    const handleSaveBienIndividuel = (bien: BienIndividuel) => {
      setActifs(prev => [...prev, bien]);
      setView({ name: "liste" });
    };
  
    const handleSaveImmeubleRapport = (immeuble: ImmeubleRapport) => {
      setActifs(prev => [...prev, immeuble]);
      setView({ name: "liste" });
    };
  
    if (view.name === "choix") {
      return (
        <ChoixTypeActif
          onChoix={typeActif =>
            setView({
              name:
                typeActif === "bien_individuel"
                  ? "wizardBienIndividuel"
                  : "wizardImmeubleRapport",
            } as ViewState)
          }
          onRetour={() => setView({ name: "liste" })}
        />
      );
    }
  
    if (view.name === "wizardBienIndividuel") {
      return (
        <WizardBienIndividuel
          onSave={handleSaveBienIndividuel}
          onRetour={() => setView({ name: "choix" })}
        />
      );
    }
  
    if (view.name === "wizardImmeubleRapport") {
      return (
        <WizardImmeubleRapport
          onSave={handleSaveImmeubleRapport}
          onRetour={() => setView({ name: "choix" })}
        />
      );
    }
  
    if (view.name === "detail") {
      return (
        <VueDetailBien
          actif={view.actif}
          onBack={() => setView({ name: "liste" })}
          onEdit={() =>
            setView({
              name:
                view.actif.typeActif === "bien_individuel"
                  ? "wizardBienIndividuel"
                  : "wizardImmeubleRapport",
            } as ViewState)
          }
        />
      );
    }
  
    return (
      <VueListeBiens
        actifs={actifs}
        onNouvelActif={() => setView({ name: "choix" })}
        onSelectActif={actif => setView({ name: "detail", actif })}
      />
    );
  }
  
