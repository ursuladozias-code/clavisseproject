"use client";

import { useMemo, useState, type ReactNode } from "react";

// ============================================================
// TYPES
// ============================================================

type TypeBien = "bien_individuel" | "immeuble_rapport";
type StatutBien = "vacant" | "occupe" | "archive";

type StatutPaiementReporting =
  | "en_attente"
  | "paye"
  | "partiellement_paye"
  | "impaye";

type OrigineDepense = "regularisation_charges" | "reporting";
type StatutSync = "synchronise" | "en_attente" | "erreur";
type OngletReporting = "revenus" | "depenses" | "historique";

type ViewState =
  | { name: "liste" }
  | { name: "detail"; bienId: string }
  | { name: "form_depense"; bienId: string }
  | { name: "form_sous_categorie"; bienId: string; categorieId: string };

interface BienReporting {
  id: string;
  reference: string;
  nom: string;
  adresse: string;
  typeBien: TypeBien;
  statut: StatutBien;
  locataireActuel?: string;
}

interface CategorieDepense {
  id: string;
  label: string;
  sousCategories: SousCategorieDepense[];
}

interface SousCategorieDepense {
  id: string;
  label: string;
  description?: string;
  personnalisee?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
}

interface RevenuReporting {
  id: string;
  bienId: string;
  mois: string;
  loyerTheorique: number;
  loyerEncaisse: number;
  ecart: number;
  statut: StatutPaiementReporting;
  quittanceReference: string;
}

