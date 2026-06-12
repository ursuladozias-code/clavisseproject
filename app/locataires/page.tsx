"use client";

import { useMemo, useState, type ReactNode } from "react";

// ============================================================
// TYPES
// ============================================================
type Civilite = "Monsieur" | "Madame";
type StatutLocataire = "actif" | "archive";
type SituationFamiliale = "celibataire" | "marie" | "pacse" | "divorce" | "veuf";
type TypeContratTravail =
  | "CDI"
  | "CDD"
  | "Fonctionnaire"
  | "Indépendant"
  | "Retraité"
  | "Étudiant"
  | "Sans emploi"
  | "Autre";

type TypeGarant = "personne_physique" | "personne_morale";
type StatutAssurance = "non_fournie" | "fournie" | "expiree";
type StatutBail = "brouillon" | "signe" | "resilie";
type StatutContrat = "actif" | "termine" | "en_attente";
type StatutPaiementQuittance =
  | "en_attente"
  | "paye"
  | "impaye"
  | "partiellement_paye";

type StatutPaiementLocataire = "parfait" | "vigilance" | "critique";

type TypeOperationPaiement =
  | "quittance_generee"
  | "paiement_enregistre"
  | "impaye"
  | "paiement_partiel"
  | "regularisation";

interface Adresse {
  numeroVoie: string;
  typeVoie: string;
  nomVoie: string;
  complementAdresse?: string;
  codePostal: string;
  ville: string;
  pays: string;
}

interface DocumentItem {
  id: string;
  nom: string;
  categorie:
    | "identite"
    | "revenus"
    | "fiscal"
    | "domicile"
    | "assurance"
    | "garant"
    | "complementaire";
  obligatoire?: boolean;
  multiple?: boolean;
  fichier?: File | null;
  dateAjout?: string;
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

interface HistoriquePaiementItem {
  id: string;
  locataireId: string;
  date: string;
  typeOperation: TypeOperationPaiement;
  montant: number;
  statut: StatutPaiementQuittance;
  quittanceReference: string;
}

interface AssuranceHabitation {
  compagnie: string;
  numeroContrat: string;
  dateEffet: string;
  dateEcheance: string;
  attestation?: DocumentItem | null;
}

interface GarantBase {
  id: string;
  typeGarant: TypeGarant;
  telephone: string;
  email: string;
  documents: DocumentItem[];
}

interface GarantPersonnePhysique extends GarantBase {
  typeGarant: "personne_physique";
  civilite: Civilite;
  nom: string;
  prenom: string;
  dateNaissance: string;
  adresse: Adresse;
  profession: string;
  revenusMensuels: number;
}

interface GarantPersonneMorale extends GarantBase {
  typeGarant: "personne_morale";
  raisonSociale: string;
  formeJuridique: string;
  siren: string;
  siret: string;
  adresseSiege: Adresse;
  representantLegal: {
    nom: string;
    prenom: string;
    fonction: string;
  };
}

type Garant = GarantPersonnePhysique | GarantPersonneMorale;

interface OccupationActuelle {
  bienId: string;
  referenceBien: string;
  nomBien: string;
  adresseBien: string;
  dateEntree: string;
  bailActifReference: string;
  contratActifReference: string;
  statutContrat: StatutContrat;
}

interface BailAssocie {
  id: string;
  locataireId: string;
  reference: string;
  bienId: string;
  nomBien: string;
  adresseBien: string;
  dateDebut: string;
  dateFin: string;
  statut: StatutBail;
}

interface QuittanceAssociee {
  id: string;
  locataireId: string;
  contratId: string;
  reference: string;
  moisConcerne: string;
  dateEmission: string;
  dateEcheance: string;
  montantLoyer: number;
  montantCharges: number;
  montantTotal: number;
  statutPaiement: StatutPaiementQuittance;
}

interface Locataire {
  id: string;
  reference: string;
  statut: StatutLocataire;

  civilite: Civilite;
  nom: string;
  prenom: string;
  dateNaissance: string;
  lieuNaissance: string;
  nationalite: string;

  adresseActuelle: Adresse;
  telephonePrincipal: string;
  telephoneSecondaire?: string;
  email: string;

  situationFamiliale: SituationFamiliale;
  nombreOccupants: number;

  profession: string;
  employeur: string;
  typeContrat: TypeContratTravail;
  revenusMensuelsNets: number;

  documents: DocumentItem[];
  garants: Garant[];
  assuranceHabitation: AssuranceHabitation;

  historique: HistoriqueItem[];

