"use client";

import { useMemo, useState, type ReactNode } from "react";

// ============================================================
// TYPES
// ============================================================

type StatutContratLocation = "en_attente" | "actif" | "termine";
type StatutBail = "brouillon" | "signe" | "resilie";
type StatutDepotGarantie =
  | "a_recevoir"
  | "recu"
  | "actif"
  | "a_restituer"
  | "restitue"
  | "cloture";
type StatutEtatDesLieux = "non_realise" | "en_cours" | "valide";

type StatutPaiementQuittance =
  | "en_attente"
  | "paye"
  | "partiellement_paye"
  | "impaye";

type NiveauRelance = "aucune" | "niveau_1" | "niveau_2" | "niveau_3";

type TypeOperationHistorique =
  | "generation"
  | "mise_a_disposition"
  | "envoi_locataire"
  | "paiement_declare"
  | "modification_statut"
  | "relance_envoyee"
  | "telechargement_pdf"
  | "correction";

interface BienSource {
  id: string;
  reference: string;
  nom: string;
  adresse: string;
  statut: "vacant" | "occupe" | "archive";
}

interface HistoriqueQuittanceItem {
  id: string;
  date: string;
  heure: string;
  utilisateur: string;
  action: string;
  typeOperation: TypeOperationHistorique;
}

interface HistoriqueRelanceItem {
  id: string;
  niveau: NiveauRelance;
  date: string;
  heure: string;
  utilisateur: string;
  canal: "email" | "courrier_recommande" | "mise_en_demeure";
  statutEnvoi: string;
}

interface IndexationLoyer {
  id: string;
  contratId: string;
  ancienLoyer: number;
  nouveauLoyer: number;
  dateEffet: string;
  indiceUtilise: string;
  trimestreReference: string;
  anneeReference: string;
  statut: "brouillon" | "validee";
}

interface ContratQuittancable {
  id: string;
  reference: string;
  statutContrat: StatutContratLocation;

  bailId: string;
  bailReference: string;
  bailStatut: StatutBail;
  typeBail: string;
  dateDebutBail: string;
  dateFinBail: string;

  depotGarantieStatut: StatutDepotGarantie;
  etatDesLieuxEntreeStatut: StatutEtatDesLieux;

  bienId: string;

  locataireId: string;
  locataireReference: string;
  locataireNom: string;
  locataireEmail: string;
  locataireAdresse: string;

  loyerInitialHC: number;
  chargesMensuelles: number;

  dateRestitutionDepot?: string;
}

interface Quittance {
  id: string;
  reference: string;

  contratId: string;
  contratReference: string;

  bailReference: string;

  bienId: string;
  bienReferenceSnapshot: string;
  bienNomSnapshot: string;
  bienAdresseSnapshot: string;

  locataireId: string;
  locataireReference: string;
  locataireNom: string;
  locataireEmail: string;
  locataireAdresse: string;

  annee: number;
  mois: number;
  moisLabel: string;

  periodeDebut: string;
  periodeFin: string;

  loyerHC: number;
  charges: number;
  soldeAnterieur: number;
  totalAPayer: number;

  montantRecu: number;
  reliquat: number;

  statutPaiement: StatutPaiementQuittance;
  dateEmission: string;
  datePaiement?: string;
  commentairePaiement?: string;

  niveauRelance: NiveauRelance;
  historiqueRelances: HistoriqueRelanceItem[];
  historique: HistoriqueQuittanceItem[];

  estProrata: boolean;
  typeProrata?: "entree" | "sortie";
  joursFactures: number;
  joursDansMois: number;

  miseADispositionEspaceLocataire: boolean;
  pdfDisponible: boolean;
  envoyeeAuLocataire: boolean;
}

type ViewState =
  | { name: "biens" }
  | { name: "annees"; bienId: string }
  | { name: "mois"; bienId: string; annee: number }
  | { name: "quittances_mois"; bienId: string; annee: number; mois: number }
  | { name: "generation" }
  | { name: "detail"; quittance: Quittance };

// ============================================================
// MOCK DATA — MODULE BIENS COMME SOURCE DE VÉRITÉ
// ============================================================

const mockBiens: BienSource[] = [
  {
    id: "bi001",
    reference: "BI-000001",
    nom: "Appartement T2 Centre-ville",
    adresse: "12 Rue Victor Hugo, 69001 Lyon",
    statut: "occupe",
  },
  {
    id: "lot001",
    reference: "LOT-000001",
    nom: "Studio République",
    adresse: "8 Avenue Jean Jaurès, 69007 Lyon",
    statut: "occupe",
  },
  {
    id: "bi003",
    reference: "BI-000003",
    nom: "Maison Victor Hugo",
    adresse: "22 Boulevard Victor Hugo, 59000 Lille",
    statut: "vacant",
  },
];

const mockContrats: ContratQuittancable[] = [
  {
    id: "contrat001",
    reference: "CONTRAT-000001",
    statutContrat: "actif",
    bailId: "bail001",
    bailReference: "BAIL-000001",
    bailStatut: "signe",
    typeBail: "Location nue",
    dateDebutBail: "2025-06-01",
    dateFinBail: "2028-05-31",
    depotGarantieStatut: "actif",
    etatDesLieuxEntreeStatut: "valide",
    bienId: "bi001",
    locataireId: "loc001",
    locataireReference: "LOC-000001",
    locataireNom: "Claire Martin",
    locataireEmail: "claire.martin@email.com",
    locataireAdresse: "12 Rue Victor Hugo, 69001 Lyon",
    loyerInitialHC: 850,
    chargesMensuelles: 80,
  },
  {
    id: "contrat002",
    reference: "CONTRAT-000002",
    statutContrat: "actif",
    bailId: "bail002",
    bailReference: "BAIL-000002",
    bailStatut: "signe",
    typeBail: "Location meublée",
    dateDebutBail: "2026-03-15",
    dateFinBail: "2027-03-14",
    depotGarantieStatut: "actif",
    etatDesLieuxEntreeStatut: "valide",
    bienId: "lot001",
    locataireId: "loc002",
    locataireReference: "LOC-000002",
    locataireNom: "Yanis Bernard",
    locataireEmail: "yanis.bernard@email.com",
    locataireAdresse: "8 Avenue Jean Jaurès, 69007 Lyon",
    loyerInitialHC: 700,
    chargesMensuelles: 60,
  },
];

const mockIndexations: IndexationLoyer[] = [
  {
    id: "idx001",
    contratId: "contrat001",
    ancienLoyer: 850,
    nouveauLoyer: 875,
    dateEffet: "2026-01-01",
    indiceUtilise: "IRL",
    trimestreReference: "3ème trimestre",
    anneeReference: "2025",
    statut: "validee",
  },
];

