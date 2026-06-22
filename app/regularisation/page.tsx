"use client";

import { useMemo, useState, type ReactNode } from "react";

// ============================================================
// TYPES
// ============================================================

type TypeBien = "bien_individuel" | "immeuble_rapport";
type NiveauDepense = "bien_individuel" | "immeuble_rapport" | "lot_immeuble";
type ModeRepartitionCharges = "egalitaire" | "surface" | "cle_repartition" | "tantiemes";
type StatutBien = "vacant" | "occupe" | "archive";
type StatutDepense = "brouillon" | "enregistree" | "verrouillee";
type StatutSync = "synchronise" | "en_attente" | "erreur";
type StatutRegularisation = "non_calculee" | "calculee" | "validee";
type OngletDetail = "depenses" | "lots" | "regularisations" | "historique";

type ViewState =
  | { name: "liste" }
  | { name: "detail"; bienId: string }
  | { name: "form_depense"; bienId: string; lotId?: string }
  | { name: "form_sous_categorie"; bienId: string; categorieId: string; lotId?: string };

interface BienRegularisation {
  id: string;
  reference: string;
  nom: string;
  adresse: string;
  typeBien: TypeBien;
  statut: StatutBien;
  locataireActuel?: string;
  totalTantiemes?: 100 | 1000 | 10000 | 100000;
  modeRepartitionCharges?: ModeRepartitionCharges;
}

interface LotRegularisation {
  id: string;
  immeubleId: string;
  reference: string;
  nom: string;
  locataire?: string;
  quotePart: number;
  baseTantiemes: number;
  canEdit: boolean;
}

interface CategorieCharge {
  id: string;
  label: string;
  sousCategories: SousCategorieCharge[];
}

interface SousCategorieCharge {
  id: string;
  label: string;
  description?: string;
  personnalisee?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
}

