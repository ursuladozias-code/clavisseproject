"use client";

import { Inter } from "next/font/google";
import { useState } from "react";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

// ============================================================
// TYPES
// ============================================================
type StatutBail =
  | "brouillon"
  | "genere"
  | "envoye"
  | "partiellement_signe"
  | "refuse"
  | "expire"
  | "signe";
type TypeBail = "vide" | "meuble" | "etudiant" | "mobilite";
type TypeSignature = "manuelle" | "electronique";
type TypeOccupation = "individuelle" | "colocation";

interface Garant {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  typeGarantie: string;
  revenus: number;
}

interface Locataire {
  id: string;
  nom: string;
  prenom: string;
  dateNaissance: string;
  email: string;
  telephone: string;
  profession: string;
  employeur: string;
  situationPro: string;
  assureur: string;
  numContratAssurance: string;
  dateValiditeAssurance: string;
  garants: Garant[];
}

interface Bien {
  id: string;
  nom: string;
  adresse: string;
  codePostal: string;
  ville: string;
  type: string;
  surface: number;
  nbPieces: number;
  loyer: number;
  charges: number;
  dpe: string;
  bailleurNom: string;
  bailleurType: "physique" | "morale";
  bailleurEmail: string;
  bailleurTelephone: string;
  documents: string[];
}

interface BailData {
  id: string;
  bienId: string;
  locatairePrincipalId: string;
  colocataireIds: string[];
  typeOccupation: TypeOccupation;
  clauseSolidarite: boolean;
  typeBail: TypeBail;
  dateSignature: string;
  datePriseEffet: string;
  duree: number;
  dateFin: string;
  dateExigibilite: string;
  modePaiement: string;
  coordsBancairesVisibles: boolean;
  depotGarantie: boolean;
  montantDepot: number;
  dateVersementDepot: string;
  loyerRevisable: boolean;
  trimestreRef: string;
  anneeRef: string;
  dateAnniversaireRevision: string;
  clausesParticulieres: string;
  modeSignature: TypeSignature;
  statut: StatutBail;
}

// ============================================================
// MOCK DATA
// ============================================================
const mockGarants: Garant[] = [
  {
    id: "g1",
    nom: "Dupont",
    prenom: "Jean",
    email: "jean.dupont@email.com",
    telephone: "06 11 22 33 44",
    typeGarantie: "Caution simple",
    revenus: 3500,
  },
  {
    id: "g2",
    nom: "Martin",
    prenom: "Claire",
    email: "claire.martin@email.com",
    telephone: "06 55 66 77 88",
    typeGarantie: "Caution solidaire",
    revenus: 4200,
  },
];

const mockLocataires: Locataire[] = [
  {
    id: "l1",
    nom: "Bernard",
    prenom: "Sophie",
    dateNaissance: "1995-03-15",
    email: "sophie.bernard@email.com",
    telephone: "06 12 34 56 78",
    profession: "Ingénieure",
    employeur: "Tech Corp",
    situationPro: "CDI",
    assureur: "AXA",
    numContratAssurance: "AXA-2024-001",
    dateValiditeAssurance: "2025-12-31",
    garants: [mockGarants[0]],
  },
  {
    id: "l2",
    nom: "Leroy",
    prenom: "Thomas",
    dateNaissance: "1998-07-22",
    email: "thomas.leroy@email.com",
    telephone: "06 98 76 54 32",
    profession: "Designer",
    employeur: "Studio 42",
    situationPro: "CDD",
    assureur: "MAIF",
    numContratAssurance: "MAIF-2024-042",
    dateValiditeAssurance: "2025-06-30",
    garants: [mockGarants[1]],
  },
  {
    id: "l3",
    nom: "Moreau",
    prenom: "Léa",
    dateNaissance: "2001-11-05",
    email: "lea.moreau@email.com",
    telephone: "06 45 67 89 01",
    profession: "Étudiante",
    employeur: "Université Paris 1",
    situationPro: "Étudiant",
    assureur: "SMERRA",
    numContratAssurance: "SM-2024-789",
    dateValiditeAssurance: "2025-09-30",
    garants: [mockGarants[0], mockGarants[1]],
  },
];

const mockBiens: Bien[] = [
  {
    id: "b1",
    nom: "Appartement Voltaire",
    adresse: "12 rue Voltaire",
    codePostal: "75011",
    ville: "Paris",
    type: "Appartement",
    surface: 45,
    nbPieces: 3,
    loyer: 1200,
    charges: 150,
    dpe: "C",
    bailleurNom: "Pierre Durand",
    bailleurType: "physique",
    bailleurEmail: "pierre.durand@email.com",
    bailleurTelephone: "06 00 11 22 33",
    documents: ["DPE", "ERP", "Diagnostic électricité", "CREP"],
  },
  {
    id: "b2",
    nom: "Studio Nation",
    adresse: "8 avenue de la Nation",
    codePostal: "75012",
    ville: "Paris",
    type: "Studio",
    surface: 28,
    nbPieces: 1,
    loyer: 850,
    charges: 80,
    dpe: "D",
    bailleurNom: "SCI Patrimoine Plus",
    bailleurType: "morale",
    bailleurEmail: "contact@sci-patrimoine.fr",
    bailleurTelephone: "01 23 45 67 89",
    documents: ["DPE", "ERP", "Diagnostic gaz", "Diagnostic électricité"],
  },
  {
    id: "b3",
    nom: "Maison République",
    adresse: "3 rue de la République",
    codePostal: "69001",
    ville: "Lyon",
    type: "Maison",
    surface: 95,
    nbPieces: 5,
    loyer: 1600,
    charges: 200,
    dpe: "B",
    bailleurNom: "Marie Lefebvre",
    bailleurType: "physique",
    bailleurEmail: "marie.lefebvre@email.com",
    bailleurTelephone: "06 77 88 99 00",
    documents: [
      "DPE",
      "ERP",
      "Diagnostic gaz",
      "Diagnostic électricité",
      "CREP",
      "Règlement de copropriété",
    ],
  },
];

// ============================================================
// HELPERS
// ============================================================
const statutConfig: Record<
  StatutBail,
  { label: string; color: string; bg: string; emoji: string }
> = {
  brouillon: {
    label: "Brouillon",
    color: "#64748b",
    bg: "#f1f5f9",
    emoji: "📝",
  },
  genere: { label: "Généré", color: "#3b82f6", bg: "#eff6ff", emoji: "📄" },
  envoye: {
    label: "Envoyé à signature",
    color: "#8b5cf6",
    bg: "#f5f3ff",
    emoji: "📤",
  },
  partiellement_signe: {
    label: "Partiellement signé",
    color: "#f59e0b",
    bg: "#fffbeb",
    emoji: "✍️",
  },
  refuse: { label: "Refusé", color: "#ef4444", bg: "#fef2f2", emoji: "❌" },
  expire: { label: "Expiré", color: "#94a3b8", bg: "#f8fafc", emoji: "⏰" },
  signe: { label: "Signé", color: "#22c55e", bg: "#f0fdf4", emoji: "✅" },
};

const typesBail: {
  id: TypeBail;
  label: string;
  desc: string;
  duree: string;
}[] = [
  {
    id: "vide",
    label: "Bail vide",
    desc: "Location non meublée",
    duree: "3 ans",
  },
  {
    id: "meuble",
    label: "Bail meublé",
    desc: "Location meublée",
    duree: "1 an",
  },
  {
    id: "etudiant",
    label: "Bail étudiant",
    desc: "Pour étudiants",
    duree: "9 mois",
  },
  {
    id: "mobilite",
    label: "Bail mobilité",
    desc: "De 1 à 10 mois",
    duree: "1-10 mois",
  },
];

// ============================================================
// SOUS-COMPOSANTS UI
// ============================================================
function StatutBadge({ statut }: { statut: StatutBail }) {
  const cfg = statutConfig[statut];
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold"
      style={{ color: cfg.color, backgroundColor: cfg.bg }}
    >
      {cfg.emoji} {cfg.label}
    </span>
  );
}

function SectionCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-white rounded-3xl p-5 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

function SectionTitle({
  emoji,
  title,
  subtitle,
}: {
  emoji: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-4">
      <p
        className="text-xs font-extrabold uppercase tracking-wide mb-0.5"
        style={{ color: "#94a3b8" }}
      >
        {emoji} {title}
      </p>
      {subtitle && (
        <p className="text-xs" style={{ color: "#cbd5e1" }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs" style={{ color: "#94a3b8" }}>
        {label}
      </span>
      <span className="text-sm font-semibold" style={{ color: "#1e293b" }}>
        {value}
      </span>
    </div>
  );
}

function StepIndicator({
  current,
  total,
  labels,
}: {
  current: number;
  total: number;
  labels: string[];
}) {
  return (
    <div className="w-full overflow-x-auto pb-2">
      <div className="flex items-center gap-0 min-w-max mx-auto px-4">
        {labels.map((label, i) => {
          const stepNum = i + 1;
          const done = stepNum < current;
          const active = stepNum === current;
          return (
            <div key={i} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold transition-all"
                  style={{
                    background: done
                      ? "#22c55e"
                      : active
                        ? "linear-gradient(135deg,#f97316,#fb923c)"
                        : "#e2e8f0",
                    color: done || active ? "#fff" : "#94a3b8",
                  }}
                >
                  {done ? "✓" : stepNum}
                </div>
                <span
                  className="text-xs mt-1 font-semibold text-center max-w-[60px] leading-tight"
                  style={{
                    color: active ? "#f97316" : done ? "#22c55e" : "#94a3b8",
                  }}
                >
                  {label}
                </span>
              </div>
              {i < total - 1 && (
                <div
                  className="w-8 h-0.5 mb-4 mx-1 rounded"
                  style={{ backgroundColor: done ? "#22c55e" : "#e2e8f0" }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function NavButtons({
  onBack,
  onNext,
  nextLabel = "Continuer →",
  disabled = false,
  backLabel = "← Retour",
}: {
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  disabled?: boolean;
  backLabel?: string;
}) {
  return (
    <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
      {onBack ? (
        <button
          onClick={onBack}
          className="px-4 py-2.5 rounded-2xl text-sm font-bold border-2 transition"
          style={{ borderColor: "#e2e8f0", color: "#64748b" }}
        >
          {backLabel}
        </button>
      ) : (
        <div />
      )}
      {onNext && (
        <button
          onClick={onNext}
          disabled={disabled}
          className="px-6 py-2.5 rounded-2xl text-sm font-extrabold text-white shadow transition"
          style={{
            background: disabled
              ? "#e2e8f0"
              : "linear-gradient(135deg,#f97316,#fb923c)",
            color: disabled ? "#94a3b8" : "#fff",
            cursor: disabled ? "not-allowed" : "pointer",
          }}
        >
          {nextLabel}
        </button>
      )}
    </div>
  );
}

function LocataireCard({ loc }: { loc: Locataire }) {
  return (
    <div
      className="p-4 rounded-2xl border"
      style={{ backgroundColor: "#f8fafc", borderColor: "#e2e8f0" }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-extrabold flex-shrink-0"
          style={{ backgroundColor: "#eff6ff", color: "#3b82f6" }}
        >
          {loc.prenom[0]}
          {loc.nom[0]}
        </div>
        <div>
          <p className="font-extrabold text-sm" style={{ color: "#1e293b" }}>
            {loc.prenom} {loc.nom}
          </p>
          <p className="text-xs" style={{ color: "#94a3b8" }}>
            {loc.email} · {loc.telephone}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <InfoRow label="Profession" value={loc.profession} />
        <InfoRow label="Situation" value={loc.situationPro} />
        <InfoRow label="Assureur" value={loc.assureur} />
        <InfoRow label="Validité assurance" value={loc.dateValiditeAssurance} />
      </div>
      {loc.garants.length > 0 && (
        <div className="mt-3 pt-3 border-t" style={{ borderColor: "#e2e8f0" }}>
          <p className="text-xs font-bold mb-2" style={{ color: "#f97316" }}>
            🛡 Garant(s)
          </p>
          {loc.garants.map((g) => (
            <div
              key={g.id}
              className="flex items-center justify-between text-xs py-1"
            >
              <span className="font-semibold" style={{ color: "#1e293b" }}>
                {g.prenom} {g.nom}
              </span>
              <span style={{ color: "#94a3b8" }}>
                {g.typeGarantie} · {g.revenus.toLocaleString()} €/mois
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
// ============================================================
// WIZARD DE CRÉATION
// ============================================================
const STEPS = [
  "Bien",
  "Locataire",
  "Occupation",
  "Bail",
  "Paiement",
  "Révision",
  "Clauses",
  "Signature",
];

function NouveauBailWizard({
  onRetour,
  onSave,
}: {
  onRetour: () => void;
  onSave: (bail: BailData) => void;
}) {
  const [step, setStep] = useState(1);

  // Form state
  const [bienId, setBienId] = useState("");
  const [locId, setLocId] = useState("");
  const [typeOccupation, setTypeOccupation] =
    useState<TypeOccupation>("individuelle");
  const [colocIds, setColocIds] = useState<string[]>([]);
  const [clauseSolidarite, setClauseSolidarite] = useState(false);
  const [typeBail, setTypeBail] = useState<TypeBail>("vide");
  const [dateSignature, setDateSignature] = useState("");
  const [datePriseEffet, setDatePriseEffet] = useState("");
  const [duree, setDuree] = useState(36);
  const [dateFin, setDateFin] = useState("");
  const [dateExigibilite, setDateExigibilite] = useState("1");
  const [modePaiement, setModePaiement] = useState("virement");
  const [coordsBancaires, setCoordsBancaires] = useState(false);
  const [depotGarantie, setDepotGarantie] = useState(true);
  const [montantDepot, setMontantDepot] = useState(0);
  const [dateVersement, setDateVersement] = useState("");
  const [loyerRevisable, setLoyerRevisable] = useState(true);
  const [trimestreRef, setTrimestreRef] = useState("1");
  const [anneeRef, setAnneeRef] = useState("2024");
  const [dateAnniversaire, setDateAnniversaire] = useState("");
  const [clauses, setClauses] = useState("");
  const [modeSignature, setModeSignature] =
    useState<TypeSignature>("electronique");

  const bien = mockBiens.find((b) => b.id === bienId);
  const locataire = mockLocataires.find((l) => l.id === locId);
  const colocataires = mockLocataires.filter((l) => colocIds.includes(l.id));

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length));
  const back = () => setStep((s) => Math.max(s - 1, 1));

  const canNext = () => {
    if (step === 1) return !!bienId;
    if (step === 2) return !!locId;
    if (step === 4) return !!typeBail && !!datePriseEffet;
    return true;
  };

  const handleSave = () => {
    const bail: BailData = {
      id: `bail-${Date.now()}`,
      bienId,
      locatairePrincipalId: locId,
      colocataireIds: colocIds,
      typeOccupation,
      clauseSolidarite,
      typeBail,
      dateSignature,
      datePriseEffet,
      duree,
      dateFin,
      dateExigibilite,
      modePaiement,
      coordsBancairesVisibles: coordsBancaires,
      depotGarantie,
      montantDepot,
      dateVersementDepot: dateVersement,
      loyerRevisable,
      trimestreRef,
      anneeRef,
      dateAnniversaireRevision: dateAnniversaire,
      clausesParticulieres: clauses,
      modeSignature,
      statut: "brouillon",
    };
    onSave(bail);
  };

  return (
    <div
      className={`${inter.className} min-h-screen`}
      style={{ backgroundColor: "#f8fafc" }}
    >
      {/* Header */}
      <div
        className="px-4 sm:px-6 py-5"
        style={{ background: "linear-gradient(135deg,#fff7ed,#fff)" }}
      >
        <div className="max-w-2xl mx-auto">
          <div
            className="flex items-center gap-2 text-xs font-bold mb-3"
            style={{ color: "#94a3b8" }}
          >
            <button
              onClick={onRetour}
              className="hover:underline"
              style={{ color: "#f97316" }}
            >
              ← Baux
            </button>
            <span>›</span>
            <span style={{ color: "#1e293b" }}>Nouveau bail</span>
          </div>
          <h1 className="text-xl font-black mb-4" style={{ color: "#1e293b" }}>
            ✍️ Créer un bail
          </h1>
          <StepIndicator current={step} total={STEPS.length} labels={STEPS} />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
        {/* STEP 1 – Sélection du bien */}
        {step === 1 && (
          <SectionCard>
            <SectionTitle
              emoji="🏠"
              title="Sélection du bien"
              subtitle="Choisissez le bien concerné par ce bail"
            />
            <div className="space-y-3 mb-4">
              {mockBiens.map((b) => (
                <button
                  key={b.id}
                  onClick={() => setBienId(b.id)}
                  className="w-full text-left p-4 rounded-2xl border-2 transition"
                  style={{
                    borderColor: bienId === b.id ? "#f97316" : "#e2e8f0",
                    backgroundColor: bienId === b.id ? "#fff7ed" : "#f8fafc",
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p
                        className="font-extrabold text-sm"
                        style={{ color: "#1e293b" }}
                      >
                        {b.nom}
                      </p>
                      <p
                        className="text-xs mt-0.5"
                        style={{ color: "#94a3b8" }}
                      >
                        {b.adresse}, {b.codePostal} {b.ville}
                      </p>
                      <p className="text-xs mt-1" style={{ color: "#64748b" }}>
                        {b.type} · {b.surface} m² · {b.nbPieces} pièces
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p
                        className="font-extrabold text-sm"
                        style={{ color: "#f97316" }}
                      >
                        {b.loyer} €
                        <span className="font-normal text-xs">/mois</span>
                      </p>
                      <p className="text-xs" style={{ color: "#94a3b8" }}>
                        + {b.charges} € charges
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {bien && (
              <div
                className="p-4 rounded-2xl mt-2"
                style={{
                  backgroundColor: "#fff7ed",
                  border: "1px solid #fed7aa",
                }}
              >
                <p
                  className="text-xs font-extrabold mb-3"
                  style={{ color: "#f97316" }}
                >
                  ✅ Données récupérées automatiquement
                </p>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <InfoRow label="Bailleur" value={bien.bailleurNom} />
                  <InfoRow
                    label="Type"
                    value={
                      bien.bailleurType === "physique"
                        ? "Personne physique"
                        : "Personne morale"
                    }
                  />
                  <InfoRow label="DPE" value={`Classe ${bien.dpe}`} />
                  <InfoRow
                    label="Total loyer"
                    value={`${bien.loyer + bien.charges} €/mois`}
                  />
                </div>
                <p
                  className="text-xs font-bold mb-1"
                  style={{ color: "#64748b" }}
                >
                  Documents annexés :
                </p>
                <div className="flex flex-wrap gap-1">
                  {bien.documents.map((doc) => (
                    <span
                      key={doc}
                      className="px-2 py-0.5 rounded-full text-xs font-semibold"
                      style={{ backgroundColor: "#e0f2fe", color: "#0369a1" }}
                    >
                      {doc}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <NavButtons
              onBack={onRetour}
              backLabel="← Annuler"
              onNext={next}
              disabled={!canNext()}
            />
          </SectionCard>
        )}

        {/* STEP 2 – Locataire principal */}
        {step === 2 && (
          <SectionCard>
            <SectionTitle
              emoji="👤"
              title="Locataire principal"
              subtitle="Sélectionnez parmi vos locataires existants"
            />
            <div className="space-y-3 mb-4">
              {mockLocataires.map((l) => (
                <button
                  key={l.id}
                  onClick={() => setLocId(l.id)}
                  className="w-full text-left p-4 rounded-2xl border-2 transition"
                  style={{
                    borderColor: locId === l.id ? "#f97316" : "#e2e8f0",
                    backgroundColor: locId === l.id ? "#fff7ed" : "#f8fafc",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-extrabold flex-shrink-0"
                      style={{
                        backgroundColor: locId === l.id ? "#f97316" : "#e2e8f0",
                        color: locId === l.id ? "#fff" : "#64748b",
                      }}
                    >
                      {l.prenom[0]}
                      {l.nom[0]}
                    </div>
                    <div>
                      <p
                        className="font-extrabold text-sm"
                        style={{ color: "#1e293b" }}
                      >
                        {l.prenom} {l.nom}
                      </p>
                      <p className="text-xs" style={{ color: "#94a3b8" }}>
                        {l.profession} · {l.situationPro}
                      </p>
                    </div>
                    <div className="ml-auto text-right">
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: "#f0fdf4", color: "#22c55e" }}
                      >
                        {l.garants.length} garant(s)
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {locataire && (
              <div className="mt-2">
                <p
                  className="text-xs font-extrabold mb-2"
                  style={{ color: "#f97316" }}
                >
                  ✅ Données récupérées
                </p>
                <LocataireCard loc={locataire} />
              </div>
            )}
            <NavButtons onBack={back} onNext={next} disabled={!canNext()} />
          </SectionCard>
        )}

        {/* STEP 3 – Type d'occupation */}
        {step === 3 && (
          <SectionCard>
            <SectionTitle emoji="🏘" title="Type d'occupation" />
            <div className="grid grid-cols-2 gap-3 mb-6">
              {(["individuelle", "colocation"] as TypeOccupation[]).map(
                (type) => (
                  <button
                    key={type}
                    onClick={() => setTypeOccupation(type)}
                    className="p-5 rounded-2xl border-2 text-center transition"
                    style={{
                      borderColor:
                        typeOccupation === type ? "#f97316" : "#e2e8f0",
                      backgroundColor:
                        typeOccupation === type ? "#fff7ed" : "#f8fafc",
                    }}
                  >
                    <div className="text-2xl mb-2">
                      {type === "individuelle" ? "👤" : "👥"}
                    </div>
                    <p
                      className="font-extrabold text-sm"
                      style={{ color: "#1e293b" }}
                    >
                      {type === "individuelle"
                        ? "Location individuelle"
                        : "Colocation"}
                    </p>
                  </button>
                ),
              )}
            </div>

            {typeOccupation === "colocation" && (
              <div>
                <p
                  className="text-xs font-extrabold uppercase tracking-wide mb-3"
                  style={{ color: "#94a3b8" }}
                >
                  👥 Colocataires
                </p>
                <div className="space-y-3 mb-3">
                  {colocIds.map((cid, idx) => {
                    const coloc = mockLocataires.find((l) => l.id === cid)!;
                    return (
                      <div
                        key={cid}
                        className="flex items-center gap-3 p-3 rounded-2xl border"
                        style={{
                          borderColor: "#e2e8f0",
                          backgroundColor: "#f8fafc",
                        }}
                      >
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-extrabold"
                          style={{
                            backgroundColor: "#eff6ff",
                            color: "#3b82f6",
                          }}
                        >
                          {coloc.prenom[0]}
                          {coloc.nom[0]}
                        </div>
                        <div className="flex-1">
                          <p
                            className="text-sm font-bold"
                            style={{ color: "#1e293b" }}
                          >
                            {coloc.prenom} {coloc.nom}
                          </p>
                          <p className="text-xs" style={{ color: "#94a3b8" }}>
                            {coloc.profession}
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            setColocIds((p) => p.filter((x) => x !== cid))
                          }
                          className="text-red-400 hover:text-red-600 text-lg font-bold"
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}
                </div>

                <div className="mb-4">
                  <select
                    className="w-full p-3 rounded-2xl border-2 text-sm"
                    style={{ borderColor: "#e2e8f0" }}
                    value=""
                    onChange={(e) => {
                      if (
                        e.target.value &&
                        !colocIds.includes(e.target.value) &&
                        e.target.value !== locId
                      ) {
                        setColocIds((p) => [...p, e.target.value]);
                      }
                    }}
                  >
                    <option value="">+ Ajouter un colocataire...</option>
                    {mockLocataires
                      .filter((l) => l.id !== locId && !colocIds.includes(l.id))
                      .map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.prenom} {l.nom}
                        </option>
                      ))}
                  </select>
                </div>

                <div
                  className="p-4 rounded-2xl border-2"
                  style={{ borderColor: "#e2e8f0" }}
                >
                  <p
                    className="text-sm font-bold mb-3"
                    style={{ color: "#1e293b" }}
                  >
                    Clause de solidarité ?
                  </p>
                  <div className="flex gap-3">
                    {[true, false].map((val) => (
                      <button
                        key={String(val)}
                        onClick={() => setClauseSolidarite(val)}
                        className="flex-1 py-2.5 rounded-xl text-sm font-bold border-2 transition"
                        style={{
                          borderColor:
                            clauseSolidarite === val ? "#f97316" : "#e2e8f0",
                          backgroundColor:
                            clauseSolidarite === val ? "#fff7ed" : "#f8fafc",
                          color:
                            clauseSolidarite === val ? "#f97316" : "#64748b",
                        }}
                      >
                        {val ? "✅ Oui" : "❌ Non"}
                      </button>
                    ))}
                  </div>
                  {clauseSolidarite && (
                    <p className="text-xs mt-2" style={{ color: "#94a3b8" }}>
                      La clause de solidarité sera automatiquement intégrée au
                      bail.
                    </p>
                  )}
                </div>
              </div>
            )}
            <NavButtons onBack={back} onNext={next} />
          </SectionCard>
        )}

        {/* STEP 4 – Type de bail & dates */}
        {step === 4 && (
          <SectionCard>
            <SectionTitle emoji="📄" title="Type de bail & dates" />

            <div className="grid grid-cols-2 gap-3 mb-6">
              {typesBail.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTypeBail(t.id)}
                  className="p-4 rounded-2xl border-2 text-left transition"
                  style={{
                    borderColor: typeBail === t.id ? "#f97316" : "#e2e8f0",
                    backgroundColor: typeBail === t.id ? "#fff7ed" : "#f8fafc",
                  }}
                >
                  <p
                    className="font-extrabold text-sm"
                    style={{ color: "#1e293b" }}
                  >
                    {t.label}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>
                    {t.desc}
                  </p>
                  <p
                    className="text-xs mt-1 font-bold"
                    style={{ color: "#f97316" }}
                  >
                    Durée : {t.duree}
                  </p>
                </button>
              ))}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {[
                {
                  label: "Date de signature",
                  val: dateSignature,
                  set: setDateSignature,
                },
                {
                  label: "Date de prise d'effet *",
                  val: datePriseEffet,
                  set: setDatePriseEffet,
                },
                { label: "Date de fin", val: dateFin, set: setDateFin },
              ].map(({ label, val, set }) => (
                <div key={label}>
                  <label
                    className="text-xs font-bold block mb-1"
                    style={{ color: "#64748b" }}
                  >
                    {label}
                  </label>
                  <input
                    type="date"
                    value={val}
                    onChange={(e) => set(e.target.value)}
                    className="w-full p-3 rounded-2xl border-2 text-sm outline-none"
                    style={{ borderColor: "#e2e8f0" }}
                  />
                </div>
              ))}
              <div>
                <label
                  className="text-xs font-bold block mb-1"
                  style={{ color: "#64748b" }}
                >
                  Durée (mois)
                </label>
                <input
                  type="number"
                  value={duree}
                  onChange={(e) => setDuree(Number(e.target.value))}
                  className="w-full p-3 rounded-2xl border-2 text-sm outline-none"
                  style={{ borderColor: "#e2e8f0" }}
                />
              </div>
            </div>
            <NavButtons onBack={back} onNext={next} disabled={!canNext()} />
          </SectionCard>
        )}

        {/* STEP 5 – Paiement & dépôt */}
        {step === 5 && (
          <SectionCard>
            <SectionTitle emoji="💶" title="Modalités de paiement" />

            <div className="space-y-4">
              <div>
                <label
                  className="text-xs font-bold block mb-2"
                  style={{ color: "#64748b" }}
                >
                  Date d'exigibilité du loyer
                </label>
                <div className="flex flex-wrap gap-2">
                  {["1", "5", "10", "15", "Autre"].map((d) => (
                    <button
                      key={d}
                      onClick={() => setDateExigibilite(d)}
                      className="px-4 py-2 rounded-xl text-sm font-bold border-2 transition"
                      style={{
                        borderColor:
                          dateExigibilite === d ? "#f97316" : "#e2e8f0",
                        backgroundColor:
                          dateExigibilite === d ? "#fff7ed" : "#f8fafc",
                        color: dateExigibilite === d ? "#f97316" : "#64748b",
                      }}
                    >
                      {d === "Autre" ? d : `${d}er`}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label
                  className="text-xs font-bold block mb-2"
                  style={{ color: "#64748b" }}
                >
                  Mode de paiement
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: "virement", label: "🏦 Virement" },
                    { id: "prelevement", label: "🔄 Prélèvement" },
                    { id: "cheque", label: "📝 Chèque" },
                    { id: "especes", label: "💵 Espèces" },
                    { id: "autre", label: "Autre" },
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setModePaiement(m.id)}
                      className="px-4 py-2 rounded-xl text-sm font-bold border-2 transition"
                      style={{
                        borderColor:
                          modePaiement === m.id ? "#f97316" : "#e2e8f0",
                        backgroundColor:
                          modePaiement === m.id ? "#fff7ed" : "#f8fafc",
                        color: modePaiement === m.id ? "#f97316" : "#64748b",
                      }}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <div
                className="flex items-center justify-between p-4 rounded-2xl border-2"
                style={{ borderColor: "#e2e8f0" }}
              >
                <div>
                  <p className="text-sm font-bold" style={{ color: "#1e293b" }}>
                    Coordonnées bancaires visibles sur le bail
                  </p>
                  <p className="text-xs" style={{ color: "#94a3b8" }}>
                    IBAN / RIB apparaîtra dans le document
                  </p>
                </div>
                <button
                  onClick={() => setCoordsBancaires((p) => !p)}
                  className="w-12 h-6 rounded-full transition-colors relative"
                  style={{
                    backgroundColor: coordsBancaires ? "#f97316" : "#e2e8f0",
                  }}
                >
                  <div
                    className="w-5 h-5 bg-white rounded-full shadow absolute top-0.5 transition-all"
                    style={{ left: coordsBancaires ? "26px" : "2px" }}
                  />
                </button>
              </div>

              {/* Dépôt de garantie */}
              <div className="pt-2 border-t" style={{ borderColor: "#f1f5f9" }}>
                <p
                  className="text-xs font-extrabold uppercase tracking-wide mb-3"
                  style={{ color: "#94a3b8" }}
                >
                  🔐 Dépôt de garantie
                </p>
                <div className="flex gap-3 mb-3">
                  {[true, false].map((val) => (
                    <button
                      key={String(val)}
                      onClick={() => setDepotGarantie(val)}
                      className="flex-1 py-2.5 rounded-xl text-sm font-bold border-2 transition"
                      style={{
                        borderColor:
                          depotGarantie === val ? "#f97316" : "#e2e8f0",
                        backgroundColor:
                          depotGarantie === val ? "#fff7ed" : "#f8fafc",
                        color: depotGarantie === val ? "#f97316" : "#64748b",
                      }}
                    >
                      {val ? "✅ Oui" : "❌ Non"}
                    </button>
                  ))}
                </div>
                {depotGarantie && (
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label
                        className="text-xs font-bold block mb-1"
                        style={{ color: "#64748b" }}
                      >
                        Montant (€)
                      </label>
                      <input
                        type="number"
                        value={montantDepot}
                        onChange={(e) =>
                          setMontantDepot(Number(e.target.value))
                        }
                        className="w-full p-3 rounded-2xl border-2 text-sm outline-none"
                        style={{ borderColor: "#e2e8f0" }}
                      />
                    </div>
                    <div>
                      <label
                        className="text-xs font-bold block mb-1"
                        style={{ color: "#64748b" }}
                      >
                        Date de versement
                      </label>
                      <input
                        type="date"
                        value={dateVersement}
                        onChange={(e) => setDateVersement(e.target.value)}
                        className="w-full p-3 rounded-2xl border-2 text-sm outline-none"
                        style={{ borderColor: "#e2e8f0" }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
            <NavButtons onBack={back} onNext={next} />
          </SectionCard>
        )}

        {/* STEP 6 – Révision du loyer */}
        {step === 6 && (
          <SectionCard>
            <SectionTitle emoji="📈" title="Révision du loyer" />
            <div className="flex gap-3 mb-4">
              {[true, false].map((val) => (
                <button
                  key={String(val)}
                  onClick={() => setLoyerRevisable(val)}
                  className="flex-1 py-3 rounded-2xl text-sm font-bold border-2 transition"
                  style={{
                    borderColor: loyerRevisable === val ? "#f97316" : "#e2e8f0",
                    backgroundColor:
                      loyerRevisable === val ? "#fff7ed" : "#f8fafc",
                    color: loyerRevisable === val ? "#f97316" : "#64748b",
                  }}
                >
                  {val ? "✅ Loyer révisable" : "❌ Non révisable"}
                </button>
              ))}
            </div>

            {loyerRevisable && (
              <div className="space-y-4">
                <div
                  className="p-3 rounded-2xl"
                  style={{
                    backgroundColor: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                  }}
                >
                  <p className="text-sm font-bold" style={{ color: "#166534" }}>
                    📌 Indice de référence : IRL
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "#4ade80" }}>
                    Indice de Référence des Loyers (valeur fixe)
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      className="text-xs font-bold block mb-2"
                      style={{ color: "#64748b" }}
                    >
                      Trimestre de référence
                    </label>
                    <select
                      value={trimestreRef}
                      onChange={(e) => setTrimestreRef(e.target.value)}
                      className="w-full p-3 rounded-2xl border-2 text-sm outline-none"
                      style={{ borderColor: "#e2e8f0" }}
                    >
                      {["1", "2", "3", "4"].map((t) => (
                        <option key={t} value={t}>
                          {t === "1" ? "1er" : `${t}e`} trimestre
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label
                      className="text-xs font-bold block mb-2"
                      style={{ color: "#64748b" }}
                    >
                      Année de référence
                    </label>
                    <select
                      value={anneeRef}
                      onChange={(e) => setAnneeRef(e.target.value)}
                      className="w-full p-3 rounded-2xl border-2 text-sm outline-none"
                      style={{ borderColor: "#e2e8f0" }}
                    >
                      {["2022", "2023", "2024", "2025", "2026"].map((a) => (
                        <option key={a} value={a}>
                          {a}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label
                      className="text-xs font-bold block mb-1"
                      style={{ color: "#64748b" }}
                    >
                      Date anniversaire de révision
                    </label>
                    <input
                      type="date"
                      value={dateAnniversaire}
                      onChange={(e) => setDateAnniversaire(e.target.value)}
                      className="w-full p-3 rounded-2xl border-2 text-sm outline-none"
                      style={{ borderColor: "#e2e8f0" }}
                    />
                  </div>
                </div>
              </div>
            )}
            <NavButtons onBack={back} onNext={next} />
          </SectionCard>
        )}

        {/* STEP 7 – Clauses particulières */}
        {step === 7 && (
          <SectionCard>
            <SectionTitle
              emoji="📋"
              title="Clauses particulières"
              subtitle="Optionnel – ajoutez des clauses spécifiques à ce bail"
            />
            <textarea
              value={clauses}
              onChange={(e) => setClauses(e.target.value)}
              rows={8}
              placeholder="Ex: Le locataire est autorisé à détenir un animal de compagnie de moins de 10 kg. L'entretien du jardin est à la charge du locataire. La sous-location est interdite sans accord écrit du bailleur..."
              className="w-full p-4 rounded-2xl border-2 text-sm resize-none outline-none"
              style={{ borderColor: "#e2e8f0", color: "#1e293b" }}
            />
            <p className="text-xs mt-2" style={{ color: "#94a3b8" }}>
              Ces clauses seront intégrées telles quelles dans le bail généré.
            </p>
            <NavButtons onBack={back} onNext={next} />
          </SectionCard>
        )}

        {/* STEP 8 – Signature */}
        {step === 8 && (
          <SectionCard>
            <SectionTitle emoji="✍️" title="Mode de signature" />

            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              {[
                {
                  id: "manuelle" as TypeSignature,
                  emoji: "🖊️",
                  label: "Signature manuelle",
                  desc: "Téléchargez, signez manuellement, puis téléversez le bail signé",
                  pros: ["Gratuit", "Flexible", "Pas de tiers"],
                },
                {
                  id: "electronique" as TypeSignature,
                  emoji: "⚡",
                  label: "Signature électronique",
                  desc: "Envoyez directement depuis la plateforme via Yousign",
                  pros: [
                    "Suivi en temps réel",
                    "Valeur légale",
                    "Relances auto",
                  ],
                },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setModeSignature(opt.id)}
                  className="p-5 rounded-2xl border-2 text-left transition"
                  style={{
                    borderColor:
                      modeSignature === opt.id ? "#f97316" : "#e2e8f0",
                    backgroundColor:
                      modeSignature === opt.id ? "#fff7ed" : "#f8fafc",
                  }}
                >
                  <div className="text-3xl mb-2">{opt.emoji}</div>
                  <p
                    className="font-extrabold text-sm mb-1"
                    style={{ color: "#1e293b" }}
                  >
                    {opt.label}
                  </p>
                  <p className="text-xs mb-3" style={{ color: "#94a3b8" }}>
                    {opt.desc}
                  </p>
                  <ul className="space-y-1">
                    {opt.pros.map((p) => (
                      <li
                        key={p}
                        className="text-xs flex items-center gap-1"
                        style={{ color: "#64748b" }}
                      >
                        <span style={{ color: "#22c55e" }}>✓</span> {p}
                      </li>
                    ))}
                  </ul>
                  {modeSignature === opt.id && (
                    <div
                      className="mt-3 w-full h-0.5 rounded"
                      style={{ backgroundColor: "#f97316" }}
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Récapitulatif */}
            <div
              className="p-4 rounded-2xl mb-4"
              style={{
                backgroundColor: "#f8fafc",
                border: "1px solid #e2e8f0",
              }}
            >
              <p
                className="text-xs font-extrabold uppercase tracking-wide mb-3"
                style={{ color: "#94a3b8" }}
              >
                📋 Récapitulatif
              </p>
              <div className="space-y-2">
                {bien && (
                  <InfoRow
                    label="Bien"
                    value={`${bien.nom} – ${bien.adresse}`}
                  />
                )}
                {locataire && (
                  <InfoRow
                    label="Locataire"
                    value={`${locataire.prenom} ${locataire.nom}`}
                  />
                )}
                {colocataires.length > 0 && (
                  <InfoRow
                    label="Colocataires"
                    value={colocataires
                      .map((c) => `${c.prenom} ${c.nom}`)
                      .join(", ")}
                  />
                )}
                <InfoRow
                  label="Type de bail"
                  value={typesBail.find((t) => t.id === typeBail)?.label || ""}
                />
                {datePriseEffet && (
                  <InfoRow label="Prise d'effet" value={datePriseEffet} />
                )}
                <InfoRow
                  label="Mode de signature"
                  value={
                    modeSignature === "electronique"
                      ? "⚡ Electronique (Yousign)"
                      : "🖊️ Manuelle"
                  }
                />
              </div>
            </div>

            <NavButtons
              onBack={back}
              onNext={handleSave}
              nextLabel="✅ Générer le bail"
            />
          </SectionCard>
        )}
      </div>
    </div>
  );
}

// ============================================================
// VUE LISTE DES BAUX
// ============================================================
const mockBauxSignes: BailData[] = [
  {
    id: "bx1",
    bienId: "b1",
    locatairePrincipalId: "l1",
    colocataireIds: [],
    typeOccupation: "individuelle",
    clauseSolidarite: false,
    typeBail: "vide",
    dateSignature: "2024-01-15",
    datePriseEffet: "2024-02-01",
    duree: 36,
    dateFin: "2027-01-31",
    dateExigibilite: "1",
    modePaiement: "virement",
    coordsBancairesVisibles: true,
    depotGarantie: true,
    montantDepot: 2400,
    dateVersementDepot: "2024-01-20",
    loyerRevisable: true,
    trimestreRef: "4",
    anneeRef: "2023",
    dateAnniversaireRevision: "2025-02-01",
    clausesParticulieres: "",
    modeSignature: "electronique",
    statut: "signe",
  },
  {
    id: "bx2",
    bienId: "b2",
    locatairePrincipalId: "l3",
    colocataireIds: [],
    typeOccupation: "individuelle",
    clauseSolidarite: false,
    typeBail: "etudiant",
    dateSignature: "",
    datePriseEffet: "2024-09-01",
    duree: 9,
    dateFin: "2025-05-31",
    dateExigibilite: "5",
    modePaiement: "virement",
    coordsBancairesVisibles: false,
    depotGarantie: true,
    montantDepot: 850,
    dateVersementDepot: "2024-08-25",
    loyerRevisable: false,
    trimestreRef: "",
    anneeRef: "",
    dateAnniversaireRevision: "",
    clausesParticulieres: "",
    modeSignature: "manuelle",
    statut: "brouillon",
  },
];

function VueListeBaux({
  baux,
  onNouveauBail,
  onSelectBail,
}: {
  baux: BailData[];
  onNouveauBail: () => void;
  onSelectBail: (bail: BailData) => void;
}) {
  const [search, setSearch] = useState("");
  const [filterStatut, setFilterStatut] = useState<StatutBail | "">("");

  const filtered = baux.filter((bail) => {
    const bien = mockBiens.find((item) => item.id === bail.bienId);
    const locataire = mockLocataires.find(
      (item) => item.id === bail.locatairePrincipalId,
    );
    const query = search.trim().toLowerCase();
    const matchSearch =
      !query ||
      bien?.nom.toLowerCase().includes(query) ||
      locataire?.nom.toLowerCase().includes(query) ||
      locataire?.prenom.toLowerCase().includes(query);
    return matchSearch && (!filterStatut || bail.statut === filterStatut);
  });

  const stats = {
    total: baux.length,
    signes: baux.filter((bail) => bail.statut === "signe").length,
    signature: baux.filter((bail) =>
      ["envoye", "partiellement_signe"].includes(bail.statut),
    ).length,
    brouillons: baux.filter((bail) => bail.statut === "brouillon").length,
  };

  const filters: { id: StatutBail | ""; label: string }[] = [
    { id: "", label: "Tous" },
    { id: "signe", label: "Signés" },
    { id: "brouillon", label: "Brouillons" },
    { id: "envoye", label: "Envoyés" },
    { id: "partiellement_signe", label: "En signature" },
  ];

  return (
    <div
      className={`${inter.className} min-h-screen`}
      style={{ backgroundColor: "#f8fafc" }}
    >
      <div
        className="px-4 sm:px-6 py-5"
        style={{ background: "linear-gradient(135deg,#fff7ed,#fff)" }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex items-start justify-between gap-4 flex-wrap mb-5">
            <div>
              <h1 className="text-2xl font-black" style={{ color: "#1e293b" }}>
                📝 Baux
              </h1>
              <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>
                Créez, suivez et signez vos contrats de location.
              </p>
            </div>
            <button
              onClick={onNouveauBail}
              className="px-5 py-2.5 rounded-2xl text-white text-sm font-extrabold shadow-lg transition hover:opacity-90"
              style={{ background: "linear-gradient(135deg,#f97316,#fb923c)" }}
            >
              + Nouveau bail
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              {
                emoji: "📝",
                value: stats.total,
                label: "Baux",
                bg: "linear-gradient(135deg,#f97316,#fb923c)",
              },
              {
                emoji: "✅",
                value: stats.signes,
                label: "Signés",
                bg: "linear-gradient(135deg,#22c55e,#4ade80)",
              },
              {
                emoji: "✍️",
                value: stats.signature,
                label: "En signature",
                bg: "linear-gradient(135deg,#8b5cf6,#a78bfa)",
              },
              {
                emoji: "📄",
                value: stats.brouillons,
                label: "Brouillons",
                bg: "linear-gradient(135deg,#ef4444,#f87171)",
              },
            ].map((stat) => (
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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5">
        <div className="flex flex-col lg:flex-row gap-3 mb-5">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Rechercher un bien ou un locataire..."
            className="flex-1 px-4 py-3 rounded-2xl text-sm border outline-none"
            style={{ borderColor: "#e2e8f0", backgroundColor: "#fff" }}
          />
          <div className="flex gap-2 flex-wrap">
            {filters.map((item) => (
              <button
                key={item.id || "all"}
                onClick={() => setFilterStatut(item.id)}
                className="px-3 py-2 rounded-2xl text-xs font-bold border-2"
                style={{
                  borderColor: filterStatut === item.id ? "#f97316" : "#e2e8f0",
                  backgroundColor:
                    filterStatut === item.id ? "#fff7ed" : "#fff",
                  color: filterStatut === item.id ? "#f97316" : "#64748b",
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">📝</div>
            <p className="font-bold text-base" style={{ color: "#1e293b" }}>
              Aucun bail trouvé
            </p>
            <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>
              Créez votre premier contrat de location.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((bail) => {
              const bien = mockBiens.find((item) => item.id === bail.bienId);
              const locataire = mockLocataires.find(
                (item) => item.id === bail.locatairePrincipalId,
              );
              const total = bien ? bien.loyer + bien.charges : 0;
              return (
                <button
                  key={bail.id}
                  onClick={() => onSelectBail(bail)}
                  className="w-full bg-white rounded-3xl p-4 shadow-sm hover:shadow-md transition text-left"
                >
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl"
                        style={{
                          background: "linear-gradient(135deg,#f97316,#fb923c)",
                        }}
                      >
                        📝
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p
                            className="font-extrabold text-sm"
                            style={{ color: "#1e293b" }}
                          >
                            {bien?.nom || "Bien non renseigné"}
                          </p>
                          <StatutBadge statut={bail.statut} />
                        </div>
                        <p
                          className="text-xs mt-0.5"
                          style={{ color: "#94a3b8" }}
                        >
                          {locataire
                            ? `${locataire.prenom} ${locataire.nom}`
                            : "Locataire non renseigné"}{" "}
                          ·{" "}
                          {
                            typesBail.find((item) => item.id === bail.typeBail)
                              ?.label
                          }
                        </p>
                        <p
                          className="text-xs mt-0.5"
                          style={{ color: "#cbd5e1" }}
                        >
                          {bail.datePriseEffet
                            ? `Prise d’effet : ${bail.datePriseEffet}`
                            : "Date de prise d’effet non renseignée"}{" "}
                          ·{" "}
                          {bail.modeSignature === "electronique"
                            ? "Signature électronique"
                            : "Signature manuelle"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className="text-sm font-extrabold"
                        style={{ color: "#f97316" }}
                      >
                        {total ? `${total} €` : "—"}
                      </p>
                      <p
                        className="text-xs mt-0.5"
                        style={{ color: "#94a3b8" }}
                      >
                        {bail.dateFin
                          ? `Fin : ${bail.dateFin}`
                          : "Durée à préciser"}
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
// VUE DETAIL BAIL
// ============================================================
function VueDetailBail({
  bail,
  onBack,
  onEdit,
}: {
  bail: BailData;
  onBack: () => void;
  onEdit: () => void;
}) {
  const bien = mockBiens.find((b) => b.id === bail.bienId);
  const locataire = mockLocataires.find(
    (l) => l.id === bail.locatairePrincipalId,
  );
  const colocataires = mockLocataires.filter((l) =>
    bail.colocataireIds.includes(l.id),
  );
  const [fichierSigne, setFichierSigne] = useState<File | null>(null);
  const [marqueCommeSigné, setMarqueCommeSigne] = useState(false);

  const isModifiable = !["partiellement_signe", "signe"].includes(bail.statut);

  return (
    <div
      className={`${inter.className} min-h-screen`}
      style={{ backgroundColor: "#f8fafc" }}
    >
      {/* Header */}
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
              onClick={onBack}
              className="hover:underline"
              style={{ color: "#f97316" }}
            >
              ← Baux
            </button>
            <span>›</span>
            <span style={{ color: "#1e293b" }}>{bien?.nom}</span>
          </div>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h1 className="text-lg font-black" style={{ color: "#1e293b" }}>
                  {bien?.nom}
                </h1>
                <StatutBadge statut={bail.statut} />
              </div>
              <p className="text-xs" style={{ color: "#94a3b8" }}>
                {typesBail.find((t) => t.id === bail.typeBail)?.label} ·{" "}
                {locataire?.prenom} {locataire?.nom}
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              {isModifiable && (
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
              )}
              <button
                className="px-4 py-2 rounded-2xl text-white text-sm font-bold shadow"
                style={{
                  background: "linear-gradient(135deg,#f97316,#fb923c)",
                }}
              >
                ⬇ Télécharger PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-4">
        {/* Bien & Bailleur */}
        {bien && (
          <SectionCard>
            <SectionTitle emoji="🏠" title="Bien & Bailleur" />
            <div className="grid sm:grid-cols-2 gap-3">
              <InfoRow label="Nom du bien" value={bien.nom} />
              <InfoRow
                label="Adresse"
                value={`${bien.adresse}, ${bien.codePostal} ${bien.ville}`}
              />
              <InfoRow label="Type" value={bien.type} />
              <InfoRow
                label="Surface"
                value={`${bien.surface} m² · ${bien.nbPieces} pièces`}
              />
              <InfoRow label="Bailleur" value={bien.bailleurNom} />
              <InfoRow
                label="Type bailleur"
                value={
                  bien.bailleurType === "physique"
                    ? "Personne physique"
                    : "Personne morale"
                }
              />
              <InfoRow label="DPE" value={`Classe ${bien.dpe}`} />
              <InfoRow
                label="Loyer total"
                value={`${bien.loyer + bien.charges} €/mois`}
              />
            </div>
          </SectionCard>
        )}

        {/* Locataire principal */}
        {locataire && (
          <SectionCard>
            <SectionTitle emoji="👤" title="Locataire principal" />
            <LocataireCard loc={locataire} />
          </SectionCard>
        )}

        {/* Colocataires */}
        {colocataires.length > 0 && (
          <SectionCard>
            <SectionTitle
              emoji="👥"
              title={`Colocataires (${colocataires.length})`}
            />
            {bail.clauseSolidarite && (
              <div
                className="mb-3 px-3 py-2 rounded-xl text-xs font-bold"
                style={{ backgroundColor: "#fef3c7", color: "#92400e" }}
              >
                ⚠️ Clause de solidarité active entre colocataires
              </div>
            )}
            <div className="space-y-3">
              {colocataires.map((c) => (
                <LocataireCard key={c.id} loc={c} />
              ))}
            </div>
          </SectionCard>
        )}

        {/* Conditions financières */}
        {bien && (
          <SectionCard>
            <SectionTitle emoji="💶" title="Conditions financières" />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
              <InfoRow label="Loyer HC" value={`${bien.loyer} €`} />
              <InfoRow label="Charges" value={`${bien.charges} €`} />
              <InfoRow
                label="Total mensuel"
                value={`${bien.loyer + bien.charges} €`}
              />
              <InfoRow
                label="Date d'exigibilité"
                value={`Le ${bail.dateExigibilite} du mois`}
              />
              <InfoRow label="Mode de paiement" value={bail.modePaiement} />
              <InfoRow
                label="IBAN visible"
                value={bail.coordsBancairesVisibles ? "Oui" : "Non"}
              />
            </div>
            {bail.depotGarantie && (
              <div className="pt-3 border-t" style={{ borderColor: "#f1f5f9" }}>
                <p
                  className="text-xs font-bold mb-2"
                  style={{ color: "#64748b" }}
                >
                  🔐 Dépôt de garantie
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <InfoRow label="Montant" value={`${bail.montantDepot} €`} />
                  <InfoRow
                    label="Date de versement"
                    value={bail.dateVersementDepot || "—"}
                  />
                </div>
              </div>
            )}
          </SectionCard>
        )}

        {/* Dates */}
        <SectionCard>
          <SectionTitle emoji="📅" title="Dates du bail" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <InfoRow label="Prise d'effet" value={bail.datePriseEffet || "—"} />
            <InfoRow label="Durée" value={`${bail.duree} mois`} />
            <InfoRow label="Date de fin" value={bail.dateFin || "—"} />
            <InfoRow
              label="Date de signature"
              value={bail.dateSignature || "—"}
            />
          </div>
        </SectionCard>

        {/* Révision */}
        {bail.loyerRevisable && (
          <SectionCard>
            <SectionTitle emoji="📈" title="Révision du loyer" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <InfoRow label="Indice" value="IRL" />
              <InfoRow label="Trimestre" value={`T${bail.trimestreRef}`} />
              <InfoRow label="Année réf." value={bail.anneeRef} />
              <InfoRow
                label="Date anniversaire"
                value={bail.dateAnniversaireRevision || "—"}
              />
            </div>
          </SectionCard>
        )}

        {/* Clauses particulières */}
        {bail.clausesParticulieres && (
          <SectionCard>
            <SectionTitle emoji="📋" title="Clauses particulières" />
            <p
              className="text-sm leading-relaxed whitespace-pre-wrap"
              style={{ color: "#475569" }}
            >
              {bail.clausesParticulieres}
            </p>
          </SectionCard>
        )}

        {/* Signature */}
        <SectionCard>
          <SectionTitle emoji="✍️" title="Signature" />
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm font-bold" style={{ color: "#1e293b" }}>
              Mode :
            </span>
            <span
              className="px-3 py-1 rounded-full text-xs font-bold"
              style={{
                backgroundColor:
                  bail.modeSignature === "electronique" ? "#f5f3ff" : "#fff7ed",
                color:
                  bail.modeSignature === "electronique" ? "#7c3aed" : "#f97316",
              }}
            >
              {bail.modeSignature === "electronique"
                ? "⚡ Electronique (Yousign)"
                : "🖊️ Manuelle"}
            </span>
          </div>

          {/* Workflow signature manuelle */}
          {bail.modeSignature === "manuelle" && bail.statut !== "signe" && (
            <div className="space-y-4">
              <div
                className="p-4 rounded-2xl"
                style={{
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                }}
              >
                <p
                  className="text-xs font-extrabold uppercase mb-3"
                  style={{ color: "#94a3b8" }}
                >
                  Étapes de signature manuelle
                </p>
                {[
                  {
                    n: 1,
                    label: "Téléchargez le PDF généré",
                    action: "⬇ Télécharger le bail PDF",
                    done: true,
                  },
                  {
                    n: 2,
                    label: "Signez manuellement avec toutes les parties",
                    action: null,
                    done: false,
                  },
                  {
                    n: 3,
                    label: "Téléversez le bail signé",
                    action: null,
                    done: false,
                  },
                  {
                    n: 4,
                    label: "Marquez le bail comme signé",
                    action: null,
                    done: false,
                  },
                ].map((etape) => (
                  <div key={etape.n} className="flex items-start gap-3 mb-3">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-extrabold flex-shrink-0 mt-0.5"
                      style={{
                        backgroundColor: etape.done ? "#f0fdf4" : "#f1f5f9",
                        color: etape.done ? "#22c55e" : "#94a3b8",
                      }}
                    >
                      {etape.n}
                    </div>
                    <div className="flex-1">
                      <p
                        className="text-sm font-semibold"
                        style={{ color: "#475569" }}
                      >
                        {etape.label}
                      </p>
                      {etape.action && (
                        <button
                          className="mt-1 px-3 py-1.5 rounded-xl text-xs font-bold text-white"
                          style={{
                            background:
                              "linear-gradient(135deg,#f97316,#fb923c)",
                          }}
                        >
                          {etape.action}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Upload */}
              <div>
                <p
                  className="text-xs font-bold mb-2"
                  style={{ color: "#64748b" }}
                >
                  📎 Téléverser le bail signé
                </p>
                <label
                  className="flex flex-col items-center justify-center w-full p-6 rounded-2xl border-2 border-dashed cursor-pointer transition hover:border-orange-300"
                  style={{ borderColor: "#e2e8f0", backgroundColor: "#f8fafc" }}
                >
                  <span className="text-2xl mb-2">📄</span>
                  <span
                    className="text-sm font-bold"
                    style={{ color: "#475569" }}
                  >
                    {fichierSigne
                      ? fichierSigne.name
                      : "Cliquez pour sélectionner le PDF signé"}
                  </span>
                  <span className="text-xs mt-1" style={{ color: "#94a3b8" }}>
                    PDF uniquement
                  </span>
                  <input
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={(e) =>
                      setFichierSigne(e.target.files?.[0] || null)
                    }
                  />
                </label>
              </div>

              {fichierSigne && !marqueCommeSigné && (
                <button
                  onClick={() => setMarqueCommeSigne(true)}
                  className="w-full py-3 rounded-2xl text-white font-extrabold text-sm shadow"
                  style={{
                    background: "linear-gradient(135deg,#22c55e,#4ade80)",
                  }}
                >
                  ✅ Marquer le bail comme signé
                </button>
              )}

              {marqueCommeSigné && (
                <div
                  className="p-4 rounded-2xl text-center"
                  style={{
                    backgroundColor: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                  }}
                >
                  <p
                    className="text-sm font-extrabold"
                    style={{ color: "#166534" }}
                  >
                    ✅ Bail marqué comme signé !
                  </p>
                  <p className="text-xs mt-1" style={{ color: "#4ade80" }}>
                    Le contrat de location va être créé automatiquement.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Signature électronique */}
          {bail.modeSignature === "electronique" && bail.statut !== "signe" && (
            <div className="space-y-3">
              <div
                className="p-4 rounded-2xl"
                style={{
                  backgroundColor: "#f5f3ff",
                  border: "1px solid #ddd6fe",
                }}
              >
                <p
                  className="text-xs font-extrabold mb-2"
                  style={{ color: "#7c3aed" }}
                >
                  ⚡ Yousign – Suivi des signatures
                </p>
                <div className="space-y-2">
                  {[
                    {
                      nom: bien?.bailleurNom || "Bailleur",
                      role: "Bailleur",
                      signe: true,
                    },
                    {
                      nom: `${locataire?.prenom} ${locataire?.nom}`,
                      role: "Locataire principal",
                      signe: false,
                    },
                    ...colocataires.map((c) => ({
                      nom: `${c.prenom} ${c.nom}`,
                      role: "Colocataire",
                      signe: false,
                    })),
                  ].map((sig, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2 bg-white rounded-xl"
                    >
                      <div>
                        <p
                          className="text-xs font-bold"
                          style={{ color: "#1e293b" }}
                        >
                          {sig.nom}
                        </p>
                        <p className="text-xs" style={{ color: "#94a3b8" }}>
                          {sig.role}
                        </p>
                      </div>
                      <span
                        className="text-xs font-bold px-2 py-1 rounded-full"
                        style={{
                          backgroundColor: sig.signe ? "#f0fdf4" : "#fef9c3",
                          color: sig.signe ? "#16a34a" : "#854d0e",
                        }}
                      >
                        {sig.signe ? "✅ Signé" : "⏳ En attente"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <button
                className="w-full py-2.5 rounded-2xl text-xs font-bold border-2 transition"
                style={{ borderColor: "#7c3aed", color: "#7c3aed" }}
              >
                🔁 Envoyer une relance
              </button>
            </div>
          )}

          {/* Signé */}
          {bail.statut === "signe" && (
            <div
              className="p-4 rounded-2xl"
              style={{
                backgroundColor: "#f0fdf4",
                border: "1px solid #bbf7d0",
              }}
            >
              <p
                className="text-sm font-extrabold mb-1"
                style={{ color: "#166534" }}
              >
                ✅ Bail signé et archivé
              </p>
              <p className="text-xs" style={{ color: "#4ade80" }}>
                Le contrat de location a été créé automatiquement et rattaché au
                bien et aux locataires.
              </p>
            </div>
          )}
        </SectionCard>

        {/* Documents annexés */}
        {bien && bien.documents.length > 0 && (
          <SectionCard>
            <SectionTitle emoji="📎" title="Documents annexés" />
            <div className="flex flex-wrap gap-2">
              {bien.documents.map((doc) => (
                <div
                  key={doc}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer hover:opacity-80 transition"
                  style={{ backgroundColor: "#eff6ff", color: "#1d4ed8" }}
                >
                  📄 {doc}
                </div>
              ))}
            </div>
          </SectionCard>
        )}
      </div>
    </div>
  );
}

// ============================================================
// MODULE PRINCIPAL
// ============================================================
export default function ModuleBaux() {
  type View =
    | { name: "liste" }
    | { name: "nouveau" }
    | { name: "detail"; bail: BailData }
    | { name: "edit"; bail: BailData };

  const [view, setView] = useState<View>({ name: "liste" });
  const [baux, setBaux] = useState<BailData[]>(mockBauxSignes);

  const handleSave = (bail: BailData) => {
    setBaux((prev) => {
      const exists = prev.find((b) => b.id === bail.id);
      return exists
        ? prev.map((b) => (b.id === bail.id ? bail : b))
        : [...prev, bail];
    });
    setView({ name: "liste" });
  };

  if (view.name === "nouveau") {
    return (
      <NouveauBailWizard
        onRetour={() => setView({ name: "liste" })}
        onSave={handleSave}
      />
    );
  }

  if (view.name === "detail") {
    return (
      <VueDetailBail
        bail={view.bail}
        onBack={() => setView({ name: "liste" })}
        onEdit={() => setView({ name: "edit", bail: view.bail })}
      />
    );
  }

  if (view.name === "edit") {
    return (
      <NouveauBailWizard
        onRetour={() => setView({ name: "detail", bail: view.bail })}
        onSave={handleSave}
      />
    );
  }

  return (
    <VueListeBaux
      baux={baux}
      onNouveauBail={() => setView({ name: "nouveau" })}
      onSelectBail={(bail) => setView({ name: "detail", bail })}
    />
  );
}