const mockQuittances: Quittance[] = [
  {
    id: "quit001",
    reference: "QUI-2026-000001",
    contratId: "contrat001",
    contratReference: "CONTRAT-000001",
    bailReference: "BAIL-000001",
    bienId: "bi001",
    bienReferenceSnapshot: "BI-000001",
    bienNomSnapshot: "Appartement T2 Centre-ville",
    bienAdresseSnapshot: "12 Rue Victor Hugo, 69001 Lyon",
    locataireId: "loc001",
    locataireReference: "LOC-000001",
    locataireNom: "Claire Martin",
    locataireEmail: "claire.martin@email.com",
    locataireAdresse: "12 Rue Victor Hugo, 69001 Lyon",
    annee: 2026,
    mois: 1,
    moisLabel: "Janvier 2026",
    periodeDebut: "2026-01-01",
    periodeFin: "2026-01-31",
    loyerHC: 875,
    charges: 80,
    soldeAnterieur: 0,
    totalAPayer: 955,
    montantRecu: 955,
    reliquat: 0,
    statutPaiement: "paye",
    dateEmission: "2026-01-01",
    datePaiement: "2026-01-03",
    commentairePaiement: "Paiement reçu par virement.",
    niveauRelance: "aucune",
    historiqueRelances: [],
    historique: [
      {
        id: "hist001",
        date: "2026-01-01",
        heure: "09:00",
        utilisateur: "Système",
        action: "Quittance générée et mise à disposition du locataire.",
        typeOperation: "generation",
      },
      {
        id: "hist002",
        date: "2026-01-03",
        heure: "10:30",
        utilisateur: "Utilisateur connecté",
        action: "Paiement déclaré : 955 € reçus. Reporting revenus réels alimenté.",
        typeOperation: "paiement_declare",
      },
    ],
    estProrata: false,
    joursFactures: 31,
    joursDansMois: 31,
    miseADispositionEspaceLocataire: true,
    pdfDisponible: true,
    envoyeeAuLocataire: true,
  },
  {
    id: "quit002",
    reference: "QUI-2026-000002",
    contratId: "contrat002",
    contratReference: "CONTRAT-000002",
    bailReference: "BAIL-000002",
    bienId: "lot001",
    bienReferenceSnapshot: "LOT-000001",
    bienNomSnapshot: "Studio République",
    bienAdresseSnapshot: "8 Avenue Jean Jaurès, 69007 Lyon",
    locataireId: "loc002",
    locataireReference: "LOC-000002",
    locataireNom: "Yanis Bernard",
    locataireEmail: "yanis.bernard@email.com",
    locataireAdresse: "8 Avenue Jean Jaurès, 69007 Lyon",
    annee: 2026,
    mois: 3,
    moisLabel: "Mars 2026",
    periodeDebut: "2026-03-15",
    periodeFin: "2026-03-31",
    loyerHC: 384,
    charges: 33,
    soldeAnterieur: 0,
    totalAPayer: 417,
    montantRecu: 200,
    reliquat: 217,
    statutPaiement: "partiellement_paye",
    dateEmission: "2026-03-15",
    datePaiement: "2026-03-20",
    commentairePaiement: "Paiement partiel.",
    niveauRelance: "niveau_1",
    historiqueRelances: [
      {
        id: "rel001",
        niveau: "niveau_1",
        date: "2026-03-25",
        heure: "09:15",
        utilisateur: "Utilisateur connecté",
        canal: "email",
        statutEnvoi: "Relance niveau 1 envoyée",
      },
    ],
    historique: [
      {
        id: "hist003",
        date: "2026-03-15",
        heure: "09:00",
        utilisateur: "Système",
        action: "Quittance proratisée générée.",
        typeOperation: "generation",
      },
      {
        id: "hist004",
        date: "2026-03-20",
        heure: "11:00",
        utilisateur: "Utilisateur connecté",
        action: "Paiement partiel déclaré : 200 € reçus. Reliquat : 217 €.",
        typeOperation: "paiement_declare",
      },
      {
        id: "hist005",
        date: "2026-03-25",
        heure: "09:15",
        utilisateur: "Utilisateur connecté",
        action: "Relance niveau 1 envoyée par e-mail.",
        typeOperation: "relance_envoyee",
      },
    ],
    estProrata: true,
    typeProrata: "entree",
    joursFactures: 17,
    joursDansMois: 31,
    miseADispositionEspaceLocataire: true,
    pdfDisponible: true,
    envoyeeAuLocataire: true,
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

function formatEuros(value: number) {
  return `${Math.round(value).toLocaleString("fr-FR")} €`;
}

function pad2(value: number) {
  return String(value).padStart(2, "0");
}

function toDate(value: string) {
  return new Date(`${value}T00:00:00`);
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function getMonthStart(year: number, month: number) {
  return `${year}-${pad2(month)}-01`;
}

function getMonthEnd(year: number, month: number) {
  return `${year}-${pad2(month)}-${pad2(getDaysInMonth(year, month))}`;
}

function getMonthLabel(year: number, month: number) {
  const date = new Date(year, month - 1, 1);

  const label = date.toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });

  return label.charAt(0).toUpperCase() + label.slice(1);
}

function getMonthsBetween(dateDebut: string, dateFin: string) {
  const start = toDate(dateDebut);
  const end = toDate(dateFin);

  const months: { year: number; month: number }[] = [];
  const cursor = new Date(start.getFullYear(), start.getMonth(), 1);

  while (cursor <= end) {
    months.push({
      year: cursor.getFullYear(),
      month: cursor.getMonth() + 1,
    });

    cursor.setMonth(cursor.getMonth() + 1);
  }

  return months;
}

function generateReferenceQuittance(count: number) {
  return `QUI-${new Date().getFullYear()}-${String(count + 1).padStart(6, "0")}`;
}

function findBien(biens: BienSource[], bienId: string) {
  return biens.find(bien => bien.id === bienId);
}

function getBienNomAffiche(biens: BienSource[], quittance: Quittance) {
  const bien = findBien(biens, quittance.bienId);
  return bien?.nom || quittance.bienNomSnapshot || "Bien non trouvé";
}

function getBienReferenceAffiche(biens: BienSource[], quittance: Quittance) {
  const bien = findBien(biens, quittance.bienId);
  return bien?.reference || quittance.bienReferenceSnapshot || "—";
}

function getBienAdresseAffiche(biens: BienSource[], quittance: Quittance) {
  const bien = findBien(biens, quittance.bienId);
  return bien?.adresse || quittance.bienAdresseSnapshot || "Adresse non renseignée";
}

function contratEligible(contrat: ContratQuittancable) {
  return (
    contrat.statutContrat === "actif" &&
    contrat.bailStatut === "signe" &&
    (contrat.depotGarantieStatut === "recu" ||
      contrat.depotGarantieStatut === "actif" ||
      contrat.depotGarantieStatut === "a_restituer") &&
    contrat.etatDesLieuxEntreeStatut === "valide"
  );
}

function getLoyerApplicable(
  contrat: ContratQuittancable,
  indexations: IndexationLoyer[],
  periodeDebut: string
) {
  const indexationApplicable = indexations
    .filter(
      indexation =>
        indexation.contratId === contrat.id &&
        indexation.statut === "validee" &&
        toDate(indexation.dateEffet) <= toDate(periodeDebut)
    )
    .sort((a, b) => toDate(b.dateEffet).getTime() - toDate(a.dateEffet).getTime())[0];

  return indexationApplicable?.nouveauLoyer ?? contrat.loyerInitialHC;
}

function getSoldeAnterieur(
  quittances: Quittance[],
  contratId: string,
  year: number,
  month: number
) {
  const currentKey = year * 100 + month;

  return quittances
    .filter(q => q.contratId === contratId)
    .filter(q => q.annee * 100 + q.mois < currentKey)
    .reduce((total, q) => total + Math.max(q.reliquat, 0), 0);
}

function quittanceAlreadyExists(
  quittances: Quittance[],
  contratId: string,
  year: number,
  month: number
) {
  return quittances.some(
    q => q.contratId === contratId && q.annee === year && q.mois === month
  );
}

function calculateProrataData(
  contrat: ContratQuittancable,
  year: number,
  month: number
) {
  const monthStart = getMonthStart(year, month);
  const monthEnd = getMonthEnd(year, month);

  let periodeDebut = monthStart;
  let periodeFin = monthEnd;
  let typeProrata: "entree" | "sortie" | undefined;

  if (
    toDate(contrat.dateDebutBail) >= toDate(monthStart) &&
    toDate(contrat.dateDebutBail) <= toDate(monthEnd)
  ) {
    periodeDebut = contrat.dateDebutBail;
    typeProrata = "entree";
  }

  if (
    contrat.dateRestitutionDepot &&
    toDate(contrat.dateRestitutionDepot) >= toDate(monthStart) &&
    toDate(contrat.dateRestitutionDepot) <= toDate(monthEnd)
  ) {
    periodeFin = contrat.dateRestitutionDepot;
    typeProrata = "sortie";
  }

  const joursDansMois = getDaysInMonth(year, month);
  const joursFactures =
    Math.floor(
      (toDate(periodeFin).getTime() - toDate(periodeDebut).getTime()) /
        (1000 * 60 * 60 * 24)
    ) + 1;

  return {
    periodeDebut,
    periodeFin,
    joursDansMois,
    joursFactures,
    estProrata: joursFactures !== joursDansMois,
    typeProrata,
  };
}

function calculerStatutPaiement(
  montantRecu: number,
  totalAPayer: number
): StatutPaiementQuittance {
  if (montantRecu <= 0) return "impaye";
  if (montantRecu >= totalAPayer) return "paye";
  return "partiellement_paye";
}

function getReliquat(totalAPayer: number, montantRecu: number) {
  return Math.max(totalAPayer - montantRecu, 0);
}

function getRevenusReelsReporting(quittances: Quittance[]) {
  return quittances.reduce((total, q) => total + q.montantRecu, 0);
}

function getTotalRestesDus(quittances: Quittance[]) {
  return quittances.reduce((total, q) => total + q.reliquat, 0);
}

function getStatutPaiementLabel(statut: StatutPaiementQuittance) {
  const labels: Record<StatutPaiementQuittance, string> = {
    en_attente: "En attente",
    paye: "Payé",
    partiellement_paye: "Partiellement payé",
    impaye: "Impayé",
  };

  return labels[statut];
}

function getNiveauRelanceLabel(niveau: NiveauRelance) {
  const labels: Record<NiveauRelance, string> = {
    aucune: "Aucune relance",
    niveau_1: "Niveau 1",
    niveau_2: "Niveau 2",
    niveau_3: "Niveau 3",
  };

  return labels[niveau];
}

function buildHistorique(
  action: string,
  typeOperation: TypeOperationHistorique,
  utilisateur = "Système"
): HistoriqueQuittanceItem {
  return {
    id: `hist-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    date: getToday(),
    heure: getNowTime(),
    utilisateur,
    action,
    typeOperation,
  };
}

// ============================================================
// HELPERS ARBORESCENCE
// ============================================================

function getBiensConsultables(
  biens: BienSource[],
  contrats: ContratQuittancable[],
  quittances: Quittance[]
) {
  return biens.filter(bien => {
    const hasContratActif = contrats.some(
      contrat => contrat.bienId === bien.id && contrat.statutContrat === "actif"
    );

    const hasHistoriqueQuittance = quittances.some(q => q.bienId === bien.id);

    return hasContratActif || hasHistoriqueQuittance;
  });
}

function getAnneesPourBien(quittances: Quittance[], bienId: string) {
  return Array.from(
    new Set(quittances.filter(q => q.bienId === bienId).map(q => q.annee))
  ).sort((a, b) => b - a);
}

function getMoisPourBienEtAnnee(
  quittances: Quittance[],
  bienId: string,
  annee: number
) {
  return Array.from(
    new Set(
      quittances
        .filter(q => q.bienId === bienId && q.annee === annee)
        .map(q => q.mois)
    )
  ).sort((a, b) => b - a);
}

function getQuittancesPourBienAnneeMois(
  quittances: Quittance[],
  bienId: string,
  annee: number,
  mois: number
) {
  return quittances
    .filter(q => q.bienId === bienId && q.annee === annee && q.mois === mois)
    .sort((a, b) => a.locataireNom.localeCompare(b.locataireNom));
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
  readOnly = false,
  required = false,
  placeholder = "",
}: {
  label: string;
  value: string | number;
  onChange?: (value: string) => void;
  type?: string;
  readOnly?: boolean;
  required?: boolean;
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
        readOnly={readOnly}
        placeholder={placeholder}
        onChange={event => onChange?.(event.target.value)}
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

function StatutPaiementBadge({ statut }: { statut: StatutPaiementQuittance }) {
  const cfg: Record<StatutPaiementQuittance, { bg: string; color: string }> = {
    en_attente: { bg: "#fef9c3", color: "#854d0e" },
    paye: { bg: "#dcfce7", color: "#166534" },
    partiellement_paye: { bg: "#ffedd5", color: "#9a3412" },
    impaye: { bg: "#fee2e2", color: "#991b1b" },
  };

  const c = cfg[statut];

  return (
    <span
      className="px-2 py-0.5 rounded-full text-xs font-bold"
      style={{ backgroundColor: c.bg, color: c.color }}
    >
      {getStatutPaiementLabel(statut)}
    </span>
  );
}

function RelanceBadge({ niveau }: { niveau: NiveauRelance }) {
  const cfg: Record<NiveauRelance, { bg: string; color: string }> = {
    aucune: { bg: "#f1f5f9", color: "#64748b" },
    niveau_1: { bg: "#dbeafe", color: "#1d4ed8" },
    niveau_2: { bg: "#ffedd5", color: "#9a3412" },
    niveau_3: { bg: "#fee2e2", color: "#991b1b" },
  };

  const c = cfg[niveau];

  return (
    <span
      className="px-2 py-0.5 rounded-full text-xs font-bold"
      style={{ backgroundColor: c.bg, color: c.color }}
    >
      {getNiveauRelanceLabel(niveau)}
    </span>
  );
}

function PageHeader({
  title,
  subtitle,
  onBack,
  action,
}: {
  title: string;
  subtitle: string;
  onBack?: () => void;
  action?: ReactNode;
}) {
  return (
    <div
      className="px-4 sm:px-6 py-5"
      style={{ background: "linear-gradient(135deg,#fff7ed,#fff)" }}
    >
      <div className="max-w-6xl mx-auto">
        {onBack && (
          <button
            onClick={onBack}
            className="text-xs font-bold mb-3 hover:underline"
            style={{ color: "#f97316" }}
          >
            ← Retour
          </button>
        )}

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-black" style={{ color: "#1e293b" }}>
              {title}
            </h1>
            <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>
              {subtitle}
            </p>
          </div>

          {action}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// VUE 1 — BIENS
// ============================================================

function VueBiensQuittances({
  biens,
  contrats,
  quittances,
  onSelectBien,
  onGenerate,
}: {
  biens: BienSource[];
  contrats: ContratQuittancable[];
  quittances: Quittance[];
  onSelectBien: (bienId: string) => void;
  onGenerate: () => void;
}) {
  const [recherche, setRecherche] = useState("");

  const biensConsultables = getBiensConsultables(biens, contrats, quittances).filter(
    bien =>
      bien.nom.toLowerCase().includes(recherche.toLowerCase()) ||
      bien.reference.toLowerCase().includes(recherche.toLowerCase()) ||
      bien.adresse.toLowerCase().includes(recherche.toLowerCase())
  );

  const revenusReels = getRevenusReelsReporting(quittances);
  const restesDus = getTotalRestesDus(quittances);

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "#f8fafc", fontFamily: "'Inter', sans-serif" }}
    >
      <PageHeader
        title="🧾 Quittances"
        subtitle="Consultation par bien, génération, paiements, relances, soldes antérieurs et reporting réel."
        action={
          <button
            onClick={onGenerate}
            className="px-5 py-2.5 rounded-2xl text-white text-sm font-extrabold shadow-lg"
            style={{ background: "linear-gradient(135deg,#f97316,#fb923c)" }}
          >
            + Générer les quittances
          </button>
        }
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          {[
            {
              emoji: "🏠",
              value: biensConsultables.length,
              label: "Biens",
              bg: "linear-gradient(135deg,#f97316,#fb923c)",
            },
            {
              emoji: "🧾",
              value: quittances.length,
              label: "Quittances",
              bg: "linear-gradient(135deg,#8b5cf6,#a78bfa)",
            },
            {
              emoji: "📊",
              value: formatEuros(revenusReels),
              label: "Revenus réels",
              bg: "linear-gradient(135deg,#3b82f6,#60a5fa)",
            },
            {
              emoji: "⚠️",
              value: formatEuros(restesDus),
              label: "Restes dus",
              bg: "linear-gradient(135deg,#ef4444,#f87171)",
            },
          ].map(stat => (
            <div
              key={stat.label}
              className="rounded-3xl p-4 text-white"
              style={{ background: stat.bg }}
            >
              <div className="text-2xl mb-1">{stat.emoji}</div>
              <p className="text-xl sm:text-2xl font-black">{stat.value}</p>
              <p className="text-xs font-bold opacity-90">{stat.label}</p>
            </div>
          ))}
        </div>

        <input
          value={recherche}
          onChange={event => setRecherche(event.target.value)}
          placeholder="Rechercher un bien..."
          className="w-full px-4 py-3 rounded-2xl text-sm border outline-none mb-5"
          style={{ borderColor: "#e2e8f0", backgroundColor: "#fff" }}
        />

        {biensConsultables.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">🏠</div>
            <p className="font-bold text-base" style={{ color: "#1e293b" }}>
              Aucun bien à afficher
            </p>
            <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>
              Les biens apparaissent lorsqu’ils disposent d’un contrat actif ou
              d’un historique de quittancement.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {biensConsultables.map(bien => {
              const quittancesBien = quittances.filter(q => q.bienId === bien.id);
              const contratsActifs = contrats.filter(
                contrat => contrat.bienId === bien.id && contrat.statutContrat === "actif"
              );

              return (
                <button
                  key={bien.id}
                  onClick={() => onSelectBien(bien.id)}
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
                        🏠
                      </div>

                      <div>
                        <p
                          className="font-extrabold text-sm"
                          style={{ color: "#1e293b" }}
                        >
                          {bien.nom}
                        </p>

                        <p className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>
                          {bien.reference} · {bien.adresse}
                        </p>

                        <p className="text-xs mt-0.5" style={{ color: "#cbd5e1" }}>
                          {contratsActifs.length} contrat(s) actif(s) ·{" "}
                          {quittancesBien.length} quittance(s)
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-extrabold" style={{ color: "#f97316" }}>
                        {formatEuros(getRevenusReelsReporting(quittancesBien))}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>
                        Revenus réels
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
// VUE 2 — ANNÉES
// ============================================================

function VueAnneesQuittances({
  bien,
  quittances,
  onBack,
  onSelectAnnee,
}: {
  bien: BienSource;
  quittances: Quittance[];
  onBack: () => void;
  onSelectAnnee: (annee: number) => void;
}) {
  const annees = getAnneesPourBien(quittances, bien.id);

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "#f8fafc", fontFamily: "'Inter', sans-serif" }}
    >
      <PageHeader
        title={`🏠 ${bien.nom}`}
        subtitle={`${bien.reference} · ${bien.adresse}`}
        onBack={onBack}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5">
        <SectionCard>
          <SectionTitle emoji="📅" title="Années disponibles" />

          {annees.length === 0 ? (
            <p className="text-sm text-center py-8" style={{ color: "#94a3b8" }}>
              Aucune quittance générée pour ce bien.
            </p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {annees.map(annee => {
                const quittancesAnnee = quittances.filter(
                  q => q.bienId === bien.id && q.annee === annee
                );

                return (
                  <button
                    key={annee}
                    onClick={() => onSelectAnnee(annee)}
                    className="p-5 rounded-3xl text-left transition hover:shadow-md"
                    style={{ backgroundColor: "#f8fafc" }}
                  >
                    <p className="text-2xl font-black" style={{ color: "#1e293b" }}>
                      {annee}
                    </p>
                    <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>
                      {quittancesAnnee.length} quittance(s)
                    </p>
                    <p className="text-sm font-extrabold mt-3" style={{ color: "#f97316" }}>
                      {formatEuros(getRevenusReelsReporting(quittancesAnnee))}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>
                      Revenus réels déclarés
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}

// ============================================================
// VUE 3 — MOIS
// ============================================================

function VueMoisQuittances({
  bien,
  annee,
  quittances,
  onBack,
  onSelectMois,
}: {
  bien: BienSource;
  annee: number;
  quittances: Quittance[];
  onBack: () => void;
  onSelectMois: (mois: number) => void;
}) {
  const moisDisponibles = getMoisPourBienEtAnnee(quittances, bien.id, annee);

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "#f8fafc", fontFamily: "'Inter', sans-serif" }}
    >
      <PageHeader
        title={`📅 ${bien.nom} — ${annee}`}
        subtitle={`${bien.reference} · Consultation mensuelle des quittances`}
        onBack={onBack}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5">
        <SectionCard>
          <SectionTitle emoji="🗓️" title="Mois disponibles" />

          {moisDisponibles.length === 0 ? (
            <p className="text-sm text-center py-8" style={{ color: "#94a3b8" }}>
              Aucune quittance disponible pour cette année.
            </p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {moisDisponibles.map(mois => {
                const quittancesMois = getQuittancesPourBienAnneeMois(
                  quittances,
                  bien.id,
                  annee,
                  mois
                );

                return (
                  <button
                    key={mois}
                    onClick={() => onSelectMois(mois)}
                    className="p-5 rounded-3xl text-left transition hover:shadow-md"
                    style={{ backgroundColor: "#f8fafc" }}
                  >
                    <p className="text-xl font-black" style={{ color: "#1e293b" }}>
                      {getMonthLabel(annee, mois).replace(` ${annee}`, "")}
                    </p>

                    <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>
                      {quittancesMois.length} quittance(s)
                    </p>

                    <div className="mt-3 flex items-center gap-2 flex-wrap">
                      {quittancesMois.some(q => q.statutPaiement === "impaye") && (
                        <StatutPaiementBadge statut="impaye" />
                      )}

                      {quittancesMois.some(
                        q => q.statutPaiement === "partiellement_paye"
                      ) && <StatutPaiementBadge statut="partiellement_paye" />}

                      {quittancesMois.every(q => q.statutPaiement === "paye") && (
                        <StatutPaiementBadge statut="paye" />
                      )}

                      {quittancesMois.some(q => q.statutPaiement === "en_attente") && (
                        <StatutPaiementBadge statut="en_attente" />
                      )}
                    </div>

                    <p className="text-sm font-extrabold mt-3" style={{ color: "#f97316" }}>
                      {formatEuros(getRevenusReelsReporting(quittancesMois))}
                    </p>

                    <p className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>
                      Revenus réels du mois
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}

// ============================================================
// VUE 4 — QUITTANCES DU MOIS
// ============================================================

function VueQuittancesDuMois({
  bien,
  annee,
  mois,
  quittances,
  biens,
  onBack,
  onSelectQuittance,
}: {
  bien: BienSource;
  annee: number;
  mois: number;
  quittances: Quittance[];
  biens: BienSource[];
  onBack: () => void;
  onSelectQuittance: (quittance: Quittance) => void;
}) {
  const quittancesMois = getQuittancesPourBienAnneeMois(
    quittances,
    bien.id,
    annee,
    mois
  );

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "#f8fafc", fontFamily: "'Inter', sans-serif" }}
    >
      <PageHeader
        title={`🧾 ${getMonthLabel(annee, mois)}`}
        subtitle={`${bien.nom} · ${bien.reference}`}
        onBack={onBack}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5">
        <SectionCard>
          <SectionTitle emoji="🧾" title="Quittances du mois" />

          {quittancesMois.length === 0 ? (
            <p className="text-sm text-center py-8" style={{ color: "#94a3b8" }}>
              Aucune quittance disponible pour ce mois.
            </p>
          ) : (
            <div className="space-y-3">
              {quittancesMois.map(quittance => (
                <button
                  key={quittance.id}
                  onClick={() => onSelectQuittance(quittance)}
                  className="w-full p-4 rounded-3xl text-left transition hover:shadow-md"
                  style={{ backgroundColor: "#f8fafc" }}
                >
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p
                          className="text-sm font-extrabold"
                          style={{ color: "#1e293b" }}
                        >
                          {quittance.reference}
                        </p>

                        <StatutPaiementBadge statut={quittance.statutPaiement} />
                        <RelanceBadge niveau={quittance.niveauRelance} />
                      </div>

                      <p className="text-xs mt-1" style={{ color: "#94a3b8" }}>
                        Locataire : {quittance.locataireNom}
                      </p>

                      <p className="text-xs mt-0.5" style={{ color: "#cbd5e1" }}>
                        Bien : {getBienNomAffiche(biens, quittance)}
                      </p>

                      <p className="text-xs mt-0.5" style={{ color: "#cbd5e1" }}>
                        Période : {quittance.periodeDebut} → {quittance.periodeFin}
                      </p>
                    </div>

                    <div className="text-right">
                      <p
                        className="text-sm font-extrabold"
                        style={{ color: "#f97316" }}
                      >
                        {formatEuros(quittance.totalAPayer)}
                      </p>

                      <p className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>
                        Loyer HC : {formatEuros(quittance.loyerHC)}
                      </p>

                      <p className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>
                        Charges : {formatEuros(quittance.charges)}
                      </p>

                      <p className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>
                        Solde antérieur : {formatEuros(quittance.soldeAnterieur)}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}

// ============================================================
// GÉNÉRATION DES QUITTANCES
// ============================================================

function VueGenerationQuittances({
  biens,
  contrats,
  quittances,
  indexations,
  onBack,
  onGenerate,
}: {
  biens: BienSource[];
  contrats: ContratQuittancable[];
  quittances: Quittance[];
  indexations: IndexationLoyer[];
  onBack: () => void;
  onGenerate: (quittances: Quittance[]) => void;
}) {
  const [dateDebut, setDateDebut] = useState("2026-04-01");
  const [dateFin, setDateFin] = useState("2026-04-30");

  const contratsEligibles = contrats.filter(contratEligible);

  const previewQuittances = useMemo(() => {
    const months = getMonthsBetween(dateDebut, dateFin);
    const generated: Quittance[] = [];

    contratsEligibles.forEach(contrat => {
      const bien = findBien(biens, contrat.bienId);

      if (!bien) return;

      months.forEach(({ year, month }) => {
        if (
          quittanceAlreadyExists(
            [...quittances, ...generated],
            contrat.id,
            year,
            month
          )
        ) {
          return;
        }

        const prorata = calculateProrataData(contrat, year, month);
        const loyerApplicable = getLoyerApplicable(
          contrat,
          indexations,
          prorata.periodeDebut
        );

        const ratio = prorata.joursFactures / prorata.joursDansMois;
        const loyerHC = Math.round(loyerApplicable * ratio);
        const charges = Math.round(contrat.chargesMensuelles * ratio);

        const soldeAnterieur = getSoldeAnterieur(
          [...quittances, ...generated],
          contrat.id,
          year,
          month
        );

        const totalAPayer = loyerHC + charges + soldeAnterieur;

        generated.push({
          id: `quit-${Date.now()}-${Math.random().toString(16).slice(2)}`,
          reference: generateReferenceQuittance(quittances.length + generated.length),

          contratId: contrat.id,
          contratReference: contrat.reference,

          bailReference: contrat.bailReference,

          bienId: bien.id,
          bienReferenceSnapshot: bien.reference,
          bienNomSnapshot: bien.nom,
          bienAdresseSnapshot: bien.adresse,

          locataireId: contrat.locataireId,
          locataireReference: contrat.locataireReference,
          locataireNom: contrat.locataireNom,
          locataireEmail: contrat.locataireEmail,
          locataireAdresse: contrat.locataireAdresse,

          annee: year,
          mois: month,
          moisLabel: getMonthLabel(year, month),

          periodeDebut: prorata.periodeDebut,
          periodeFin: prorata.periodeFin,

          loyerHC,
          charges,
          soldeAnterieur,
          totalAPayer,

          montantRecu: 0,
          reliquat: totalAPayer,

          statutPaiement: "en_attente",
          dateEmission: getToday(),

          niveauRelance: "aucune",
          historiqueRelances: [],
          historique: [
            buildHistorique(
              `Quittance générée pour ${getMonthLabel(year, month)}.`,
              "generation"
            ),
            buildHistorique(
              "Quittance ajoutée à l’espace locataire, au dossier locataire et à l’historique du bien.",
              "mise_a_disposition"
            ),
          ],

          estProrata: prorata.estProrata,
          typeProrata: prorata.typeProrata,
          joursFactures: prorata.joursFactures,
          joursDansMois: prorata.joursDansMois,

          miseADispositionEspaceLocataire: true,
          pdfDisponible: true,
          envoyeeAuLocataire: false,
        });
      });
    });

    return generated;
  }, [dateDebut, dateFin, contratsEligibles, quittances, indexations, biens]);

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "#f8fafc", fontFamily: "'Inter', sans-serif" }}
    >
      <PageHeader
        title="🧾 Générer les quittances"
        subtitle="Génération à partir des contrats actifs, avec indexations, proratas et soldes antérieurs."
        onBack={onBack}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 space-y-4">
        <SectionCard>
          <SectionTitle emoji="📅" title="Période de quittancement" />

          <div className="grid sm:grid-cols-2 gap-4">
            <FormInput
              label="Date de début"
              value={dateDebut}
              onChange={setDateDebut}
              type="date"
              required
            />

            <FormInput
              label="Date de fin"
              value={dateFin}
              onChange={setDateFin}
              type="date"
              required
            />
          </div>
        </SectionCard>

        <SectionCard>
          <SectionTitle emoji="✅" title="Aperçu" />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <InfoRow label="Contrats éligibles" value={contratsEligibles.length} />
            <InfoRow label="Quittances à générer" value={previewQuittances.length} />
            <InfoRow
              label="Total à quittancer"
              value={formatEuros(
                previewQuittances.reduce((total, q) => total + q.totalAPayer, 0)
              )}
            />
            <InfoRow
              label="Soldes antérieurs"
              value={formatEuros(
                previewQuittances.reduce((total, q) => total + q.soldeAnterieur, 0)
              )}
            />
          </div>
        </SectionCard>

        <SectionCard>
          <SectionTitle emoji="🧾" title="Quittances prévues" />

          {previewQuittances.length === 0 ? (
            <p className="text-sm text-center py-8" style={{ color: "#94a3b8" }}>
              Aucune nouvelle quittance à générer pour cette période.
            </p>
          ) : (
            <div className="space-y-2">
              {previewQuittances.map(quittance => (
                <div
                  key={quittance.id}
                  className="p-3 rounded-2xl"
                  style={{ backgroundColor: "#f8fafc" }}
                >
                  <div className="flex justify-between gap-3 flex-wrap">
                    <div>
                      <p
                        className="text-sm font-extrabold"
                        style={{ color: "#1e293b" }}
                      >
                        {quittance.moisLabel} · {quittance.bienNomSnapshot}
                      </p>

                      <p className="text-xs" style={{ color: "#94a3b8" }}>
                        {quittance.locataireNom} · {quittance.periodeDebut} →{" "}
                        {quittance.periodeFin}
                      </p>

                      {quittance.estProrata && (
                        <p className="text-xs font-bold mt-1" style={{ color: "#f97316" }}>
                          Prorata {quittance.typeProrata} ·{" "}
                          {quittance.joursFactures}/{quittance.joursDansMois} jours
                        </p>
                      )}
                    </div>

                    <div className="text-right">
                      <p
                        className="text-sm font-extrabold"
                        style={{ color: "#f97316" }}
                      >
                        {formatEuros(quittance.totalAPayer)}
                      </p>

                      <p className="text-xs" style={{ color: "#94a3b8" }}>
                        Solde antérieur : {formatEuros(quittance.soldeAnterieur)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={() => onGenerate(previewQuittances)}
            disabled={previewQuittances.length === 0}
            className="mt-5 w-full py-3 rounded-2xl text-white text-sm font-extrabold shadow disabled:opacity-50"
            style={{ background: "linear-gradient(135deg,#22c55e,#16a34a)" }}
          >
            ✅ Générer les quittances
          </button>
        </SectionCard>
      </div>
    </div>
  );
}

// ============================================================
// DÉTAIL QUITTANCE
// ============================================================

function VueDetailQuittance({
  quittance,
  biens,
  quittances,
  onBack,
  onUpdate,
  onOpenLocataire,
  onOpenBien,
}: {
  quittance: Quittance;
  biens: BienSource[];
  quittances: Quittance[];
  onBack: () => void;
  onUpdate: (quittance: Quittance) => void;
  onOpenLocataire: (id: string) => void;
  onOpenBien: (id: string) => void;
}) {
  const [onglet, setOnglet] = useState<
    "synthese" | "paiement" | "relances" | "historique" | "reporting"
  >("synthese");

  const [datePaiement, setDatePaiement] = useState(
    quittance.datePaiement || getToday()
  );
  const [montantRecu, setMontantRecu] = useState(
    quittance.montantRecu || quittance.totalAPayer
  );
  const [commentairePaiement, setCommentairePaiement] = useState(
    quittance.commentairePaiement || ""
  );

  const bienNomActuel = getBienNomAffiche(biens, quittance);
  const bienReferenceActuelle = getBienReferenceAffiche(biens, quittance);
  const bienAdresseActuelle = getBienAdresseAffiche(biens, quittance);

  const onglets = [
    { id: "synthese", label: "Synthèse", emoji: "📋" },
    { id: "paiement", label: "Paiement", emoji: "💶" },
    { id: "relances", label: "Relances", emoji: "📨" },
    { id: "historique", label: "Historique", emoji: "🕐" },
    { id: "reporting", label: "Reporting", emoji: "📊" },
  ] as const;

  const handleDeclarePayment = () => {
    const nextStatut = calculerStatutPaiement(montantRecu, quittance.totalAPayer);
    const nextReliquat = getReliquat(quittance.totalAPayer, montantRecu);

    const updated: Quittance = {
      ...quittance,
      montantRecu,
      reliquat: nextReliquat,
      statutPaiement: nextStatut,
      datePaiement,
      commentairePaiement,
      historique: [
        ...quittance.historique,
        buildHistorique(
          `Paiement déclaré : ${formatEuros(montantRecu)} reçus. Reliquat : ${formatEuros(nextReliquat)}.`,
          "paiement_declare",
          "Utilisateur connecté"
        ),
        buildHistorique(
          `Reporting alimenté — revenus réels : +${formatEuros(montantRecu)}.`,
          "modification_statut",
          "Système"
        ),
        buildHistorique(
          "Dossier locataire, espace locataire, historique du bien et indicateurs de suivi mis à jour.",
          "modification_statut",
          "Système"
        ),
      ],
    };

    onUpdate(updated);
  };

  const handleDeclareUnpaid = () => {
    const updated: Quittance = {
      ...quittance,
      montantRecu: 0,
      reliquat: quittance.totalAPayer,
      statutPaiement: "impaye",
      datePaiement: undefined,
      commentairePaiement: "Paiement non reçu.",
      historique: [
        ...quittance.historique,
        buildHistorique(
          `Quittance déclarée impayée. Reliquat reportable : ${formatEuros(quittance.totalAPayer)}.`,
          "modification_statut",
          "Utilisateur connecté"
        ),
      ],
    };

    onUpdate(updated);
  };

  const handleDownloadPdf = () => {
    const updated: Quittance = {
      ...quittance,
      historique: [
        ...quittance.historique,
        buildHistorique(
          "Quittance téléchargée au format PDF.",
          "telechargement_pdf",
          "Utilisateur connecté"
        ),
      ],
    };

    onUpdate(updated);
    alert("Téléchargement PDF simulé.");
  };

  const handleSendToTenant = () => {
    const updated: Quittance = {
      ...quittance,
      envoyeeAuLocataire: true,
      historique: [
        ...quittance.historique,
        buildHistorique(
          `Quittance envoyée au locataire par e-mail : ${quittance.locataireEmail}.`,
          "envoi_locataire",
          "Utilisateur connecté"
        ),
      ],
    };

    onUpdate(updated);
    alert("Quittance envoyée au locataire.");
  };

  const canRelance =
    quittance.statutPaiement === "en_attente" ||
    quittance.statutPaiement === "partiellement_paye" ||
    quittance.statutPaiement === "impaye";

  const handleRelance = (niveau: Exclude<NiveauRelance, "aucune">) => {
    if (!canRelance) {
      alert(
        "Une relance n’est possible que pour une quittance en attente, partiellement payée ou impayée."
      );
      return;
    }

    const relanceConfig: Record<
      Exclude<NiveauRelance, "aucune">,
      {
        canal: HistoriqueRelanceItem["canal"];
        statutEnvoi: string;
        action: string;
      }
    > = {
      niveau_1: {
        canal: "email",
        statutEnvoi: "Relance niveau 1 envoyée",
        action: `Relance simple envoyée par e-mail à ${quittance.locataireEmail}.`,
      },
      niveau_2: {
        canal: "courrier_recommande",
        statutEnvoi: "Relance niveau 2 envoyée",
        action: "Courrier recommandé avec accusé de réception généré.",
      },
      niveau_3: {
        canal: "mise_en_demeure",
        statutEnvoi: "Relance niveau 3 envoyée",
        action: "Mise en demeure de payer générée avec courrier recommandé.",
      },
    };

    const config = relanceConfig[niveau];

    const relance: HistoriqueRelanceItem = {
      id: `rel-${Date.now()}`,
      niveau,
      date: getToday(),
      heure: getNowTime(),
      utilisateur: "Utilisateur connecté",
      canal: config.canal,
      statutEnvoi: config.statutEnvoi,
    };

    const updated: Quittance = {
      ...quittance,
      niveauRelance: niveau,
      historiqueRelances: [...quittance.historiqueRelances, relance],
      historique: [
        ...quittance.historique,
        buildHistorique(config.action, "relance_envoyee", "Utilisateur connecté"),
      ],
    };

    onUpdate(updated);
  };

  const quittancesLocataire = quittances.filter(
    q => q.locataireId === quittance.locataireId
  );

  const incidentsLocataire = quittancesLocataire.filter(
    q => q.statutPaiement === "impaye" || q.statutPaiement === "partiellement_paye"
  ).length;

  const statutLocataire =
    incidentsLocataire >= 3
      ? "Critique"
      : incidentsLocataire >= 2
        ? "Vigilance"
        : "Parfait";

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "#f8fafc", fontFamily: "'Inter', sans-serif" }}
    >
      <PageHeader
        title={`🧾 ${quittance.reference}`}
        subtitle={`${quittance.moisLabel} · ${quittance.locataireNom} · ${bienNomActuel}`}
        onBack={onBack}
        action={
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={handleDownloadPdf}
              className="px-4 py-2 rounded-2xl text-sm font-bold"
              style={{ backgroundColor: "#eff6ff", color: "#2563eb" }}
            >
              Télécharger PDF
            </button>

            <button
              onClick={handleSendToTenant}
              className="px-4 py-2 rounded-2xl text-sm font-bold"
              style={{ backgroundColor: "#f3e8ff", color: "#8b5cf6" }}
            >
              Envoyer au locataire
            </button>
          </div>
        }
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-5">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {onglets.map(item => (
            <button
              key={item.id}
              onClick={() => setOnglet(item.id)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap"
              style={{
                backgroundColor: onglet === item.id ? "#f97316" : "#fff",
                color: onglet === item.id ? "#fff" : "#64748b",
                boxShadow:
                  onglet === item.id ? "0 2px 8px rgba(249,115,22,0.3)" : "none",
              }}
            >
              {item.emoji} {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-4">
        {onglet === "synthese" && (
          <>
            <SectionCard>
              <SectionTitle emoji="📋" title="Synthèse" />

              <div className="flex gap-2 flex-wrap mb-4">
                <StatutPaiementBadge statut={quittance.statutPaiement} />
                <RelanceBadge niveau={quittance.niveauRelance} />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <InfoRow label="Mois" value={quittance.moisLabel} />
                <InfoRow label="Période début" value={quittance.periodeDebut} />
                <InfoRow label="Période fin" value={quittance.periodeFin} />
                <InfoRow label="Date émission" value={quittance.dateEmission} />

                <InfoRow label="Loyer HC" value={formatEuros(quittance.loyerHC)} />
                <InfoRow label="Charges" value={formatEuros(quittance.charges)} />
                <InfoRow
                  label="Solde antérieur"
                  value={formatEuros(quittance.soldeAnterieur)}
                />
                <InfoRow
                  label="Total à payer"
                  value={formatEuros(quittance.totalAPayer)}
                />

                <InfoRow
                  label="Montant reçu"
                  value={formatEuros(quittance.montantRecu)}
                />
                <InfoRow label="Reliquat" value={formatEuros(quittance.reliquat)} />
                <InfoRow label="Date paiement" value={quittance.datePaiement || "—"} />
                <InfoRow
                  label="Envoyée au locataire"
                  value={quittance.envoyeeAuLocataire ? "Oui" : "Non"}
                />
              </div>
            </SectionCard>

            <SectionCard>
              <SectionTitle emoji="🏠" title="Bien et locataire" />

              <div className="grid sm:grid-cols-2 gap-3">
                <InfoRow
                  label="Bien actuel depuis module Biens"
                  value={`${bienReferenceActuelle} · ${bienNomActuel}`}
                />
                <InfoRow label="Adresse actuelle" value={bienAdresseActuelle} />
                <InfoRow
                  label="Nom figé sur la quittance"
                  value={quittance.bienNomSnapshot}
                />
                <InfoRow
                  label="Adresse figée sur la quittance"
                  value={quittance.bienAdresseSnapshot}
                />
                <InfoRow label="Locataire" value={quittance.locataireNom} />
                <InfoRow label="E-mail locataire" value={quittance.locataireEmail} />
              </div>

              <div className="flex gap-2 flex-wrap mt-5">
                <button
                  onClick={() => onOpenBien(quittance.bienId)}
                  className="px-4 py-2 rounded-2xl text-sm font-bold"
                  style={{ backgroundColor: "#eff6ff", color: "#2563eb" }}
                >
                  Ouvrir le bien
                </button>

                <button
                  onClick={() => onOpenLocataire(quittance.locataireId)}
                  className="px-4 py-2 rounded-2xl text-sm font-bold"
                  style={{ backgroundColor: "#f3e8ff", color: "#8b5cf6" }}
                >
                  Ouvrir le locataire
                </button>
              </div>
            </SectionCard>
          </>
        )}

        {onglet === "paiement" && (
          <SectionCard>
            <SectionTitle emoji="💶" title="Déclaration du paiement" />

            <p className="text-sm mb-4" style={{ color: "#64748b" }}>
              La plateforme ne gère aucun flux bancaire. Le propriétaire déclare
              manuellement les paiements reçus. Les montants déclarés alimentent
              le volet revenus réels du module Reporting.
            </p>

            <div className="grid sm:grid-cols-3 gap-4">
              <FormInput
                label="Date de réception"
                value={datePaiement}
                onChange={setDatePaiement}
                type="date"
              />

              <FormInput
                label="Montant reçu"
                value={montantRecu}
                onChange={value => setMontantRecu(Number(value))}
                type="number"
              />

              <FormInput
                label="Total à payer"
                value={formatEuros(quittance.totalAPayer)}
                readOnly
              />
            </div>

            <div className="mt-4">
              <label
                className="block text-xs font-bold mb-1"
                style={{ color: "#64748b" }}
              >
                Commentaire
              </label>

              <textarea
                value={commentairePaiement}
                onChange={event => setCommentairePaiement(event.target.value)}
                rows={3}
                className="w-full px-4 py-3 rounded-2xl text-sm border outline-none resize-none"
                style={{ borderColor: "#e2e8f0" }}
                placeholder="Ex : paiement reçu par virement..."
              />
            </div>

            <div className="grid sm:grid-cols-3 gap-3 mt-5">
              <button
                onClick={handleDeclarePayment}
                className="py-3 rounded-2xl text-white text-sm font-extrabold shadow"
                style={{ background: "linear-gradient(135deg,#22c55e,#16a34a)" }}
              >
                ✅ Déclarer le paiement
              </button>

              <button
                onClick={() => setMontantRecu(Math.round(quittance.totalAPayer / 2))}
                className="py-3 rounded-2xl text-sm font-extrabold"
                style={{ backgroundColor: "#fff7ed", color: "#f97316" }}
              >
                Paiement partiel
              </button>

              <button
                onClick={handleDeclareUnpaid}
                className="py-3 rounded-2xl text-sm font-extrabold"
                style={{ backgroundColor: "#fef2f2", color: "#ef4444" }}
              >
                Déclarer impayé
              </button>
            </div>
          </SectionCard>
        )}

        {onglet === "relances" && (
          <SectionCard>
            <SectionTitle emoji="📨" title="Relances" />

            <p className="text-sm mb-4" style={{ color: "#64748b" }}>
              Les relances sont possibles pour les quittances en attente,
              partiellement payées ou impayées.
            </p>

            <div className="grid sm:grid-cols-3 gap-3">
              <button
                onClick={() => handleRelance("niveau_1")}
                disabled={!canRelance}
                className="p-4 rounded-3xl text-left disabled:opacity-50"
                style={{ backgroundColor: "#eff6ff" }}
              >
                <p className="text-sm font-extrabold" style={{ color: "#1d4ed8" }}>
                  Relance niveau 1
                </p>
                <p className="text-xs mt-1" style={{ color: "#64748b" }}>
                  Relance simple par e-mail.
                </p>
              </button>

              <button
                onClick={() => handleRelance("niveau_2")}
                disabled={!canRelance}
                className="p-4 rounded-3xl text-left disabled:opacity-50"
                style={{ backgroundColor: "#fff7ed" }}
              >
                <p className="text-sm font-extrabold" style={{ color: "#9a3412" }}>
                  Relance niveau 2
                </p>
                <p className="text-xs mt-1" style={{ color: "#64748b" }}>
                  Courrier recommandé avec AR.
                </p>
              </button>

              <button
                onClick={() => handleRelance("niveau_3")}
                disabled={!canRelance}
                className="p-4 rounded-3xl text-left disabled:opacity-50"
                style={{ backgroundColor: "#fef2f2" }}
              >
                <p className="text-sm font-extrabold" style={{ color: "#991b1b" }}>
                  Relance niveau 3
                </p>
                <p className="text-xs mt-1" style={{ color: "#64748b" }}>
                  Mise en demeure de payer.
                </p>
              </button>
            </div>

            <div className="mt-5 space-y-2">
              {quittance.historiqueRelances.length === 0 ? (
                <p className="text-sm text-center py-6" style={{ color: "#94a3b8" }}>
                  Aucune relance envoyée.
                </p>
              ) : (
                quittance.historiqueRelances.map(relance => (
                  <div
                    key={relance.id}
                    className="p-3 rounded-2xl"
                    style={{ backgroundColor: "#f8fafc" }}
                  >
                    <div className="flex justify-between gap-3 flex-wrap">
                      <div>
                        <RelanceBadge niveau={relance.niveau} />
                        <p className="text-xs mt-2" style={{ color: "#94a3b8" }}>
                          Canal : {relance.canal} · {relance.statutEnvoi}
                        </p>
                      </div>

                      <p className="text-xs" style={{ color: "#94a3b8" }}>
                        {relance.date} à {relance.heure}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </SectionCard>
        )}

        {onglet === "historique" && (
          <SectionCard>
            <SectionTitle emoji="🕐" title="Historique complet" />

            <div className="space-y-2">
              {quittance.historique.map(item => (
                <div
                  key={item.id}
                  className="p-3 rounded-2xl"
                  style={{ backgroundColor: "#f8fafc" }}
                >
                  <div className="flex justify-between gap-3 flex-wrap">
                    <p className="text-sm font-extrabold" style={{ color: "#1e293b" }}>
                      {item.action}
                    </p>
                    <p className="text-xs" style={{ color: "#94a3b8" }}>
                      {item.date} à {item.heure}
                    </p>
                  </div>

                  <p className="text-xs mt-1" style={{ color: "#94a3b8" }}>
                    Par {item.utilisateur}
                  </p>
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        {onglet === "reporting" && (
          <SectionCard>
            <SectionTitle emoji="📊" title="Impact reporting et synchronisation" />

            <div className="grid sm:grid-cols-3 gap-3">
              <InfoRow
                label="Revenu réel transmis"
                value={formatEuros(quittance.montantRecu)}
              />
              <InfoRow
                label="Reliquat reportable"
                value={formatEuros(quittance.reliquat)}
              />
              <InfoRow label="Statut locataire" value={statutLocataire} />
            </div>

            <div
              className="mt-4 p-4 rounded-3xl"
              style={{ backgroundColor: "#eff6ff", border: "1px solid #bfdbfe" }}
            >
              <p className="text-sm font-bold" style={{ color: "#1d4ed8" }}>
                Toute action sur cette quittance met à jour le dossier locataire,
                l’espace locataire, l’historique du bien, les indicateurs de suivi
                des loyers et le volet revenus réels du reporting.
              </p>
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

export default function ModuleQuittances() {
  const [view, setView] = useState<ViewState>({ name: "biens" });
  const [quittances, setQuittances] = useState<Quittance[]>(mockQuittances);

  const selectedQuittance = useMemo(() => {
    if (view.name !== "detail") return null;
    return quittances.find(q => q.id === view.quittance.id) || view.quittance;
  }, [view, quittances]);

  const handleGenerateQuittances = (newQuittances: Quittance[]) => {
    setQuittances(prev => [...prev, ...newQuittances]);
    setView({ name: "biens" });

    alert(
      "Quittances générées. Elles ont été ajoutées à l’espace locataire, au dossier locataire et à l’historique du bien."
    );
  };

  const updateQuittance = (updated: Quittance) => {
    setQuittances(prev =>
      prev.map(quittance => (quittance.id === updated.id ? updated : quittance))
    );

    setView({ name: "detail", quittance: updated });
  };

  if (view.name === "generation") {
    return (
      <VueGenerationQuittances
        biens={mockBiens}
        contrats={mockContrats}
        quittances={quittances}
        indexations={mockIndexations}
        onBack={() => setView({ name: "biens" })}
        onGenerate={handleGenerateQuittances}
      />
    );
  }

  if (view.name === "annees") {
    const bien = findBien(mockBiens, view.bienId);

    if (!bien) {
      return (
        <VueBiensQuittances
          biens={mockBiens}
          contrats={mockContrats}
          quittances={quittances}
          onSelectBien={bienId => setView({ name: "annees", bienId })}
          onGenerate={() => setView({ name: "generation" })}
        />
      );
    }

    return (
      <VueAnneesQuittances
        bien={bien}
        quittances={quittances}
        onBack={() => setView({ name: "biens" })}
        onSelectAnnee={annee => setView({ name: "mois", bienId: bien.id, annee })}
      />
    );
  }

  if (view.name === "mois") {
    const bien = findBien(mockBiens, view.bienId);

    if (!bien) {
      return (
        <VueBiensQuittances
          biens={mockBiens}
          contrats={mockContrats}
          quittances={quittances}
          onSelectBien={bienId => setView({ name: "annees", bienId })}
          onGenerate={() => setView({ name: "generation" })}
        />
      );
    }

    return (
      <VueMoisQuittances
        bien={bien}
        annee={view.annee}
        quittances={quittances}
        onBack={() => setView({ name: "annees", bienId: bien.id })}
        onSelectMois={mois =>
          setView({
            name: "quittances_mois",
            bienId: bien.id,
            annee: view.annee,
            mois,
          })
        }
      />
    );
  }

  if (view.name === "quittances_mois") {
    const bien = findBien(mockBiens, view.bienId);

    if (!bien) {
      return (
        <VueBiensQuittances
          biens={mockBiens}
          contrats={mockContrats}
          quittances={quittances}
          onSelectBien={bienId => setView({ name: "annees", bienId })}
          onGenerate={() => setView({ name: "generation" })}
        />
      );
    }

    return (
      <VueQuittancesDuMois
        bien={bien}
        annee={view.annee}
        mois={view.mois}
        quittances={quittances}
        biens={mockBiens}
        onBack={() => setView({ name: "mois", bienId: bien.id, annee: view.annee })}
        onSelectQuittance={quittance => setView({ name: "detail", quittance })}
      />
    );
  }

  if (view.name === "detail" && selectedQuittance) {
    return (
      <VueDetailQuittance
        quittance={selectedQuittance}
        biens={mockBiens}
        quittances={quittances}
        onBack={() =>
          setView({
            name: "quittances_mois",
            bienId: selectedQuittance.bienId,
            annee: selectedQuittance.annee,
            mois: selectedQuittance.mois,
          })
        }
        onUpdate={updateQuittance}
        onOpenLocataire={id => alert(`Navigation vers le module Locataires : ${id}`)}
        onOpenBien={id => alert(`Navigation vers le module Bien : ${id}`)}
      />
    );
  }

  return (
    <VueBiensQuittances
      biens={mockBiens}
      contrats={mockContrats}
      quittances={quittances}
      onSelectBien={bienId => setView({ name: "annees", bienId })}
      onGenerate={() => setView({ name: "generation" })}
    />
  );
}