  createdAt: string;
  updatedAt: string;
}

type ViewState =
  | { name: "liste" }
  | { name: "creation" }
  | { name: "detail"; locataire: Locataire }
  | { name: "edition"; locataire: Locataire };

// ============================================================
// MOCK DATA
// ============================================================
const adresseVide: Adresse = {
  numeroVoie: "",
  typeVoie: "Rue",
  nomVoie: "",
  complementAdresse: "",
  codePostal: "",
  ville: "",
  pays: "France",
};

const mockLocataires: Locataire[] = [
  {
    id: "loc001",
    reference: "LOC-000001",
    statut: "actif",
    civilite: "Madame",
    nom: "Martin",
    prenom: "Claire",
    dateNaissance: "1992-05-14",
    lieuNaissance: "Lyon",
    nationalite: "Française",
    adresseActuelle: {
      numeroVoie: "12",
      typeVoie: "Rue",
      nomVoie: "Victor Hugo",
      complementAdresse: "Appartement 3B",
      codePostal: "69001",
      ville: "Lyon",
      pays: "France",
    },
    telephonePrincipal: "0601020304",
    telephoneSecondaire: "",
    email: "claire.martin@email.com",
    situationFamiliale: "celibataire",
    nombreOccupants: 1,
    profession: "Chargée de communication",
    employeur: "Agence Nova",
    typeContrat: "CDI",
    revenusMensuelsNets: 2400,
    documents: [
      {
        id: "doc-loc-1",
        nom: "Pièce d’identité",
        categorie: "identite",
        obligatoire: true,
        dateAjout: "2026-01-10",
      },
      {
        id: "doc-loc-2",
        nom: "Fiche de salaire janvier",
        categorie: "revenus",
        multiple: true,
        dateAjout: "2026-01-10",
      },
    ],
    garants: [],
    assuranceHabitation: {
      compagnie: "MAIF",
      numeroContrat: "ASS-98273",
      dateEffet: "2025-06-01",
      dateEcheance: "2026-06-01",
      attestation: {
        id: "ass-1",
        nom: "Attestation assurance habitation",
        categorie: "assurance",
        dateAjout: "2025-06-01",
      },
    },
    historique: [],
    createdAt: "2026-01-10",
    updatedAt: "2026-01-10",
  },
  {
    id: "loc002",
    reference: "LOC-000002",
    statut: "actif",
    civilite: "Monsieur",
    nom: "Bernard",
    prenom: "Yanis",
    dateNaissance: "1988-09-02",
    lieuNaissance: "Marseille",
    nationalite: "Française",
    adresseActuelle: {
      numeroVoie: "8",
      typeVoie: "Avenue",
      nomVoie: "Jean Jaurès",
      complementAdresse: "Lot 1A",
      codePostal: "69007",
      ville: "Lyon",
      pays: "France",
    },
    telephonePrincipal: "0611121314",
    telephoneSecondaire: "",
    email: "yanis.bernard@email.com",
    situationFamiliale: "marie",
    nombreOccupants: 2,
    profession: "Développeur",
    employeur: "Tech Studio",
    typeContrat: "CDI",
    revenusMensuelsNets: 3200,
    documents: [
      {
        id: "doc-loc-3",
        nom: "Pièce d’identité",
        categorie: "identite",
        obligatoire: true,
        dateAjout: "2026-02-01",
      },
    ],
    garants: [
      {
        id: "gar-1",
        typeGarant: "personne_physique",
        civilite: "Madame",
        nom: "Bernard",
        prenom: "Nadia",
        dateNaissance: "1962-03-20",
        adresse: {
          numeroVoie: "4",
          typeVoie: "Rue",
          nomVoie: "des Fleurs",
          complementAdresse: "",
          codePostal: "13001",
          ville: "Marseille",
          pays: "France",
        },
        telephone: "0600000000",
        email: "nadia.bernard@email.com",
        profession: "Infirmière",
        revenusMensuels: 2800,
        documents: [],
      },
    ],
    assuranceHabitation: {
      compagnie: "",
      numeroContrat: "",
      dateEffet: "",
      dateEcheance: "",
      attestation: null,
    },
    historique: [],
    createdAt: "2026-02-01",
    updatedAt: "2026-02-01",
  },
];

const mockOccupations: OccupationActuelle[] = [
  {
    bienId: "bi001",
    referenceBien: "BI-000001",
    nomBien: "Appartement T3 Centre-ville",
    adresseBien: "12 Rue Victor Hugo, 69001 Lyon",
    dateEntree: "2025-06-01",
    bailActifReference: "BAIL-000001",
    contratActifReference: "CONTRAT-000001",
    statutContrat: "actif",
  },
];

const mockBaux: BailAssocie[] = [
  {
    id: "bail001",
    locataireId: "loc001",
    reference: "BAIL-000001",
    bienId: "bi001",
    nomBien: "Appartement T3 Centre-ville",
    adresseBien: "12 Rue Victor Hugo, 69001 Lyon",
    dateDebut: "2025-06-01",
    dateFin: "2028-05-31",
    statut: "signe",
  },
  {
    id: "bail002",
    locataireId: "loc002",
    reference: "BAIL-000002",
    bienId: "lot001",
    nomBien: "Appartement 1A",
    adresseBien: "8 Avenue Jean Jaurès, 69007 Lyon",
    dateDebut: "2026-02-01",
    dateFin: "2029-01-31",
    statut: "signe",
  },
];

const mockQuittances: QuittanceAssociee[] = [
  {
    id: "quit001",
    locataireId: "loc001",
    contratId: "contrat001",
    reference: "QUI-2026-001",
    moisConcerne: "Janvier 2026",
    dateEmission: "2026-01-01",
    dateEcheance: "2026-01-05",
    montantLoyer: 920,
    montantCharges: 80,
    montantTotal: 1000,
    statutPaiement: "paye",
  },
  {
    id: "quit002",
    locataireId: "loc001",
    contratId: "contrat001",
    reference: "QUI-2026-002",
    moisConcerne: "Février 2026",
    dateEmission: "2026-02-01",
    dateEcheance: "2026-02-05",
    montantLoyer: 920,
    montantCharges: 80,
    montantTotal: 1000,
    statutPaiement: "paye",
  },
  {
    id: "quit003",
    locataireId: "loc002",
    contratId: "contrat002",
    reference: "QUI-2026-003",
    moisConcerne: "Mars 2026",
    dateEmission: "2026-03-01",
    dateEcheance: "2026-03-05",
    montantLoyer: 750,
    montantCharges: 60,
    montantTotal: 810,
    statutPaiement: "impaye",
  },
  {
    id: "quit004",
    locataireId: "loc002",
    contratId: "contrat002",
    reference: "QUI-2026-004",
    moisConcerne: "Avril 2026",
    dateEmission: "2026-04-01",
    dateEcheance: "2026-04-05",
    montantLoyer: 750,
    montantCharges: 60,
    montantTotal: 810,
    statutPaiement: "partiellement_paye",
  },
];

const mockHistoriquePaiements: HistoriquePaiementItem[] = [
  {
    id: "hp001",
    locataireId: "loc001",
    date: "2026-01-02",
    typeOperation: "paiement_enregistre",
    montant: 1000,
    statut: "paye",
    quittanceReference: "QUI-2026-001",
  },
  {
    id: "hp002",
    locataireId: "loc002",
    date: "2026-03-06",
    typeOperation: "impaye",
    montant: 810,
    statut: "impaye",
    quittanceReference: "QUI-2026-003",
  },
  {
    id: "hp003",
    locataireId: "loc002",
    date: "2026-04-06",
    typeOperation: "paiement_partiel",
    montant: 400,
    statut: "partiellement_paye",
    quittanceReference: "QUI-2026-004",
  },
];

// ============================================================
// HELPERS
// ============================================================
function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function getNowTime() {
  return new Date().toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function generateReferenceLocataire(count: number) {
  return `LOC-${String(count + 1).padStart(6, "0")}`;
}

function getNomLocataire(locataire: Locataire) {
  return `${locataire.prenom} ${locataire.nom}`;
}

function getAdresseComplete(adresse: Adresse) {
  return `${adresse.numeroVoie} ${adresse.typeVoie} ${adresse.nomVoie}, ${adresse.codePostal} ${adresse.ville}`;
}

function getSituationFamilialeLabel(value: SituationFamiliale) {
  const labels: Record<SituationFamiliale, string> = {
    celibataire: "Célibataire",
    marie: "Marié",
    pacse: "Pacsé",
    divorce: "Divorcé",
    veuf: "Veuf",
  };

  return labels[value];
}

function getStatutQuittanceLabel(value: StatutPaiementQuittance) {
  const labels: Record<StatutPaiementQuittance, string> = {
    en_attente: "En attente",
    paye: "Payé",
    impaye: "Impayé",
    partiellement_paye: "Partiellement payé",
  };

  return labels[value];
}

function getOperationPaiementLabel(value: TypeOperationPaiement) {
  const labels: Record<TypeOperationPaiement, string> = {
    quittance_generee: "Quittance générée",
    paiement_enregistre: "Paiement enregistré",
    impaye: "Impayé",
    paiement_partiel: "Paiement partiel",
    regularisation: "Régularisation",
  };

  return labels[value];
}

function calculerStatutAssurance(assurance: AssuranceHabitation): StatutAssurance {
  if (!assurance.attestation) return "non_fournie";

  if (assurance.dateEcheance && new Date(assurance.dateEcheance) < new Date()) {
    return "expiree";
  }

  return "fournie";
}

function calculerStatutPaiementLocataire(
  quittances: QuittanceAssociee[]
): StatutPaiementLocataire {
  const incidents = quittances.filter(
    quittance =>
      quittance.statutPaiement === "impaye" ||
      quittance.statutPaiement === "partiellement_paye"
  ).length;

  if (incidents >= 3) return "critique";
  if (incidents >= 2) return "vigilance";
  return "parfait";
}

function hasSignedBail(baux: BailAssocie[]) {
  return baux.some(bail => bail.statut === "signe");
}

// ============================================================
// UI PARTAGÉE
// ============================================================
function SectionCard({ children }: { children: ReactNode }) {
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

function StatutLocataireBadge({ statut }: { statut: StatutLocataire }) {
  const cfg: Record<StatutLocataire, { label: string; bg: string; color: string }> = {
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

function StatutPaiementBadge({ statut }: { statut: StatutPaiementLocataire }) {
  const cfg: Record<StatutPaiementLocataire, { label: string; bg: string; color: string }> =
    {
      parfait: { label: "Parfait", bg: "#dcfce7", color: "#166534" },
      vigilance: { label: "Vigilance", bg: "#fef9c3", color: "#854d0e" },
      critique: { label: "Critique", bg: "#fee2e2", color: "#991b1b" },
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

function StatutQuittanceBadge({ statut }: { statut: StatutPaiementQuittance }) {
  const cfg: Record<StatutPaiementQuittance, { bg: string; color: string }> = {
    en_attente: { bg: "#fef9c3", color: "#854d0e" },
    paye: { bg: "#dcfce7", color: "#166534" },
    impaye: { bg: "#fee2e2", color: "#991b1b" },
    partiellement_paye: { bg: "#ffedd5", color: "#9a3412" },
  };

  const c = cfg[statut];

  return (
    <span
      className="px-2 py-0.5 rounded-full text-xs font-bold"
      style={{ backgroundColor: c.bg, color: c.color }}
    >
      {getStatutQuittanceLabel(statut)}
    </span>
  );
}

function StatutAssuranceBadge({ statut }: { statut: StatutAssurance }) {
  const cfg: Record<StatutAssurance, { label: string; bg: string; color: string }> =
    {
      non_fournie: { label: "Non fournie", bg: "#f1f5f9", color: "#64748b" },
      fournie: { label: "Fournie", bg: "#dcfce7", color: "#166534" },
      expiree: { label: "Expirée", bg: "#fee2e2", color: "#991b1b" },
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
// FORM ADRESSE
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
    setAdresse({ ...adresse, [field]: value });
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

      <div className="sm:col-span-2">
        <FormInput
          label="Pays"
          value={adresse.pays}
          onChange={value => update("pays", value)}
          readOnly={locked}
          required
        />
      </div>
    </div>
  );
}

// ============================================================
// GARANTS
// ============================================================
function createGarantPhysique(): GarantPersonnePhysique {
  return {
    id: `gar-${Date.now()}`,
    typeGarant: "personne_physique",
    civilite: "Madame",
    nom: "",
    prenom: "",
    dateNaissance: "",
    adresse: { ...adresseVide },
    telephone: "",
    email: "",
    profession: "",
    revenusMensuels: 0,
    documents: [],
  };
}

function createGarantMorale(): GarantPersonneMorale {
  return {
    id: `gar-${Date.now()}`,
    typeGarant: "personne_morale",
    raisonSociale: "",
    formeJuridique: "",
    siren: "",
    siret: "",
    adresseSiege: { ...adresseVide },
    representantLegal: {
      nom: "",
      prenom: "",
      fonction: "",
    },
    telephone: "",
    email: "",
    documents: [],
  };
}

function GarantsSection({
  garants,
  setGarants,
  locked = false,
}: {
  garants: Garant[];
  setGarants: (garants: Garant[]) => void;
  locked?: boolean;
}) {
  const addGarant = (typeGarant: TypeGarant) => {
    setGarants([
      ...garants,
      typeGarant === "personne_physique" ? createGarantPhysique() : createGarantMorale(),
    ]);
  };

  const removeGarant = (id: string) => {
    setGarants(garants.filter(garant => garant.id !== id));
  };

  const updateGarant = (id: string, updated: Garant) => {
    setGarants(garants.map(garant => (garant.id === id ? updated : garant)));
  };

  return (
    <SectionCard>
      <div className="flex items-center justify-between gap-3 mb-4">
        <SectionTitle emoji="🛡️" title="Garants" />

        {!locked && (
          <div className="flex gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => addGarant("personne_physique")}
              className="px-3 py-1.5 rounded-xl text-xs font-bold"
              style={{ backgroundColor: "#fff7ed", color: "#f97316" }}
            >
              + Garant physique
            </button>

            <button
              type="button"
              onClick={() => addGarant("personne_morale")}
              className="px-3 py-1.5 rounded-xl text-xs font-bold"
              style={{ backgroundColor: "#f3e8ff", color: "#8b5cf6" }}
            >
              + Garant moral
            </button>
          </div>
        )}
      </div>

      {locked && (
        <div
          className="p-3 rounded-2xl mb-4"
          style={{ backgroundColor: "#fef9c3", border: "1px solid #fde68a" }}
        >
          <p className="text-xs font-bold" style={{ color: "#854d0e" }}>
            🔒 Les informations des garants sont verrouillées car elles sont
            reprises dans un bail signé.
          </p>
        </div>
      )}

      {garants.length === 0 ? (
        <p className="text-sm text-center py-4" style={{ color: "#94a3b8" }}>
          Aucun garant enregistré.
        </p>
      ) : (
        <div className="space-y-4">
          {garants.map((garant, index) => (
            <div
              key={garant.id}
              className="p-4 rounded-3xl border"
              style={{ borderColor: "#e2e8f0", backgroundColor: "#f8fafc" }}
            >
              <div className="flex justify-between gap-3 mb-4">
                <p className="text-sm font-extrabold" style={{ color: "#1e293b" }}>
                  Garant {index + 1} —{" "}
                  {garant.typeGarant === "personne_physique"
                    ? "Personne physique"
                    : "Personne morale"}
                </p>

                {!locked && (
                  <button
                    type="button"
                    onClick={() => removeGarant(garant.id)}
                    className="text-xs font-bold"
                    style={{ color: "#ef4444" }}
                  >
                    Supprimer
                  </button>
                )}
              </div>

              {garant.typeGarant === "personne_physique" ? (
                <div className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <FormSelect
                      label="Civilité"
                      value={garant.civilite}
                      disabled={locked}
                      onChange={value =>
                        updateGarant(garant.id, {
                          ...garant,
                          civilite: value as Civilite,
                        })
                      }
                      options={[
                        { value: "Monsieur", label: "Monsieur" },
                        { value: "Madame", label: "Madame" },
                      ]}
                    />

                    <FormInput
                      label="Date de naissance"
                      value={garant.dateNaissance}
                      type="date"
                      readOnly={locked}
                      onChange={value =>
                        updateGarant(garant.id, { ...garant, dateNaissance: value })
                      }
                    />

                    <FormInput
                      label="Nom"
                      value={garant.nom}
                      readOnly={locked}
                      onChange={value =>
                        updateGarant(garant.id, { ...garant, nom: value })
                      }
                    />

                    <FormInput
                      label="Prénom"
                      value={garant.prenom}
                      readOnly={locked}
                      onChange={value =>
                        updateGarant(garant.id, { ...garant, prenom: value })
                      }
                    />

                    <FormInput
                      label="Téléphone"
                      value={garant.telephone}
                      readOnly={locked}
                      onChange={value =>
                        updateGarant(garant.id, { ...garant, telephone: value })
                      }
                    />

                    <FormInput
                      label="E-mail"
                      value={garant.email}
                      readOnly={locked}
                      onChange={value =>
                        updateGarant(garant.id, { ...garant, email: value })
                      }
                    />

                    <FormInput
                      label="Profession"
                      value={garant.profession}
                      readOnly={locked}
                      onChange={value =>
                        updateGarant(garant.id, { ...garant, profession: value })
                      }
                    />

                    <FormInput
                      label="Revenus mensuels"
                      value={garant.revenusMensuels}
                      type="number"
                      readOnly={locked}
                      onChange={value =>
                        updateGarant(garant.id, {
                          ...garant,
                          revenusMensuels: Number(value),
                        })
                      }
                    />
                  </div>

                  <AdresseForm
                    adresse={garant.adresse}
                    locked={locked}
                    setAdresse={adresse =>
                      updateGarant(garant.id, { ...garant, adresse })
                    }
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <FormInput
                      label="Raison sociale"
                      value={garant.raisonSociale}
                      readOnly={locked}
                      onChange={value =>
                        updateGarant(garant.id, {
                          ...garant,
                          raisonSociale: value,
                        })
                      }
                    />

                    <FormInput
                      label="Forme juridique"
                      value={garant.formeJuridique}
                      readOnly={locked}
                      onChange={value =>
                        updateGarant(garant.id, {
                          ...garant,
                          formeJuridique: value,
                        })
                      }
                    />

                    <FormInput
                      label="SIREN"
                      value={garant.siren}
                      readOnly={locked}
                      onChange={value =>
                        updateGarant(garant.id, { ...garant, siren: value })
                      }
                    />

                    <FormInput
                      label="SIRET"
                      value={garant.siret}
                      readOnly={locked}
                      onChange={value =>
                        updateGarant(garant.id, { ...garant, siret: value })
                      }
                    />

                    <FormInput
                      label="Téléphone"
                      value={garant.telephone}
                      readOnly={locked}
                      onChange={value =>
                        updateGarant(garant.id, { ...garant, telephone: value })
                      }
                    />

                    <FormInput
                      label="E-mail"
                      value={garant.email}
                      readOnly={locked}
                      onChange={value =>
                        updateGarant(garant.id, { ...garant, email: value })
                      }
                    />

                    <FormInput
                      label="Nom représentant"
                      value={garant.representantLegal.nom}
                      readOnly={locked}
                      onChange={value =>
                        updateGarant(garant.id, {
                          ...garant,
                          representantLegal: {
                            ...garant.representantLegal,
                            nom: value,
                          },
                        })
                      }
                    />

                    <FormInput
                      label="Prénom représentant"
                      value={garant.representantLegal.prenom}
                      readOnly={locked}
                      onChange={value =>
                        updateGarant(garant.id, {
                          ...garant,
                          representantLegal: {
                            ...garant.representantLegal,
                            prenom: value,
                          },
                        })
                      }
                    />

                    <div className="sm:col-span-2">
                      <FormInput
                        label="Fonction représentant"
                        value={garant.representantLegal.fonction}
                        readOnly={locked}
                        onChange={value =>
                          updateGarant(garant.id, {
                            ...garant,
                            representantLegal: {
                              ...garant.representantLegal,
                              fonction: value,
                            },
                          })
                        }
                      />
                    </div>
                  </div>

                  <AdresseForm
                    adresse={garant.adresseSiege}
                    locked={locked}
                    setAdresse={adresseSiege =>
                      updateGarant(garant.id, { ...garant, adresseSiege })
                    }
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}

// ============================================================
// FORMULAIRE LOCATAIRE
// ============================================================
function FormLocataire({
  reference,
  initial,
  locatairesExistants,
  bauxAssocies,
  onSave,
  onCancel,
}: {
  reference: string;
  initial?: Locataire;
  locatairesExistants: Locataire[];
  bauxAssocies: BailAssocie[];
  onSave: (locataire: Locataire) => void;
  onCancel: () => void;
}) {
  const isEdit = !!initial;
  const lockedBySignedBail = hasSignedBail(bauxAssocies);

  const [civilite, setCivilite] = useState<Civilite>(initial?.civilite || "Madame");
  const [nom, setNom] = useState(initial?.nom || "");
  const [prenom, setPrenom] = useState(initial?.prenom || "");
  const [dateNaissance, setDateNaissance] = useState(initial?.dateNaissance || "");
  const [lieuNaissance, setLieuNaissance] = useState(initial?.lieuNaissance || "");
  const [nationalite, setNationalite] = useState(initial?.nationalite || "");

  const [adresseActuelle, setAdresseActuelle] = useState<Adresse>(
    initial?.adresseActuelle || { ...adresseVide }
  );

  const [telephonePrincipal, setTelephonePrincipal] = useState(
    initial?.telephonePrincipal || ""
  );
  const [telephoneSecondaire, setTelephoneSecondaire] = useState(
    initial?.telephoneSecondaire || ""
  );
  const [email, setEmail] = useState(initial?.email || "");

  const [situationFamiliale, setSituationFamiliale] = useState<SituationFamiliale>(
    initial?.situationFamiliale || "celibataire"
  );
  const [nombreOccupants, setNombreOccupants] = useState(
    initial?.nombreOccupants || 1
  );

  const [profession, setProfession] = useState(initial?.profession || "");
  const [employeur, setEmployeur] = useState(initial?.employeur || "");
  const [typeContrat, setTypeContrat] = useState<TypeContratTravail>(
    initial?.typeContrat || "CDI"
  );
  const [revenusMensuelsNets, setRevenusMensuelsNets] = useState(
    initial?.revenusMensuelsNets || 0
  );

  const [documents] = useState<DocumentItem[]>(
    initial?.documents || [
      {
        id: "doc-identite",
        nom: "Pièce d’identité",
        categorie: "identite",
        obligatoire: true,
      },
      {
        id: "doc-revenus",
        nom: "Justificatifs de revenus",
        categorie: "revenus",
        multiple: true,
      },
      {
        id: "doc-fiscal",
        nom: "Avis d’imposition",
        categorie: "fiscal",
      },
      {
        id: "doc-domicile",
        nom: "Justificatif de domicile",
        categorie: "domicile",
      },
      {
        id: "doc-complementaires",
        nom: "Documents complémentaires",
        categorie: "complementaire",
        multiple: true,
      },
    ]
  );

  const [garants, setGarants] = useState<Garant[]>(initial?.garants || []);

  const [assuranceHabitation, setAssuranceHabitation] =
    useState<AssuranceHabitation>(
      initial?.assuranceHabitation || {
        compagnie: "",
        numeroContrat: "",
        dateEffet: "",
        dateEcheance: "",
        attestation: null,
      }
    );

  const emailExists = locatairesExistants.some(
    locataire =>
      locataire.email.toLowerCase() === email.toLowerCase() &&
      locataire.id !== initial?.id
  );

  const canSave = nom && prenom && email && !emailExists;

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
              champ: "Fiche locataire",
              ancienneValeur: "Anciennes informations",
              nouvelleValeur: "Informations mises à jour",
            },
          ]
        : []),
    ];

    const locataire: Locataire = {
      id: initial?.id || `loc-${Date.now()}`,
      reference,
      statut: initial?.statut || "actif",

      civilite,
      nom,
      prenom,
      dateNaissance,
      lieuNaissance,
      nationalite,

      adresseActuelle,
      telephonePrincipal,
      telephoneSecondaire,
      email,

      situationFamiliale,
      nombreOccupants,

      profession,
      employeur,
      typeContrat,
      revenusMensuelsNets,

      documents,
      garants,
      assuranceHabitation,

      historique,
      createdAt: initial?.createdAt || now,
      updatedAt: now,
    };

    onSave(locataire);
  };

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "#f8fafc", fontFamily: "'Inter', sans-serif" }}
    >
      <div
        className="px-4 sm:px-6 py-5"
        style={{ background: "linear-gradient(135deg,#fff7ed,#fff)" }}
      >
        <div className="max-w-4xl mx-auto">
          <button
            onClick={onCancel}
            className="text-xs font-bold mb-3 hover:underline"
            style={{ color: "#f97316" }}
          >
            ← Retour
          </button>

          <h1 className="text-xl font-black" style={{ color: "#1e293b" }}>
            👤 {isEdit ? "Modifier" : "Nouveau"} locataire
          </h1>

          <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>
            Référence locataire : {reference}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-4">
        {lockedBySignedBail && (
          <div
            className="p-4 rounded-3xl"
            style={{ backgroundColor: "#fef9c3", border: "1px solid #fde68a" }}
          >
            <p className="text-sm font-bold" style={{ color: "#854d0e" }}>
              🔒 Ce locataire est associé à un bail signé. Les informations reprises
              dans le bail sont verrouillées afin de garantir la cohérence juridique
              des documents signés.
            </p>
          </div>
        )}

        <SectionCard>
          <SectionTitle emoji="🪪" title="Informations d’identité" />

          <div className="grid sm:grid-cols-2 gap-4">
            <FormInput label="Référence" value={reference} readOnly />

            <FormSelect
              label="Civilité"
              value={civilite}
              onChange={value => setCivilite(value as Civilite)}
              disabled={lockedBySignedBail}
              required
              options={[
                { value: "Monsieur", label: "Monsieur" },
                { value: "Madame", label: "Madame" },
              ]}
            />

            <FormInput
              label="Nom"
              value={nom}
              onChange={setNom}
              readOnly={lockedBySignedBail}
              required
            />

            <FormInput
              label="Prénom"
              value={prenom}
              onChange={setPrenom}
              readOnly={lockedBySignedBail}
              required
            />

            <FormInput
              label="Date de naissance"
              value={dateNaissance}
              onChange={setDateNaissance}
              type="date"
              readOnly={lockedBySignedBail}
            />

            <FormInput
              label="Lieu de naissance"
              value={lieuNaissance}
              onChange={setLieuNaissance}
              readOnly={lockedBySignedBail}
            />

            <div className="sm:col-span-2">
              <FormInput
                label="Nationalité"
                value={nationalite}
                onChange={setNationalite}
                readOnly={lockedBySignedBail}
              />
            </div>
          </div>
        </SectionCard>

        <SectionCard>
          <SectionTitle emoji="📍" title="Adresse actuelle" />

          <AdresseForm
            adresse={adresseActuelle}
            setAdresse={setAdresseActuelle}
            locked={lockedBySignedBail}
          />

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

              {emailExists && (
                <p className="text-xs font-bold mt-1" style={{ color: "#ef4444" }}>
                  Cette adresse e-mail est déjà utilisée par un autre locataire.
                </p>
              )}

              <p className="text-xs mt-1" style={{ color: "#94a3b8" }}>
                L’adresse e-mail sert d’identifiant principal pour l’espace
                locataire, les quittances et les notifications.
              </p>
            </div>
          </div>
        </SectionCard>

        <SectionCard>
          <SectionTitle emoji="👪" title="Situation personnelle" />

          <div className="grid sm:grid-cols-2 gap-4">
            <FormSelect
              label="Situation familiale"
              value={situationFamiliale}
              disabled={lockedBySignedBail}
              onChange={value => setSituationFamiliale(value as SituationFamiliale)}
              options={[
                { value: "celibataire", label: "Célibataire" },
                { value: "marie", label: "Marié" },
                { value: "pacse", label: "Pacsé" },
                { value: "divorce", label: "Divorcé" },
                { value: "veuf", label: "Veuf" },
              ]}
            />

            <FormInput
              label="Nombre d’occupants"
              value={nombreOccupants}
              type="number"
              readOnly={lockedBySignedBail}
              onChange={value => setNombreOccupants(Number(value))}
            />
          </div>
        </SectionCard>

        <SectionCard>
          <SectionTitle emoji="💼" title="Situation professionnelle" />

          <div className="grid sm:grid-cols-2 gap-4">
            <FormInput
              label="Profession"
              value={profession}
              readOnly={lockedBySignedBail}
              onChange={setProfession}
            />

            <FormInput
              label="Employeur"
              value={employeur}
              readOnly={lockedBySignedBail}
              onChange={setEmployeur}
            />

            <FormSelect
              label="Type de contrat"
              value={typeContrat}
              disabled={lockedBySignedBail}
              onChange={value => setTypeContrat(value as TypeContratTravail)}
              options={[
                "CDI",
                "CDD",
                "Fonctionnaire",
                "Indépendant",
                "Retraité",
                "Étudiant",
                "Sans emploi",
                "Autre",
              ].map(value => ({ value, label: value }))}
            />

            <FormInput
              label="Revenus mensuels nets"
              value={revenusMensuelsNets}
              type="number"
              readOnly={lockedBySignedBail}
              onChange={value => setRevenusMensuelsNets(Number(value))}
            />
          </div>
        </SectionCard>

        <GarantsSection
          garants={garants}
          setGarants={setGarants}
          locked={lockedBySignedBail}
        />

        <SectionCard>
          <SectionTitle emoji="🏠" title="Assurance habitation" />

          <div className="flex items-center gap-2 mb-4">
            <StatutAssuranceBadge statut={calculerStatutAssurance(assuranceHabitation)} />
            <p className="text-xs font-bold" style={{ color: "#94a3b8" }}>
              L’assurance reste modifiable à tout moment.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <FormInput
              label="Compagnie d’assurance"
              value={assuranceHabitation.compagnie}
              onChange={value =>
                setAssuranceHabitation({
                  ...assuranceHabitation,
                  compagnie: value,
                })
              }
            />

            <FormInput
              label="Numéro de contrat"
              value={assuranceHabitation.numeroContrat}
              onChange={value =>
                setAssuranceHabitation({
                  ...assuranceHabitation,
                  numeroContrat: value,
                })
              }
            />

            <FormInput
              label="Date d’effet"
              value={assuranceHabitation.dateEffet}
              type="date"
              onChange={value =>
                setAssuranceHabitation({
                  ...assuranceHabitation,
                  dateEffet: value,
                })
              }
            />

            <FormInput
              label="Date d’échéance"
              value={assuranceHabitation.dateEcheance}
              type="date"
              onChange={value =>
                setAssuranceHabitation({
                  ...assuranceHabitation,
                  dateEcheance: value,
                })
              }
            />
          </div>

          <div
            className="mt-4 flex items-center justify-between p-3 rounded-2xl"
            style={{ backgroundColor: "#f8fafc" }}
          >
            <div>
              <p className="text-sm font-bold" style={{ color: "#1e293b" }}>
                📄 Attestation d’assurance
              </p>
              <p className="text-xs" style={{ color: "#94a3b8" }}>
                Peut être ajoutée ou renouvelée après signature du bail.
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
        </SectionCard>

        <SectionCard>
          <SectionTitle emoji="📎" title="Documents du locataire" />

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
                    {document.multiple ? " · Téléversement multiple" : ""}
                  </p>
                </div>

                <label
                  className="px-3 py-1 rounded-xl text-xs font-bold cursor-pointer"
                  style={{ backgroundColor: "#eff6ff", color: "#3b82f6" }}
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
            ✅ Enregistrer le locataire
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// DÉTAIL LOCATAIRE
// ============================================================
function VueDetailLocataire({
  locataire,
  occupation,
  baux,
  quittances,
  historiquePaiements,
  onBack,
  onEdit,
  onArchive,
  onDelete,
  onOpenBien,
  onOpenBail,
  onOpenQuittance,
}: {
  locataire: Locataire;
  occupation?: OccupationActuelle;
  baux: BailAssocie[];
  quittances: QuittanceAssociee[];
  historiquePaiements: HistoriquePaiementItem[];
  onBack: () => void;
  onEdit: () => void;
  onArchive: () => void;
  onDelete: () => void;
  onOpenBien: (id: string) => void;
  onOpenBail: (id: string) => void;
  onOpenQuittance: (id: string) => void;
}) {
  const [onglet, setOnglet] = useState<
    | "infos"
    | "garants"
    | "documents"
    | "situation"
    | "baux"
    | "quittances"
    | "historique_paiements"
    | "historique"
  >("infos");

  const statutPaiement = calculerStatutPaiementLocataire(quittances);
  const statutAssurance = calculerStatutAssurance(locataire.assuranceHabitation);
  const lockedBySignedBail = hasSignedBail(baux);

  const onglets = [
    { id: "infos", label: "Informations", emoji: "📋" },
    { id: "garants", label: "Garants", emoji: "🛡️" },
    { id: "documents", label: "Documents", emoji: "📎" },
    { id: "situation", label: "Situation locative", emoji: "🏠" },
    { id: "baux", label: "Baux", emoji: "📝" },
    { id: "quittances", label: "Quittances", emoji: "🧾" },
    { id: "historique_paiements", label: "Paiements", emoji: "💶" },
    { id: "historique", label: "Historique", emoji: "🕐" },
  ] as const;

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "#f8fafc", fontFamily: "'Inter', sans-serif" }}
    >
      <div
        className="px-4 sm:px-6 py-5"
        style={{ background: "linear-gradient(135deg,#fff7ed,#fff)" }}
      >
        <div className="max-w-5xl mx-auto">
          <button
            onClick={onBack}
            className="text-xs font-bold mb-3 hover:underline"
            style={{ color: "#f97316" }}
          >
            ← Locataires
          </button>

          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div
                className="w-14 h-14 rounded-3xl flex items-center justify-center text-2xl shadow"
                style={{ background: "linear-gradient(135deg,#f97316,#fb923c)" }}
              >
                👤
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl font-black" style={{ color: "#1e293b" }}>
                    {getNomLocataire(locataire)}
                  </h1>

                  <StatutLocataireBadge statut={locataire.statut} />
                  <StatutPaiementBadge statut={statutPaiement} />
                </div>

                <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>
                  {locataire.reference} · {locataire.email}
                </p>
              </div>
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
                  boxShadow:
                    onglet === item.id
                      ? "0 2px 8px rgba(249,115,22,0.3)"
                      : "none",
                }}
              >
                {item.emoji} {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-4">
        {lockedBySignedBail && (
          <div
            className="p-4 rounded-3xl"
            style={{ backgroundColor: "#eff6ff", border: "1px solid #bfdbfe" }}
          >
            <p className="text-sm font-bold" style={{ color: "#1d4ed8" }}>
              🔒 Ce locataire est associé à un bail signé. Les informations
              contractuelles sont verrouillées. L’assurance, les documents
              complémentaires, le téléphone et l’e-mail restent modifiables.
            </p>
          </div>
        )}

        {onglet === "infos" && (
          <>
            <SectionCard>
              <SectionTitle emoji="🪪" title="Identité" />

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <InfoRow label="Civilité" value={locataire.civilite} />
                <InfoRow label="Nom" value={locataire.nom} />
                <InfoRow label="Prénom" value={locataire.prenom} />
                <InfoRow
                  label="Date de naissance"
                  value={locataire.dateNaissance}
                />
                <InfoRow
                  label="Lieu de naissance"
                  value={locataire.lieuNaissance}
                />
                <InfoRow label="Nationalité" value={locataire.nationalite} />
              </div>
            </SectionCard>

            <SectionCard>
              <SectionTitle emoji="📍" title="Coordonnées" />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <InfoRow
                  label="Adresse actuelle"
                  value={getAdresseComplete(locataire.adresseActuelle)}
                />
                <InfoRow
                  label="Téléphone principal"
                  value={locataire.telephonePrincipal}
                />
                <InfoRow
                  label="Téléphone secondaire"
                  value={locataire.telephoneSecondaire || "—"}
                />
                <InfoRow label="E-mail" value={locataire.email} />
              </div>
            </SectionCard>

            <SectionCard>
              <SectionTitle emoji="👪" title="Situation personnelle et professionnelle" />

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <InfoRow
                  label="Situation familiale"
                  value={getSituationFamilialeLabel(locataire.situationFamiliale)}
                />
                <InfoRow
                  label="Nombre d’occupants"
                  value={locataire.nombreOccupants}
                />
                <InfoRow label="Profession" value={locataire.profession} />
                <InfoRow label="Employeur" value={locataire.employeur} />
                <InfoRow label="Type de contrat" value={locataire.typeContrat} />
                <InfoRow
                  label="Revenus mensuels nets"
                  value={`${locataire.revenusMensuelsNets} €`}
                />
              </div>
            </SectionCard>

            <SectionCard>
              <SectionTitle emoji="🏠" title="Assurance habitation" />

              <div className="flex items-center gap-2 mb-3">
                <StatutAssuranceBadge statut={statutAssurance} />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <InfoRow
                  label="Compagnie"
                  value={locataire.assuranceHabitation.compagnie || "—"}
                />
                <InfoRow
                  label="N° contrat"
                  value={locataire.assuranceHabitation.numeroContrat || "—"}
                />
                <InfoRow
                  label="Date d’effet"
                  value={locataire.assuranceHabitation.dateEffet || "—"}
                />
                <InfoRow
                  label="Date d’échéance"
                  value={locataire.assuranceHabitation.dateEcheance || "—"}
                />
              </div>
            </SectionCard>
          </>
        )}

        {onglet === "garants" && (
          <SectionCard>
            <SectionTitle emoji="🛡️" title="Garants" />

            {locataire.garants.length === 0 ? (
              <p className="text-sm text-center py-8" style={{ color: "#94a3b8" }}>
                Aucun garant enregistré.
              </p>
            ) : (
              <div className="space-y-3">
                {locataire.garants.map(garant => (
                  <div
                    key={garant.id}
                    className="p-4 rounded-3xl"
                    style={{ backgroundColor: "#f8fafc" }}
                  >
                    {garant.typeGarant === "personne_physique" ? (
                      <>
                        <p
                          className="text-sm font-extrabold mb-3"
                          style={{ color: "#1e293b" }}
                        >
                          👤 {garant.prenom} {garant.nom}
                        </p>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <InfoRow label="Téléphone" value={garant.telephone} />
                          <InfoRow label="E-mail" value={garant.email} />
                          <InfoRow label="Profession" value={garant.profession} />
                          <InfoRow
                            label="Revenus"
                            value={`${garant.revenusMensuels} €`}
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <p
                          className="text-sm font-extrabold mb-3"
                          style={{ color: "#1e293b" }}
                        >
                          🏢 {garant.raisonSociale}
                        </p>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <InfoRow
                            label="Forme juridique"
                            value={garant.formeJuridique}
                          />
                          <InfoRow label="SIREN" value={garant.siren} />
                          <InfoRow label="SIRET" value={garant.siret} />
                          <InfoRow label="E-mail" value={garant.email} />
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        )}

        {onglet === "documents" && (
          <SectionCard>
            <SectionTitle emoji="📎" title="Documents" />

            <div className="space-y-2">
              {locataire.documents.map(document => (
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

        {onglet === "situation" && (
          <SectionCard>
            <SectionTitle emoji="🏠" title="Situation locative" />

            {!occupation ? (
              <p className="text-sm text-center py-8" style={{ color: "#94a3b8" }}>
                Aucun logement occupé.
              </p>
            ) : (
              <div className="space-y-4">
                <div
                  className="p-4 rounded-3xl"
                  style={{ backgroundColor: "#fff7ed" }}
                >
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div>
                      <p
                        className="text-sm font-extrabold"
                        style={{ color: "#1e293b" }}
                      >
                        {occupation.nomBien}
                      </p>
                      <p className="text-xs mt-1" style={{ color: "#94a3b8" }}>
                        {occupation.referenceBien} · {occupation.adresseBien}
                      </p>
                    </div>

                    <button
                      onClick={() => onOpenBien(occupation.bienId)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold"
                      style={{ backgroundColor: "#fff", color: "#f97316" }}
                    >
                      Ouvrir le bien
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <InfoRow label="Date d’entrée" value={occupation.dateEntree} />
                  <InfoRow
                    label="Bail actif"
                    value={occupation.bailActifReference}
                  />
                  <InfoRow
                    label="Contrat actif"
                    value={occupation.contratActifReference}
                  />
                  <div
                    className="p-3 rounded-2xl"
                    style={{ backgroundColor: "#f8fafc" }}
                  >
                    <p
                      className="text-xs font-bold mb-1"
                      style={{ color: "#94a3b8" }}
                    >
                      Statut de paiement
                    </p>
                    <StatutPaiementBadge statut={statutPaiement} />
                  </div>
                </div>
              </div>
            )}
          </SectionCard>
        )}

        {onglet === "baux" && (
          <SectionCard>
            <SectionTitle emoji="📝" title="Baux associés" />

            {baux.length === 0 ? (
              <p className="text-sm text-center py-8" style={{ color: "#94a3b8" }}>
                Aucun bail associé.
              </p>
            ) : (
              <div className="space-y-2">
                {baux.map(bail => (
                  <button
                    key={bail.id}
                    onClick={() => onOpenBail(bail.id)}
                    className="w-full p-3 rounded-2xl text-left flex items-center justify-between gap-3"
                    style={{ backgroundColor: "#f8fafc" }}
                  >
                    <div>
                      <p
                        className="text-sm font-extrabold"
                        style={{ color: "#1e293b" }}
                      >
                        {bail.reference} · {bail.nomBien}
                      </p>
                      <p className="text-xs" style={{ color: "#94a3b8" }}>
                        {bail.adresseBien} · Du {bail.dateDebut} au {bail.dateFin}
                      </p>
                    </div>

                    <span
                      className="px-2 py-0.5 rounded-full text-xs font-bold"
                      style={{
                        backgroundColor:
                          bail.statut === "signe" ? "#dcfce7" : "#f1f5f9",
                        color: bail.statut === "signe" ? "#166534" : "#64748b",
                      }}
                    >
                      {bail.statut}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </SectionCard>
        )}

        {onglet === "quittances" && (
          <SectionCard>
            <SectionTitle emoji="🧾" title="Quittances" />

            <p className="text-xs font-bold mb-4" style={{ color: "#94a3b8" }}>
              Les quittances sont synchronisées automatiquement depuis le module
              Quittances. Le statut ne peut pas être modifié depuis la fiche
              locataire.
            </p>

            {quittances.length === 0 ? (
              <p className="text-sm text-center py-8" style={{ color: "#94a3b8" }}>
                Aucune quittance générée.
              </p>
            ) : (
              <div className="space-y-2">
                {quittances.map(quittance => (
                  <button
                    key={quittance.id}
                    onClick={() => onOpenQuittance(quittance.id)}
                    className="w-full p-3 rounded-2xl text-left"
                    style={{ backgroundColor: "#f8fafc" }}
                  >
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div>
                        <p
                          className="text-sm font-extrabold"
                          style={{ color: "#1e293b" }}
                        >
                          {quittance.reference} · {quittance.moisConcerne}
                        </p>
                        <p className="text-xs" style={{ color: "#94a3b8" }}>
                          Émise le {quittance.dateEmission}
                        </p>
                      </div>

                      <StatutQuittanceBadge statut={quittance.statutPaiement} />
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-3">
                      <InfoRow label="Loyer" value={`${quittance.montantLoyer} €`} />
                      <InfoRow
                        label="Charges"
                        value={`${quittance.montantCharges} €`}
                      />
                      <InfoRow
                        label="Total"
                        value={`${quittance.montantTotal} €`}
                      />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </SectionCard>
        )}

        {onglet === "historique_paiements" && (
          <SectionCard>
            <SectionTitle emoji="💶" title="Historique des paiements" />

            {historiquePaiements.length === 0 ? (
              <p className="text-sm text-center py-8" style={{ color: "#94a3b8" }}>
                Aucun événement de paiement enregistré.
              </p>
            ) : (
              <div className="space-y-2">
                {historiquePaiements.map(event => (
                  <div
                    key={event.id}
                    className="p-3 rounded-2xl"
                    style={{ backgroundColor: "#f8fafc" }}
                  >
                    <div className="flex justify-between gap-3 flex-wrap">
                      <div>
                        <p
                          className="text-sm font-extrabold"
                          style={{ color: "#1e293b" }}
                        >
                          {getOperationPaiementLabel(event.typeOperation)}
                        </p>
                        <p className="text-xs" style={{ color: "#94a3b8" }}>
                          {event.date} · {event.quittanceReference}
                        </p>
                      </div>

                      <div className="text-right">
                        <p
                          className="text-sm font-extrabold"
                          style={{ color: "#f97316" }}
                        >
                          {event.montant} €
                        </p>
                        <StatutQuittanceBadge statut={event.statut} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        )}

        {onglet === "historique" && (
          <SectionCard>
            <SectionTitle emoji="🕐" title="Historique de la fiche" />

            {locataire.historique.length === 0 ? (
              <p className="text-sm text-center py-8" style={{ color: "#94a3b8" }}>
                Aucune modification enregistrée.
              </p>
            ) : (
              <div className="space-y-2">
                {locataire.historique.map(item => (
                  <div
                    key={item.id}
                    className="p-3 rounded-2xl"
                    style={{ backgroundColor: "#f8fafc" }}
                  >
                    <div className="flex justify-between gap-3 mb-1">
                      <p
                        className="text-xs font-extrabold"
                        style={{ color: "#1e293b" }}
                      >
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
// LISTE LOCATAIRES
// ============================================================
function VueListeLocataires({
  locataires,
  baux,
  quittances,
  onAdd,
  onSelect,
}: {
  locataires: Locataire[];
  baux: BailAssocie[];
  quittances: QuittanceAssociee[];
  onAdd: () => void;
  onSelect: (locataire: Locataire) => void;
}) {
  const [recherche, setRecherche] = useState("");
  const [filtre, setFiltre] = useState<
    "tous" | "actifs" | "archives" | "parfait" | "vigilance" | "critique"
  >("tous");

  const locatairesFiltres = locataires.filter(locataire => {
    const q = recherche.toLowerCase();

    const matchRecherche =
      getNomLocataire(locataire).toLowerCase().includes(q) ||
      locataire.reference.toLowerCase().includes(q) ||
      locataire.email.toLowerCase().includes(q);

    if (!matchRecherche) return false;

    const statutPaiement = calculerStatutPaiementLocataire(
      quittances.filter(quittance => quittance.locataireId === locataire.id)
    );

    if (filtre === "actifs") return locataire.statut === "actif";
    if (filtre === "archives") return locataire.statut === "archive";
    if (filtre === "parfait") return statutPaiement === "parfait";
    if (filtre === "vigilance") return statutPaiement === "vigilance";
    if (filtre === "critique") return statutPaiement === "critique";

    return true;
  });

  const stats = {
    total: locataires.length,
    actifs: locataires.filter(locataire => locataire.statut === "actif").length,
    vigilance: locataires.filter(
      locataire =>
        calculerStatutPaiementLocataire(
          quittances.filter(quittance => quittance.locataireId === locataire.id)
        ) === "vigilance"
    ).length,
    critique: locataires.filter(
      locataire =>
        calculerStatutPaiementLocataire(
          quittances.filter(quittance => quittance.locataireId === locataire.id)
        ) === "critique"
    ).length,
  };

  const filtres = [
    { id: "tous", label: "Tous" },
    { id: "actifs", label: "Actifs" },
    { id: "archives", label: "Archives" },
    { id: "parfait", label: "Parfait" },
    { id: "vigilance", label: "Vigilance" },
    { id: "critique", label: "Critique" },
  ] as const;

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "#f8fafc", fontFamily: "'Inter', sans-serif" }}
    >
      <div
        className="px-4 sm:px-6 py-5"
        style={{ background: "linear-gradient(135deg,#fff7ed,#fff)" }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex items-start justify-between gap-4 flex-wrap mb-5">
            <div>
              <h1 className="text-2xl font-black" style={{ color: "#1e293b" }}>
                👥 Locataires
              </h1>

              <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>
                Référentiel officiel des occupants et suivi locatif synchronisé.
              </p>
            </div>

            <button
              onClick={onAdd}
              className="px-5 py-2.5 rounded-2xl text-white text-sm font-extrabold shadow-lg transition hover:opacity-90"
              style={{ background: "linear-gradient(135deg,#f97316,#fb923c)" }}
            >
              + Ajouter un locataire
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              {
                emoji: "👥",
                value: stats.total,
                label: "Locataires",
                bg: "linear-gradient(135deg,#f97316,#fb923c)",
              },
              {
                emoji: "✅",
                value: stats.actifs,
                label: "Actifs",
                bg: "linear-gradient(135deg,#22c55e,#4ade80)",
              },
              {
                emoji: "🟡",
                value: stats.vigilance,
                label: "Vigilance",
                bg: "linear-gradient(135deg,#f59e0b,#fbbf24)",
              },
              {
                emoji: "🔴",
                value: stats.critique,
                label: "Critique",
                bg: "linear-gradient(135deg,#ef4444,#f87171)",
              },
            ].map(stat => (
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
            value={recherche}
            onChange={event => setRecherche(event.target.value)}
            placeholder="Rechercher par nom, référence ou e-mail..."
            className="flex-1 px-4 py-3 rounded-2xl text-sm border outline-none"
            style={{ borderColor: "#e2e8f0", backgroundColor: "#fff" }}
          />

          <div className="flex gap-2 flex-wrap">
            {filtres.map(item => (
              <button
                key={item.id}
                onClick={() => setFiltre(item.id)}
                className="px-3 py-2 rounded-2xl text-xs font-bold border-2"
                style={{
                  borderColor: filtre === item.id ? "#f97316" : "#e2e8f0",
                  backgroundColor: filtre === item.id ? "#fff7ed" : "#fff",
                  color: filtre === item.id ? "#f97316" : "#64748b",
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {locatairesFiltres.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">👥</div>
            <p className="font-bold text-base" style={{ color: "#1e293b" }}>
              Aucun locataire trouvé
            </p>
            <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>
              Créez votre premier profil locataire.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {locatairesFiltres.map(locataire => {
              const quittancesLocataire = quittances.filter(
                quittance => quittance.locataireId === locataire.id
              );
              const statutPaiement =
                calculerStatutPaiementLocataire(quittancesLocataire);
              const bauxLocataire = baux.filter(
                bail => bail.locataireId === locataire.id
              );

              return (
                <button
                  key={locataire.id}
                  onClick={() => onSelect(locataire)}
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
                        👤
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p
                            className="font-extrabold text-sm"
                            style={{ color: "#1e293b" }}
                          >
                            {getNomLocataire(locataire)}
                          </p>

                          <StatutLocataireBadge statut={locataire.statut} />
                          <StatutPaiementBadge statut={statutPaiement} />
                        </div>

                        <p className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>
                          {locataire.reference} · {locataire.email}
                        </p>

                        <p className="text-xs mt-0.5" style={{ color: "#cbd5e1" }}>
                          {locataire.profession || "Profession non renseignée"} ·{" "}
                          {bauxLocataire.length} bail(aux)
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p
                        className="text-sm font-extrabold"
                        style={{ color: "#f97316" }}
                      >
                        {quittancesLocataire.length} quittance(s)
                      </p>

                      <p className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>
                        {locataire.adresseActuelle.ville || "Ville non renseignée"}
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
export default function ModuleLocataires() {
  const [view, setView] = useState<ViewState>({ name: "liste" });
  const [locataires, setLocataires] = useState<Locataire[]>(mockLocataires);

  const baux = mockBaux;
  const quittances = mockQuittances;
  const historiquePaiements = mockHistoriquePaiements;

  const getBauxLocataire = (locataireId: string) =>
    baux.filter(bail => bail.locataireId === locataireId);

  const getQuittancesLocataire = (locataireId: string) =>
    quittances.filter(quittance => quittance.locataireId === locataireId);

  const getHistoriquePaiementsLocataire = (locataireId: string) =>
    historiquePaiements.filter(event => event.locataireId === locataireId);

  const getOccupationLocataire = (locataireId: string) => {
    const bailSigne = baux.find(
      bail => bail.locataireId === locataireId && bail.statut === "signe"
    );

    if (!bailSigne) return undefined;

    if (locataireId === "loc001") return mockOccupations[0];

    return {
      bienId: bailSigne.bienId,
      referenceBien: bailSigne.bienId.toUpperCase(),
      nomBien: bailSigne.nomBien,
      adresseBien: bailSigne.adresseBien,
      dateEntree: bailSigne.dateDebut,
      bailActifReference: bailSigne.reference,
      contratActifReference: `CONTRAT-${bailSigne.reference.split("-").pop()}`,
      statutContrat: "actif" as StatutContrat,
    };
  };

  const saveLocataire = (locataire: Locataire) => {
    setLocataires(prev => {
      const exists = prev.some(item => item.id === locataire.id);

      if (exists) {
        return prev.map(item => (item.id === locataire.id ? locataire : item));
      }

      return [...prev, locataire];
    });

    setView({ name: "liste" });
  };

  const archiveLocataire = (locataire: Locataire) => {
    const updated: Locataire = {
      ...locataire,
      statut: "archive",
      updatedAt: getToday(),
      historique: [
        ...locataire.historique,
        {
          id: `hist-${Date.now()}`,
          date: getToday(),
          heure: getNowTime(),
          utilisateur: "Utilisateur connecté",
          champ: "Statut",
          ancienneValeur: locataire.statut,
          nouvelleValeur: "archive",
        },
      ],
    };

    setLocataires(prev =>
      prev.map(item => (item.id === locataire.id ? updated : item))
    );

    setView({ name: "liste" });
  };

  const deleteLocataire = (locataire: Locataire) => {
    const hasActiveData =
      getBauxLocataire(locataire.id).length > 0 ||
      getQuittancesLocataire(locataire.id).length > 0;

    if (hasActiveData) {
      alert("Ce locataire est associé à des données actives et ne peut pas être supprimé.");
      return;
    }

    setLocataires(prev => prev.filter(item => item.id !== locataire.id));
    setView({ name: "liste" });
  };

  const refreshSelectedLocataire = (locataire: Locataire) => {
    const fresh = locataires.find(item => item.id === locataire.id);

    if (fresh) {
      setView({ name: "detail", locataire: fresh });
    } else {
      setView({ name: "liste" });
    }
  };

  if (view.name === "creation") {
    return (
      <FormLocataire
        reference={generateReferenceLocataire(locataires.length)}
        locatairesExistants={locataires}
        bauxAssocies={[]}
        onSave={saveLocataire}
        onCancel={() => setView({ name: "liste" })}
      />
    );
  }

  if (view.name === "edition") {
    return (
      <FormLocataire
        reference={view.locataire.reference}
        initial={view.locataire}
        locatairesExistants={locataires}
        bauxAssocies={getBauxLocataire(view.locataire.id)}
        onSave={saveLocataire}
        onCancel={() => refreshSelectedLocataire(view.locataire)}
      />
    );
  }

  if (view.name === "detail") {
    return (
      <VueDetailLocataire
        locataire={view.locataire}
        occupation={getOccupationLocataire(view.locataire.id)}
        baux={getBauxLocataire(view.locataire.id)}
        quittances={getQuittancesLocataire(view.locataire.id)}
        historiquePaiements={getHistoriquePaiementsLocataire(view.locataire.id)}
        onBack={() => setView({ name: "liste" })}
        onEdit={() => setView({ name: "edition", locataire: view.locataire })}
        onArchive={() => archiveLocataire(view.locataire)}
        onDelete={() => deleteLocataire(view.locataire)}
        onOpenBien={id => alert(`Navigation vers le module Bien : ${id}`)}
        onOpenBail={id => alert(`Navigation vers le module Bail : ${id}`)}
        onOpenQuittance={id =>
          alert(`Navigation vers le module Quittances : ${id}`)
        }
      />
    );
  }

  return (
    <VueListeLocataires
      locataires={locataires}
      baux={baux}
      quittances={quittances}
      onAdd={() => setView({ name: "creation" })}
      onSelect={locataire => setView({ name: "detail", locataire })}
    />
  );
}