interface DepenseRegularisation {
  id: string;
  bienId: string;
  lotId?: string;
  lotReference?: string;
  lotNom?: string;
  niveau: NiveauDepense;
  date: string;
  categorieId: string;
  categorieLabel: string;
  sousCategorieId: string;
  sousCategorieLabel: string;
  montantAnnuel: number;
  commentaire?: string;
  justificatif?: string;
  statut: StatutDepense;
  origine: "regularisation" | "reporting";
  syncStatus: StatutSync;
  syncError?: string;
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

interface ResultatRegularisation {
  id: string;
  bienId: string;
  reference?: string;
  annee: number;
  statut: StatutRegularisation;
  dateCalcul?: string;
  dateValidation?: string;
  chargesRecuperables: number;
  chargesNonRecuperables: number;
  provisionsAppelees: number;
  montantRegularisation: number;
  detailLots?: ResultatRegularisationLot[];
}

interface ResultatRegularisationLot {
  lotId: string;
  lotReference: string;
  lotNom: string;
  locataire?: string;
  chargesRecuperables: number;
  chargesNonRecuperables: number;
  provisionsAppelees: number;
  montantRegularisation: number;
}

interface HistoriqueItem {
  id: string;
  bienId: string;
  date: string;
  heure: string;
  utilisateur: string;
  action: string;
  ancienneValeur?: string;
  nouvelleValeur?: string;
}

// ============================================================
// DONNÉES MOCK — SIMULATION RETOURS API
// ============================================================

const categoriesInitiales: CategorieCharge[] = [
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
      { id: "refection_reseaux_collectifs", label: "Réfection des réseaux collectifs" },
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
      { id: "remplacement_joints_flexibles", label: "Remplacement de joints et flexibles" },
      { id: "remplacement_robinet_vetuste", label: "Remplacement d’un robinet vétuste" },
      { id: "remplacement_ballon_eau", label: "Remplacement d’un ballon d’eau chaude" },
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

const biensMock: BienRegularisation[] = [
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
    totalTantiemes: 1000,
    modeRepartitionCharges: "tantiemes",
  },
];

const lotsMock: LotRegularisation[] = [
  {
    id: "lot001",
    immeubleId: "im001",
    reference: "LOT-000001",
    nom: "Lot 1 — Studio",
    locataire: "Sarah Morel",
    quotePart: 250,
    baseTantiemes: 1000,
    canEdit: true,
  },
  {
    id: "lot002",
    immeubleId: "im001",
    reference: "LOT-000002",
    nom: "Lot 2 — T2",
    locataire: "Nora Diallo",
    quotePart: 250,
    baseTantiemes: 1000,
    canEdit: true,
  },
  {
    id: "lot003",
    immeubleId: "im001",
    reference: "LOT-000003",
    nom: "Lot 3 — T3",
    locataire: "Vacant",
    quotePart: 300,
    baseTantiemes: 1000,
    canEdit: true,
  },
  {
    id: "lot004",
    immeubleId: "im001",
    reference: "LOT-000004",
    nom: "Lot 4 — T2",
    locataire: "Amine B.",
    quotePart: 200,
    baseTantiemes: 1000,
    canEdit: true,
  },
];

const depensesMock: DepenseRegularisation[] = [
  {
    id: "dep001",
    bienId: "bi001",
    niveau: "bien_individuel",
    date: "2026-01-12",
    categorieId: "fiscalite",
    categorieLabel: "VIII – Fiscalité et redevances",
    sousCategorieId: "teom",
    sousCategorieLabel: "Taxe d’enlèvement des ordures ménagères (TEOM)",
    montantAnnuel: 180,
    commentaire: "Montant hors frais de gestion.",
    justificatif: "avis_taxe_fonciere.pdf",
    statut: "enregistree",
    origine: "regularisation",
    syncStatus: "synchronise",
    canView: true,
    canEdit: true,
    canDelete: true,
  },
  {
    id: "dep002",
    bienId: "im001",
    niveau: "immeuble_rapport",
    date: "2026-02-03",
    categorieId: "parties_communes",
    categorieLabel: "IV – Parties communes",
    sousCategorieId: "nettoyage_parties_communes",
    sousCategorieLabel: "Nettoyage des parties communes",
    montantAnnuel: 1200,
    justificatif: "facture_nettoyage.pdf",
    statut: "enregistree",
    origine: "reporting",
    syncStatus: "synchronise",
    canView: true,
    canEdit: true,
    canDelete: false,
  },
];

const regularisationsMock: ResultatRegularisation[] = [
  {
    id: "reg001",
    bienId: "bi001",
    reference: "REG-2026-000001",
    annee: 2026,
    statut: "validee",
    dateCalcul: "2026-12-31",
    dateValidation: "2027-01-05",
    chargesRecuperables: 180,
    chargesNonRecuperables: 0,
    provisionsAppelees: 960,
    montantRegularisation: -780,
  },
];

const historiqueMock: HistoriqueItem[] = [
  {
    id: "hist001",
    bienId: "bi001",
    date: "2026-01-12",
    heure: "09:00",
    utilisateur: "Utilisateur connecté",
    action: "Dépense créée",
    nouvelleValeur: "TEOM — 180 €",
  },
  {
    id: "hist002",
    bienId: "bi001",
    date: "2027-01-05",
    heure: "10:30",
    utilisateur: "Utilisateur connecté",
    action: "Régularisation validée",
    nouvelleValeur: "REG-2026-000001",
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

function getBienTypeLabel(type: TypeBien) {
  return type === "immeuble_rapport" ? "Immeuble de rapport" : "Bien individuel";
}

function getModeRepartitionLabel(mode?: ModeRepartitionCharges) {
  const labels: Record<ModeRepartitionCharges, string> = {
    egalitaire: "Répartition égalitaire",
    surface: "Répartition selon les surfaces",
    cle_repartition: "Clé de répartition",
    tantiemes: "Répartition par tantièmes",
  };

  return mode ? labels[mode] : "Défini dans le module Mes biens";
}

function findBien(biens: BienRegularisation[], bienId: string) {
  return biens.find(bien => bien.id === bienId);
}

function findCategorie(categories: CategorieCharge[], categorieId: string) {
  return categories.find(categorie => categorie.id === categorieId);
}

// ============================================================
// COMPOSANTS UI
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
      <p className="text-3xl font-black leading-none">{value}</p>
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
// ÉCRAN PRINCIPAL
// ============================================================

function VueListeBiens({
  biens,
  depenses,
  regularisations,
  onSelectBien,
}: {
  biens: BienRegularisation[];
  depenses: DepenseRegularisation[];
  regularisations: ResultatRegularisation[];
  onSelectBien: (bienId: string) => void;
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

  const biensIndividuels = biens.filter(bien => bien.typeBien === "bien_individuel");
  const immeubles = biens.filter(bien => bien.typeBien === "immeuble_rapport");
  const regularisationsValidees = regularisations.filter(
    regularisation => regularisation.statut === "validee"
  );

  return (
    <PageShell>
      <PageHeader
        title="🧮 Régularisation des charges"
        subtitle="Dépenses, justificatifs, régularisations, lots, tantièmes et synchronisation Reporting."
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
            value={depenses.length}
            label="Dépenses enregistrées"
            gradient="linear-gradient(135deg,#8b5cf6,#a78bfa)"
          />
          <StatCard
            emoji="✅"
            value={regularisationsValidees.length}
            label="Régularisations validées"
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
            const depensesBien = depenses.filter(depense => depense.bienId === bien.id);
            const regularisationsBien = regularisations.filter(
              regularisation => regularisation.bienId === bien.id
            );

            return (
              <button
                key={bien.id}
                onClick={() => onSelectBien(bien.id)}
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
                        <p
                          className="text-base font-black"
                          style={{ color: "#1e293b" }}
                        >
                          {bien.nom}
                        </p>

                        <StatusBadge
                          tone={bien.typeBien === "immeuble_rapport" ? "purple" : "blue"}
                        >
                          {getBienTypeLabel(bien.typeBien)}
                        </StatusBadge>
                      </div>

                      <p className="text-xs sm:text-sm mt-1" style={{ color: "#94a3b8" }}>
                        {bien.reference} · {bien.adresse}
                      </p>

                      <p className="text-xs mt-1" style={{ color: "#cbd5e1" }}>
                        {bien.locataireActuel || "Lots visibles dans la fiche immeuble"} ·{" "}
                        {bien.statut}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-black" style={{ color: "#f97316" }}>
                      {depensesBien.length} dépense(s)
                    </p>
                    <p className="text-xs mt-1" style={{ color: "#94a3b8" }}>
                      {regularisationsBien.length} régularisation(s)
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

function FormDepense({
  bien,
  lot,
  categories,
  onBack,
  onSave,
  onAddCustomSubcategory,
}: {
  bien: BienRegularisation;
  lot?: LotRegularisation;
  categories: CategorieCharge[];
  onBack: () => void;
  onSave: (payload: {
    bienId: string;
    lotId?: string;
    categorieId: string;
    sousCategorieId: string;
    montantAnnuel: number;
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
  const [montantAnnuel, setMontantAnnuel] = useState("");
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

    if (!montantAnnuel || Number(montantAnnuel) <= 0) {
      alert("Veuillez renseigner un montant annuel valide.");
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
      lotId: lot?.id,
      categorieId,
      sousCategorieId,
      montantAnnuel: Number(montantAnnuel),
      date,
      commentaire,
      justificatif,
    });
  };

  return (
    <PageShell>
      <PageHeader
        title="➕ Ajouter une dépense"
        subtitle={
          lot
            ? `${bien.nom} · ${lot.reference} · ${lot.nom}`
            : `${bien.nom} · ${bien.reference}`
        }
        onBack={onBack}
      />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <SectionCard>
          <SectionTitle emoji="💶" title="Informations de la dépense" />

          <div className="grid sm:grid-cols-2 gap-3 mb-5">
            <InfoRow
              label="Niveau de rattachement"
              value={lot ? "Lot d’un immeuble de rapport" : getBienTypeLabel(bien.typeBien)}
            />
            <InfoRow
              label="Actif concerné"
              value={lot ? `${lot.reference} · ${lot.nom}` : `${bien.reference} · ${bien.nom}`}
            />
          </div>

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
                Montant annuel *
              </label>
              <input
                type="number"
                value={montantAnnuel}
                onChange={event => setMontantAnnuel(event.target.value)}
                placeholder="0"
                className="w-full px-4 py-3 rounded-3xl border outline-none text-sm"
                style={{ borderColor: "#e2e8f0" }}
              />
            </div>

            <div>
              <label className="block text-xs font-black mb-2" style={{ color: "#64748b" }}>
                Date de la dépense *
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
              Le Front-End transmet la dépense à l’API. La qualification juridique,
              les montants récupérables, la synchronisation Reporting et les calculs
              sont gérés exclusivement par le Back-End.
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
// FORMULAIRE SOUS-CATÉGORIE PERSONNALISÉE
// ============================================================

function FormSousCategoriePersonnalisee({
  categorie,
  onBack,
  onSave,
}: {
  categorie: CategorieCharge;
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
                placeholder="Ex : Entretien spécifique..."
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
// DÉTAIL BIEN
// ============================================================

function VueDetailBien({
  bien,
  lots,
  depenses,
  regularisations,
  historique,
  activeTab,
  setActiveTab,
  onBack,
  onAddDepense,
  onAddDepenseLot,
  onCalculateRegularisation,
  onValidateRegularisation,
}: {
  bien: BienRegularisation;
  lots: LotRegularisation[];
  depenses: DepenseRegularisation[];
  regularisations: ResultatRegularisation[];
  historique: HistoriqueItem[];
  activeTab: OngletDetail;
  setActiveTab: (tab: OngletDetail) => void;
  onBack: () => void;
  onAddDepense: () => void;
  onAddDepenseLot: (lotId: string) => void;
  onCalculateRegularisation: () => void;
  onValidateRegularisation: (regularisationId: string) => void;
}) {

  const tabs: { id: OngletDetail; label: string; emoji: string; visible: boolean }[] = [
    { id: "depenses", label: "Dépenses", emoji: "💶", visible: true },
    { id: "lots", label: "Lots", emoji: "🏢", visible: bien.typeBien === "immeuble_rapport" },
    { id: "regularisations", label: "Régularisations", emoji: "🧮", visible: true },
    { id: "historique", label: "Historique", emoji: "🕐", visible: true },
  ];

  return (
    <PageShell>
      <PageHeader
        title={`${bien.typeBien === "immeuble_rapport" ? "🏢" : "🏠"} ${bien.nom}`}
        subtitle={`${bien.reference} · ${bien.adresse}`}
        onBack={onBack}
        actions={
          <ActionButton onClick={onAddDepense} variant="orange">
            {bien.typeBien === "immeuble_rapport"
              ? "+ Ajouter une dépense immeuble"
              : "+ Ajouter une dépense"}
          </ActionButton>
        }
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <StatCard
            emoji="💶"
            value={depenses.length}
            label="Dépenses"
            gradient="linear-gradient(135deg,#f97316,#fb923c)"
          />
          <StatCard
            emoji="🏷️"
            value={getBienTypeLabel(bien.typeBien)}
            label="Type d’actif"
            gradient="linear-gradient(135deg,#22c55e,#4ade80)"
          />
          <StatCard
            emoji="📄"
            value={regularisations.length}
            label="Régularisations"
            gradient="linear-gradient(135deg,#8b5cf6,#a78bfa)"
          />
          <StatCard
            emoji="🔁"
            value={depenses.filter(depense => depense.syncStatus === "synchronise").length}
            label="Synchronisées"
            gradient="linear-gradient(135deg,#3b82f6,#60a5fa)"
          />
        </div>

        <SectionCard>
          <SectionTitle emoji="📌" title="Informations du bien" />

          <div className="grid sm:grid-cols-4 gap-3">
            <InfoRow label="Nom" value={bien.nom} />
            <InfoRow label="Adresse" value={bien.adresse} />
            <InfoRow label="Locataire" value={bien.locataireActuel || "Voir les lots"} />
            <InfoRow label="Statut" value={bien.statut} />
          </div>
        </SectionCard>

        <div className="flex gap-2 overflow-x-auto py-5">
          {tabs
            .filter(tab => tab.visible)
            .map(tab => (
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

        {activeTab === "depenses" && (
          <SectionCard>
            <SectionTitle emoji="💶" title="Dépenses retournées par l’API" />

            {depenses.length === 0 ? (
              <p className="text-sm text-center py-8" style={{ color: "#94a3b8" }}>
                Aucune dépense enregistrée.
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
                          <p
                            className="text-sm font-black"
                            style={{ color: "#1e293b" }}
                          >
                            {depense.sousCategorieLabel}
                          </p>

                          <StatusBadge tone="blue">{depense.statut}</StatusBadge>

                          <StatusBadge
                            tone={
                              depense.syncStatus === "synchronise"
                                ? "green"
                                : depense.syncStatus === "erreur"
                                  ? "red"
                                  : "orange"
                            }
                          >
                            {depense.syncStatus}
                          </StatusBadge>

                          <StatusBadge tone={depense.lotId ? "purple" : "gray"}>
                            {depense.lotId
                              ? `Lot ${depense.lotReference || ""}`
                              : depense.niveau === "immeuble_rapport"
                                ? "Immeuble"
                                : "Bien individuel"}
                          </StatusBadge>
                        </div>

                        <p className="text-xs mt-1" style={{ color: "#94a3b8" }}>
                          {depense.date} · {depense.categorieLabel}
                        </p>

                        {depense.lotId && (
                          <p className="text-xs mt-1" style={{ color: "#94a3b8" }}>
                            Rattachée au lot : {depense.lotReference} · {depense.lotNom}
                          </p>
                        )}

                        <p className="text-xs mt-1" style={{ color: "#cbd5e1" }}>
                          Origine :{" "}
                          {depense.origine === "reporting"
                            ? "Reporting"
                            : "Régularisation des charges"}
                        </p>

                        {depense.syncError && (
                          <p className="text-xs mt-1 font-bold" style={{ color: "#dc2626" }}>
                            Erreur : {depense.syncError}
                          </p>
                        )}
                      </div>

                      <div className="text-right">
                        <p
                          className="text-base font-black"
                          style={{ color: "#f97316" }}
                        >
                          {formatEuros(depense.montantAnnuel)}
                        </p>

                        <p className="text-xs mt-1" style={{ color: "#94a3b8" }}>
                          {depense.justificatif || "Aucun justificatif"}
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

        {activeTab === "lots" && bien.typeBien === "immeuble_rapport" && (
          <SectionCard>
            <SectionTitle emoji="🏢" title="Lots et répartition" />

            <div
              className="mb-5 p-4 rounded-3xl"
              style={{ backgroundColor: "#eff6ff", border: "1px solid #bfdbfe" }}
            >
              <p className="text-sm font-bold" style={{ color: "#1d4ed8" }}>
                Le mode de répartition des lots est repris du module Mes biens, au moment
                de la création ou de la modification de l’immeuble de rapport. Il n’est
                pas modifiable dans le module Régularisation des charges.
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-3 mb-5">
              <InfoRow
                label="Mode de répartition hérité"
                value={getModeRepartitionLabel(bien.modeRepartitionCharges)}
              />
              <InfoRow label="Base de tantièmes" value={bien.totalTantiemes || "—"} />
              <InfoRow label="Nombre de lots" value={lots.length} />
            </div>

            <div className="space-y-3">
              {lots.map(lot => (
                <div
                  key={lot.id}
                  className="p-4 rounded-3xl"
                  style={{ backgroundColor: "#f8fafc" }}
                >
                  <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3 items-center">
                    <InfoRow label="Lot" value={`${lot.reference} · ${lot.nom}`} />
                    <InfoRow label="Locataire" value={lot.locataire || "—"} />
                    <InfoRow label="Quote-part héritée" value={`${lot.quotePart}/${lot.baseTantiemes}`} />
                    <StatusBadge tone="gray">Lecture seule</StatusBadge>

                    <ActionButton onClick={() => onAddDepenseLot(lot.id)} variant="orange">
                      + Dépense lot
                    </ActionButton>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        {activeTab === "regularisations" && (
          <SectionCard>
            <div className="flex items-center justify-between gap-4 flex-wrap mb-5">
              <SectionTitle emoji="🧮" title="Régularisations retournées par l’API" />
              <ActionButton onClick={onCalculateRegularisation} variant="orange">
                Calculer la régularisation
              </ActionButton>
            </div>

            {regularisations.length === 0 ? (
              <p className="text-sm text-center py-8" style={{ color: "#94a3b8" }}>
                Aucune régularisation calculée.
              </p>
            ) : (
              <div className="space-y-4">
                {regularisations.map(reg => (
                  <div
                    key={reg.id}
                    className="p-5 rounded-3xl"
                    style={{ backgroundColor: "#f8fafc" }}
                  >
                    <div className="flex justify-between gap-4 flex-wrap mb-4">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p
                            className="text-sm font-black"
                            style={{ color: "#1e293b" }}
                          >
                            {reg.reference || `Régularisation ${reg.annee}`}
                          </p>

                          <StatusBadge
                            tone={
                              reg.statut === "validee"
                                ? "green"
                                : reg.statut === "calculee"
                                  ? "orange"
                                  : "gray"
                            }
                          >
                            {reg.statut}
                          </StatusBadge>

                          <StatusBadge tone={depense.lotId ? "purple" : "gray"}>
                            {depense.lotId
                              ? `Lot ${depense.lotReference || ""}`
                              : depense.niveau === "immeuble_rapport"
                                ? "Immeuble"
                                : "Bien individuel"}
                          </StatusBadge>
                        </div>

                        <p className="text-xs mt-1" style={{ color: "#94a3b8" }}>
                          Année {reg.annee} · Date calcul : {reg.dateCalcul || "—"}
                        </p>
                      </div>

                      {reg.statut === "calculee" && (
                        <ActionButton
                          onClick={() => onValidateRegularisation(reg.id)}
                          variant="green"
                        >
                          Valider
                        </ActionButton>
                      )}
                    </div>

                    <div className="grid sm:grid-cols-4 gap-3">
                      <InfoRow
                        label="Charges récupérables"
                        value={formatEuros(reg.chargesRecuperables)}
                      />
                      <InfoRow
                        label="Charges non récupérables"
                        value={formatEuros(reg.chargesNonRecuperables)}
                      />
                      <InfoRow
                        label="Provisions appelées"
                        value={formatEuros(reg.provisionsAppelees)}
                      />
                      <InfoRow
                        label="Montant régularisation"
                        value={formatEuros(reg.montantRegularisation)}
                      />
                    </div>

                    {reg.detailLots && reg.detailLots.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {reg.detailLots.map(lot => (
                          <div
                            key={lot.lotId}
                            className="p-3 rounded-2xl"
                            style={{ backgroundColor: "#fff" }}
                          >
                            <div className="flex justify-between gap-3 flex-wrap">
                              <div>
                                <p
                                  className="text-sm font-black"
                                  style={{ color: "#1e293b" }}
                                >
                                  {lot.lotReference} · {lot.lotNom}
                                </p>
                                <p className="text-xs" style={{ color: "#94a3b8" }}>
                                  {lot.locataire || "Vacant"}
                                </p>
                              </div>

                              <p
                                className="text-sm font-black"
                                style={{ color: "#f97316" }}
                              >
                                {formatEuros(lot.montantRegularisation)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
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
                Aucun historique.
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
                        <p
                          className="text-sm font-black"
                          style={{ color: "#1e293b" }}
                        >
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

export default function ModuleRegularisationCharges() {
  const [view, setView] = useState<ViewState>({ name: "liste" });
  const [activeTab, setActiveTab] = useState<OngletDetail>("depenses");

  const [biens] = useState<BienRegularisation[]>(biensMock);
  const [lots] = useState<LotRegularisation[]>(lotsMock);
  const [categories, setCategories] = useState<CategorieCharge[]>(categoriesInitiales);
  const [depenses, setDepenses] = useState<DepenseRegularisation[]>(depensesMock);
  const [regularisations, setRegularisations] =
    useState<ResultatRegularisation[]>(regularisationsMock);
  const [historique, setHistorique] = useState<HistoriqueItem[]>(historiqueMock);

  const selectedBien = useMemo(() => {
    if (view.name === "detail" || view.name === "form_depense") {
      return findBien(biens, view.bienId);
    }

    if (view.name === "form_sous_categorie") {
      return findBien(biens, view.bienId);
    }

    return null;
  }, [view, biens]);

  const selectedLot = useMemo(() => {
    if ((view.name === "form_depense" || view.name === "form_sous_categorie") && view.lotId) {
      return lots.find(lot => lot.id === view.lotId);
    }

    return null;
  }, [view, lots]);

  const selectedCategorie = useMemo(() => {
    if (view.name !== "form_sous_categorie") return null;
    return findCategorie(categories, view.categorieId);
  }, [view, categories]);

  const addHistory = (bienId: string, action: string, nouvelleValeur?: string) => {
    setHistorique(prev => [
      ...prev,
      {
        id: `hist-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        bienId,
        date: getToday(),
        heure: getNowTime(),
        utilisateur: "Utilisateur connecté",
        action,
        nouvelleValeur,
      },
    ]);
  };

  const handleSaveDepense = (payload: {
    bienId: string;
    lotId?: string;
    categorieId: string;
    sousCategorieId: string;
    montantAnnuel: number;
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

    const bienParent = findBien(biens, payload.bienId);
    const lotCible = payload.lotId ? lots.find(lot => lot.id === payload.lotId) : undefined;

    const depenseApiResponse: DepenseRegularisation = {
      id: `dep-${Date.now()}`,
      bienId: payload.bienId,
      lotId: lotCible?.id,
      lotReference: lotCible?.reference,
      lotNom: lotCible?.nom,
      niveau: lotCible
        ? "lot_immeuble"
        : bienParent?.typeBien === "immeuble_rapport"
          ? "immeuble_rapport"
          : "bien_individuel",
      date: payload.date,
      categorieId: categorie.id,
      categorieLabel: categorie.label,
      sousCategorieId: sousCategorie.id,
      sousCategorieLabel: sousCategorie.label,
      montantAnnuel: payload.montantAnnuel,
      commentaire: payload.commentaire,
      justificatif: payload.justificatif,
      statut: "enregistree",
      origine: "regularisation",
      syncStatus: "synchronise",
      canView: true,
      canEdit: true,
      canDelete: true,
    };

    setDepenses(prev => [...prev, depenseApiResponse]);

    addHistory(
      payload.bienId,
      "Dépense créée et transmise à l’API",
      lotCible
        ? `${lotCible.reference} · ${lotCible.nom} — ${sousCategorie.label} — ${formatEuros(payload.montantAnnuel)}`
        : `${sousCategorie.label} — ${formatEuros(payload.montantAnnuel)}`
    );

    setView({ name: "detail", bienId: payload.bienId });
    setActiveTab("depenses");

    alert(
      lotCible
        ? "Dépense enregistrée sur le lot. Les catégories et sous-catégories restent identiques, et le Back-End rattache la dépense au lot sélectionné."
        : "Dépense enregistrée. Le Back-End qualifiera la charge et synchronisera le Reporting."
    );
  };

  const handleSaveCustomSubcategory = (payload: {
    categorieId: string;
    label: string;
    description?: string;
  }) => {
    if (!selectedBien) return;

    const newSubcategory: SousCategorieCharge = {
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
      "Sous-catégorie personnalisée créée",
      `${payload.label}`
    );

    setView({
      name: "form_depense",
      bienId: selectedBien.id,
      lotId: view.name === "form_sous_categorie" ? view.lotId : undefined,
    });

    alert("Sous-catégorie créée. Elle est immédiatement disponible dans le formulaire.");
  };

  const handleCalculateRegularisation = (bien: BienRegularisation) => {
    const apiResult: ResultatRegularisation = {
      id: `reg-${Date.now()}`,
      bienId: bien.id,
      annee: new Date().getFullYear(),
      statut: "calculee",
      dateCalcul: getToday(),
      chargesRecuperables: bien.typeBien === "immeuble_rapport" ? 1200 : 180,
      chargesNonRecuperables: bien.typeBien === "immeuble_rapport" ? 5000 : 0,
      provisionsAppelees: bien.typeBien === "immeuble_rapport" ? 2060 : 960,
      montantRegularisation: bien.typeBien === "immeuble_rapport" ? -860 : -780,
      detailLots:
        bien.typeBien === "immeuble_rapport"
          ? lots
              .filter(lot => lot.immeubleId === bien.id)
              .map(lot => ({
                lotId: lot.id,
                lotReference: lot.reference,
                lotNom: lot.nom,
                locataire: lot.locataire,
                chargesRecuperables: 300,
                chargesNonRecuperables: 1250,
                provisionsAppelees: lot.locataire === "Vacant" ? 0 : 680,
                montantRegularisation: lot.locataire === "Vacant" ? 300 : -380,
              }))
          : undefined,
    };

    setRegularisations(prev => [...prev, apiResult]);

    addHistory(
      bien.id,
      "Demande de calcul transmise à l’API",
      `Régularisation ${apiResult.annee} calculée`
    );

    setActiveTab("regularisations");

    alert("Calcul demandé. Le résultat affiché correspond au retour simulé de l’API.");
  };

  const handleValidateRegularisation = (regularisationId: string) => {
    setRegularisations(prev =>
      prev.map(reg =>
        reg.id === regularisationId
          ? {
              ...reg,
              statut: "validee",
              reference: `REG-${reg.annee}-${String(prev.length + 1).padStart(6, "0")}`,
              dateValidation: getToday(),
            }
          : reg
      )
    );

    const regularisation = regularisations.find(reg => reg.id === regularisationId);

    if (regularisation) {
      addHistory(
        regularisation.bienId,
        "Régularisation validée via API",
        `Régularisation ${regularisation.annee}`
      );
    }

    alert(
      "Régularisation validée. Le Back-End générera le document officiel et synchronisera Quittances, Locataires, Espace locataire, Reporting et Dashboard."
    );
  };

  if (view.name === "form_depense" && selectedBien) {
    return (
      <FormDepense
        bien={selectedBien}
        lot={selectedLot || undefined}
        categories={categories}
        onBack={() => setView({ name: "detail", bienId: selectedBien.id })}
        onSave={handleSaveDepense}
        onAddCustomSubcategory={categorieId =>
          setView({
            name: "form_sous_categorie",
            bienId: selectedBien.id,
            lotId: view.name === "form_depense" ? view.lotId : undefined,
            categorieId,
          })
        }
      />
    );
  }

  if (view.name === "form_sous_categorie" && selectedBien && selectedCategorie) {
    return (
      <FormSousCategoriePersonnalisee
        categorie={selectedCategorie}
        onBack={() =>
          setView({
            name: "form_depense",
            bienId: selectedBien.id,
            lotId: view.name === "form_sous_categorie" ? view.lotId : undefined,
          })
        }
        onSave={handleSaveCustomSubcategory}
      />
    );
  }

  if (view.name === "detail" && selectedBien) {
    const depensesBien = depenses.filter(depense => depense.bienId === selectedBien.id);
    const regularisationsBien = regularisations.filter(
      regularisation => regularisation.bienId === selectedBien.id
    );
    const historiqueBien = historique.filter(item => item.bienId === selectedBien.id);
    const lotsBien = lots.filter(lot => lot.immeubleId === selectedBien.id);

    return (
      <VueDetailBien
        bien={selectedBien}
        lots={lotsBien}
        depenses={depensesBien}
        regularisations={regularisationsBien}
        historique={historiqueBien}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onBack={() => setView({ name: "liste" })}
        onAddDepense={() => setView({ name: "form_depense", bienId: selectedBien.id })}
        onAddDepenseLot={lotId =>
          setView({ name: "form_depense", bienId: selectedBien.id, lotId })
        }
        onCalculateRegularisation={() => handleCalculateRegularisation(selectedBien)}
        onValidateRegularisation={handleValidateRegularisation}
      />
    );
  }

  return (
    <VueListeBiens
      biens={biens}
      depenses={depenses}
      regularisations={regularisations}
      onSelectBien={bienId => {
        setView({ name: "detail", bienId });
        setActiveTab("depenses");
      }}
    />
  );
}