interface DepenseReporting {
  id: string;
  bienId: string;
  date: string;
  categorieId: string;
  categorieLabel: string;
  sousCategorieId: string;
  sousCategorieLabel: string;
  montant: number;
  justificatif?: string;
  commentaire?: string;
  origine: OrigineDepense;
  syncStatus: StatutSync;
  syncError?: string;
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

interface HistoriqueReporting {
  id: string;
  bienId: string;
  date: string;
  heure: string;
  utilisateur: string;
  action: string;
  ancienneValeur?: string;
  nouvelleValeur?: string;
}

interface SyntheseReporting {
  bienId: string;
  revenuTheoriqueTotal: number;
  revenuReelTotal: number;
  depensesTotal: number;
  ecartTotal: number;
  cashFlow: number;
}

// ============================================================
// BIBLIOTHÈQUE COMMUNE DES DÉPENSES
// Même nomenclature que Régularisation des charges
// ============================================================

const categoriesInitiales: CategorieDepense[] = [
  {
    id: "eau",
    label: "I – Eau",
    sousCategories: [
      { id: "eau_froide_collective", label: "Eau froide collective" },
      { id: "eau_chaude_collective", label: "Eau chaude collective" },
      { id: "compteurs_eau", label: "Compteurs individuels d’eau" },
      { id: "recherche_fuite", label: "Recherche de fuite" },
      { id: "refection_canalisation", label: "Réfection de canalisation" },
      { id: "remplacement_reseau_eau", label: "Remplacement du réseau d’eau" },
    ],
  },
  {
    id: "chauffage",
    label: "II – Chauffage",
    sousCategories: [
      { id: "consommation_gaz", label: "Consommation de gaz" },
      { id: "consommation_fioul", label: "Consommation de fioul" },
      {
        id: "consommation_electrique_chauffage",
        label: "Consommation électrique du chauffage",
      },
      {
        id: "contrat_entretien_chaudiere",
        label: "Contrat d’entretien de chaudière",
      },
      { id: "ramonage_collectif", label: "Ramonage collectif" },
      { id: "reparation_lourde_chaudiere", label: "Réparation lourde de chaudière" },
      { id: "remplacement_chaudiere", label: "Remplacement de chaudière" },
    ],
  },
  {
    id: "ascenseur",
    label: "III – Ascenseur",
    sousCategories: [
      { id: "contrat_entretien_ascenseur", label: "Contrat d’entretien" },
      { id: "electricite_ascenseur", label: "Électricité de l’ascenseur" },
      { id: "controles_reglementaires", label: "Contrôles réglementaires" },
      { id: "depannage_courant", label: "Dépannage courant" },
      { id: "modernisation_ascenseur", label: "Modernisation de l’ascenseur" },
      { id: "remplacement_cabine", label: "Remplacement de la cabine" },
      { id: "remplacement_moteur", label: "Remplacement du moteur" },
    ],
  },
  {
    id: "parties_communes",
    label: "IV – Parties communes",
    sousCategories: [
      { id: "nettoyage_parties_communes", label: "Nettoyage des parties communes" },
      { id: "produits_entretien", label: "Produits d’entretien" },
      { id: "sortie_poubelles", label: "Sortie des poubelles" },
      {
        id: "electricite_parties_communes",
        label: "Électricité des parties communes",
      },
      { id: "remplacement_ampoules", label: "Remplacement d’ampoules" },
      { id: "petites_reparations", label: "Petites réparations" },
      { id: "refection_hall", label: "Réfection du hall d’entrée" },
      { id: "refection_cage_escalier", label: "Réfection de la cage d’escalier" },
    ],
  },
  {
    id: "espaces_verts",
    label: "V – Espaces verts",
    sousCategories: [
      { id: "tonte_pelouses", label: "Tonte des pelouses" },
      { id: "taille_haies", label: "Taille des haies et arbustes" },
      { id: "arrosage", label: "Arrosage" },
      {
        id: "entretien_arrosage_auto",
        label: "Entretien du système d’arrosage automatique",
      },
      { id: "reamenagement_paysager", label: "Réaménagement paysager" },
      { id: "plantation_exceptionnelle", label: "Plantation exceptionnelle" },
    ],
  },
  {
    id: "gardiennage",
    label: "VI – Gardiennage et entretien",
    sousCategories: [
      {
        id: "gardien_entretien_dechets",
        label: "Gardien avec entretien des parties communes et gestion des déchets",
      },
      {
        id: "gardien_sans_entretien",
        label: "Gardien sans entretien des parties communes",
      },
      { id: "societe_nettoyage", label: "Société de nettoyage" },
      { id: "societe_securite", label: "Société de sécurité" },
    ],
  },
  {
    id: "equipements_communs",
    label: "VII – Équipements communs",
    sousCategories: [
      { id: "entretien_interphone", label: "Entretien de l’interphone" },
      { id: "entretien_digicode", label: "Entretien du digicode" },
      { id: "entretien_vmc", label: "Entretien de la VMC" },
      { id: "entretien_portail_auto", label: "Entretien du portail automatique" },
      {
        id: "remplacement_equipement_commun",
        label: "Remplacement d’un équipement commun",
      },
    ],
  },
  {
    id: "fiscalite",
    label: "VIII – Fiscalité et redevances",
    sousCategories: [
      {
        id: "teom",
        label: "Taxe d’enlèvement des ordures ménagères (TEOM)",
      },
      { id: "redevance_assainissement", label: "Redevance d’assainissement" },
      { id: "taxe_fonciere", label: "Taxe foncière" },
      { id: "taxe_logements_vacants", label: "Taxe sur les logements vacants" },
    ],
  },
  {
    id: "copropriete",
    label: "IX – Copropriété",
    sousCategories: [
      {
        id: "charges_copro_recuperables",
        label: "Charges de copropriété récupérables",
      },
      {
        id: "charges_copro_non_recuperables",
        label: "Charges de copropriété non récupérables",
      },
      { id: "fonds_travaux_alur", label: "Fonds travaux ALUR" },
      { id: "appels_fonds_travaux", label: "Appels de fonds pour travaux" },
    ],
  },
  {
    id: "assurances",
    label: "X – Assurances",
    sousCategories: [
      { id: "assurance_immeuble", label: "Assurance immeuble" },
      { id: "assurance_pno", label: "Assurance propriétaire non occupant (PNO)" },
      { id: "assurance_gli", label: "Assurance loyers impayés (GLI)" },
    ],
  },
  {
    id: "gestion_admin",
    label: "XI – Gestion locative et administrative",
    sousCategories: [
      {
        id: "honoraires_agence_gestion",
        label: "Honoraires d’agence de gestion locative",
      },
      { id: "honoraires_syndic", label: "Honoraires de syndic" },
      { id: "frais_comptabilite", label: "Frais de comptabilité" },
      { id: "frais_bancaires", label: "Frais bancaires" },
      { id: "frais_juridiques", label: "Frais juridiques" },
    ],
  },
  {
    id: "travaux_gros_entretien",
    label: "XII – Travaux et gros entretien",
    sousCategories: [
      { id: "ravalement_facade", label: "Ravalement de façade" },
      { id: "refection_toiture", label: "Réfection de toiture" },
      { id: "refection_balcons", label: "Réfection des balcons" },
      { id: "mise_normes_electriques", label: "Mise aux normes électriques" },
      { id: "isolation_thermique", label: "Isolation thermique" },
      { id: "remplacement_fenetres", label: "Remplacement des fenêtres" },
      { id: "travaux_structure", label: "Travaux de structure" },
      {
        id: "refection_reseaux_collectifs",
        label: "Réfection des réseaux collectifs",
      },
    ],
  },
  {
    id: "logement_privatif",
    label: "XIII – Logement — parties privatives",
    sousCategories: [
      {
        id: "entretien_chaudiere_individuelle",
        label: "Entretien annuel de chaudière individuelle",
      },
      { id: "ramonage_individuel", label: "Ramonage individuel" },
      { id: "debouchage_canalisations", label: "Débouchage des canalisations" },
      {
        id: "remplacement_joints_flexibles",
        label: "Remplacement de joints et flexibles",
      },
      {
        id: "remplacement_robinet_vetuste",
        label: "Remplacement d’un robinet vétuste",
      },
      {
        id: "remplacement_ballon_eau",
        label: "Remplacement d’un ballon d’eau chaude",
      },
      { id: "refection_peintures", label: "Réfection complète des peintures" },
      {
        id: "degat_cause_locataire",
        label: "Réparation d’un dégât causé par le locataire",
      },
    ],
  },
  {
    id: "divers",
    label: "XIV – Divers",
    sousCategories: [
      { id: "desinsectisation", label: "Désinsectisation" },
      { id: "deratisation", label: "Dératisation" },
      { id: "entretien_pompes_relevage", label: "Entretien des pompes de relevage" },
      { id: "entretien_antennes", label: "Entretien des antennes collectives" },
      {
        id: "entretien_controle_acces",
        label: "Entretien des systèmes de contrôle d’accès",
      },
      {
        id: "entretien_extincteurs",
        label: "Entretien des extincteurs et équipements de sécurité",
      },
      {
        id: "verifications_reglementaires",
        label: "Vérifications réglementaires des équipements collectifs",
      },
      { id: "reparations_vetuste", label: "Réparations liées à la vétusté" },
      {
        id: "reparations_vice_construction",
        label: "Réparations liées à un vice de construction",
      },
      {
        id: "travaux_amelioration_batiment",
        label: "Travaux d’amélioration du bâtiment",
      },
      {
        id: "travaux_valorisation_patrimoine",
        label: "Travaux de valorisation du patrimoine immobilier",
      },
    ],
  },
];

// ============================================================
// MOCK DATA — SIMULATION RETOURS API
// ============================================================

const biensMock: BienReporting[] = [
  {
    id: "bi001",
    reference: "BI-000001",
    nom: "Appartement T2 Centre-ville",
    adresse: "12 Rue Victor Hugo, 69001 Lyon",
    typeBien: "bien_individuel",
    statut: "occupe",
    locataireActuel: "Claire Martin",
  },
  {
    id: "bi002",
    reference: "BI-000002",
    nom: "Studio République",
    adresse: "8 Avenue Jean Jaurès, 69007 Lyon",
    typeBien: "bien_individuel",
    statut: "occupe",
    locataireActuel: "Yanis Bernard",
  },
  {
    id: "im001",
    reference: "IMR-000001",
    nom: "Immeuble Rue de Paris",
    adresse: "14 Rue de Paris, 59000 Lille",
    typeBien: "immeuble_rapport",
    statut: "occupe",
  },
];

const revenusMock: RevenuReporting[] = [
  {
    id: "rev001",
    bienId: "bi001",
    mois: "Janvier 2026",
    loyerTheorique: 955,
    loyerEncaisse: 955,
    ecart: 0,
    statut: "paye",
    quittanceReference: "QUI-2026-000001",
  },
  {
    id: "rev002",
    bienId: "bi001",
    mois: "Février 2026",
    loyerTheorique: 955,
    loyerEncaisse: 500,
    ecart: 455,
    statut: "partiellement_paye",
    quittanceReference: "QUI-2026-000002",
  },
  {
    id: "rev003",
    bienId: "bi001",
    mois: "Mars 2026",
    loyerTheorique: 955,
    loyerEncaisse: 0,
    ecart: 955,
    statut: "impaye",
    quittanceReference: "QUI-2026-000003",
  },
  {
    id: "rev004",
    bienId: "bi002",
    mois: "Mars 2026",
    loyerTheorique: 760,
    loyerEncaisse: 760,
    ecart: 0,
    statut: "paye",
    quittanceReference: "QUI-2026-000004",
  },
];

const depensesMock: DepenseReporting[] = [
  {
    id: "dep001",
    bienId: "bi001",
    date: "2026-01-12",
    categorieId: "fiscalite",
    categorieLabel: "VIII – Fiscalité et redevances",
    sousCategorieId: "teom",
    sousCategorieLabel: "Taxe d’enlèvement des ordures ménagères (TEOM)",
    montant: 180,
    justificatif: "avis_taxe_fonciere.pdf",
    commentaire: "Dépense importée depuis Régularisation des charges.",
    origine: "regularisation_charges",
    syncStatus: "synchronise",
    canView: true,
    canEdit: false,
    canDelete: false,
  },
  {
    id: "dep002",
    bienId: "bi001",
    date: "2026-02-10",
    categorieId: "assurances",
    categorieLabel: "X – Assurances",
    sousCategorieId: "assurance_pno",
    sousCategorieLabel: "Assurance propriétaire non occupant (PNO)",
    montant: 140,
    justificatif: "assurance_pno.pdf",
    origine: "reporting",
    syncStatus: "synchronise",
    canView: true,
    canEdit: true,
    canDelete: true,
  },
  {
    id: "dep003",
    bienId: "im001",
    date: "2026-02-03",
    categorieId: "parties_communes",
    categorieLabel: "IV – Parties communes",
    sousCategorieId: "nettoyage_parties_communes",
    sousCategorieLabel: "Nettoyage des parties communes",
    montant: 1200,
    justificatif: "facture_nettoyage.pdf",
    origine: "regularisation_charges",
    syncStatus: "synchronise",
    canView: true,
    canEdit: false,
    canDelete: false,
  },
];

const historiqueMock: HistoriqueReporting[] = [
  {
    id: "hist001",
    bienId: "bi001",
    date: "2026-01-01",
    heure: "09:00",
    utilisateur: "Système",
    action: "Quittance générée",
    nouvelleValeur: "Revenu théorique créé : QUI-2026-000001",
  },
  {
    id: "hist002",
    bienId: "bi001",
    date: "2026-01-03",
    heure: "10:30",
    utilisateur: "Utilisateur connecté",
    action: "Paiement déclaré",
    nouvelleValeur: "Revenu réel encaissé : 955 €",
  },
  {
    id: "hist003",
    bienId: "bi001",
    date: "2026-02-10",
    heure: "14:15",
    utilisateur: "Utilisateur connecté",
    action: "Dépense créée dans Reporting",
    nouvelleValeur: "Assurance propriétaire non occupant — 140 €",
  },
];

const synthesesMock: SyntheseReporting[] = [
  {
    bienId: "bi001",
    revenuTheoriqueTotal: 2865,
    revenuReelTotal: 1455,
    depensesTotal: 320,
    ecartTotal: 1410,
    cashFlow: 1135,
  },
  {
    bienId: "bi002",
    revenuTheoriqueTotal: 760,
    revenuReelTotal: 760,
    depensesTotal: 0,
    ecartTotal: 0,
    cashFlow: 760,
  },
  {
    bienId: "im001",
    revenuTheoriqueTotal: 0,
    revenuReelTotal: 0,
    depensesTotal: 1200,
    ecartTotal: 0,
    cashFlow: -1200,
  },
];

// ============================================================
// HELPERS UI — PAS DE CALCUL MÉTIER
// ============================================================

function formatEuros(value: number) {
  return `${Math.round(value).toLocaleString("fr-FR")} €`;
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

function findBien(biens: BienReporting[], bienId: string) {
  return biens.find(bien => bien.id === bienId);
}

function findCategorie(categories: CategorieDepense[], categorieId: string) {
  return categories.find(categorie => categorie.id === categorieId);
}

function getTypeBienLabel(type: TypeBien) {
  return type === "immeuble_rapport" ? "Immeuble de rapport" : "Bien individuel";
}

function getStatutPaiementLabel(statut: StatutPaiementReporting) {
  const labels: Record<StatutPaiementReporting, string> = {
    en_attente: "En attente",
    paye: "Payé",
    partiellement_paye: "Partiellement payé",
    impaye: "Impayé",
  };

  return labels[statut];
}

function getStatutPaiementTone(
  statut: StatutPaiementReporting
): "green" | "orange" | "red" | "gray" {
  if (statut === "paye") return "green";
  if (statut === "partiellement_paye") return "orange";
  if (statut === "impaye") return "red";
  return "gray";
}

function getSyncTone(sync: StatutSync): "green" | "orange" | "red" {
  if (sync === "synchronise") return "green";
  if (sync === "erreur") return "red";
  return "orange";
}

function getOrigineDepenseLabel(origine: OrigineDepense) {
  return origine === "regularisation_charges"
    ? "Régularisation des charges"
    : "Reporting";
}

// ============================================================
// UI
// ============================================================

function PageShell({ children }: { children: ReactNode }) {
  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: "#f8fafc",
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      {children}
    </div>
  );
}

function PageHeader({
  title,
  subtitle,
  onBack,
  actions,
}: {
  title: string;
  subtitle: string;
  onBack?: () => void;
  actions?: ReactNode;
}) {
  return (
    <div
      className="px-4 sm:px-6 py-6"
      style={{ background: "linear-gradient(135deg,#fff7ed,#fff)" }}
    >
      <div className="max-w-6xl mx-auto">
        {onBack && (
          <button
            onClick={onBack}
            className="text-xs font-extrabold mb-3 hover:underline"
            style={{ color: "#f97316" }}
          >
            ← Retour
          </button>
        )}

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1
              className="text-3xl sm:text-4xl font-black tracking-tight"
              style={{ color: "#1e293b" }}
            >
              {title}
            </h1>
            <p
              className="text-sm sm:text-base mt-2 font-semibold"
              style={{ color: "#94a3b8" }}
            >
              {subtitle}
            </p>
          </div>

          {actions && <div className="flex gap-3 flex-wrap">{actions}</div>}
        </div>
      </div>
    </div>
  );
}

function ActionButton({
  children,
  onClick,
  variant = "orange",
  disabled = false,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "orange" | "blue" | "purple" | "green" | "gray" | "red";
  disabled?: boolean;
}) {
  const styles = {
    orange: { bg: "#fff7ed", color: "#f97316" },
    blue: { bg: "#eff6ff", color: "#2563eb" },
    purple: { bg: "#f3e8ff", color: "#8b5cf6" },
    green: { bg: "#dcfce7", color: "#16a34a" },
    gray: { bg: "#f1f5f9", color: "#64748b" },
    red: { bg: "#fee2e2", color: "#dc2626" },
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="px-5 py-3 rounded-3xl text-sm sm:text-base font-black disabled:opacity-50 transition hover:scale-[1.01]"
      style={{
        backgroundColor: styles[variant].bg,
        color: styles[variant].color,
      }}
    >
      {children}
    </button>
  );
}

function StatCard({
  emoji,
  value,
  label,
  gradient,
}: {
  emoji: string;
  value: string | number;
  label: string;
  gradient: string;
}) {
  return (
    <div
      className="rounded-[2rem] p-6 text-white min-h-[118px]"
      style={{ background: gradient }}
    >
      <div className="text-3xl mb-4">{emoji}</div>
      <p className="text-2xl sm:text-3xl font-black leading-none">{value}</p>
      <p className="text-sm font-black mt-2 opacity-95">{label}</p>
    </div>
  );
}

function SectionCard({ children }: { children: ReactNode }) {
  return <div className="bg-white rounded-[2rem] p-5 sm:p-6 shadow-sm">{children}</div>;
}

function SectionTitle({ emoji, title }: { emoji: string; title: string }) {
  return (
    <p
      className="text-xs font-black uppercase tracking-wide mb-4"
      style={{ color: "#94a3b8" }}
    >
      {emoji} {title}
    </p>
  );
}

function InfoRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="p-4 rounded-3xl" style={{ backgroundColor: "#f8fafc" }}>
      <p className="text-xs font-black mb-1" style={{ color: "#94a3b8" }}>
        {label}
      </p>
      <p className="text-sm font-black" style={{ color: "#1e293b" }}>
        {value || "—"}
      </p>
    </div>
  );
}

