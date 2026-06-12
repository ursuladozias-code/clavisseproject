"use client";

import { useMemo, useState, type ReactNode } from "react";

// ============================================================
// TYPES
// ============================================================
type StatutBail = "brouillon" | "signe" | "resilie";
type StatutDepotGarantie =
  | "a_recevoir"
  | "recu"
  | "actif"
  | "a_restituer"
  | "restitue"
  | "cloture";

type StatutContratLocation = "en_attente" | "actif" | "termine";
type StatutEtatDesLieux = "non_realise" | "en_cours" | "valide";

interface HistoriqueDepotItem {
  id: string;
  date: string;
  heure: string;
  utilisateur: string;
  action: string;
  ancienneValeur: string;
  nouvelleValeur: string;
}

interface JustificatifRetenue {
  id: string;
  nom: string;
  type: string;
  url?: string;
}

interface EtatDesLieuxAssocie {
  statut: StatutEtatDesLieux;
  dateValidation?: string;
  observations?: string;
  conclusions?: string;
  retenuesProposees?: number;
  justificatifs?: JustificatifRetenue[];
}

interface BailDepotGarantie {
  bailId: string;
  bailReference: string;
  bailStatut: StatutBail;
  typeBail: string;
  dateDebut: string;
  dateFin: string;

  bienId: string;
  bienReference: string;
  bienNom: string;
  bienAdresse: string;

  locataireId: string;
  locataireNom: string;

  loyerHC: number;
  charges: number;
  totalMensuel: number;
  montantDepotGarantie: number;

  indiceReference: string;
  trimestreReference: string;
  anneeReference: string;
}

interface DepotGarantieDossier {
  id: string;

  bail: BailDepotGarantie;

  statutDepot: StatutDepotGarantie;
  dateReceptionDepot?: string;
  commentaireReception?: string;

  contratId?: string;
  contratReference?: string;
  statutContrat: StatutContratLocation;

  etatDesLieuxEntree: EtatDesLieuxAssocie;
  etatDesLieuxSortie: EtatDesLieuxAssocie;

  montantRetenues: number;
  commentaireRetenues?: string;

  dateRestitution?: string;
  montantEffectivementRestitue?: number;
  commentaireRestitution?: string;

  historique: HistoriqueDepotItem[];
}

type ViewState =
  | { name: "liste" }
  | { name: "detail"; dossier: DepotGarantieDossier };

