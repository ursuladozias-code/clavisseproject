"use client";

import { useMemo, useState } from "react";

// ============================================================
// TYPES
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
  numeroRCS?: string;
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
// Normalement, ces données viendront du module Bien.
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
    nom: "Dubois",
    prenom: "Michel",
    dateNaissance: "1975-04-12",
    nationalite: "Française",
    adresse: {
      numeroVoie: "22",
      typeVoie: "Rue",
      nomVoie: "de la République",
      complementAdresse: "",
      codePostal: "69002",
      ville: "Lyon",
      departement: "Rhône",
      region: "Auvergne-Rhône-Alpes",
      pays: "France",
    },
    telephonePrincipal: "0600000000",
    telephoneSecondaire: "",
    email: "michel.dubois@email.com",
    numeroFiscal: "1234567890123",
    residentFiscalFrancais: true,
    paysResidenceFiscale: "",
    documents: [
      {
        id: "doc001",
        nom: "Pièce d’identité",
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
    numeroRCS: "Lyon B 123 456 789",
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
  return type === "personne_physique"
    ? "Personne physique"
    : "Personne morale";
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
// UI PARTAGÉE
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
}: {
  label: string;
  value: string | number;
  onChange?: (value: string) => void;
  type?: string;
  required?: boolean;
  readOnly?: boolean;
  placeholder?: string;
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
        onChange={event => onChange?.(event.target.value)}
        readOnly={readOnly}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 rounded-2xl text-sm border outline-none"
        style={{
          borderColor: "#e2e8f0",
          backgroundColor: readOnly ? "#f8fafc" : "#fff",
          color: readOnly ? "#94a3b8" : "#1e293b",
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
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  required?: boolean;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-bold mb-1" style={{ color: "#64748b" }}>
        {label}
        {required && <span style={{ color: "#f97316" }}> *</span>}
      </label>

      <select
        value={value}
        onChange={event => onChange(event.target.value)}
        disabled={disabled}
        className="w-full px-4 py-2.5 rounded-2xl text-sm border outline-none"
        style={{
          borderColor: "#e2e8f0",
          backgroundColor: disabled ? "#f8fafc" : "#fff",
          color: disabled ? "#94a3b8" : "#1e293b",
        }}
      >
        <option value="">— Sélectionner —</option>
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function StatutBadge({ statut }: { statut: StatutProprietaire }) {
  const cfg: Record<StatutProprietaire, { label: string; bg: string; color: string }> =
    {
      actif: {
        label: "Actif",
        bg: "#dcfce7",
        color: "#166534",
      },
      archive: {
        label: "Archivé",
        bg: "#f1f5f9",
        color: "#64748b",
      },
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
  const cfg: Record<StatutActifAssocie, { label: string; bg: string; color: string }> =
    {
      vacant: {
        label: "Vacant",
        bg: "#fef9c3",
        color: "#854d0e",
      },
      occupe: {
        label: "Occupé",
        bg: "#dcfce7",
        color: "#166534",
      },
      archive: {
        label: "Archivé",
        bg: "#f1f5f9",
        color: "#64748b",
      },
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
// ADRESSE FORM
// ============================================================
function AdresseForm({
  adresse,
  setAdresse,
  locked = false,
}: {
  adresse: Adresse;
  setAdresse: (adresse: Adresse) => void;
  locked?: boolean;
}) {
  const update = (field: keyof Adresse, value: string) => {
    setAdresse({
      ...adresse,
      [field]: value,
    });
  };

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      <FormInput
        label="Numéro de voie"
        value={adresse.numeroVoie}
        onChange={value => update("numeroVoie", value)}
        readOnly={locked}
        required
      />

      <FormSelect
        label="Type de voie"
        value={adresse.typeVoie}
        onChange={value => update("typeVoie", value)}
        disabled={locked}
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
          value={adresse.nomVoie}
          onChange={value => update("nomVoie", value)}
          readOnly={locked}
          required
        />
      </div>

      <div className="sm:col-span-2">
        <FormInput
          label="Complément d’adresse"
          value={adresse.complementAdresse || ""}
          onChange={value => update("complementAdresse", value)}
          readOnly={locked}
        />
      </div>

      <FormInput
        label="Code postal"
        value={adresse.codePostal}
        onChange={value => update("codePostal", value)}
        readOnly={locked}
        required
      />

      <FormInput
        label="Ville"
        value={adresse.ville}
        onChange={value => update("ville", value)}
        readOnly={locked}
        required
      />

      <FormInput
        label="Département"
        value={adresse.departement}
        onChange={value => update("departement", value)}
        readOnly={locked}
      />

      <FormInput
        label="Région"
        value={adresse.region}
        onChange={value => update("region", value)}
        readOnly={locked}
      />

      <FormSelect
        label="Pays"
        value={adresse.pays}
        onChange={value => update("pays", value)}
        disabled={locked}
        required
        options={["France", "Belgique", "Suisse", "Luxembourg"].map(value => ({
          value,
          label: value,
        }))}
      />
    </div>
  );
}

// ============================================================
// CHOIX TYPE PROPRIÉTAIRE
// ============================================================
function ChoixTypeProprietaire({
  onChoix,
  onRetour,
}: {
  onChoix: (type: TypeProprietaire) => void;
  onRetour: () => void;
}) {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
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
          Quel type de propriétaire souhaitez-vous créer ?
        </h1>

        <p className="text-sm mb-8" style={{ color: "#94a3b8" }}>
          Le choix du type de propriétaire détermine le formulaire affiché.
        </p>

        <div className="grid sm:grid-cols-2 gap-4">
          <button
            onClick={() => onChoix("personne_physique")}
            className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-lg transition text-left border-2 hover:border-orange-300"
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
              Propriétaire individuel : civilité, nom, prénom, fiscalité et
              documents personnels.
            </p>
          </button>

          <button
            onClick={() => onChoix("personne_morale")}
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
              Personne morale
            </p>

            <p className="text-xs" style={{ color: "#94a3b8" }}>
              Société ou structure juridique : SCI, SARL, SAS, association ou
              autre forme morale.
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// FORMULAIRE PERSONNE PHYSIQUE
// ============================================================
function FormProprietairePhysique({
  reference,
  initial,
  hasAssociatedAssets = false,
  onSave,
  onCancel,
}: {
  reference: string;
  initial?: ProprietairePersonnePhysique;
  hasAssociatedAssets?: boolean;
  onSave: (proprietaire: ProprietairePersonnePhysique) => void;
  onCancel: () => void;
}) {
  const isEdit = !!initial;
  const identiteLocked = isEdit && hasAssociatedAssets;

  const [civilite, setCivilite] = useState<Civilite>(initial?.civilite || "Madame");
  const [nom, setNom] = useState(initial?.nom || "");
  const [prenom, setPrenom] = useState(initial?.prenom || "");
  const [dateNaissance, setDateNaissance] = useState(initial?.dateNaissance || "");
  const [nationalite, setNationalite] = useState(initial?.nationalite || "");

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

  const [telephonePrincipal, setTelephonePrincipal] = useState(
    initial?.telephonePrincipal || ""
  );
  const [telephoneSecondaire, setTelephoneSecondaire] = useState(
    initial?.telephoneSecondaire || ""
  );
  const [email, setEmail] = useState(initial?.email || "");

  const [numeroFiscal, setNumeroFiscal] = useState(initial?.numeroFiscal || "");
  const [residentFiscalFrancais, setResidentFiscalFrancais] = useState(
    initial?.residentFiscalFrancais ?? true
  );
  const [paysResidenceFiscale, setPaysResidenceFiscale] = useState(
    initial?.paysResidenceFiscale || ""
  );

  const [documents] = useState<DocumentProprietaire[]>(
    initial?.documents || [
      { id: "piece-identite", nom: "Pièce d’identité", obligatoire: true },
      {
        id: "justificatif-domicile",
        nom: "Justificatif de domicile",
        obligatoire: false,
      },
      {
        id: "documents-complementaires",
        nom: "Documents complémentaires",
        obligatoire: false,
      },
    ]
  );

  const canSave = nom && prenom && email;

  const handleSave = () => {
    const now = getToday();

    const historique: HistoriqueItem[] = [
      ...(initial?.historique || []),
      ...(isEdit
        ? [
            {
              id: `hist-${Date.now()}`,
              date: getToday(),
              heure: getNowTime(),
              utilisateur: "Utilisateur connecté",
              champ: "Fiche propriétaire",
              ancienneValeur: "Anciennes informations",
              nouvelleValeur: "Informations mises à jour",
            },
          ]
        : []),
    ];

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
      telephoneSecondaire,
      email,
      numeroFiscal,
      residentFiscalFrancais,
      paysResidenceFiscale: residentFiscalFrancais ? "" : paysResidenceFiscale,
      documents,
      historique,
      createdAt: initial?.createdAt || now,
      updatedAt: now,
    };

    onSave(proprietaire);
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
          <button
            onClick={onCancel}
            className="text-xs font-bold mb-3 hover:underline"
            style={{ color: "#f97316" }}
          >
            ← Retour
          </button>

          <h1 className="text-xl font-black" style={{ color: "#1e293b" }}>
            👤 {isEdit ? "Modifier" : "Nouveau"} propriétaire personne physique
          </h1>

          <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>
            Référence propriétaire : {reference}
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-4">
        {identiteLocked && (
          <div
            className="p-4 rounded-3xl"
            style={{ backgroundColor: "#fef9c3", border: "1px solid #fde68a" }}
          >
            <p className="text-sm font-bold" style={{ color: "#854d0e" }}>
              🔒 Les informations d’identité sont verrouillées car ce propriétaire
              est déjà associé à au moins un actif.
            </p>
          </div>
        )}

        <SectionCard>
          <SectionTitle emoji="🪪" title="Informations d’identité" />

          <div className="grid sm:grid-cols-2 gap-4">
            <FormSelect
              label="Civilité"
              value={civilite}
              onChange={value => setCivilite(value as Civilite)}
              disabled={identiteLocked}
              required
              options={[
                { value: "Monsieur", label: "Monsieur" },
                { value: "Madame", label: "Madame" },
              ]}
            />

            <FormInput label="Référence" value={reference} readOnly />

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
            />

            <FormInput
              label="Nationalité"
              value={nationalite}
              onChange={setNationalite}
              readOnly={identiteLocked}
            />
          </div>
        </SectionCard>

        <SectionCard>
          <SectionTitle emoji="📍" title="Coordonnées" />

          <AdresseForm adresse={adresse} setAdresse={setAdresse} />

          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <FormInput
              label="Téléphone principal"
              value={telephonePrincipal}
              onChange={setTelephonePrincipal}
            />

            <FormInput
              label="Téléphone secondaire"
              value={telephoneSecondaire}
              onChange={setTelephoneSecondaire}
            />

            <div className="sm:col-span-2">
              <FormInput
                label="Adresse e-mail"
                value={email}
                onChange={setEmail}
                type="email"
                required
              />
            </div>
          </div>
        </SectionCard>

        <SectionCard>
          <SectionTitle emoji="🏛️" title="Informations fiscales" />

          <div className="grid sm:grid-cols-2 gap-4">
            <FormInput
              label="Numéro fiscal"
              value={numeroFiscal}
              onChange={setNumeroFiscal}
            />

            <FormSelect
              label="Résident fiscal français"
              value={residentFiscalFrancais ? "oui" : "non"}
              onChange={value => setResidentFiscalFrancais(value === "oui")}
              options={[
                { value: "oui", label: "Oui" },
                { value: "non", label: "Non" },
              ]}
            />

            {!residentFiscalFrancais && (
              <div className="sm:col-span-2">
                <FormInput
                  label="Pays de résidence fiscale"
                  value={paysResidenceFiscale}
                  onChange={setPaysResidenceFiscale}
                  required
                />
              </div>
            )}
          </div>
        </SectionCard>

        <SectionCard>
          <SectionTitle emoji="📎" title="Documents" />

          <div className="space-y-2">
            {documents.map(document => (
              <div
                key={document.id}
                className="flex items-center justify-between p-3 rounded-2xl"
                style={{ backgroundColor: "#f8fafc" }}
              >
                <div>
                  <p className="text-sm font-bold" style={{ color: "#1e293b" }}>
                    📄 {document.nom}
                  </p>
                  <p className="text-xs" style={{ color: "#94a3b8" }}>
                    {document.obligatoire ? "Obligatoire" : "Facultatif"}
                  </p>
                </div>

                <label
                  className="px-3 py-1 rounded-xl text-xs font-bold cursor-pointer"
                  style={{ backgroundColor: "#fff7ed", color: "#f97316" }}
                >
                  + Ajouter
                  <input type="file" className="hidden" />
                </label>
              </div>
            ))}
          </div>
        </SectionCard>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-2xl text-sm font-bold border-2"
            style={{ borderColor: "#e2e8f0", color: "#64748b" }}
          >
            Annuler
          </button>

          <button
            onClick={handleSave}
            disabled={!canSave}
            className="flex-1 py-3 rounded-2xl text-white text-sm font-extrabold shadow disabled:opacity-50"
            style={{ background: "linear-gradient(135deg,#22c55e,#16a34a)" }}
          >
            ✅ Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// FORMULAIRE PERSONNE MORALE
// ============================================================
function FormProprietaireMorale({
  reference,
  initial,
  hasAssociatedAssets = false,
  onSave,
  onCancel,
}: {
  reference: string;
  initial?: ProprietairePersonneMorale;
  hasAssociatedAssets?: boolean;
  onSave: (proprietaire: ProprietairePersonneMorale) => void;
  onCancel: () => void;
}) {
  const isEdit = !!initial;
  const identiteLocked = isEdit && hasAssociatedAssets;

  const [raisonSociale, setRaisonSociale] = useState(initial?.raisonSociale || "");
  const [formeJuridique, setFormeJuridique] = useState<
    ProprietairePersonneMorale["formeJuridique"]
  >(initial?.formeJuridique || "SCI");
  const [siren, setSiren] = useState(initial?.siren || "");
  const [siret, setSiret] = useState(initial?.siret || "");
  const [numeroRCS, setNumeroRCS] = useState(initial?.numeroRCS || "");
  const [capitalSocial, setCapitalSocial] = useState<number>(
    initial?.capitalSocial || 0
  );
  const [dateCreation, setDateCreation] = useState(initial?.dateCreation || "");

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

  const [telephonePrincipal, setTelephonePrincipal] = useState(
    initial?.telephonePrincipal || ""
  );
  const [telephoneSecondaire, setTelephoneSecondaire] = useState(
    initial?.telephoneSecondaire || ""
  );
  const [email, setEmail] = useState(initial?.email || "");

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

  const [documents] = useState<DocumentProprietaire[]>(
    initial?.documents || [
      { id: "kbis", nom: "Extrait Kbis", obligatoire: true },
      { id: "statuts", nom: "Statuts de la société", obligatoire: false },
      {
        id: "piece-identite-representant",
        nom: "Pièce d’identité du représentant légal",
        obligatoire: false,
      },
      {
        id: "documents-complementaires",
        nom: "Documents complémentaires",
        obligatoire: false,
      },
    ]
  );

  const updateRepresentant = (
    field: keyof ProprietairePersonneMorale["representantLegal"],
    value: string
  ) => {
    setRepresentantLegal({
      ...representantLegal,
      [field]: value,
    });
  };

  const canSave =
    raisonSociale &&
    formeJuridique &&
    siren &&
    siret &&
    representantLegal.nom &&
    representantLegal.prenom &&
    representantLegal.fonction;

  const handleSave = () => {
    const now = getToday();

    const historique: HistoriqueItem[] = [
      ...(initial?.historique || []),
      ...(isEdit
        ? [
            {
              id: `hist-${Date.now()}`,
              date: getToday(),
              heure: getNowTime(),
              utilisateur: "Utilisateur connecté",
              champ: "Fiche propriétaire",
              ancienneValeur: "Anciennes informations",
              nouvelleValeur: "Informations mises à jour",
            },
          ]
        : []),
    ];

    const proprietaire: ProprietairePersonneMorale = {
      id: initial?.id || `pro-${Date.now()}`,
      reference,
      typeProprietaire: "personne_morale",
      statut: initial?.statut || "actif",
      raisonSociale,
      formeJuridique,
      siren,
      siret,
      numeroRCS,
      capitalSocial,
      dateCreation,
      adresse,
      telephonePrincipal,
      telephoneSecondaire,
      email,
      representantLegal,
      documents,
      historique,
      createdAt: initial?.createdAt || now,
      updatedAt: now,
    };

    onSave(proprietaire);
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
        style={{ background: "linear-gradient(135deg,#faf5ff,#fff)" }}
      >
        <div className="max-w-3xl mx-auto">
          <button
            onClick={onCancel}
            className="text-xs font-bold mb-3 hover:underline"
            style={{ color: "#8b5cf6" }}
          >
            ← Retour
          </button>

          <h1 className="text-xl font-black" style={{ color: "#1e293b" }}>
            🏢 {isEdit ? "Modifier" : "Nouveau"} propriétaire personne morale
          </h1>

          <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>
            Référence propriétaire : {reference}
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-4">
        {identiteLocked && (
          <div
            className="p-4 rounded-3xl"
            style={{ backgroundColor: "#fef9c3", border: "1px solid #fde68a" }}
          >
            <p className="text-sm font-bold" style={{ color: "#854d0e" }}>
              🔒 Les informations juridiques de la société sont verrouillées car
              ce propriétaire est déjà associé à au moins un actif.
            </p>
          </div>
        )}

        <SectionCard>
          <SectionTitle emoji="🏢" title="Informations de la société" />

          <div className="grid sm:grid-cols-2 gap-4">
            <FormInput
              label="Référence"
              value={reference}
              readOnly
            />

            <FormInput
              label="Raison sociale"
              value={raisonSociale}
              onChange={setRaisonSociale}
              readOnly={identiteLocked}
              required
            />

            <FormSelect
              label="Forme juridique"
              value={formeJuridique}
              onChange={value =>
                setFormeJuridique(
                  value as ProprietairePersonneMorale["formeJuridique"]
                )
              }
              disabled={identiteLocked}
              required
              options={[
                "SCI",
                "SARL",
                "EURL",
                "SAS",
                "SASU",
                "SA",
                "Association",
                "Autre",
              ].map(value => ({ value, label: value }))}
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
              label="Numéro RCS"
              value={numeroRCS}
              onChange={setNumeroRCS}
            />

            <FormInput
              label="Capital social (€)"
              value={capitalSocial}
              onChange={value => setCapitalSocial(Number(value))}
              type="number"
            />

            <FormInput
              label="Date de création"
              value={dateCreation}
              onChange={setDateCreation}
              readOnly={identiteLocked}
              type="date"
            />
          </div>
        </SectionCard>

        <SectionCard>
          <SectionTitle emoji="📍" title="Adresse du siège social" />
          <AdresseForm adresse={adresse} setAdresse={setAdresse} />
        </SectionCard>

        <SectionCard>
          <SectionTitle emoji="☎️" title="Coordonnées de la société" />

          <div className="grid sm:grid-cols-2 gap-4">
            <FormInput
              label="Téléphone principal"
              value={telephonePrincipal}
              onChange={setTelephonePrincipal}
            />

            <FormInput
              label="Téléphone secondaire"
              value={telephoneSecondaire}
              onChange={setTelephoneSecondaire}
            />

            <div className="sm:col-span-2">
              <FormInput
                label="E-mail"
                value={email}
                onChange={setEmail}
                type="email"
              />
            </div>
          </div>
        </SectionCard>

        <SectionCard>
          <SectionTitle emoji="👤" title="Représentant légal" />

          <div className="grid sm:grid-cols-2 gap-4">
            <FormSelect
              label="Civilité"
              value={representantLegal.civilite}
              onChange={value => updateRepresentant("civilite", value)}
              options={[
                { value: "Monsieur", label: "Monsieur" },
                { value: "Madame", label: "Madame" },
              ]}
            />

            <FormInput
              label="Fonction"
              value={representantLegal.fonction}
              onChange={value => updateRepresentant("fonction", value)}
              required
              placeholder="Gérant, Président, Associé gérant..."
            />

            <FormInput
              label="Nom"
              value={representantLegal.nom}
              onChange={value => updateRepresentant("nom", value)}
              required
            />

            <FormInput
              label="Prénom"
              value={representantLegal.prenom}
              onChange={value => updateRepresentant("prenom", value)}
              required
            />

            <FormInput
              label="Téléphone"
              value={representantLegal.telephone}
              onChange={value => updateRepresentant("telephone", value)}
            />

            <FormInput
              label="E-mail"
              value={representantLegal.email}
              onChange={value => updateRepresentant("email", value)}
              type="email"
            />
          </div>
        </SectionCard>

        <SectionCard>
          <SectionTitle emoji="📎" title="Documents" />

          <div className="space-y-2">
            {documents.map(document => (
              <div
                key={document.id}
                className="flex items-center justify-between p-3 rounded-2xl"
                style={{ backgroundColor: "#f8fafc" }}
              >
                <div>
                  <p className="text-sm font-bold" style={{ color: "#1e293b" }}>
                    📄 {document.nom}
                  </p>
                  <p className="text-xs" style={{ color: "#94a3b8" }}>
                    {document.obligatoire ? "Obligatoire" : "Facultatif"}
                  </p>
                </div>

                <label
                  className="px-3 py-1 rounded-xl text-xs font-bold cursor-pointer"
                  style={{ backgroundColor: "#f3e8ff", color: "#8b5cf6" }}
                >
                  + Ajouter
                  <input type="file" className="hidden" />
                </label>
              </div>
            ))}
          </div>
        </SectionCard>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-2xl text-sm font-bold border-2"
            style={{ borderColor: "#e2e8f0", color: "#64748b" }}
          >
            Annuler
          </button>

          <button
            onClick={handleSave}
            disabled={!canSave}
            className="flex-1 py-3 rounded-2xl text-white text-sm font-extrabold shadow disabled:opacity-50"
            style={{ background: "linear-gradient(135deg,#22c55e,#16a34a)" }}
          >
            ✅ Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// VUE DÉTAIL PROPRIÉTAIRE
// ============================================================
function VueDetailProprietaire({
  proprietaire,
  biensAssocies,
  onBack,
  onEdit,
  onDelete,
  onArchive,
  onOpenActif,
}: {
  proprietaire: Proprietaire;
  biensAssocies: BienAssocie[];
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onArchive: () => void;
  onOpenActif: (actif: BienAssocie) => void;
}) {
  const [onglet, setOnglet] = useState<
    "infos" | "biens" | "documents" | "historique"
  >("infos");

  const hasAssociatedAssets = biensAssocies.length > 0;

  const onglets = [
    { id: "infos", label: "Informations", emoji: "📋" },
    { id: "biens", label: "Biens associés", emoji: "🏠" },
    { id: "documents", label: "Documents", emoji: "📎" },
    { id: "historique", label: "Historique", emoji: "🕐" },
  ] as const;

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
        <div className="max-w-4xl mx-auto">
          <button
            onClick={onBack}
            className="text-xs font-bold mb-3 hover:underline"
            style={{ color: "#f97316" }}
          >
            ← Propriétaires
          </button>

          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-black" style={{ color: "#1e293b" }}>
                  {proprietaire.typeProprietaire === "personne_physique"
                    ? "👤"
                    : "🏢"}{" "}
                  {getNomAffichage(proprietaire)}
                </h1>

                <StatutBadge statut={proprietaire.statut} />
              </div>

              <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>
                {proprietaire.reference} ·{" "}
                {getTypeProprietaireLabel(proprietaire.typeProprietaire)}
              </p>
            </div>

            <div className="flex gap-2 flex-wrap">
              <button
                onClick={onEdit}
                className="px-4 py-2 rounded-2xl text-sm font-bold border-2"
                style={{
                  borderColor: "#f97316",
                  color: "#f97316",
                  backgroundColor: "#fff7ed",
                }}
              >
                ✏️ Modifier
              </button>

              <button
                onClick={onArchive}
                className="px-4 py-2 rounded-2xl text-sm font-bold border-2"
                style={{
                  borderColor: "#94a3b8",
                  color: "#64748b",
                  backgroundColor: "#fff",
                }}
              >
                📦 Archiver
              </button>

              <button
                onClick={onDelete}
                className="px-4 py-2 rounded-2xl text-sm font-bold border-2"
                style={{
                  borderColor: "#fecaca",
                  color: "#ef4444",
                  backgroundColor: "#fef2f2",
                }}
              >
                🗑 Supprimer
              </button>
            </div>
          </div>

          <div className="flex gap-2 mt-5 overflow-x-auto pb-1">
            {onglets.map(item => (
              <button
                key={item.id}
                onClick={() => setOnglet(item.id)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap"
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-4">
        {hasAssociatedAssets && (
          <div
            className="p-4 rounded-3xl"
            style={{ backgroundColor: "#eff6ff", border: "1px solid #bfdbfe" }}
          >
            <p className="text-sm font-bold" style={{ color: "#1d4ed8" }}>
              🔒 Ce propriétaire est associé à au moins un actif. Certaines
              informations d’identité sont verrouillées pour préserver la
              cohérence des baux, contrats et documents déjà générés.
            </p>
          </div>
        )}

        {onglet === "infos" && (
          <>
            {proprietaire.typeProprietaire === "personne_physique" ? (
              <SectionCard>
                <SectionTitle emoji="🪪" title="Identité" />

                <div className="grid sm:grid-cols-3 gap-3">
                  <InfoRow label="Civilité" value={proprietaire.civilite} />
                  <InfoRow label="Nom" value={proprietaire.nom} />
                  <InfoRow label="Prénom" value={proprietaire.prenom} />
                  <InfoRow
                    label="Date de naissance"
                    value={proprietaire.dateNaissance}
                  />
                  <InfoRow
                    label="Nationalité"
                    value={proprietaire.nationalite}
                  />
                  <InfoRow
                    label="Résident fiscal français"
                    value={proprietaire.residentFiscalFrancais ? "Oui" : "Non"}
                  />
                </div>
              </SectionCard>
            ) : (
              <SectionCard>
                <SectionTitle emoji="🏢" title="Informations société" />

                <div className="grid sm:grid-cols-3 gap-3">
                  <InfoRow
                    label="Raison sociale"
                    value={proprietaire.raisonSociale}
                  />
                  <InfoRow
                    label="Forme juridique"
                    value={proprietaire.formeJuridique}
                  />
                  <InfoRow label="SIREN" value={proprietaire.siren} />
                  <InfoRow label="SIRET" value={proprietaire.siret} />
                  <InfoRow
                    label="RCS"
                    value={proprietaire.numeroRCS || "—"}
                  />
                  <InfoRow
                    label="Capital"
                    value={
                      proprietaire.capitalSocial
                        ? `${proprietaire.capitalSocial} €`
                        : "—"
                    }
                  />
                </div>
              </SectionCard>
            )}

            <SectionCard>
              <SectionTitle emoji="📍" title="Coordonnées" />

              <div className="grid sm:grid-cols-3 gap-3">
                <InfoRow
                  label="Adresse"
                  value={getAdresseComplete(proprietaire.adresse)}
                />
                <InfoRow
                  label="Téléphone principal"
                  value={proprietaire.telephonePrincipal}
                />
                <InfoRow
                  label="Téléphone secondaire"
                  value={proprietaire.telephoneSecondaire || "—"}
                />
                <InfoRow label="E-mail" value={proprietaire.email} />
              </div>
            </SectionCard>

            {proprietaire.typeProprietaire === "personne_morale" && (
              <SectionCard>
                <SectionTitle emoji="👤" title="Représentant légal" />

                <div className="grid sm:grid-cols-3 gap-3">
                  <InfoRow
                    label="Civilité"
                    value={proprietaire.representantLegal.civilite}
                  />
                  <InfoRow
                    label="Nom"
                    value={proprietaire.representantLegal.nom}
                  />
                  <InfoRow
                    label="Prénom"
                    value={proprietaire.representantLegal.prenom}
                  />
                  <InfoRow
                    label="Fonction"
                    value={proprietaire.representantLegal.fonction}
                  />
                  <InfoRow
                    label="Téléphone"
                    value={proprietaire.representantLegal.telephone}
                  />
                  <InfoRow
                    label="E-mail"
                    value={proprietaire.representantLegal.email}
                  />
                </div>
              </SectionCard>
            )}
          </>
        )}

        {onglet === "biens" && (
          <SectionCard>
            <SectionTitle emoji="🏠" title="Biens associés" />

            {biensAssocies.length === 0 ? (
              <p className="text-sm text-center py-8" style={{ color: "#94a3b8" }}>
                Aucun actif associé à ce propriétaire.
              </p>
            ) : (
              <div className="space-y-2">
                {biensAssocies.map(actif => (
                  <button
                    key={actif.id}
                    onClick={() => onOpenActif(actif)}
                    className="w-full p-3 rounded-2xl text-left flex items-center justify-between gap-3"
                    style={{ backgroundColor: "#f8fafc" }}
                  >
                    <div>
                      <p className="text-sm font-extrabold" style={{ color: "#1e293b" }}>
                        {actif.nom}
                      </p>
                      <p className="text-xs" style={{ color: "#94a3b8" }}>
                        {actif.reference} · {getTypeActifLabel(actif.typeActif)} ·{" "}
                        {actif.adresse}
                      </p>
                    </div>

                    <StatutActifBadge statut={actif.statut} />
                  </button>
                ))}
              </div>
            )}
          </SectionCard>
        )}

        {onglet === "documents" && (
          <SectionCard>
            <SectionTitle emoji="📎" title="Documents" />

            <div className="space-y-2">
              {proprietaire.documents.map(document => (
                <div
                  key={document.id}
                  className="flex items-center justify-between p-3 rounded-2xl"
                  style={{ backgroundColor: "#f8fafc" }}
                >
                  <div>
                    <p className="text-sm font-bold" style={{ color: "#1e293b" }}>
                      📄 {document.nom}
                    </p>
                    <p className="text-xs" style={{ color: "#94a3b8" }}>
                      {document.obligatoire ? "Obligatoire" : "Facultatif"}
                      {document.dateAjout ? ` · Ajouté le ${document.dateAjout}` : ""}
                    </p>
                  </div>

                  <button
                    className="px-3 py-1 rounded-xl text-xs font-bold"
                    style={{ backgroundColor: "#eff6ff", color: "#3b82f6" }}
                  >
                    Voir
                  </button>
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        {onglet === "historique" && (
          <SectionCard>
            <SectionTitle emoji="🕐" title="Historique" />

            {proprietaire.historique.length === 0 ? (
              <p className="text-sm text-center py-8" style={{ color: "#94a3b8" }}>
                Aucune modification enregistrée.
              </p>
            ) : (
              <div className="space-y-2">
                {proprietaire.historique.map(item => (
                  <div
                    key={item.id}
                    className="p-3 rounded-2xl"
                    style={{ backgroundColor: "#f8fafc" }}
                  >
                    <div className="flex justify-between gap-3 mb-1">
                      <p className="text-xs font-extrabold" style={{ color: "#1e293b" }}>
                        {item.champ}
                      </p>
                      <p className="text-xs" style={{ color: "#94a3b8" }}>
                        {item.date} à {item.heure}
                      </p>
                    </div>

                    <p className="text-xs" style={{ color: "#64748b" }}>
                      {item.ancienneValeur} → {item.nouvelleValeur}
                    </p>

                    <p className="text-xs mt-1" style={{ color: "#94a3b8" }}>
                      Par {item.utilisateur}
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
// LISTE PROPRIÉTAIRES
// ============================================================
function VueListeProprietaires({
  proprietaires,
  biensAssocies,
  limiteAtteinte,
  onAdd,
  onSelect,
}: {
  proprietaires: Proprietaire[];
  biensAssocies: BienAssocie[];
  limiteAtteinte: boolean;
  onAdd: () => void;
  onSelect: (proprietaire: Proprietaire) => void;
}) {
  const [recherche, setRecherche] = useState("");
  const [showArchives, setShowArchives] = useState(false);

  const proprietairesFiltres = proprietaires.filter(proprietaire => {
    if (!showArchives && proprietaire.statut === "archive") return false;

    const query = recherche.toLowerCase();

    const match =
      getNomAffichage(proprietaire).toLowerCase().includes(query) ||
      proprietaire.reference.toLowerCase().includes(query) ||
      proprietaire.email.toLowerCase().includes(query);

    return match;
  });

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
        <div className="max-w-5xl mx-auto">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-black" style={{ color: "#1e293b" }}>
                👥 Propriétaires
              </h1>

              <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>
                Référentiel officiel des bailleurs de la plateforme.
              </p>
            </div>

            <button
              onClick={onAdd}
              disabled={limiteAtteinte}
              className="px-5 py-2.5 rounded-2xl text-white text-sm font-extrabold shadow-lg disabled:opacity-50"
              style={{ background: "linear-gradient(135deg,#f97316,#fb923c)" }}
            >
              + Ajouter un propriétaire
            </button>
          </div>

          {limiteAtteinte && (
            <div
              className="mt-4 p-3 rounded-2xl"
              style={{ backgroundColor: "#fef9c3", border: "1px solid #fde68a" }}
            >
              <p className="text-sm font-bold" style={{ color: "#854d0e" }}>
                Vous avez atteint le nombre maximum de propriétaires autorisés
                par votre abonnement.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5">
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <input
            value={recherche}
            onChange={event => setRecherche(event.target.value)}
            placeholder="Rechercher par nom, référence ou e-mail..."
            className="flex-1 px-4 py-3 rounded-2xl text-sm border outline-none"
            style={{ borderColor: "#e2e8f0", backgroundColor: "#fff" }}
          />

          <button
            onClick={() => setShowArchives(value => !value)}
            className="px-4 py-3 rounded-2xl text-xs font-bold border-2"
            style={{
              borderColor: showArchives ? "#f97316" : "#e2e8f0",
              backgroundColor: showArchives ? "#fff7ed" : "#fff",
              color: showArchives ? "#f97316" : "#64748b",
            }}
          >
            {showArchives ? "Masquer archives" : "Afficher archives"}
          </button>
        </div>

        {proprietairesFiltres.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">👥</div>

            <p className="font-bold text-base" style={{ color: "#1e293b" }}>
              Aucun propriétaire trouvé
            </p>

            <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>
              Créez votre premier profil propriétaire.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {proprietairesFiltres.map(proprietaire => {
              const biensDuProprietaire = biensAssocies.filter(
                actif => actif.proprietaireId === proprietaire.id
              );

              return (
                <button
                  key={proprietaire.id}
                  onClick={() => onSelect(proprietaire)}
                  className="w-full bg-white rounded-3xl p-4 shadow-sm hover:shadow-md transition text-left"
                >
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl"
                        style={{
                          background:
                            proprietaire.typeProprietaire === "personne_physique"
                              ? "linear-gradient(135deg,#f97316,#fb923c)"
                              : "linear-gradient(135deg,#8b5cf6,#a78bfa)",
                        }}
                      >
                        {proprietaire.typeProprietaire === "personne_physique"
                          ? "👤"
                          : "🏢"}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p
                            className="font-extrabold text-sm"
                            style={{ color: "#1e293b" }}
                          >
                            {getNomAffichage(proprietaire)}
                          </p>

                          <StatutBadge statut={proprietaire.statut} />
                        </div>

                        <p className="text-xs" style={{ color: "#94a3b8" }}>
                          {proprietaire.reference} ·{" "}
                          {getTypeProprietaireLabel(
                            proprietaire.typeProprietaire
                          )}
                        </p>

                        <p className="text-xs mt-0.5" style={{ color: "#cbd5e1" }}>
                          {proprietaire.email}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-xs font-bold" style={{ color: "#64748b" }}>
                        {biensDuProprietaire.length} actif(s) associé(s)
                      </p>

                      <p className="text-xs mt-1" style={{ color: "#94a3b8" }}>
                        {proprietaire.adresse.ville}
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
// MODULE PRINCIPAL
// ============================================================
export default function ModuleProprietaires() {
  const [view, setView] = useState<ViewState>({ name: "liste" });
  const [proprietaires, setProprietaires] =
    useState<Proprietaire[]>(mockProprietaires);

  const biensAssocies = mockBiensAssocies;

  const limiteAtteinte = useMemo(() => {
    if (mockAbonnement.illimite) return false;

    const proprietairesActifs = proprietaires.filter(
      proprietaire => proprietaire.statut !== "archive"
    );

    return proprietairesActifs.length >= mockAbonnement.limiteBiens;
  }, [proprietaires]);

  const getBiensAssociesProprietaire = (proprietaireId: string) => {
    return biensAssocies.filter(actif => actif.proprietaireId === proprietaireId);
  };

  const refreshSelectedProprietaire = (proprietaire: Proprietaire) => {
    const fresh = proprietaires.find(item => item.id === proprietaire.id);

    if (fresh) {
      setView({ name: "detail", proprietaire: fresh });
    } else {
      setView({ name: "liste" });
    }
  };

  const saveProprietaire = (proprietaire: Proprietaire) => {
    setProprietaires(prev => {
      const exists = prev.some(item => item.id === proprietaire.id);

      if (exists) {
        return prev.map(item =>
          item.id === proprietaire.id ? proprietaire : item
        );
      }

      return [...prev, proprietaire];
    });

    setView({ name: "liste" });
  };

  const deleteProprietaire = (proprietaire: Proprietaire) => {
    const actifs = getBiensAssociesProprietaire(proprietaire.id);

    if (actifs.length > 0) {
      alert(
        "Ce propriétaire est actuellement associé à un ou plusieurs biens et ne peut pas être supprimé."
      );
      return;
    }

    setProprietaires(prev => prev.filter(item => item.id !== proprietaire.id));
    setView({ name: "liste" });
  };

  const archiveProprietaire = (proprietaire: Proprietaire) => {
    const updated: Proprietaire = {
      ...proprietaire,
      statut: "archive",
      updatedAt: getToday(),
      historique: [
        ...proprietaire.historique,
        {
          id: `hist-${Date.now()}`,
          date: getToday(),
          heure: getNowTime(),
          utilisateur: "Utilisateur connecté",
          champ: "Statut",
          ancienneValeur: proprietaire.statut,
          nouvelleValeur: "archive",
        },
      ],
    };

    setProprietaires(prev =>
      prev.map(item => (item.id === proprietaire.id ? updated : item))
    );

    setView({ name: "liste" });
  };

  if (view.name === "choix") {
    return (
      <ChoixTypeProprietaire
        onRetour={() => setView({ name: "liste" })}
        onChoix={type => {
          if (type === "personne_physique") {
            setView({ name: "creation_physique" });
          } else {
            setView({ name: "creation_morale" });
          }
        }}
      />
    );
  }

  if (view.name === "creation_physique") {
    return (
      <FormProprietairePhysique
        reference={generateReferenceProprietaire(proprietaires.length)}
        onSave={saveProprietaire}
        onCancel={() => setView({ name: "choix" })}
      />
    );
  }

  if (view.name === "creation_morale") {
    return (
      <FormProprietaireMorale
        reference={generateReferenceProprietaire(proprietaires.length)}
        onSave={saveProprietaire}
        onCancel={() => setView({ name: "choix" })}
      />
    );
  }

  if (view.name === "edition") {
    const biensDuProprietaire = getBiensAssociesProprietaire(
      view.proprietaire.id
    );

    if (view.proprietaire.typeProprietaire === "personne_physique") {
      return (
        <FormProprietairePhysique
          reference={view.proprietaire.reference}
          initial={view.proprietaire}
          hasAssociatedAssets={biensDuProprietaire.length > 0}
          onSave={saveProprietaire}
          onCancel={() => refreshSelectedProprietaire(view.proprietaire)}
        />
      );
    }

    return (
      <FormProprietaireMorale
        reference={view.proprietaire.reference}
        initial={view.proprietaire}
        hasAssociatedAssets={biensDuProprietaire.length > 0}
        onSave={saveProprietaire}
        onCancel={() => refreshSelectedProprietaire(view.proprietaire)}
      />
    );
  }

  if (view.name === "detail") {
    const biensDuProprietaire = getBiensAssociesProprietaire(
      view.proprietaire.id
    );

    return (
      <VueDetailProprietaire
        proprietaire={view.proprietaire}
        biensAssocies={biensDuProprietaire}
        onBack={() => setView({ name: "liste" })}
        onEdit={() =>
          setView({ name: "edition", proprietaire: view.proprietaire })
        }
        onDelete={() => deleteProprietaire(view.proprietaire)}
        onArchive={() => archiveProprietaire(view.proprietaire)}
        onOpenActif={actif => {
          alert(
            `Navigation vers le module Bien : ${actif.reference} — ${actif.nom}`
          );
        }}
      />
    );
  }

  return (
    <VueListeProprietaires
      proprietaires={proprietaires}
      biensAssocies={biensAssocies}
      limiteAtteinte={limiteAtteinte}
      onAdd={() => {
        if (!limiteAtteinte) {
          setView({ name: "choix" });
        }
      }}
      onSelect={proprietaire =>
        setView({ name: "detail", proprietaire })
      }
    />
  );
}