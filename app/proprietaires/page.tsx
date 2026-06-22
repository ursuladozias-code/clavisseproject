"use client";

import { Inter } from "next/font/google";
import { useMemo, useState } from "react";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

// ============================================================
// TYPES & INTERFACES
// ============================================================
type TypeProprietaire = "personne_physique" | "personne_morale";
type StatutProprietaire = "actif" | "archive";
type Civilite = "Monsieur" | "Madame";

type TypeActifAssocie =
  | "bien_individuel"
  | "immeuble_rapport"
  | "lot_immeuble";

type StatutActifAssocie = "vacant" | "occupe" | "archive";

interface HistoriqueItem {
  id: string;
  date: string;
  heure: string;
  utilisateur: string;
  champ: string;
  ancienneValeur: string;
  nouvelleValeur: string;
}

interface DocumentProprietaire {
  id: string;
  nom: string;
  obligatoire?: boolean;
  fichier?: File | null;
  dateAjout?: string;
}

interface Adresse {
  numeroVoie: string;
  typeVoie: string;
  nomVoie: string;
  complementAdresse?: string;
  codePostal: string;
  ville: string;
  departement: string;
  region: string;
  pays: string;
}

interface BienAssocie {
  id: string;
  proprietaireId: string;
  reference: string;
  nom: string;
  typeActif: TypeActifAssocie;
  adresse: string;
  statut: StatutActifAssocie;
}

interface BaseProprietaire {
  id: string;
  reference: string;
  typeProprietaire: TypeProprietaire;
  statut: StatutProprietaire;
  adresse: Adresse;
  telephonePrincipal: string;
  telephoneSecondaire?: string;
  email: string;
  documents: DocumentProprietaire[];
  historique: HistoriqueItem[];
  createdAt: string;
  updatedAt: string;
}

interface ProprietairePersonnePhysique extends BaseProprietaire {
  typeProprietaire: "personne_physique";
  civilite: Civilite;
  nom: string;
  prenom: string;
  dateNaissance: string;
  nationalite: string;
  numeroFiscal: string;
  residentFiscalFrancais: boolean;
  paysResidenceFiscale?: string;
}

interface ProprietairePersonneMorale extends BaseProprietaire {
  typeProprietaire: "personne_morale";
  raisonSociale: string;
  formeJuridique:
    | "SCI"
    | "SARL"
    | "EURL"
    | "SAS"
    | "SASU"
    | "SA"
    | "Association"
    | "Autre";
  siren: string;
  siret: string;
  villeImmatriculation?: string;
  capitalSocial?: number;
  dateCreation?: string;
  representantLegal: {
    civilite: Civilite;
    nom: string;
    prenom: string;
    fonction: string;
    telephone: string;
    email: string;
  };
}

type Proprietaire =
  | ProprietairePersonnePhysique
  | ProprietairePersonneMorale;

type ViewState =
  | { name: "liste" }
  | { name: "choix" }
  | { name: "creation_physique" }
  | { name: "creation_morale" }
  | { name: "detail"; proprietaire: Proprietaire }
  | { name: "edition"; proprietaire: Proprietaire };

// ============================================================
// MOCK ABONNEMENT
// ============================================================
const mockAbonnement = {
  nom: "Offre 3 biens",
  limiteBiens: 3,
  illimite: false,
};

// ============================================================
// MOCK BIENS ASSOCIÉS
// ============================================================
const mockBiensAssocies: BienAssocie[] = [
  {
    id: "bi001",
    proprietaireId: "pro001",
    reference: "BI-000001",
    nom: "Appartement T3 Centre-ville",
    typeActif: "bien_individuel",
    adresse: "12 Rue Victor Hugo, 69001 Lyon",
    statut: "occupe",
  },
  {
    id: "im001",
    proprietaireId: "pro002",
    reference: "IMR-000001",
    nom: "Immeuble Les Lilas",
    typeActif: "immeuble_rapport",
    adresse: "8 Avenue Jean Jaurès, 69007 Lyon",
    statut: "occupe",
  },
  {
    id: "lot001",
    proprietaireId: "pro002",
    reference: "LOT-000001",
    nom: "Appartement 1A",
    typeActif: "lot_immeuble",
    adresse: "8 Avenue Jean Jaurès, 69007 Lyon",
    statut: "occupe",
  },
];

// ============================================================
// MOCK PROPRIÉTAIRES
// ============================================================
const mockProprietaires: Proprietaire[] = [
  {
    id: "pro001",
    reference: "PRO-000001",
    typeProprietaire: "personne_physique",
    statut: "actif",
    civilite: "Monsieur",
    nom: "Dupont",
    prenom: "Jean",
    dateNaissance: "1975-06-15",
    nationalite: "Française",
    numeroFiscal: "1 75 06 75 123 456 78",
    residentFiscalFrancais: true,
    adresse: {
      numeroVoie: "12",
      typeVoie: "Rue",
      nomVoie: "Victor Hugo",
      complementAdresse: "",
      codePostal: "69001",
      ville: "Lyon",
      departement: "Rhône",
      region: "Auvergne-Rhône-Alpes",
      pays: "France",
    },
    telephonePrincipal: "0612345678",
    telephoneSecondaire: "",
    email: "jean.dupont@email.com",
    documents: [
      {
        id: "doc001",
        nom: "Pièce d'identité",
        obligatoire: true,
        dateAjout: "2026-01-10",
      },
    ],
    historique: [],
    createdAt: "2026-01-10",
    updatedAt: "2026-01-10",
  },
  {
    id: "pro002",
    reference: "PRO-000002",
    typeProprietaire: "personne_morale",
    statut: "actif",
    raisonSociale: "SCI Les Lilas",
    formeJuridique: "SCI",
    siren: "123456789",
    siret: "12345678900012",
    villeImmatriculation: "Lyon",
    capitalSocial: 1000,
    dateCreation: "2020-09-01",
    adresse: {
      numeroVoie: "8",
      typeVoie: "Avenue",
      nomVoie: "Jean Jaurès",
      complementAdresse: "",
      codePostal: "69007",
      ville: "Lyon",
      departement: "Rhône",
      region: "Auvergne-Rhône-Alpes",
      pays: "France",
    },
    telephonePrincipal: "0478000000",
    telephoneSecondaire: "",
    email: "contact@sci-les-lilas.fr",
    representantLegal: {
      civilite: "Madame",
      nom: "Laurent",
      prenom: "Sophie",
      fonction: "Gérante",
      telephone: "0611111111",
      email: "sophie.laurent@email.com",
    },
    documents: [
      {
        id: "doc002",
        nom: "Extrait Kbis",
        obligatoire: true,
        dateAjout: "2026-01-15",
      },
    ],
    historique: [],
    createdAt: "2026-01-15",
    updatedAt: "2026-01-15",
  },
];