// ============================================================
// MOCK DATA
// ============================================================
const mockDossiersDepot: DepotGarantieDossier[] = [
  {
    id: "dg001",
    bail: {
      bailId: "bail001",
      bailReference: "BAIL-000001",
      bailStatut: "signe",
      typeBail: "Location nue",
      dateDebut: "2025-06-01",
      dateFin: "2028-05-31",
      bienId: "bi001",
      bienReference: "BI-000001",
      bienNom: "Appartement T2 Centre-ville",
      bienAdresse: "12 Rue Victor Hugo, 69001 Lyon",
      locataireId: "loc001",
      locataireNom: "Claire Martin",
      loyerHC: 850,
      charges: 80,
      totalMensuel: 930,
      montantDepotGarantie: 850,
      indiceReference: "IRL",
      trimestreReference: "2ème trimestre",
      anneeReference: "2025",
    },
    statutDepot: "a_recevoir",
    statutContrat: "en_attente",
    etatDesLieuxEntree: {
      statut: "en_cours",
    },
    etatDesLieuxSortie: {
      statut: "non_realise",
    },
    montantRetenues: 0,
    historique: [],
  },
  {
    id: "dg002",
    bail: {
      bailId: "bail002",
      bailReference: "BAIL-000002",
      bailStatut: "signe",
      typeBail: "Location meublée",
      dateDebut: "2026-02-01",
      dateFin: "2027-01-31",
      bienId: "lot001",
      bienReference: "LOT-000001",
      bienNom: "Studio République",
      bienAdresse: "8 Avenue Jean Jaurès, 69007 Lyon",
      locataireId: "loc002",
      locataireNom: "Yanis Bernard",
      loyerHC: 700,
      charges: 60,
      totalMensuel: 760,
      montantDepotGarantie: 1400,
      indiceReference: "IRL",
      trimestreReference: "4ème trimestre",
      anneeReference: "2025",
    },
    statutDepot: "recu",
    dateReceptionDepot: "2026-01-28",
    commentaireReception: "Virement bancaire reçu.",
    contratId: undefined,
    contratReference: undefined,
    statutContrat: "en_attente",
    etatDesLieuxEntree: {
      statut: "valide",
      dateValidation: "2026-02-01",
      observations: "Logement remis en bon état.",
      conclusions: "État des lieux d’entrée validé.",
    },
    etatDesLieuxSortie: {
      statut: "non_realise",
    },
    montantRetenues: 0,
    historique: [
      {
        id: "hist001",
        date: "2026-01-28",
        heure: "10:30",
        utilisateur: "Utilisateur connecté",
        action: "Réception du dépôt de garantie",
        ancienneValeur: "À recevoir",
        nouvelleValeur: "Reçu — 1 400 €",
      },
      {
        id: "hist002",
        date: "2026-02-01",
        heure: "14:05",
        utilisateur: "Système",
        action: "Validation de l’état des lieux d’entrée",
        ancienneValeur: "En cours",
        nouvelleValeur: "Validé",
      },
    ],
  },
  {
    id: "dg003",
    bail: {
      bailId: "bail003",
      bailReference: "BAIL-000003",
      bailStatut: "signe",
      typeBail: "Location nue",
      dateDebut: "2024-01-01",
      dateFin: "2027-01-01",
      bienId: "bi003",
      bienReference: "BI-000003",
      bienNom: "Maison Victor Hugo",
      bienAdresse: "22 Boulevard Victor Hugo, 59000 Lille",
      locataireId: "loc003",
      locataireNom: "Marie Dupont",
      loyerHC: 1000,
      charges: 120,
      totalMensuel: 1120,
      montantDepotGarantie: 1000,
      indiceReference: "IRL",
      trimestreReference: "1er trimestre",
      anneeReference: "2024",
    },
    statutDepot: "a_restituer",
    dateReceptionDepot: "2023-12-20",
    commentaireReception: "Chèque encaissé.",
    contratId: "contrat003",
    contratReference: "CONTRAT-000003",
    statutContrat: "actif",
    etatDesLieuxEntree: {
      statut: "valide",
      dateValidation: "2024-01-01",
      conclusions: "Entrée validée.",
    },
    etatDesLieuxSortie: {
      statut: "valide",
      dateValidation: "2026-06-01",
      observations: "Quelques dégradations constatées.",
      conclusions: "Retenues proposées pour réparations murales.",
      retenuesProposees: 300,
      justificatifs: [
        {
          id: "just001",
          nom: "Devis peinture",
          type: "PDF",
        },
      ],
    },
    montantRetenues: 300,
    commentaireRetenues: "Réfection partielle des murs du séjour.",
    historique: [
      {
        id: "hist003",
        date: "2023-12-20",
        heure: "09:00",
        utilisateur: "Utilisateur connecté",
        action: "Réception du dépôt de garantie",
        ancienneValeur: "À recevoir",
        nouvelleValeur: "Reçu — 1 000 €",
      },
      {
        id: "hist004",
        date: "2024-01-01",
        heure: "11:00",
        utilisateur: "Utilisateur connecté",
        action: "Activation du contrat",
        ancienneValeur: "En attente",
        nouvelleValeur: "Actif",
      },
      {
        id: "hist005",
        date: "2026-06-01",
        heure: "16:45",
        utilisateur: "Système",
        action: "Validation de l’état des lieux de sortie",
        ancienneValeur: "En cours",
        nouvelleValeur: "Validé — retenues 300 €",
      },
    ],
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
  return `${value.toLocaleString("fr-FR")} €`;
}

function getMontantRestitution(dossier: DepotGarantieDossier) {
  return Math.max(
    dossier.bail.montantDepotGarantie - dossier.montantRetenues,
    0
  );
}

function getStatutDepotLabel(statut: StatutDepotGarantie) {
  const labels: Record<StatutDepotGarantie, string> = {
    a_recevoir: "À recevoir",
    recu: "Reçu",
    actif: "Actif",
    a_restituer: "À restituer",
    restitue: "Restitué",
    cloture: "Clôturé",
  };

  return labels[statut];
}

function getStatutContratLabel(statut: StatutContratLocation) {
  const labels: Record<StatutContratLocation, string> = {
    en_attente: "En attente",
    actif: "Actif",
    termine: "Terminé",
  };

  return labels[statut];
}

function getStatutEDLLabel(statut: StatutEtatDesLieux) {
  const labels: Record<StatutEtatDesLieux, string> = {
    non_realise: "Non réalisé",
    en_cours: "En cours",
    valide: "Validé",
  };

  return labels[statut];
}

function canActivateContrat(dossier: DepotGarantieDossier) {
  return (
    dossier.bail.bailStatut === "signe" &&
    dossier.etatDesLieuxEntree.statut === "valide" &&
    dossier.statutDepot === "recu"
  );
}

function addHistorique(
  dossier: DepotGarantieDossier,
  action: string,
  ancienneValeur: string,
  nouvelleValeur: string,
  utilisateur = "Utilisateur connecté"
): HistoriqueDepotItem[] {
  return [
    ...dossier.historique,
    {
      id: `hist-${Date.now()}`,
      date: getToday(),
      heure: getNowTime(),
      utilisateur,
      action,
      ancienneValeur,
      nouvelleValeur,
    },
  ];
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
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-bold mb-1" style={{ color: "#64748b" }}>
        {label}
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
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function StatutDepotBadge({ statut }: { statut: StatutDepotGarantie }) {
  const cfg: Record<StatutDepotGarantie, { bg: string; color: string }> = {
    a_recevoir: { bg: "#fef9c3", color: "#854d0e" },
    recu: { bg: "#dbeafe", color: "#1d4ed8" },
    actif: { bg: "#dcfce7", color: "#166534" },
    a_restituer: { bg: "#ffedd5", color: "#9a3412" },
    restitue: { bg: "#ede9fe", color: "#6d28d9" },
    cloture: { bg: "#f1f5f9", color: "#64748b" },
  };

  const c = cfg[statut];

  return (
    <span
      className="px-2 py-0.5 rounded-full text-xs font-bold"
      style={{ backgroundColor: c.bg, color: c.color }}
    >
      {getStatutDepotLabel(statut)}
    </span>
  );
}

function StatutContratBadge({ statut }: { statut: StatutContratLocation }) {
  const cfg: Record<StatutContratLocation, { bg: string; color: string }> = {
    en_attente: { bg: "#fef9c3", color: "#854d0e" },
    actif: { bg: "#dcfce7", color: "#166534" },
    termine: { bg: "#f1f5f9", color: "#64748b" },
  };

  const c = cfg[statut];

  return (
    <span
      className="px-2 py-0.5 rounded-full text-xs font-bold"
      style={{ backgroundColor: c.bg, color: c.color }}
    >
      {getStatutContratLabel(statut)}
    </span>
  );
}

function StatutEDLBadge({ statut }: { statut: StatutEtatDesLieux }) {
  const cfg: Record<StatutEtatDesLieux, { bg: string; color: string }> = {
    non_realise: { bg: "#f1f5f9", color: "#64748b" },
    en_cours: { bg: "#fef9c3", color: "#854d0e" },
    valide: { bg: "#dcfce7", color: "#166534" },
  };

  const c = cfg[statut];

  return (
    <span
      className="px-2 py-0.5 rounded-full text-xs font-bold"
      style={{ backgroundColor: c.bg, color: c.color }}
    >
      {getStatutEDLLabel(statut)}
    </span>
  );
}

// ============================================================
// LISTE DES DOSSIERS
// ============================================================
function VueListeDepotsGarantie({
  dossiers,
  onSelect,
}: {
  dossiers: DepotGarantieDossier[];
  onSelect: (dossier: DepotGarantieDossier) => void;
}) {
  const [recherche, setRecherche] = useState("");
  const [filtre, setFiltre] = useState<
    "tous" | "a_recevoir" | "recu" | "actif" | "a_restituer" | "cloture"
  >("tous");

  const dossiersFiltres = dossiers.filter(dossier => {
    const q = recherche.toLowerCase();

    const matchRecherche =
      dossier.bail.bailReference.toLowerCase().includes(q) ||
      dossier.bail.bienNom.toLowerCase().includes(q) ||
      dossier.bail.locataireNom.toLowerCase().includes(q) ||
      dossier.bail.bienReference.toLowerCase().includes(q);

    if (!matchRecherche) return false;

    if (filtre === "tous") return true;
    if (filtre === "cloture") return dossier.statutDepot === "cloture";

    return dossier.statutDepot === filtre;
  });

  const stats = {
    total: dossiers.length,
    aRecevoir: dossiers.filter(d => d.statutDepot === "a_recevoir").length,
    actifs: dossiers.filter(d => d.statutDepot === "actif").length,
    aRestituer: dossiers.filter(d => d.statutDepot === "a_restituer").length,
  };

  const filtres = [
    { id: "tous", label: "Tous" },
    { id: "a_recevoir", label: "À recevoir" },
    { id: "recu", label: "Reçus" },
    { id: "actif", label: "Actifs" },
    { id: "a_restituer", label: "À restituer" },
    { id: "cloture", label: "Clôturés" },
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
          <div className="mb-5">
            <h1 className="text-2xl font-black" style={{ color: "#1e293b" }}>
              🔐 Dépôts de garantie
            </h1>
            <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>
              Suivi des dépôts, activation des contrats, restitution et clôture
              définitive des locations.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              {
                emoji: "📁",
                value: stats.total,
                label: "Dossiers",
                bg: "linear-gradient(135deg,#f97316,#fb923c)",
              },
              {
                emoji: "🟡",
                value: stats.aRecevoir,
                label: "À recevoir",
                bg: "linear-gradient(135deg,#f59e0b,#fbbf24)",
              },
              {
                emoji: "🟢",
                value: stats.actifs,
                label: "Actifs",
                bg: "linear-gradient(135deg,#22c55e,#4ade80)",
              },
              {
                emoji: "↩️",
                value: stats.aRestituer,
                label: "À restituer",
                bg: "linear-gradient(135deg,#8b5cf6,#a78bfa)",
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
            placeholder="Rechercher par bail, bien, locataire ou référence..."
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

        {dossiersFiltres.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">🔐</div>
            <p className="font-bold text-base" style={{ color: "#1e293b" }}>
              Aucun dossier trouvé
            </p>
            <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>
              Les dossiers apparaissent automatiquement lorsqu’un bail est signé.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {dossiersFiltres.map(dossier => (
              <button
                key={dossier.id}
                onClick={() => onSelect(dossier)}
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
                      🔐
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p
                          className="font-extrabold text-sm"
                          style={{ color: "#1e293b" }}
                        >
                          {dossier.bail.bienNom}
                        </p>

                        <StatutDepotBadge statut={dossier.statutDepot} />
                        <StatutContratBadge statut={dossier.statutContrat} />
                      </div>

                      <p className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>
                        {dossier.bail.bailReference} · Locataire :{" "}
                        {dossier.bail.locataireNom}
                      </p>

                      <p className="text-xs mt-0.5" style={{ color: "#cbd5e1" }}>
                        Début du bail : {dossier.bail.dateDebut} ·{" "}
                        {dossier.bail.bienAdresse}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p
                      className="text-sm font-extrabold"
                      style={{ color: "#f97316" }}
                    >
                      {formatEuros(dossier.bail.montantDepotGarantie)}
                    </p>

                    <p className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>
                      Dépôt de garantie
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// DÉTAIL DOSSIER
// ============================================================
function VueDetailDepotGarantie({
  dossier,
  onBack,
  onUpdate,
  onOpenBail,
  onOpenBien,
  onOpenLocataire,
  onOpenEtatDesLieux,
}: {
  dossier: DepotGarantieDossier;
  onBack: () => void;
  onUpdate: (dossier: DepotGarantieDossier) => void;
  onOpenBail: (id: string) => void;
  onOpenBien: (id: string) => void;
  onOpenLocataire: (id: string) => void;
  onOpenEtatDesLieux: (type: "entree" | "sortie") => void;
}) {
  const [onglet, setOnglet] = useState<
    | "synthese"
    | "bail"
    | "depot"
    | "edl"
    | "activation"
    | "restitution"
    | "historique"
  >("synthese");

  const [dateReception, setDateReception] = useState(
    dossier.dateReceptionDepot || getToday()
  );
  const [commentaireReception, setCommentaireReception] = useState(
    dossier.commentaireReception || ""
  );

  const [dateRestitution, setDateRestitution] = useState(
    dossier.dateRestitution || getToday()
  );
  const [montantRestitue, setMontantRestitue] = useState(
    dossier.montantEffectivementRestitue ?? getMontantRestitution(dossier)
  );
  const [commentaireRestitution, setCommentaireRestitution] = useState(
    dossier.commentaireRestitution || ""
  );

  const montantARestituer = getMontantRestitution(dossier);

  const onglets = [
    { id: "synthese", label: "Synthèse", emoji: "📋" },
    { id: "bail", label: "Bail", emoji: "📝" },
    { id: "depot", label: "Dépôt", emoji: "🔐" },
    { id: "edl", label: "États des lieux", emoji: "🧾" },
    { id: "activation", label: "Activation", emoji: "✅" },
    { id: "restitution", label: "Restitution", emoji: "↩️" },
    { id: "historique", label: "Historique", emoji: "🕐" },
  ] as const;

  const handleReceptionDepot = () => {
    if (dossier.statutDepot !== "a_recevoir") return;

    const updated: DepotGarantieDossier = {
      ...dossier,
      statutDepot: "recu",
      dateReceptionDepot: dateReception,
      commentaireReception,
      historique: addHistorique(
        dossier,
        "Réception du dépôt de garantie",
        "À recevoir",
        `Reçu — ${formatEuros(dossier.bail.montantDepotGarantie)}`
      ),
    };

    onUpdate(updated);
  };

  const handleValidateEDLEntree = () => {
    if (dossier.etatDesLieuxEntree.statut === "valide") return;

    const updated: DepotGarantieDossier = {
      ...dossier,
      etatDesLieuxEntree: {
        statut: "valide",
        dateValidation: getToday(),
        observations: "État des lieux d’entrée validé depuis le module Dépôt.",
        conclusions: "Entrée dans les lieux validée.",
      },
      historique: addHistorique(
        dossier,
        "Validation de l’état des lieux d’entrée",
        getStatutEDLLabel(dossier.etatDesLieuxEntree.statut),
        "Validé",
        "Système"
      ),
    };

    onUpdate(updated);
  };

  const handleValidateEDLSortie = () => {
    if (dossier.etatDesLieuxSortie.statut === "valide") return;

    const retenues = dossier.montantRetenues || 0;

    const updated: DepotGarantieDossier = {
      ...dossier,
      statutDepot: "a_restituer",
      etatDesLieuxSortie: {
        statut: "valide",
        dateValidation: getToday(),
        observations: "État des lieux de sortie validé.",
        conclusions:
          retenues > 0
            ? "Retenues proposées à la suite de l’état des lieux."
            : "Aucune retenue proposée.",
        retenuesProposees: retenues,
        justificatifs: dossier.etatDesLieuxSortie.justificatifs || [],
      },
      historique: addHistorique(
        dossier,
        "Validation de l’état des lieux de sortie",
        getStatutEDLLabel(dossier.etatDesLieuxSortie.statut),
        `Validé — retenues ${formatEuros(retenues)}`,
        "Système"
      ),
    };

    onUpdate(updated);
  };

  const handleActivationContrat = () => {
    if (!canActivateContrat(dossier)) {
      alert(
        "Le contrat ne peut pas être activé tant que le bail n’est pas signé, que l’état des lieux d’entrée n’est pas validé et que le dépôt de garantie n’est pas déclaré comme reçu."
      );
      return;
    }

    const contratReference = `CONTRAT-${String(Date.now()).slice(-6)}`;

    const updated: DepotGarantieDossier = {
      ...dossier,
      statutDepot: "actif",
      statutContrat: "actif",
      contratId: `contrat-${Date.now()}`,
      contratReference,
      historique: addHistorique(
        dossier,
        "Activation du contrat de location",
        "En attente",
        `Actif — ${contratReference}`
      ),
    };

    onUpdate(updated);

    alert(
      "Contrat activé. Le locataire est affecté au bien, le bien passe en occupé et la fiche locataire est mise à jour."
    );
  };

  const handleValidationRestitution = () => {
    if (dossier.etatDesLieuxSortie.statut !== "valide") {
      alert(
        "La restitution ne peut pas être validée tant que l’état des lieux de sortie n’est pas validé."
      );
      return;
    }

    const updatedRestitue: DepotGarantieDossier = {
      ...dossier,
      statutDepot: "cloture",
      statutContrat: "termine",
      dateRestitution,
      montantEffectivementRestitue: montantRestitue,
      commentaireRestitution,
      historique: [
        ...addHistorique(
          dossier,
          "Restitution du dépôt de garantie",
          "À restituer",
          `Restitué — ${formatEuros(montantRestitue)}`
        ),
        {
          id: `hist-cloture-${Date.now()}`,
          date: getToday(),
          heure: getNowTime(),
          utilisateur: "Système",
          action: "Clôture du contrat et du dossier",
          ancienneValeur: "Contrat actif",
          nouvelleValeur: "Contrat terminé — dossier clôturé",
        },
      ],
    };

    onUpdate(updatedRestitue);

    alert(
      "Restitution validée. Le contrat est terminé, le dossier est clôturé, le locataire n’est plus occupant actif et le bien redevient vacant si aucun autre contrat actif n’est associé."
    );
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
        <div className="max-w-6xl mx-auto">
          <button
            onClick={onBack}
            className="text-xs font-bold mb-3 hover:underline"
            style={{ color: "#f97316" }}
          >
            ← Dépôts de garantie
          </button>

          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div
                className="w-14 h-14 rounded-3xl flex items-center justify-center text-2xl shadow"
                style={{ background: "linear-gradient(135deg,#f97316,#fb923c)" }}
              >
                🔐
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl font-black" style={{ color: "#1e293b" }}>
                    {dossier.bail.bienNom}
                  </h1>

                  <StatutDepotBadge statut={dossier.statutDepot} />
                  <StatutContratBadge statut={dossier.statutContrat} />
                </div>

                <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>
                  {dossier.bail.bailReference} · Locataire :{" "}
                  {dossier.bail.locataireNom}
                </p>
              </div>
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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-4">
        {onglet === "synthese" && (
          <>
            <SectionCard>
              <SectionTitle emoji="📋" title="Synthèse du dossier" />

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <InfoRow label="Bail" value={dossier.bail.bailReference} />
                <InfoRow label="Locataire" value={dossier.bail.locataireNom} />
                <InfoRow
                  label="Dépôt de garantie"
                  value={formatEuros(dossier.bail.montantDepotGarantie)}
                />
                <div
                  className="p-3 rounded-2xl"
                  style={{ backgroundColor: "#f8fafc" }}
                >
                  <p className="text-xs font-bold mb-1" style={{ color: "#94a3b8" }}>
                    Statut dépôt
                  </p>
                  <StatutDepotBadge statut={dossier.statutDepot} />
                </div>
              </div>
            </SectionCard>

            <SectionCard>
              <SectionTitle emoji="✅" title="Conditions d’activation" />

              <div className="grid sm:grid-cols-3 gap-3">
                <div
                  className="p-4 rounded-2xl"
                  style={{
                    backgroundColor:
                      dossier.bail.bailStatut === "signe" ? "#f0fdf4" : "#fef2f2",
                  }}
                >
                  <p className="text-sm font-extrabold" style={{ color: "#1e293b" }}>
                    Bail signé
                  </p>
                  <p className="text-xs mt-1" style={{ color: "#94a3b8" }}>
                    {dossier.bail.bailStatut === "signe" ? "Condition remplie" : "Manquant"}
                  </p>
                </div>

                <div
                  className="p-4 rounded-2xl"
                  style={{
                    backgroundColor:
                      dossier.etatDesLieuxEntree.statut === "valide"
                        ? "#f0fdf4"
                        : "#fef2f2",
                  }}
                >
                  <p className="text-sm font-extrabold" style={{ color: "#1e293b" }}>
                    État des lieux d’entrée validé
                  </p>
                  <p className="text-xs mt-1" style={{ color: "#94a3b8" }}>
                    {getStatutEDLLabel(dossier.etatDesLieuxEntree.statut)}
                  </p>
                </div>

                <div
                  className="p-4 rounded-2xl"
                  style={{
                    backgroundColor:
                      dossier.statutDepot === "recu" ||
                      dossier.statutDepot === "actif" ||
                      dossier.statutDepot === "a_restituer" ||
                      dossier.statutDepot === "restitue" ||
                      dossier.statutDepot === "cloture"
                        ? "#f0fdf4"
                        : "#fef2f2",
                  }}
                >
                  <p className="text-sm font-extrabold" style={{ color: "#1e293b" }}>
                    Dépôt reçu
                  </p>
                  <p className="text-xs mt-1" style={{ color: "#94a3b8" }}>
                    {getStatutDepotLabel(dossier.statutDepot)}
                  </p>
                </div>
              </div>
            </SectionCard>
          </>
        )}

        {onglet === "bail" && (
          <SectionCard>
            <SectionTitle emoji="📝" title="Informations récupérées du bail" />

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <InfoRow label="Référence bail" value={dossier.bail.bailReference} />
              <InfoRow label="Type de bail" value={dossier.bail.typeBail} />
              <InfoRow label="Date début" value={dossier.bail.dateDebut} />
              <InfoRow label="Date fin" value={dossier.bail.dateFin} />
              <InfoRow label="Bien" value={dossier.bail.bienNom} />
              <InfoRow label="Référence bien" value={dossier.bail.bienReference} />
              <InfoRow label="Locataire" value={dossier.bail.locataireNom} />
              <InfoRow label="Loyer HC" value={formatEuros(dossier.bail.loyerHC)} />
              <InfoRow label="Charges" value={formatEuros(dossier.bail.charges)} />
              <InfoRow
                label="Total mensuel"
                value={formatEuros(dossier.bail.totalMensuel)}
              />
              <InfoRow
                label="Dépôt de garantie"
                value={formatEuros(dossier.bail.montantDepotGarantie)}
              />
              <InfoRow
                label="Indexation"
                value={`${dossier.bail.indiceReference} · ${dossier.bail.trimestreReference} ${dossier.bail.anneeReference}`}
              />
            </div>

            <div className="flex gap-2 flex-wrap mt-5">
              <button
                onClick={() => onOpenBail(dossier.bail.bailId)}
                className="px-4 py-2 rounded-2xl text-sm font-bold"
                style={{ backgroundColor: "#fff7ed", color: "#f97316" }}
              >
                Ouvrir le bail
              </button>

              <button
                onClick={() => onOpenBien(dossier.bail.bienId)}
                className="px-4 py-2 rounded-2xl text-sm font-bold"
                style={{ backgroundColor: "#eff6ff", color: "#2563eb" }}
              >
                Ouvrir le bien
              </button>

              <button
                onClick={() => onOpenLocataire(dossier.bail.locataireId)}
                className="px-4 py-2 rounded-2xl text-sm font-bold"
                style={{ backgroundColor: "#f3e8ff", color: "#8b5cf6" }}
              >
                Ouvrir le locataire
              </button>
            </div>
          </SectionCard>
        )}

        {onglet === "depot" && (
          <>
            <SectionCard>
              <SectionTitle emoji="🔐" title="Réception du dépôt de garantie" />

              <div className="grid sm:grid-cols-3 gap-4">
                <FormInput
                  label="Montant du dépôt"
                  value={formatEuros(dossier.bail.montantDepotGarantie)}
                  readOnly
                />

                <FormSelect
                  label="Statut"
                  value={dossier.statutDepot}
                  onChange={() => {}}
                  disabled
                  options={[
                    { value: "a_recevoir", label: "À recevoir" },
                    { value: "recu", label: "Reçu" },
                    { value: "actif", label: "Actif" },
                    { value: "a_restituer", label: "À restituer" },
                    { value: "restitue", label: "Restitué" },
                    { value: "cloture", label: "Clôturé" },
                  ]}
                />

                <FormInput
                  label="Date de réception"
                  value={dateReception}
                  onChange={setDateReception}
                  type="date"
                  readOnly={dossier.statutDepot !== "a_recevoir"}
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
                  value={commentaireReception}
                  onChange={event => setCommentaireReception(event.target.value)}
                  disabled={dossier.statutDepot !== "a_recevoir"}
                  rows={3}
                  className="w-full px-4 py-3 rounded-2xl text-sm border outline-none resize-none"
                  style={{
                    borderColor: "#e2e8f0",
                    backgroundColor:
                      dossier.statutDepot !== "a_recevoir" ? "#f8fafc" : "#fff",
                  }}
                />
              </div>

              <button
                onClick={handleReceptionDepot}
                disabled={dossier.statutDepot !== "a_recevoir"}
                className="mt-5 w-full py-3 rounded-2xl text-white text-sm font-extrabold shadow disabled:opacity-50"
                style={{ background: "linear-gradient(135deg,#22c55e,#16a34a)" }}
              >
                ✅ Déclarer le dépôt comme reçu
              </button>
            </SectionCard>
          </>
        )}

        {onglet === "edl" && (
          <>
            <SectionCard>
              <SectionTitle emoji="🧾" title="État des lieux d’entrée" />

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div
                  className="p-3 rounded-2xl"
                  style={{ backgroundColor: "#f8fafc" }}
                >
                  <p className="text-xs font-bold mb-1" style={{ color: "#94a3b8" }}>
                    Statut
                  </p>
                  <StatutEDLBadge statut={dossier.etatDesLieuxEntree.statut} />
                </div>
                <InfoRow
                  label="Date validation"
                  value={dossier.etatDesLieuxEntree.dateValidation || "—"}
                />
                <InfoRow
                  label="Observations"
                  value={dossier.etatDesLieuxEntree.observations || "—"}
                />
                <InfoRow
                  label="Conclusions"
                  value={dossier.etatDesLieuxEntree.conclusions || "—"}
                />
              </div>

              <div className="flex gap-2 flex-wrap mt-5">
                <button
                  onClick={() => onOpenEtatDesLieux("entree")}
                  className="px-4 py-2 rounded-2xl text-sm font-bold"
                  style={{ backgroundColor: "#eff6ff", color: "#2563eb" }}
                >
                  Ouvrir l’état des lieux
                </button>

                <button
                  onClick={handleValidateEDLEntree}
                  disabled={dossier.etatDesLieuxEntree.statut === "valide"}
                  className="px-4 py-2 rounded-2xl text-sm font-bold text-white disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg,#22c55e,#16a34a)" }}
                >
                  Simuler validation entrée
                </button>
              </div>
            </SectionCard>

            <SectionCard>
              <SectionTitle emoji="🚪" title="État des lieux de sortie" />

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div
                  className="p-3 rounded-2xl"
                  style={{ backgroundColor: "#f8fafc" }}
                >
                  <p className="text-xs font-bold mb-1" style={{ color: "#94a3b8" }}>
                    Statut
                  </p>
                  <StatutEDLBadge statut={dossier.etatDesLieuxSortie.statut} />
                </div>
                <InfoRow
                  label="Date validation"
                  value={dossier.etatDesLieuxSortie.dateValidation || "—"}
                />
                <InfoRow
                  label="Conclusions"
                  value={dossier.etatDesLieuxSortie.conclusions || "—"}
                />
                <InfoRow
                  label="Retenues proposées"
                  value={formatEuros(dossier.montantRetenues)}
                />
              </div>

              <div className="flex gap-2 flex-wrap mt-5">
                <button
                  onClick={() => onOpenEtatDesLieux("sortie")}
                  className="px-4 py-2 rounded-2xl text-sm font-bold"
                  style={{ backgroundColor: "#eff6ff", color: "#2563eb" }}
                >
                  Ouvrir l’état des lieux
                </button>

                <button
                  onClick={handleValidateEDLSortie}
                  disabled={
                    dossier.etatDesLieuxSortie.statut === "valide" ||
                    dossier.statutContrat !== "actif"
                  }
                  className="px-4 py-2 rounded-2xl text-sm font-bold text-white disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg,#8b5cf6,#a78bfa)" }}
                >
                  Simuler validation sortie
                </button>
              </div>
            </SectionCard>
          </>
        )}

        {onglet === "activation" && (
          <SectionCard>
            <SectionTitle emoji="✅" title="Activation du contrat de location" />

            <p className="text-sm mb-4" style={{ color: "#64748b" }}>
              Le contrat devient actif uniquement si le bail est signé, l’état des
              lieux d’entrée est validé et le dépôt de garantie est déclaré comme
              reçu.
            </p>

            <div className="grid sm:grid-cols-3 gap-3 mb-5">
              <InfoRow
                label="Bail"
                value={dossier.bail.bailStatut === "signe" ? "Signé" : "Non signé"}
              />
              <InfoRow
                label="État des lieux entrée"
                value={getStatutEDLLabel(dossier.etatDesLieuxEntree.statut)}
              />
              <InfoRow
                label="Dépôt"
                value={getStatutDepotLabel(dossier.statutDepot)}
              />
            </div>

            <button
              onClick={handleActivationContrat}
              disabled={
                dossier.statutContrat !== "en_attente" ||
                dossier.statutDepot !== "recu"
              }
              className="w-full py-3 rounded-2xl text-white text-sm font-extrabold shadow disabled:opacity-50"
              style={{ background: "linear-gradient(135deg,#22c55e,#16a34a)" }}
            >
              ✅ Activer le contrat
            </button>
          </SectionCard>
        )}

        {onglet === "restitution" && (
          <SectionCard>
            <SectionTitle emoji="↩️" title="Restitution du dépôt de garantie" />

            {dossier.etatDesLieuxSortie.statut !== "valide" && (
              <div
                className="p-4 rounded-3xl mb-5"
                style={{
                  backgroundColor: "#fef9c3",
                  border: "1px solid #fde68a",
                }}
              >
                <p className="text-sm font-bold" style={{ color: "#854d0e" }}>
                  La restitution ne peut pas être validée tant que l’état des
                  lieux de sortie n’est pas validé.
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              <InfoRow
                label="Dépôt versé"
                value={formatEuros(dossier.bail.montantDepotGarantie)}
              />
              <InfoRow label="Retenues" value={formatEuros(dossier.montantRetenues)} />
              <InfoRow label="À restituer" value={formatEuros(montantARestituer)} />
              <InfoRow
                label="Conclusion EDL"
                value={dossier.etatDesLieuxSortie.conclusions || "—"}
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <FormInput
                label="Date de restitution"
                value={dateRestitution}
                onChange={setDateRestitution}
                type="date"
              />

              <FormInput
                label="Montant effectivement restitué"
                value={montantRestitue}
                onChange={value => setMontantRestitue(Number(value))}
                type="number"
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
                value={commentaireRestitution}
                onChange={event => setCommentaireRestitution(event.target.value)}
                rows={3}
                className="w-full px-4 py-3 rounded-2xl text-sm border outline-none resize-none"
                style={{ borderColor: "#e2e8f0" }}
              />
            </div>

            <button
              onClick={handleValidationRestitution}
              disabled={
                dossier.etatDesLieuxSortie.statut !== "valide" ||
                dossier.statutDepot === "cloture"
              }
              className="mt-5 w-full py-3 rounded-2xl text-white text-sm font-extrabold shadow disabled:opacity-50"
              style={{ background: "linear-gradient(135deg,#22c55e,#16a34a)" }}
            >
              ✅ Valider la restitution et clôturer
            </button>
          </SectionCard>
        )}

        {onglet === "historique" && (
          <SectionCard>
            <SectionTitle emoji="🕐" title="Historique du dossier" />

            {dossier.historique.length === 0 ? (
              <p className="text-sm text-center py-8" style={{ color: "#94a3b8" }}>
                Aucune action enregistrée.
              </p>
            ) : (
              <div className="space-y-2">
                {dossier.historique.map(item => (
                  <div
                    key={item.id}
                    className="p-3 rounded-2xl"
                    style={{ backgroundColor: "#f8fafc" }}
                  >
                    <div className="flex justify-between gap-3 mb-1 flex-wrap">
                      <p
                        className="text-xs font-extrabold"
                        style={{ color: "#1e293b" }}
                      >
                        {item.action}
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
// MODULE PRINCIPAL
// ============================================================
export default function ModuleDepotGarantie() {
  const [view, setView] = useState<ViewState>({ name: "liste" });
  const [dossiers, setDossiers] =
    useState<DepotGarantieDossier[]>(mockDossiersDepot);

  const selectedDossier = useMemo(() => {
    if (view.name !== "detail") return null;
    return dossiers.find(dossier => dossier.id === view.dossier.id) || view.dossier;
  }, [view, dossiers]);

  const updateDossier = (updated: DepotGarantieDossier) => {
    setDossiers(prev =>
      prev.map(dossier => (dossier.id === updated.id ? updated : dossier))
    );
    setView({ name: "detail", dossier: updated });
  };

  if (view.name === "detail" && selectedDossier) {
    return (
      <VueDetailDepotGarantie
        dossier={selectedDossier}
        onBack={() => setView({ name: "liste" })}
        onUpdate={updateDossier}
        onOpenBail={id => alert(`Navigation vers le module Bail : ${id}`)}
        onOpenBien={id => alert(`Navigation vers le module Bien : ${id}`)}
        onOpenLocataire={id =>
          alert(`Navigation vers le module Locataires : ${id}`)
        }
        onOpenEtatDesLieux={type =>
          alert(`Navigation vers le module États des lieux : ${type}`)
        }
      />
    );
  }

  return (
    <VueListeDepotsGarantie
      dossiers={dossiers}
      onSelect={dossier => setView({ name: "detail", dossier })}
    />
  );
}