function StatusBadge({
  children,
  tone = "gray",
}: {
  children: ReactNode;
  tone?: "green" | "orange" | "red" | "blue" | "purple" | "gray";
}) {
  const styles = {
    green: { bg: "#dcfce7", color: "#166534" },
    orange: { bg: "#ffedd5", color: "#9a3412" },
    red: { bg: "#fee2e2", color: "#991b1b" },
    blue: { bg: "#dbeafe", color: "#1d4ed8" },
    purple: { bg: "#ede9fe", color: "#6d28d9" },
    gray: { bg: "#f1f5f9", color: "#64748b" },
  };

  return (
    <span
      className="px-3 py-1 rounded-full text-xs font-black"
      style={{ backgroundColor: styles[tone].bg, color: styles[tone].color }}
    >
      {children}
    </span>
  );
}

// ============================================================
// LISTE DES BIENS
// ============================================================

function VueListeBiensReporting({
  biens,
  syntheses,
  onOpen,
}: {
  biens: BienReporting[];
  syntheses: SyntheseReporting[];
  onOpen: (bienId: string) => void;
}) {
  const [recherche, setRecherche] = useState("");

  const biensAffiches = biens.filter(bien => {
    const q = recherche.toLowerCase();

    return (
      bien.nom.toLowerCase().includes(q) ||
      bien.reference.toLowerCase().includes(q) ||
      bien.adresse.toLowerCase().includes(q)
    );
  });

  const biensIndividuels = biens.filter(b => b.typeBien === "bien_individuel");
  const immeubles = biens.filter(b => b.typeBien === "immeuble_rapport");

  return (
    <PageShell>
      <PageHeader
        title="📊 Reporting"
        subtitle="Revenus théoriques, revenus encaissés, dépenses, historique financier et exports."
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <StatCard
            emoji="🏠"
            value={biensIndividuels.length}
            label="Biens individuels"
            gradient="linear-gradient(135deg,#f97316,#fb923c)"
          />

          <StatCard
            emoji="🏢"
            value={immeubles.length}
            label="Immeubles de rapport"
            gradient="linear-gradient(135deg,#22c55e,#4ade80)"
          />

          <StatCard
            emoji="💶"
            value="API"
            label="Revenus consolidés"
            gradient="linear-gradient(135deg,#8b5cf6,#a78bfa)"
          />

          <StatCard
            emoji="📤"
            value="PDF / Excel"
            label="Exports"
            gradient="linear-gradient(135deg,#3b82f6,#60a5fa)"
          />
        </div>

        <input
          value={recherche}
          onChange={event => setRecherche(event.target.value)}
          placeholder="Rechercher un bien ou un immeuble..."
          className="w-full px-5 py-4 rounded-[1.5rem] text-sm sm:text-base border outline-none mb-8 bg-white"
          style={{
            borderColor: "#e2e8f0",
            color: "#1e293b",
          }}
        />

        <div className="space-y-4">
          {biensAffiches.map(bien => {
            const synthese = syntheses.find(item => item.bienId === bien.id);

            return (
              <button
                key={bien.id}
                onClick={() => onOpen(bien.id)}
                className="w-full bg-white rounded-[2rem] p-5 shadow-sm hover:shadow-md transition text-left"
              >
                <div className="flex items-center justify-between gap-5 flex-wrap">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-14 h-14 rounded-3xl flex items-center justify-center text-2xl"
                      style={{
                        background:
                          bien.typeBien === "immeuble_rapport"
                            ? "linear-gradient(135deg,#8b5cf6,#a78bfa)"
                            : "linear-gradient(135deg,#f97316,#fb923c)",
                      }}
                    >
                      {bien.typeBien === "immeuble_rapport" ? "🏢" : "🏠"}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-base font-black" style={{ color: "#1e293b" }}>
                          {bien.nom}
                        </p>

                        <StatusBadge
                          tone={bien.typeBien === "immeuble_rapport" ? "purple" : "blue"}
                        >
                          {getTypeBienLabel(bien.typeBien)}
                        </StatusBadge>
                      </div>

                      <p className="text-xs sm:text-sm mt-1" style={{ color: "#94a3b8" }}>
                        {bien.reference} · {bien.adresse}
                      </p>

                      <p className="text-xs mt-1" style={{ color: "#cbd5e1" }}>
                        {bien.locataireActuel || "Détail consolidé par API"} ·{" "}
                        {bien.statut}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-black" style={{ color: "#f97316" }}>
                      {formatEuros(synthese?.cashFlow || 0)}
                    </p>
                    <p className="text-xs mt-1" style={{ color: "#94a3b8" }}>
                      Cash-flow API
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </main>
    </PageShell>
  );
}

// ============================================================
// FORMULAIRE DÉPENSE
// ============================================================

function FormDepenseReporting({
  bien,
  categories,
  onBack,
  onSave,
  onAddCustomSubcategory,
}: {
  bien: BienReporting;
  categories: CategorieDepense[];
  onBack: () => void;
  onSave: (payload: {
    bienId: string;
    categorieId: string;
    sousCategorieId: string;
    montant: number;
    date: string;
    commentaire?: string;
    justificatif?: string;
  }) => void;
  onAddCustomSubcategory: (categorieId: string) => void;
}) {
  const [categorieId, setCategorieId] = useState(categories[0]?.id || "");
  const categorie = findCategorie(categories, categorieId);

  const [sousCategorieId, setSousCategorieId] = useState(
    categorie?.sousCategories[0]?.id || ""
  );

  const [montant, setMontant] = useState("");
  const [date, setDate] = useState(getToday());
  const [commentaire, setCommentaire] = useState("");
  const [justificatif, setJustificatif] = useState("");

  const handleCategorieChange = (nextCategorieId: string) => {
    const nextCategorie = findCategorie(categories, nextCategorieId);
    setCategorieId(nextCategorieId);
    setSousCategorieId(nextCategorie?.sousCategories[0]?.id || "");
  };

  const handleSubmit = () => {
    if (!categorieId || !sousCategorieId || sousCategorieId === "__add_custom__") {
      alert("Veuillez sélectionner une catégorie et une sous-catégorie.");
      return;
    }

    if (!montant || Number(montant) <= 0) {
      alert("Veuillez renseigner un montant valide.");
      return;
    }

    if (!date) {
      alert("Veuillez renseigner une date.");
      return;
    }

    if (justificatif) {
      const extension = justificatif.split(".").pop()?.toLowerCase();
      const allowed = ["pdf", "jpg", "jpeg", "png"];

      if (!extension || !allowed.includes(extension)) {
        alert("Format de justificatif non autorisé. Formats acceptés : PDF, JPG, PNG.");
        return;
      }
    }

    onSave({
      bienId: bien.id,
      categorieId,
      sousCategorieId,
      montant: Number(montant),
      date,
      commentaire,
      justificatif,
    });
  };

  return (
    <PageShell>
      <PageHeader
        title="➕ Ajouter une dépense"
        subtitle={`${bien.nom} · ${bien.reference}`}
        onBack={onBack}
      />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <SectionCard>
          <SectionTitle emoji="💶" title="Informations de la dépense" />

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black mb-2" style={{ color: "#64748b" }}>
                Catégorie *
              </label>
              <select
                value={categorieId}
                onChange={event => handleCategorieChange(event.target.value)}
                className="w-full px-4 py-3 rounded-3xl border outline-none text-sm bg-white"
                style={{ borderColor: "#e2e8f0", color: "#1e293b" }}
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-black mb-2" style={{ color: "#64748b" }}>
                Sous-catégorie *
              </label>
              <select
                value={sousCategorieId}
                onChange={event => {
                  if (event.target.value === "__add_custom__") {
                    onAddCustomSubcategory(categorieId);
                    return;
                  }

                  setSousCategorieId(event.target.value);
                }}
                className="w-full px-4 py-3 rounded-3xl border outline-none text-sm bg-white"
                style={{ borderColor: "#e2e8f0", color: "#1e293b" }}
              >
                {(categorie?.sousCategories || []).map(sousCategorie => (
                  <option key={sousCategorie.id} value={sousCategorie.id}>
                    {sousCategorie.label}
                  </option>
                ))}
                <option value="__add_custom__">+ Ajouter une sous-catégorie</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-black mb-2" style={{ color: "#64748b" }}>
                Montant *
              </label>
              <input
                type="number"
                value={montant}
                onChange={event => setMontant(event.target.value)}
                placeholder="0"
                className="w-full px-4 py-3 rounded-3xl border outline-none text-sm"
                style={{ borderColor: "#e2e8f0" }}
              />
            </div>

            <div>
              <label className="block text-xs font-black mb-2" style={{ color: "#64748b" }}>
                Date *
              </label>
              <input
                type="date"
                value={date}
                onChange={event => setDate(event.target.value)}
                className="w-full px-4 py-3 rounded-3xl border outline-none text-sm"
                style={{ borderColor: "#e2e8f0" }}
              />
            </div>

            <div>
              <label className="block text-xs font-black mb-2" style={{ color: "#64748b" }}>
                Justificatif
              </label>
              <input
                value={justificatif}
                onChange={event => setJustificatif(event.target.value)}
                placeholder="facture.pdf"
                className="w-full px-4 py-3 rounded-3xl border outline-none text-sm"
                style={{ borderColor: "#e2e8f0" }}
              />
              <p className="text-xs mt-1" style={{ color: "#94a3b8" }}>
                Formats acceptés : PDF, JPG, PNG.
              </p>
            </div>

            <div>
              <label className="block text-xs font-black mb-2" style={{ color: "#64748b" }}>
                Commentaire
              </label>
              <input
                value={commentaire}
                onChange={event => setCommentaire(event.target.value)}
                placeholder="Commentaire facultatif"
                className="w-full px-4 py-3 rounded-3xl border outline-none text-sm"
                style={{ borderColor: "#e2e8f0" }}
              />
            </div>
          </div>

          <div
            className="mt-5 p-4 rounded-3xl"
            style={{ backgroundColor: "#eff6ff", border: "1px solid #bfdbfe" }}
          >
            <p className="text-sm font-bold" style={{ color: "#1d4ed8" }}>
              Le Front-End transmet la dépense à l’API. Les traitements comptables,
              financiers, fiscaux, la synchronisation avec Régularisation des charges
              et les indicateurs sont gérés par le Back-End.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 mt-6">
            <ActionButton onClick={onBack} variant="gray">
              Annuler
            </ActionButton>
            <ActionButton onClick={handleSubmit} variant="orange">
              Enregistrer
            </ActionButton>
          </div>
        </SectionCard>
      </main>
    </PageShell>
  );
}

// ============================================================
// FORMULAIRE SOUS-CATÉGORIE
// ============================================================

function FormSousCategorieReporting({
  categorie,
  onBack,
  onSave,
}: {
  categorie: CategorieDepense;
  onBack: () => void;
  onSave: (payload: { categorieId: string; label: string; description?: string }) => void;
}) {
  const [label, setLabel] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = () => {
    if (!label.trim()) {
      alert("Veuillez renseigner le nom de la sous-catégorie.");
      return;
    }

    onSave({
      categorieId: categorie.id,
      label,
      description,
    });
  };

  return (
    <PageShell>
      <PageHeader
        title="➕ Sous-catégorie personnalisée"
        subtitle={categorie.label}
        onBack={onBack}
      />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <SectionCard>
          <SectionTitle emoji="🧩" title="Nouvelle sous-catégorie" />

          <div className="space-y-4">
            <InfoRow label="Catégorie de rattachement" value={categorie.label} />

            <div>
              <label className="block text-xs font-black mb-2" style={{ color: "#64748b" }}>
                Nom de la sous-catégorie *
              </label>
              <input
                value={label}
                onChange={event => setLabel(event.target.value)}
                placeholder="Ex : Dépense spécifique..."
                className="w-full px-4 py-3 rounded-3xl border outline-none text-sm"
                style={{ borderColor: "#e2e8f0" }}
              />
            </div>

            <div>
              <label className="block text-xs font-black mb-2" style={{ color: "#64748b" }}>
                Description
              </label>
              <textarea
                value={description}
                onChange={event => setDescription(event.target.value)}
                rows={4}
                placeholder="Description facultative"
                className="w-full px-4 py-3 rounded-3xl border outline-none text-sm resize-none"
                style={{ borderColor: "#e2e8f0" }}
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 mt-6">
            <ActionButton onClick={onBack} variant="gray">
              Annuler
            </ActionButton>
            <ActionButton onClick={handleSubmit} variant="orange">
              Enregistrer
            </ActionButton>
          </div>
        </SectionCard>
      </main>
    </PageShell>
  );
}

// ============================================================
// FICHE REPORTING
// ============================================================

function VueDetailReporting({
  bien,
  revenus,
  depenses,
  historique,
  synthese,
  activeTab,
  setActiveTab,
  onBack,
  onAddDepense,
  onExportPDF,
  onExportExcel,
}: {
  bien: BienReporting;
  revenus: RevenuReporting[];
  depenses: DepenseReporting[];
  historique: HistoriqueReporting[];
  synthese?: SyntheseReporting;
  activeTab: OngletReporting;
  setActiveTab: (tab: OngletReporting) => void;
  onBack: () => void;
  onAddDepense: () => void;
  onExportPDF: () => void;
  onExportExcel: () => void;
}) {
  const tabs: { id: OngletReporting; label: string; emoji: string }[] = [
    { id: "revenus", label: "Revenus", emoji: "💶" },
    { id: "depenses", label: "Dépenses", emoji: "📉" },
    { id: "historique", label: "Historique", emoji: "🕐" },
  ];

  return (
    <PageShell>
      <PageHeader
        title={`📊 ${bien.nom}`}
        subtitle={`${bien.reference} · ${bien.adresse}`}
        onBack={onBack}
        actions={
          <>
            <ActionButton onClick={onAddDepense} variant="orange">
              + Ajouter une dépense
            </ActionButton>
            <ActionButton onClick={onExportPDF} variant="blue">
              Export PDF
            </ActionButton>
            <ActionButton onClick={onExportExcel} variant="green">
              Export Excel
            </ActionButton>
          </>
        }
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <StatCard
            emoji="📄"
            value={formatEuros(synthese?.revenuTheoriqueTotal || 0)}
            label="Revenus théoriques"
            gradient="linear-gradient(135deg,#f97316,#fb923c)"
          />
          <StatCard
            emoji="💶"
            value={formatEuros(synthese?.revenuReelTotal || 0)}
            label="Revenus encaissés"
            gradient="linear-gradient(135deg,#22c55e,#4ade80)"
          />
          <StatCard
            emoji="📉"
            value={formatEuros(synthese?.depensesTotal || 0)}
            label="Dépenses"
            gradient="linear-gradient(135deg,#8b5cf6,#a78bfa)"
          />
          <StatCard
            emoji="📊"
            value={formatEuros(synthese?.cashFlow || 0)}
            label="Cash-flow API"
            gradient="linear-gradient(135deg,#3b82f6,#60a5fa)"
          />
        </div>

        <SectionCard>
          <SectionTitle emoji="📌" title="Informations générales" />

          <div className="grid sm:grid-cols-5 gap-3">
            <InfoRow label="Nom" value={bien.nom} />
            <InfoRow label="Adresse" value={bien.adresse} />
            <InfoRow label="Type" value={getTypeBienLabel(bien.typeBien)} />
            <InfoRow label="Statut" value={bien.statut} />
            <InfoRow label="Locataire" value={bien.locataireActuel || "—"} />
          </div>
        </SectionCard>

        <div className="flex gap-2 overflow-x-auto py-5">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2 px-5 py-3 rounded-3xl text-sm font-black whitespace-nowrap"
              style={{
                backgroundColor: activeTab === tab.id ? "#f97316" : "#fff",
                color: activeTab === tab.id ? "#fff" : "#64748b",
                boxShadow:
                  activeTab === tab.id ? "0 10px 25px rgba(249,115,22,0.22)" : "none",
              }}
            >
              {tab.emoji} {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "revenus" && (
          <SectionCard>
            <SectionTitle emoji="💶" title="Revenus retournés par l’API" />

            {revenus.length === 0 ? (
              <p className="text-sm text-center py-8" style={{ color: "#94a3b8" }}>
                Aucun revenu retourné par l’API pour ce bien.
              </p>
            ) : (
              <div className="space-y-3">
                {revenus.map(revenu => (
                  <div
                    key={revenu.id}
                    className="p-4 rounded-3xl"
                    style={{ backgroundColor: "#f8fafc" }}
                  >
                    <div className="flex justify-between gap-4 flex-wrap">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-black" style={{ color: "#1e293b" }}>
                            {revenu.mois}
                          </p>

                          <StatusBadge tone={getStatutPaiementTone(revenu.statut)}>
                            {getStatutPaiementLabel(revenu.statut)}
                          </StatusBadge>
                        </div>

                        <p className="text-xs mt-1" style={{ color: "#94a3b8" }}>
                          {revenu.quittanceReference}
                        </p>
                      </div>

                      <div className="grid grid-cols-3 gap-3 text-right">
                        <div>
                          <p className="text-sm font-black" style={{ color: "#1e293b" }}>
                            {formatEuros(revenu.loyerTheorique)}
                          </p>
                          <p className="text-xs" style={{ color: "#94a3b8" }}>
                            Théorique
                          </p>
                        </div>

                        <div>
                          <p className="text-sm font-black" style={{ color: "#16a34a" }}>
                            {formatEuros(revenu.loyerEncaisse)}
                          </p>
                          <p className="text-xs" style={{ color: "#94a3b8" }}>
                            Encaissé
                          </p>
                        </div>

                        <div>
                          <p className="text-sm font-black" style={{ color: "#dc2626" }}>
                            {formatEuros(revenu.ecart)}
                          </p>
                          <p className="text-xs" style={{ color: "#94a3b8" }}>
                            Écart API
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        )}

        {activeTab === "depenses" && (
          <SectionCard>
            <SectionTitle emoji="📉" title="Dépenses retournées par l’API" />

            {depenses.length === 0 ? (
              <p className="text-sm text-center py-8" style={{ color: "#94a3b8" }}>
                Aucune dépense retournée par l’API pour ce bien.
              </p>
            ) : (
              <div className="space-y-3">
                {depenses.map(depense => (
                  <div
                    key={depense.id}
                    className="p-4 rounded-3xl"
                    style={{ backgroundColor: "#f8fafc" }}
                  >
                    <div className="flex justify-between gap-4 flex-wrap">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-black" style={{ color: "#1e293b" }}>
                            {depense.sousCategorieLabel}
                          </p>

                          <StatusBadge tone="blue">
                            {getOrigineDepenseLabel(depense.origine)}
                          </StatusBadge>

                          <StatusBadge tone={getSyncTone(depense.syncStatus)}>
                            {depense.syncStatus}
                          </StatusBadge>
                        </div>

                        <p className="text-xs mt-1" style={{ color: "#94a3b8" }}>
                          {depense.date} · {depense.categorieLabel}
                        </p>

                        {depense.justificatif && (
                          <p className="text-xs mt-1" style={{ color: "#cbd5e1" }}>
                            Justificatif : {depense.justificatif}
                          </p>
                        )}

                        {depense.syncError && (
                          <p className="text-xs mt-1 font-bold" style={{ color: "#dc2626" }}>
                            Erreur : {depense.syncError}
                          </p>
                        )}
                      </div>

                      <div className="text-right">
                        <p className="text-base font-black" style={{ color: "#f97316" }}>
                          {formatEuros(depense.montant)}
                        </p>

                        <div className="flex justify-end gap-2 mt-3 flex-wrap">
                          {depense.canView && <StatusBadge tone="gray">Consulter</StatusBadge>}
                          {depense.canEdit && <StatusBadge tone="blue">Modifier</StatusBadge>}
                          {depense.canDelete && <StatusBadge tone="red">Supprimer</StatusBadge>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        )}

        {activeTab === "historique" && (
          <SectionCard>
            <SectionTitle emoji="🕐" title="Historique retourné par l’API" />

            {historique.length === 0 ? (
              <p className="text-sm text-center py-8" style={{ color: "#94a3b8" }}>
                Aucun historique retourné par l’API.
              </p>
            ) : (
              <div className="space-y-3">
                {historique.map(item => (
                  <div
                    key={item.id}
                    className="p-4 rounded-3xl"
                    style={{ backgroundColor: "#f8fafc" }}
                  >
                    <div className="flex justify-between gap-4 flex-wrap">
                      <div>
                        <p className="text-sm font-black" style={{ color: "#1e293b" }}>
                          {item.action}
                        </p>
                        <p className="text-xs mt-1" style={{ color: "#94a3b8" }}>
                          Par {item.utilisateur}
                        </p>
                      </div>

                      <p className="text-xs font-bold" style={{ color: "#94a3b8" }}>
                        {item.date} à {item.heure}
                      </p>
                    </div>

                    {(item.ancienneValeur || item.nouvelleValeur) && (
                      <div className="grid sm:grid-cols-2 gap-3 mt-3">
                        <InfoRow label="Ancienne valeur" value={item.ancienneValeur || "—"} />
                        <InfoRow label="Nouvelle valeur" value={item.nouvelleValeur || "—"} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        )}
      </main>
    </PageShell>
  );
}

// ============================================================
// MODULE PRINCIPAL
// ============================================================

export default function ModuleReporting() {
  const [view, setView] = useState<ViewState>({ name: "liste" });
  const [activeTab, setActiveTab] = useState<OngletReporting>("revenus");

  const [biens] = useState<BienReporting[]>(biensMock);
  const [revenus] = useState<RevenuReporting[]>(revenusMock);
  const [depenses, setDepenses] = useState<DepenseReporting[]>(depensesMock);
  const [historique, setHistorique] =
    useState<HistoriqueReporting[]>(historiqueMock);
  const [syntheses] = useState<SyntheseReporting[]>(synthesesMock);
  const [categories, setCategories] =
    useState<CategorieDepense[]>(categoriesInitiales);

  const selectedBien = useMemo(() => {
    if (
      view.name === "detail" ||
      view.name === "form_depense" ||
      view.name === "form_sous_categorie"
    ) {
      return findBien(biens, view.bienId);
    }

    return null;
  }, [view, biens]);

  const selectedCategorie = useMemo(() => {
    if (view.name !== "form_sous_categorie") return null;
    return findCategorie(categories, view.categorieId);
  }, [view, categories]);

  const addHistory = (
    bienId: string,
    action: string,
    ancienneValeur?: string,
    nouvelleValeur?: string
  ) => {
    setHistorique(prev => [
      ...prev,
      {
        id: `hist-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        bienId,
        date: getToday(),
        heure: getNowTime(),
        utilisateur: "Utilisateur connecté",
        action,
        ancienneValeur,
        nouvelleValeur,
      },
    ]);
  };

  const handleSaveDepense = (payload: {
    bienId: string;
    categorieId: string;
    sousCategorieId: string;
    montant: number;
    date: string;
    commentaire?: string;
    justificatif?: string;
  }) => {
    const categorie = findCategorie(categories, payload.categorieId);
    const sousCategorie = categorie?.sousCategories.find(
      item => item.id === payload.sousCategorieId
    );

    if (!categorie || !sousCategorie) {
      alert("Erreur API simulée : catégorie introuvable.");
      return;
    }

    const depenseApiResponse: DepenseReporting = {
      id: `dep-${Date.now()}`,
      bienId: payload.bienId,
      date: payload.date,
      categorieId: categorie.id,
      categorieLabel: categorie.label,
      sousCategorieId: sousCategorie.id,
      sousCategorieLabel: sousCategorie.label,
      montant: payload.montant,
      justificatif: payload.justificatif,
      commentaire: payload.commentaire,
      origine: "reporting",
      syncStatus: "synchronise",
      canView: true,
      canEdit: true,
      canDelete: true,
    };

    setDepenses(prev => [...prev, depenseApiResponse]);

    addHistory(
      payload.bienId,
      "Dépense créée dans Reporting et transmise à l’API",
      undefined,
      `${sousCategorie.label} — ${formatEuros(payload.montant)}`
    );

    setView({ name: "detail", bienId: payload.bienId });
    setActiveTab("depenses");

    alert(
      "Dépense enregistrée. Le Back-End synchronise cette dépense avec Régularisation des charges si nécessaire."
    );
  };

  const handleSaveCustomSubcategory = (payload: {
    categorieId: string;
    label: string;
    description?: string;
  }) => {
    if (!selectedBien) return;

    const newSubcategory: SousCategorieDepense = {
      id: `custom-${Date.now()}`,
      label: payload.label,
      description: payload.description,
      personnalisee: true,
      canEdit: true,
      canDelete: true,
    };

    setCategories(prev =>
      prev.map(categorie =>
        categorie.id === payload.categorieId
          ? {
              ...categorie,
              sousCategories: [...categorie.sousCategories, newSubcategory],
            }
          : categorie
      )
    );

    addHistory(
      selectedBien.id,
      "Sous-catégorie personnalisée créée et synchronisée avec Régularisation des charges",
      undefined,
      payload.label
    );

    setView({ name: "form_depense", bienId: selectedBien.id });

    alert(
      "Sous-catégorie créée. Elle est immédiatement disponible et synchronisée avec Régularisation des charges."
    );
  };

  const handleExportPDF = (bien: BienReporting) => {
    addHistory(
      bien.id,
      "Export PDF demandé",
      undefined,
      `Export PDF Reporting — ${bien.nom}`
    );

    alert(
      "Export PDF simulé. En production, le Front téléchargera le fichier retourné par l’API."
    );
  };

  const handleExportExcel = (bien: BienReporting) => {
    addHistory(
      bien.id,
      "Export Excel demandé",
      undefined,
      `Export Excel Reporting — ${bien.nom}`
    );

    alert(
      "Export Excel simulé. En production, le Front téléchargera le fichier retourné par l’API."
    );
  };

  if (view.name === "form_depense" && selectedBien) {
    return (
      <FormDepenseReporting
        bien={selectedBien}
        categories={categories}
        onBack={() => setView({ name: "detail", bienId: selectedBien.id })}
        onSave={handleSaveDepense}
        onAddCustomSubcategory={categorieId =>
          setView({
            name: "form_sous_categorie",
            bienId: selectedBien.id,
            categorieId,
          })
        }
      />
    );
  }

  if (view.name === "form_sous_categorie" && selectedBien && selectedCategorie) {
    return (
      <FormSousCategorieReporting
        categorie={selectedCategorie}
        onBack={() => setView({ name: "form_depense", bienId: selectedBien.id })}
        onSave={handleSaveCustomSubcategory}
      />
    );
  }

  if (view.name === "detail" && selectedBien) {
    const revenusBien = revenus.filter(revenu => revenu.bienId === selectedBien.id);
    const depensesBien = depenses.filter(depense => depense.bienId === selectedBien.id);
    const historiqueBien = historique.filter(item => item.bienId === selectedBien.id);
    const syntheseBien = syntheses.find(item => item.bienId === selectedBien.id);

    return (
      <VueDetailReporting
        bien={selectedBien}
        revenus={revenusBien}
        depenses={depensesBien}
        historique={historiqueBien}
        synthese={syntheseBien}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onBack={() => setView({ name: "liste" })}
        onAddDepense={() => setView({ name: "form_depense", bienId: selectedBien.id })}
        onExportPDF={() => handleExportPDF(selectedBien)}
        onExportExcel={() => handleExportExcel(selectedBien)}
      />
    );
  }

  return (
    <VueListeBiensReporting
      biens={biens}
      syntheses={syntheses}
      onOpen={bienId => {
        setView({ name: "detail", bienId });
        setActiveTab("revenus");
      }}
    />
  );
}