// ============================================================
// HELPERS
// ============================================================
function generateReferenceProprietaire(count: number) {
  return `PRO-${String(count + 1).padStart(6, "0")}`;
}

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function getNowTime() {
  return new Date().toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getNomAffichage(proprietaire: Proprietaire) {
  if (proprietaire.typeProprietaire === "personne_physique") {
    return `${proprietaire.prenom} ${proprietaire.nom}`;
  }
  return proprietaire.raisonSociale;
}

function getAdresseComplete(adresse: Adresse) {
  return `${adresse.numeroVoie} ${adresse.typeVoie} ${adresse.nomVoie}, ${adresse.codePostal} ${adresse.ville}`;
}

function getTypeProprietaireLabel(type: TypeProprietaire) {
  return type === "personne_physique" ? "Personne physique" : "Personne morale";
}

function getTypeActifLabel(type: TypeActifAssocie) {
  const labels: Record<TypeActifAssocie, string> = {
    bien_individuel: "Bien individuel",
    immeuble_rapport: "Immeuble de rapport",
    lot_immeuble: "Lot locatif",
  };
  return labels[type];
}
// ============================================================
// COMPOSANTS UI PARTAGÉS
// ============================================================
function SectionCard({ children }: { children: React.ReactNode }) {
    return <div className="bg-white rounded-3xl p-5 shadow-sm">{children}</div>;
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
          {value || "—"}
        </p>
      </div>
    );
  }
  
  function FormInput({
    label,
    value,
    onChange,
    type = "text",
    required = false,
    readOnly = false,
    placeholder = "",
    disabled = false,
  }: {
    label: string;
    value: string | number;
    onChange?: (value: string) => void;
    type?: string;
    required?: boolean;
    readOnly?: boolean;
    placeholder?: string;
    disabled?: boolean;
  }) {
    return (
      <div>
        <label
          className="block text-xs font-bold mb-1"
          style={{ color: "#64748b" }}
        >
          {label}
          {required && <span style={{ color: "#f97316" }}> *</span>}
        </label>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          readOnly={readOnly}
          disabled={disabled}
          placeholder={placeholder}
          className="w-full px-4 py-2.5 rounded-2xl text-sm border outline-none transition"
          style={{
            borderColor: "#e2e8f0",
            backgroundColor: readOnly || disabled ? "#f8fafc" : "#fff",
            color: readOnly || disabled ? "#94a3b8" : "#1e293b",
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
    disabled = false,
  }: {
    label: string;
    value: string;
    onChange?: (value: string) => void;
    options: { value: string; label: string }[];
    required?: boolean;
    disabled?: boolean;
  }) {
    return (
      <div>
        <label
          className="block text-xs font-bold mb-1"
          style={{ color: "#64748b" }}
        >
          {label}
          {required && <span style={{ color: "#f97316" }}> *</span>}
        </label>
        <select
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={disabled}
          className="w-full px-4 py-2.5 rounded-2xl text-sm border outline-none transition"
          style={{
            borderColor: "#e2e8f0",
            backgroundColor: disabled ? "#f8fafc" : "#fff",
            color: disabled ? "#94a3b8" : "#1e293b",
          }}
        >
          <option value="">— Sélectionner —</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    );
  }
  
  function StatutBadge({ statut }: { statut: StatutProprietaire }) {
    const cfg: Record<
      StatutProprietaire,
      { label: string; bg: string; color: string }
    > = {
      actif: { label: "Actif", bg: "#dcfce7", color: "#166534" },
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
  
  function StatutActifBadge({ statut }: { statut: StatutActifAssocie }) {
    const cfg: Record<
      StatutActifAssocie,
      { label: string; bg: string; color: string }
    > = {
      occupe: { label: "Occupé", bg: "#dcfce7", color: "#166534" },
      vacant: { label: "Vacant", bg: "#fef3c7", color: "#92400e" },
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
  
  // ============================================================
  // COMPOSANT ADRESSE (partagé entre wizards)
  // ============================================================
  function AdresseForm({
    adresse,
    onChange,
    locked = false,
  }: {
    adresse: Adresse;
    onChange: (adresse: Adresse) => void;
    locked?: boolean;
  }) {
    const update = (field: keyof Adresse, value: string) => {
      onChange({ ...adresse, [field]: value });
    };
  
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormInput
          label="Numéro de voie"
          value={adresse.numeroVoie}
          onChange={(v) => update("numeroVoie", v)}
          readOnly={locked}
          required
        />
        <FormSelect
          label="Type de voie"
          value={adresse.typeVoie}
          onChange={(v) => update("typeVoie", v)}
          disabled={locked}
          required
          options={[
            "Rue","Avenue","Boulevard","Allée",
            "Impasse","Chemin","Route","Place",
            "Quai","Résidence","Autre",
          ].map((v) => ({ value: v, label: v }))}
        />
        <div className="col-span-1 sm:col-span-2">
          <FormInput
            label="Nom de la voie"
            value={adresse.nomVoie}
            onChange={(v) => update("nomVoie", v)}
            readOnly={locked}
            required
          />
        </div>
        <div className="col-span-1 sm:col-span-2">
          <FormInput
            label="Complément d'adresse"
            value={adresse.complementAdresse || ""}
            onChange={(v) => update("complementAdresse", v)}
            readOnly={locked}
          />
        </div>
        <FormInput
          label="Code postal"
          value={adresse.codePostal}
          onChange={(v) => update("codePostal", v)}
          readOnly={locked}
          required
        />
        <FormInput
          label="Ville"
          value={adresse.ville}
          onChange={(v) => update("ville", v)}
          readOnly={locked}
          required
        />
        <FormInput
          label="Département"
          value={adresse.departement}
          onChange={(v) => update("departement", v)}
          readOnly={locked}
        />
        <FormInput
          label="Région"
          value={adresse.region}
          onChange={(v) => update("region", v)}
          readOnly={locked}
        />
        <FormInput
          label="Pays"
          value={adresse.pays}
          onChange={(v) => update("pays", v)}
          readOnly={locked}
          required
        />
      </div>
    );
  }
  
  // ============================================================
  // WIZARD STEP INDICATOR
  // ============================================================
  function WizardStepIndicator({
    steps,
    currentStep,
  }: {
    steps: { label: string; emoji: string }[];
    currentStep: number;
  }) {
    return (
      <div className="w-full overflow-x-auto pb-2">
        <div className="flex items-center justify-center min-w-max mx-auto px-2">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center">
              <div className="flex flex-col items-center gap-1">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-extrabold transition-all"
                  style={{
                    backgroundColor:
                      index < currentStep
                        ? "#22c55e"
                        : index === currentStep
                        ? "#f97316"
                        : "#e2e8f0",
                    color:
                      index <= currentStep ? "#fff" : "#94a3b8",
                  }}
                >
                  {index < currentStep ? "✓" : step.emoji}
                </div>
                <span
                  className="text-xs font-bold whitespace-nowrap hidden sm:block"
                  style={{
                    color:
                      index === currentStep
                        ? "#f97316"
                        : index < currentStep
                        ? "#22c55e"
                        : "#94a3b8",
                  }}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className="w-8 sm:w-12 h-0.5 mx-1 sm:mx-2 mb-4 sm:mb-5 transition-all"
                  style={{
                    backgroundColor:
                      index < currentStep ? "#22c55e" : "#e2e8f0",
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  // ============================================================
  // WIZARD NAVIGATION
  // ============================================================
  function WizardNavigation({
    currentStep,
    totalSteps,
    canGoNext,
    onPrevious,
    onNext,
    onCancel,
    isLastStep,
  }: {
    currentStep: number;
    totalSteps: number;
    canGoNext: boolean;
    onPrevious: () => void;
    onNext: () => void;
    onCancel: () => void;
    isLastStep: boolean;
  }) {
    return (
      <div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-3 mt-8 pt-5"
        style={{ borderTop: "2px solid #f1f5f9" }}
      >
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={onCancel}
            className="flex-1 sm:flex-none px-5 py-2.5 rounded-2xl text-sm font-bold"
            style={{
              backgroundColor: "#f8fafc",
              color: "#94a3b8",
              border: "2px solid #e2e8f0",
            }}
          >
            Annuler
          </button>
          {currentStep > 0 && (
            <button
              onClick={onPrevious}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-2xl text-sm font-bold"
              style={{
                backgroundColor: "#fff",
                color: "#64748b",
                border: "2px solid #e2e8f0",
              }}
            >
              ← Précédent
            </button>
          )}
        </div>
  
        <button
          onClick={onNext}
          disabled={!canGoNext}
          className="w-full sm:w-auto px-6 py-2.5 rounded-2xl text-sm font-extrabold text-white transition-all disabled:opacity-40"
          style={{
            background: canGoNext
              ? "linear-gradient(135deg,#f97316,#fb923c)"
              : "#e2e8f0",
          }}
        >
          {isLastStep ? "✓ Enregistrer" : "Suivant →"}
        </button>
      </div>
    );
  }
  
  // ============================================================
  // WIZARD WRAPPER LAYOUT
  // ============================================================
  function WizardLayout({
    title,
    subtitle,
    reference,
    steps,
    currentStep,
    onCancel,
    children,
  }: {
    title: string;
    subtitle: string;
    reference: string;
    steps: { label: string; emoji: string }[];
    currentStep: number;
    onCancel: () => void;
    children: React.ReactNode;
  }) {
    return (
      <div
        className="min-h-screen"
        style={{ backgroundColor: "#f8fafc", fontFamily: inter.style.fontFamily }}
      >
        {/* Header */}
        <div
          className="px-4 sm:px-6 py-5"
          style={{ background: "linear-gradient(135deg,#fff7ed,#fff)" }}
        >
          <div className="max-w-2xl mx-auto">
            <button
              onClick={onCancel}
              className="text-xs font-bold mb-3 hover:underline"
              style={{ color: "#f97316" }}
            >
              ← Retour
            </button>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h1
                  className="text-xl font-black"
                  style={{ color: "#1e293b" }}
                >
                  {title}
                </h1>
                <p className="text-sm mt-0.5" style={{ color: "#94a3b8" }}>
                  {subtitle}
                </p>
              </div>
              <span
                className="px-3 py-1 rounded-full text-xs font-bold self-start sm:self-auto"
                style={{ backgroundColor: "#fff7ed", color: "#f97316" }}
              >
                {reference}
              </span>
            </div>
          </div>
        </div>
  
        {/* Step indicator */}
        <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-6">
          <WizardStepIndicator steps={steps} currentStep={currentStep} />
        </div>
  
        {/* Step content */}
        <div className="max-w-2xl mx-auto px-4 sm:px-6 pb-12">
          {children}
        </div>
      </div>
    );
  }
  
  // ============================================================
  // WIZARD PERSONNE PHYSIQUE
  // ============================================================
  const STEPS_PHYSIQUE = [
    { label: "Identité", emoji: "👤" },
    { label: "Adresse", emoji: "🏠" },
    { label: "Contact", emoji: "📞" },
    { label: "Fiscalité", emoji: "🏛️" },
    { label: "Documents", emoji: "📎" },
  ];
  
  function WizardProprietairePhysique({
    reference,
    initial,
    hasAssociatedAssets = false,
    onSave,
    onCancel,
  }: {
    reference: string;
    initial?: ProprietairePersonnePhysique;
    hasAssociatedAssets?: boolean;
    onSave: (p: ProprietairePersonnePhysique) => void;
    onCancel: () => void;
  }) {
    const isEdit = !!initial;
    const identiteLocked = isEdit && hasAssociatedAssets;
    const [step, setStep] = useState(0);
  
    // Identité
    const [civilite, setCivilite] = useState<Civilite>(initial?.civilite || "Madame");
    const [nom, setNom] = useState(initial?.nom || "");
    const [prenom, setPrenom] = useState(initial?.prenom || "");
    const [dateNaissance, setDateNaissance] = useState(initial?.dateNaissance || "");
    const [nationalite, setNationalite] = useState(initial?.nationalite || "");
  
    // Adresse
    const [adresse, setAdresse] = useState<Adresse>(
      initial?.adresse || {
        numeroVoie: "",
        typeVoie: "Rue",
        nomVoie: "",
        complementAdresse: "",
        codePostal: "",
        ville: "",
        departement: "",
        region: "",
        pays: "France",
      }
    );
  
    // Contact
    const [telephonePrincipal, setTelephonePrincipal] = useState(initial?.telephonePrincipal || "");
    const [telephoneSecondaire, setTelephoneSecondaire] = useState(initial?.telephoneSecondaire || "");
    const [email, setEmail] = useState(initial?.email || "");
  
    // Fiscalité
    const [numeroFiscal, setNumeroFiscal] = useState(initial?.numeroFiscal || "");
    const [residentFiscalFrancais, setResidentFiscalFrancais] = useState(
      initial?.residentFiscalFrancais ?? true
    );
    const [paysResidenceFiscale, setPaysResidenceFiscale] = useState(
      initial?.paysResidenceFiscale || ""
    );
  
    // Documents
    const [documents] = useState<DocumentProprietaire[]>(
      initial?.documents || [
        { id: "pi", nom: "Pièce d'identité", obligatoire: true },
        { id: "justif", nom: "Justificatif de domicile", obligatoire: false },
        { id: "fiscal", nom: "Avis d'imposition", obligatoire: false },
      ]
    );
  
    const canGoNext = useMemo(() => {
      switch (step) {
        case 0:
          return !!(civilite && nom && prenom && dateNaissance && nationalite);
        case 1:
          return !!(
            adresse.numeroVoie &&
            adresse.typeVoie &&
            adresse.nomVoie &&
            adresse.codePostal &&
            adresse.ville &&
            adresse.pays
          );
        case 2:
          return !!(telephonePrincipal && email);
        case 3:
          return !!(
            numeroFiscal &&
            (residentFiscalFrancais || paysResidenceFiscale)
          );
        case 4:
          return true;
        default:
          return false;
      }
    }, [
      step, civilite, nom, prenom, dateNaissance, nationalite,
      adresse, telephonePrincipal, email,
      numeroFiscal, residentFiscalFrancais, paysResidenceFiscale,
    ]);
  
    const handleNext = () => {
      if (step < STEPS_PHYSIQUE.length - 1) {
        setStep((s) => s + 1);
      } else {
        const now = getToday();
        const proprietaire: ProprietairePersonnePhysique = {
          id: initial?.id || `pro-${Date.now()}`,
          reference,
          typeProprietaire: "personne_physique",
          statut: initial?.statut || "actif",
          civilite,
          nom,
          prenom,
          dateNaissance,
          nationalite,
          adresse,
          telephonePrincipal,
          telephoneSecondaire: telephoneSecondaire || undefined,
          email,
          numeroFiscal,
          residentFiscalFrancais,
          paysResidenceFiscale: residentFiscalFrancais ? undefined : paysResidenceFiscale,
          documents: documents.map((d) => ({
            ...d,
            dateAjout: d.dateAjout || now,
          })),
          historique: [
            ...(initial?.historique || []),
            ...(isEdit
              ? [
                  {
                    id: `hist-${Date.now()}`,
                    date: now,
                    heure: getNowTime(),
                    utilisateur: "Utilisateur connecté",
                    champ: "Fiche propriétaire",
                    ancienneValeur: "Anciennes informations",
                    nouvelleValeur: "Informations mises à jour",
                  },
                ]
              : []),
          ],
          createdAt: initial?.createdAt || now,
          updatedAt: now,
        };
        onSave(proprietaire);
      }
    };
  
    const stepContent = [
      // Étape 0 — Identité
      <div key="identite" className="space-y-5">
        <SectionCard>
          <SectionTitle emoji="👤" title="Identité" />
          {identiteLocked && (
            <div
              className="mb-4 p-3 rounded-2xl text-xs font-bold"
              style={{ backgroundColor: "#fef3c7", color: "#92400e" }}
            >
              ⚠️ Les informations d'identité sont verrouillées car ce propriétaire est associé à des biens.
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormSelect
              label="Civilité"
              value={civilite}
              onChange={(v) => setCivilite(v as Civilite)}
              disabled={identiteLocked}
              required
              options={[
                { value: "Madame", label: "Madame" },
                { value: "Monsieur", label: "Monsieur" },
              ]}
            />
            <FormInput
              label="Nom"
              value={nom}
              onChange={setNom}
              readOnly={identiteLocked}
              required
            />
            <FormInput
              label="Prénom"
              value={prenom}
              onChange={setPrenom}
              readOnly={identiteLocked}
              required
            />
            <FormInput
              label="Date de naissance"
              value={dateNaissance}
              onChange={setDateNaissance}
              type="date"
              readOnly={identiteLocked}
              required
            />
            <div className="col-span-1 sm:col-span-2">
              <FormInput
                label="Nationalité"
                value={nationalite}
                onChange={setNationalite}
                readOnly={identiteLocked}
                required
              />
            </div>
          </div>
        </SectionCard>
      </div>,
  
      // Étape 1 — Adresse
      <div key="adresse" className="space-y-5">
        <SectionCard>
          <SectionTitle emoji="🏠" title="Adresse" />
          <AdresseForm adresse={adresse} onChange={setAdresse} />
        </SectionCard>
      </div>,
  
      // Étape 2 — Contact
      <div key="contact" className="space-y-5">
        <SectionCard>
          <SectionTitle emoji="📞" title="Coordonnées" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Téléphone principal"
              value={telephonePrincipal}
              onChange={setTelephonePrincipal}
              type="tel"
              required
            />
            <FormInput
              label="Téléphone secondaire"
              value={telephoneSecondaire}
              onChange={setTelephoneSecondaire}
              type="tel"
            />
            <div className="col-span-1 sm:col-span-2">
              <FormInput
                label="E-mail"
                value={email}
                onChange={setEmail}
                type="email"
                required
              />
            </div>
          </div>
        </SectionCard>
      </div>,
  
      // Étape 3 — Fiscalité
      <div key="fiscalite" className="space-y-5">
        <SectionCard>
          <SectionTitle emoji="🏛️" title="Informations fiscales" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="col-span-1 sm:col-span-2">
              <FormInput
                label="Numéro fiscal"
                value={numeroFiscal}
                onChange={setNumeroFiscal}
                required
              />
            </div>
            <FormSelect
              label="Résident fiscal français"
              value={residentFiscalFrancais ? "oui" : "non"}
              onChange={(v) => setResidentFiscalFrancais(v === "oui")}
              options={[
                { value: "oui", label: "Oui" },
                { value: "non", label: "Non" },
              ]}
              required
            />
            {!residentFiscalFrancais && (
              <FormInput
                label="Pays de résidence fiscale"
                value={paysResidenceFiscale}
                onChange={setPaysResidenceFiscale}
                required
              />
            )}
          </div>
        </SectionCard>
      </div>,
  
      // Étape 4 — Documents
      <div key="documents" className="space-y-5">
        <SectionCard>
          <SectionTitle emoji="📎" title="Documents" />
          <div className="space-y-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl"
                style={{ backgroundColor: "#f8fafc" }}
              >
                <div>
                  <p className="text-sm font-bold" style={{ color: "#1e293b" }}>
                    📄 {doc.nom}
                  </p>
                  <p className="text-xs" style={{ color: "#94a3b8" }}>
                    {doc.obligatoire ? "Obligatoire" : "Facultatif"}
                  </p>
                </div>
                <label
                  className="px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer self-start sm:self-auto whitespace-nowrap"
                  style={{ backgroundColor: "#fff7ed", color: "#f97316" }}
                >
                  + Ajouter
                  <input type="file" className="hidden" />
                </label>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>,
    ];
  
    return (
      <WizardLayout
        title={isEdit ? "Modifier le propriétaire" : "Nouveau propriétaire"}
        subtitle="Personne physique"
        reference={reference}
        steps={STEPS_PHYSIQUE}
        currentStep={step}
        onCancel={onCancel}
      >
        <div className="space-y-5 mt-6">
          {stepContent[step]}
          <WizardNavigation
            currentStep={step}
            totalSteps={STEPS_PHYSIQUE.length}
            canGoNext={canGoNext}
            onPrevious={() => setStep((s) => s - 1)}
            onNext={handleNext}
            onCancel={onCancel}
            isLastStep={step === STEPS_PHYSIQUE.length - 1}
          />
        </div>
      </WizardLayout>
    );
  }
  
  // ============================================================
  // WIZARD PERSONNE MORALE
  // ============================================================
  const STEPS_MORALE = [
    { label: "Société", emoji: "🏢" },
    { label: "Adresse", emoji: "🏠" },
    { label: "Contact", emoji: "📞" },
    { label: "Représentant", emoji: "👤" },
    { label: "Documents", emoji: "📎" },
  ];
  
  function WizardProprietaireMorale({
    reference,
    initial,
    hasAssociatedAssets = false,
    onSave,
    onCancel,
  }: {
    reference: string;
    initial?: ProprietairePersonneMorale;
    hasAssociatedAssets?: boolean;
    onSave: (p: ProprietairePersonneMorale) => void;
    onCancel: () => void;
  }) {
    const isEdit = !!initial;
    const identiteLocked = isEdit && hasAssociatedAssets;
    const [step, setStep] = useState(0);
  
    // Société
    const [raisonSociale, setRaisonSociale] = useState(initial?.raisonSociale || "");
    const [formeJuridique, setFormeJuridique] = useState<ProprietairePersonneMorale["formeJuridique"]>(
      initial?.formeJuridique || "SCI"
    );
    const [siren, setSiren] = useState(initial?.siren || "");
    const [siret, setSiret] = useState(initial?.siret || "");
    const [villeImmatriculation, setVilleImmatriculation] = useState(
      initial?.villeImmatriculation || ""
    );
    const [capitalSocial, setCapitalSocial] = useState(
      initial?.capitalSocial ? String(initial.capitalSocial) : ""
    );
    const [dateCreation, setDateCreation] = useState(initial?.dateCreation || "");
  
    // Adresse
    const [adresse, setAdresse] = useState<Adresse>(
      initial?.adresse || {
        numeroVoie: "",
        typeVoie: "Rue",
        nomVoie: "",
        complementAdresse: "",
        codePostal: "",
        ville: "",
        departement: "",
        region: "",
        pays: "France",
      }
    );
  
    // Contact
    const [telephonePrincipal, setTelephonePrincipal] = useState(initial?.telephonePrincipal || "");
    const [telephoneSecondaire, setTelephoneSecondaire] = useState(initial?.telephoneSecondaire || "");
    const [email, setEmail] = useState(initial?.email || "");
  
    // Représentant légal
    const [representantLegal, setRepresentantLegal] = useState(
      initial?.representantLegal || {
        civilite: "Madame" as Civilite,
        nom: "",
        prenom: "",
        fonction: "",
        telephone: "",
        email: "",
      }
    );
  
    // Documents
    const [documents] = useState<DocumentProprietaire[]>(
      initial?.documents || [
        { id: "kbis", nom: "Extrait Kbis", obligatoire: true },
        { id: "statuts", nom: "Statuts de la société", obligatoire: false },
        { id: "pi-rep", nom: "Pièce d'identité du représentant légal", obligatoire: false },
        { id: "docs-comp", nom: "Documents complémentaires", obligatoire: false },
      ]
    );
  
    const updateRepresentant = (
      field: keyof ProprietairePersonneMorale["representantLegal"],
      value: string
    ) => {
      setRepresentantLegal({ ...representantLegal, [field]: value });
    };
  
    const canGoNext = useMemo(() => {
      switch (step) {
        case 0:
          return !!(raisonSociale && formeJuridique && siren && siret);
        case 1:
          return !!(
            adresse.numeroVoie &&
            adresse.typeVoie &&
            adresse.nomVoie &&
            adresse.codePostal &&
            adresse.ville &&
            adresse.pays
          );
        case 2:
          return !!(telephonePrincipal && email);
        case 3:
          return !!(
            representantLegal.nom &&
            representantLegal.prenom &&
            representantLegal.fonction
          );
        case 4:
          return true;
        default:
          return false;
      }
    }, [
      step, raisonSociale, formeJuridique, siren, siret,
      adresse, telephonePrincipal, email, representantLegal,
    ]);
  
    const handleNext = () => {
      if (step < STEPS_MORALE.length - 1) {
        setStep((s) => s + 1);
      } else {
        const now = getToday();
        const proprietaire: ProprietairePersonneMorale = {
          id: initial?.id || `pro-${Date.now()}`,
          reference,
          typeProprietaire: "personne_morale",
          statut: initial?.statut || "actif",
          raisonSociale,
          formeJuridique,
          siren,
          siret,
          villeImmatriculation: villeImmatriculation || undefined,
          capitalSocial: capitalSocial ? Number(capitalSocial) : undefined,
          dateCreation: dateCreation || undefined,
          adresse,
          telephonePrincipal,
          telephoneSecondaire: telephoneSecondaire || undefined,
          email,
          representantLegal,
          documents: documents.map((d) => ({
            ...d,
            dateAjout: d.dateAjout || now,
          })),
          historique: [
            ...(initial?.historique || []),
            ...(isEdit
              ? [
                  {
                    id: `hist-${Date.now()}`,
                    date: now,
                    heure: getNowTime(),
                    utilisateur: "Utilisateur connecté",
                    champ: "Fiche propriétaire",
                    ancienneValeur: "Anciennes informations",
                    nouvelleValeur: "Informations mises à jour",
                  },
                ]
              : []),
          ],
          createdAt: initial?.createdAt || now,
          updatedAt: now,
        };
        onSave(proprietaire);
      }
    };
  
    const stepContent = [
      // Étape 0 — Société
      <div key="societe" className="space-y-5">
        <SectionCard>
          <SectionTitle emoji="🏢" title="Informations société" />
          {identiteLocked && (
            <div
              className="mb-4 p-3 rounded-2xl text-xs font-bold"
              style={{ backgroundColor: "#fef3c7", color: "#92400e" }}
            >
              ⚠️ Les informations de la société sont verrouillées car ce propriétaire est associé à des biens.
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="col-span-1 sm:col-span-2">
              <FormInput
                label="Raison sociale"
                value={raisonSociale}
                onChange={setRaisonSociale}
                readOnly={identiteLocked}
                required
              />
            </div>
            <FormSelect
              label="Forme juridique"
              value={formeJuridique}
              onChange={(v) =>
                setFormeJuridique(v as ProprietairePersonneMorale["formeJuridique"])
              }
              disabled={identiteLocked}
              required
              options={[
                "SCI","SARL","EURL","SAS","SASU","SA","Association","Autre",
              ].map((v) => ({ value: v, label: v }))}
            />
            <FormInput
              label="SIREN"
              value={siren}
              onChange={setSiren}
              readOnly={identiteLocked}
              required
            />
            <FormInput
              label="SIRET"
              value={siret}
              onChange={setSiret}
              readOnly={identiteLocked}
              required
            />
            <FormInput
              label="Ville d'immatriculation"
              value={villeImmatriculation}
              onChange={setVilleImmatriculation}
              readOnly={identiteLocked}
            />
            <FormInput
              label="Capital social (€)"
              value={capitalSocial}
              onChange={setCapitalSocial}
              type="number"
            />
            <FormInput
              label="Date de création"
              value={dateCreation}
              onChange={setDateCreation}
              type="date"
            />
          </div>
        </SectionCard>
      </div>,
  
      // Étape 1 — Adresse
      <div key="adresse" className="space-y-5">
        <SectionCard>
          <SectionTitle emoji="🏠" title="Adresse du siège" />
          <AdresseForm adresse={adresse} onChange={setAdresse} />
        </SectionCard>
      </div>,
  
      // Étape 2 — Contact
      <div key="contact" className="space-y-5">
        <SectionCard>
          <SectionTitle emoji="📞" title="Coordonnées" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Téléphone principal"
              value={telephonePrincipal}
              onChange={setTelephonePrincipal}
              type="tel"
              required
            />
            <FormInput
              label="Téléphone secondaire"
              value={telephoneSecondaire}
              onChange={setTelephoneSecondaire}
              type="tel"
            />
            <div className="col-span-1 sm:col-span-2">
              <FormInput
                label="E-mail"
                value={email}
                onChange={setEmail}
                type="email"
                required
              />
            </div>
          </div>
        </SectionCard>
      </div>,
  
      // Étape 3 — Représentant légal
      <div key="representant" className="space-y-5">
        <SectionCard>
          <SectionTitle emoji="👤" title="Représentant légal" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormSelect
              label="Civilité"
              value={representantLegal.civilite}
              onChange={(v) => updateRepresentant("civilite", v)}
              options={[
                { value: "Madame", label: "Madame" },
                { value: "Monsieur", label: "Monsieur" },
              ]}
              required
            />
            <FormInput
              label="Nom"
              value={representantLegal.nom}
              onChange={(v) => updateRepresentant("nom", v)}
              required
            />
            <FormInput
              label="Prénom"
              value={representantLegal.prenom}
              onChange={(v) => updateRepresentant("prenom", v)}
              required
            />
            <FormInput
              label="Fonction"
              value={representantLegal.fonction}
              onChange={(v) => updateRepresentant("fonction", v)}
              required
            />
            <FormInput
              label="Téléphone"
              value={representantLegal.telephone}
              onChange={(v) => updateRepresentant("telephone", v)}
              type="tel"
            />
            <FormInput
              label="E-mail"
              value={representantLegal.email}
              onChange={(v) => updateRepresentant("email", v)}
              type="email"
            />
          </div>
        </SectionCard>
      </div>,
  
      // Étape 4 — Documents
      <div key="documents" className="space-y-5">
        <SectionCard>
          <SectionTitle emoji="📎" title="Documents" />
          <div className="space-y-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl"
                style={{ backgroundColor: "#f8fafc" }}
              >
                <div>
                  <p className="text-sm font-bold" style={{ color: "#1e293b" }}>
                    📄 {doc.nom}
                  </p>
                  <p className="text-xs" style={{ color: "#94a3b8" }}>
                    {doc.obligatoire ? "Obligatoire" : "Facultatif"}
                  </p>
                </div>
                <label
                  className="px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer self-start sm:self-auto whitespace-nowrap"
                  style={{ backgroundColor: "#f3e8ff", color: "#8b5cf6" }}
                >
                  + Ajouter
                  <input type="file" className="hidden" />
                </label>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>,
    ];
  
    return (
      <WizardLayout
        title={isEdit ? "Modifier le propriétaire" : "Nouveau propriétaire"}
        subtitle="Personne morale"
        reference={reference}
        steps={STEPS_MORALE}
        currentStep={step}
        onCancel={onCancel}
      >
        <div className="space-y-5 mt-6">
          {stepContent[step]}
          <WizardNavigation
            currentStep={step}
            totalSteps={STEPS_MORALE.length}
            canGoNext={canGoNext}
            onPrevious={() => setStep((s) => s - 1)}
            onNext={handleNext}
            onCancel={onCancel}
            isLastStep={step === STEPS_MORALE.length - 1}
          />
        </div>
      </WizardLayout>
    );
  }
  // ============================================================
// CHOIX TYPE PROPRIÉTAIRE
// ============================================================
function ChoixTypeProprietaire({
    onRetour,
    onChoix,
  }: {
    onRetour: () => void;
    onChoix: (type: TypeProprietaire) => void;
  }) {
    return (
      <div
        className="min-h-screen"
        style={{ backgroundColor: "#f8fafc", fontFamily: inter.style.fontFamily }}
      >
        <div
          className="px-4 sm:px-6 py-5"
          style={{ background: "linear-gradient(135deg,#fff7ed,#fff)" }}
        >
          <div className="max-w-2xl mx-auto">
            <button
              onClick={onRetour}
              className="text-xs font-bold mb-3 hover:underline"
              style={{ color: "#f97316" }}
            >
              ← Propriétaires
            </button>
            <h1 className="text-xl font-black" style={{ color: "#1e293b" }}>
              Nouveau propriétaire
            </h1>
            <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>
              Choisissez le type de propriétaire à créer.
            </p>
          </div>
        </div>
  
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => onChoix("personne_physique")}
              className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-lg transition text-left border-2"
              style={{ borderColor: "#e2e8f0" }}
            >
              <div
                className="w-14 h-14 rounded-3xl flex items-center justify-center text-3xl mb-4"
                style={{ background: "linear-gradient(135deg,#f97316,#fb923c)" }}
              >
                👤
              </div>
              <p className="font-extrabold text-base mb-1" style={{ color: "#1e293b" }}>
                Personne physique
              </p>
              <p className="text-xs" style={{ color: "#94a3b8" }}>
                Particulier : bailleur individuel, propriétaire en nom propre.
              </p>
            </button>
  
            <button
              onClick={() => onChoix("personne_morale")}
              className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-lg transition text-left border-2"
              style={{ borderColor: "#e2e8f0" }}
            >
              <div
                className="w-14 h-14 rounded-3xl flex items-center justify-center text-3xl mb-4"
                style={{ background: "linear-gradient(135deg,#8b5cf6,#a78bfa)" }}
              >
                🏢
              </div>
              <p className="font-extrabold text-base mb-1" style={{ color: "#1e293b" }}>
                Personne morale
              </p>
              <p className="text-xs" style={{ color: "#94a3b8" }}>
                Société ou structure juridique : SCI, SARL, SAS, association ou autre forme morale.
              </p>
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // ============================================================
  // DETAIL PROPRIÉTAIRE
  // ============================================================
  function DetailProprietaire({
    proprietaire,
    biensAssocies,
    onBack,
    onEdit,
    onDelete,
    onArchive,
  }: {
    proprietaire: Proprietaire;
    biensAssocies: BienAssocie[];
    onBack: () => void;
    onEdit: () => void;
    onDelete: () => void;
    onArchive: () => void;
  }) {
    const [onglet, setOnglet] = useState<"infos" | "biens" | "documents" | "historique">("infos");
  
    const onglets = [
      { id: "infos" as const, label: "Informations", emoji: "📋" },
      { id: "biens" as const, label: "Biens associés", emoji: "🏠" },
      { id: "documents" as const, label: "Documents", emoji: "📎" },
      { id: "historique" as const, label: "Historique", emoji: "🕐" },
    ];
  
    return (
      <div
        className="min-h-screen"
        style={{ backgroundColor: "#f8fafc", fontFamily: inter.style.fontFamily }}
      >
        {/* Header */}
        <div
          className="px-4 sm:px-6 py-5"
          style={{ background: "linear-gradient(135deg,#fff7ed,#fff)" }}
        >
          <div className="max-w-4xl mx-auto">
            <button
              onClick={onBack}
              className="text-xs font-bold mb-3 hover:underline"
              style={{ color: "#f97316" }}
            >
              ← Propriétaires
            </button>
  
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl font-black" style={{ color: "#1e293b" }}>
                    {proprietaire.typeProprietaire === "personne_physique" ? "👤" : "🏢"}{" "}
                    {getNomAffichage(proprietaire)}
                  </h1>
                  <StatutBadge statut={proprietaire.statut} />
                </div>
                <p className="text-xs mt-1" style={{ color: "#94a3b8" }}>
                  {proprietaire.reference} • {getTypeProprietaireLabel(proprietaire.typeProprietaire)}
                </p>
              </div>
  
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={onEdit}
                  className="px-4 py-2 rounded-2xl text-sm font-bold"
                  style={{ backgroundColor: "#f3e8ff", color: "#8b5cf6" }}
                >
                  ✏️ Modifier
                </button>
                {proprietaire.statut === "actif" && (
                  <button
                    onClick={onArchive}
                    className="px-4 py-2 rounded-2xl text-sm font-bold"
                    style={{ backgroundColor: "#eff6ff", color: "#3b82f6" }}
                  >
                    📦 Archiver
                  </button>
                )}
                <button
                  onClick={onDelete}
                  className="px-4 py-2 rounded-2xl text-sm font-bold"
                  style={{ backgroundColor: "#fef2f2", color: "#ef4444" }}
                >
                  🗑 Supprimer
                </button>
              </div>
            </div>
  
            {/* Onglets */}
            <div className="flex gap-2 mt-5 overflow-x-auto pb-1">
              {onglets.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setOnglet(item.id)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all"
                  style={{
                    backgroundColor: onglet === item.id ? "#f97316" : "#fff",
                    color: onglet === item.id ? "#fff" : "#64748b",
                  }}
                >
                  {item.emoji} {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
  
        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-5 space-y-4">
  
          {/* ── ONGLET INFOS ── */}
          {onglet === "infos" && (
            <>
              {/* Informations générales */}
              <SectionCard>
                <SectionTitle emoji="📋" title="Informations générales" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <InfoRow label="Référence" value={proprietaire.reference} />
                  <InfoRow label="Type" value={getTypeProprietaireLabel(proprietaire.typeProprietaire)} />
                  <InfoRow label="Statut" value={proprietaire.statut === "actif" ? "Actif" : "Archivé"} />
                  <InfoRow label="Créé le" value={proprietaire.createdAt} />
  
                  {proprietaire.typeProprietaire === "personne_physique" && (
                    <>
                      <InfoRow label="Civilité" value={proprietaire.civilite} />
                      <InfoRow label="Nom" value={proprietaire.nom} />
                      <InfoRow label="Prénom" value={proprietaire.prenom} />
                      <InfoRow label="Date de naissance" value={proprietaire.dateNaissance} />
                      <InfoRow label="Nationalité" value={proprietaire.nationalite} />
                      <InfoRow label="Numéro fiscal" value={proprietaire.numeroFiscal} />
                      <InfoRow
                        label="Résident fiscal français"
                        value={proprietaire.residentFiscalFrancais ? "Oui" : "Non"}
                      />
                      {proprietaire.paysResidenceFiscale && (
                        <InfoRow
                          label="Pays de résidence fiscale"
                          value={proprietaire.paysResidenceFiscale}
                        />
                      )}
                    </>
                  )}
  
                  {proprietaire.typeProprietaire === "personne_morale" && (
                    <>
                      <InfoRow label="Raison sociale" value={proprietaire.raisonSociale} />
                      <InfoRow label="Forme juridique" value={proprietaire.formeJuridique} />
                      <InfoRow label="SIREN" value={proprietaire.siren} />
                      <InfoRow label="SIRET" value={proprietaire.siret} />
                      {proprietaire.villeImmatriculation && (
                        <InfoRow
                          label="Ville d'immatriculation"
                          value={proprietaire.villeImmatriculation}
                        />
                      )}
                      {proprietaire.capitalSocial !== undefined && (
                        <InfoRow
                          label="Capital social"
                          value={`${proprietaire.capitalSocial.toLocaleString("fr-FR")} €`}
                        />
                      )}
                      {proprietaire.dateCreation && (
                        <InfoRow label="Date de création" value={proprietaire.dateCreation} />
                      )}
                    </>
                  )}
                </div>
              </SectionCard>
  
              {/* Représentant légal (personne morale) */}
              {proprietaire.typeProprietaire === "personne_morale" && (
                <SectionCard>
                  <SectionTitle emoji="👤" title="Représentant légal" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <InfoRow label="Civilité" value={proprietaire.representantLegal.civilite} />
                    <InfoRow label="Nom" value={proprietaire.representantLegal.nom} />
                    <InfoRow label="Prénom" value={proprietaire.representantLegal.prenom} />
                    <InfoRow label="Fonction" value={proprietaire.representantLegal.fonction} />
                    <InfoRow label="Téléphone" value={proprietaire.representantLegal.telephone} />
                    <InfoRow label="E-mail" value={proprietaire.representantLegal.email} />
                  </div>
                </SectionCard>
              )}
  
              {/* Adresse */}
              <SectionCard>
                <SectionTitle emoji="🏠" title="Adresse" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <InfoRow
                    label="Voie"
                    value={`${proprietaire.adresse.numeroVoie} ${proprietaire.adresse.typeVoie} ${proprietaire.adresse.nomVoie}`}
                  />
                  {proprietaire.adresse.complementAdresse && (
                    <InfoRow
                      label="Complément"
                      value={proprietaire.adresse.complementAdresse}
                    />
                  )}
                  <InfoRow label="Code postal" value={proprietaire.adresse.codePostal} />
                  <InfoRow label="Ville" value={proprietaire.adresse.ville} />
                  <InfoRow label="Département" value={proprietaire.adresse.departement} />
                  <InfoRow label="Région" value={proprietaire.adresse.region} />
                  <InfoRow label="Pays" value={proprietaire.adresse.pays} />
                </div>
              </SectionCard>
  
              {/* Contact */}
              <SectionCard>
                <SectionTitle emoji="📞" title="Contact" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <InfoRow label="Téléphone principal" value={proprietaire.telephonePrincipal} />
                  {proprietaire.telephoneSecondaire && (
                    <InfoRow label="Téléphone secondaire" value={proprietaire.telephoneSecondaire} />
                  )}
                  <InfoRow label="E-mail" value={proprietaire.email} />
                </div>
              </SectionCard>
            </>
          )}
  
          {/* ── ONGLET BIENS ── */}
          {onglet === "biens" && (
            <SectionCard>
              <SectionTitle emoji="🏠" title="Biens associés" />
              {biensAssocies.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-3xl mb-2">🏠</p>
                  <p className="text-sm font-bold" style={{ color: "#94a3b8" }}>
                    Aucun bien associé à ce propriétaire
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {biensAssocies.map((bien) => (
                    <div
                      key={bien.id}
                      className="p-4 rounded-2xl"
                      style={{ backgroundColor: "#f8fafc" }}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                          <p className="text-sm font-extrabold" style={{ color: "#1e293b" }}>
                            {bien.nom}
                          </p>
                          <p className="text-xs mt-0.5" style={{ color: "#64748b" }}>
                            {bien.reference} • {getTypeActifLabel(bien.typeActif)}
                          </p>
                          <p className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>
                            {bien.adresse}
                          </p>
                        </div>
                        <StatutActifBadge statut={bien.statut} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>
          )}
  
          {/* ── ONGLET DOCUMENTS ── */}
          {onglet === "documents" && (
            <SectionCard>
              <SectionTitle emoji="📎" title="Documents" />
              {proprietaire.documents.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-3xl mb-2">📎</p>
                  <p className="text-sm font-bold" style={{ color: "#94a3b8" }}>
                    Aucun document enregistré
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {proprietaire.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 rounded-2xl"
                      style={{ backgroundColor: "#f8fafc" }}
                    >
                      <div>
                        <p className="text-sm font-bold" style={{ color: "#1e293b" }}>
                          📄 {doc.nom}
                        </p>
                        <p className="text-xs" style={{ color: "#94a3b8" }}>
                          {doc.obligatoire ? "Obligatoire" : "Facultatif"}
                          {doc.dateAjout ? ` • Ajouté le ${doc.dateAjout}` : ""}
                        </p>
                      </div>
                      {doc.fichier ? (
                        <span
                          className="px-3 py-1 rounded-full text-xs font-bold self-start sm:self-auto"
                          style={{ backgroundColor: "#dcfce7", color: "#166534" }}
                        >
                          ✓ Chargé
                        </span>
                      ) : (
                        <span
                          className="px-3 py-1 rounded-full text-xs font-bold self-start sm:self-auto"
                          style={{ backgroundColor: "#fef3c7", color: "#92400e" }}
                        >
                          En attente
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>
          )}
  
          {/* ── ONGLET HISTORIQUE ── */}
          {onglet === "historique" && (
            <SectionCard>
              <SectionTitle emoji="🕐" title="Historique des modifications" />
              {proprietaire.historique.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-3xl mb-2">🕐</p>
                  <p className="text-sm font-bold" style={{ color: "#94a3b8" }}>
                    Aucune modification enregistrée
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {proprietaire.historique.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-2xl"
                      style={{ backgroundColor: "#f8fafc" }}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-2">
                        <p className="text-xs font-extrabold" style={{ color: "#1e293b" }}>
                          {item.champ}
                        </p>
                        <p className="text-xs" style={{ color: "#94a3b8" }}>
                          {item.date} à {item.heure} • {item.utilisateur}
                        </p>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2 text-xs">
                        <span
                          className="px-2 py-1 rounded-xl"
                          style={{ backgroundColor: "#fef2f2", color: "#ef4444" }}
                        >
                          Avant : {item.ancienneValeur}
                        </span>
                        <span className="hidden sm:flex items-center" style={{ color: "#94a3b8" }}>
                          →
                        </span>
                        <span
                          className="px-2 py-1 rounded-xl"
                          style={{ backgroundColor: "#dcfce7", color: "#166534" }}
                        >
                          Après : {item.nouvelleValeur}
                        </span>
                      </div>
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
  // COMPOSANT PRINCIPAL
  // ============================================================
  export default function ListeProprietaires() {
    const [proprietaires, setProprietaires] = useState<Proprietaire[]>(mockProprietaires);
    const [view, setView] = useState<ViewState>({ name: "liste" });
    const [searchQuery, setSearchQuery] = useState("");
    const [filterType, setFilterType] = useState<TypeProprietaire | "tous">("tous");
    const [filterStatut, setFilterStatut] = useState<StatutProprietaire | "tous">("tous");
  
    const getBiensAssociesProprietaire = (proprietaireId: string) =>
      mockBiensAssocies.filter((b) => b.proprietaireId === proprietaireId);
  
    const proprietairesFiltres = useMemo(() => {
      return proprietaires.filter((p) => {
        const nom = getNomAffichage(p).toLowerCase();
        const matchSearch = nom.includes(searchQuery.toLowerCase()) ||
          p.reference.toLowerCase().includes(searchQuery.toLowerCase());
        const matchType = filterType === "tous" || p.typeProprietaire === filterType;
        const matchStatut = filterStatut === "tous" || p.statut === filterStatut;
        return matchSearch && matchType && matchStatut;
      });
    }, [proprietaires, searchQuery, filterType, filterStatut]);
  
    const saveProprietaire = (updated: Proprietaire) => {
      setProprietaires((prev) => {
        const exists = prev.find((p) => p.id === updated.id);
        if (exists) {
          return prev.map((p) => (p.id === updated.id ? updated : p));
        }
        return [...prev, updated];
      });
      setView({ name: "detail", proprietaire: updated });
    };
  
    const deleteProprietaire = (id: string) => {
      setProprietaires((prev) => prev.filter((p) => p.id !== id));
      setView({ name: "liste" });
    };
  
    const archiveProprietaire = (proprietaire: Proprietaire) => {
      const updated: Proprietaire = {
        ...proprietaire,
        statut: "archive",
        updatedAt: getToday(),
      };
      saveProprietaire(updated);
    };
  
    const refreshSelectedProprietaire = (original: Proprietaire) => {
      const current = proprietaires.find((p) => p.id === original.id) || original;
      setView({ name: "detail", proprietaire: current });
    };
  
    const nextReference = generateReferenceProprietaire(proprietaires.length);
  
    // ── VUE CHOIX ──
    if (view.name === "choix") {
      return (
        <ChoixTypeProprietaire
          onRetour={() => setView({ name: "liste" })}
          onChoix={(type) => {
            if (type === "personne_physique") setView({ name: "creation_physique" });
            else setView({ name: "creation_morale" });
          }}
        />
      );
    }
  
    // ── VUE CRÉATION PHYSIQUE ──
    if (view.name === "creation_physique") {
      return (
        <WizardProprietairePhysique
          reference={nextReference}
          onSave={saveProprietaire}
          onCancel={() => setView({ name: "choix" })}
        />
      );
    }
  
    // ── VUE CRÉATION MORALE ──
    if (view.name === "creation_morale") {
      return (
        <WizardProprietaireMorale
          reference={nextReference}
          onSave={saveProprietaire}
          onCancel={() => setView({ name: "choix" })}
        />
      );
    }
  
    // ── VUE DÉTAIL ──
    if (view.name === "detail") {
      const biensDuProprietaire = getBiensAssociesProprietaire(view.proprietaire.id);
      const currentProprietaire =
        proprietaires.find((p) => p.id === view.proprietaire.id) || view.proprietaire;
  
      return (
        <DetailProprietaire
          proprietaire={currentProprietaire}
          biensAssocies={biensDuProprietaire}
          onBack={() => setView({ name: "liste" })}
          onEdit={() => setView({ name: "edition", proprietaire: currentProprietaire })}
          onDelete={() => deleteProprietaire(currentProprietaire.id)}
          onArchive={() => archiveProprietaire(currentProprietaire)}
        />
      );
    }
  
    // ── VUE ÉDITION ──
    if (view.name === "edition") {
      const biensDuProprietaire = getBiensAssociesProprietaire(view.proprietaire.id);
  
      if (view.proprietaire.typeProprietaire === "personne_physique") {
        return (
          <WizardProprietairePhysique
            reference={view.proprietaire.reference}
            initial={view.proprietaire}
            hasAssociatedAssets={biensDuProprietaire.length > 0}
            onSave={saveProprietaire}
            onCancel={() => refreshSelectedProprietaire(view.proprietaire)}
          />
        );
      }
  
      if (view.proprietaire.typeProprietaire === "personne_morale") {
        return (
          <WizardProprietaireMorale
            reference={view.proprietaire.reference}
            initial={view.proprietaire}
            hasAssociatedAssets={biensDuProprietaire.length > 0}
            onSave={saveProprietaire}
            onCancel={() => refreshSelectedProprietaire(view.proprietaire)}
          />
        );
      }
    }
  
    // ── VUE LISTE ──
    const dashboardCards = [
      {
        icon: "👥",
        value: proprietaires.length,
        label: "Total des propriétaires",
        color: "linear-gradient(135deg,#f97316,#fb923c)",
      },
      {
        icon: "✅",
        value: proprietaires.filter((p) => p.statut === "actif").length,
        label: "Propriétaires actifs",
        color: "linear-gradient(135deg,#22c55e,#4ade80)",
      },
      {
        icon: "👤",
        value: proprietaires.filter((p) => p.typeProprietaire === "personne_physique").length,
        label: "Personnes physiques",
        color: "linear-gradient(135deg,#ec4899,#f472b6)",
      },
      {
        icon: "🏢",
        value: proprietaires.filter((p) => p.typeProprietaire === "personne_morale").length,
        label: "Personnes morales",
        color: "linear-gradient(135deg,#8b5cf6,#a78bfa)",
      },
    ];

    return (
      <div
        className="min-h-screen"
        style={{ backgroundColor: "#f8fafc", fontFamily: inter.style.fontFamily }}
      >
        <header
          className="px-4 sm:px-6 py-5"
          style={{ background: "linear-gradient(135deg,#fff7ed,#fff)" }}
        >
          <div className="max-w-6xl mx-auto">
            <div className="flex items-start justify-between gap-4 flex-wrap mb-5">
              <div>
                <h1 className="text-2xl font-black" style={{ color: "#1e293b" }}>
                  👥 Propriétaires
                </h1>
                <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>
                  Référentiel officiel des bailleurs de la plateforme.
                </p>
              </div>
              <button
                onClick={() => setView({ name: "choix" })}
                className="px-5 py-2.5 rounded-2xl text-white text-sm font-extrabold shadow-lg transition hover:opacity-90"
                style={{ background: "linear-gradient(135deg,#f97316,#fb923c)" }}
              >
                + Nouveau propriétaire
              </button>
            </div>

            <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {dashboardCards.map((card) => (
                <article
                  key={card.label}
                  className="rounded-3xl p-4 text-white min-h-[126px] flex flex-col justify-between"
                  style={{ background: card.color, boxShadow: "0 12px 24px rgba(30,41,59,0.12)" }}
                >
                  <div className="text-2xl leading-none">{card.icon}</div>
                  <div>
                    <p className="text-2xl font-black leading-none tracking-tight">{card.value}</p>
                    <p className="text-xs font-bold mt-2 opacity-90">{card.label}</p>
                  </div>
                </article>
              ))}
            </section>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-5">
          <section className="bg-white rounded-3xl p-4 shadow-sm mb-5" style={{ border: "1px solid #e2e8f0" }}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Rechercher un nom, une référence…"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl text-sm border outline-none"
                style={{ borderColor: "#e2e8f0", backgroundColor: "#fff", fontFamily: inter.style.fontFamily }}
              />
              <select
                value={filterType}
                onChange={(event) => setFilterType(event.target.value as TypeProprietaire | "tous")}
                className="w-full px-4 py-2.5 rounded-2xl text-sm border outline-none"
                style={{ borderColor: "#e2e8f0", backgroundColor: "#fff", fontFamily: inter.style.fontFamily }}
              >
                <option value="tous">Tous les types</option>
                <option value="personne_physique">Personnes physiques</option>
                <option value="personne_morale">Personnes morales</option>
              </select>
              <select
                value={filterStatut}
                onChange={(event) => setFilterStatut(event.target.value as StatutProprietaire | "tous")}
                className="w-full px-4 py-2.5 rounded-2xl text-sm border outline-none"
                style={{ borderColor: "#e2e8f0", backgroundColor: "#fff", fontFamily: inter.style.fontFamily }}
              >
                <option value="tous">Tous les statuts</option>
                <option value="actif">Actifs</option>
                <option value="archive">Archivés</option>
              </select>
            </div>
          </section>

          {proprietairesFiltres.length === 0 ? (
            <section className="bg-white rounded-3xl p-10 text-center shadow-sm" style={{ border: "1px solid #e2e8f0" }}>
              <p className="text-5xl mb-3">👥</p>
              <p className="text-base font-extrabold" style={{ color: "#1e293b" }}>
                Aucun propriétaire trouvé
              </p>
              <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>
                Modifiez vos filtres ou créez un nouveau propriétaire.
              </p>
            </section>
          ) : (
            <section className="space-y-3">
              {proprietairesFiltres.map((proprietaire) => {
                const isPhysical = proprietaire.typeProprietaire === "personne_physique";
                const relatedAssets = getBiensAssociesProprietaire(proprietaire.id);
                return (
                  <button
                    key={proprietaire.id}
                    type="button"
                    onClick={() => setView({ name: "detail", proprietaire })}
                    className="w-full text-left bg-white rounded-3xl p-4 sm:p-5 shadow-sm hover:shadow-md transition"
                    style={{ border: "1px solid #e2e8f0" }}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex items-center gap-4 min-w-0">
                        <div
                          className="w-14 h-14 rounded-3xl flex items-center justify-center text-2xl shrink-0"
                          style={{
                            background: isPhysical
                              ? "linear-gradient(135deg,#f97316,#fb923c)"
                              : "linear-gradient(135deg,#8b5cf6,#a78bfa)",
                            boxShadow: "0 8px 16px rgba(30,41,59,0.14)",
                          }}
                        >
                          {isPhysical ? "👤" : "🏢"}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-base font-black truncate" style={{ color: "#1e293b" }}>
                              {getNomAffichage(proprietaire)}
                            </p>
                            <StatutBadge statut={proprietaire.statut} />
                          </div>
                          <p className="text-xs font-bold mt-1" style={{ color: "#64748b" }}>
                            {getTypeProprietaireLabel(proprietaire.typeProprietaire)} · {proprietaire.reference}
                          </p>
                          <p className="text-xs mt-1 truncate" style={{ color: "#94a3b8" }}>
                            {getAdresseComplete(proprietaire.adresse)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="hidden sm:block text-right">
                          <p className="text-xs font-bold" style={{ color: "#94a3b8" }}>Biens associés</p>
                          <p className="text-sm font-black" style={{ color: "#1e293b" }}>{relatedAssets.length}</p>
                        </div>
                        <span
                          className="px-3 py-2 rounded-2xl text-xs font-extrabold"
                          style={{ backgroundColor: "#fff7ed", color: "#f97316" }}
                        >
                          Voir la fiche →
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </section>
          )}
        </main>
      </div>
    );
  }
