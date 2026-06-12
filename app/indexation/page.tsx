"use client";

import { useMemo, useState, type ReactNode } from "react";

// ============================================================
// TYPES
// ============================================================

type StatutContratLocation = "en_attente" | "actif" | "termine";
type StatutBail = "brouillon" | "signe" | "resilie";
type TypeIndice = "IRL";
type TrimestreIRL =
  | "1er trimestre"
  | "2ème trimestre"
  | "3ème trimestre"
  | "4ème trimestre";

type ViewState =
  | { name: "contrats" }
  | { name: "bibliotheque" }
  | { name: "historique_biens" }
  | { name: "historique_annees"; bienId: string }
  | { name: "historique_indexations"; bienId: string; annee: number }
  | { name: "simulation"; contratId: string };

interface BienIndexationSource {
  id: string;
  reference: string;
  nom: string;
  adresse: string;
  loyerActuelHC: number;
  statut: "vacant" | "occupe" | "archive";
}

interface IndiceIRL {
  id: string;
  typeIndice: TypeIndice;
  trimestre: TrimestreIRL;
  annee: number;
  valeur: number;
  datePublication: string;
}

interface ContratIndexable {
  id: string;
  reference: string;
  statutContrat: StatutContratLocation;

  bailId: string;
  bailReference: string;
  bailStatut: StatutBail;

  bienId: string;
  locataireId: string;
  locataireNom: string;

  clauseIndexation: boolean;
  indiceReference: TypeIndice;
  trimestreReference: TrimestreIRL;
  anneeReference: number;

  datePriseEffetBail: string;
  dateAnniversaireRevision: string;
  dateDerniereIndexation?: string;
}

interface HistoriqueIndexationItem {
  id: string;
  date: string;
  heure: string;
  utilisateur: string;
  action: string;
  ancienLoyer: number;
  nouveauLoyer: number;
  ancienIndice: number;
  nouvelIndice: number;
  trimestreReference: TrimestreIRL;
  anneeReference: number;
}

interface IndexationValidee {
  id: string;

  bienId: string;
  bienReferenceSnapshot: string;
  bienNomSnapshot: string;
  bienAdresseSnapshot: string;

  contratId: string;
  contratReference: string;
  bailReference: string;

  locataireId: string;
  locataireNom: string;

  dateValidation: string;
  dateEffet: string;

  ancienLoyer: number;
  nouveauLoyer: number;
  ecartMontant: number;
  ecartPourcentage: number;

  indiceUtilise: TypeIndice;
  ancienIndice: number;
  nouvelIndice: number;
  trimestreReference: TrimestreIRL;
  anneeReference: number;

  prochaineDateRevision: string;
  utilisateur: string;

  historique: HistoriqueIndexationItem[];
}

interface SimulationIndexation {
  contrat: ContratIndexable;
  bien: BienIndexationSource;
  indiceReference: IndiceIRL;
  dernierIndice: IndiceIRL;
  loyerActuel: number;
  nouveauLoyer: number;
  ecartMontant: number;
  ecartPourcentage: number;
  prochaineDateRevision: string;
}

// ============================================================
// MOCK DATA
// ============================================================

const mockBiens: BienIndexationSource[] = [
  {
    id: "bi001",
    reference: "BI-000001",
    nom: "Appartement T2 Centre-ville",
    adresse: "12 Rue Victor Hugo, 69001 Lyon",
    loyerActuelHC: 875,
    statut: "occupe",
  },
  {
    id: "lot001",
    reference: "LOT-000001",
    nom: "Studio République",
    adresse: "8 Avenue Jean Jaurès, 69007 Lyon",
    loyerActuelHC: 700,
    statut: "occupe",
  },
  {
    id: "bi003",
    reference: "BI-000003",
    nom: "Maison Victor Hugo",
    adresse: "22 Boulevard Victor Hugo, 59000 Lille",
    loyerActuelHC: 1000,
    statut: "occupe",
  },
];

const mockContrats: ContratIndexable[] = [
  {
    id: "contrat001",
    reference: "CONTRAT-000001",
    statutContrat: "actif",
    bailId: "bail001",
    bailReference: "BAIL-000001",
    bailStatut: "signe",
    bienId: "bi001",
    locataireId: "loc001",
    locataireNom: "Claire Martin",
    clauseIndexation: true,
    indiceReference: "IRL",
    trimestreReference: "3ème trimestre",
    anneeReference: 2025,
    datePriseEffetBail: "2025-07-01",
    dateAnniversaireRevision: "2026-07-01",
    dateDerniereIndexation: "2026-01-01",
  },
  {
    id: "contrat002",
    reference: "CONTRAT-000002",
    statutContrat: "actif",
    bailId: "bail002",
    bailReference: "BAIL-000002",
    bailStatut: "signe",
    bienId: "lot001",
    locataireId: "loc002",
    locataireNom: "Yanis Bernard",
    clauseIndexation: true,
    indiceReference: "IRL",
    trimestreReference: "4ème trimestre",
    anneeReference: 2025,
    datePriseEffetBail: "2026-03-15",
    dateAnniversaireRevision: "2026-03-15",
  },
  {
    id: "contrat003",
    reference: "CONTRAT-000003",
    statutContrat: "actif",
    bailId: "bail003",
    bailReference: "BAIL-000003",
    bailStatut: "signe",
    bienId: "bi003",
    locataireId: "loc003",
    locataireNom: "Marie Dupont",
    clauseIndexation: false,
    indiceReference: "IRL",
    trimestreReference: "1er trimestre",
    anneeReference: 2025,
    datePriseEffetBail: "2025-01-01",
    dateAnniversaireRevision: "2026-01-01",
  },
];

const mockBibliothequeIRL: IndiceIRL[] = [
  {
    id: "irl001",
    typeIndice: "IRL",
    trimestre: "1er trimestre",
    annee: 2025,
    valeur: 145.47,
    datePublication: "2025-04-15",
  },
  {
    id: "irl002",
    typeIndice: "IRL",
    trimestre: "2ème trimestre",
    annee: 2025,
    valeur: 146.68,
    datePublication: "2025-07-15",
  },
  {
    id: "irl003",
    typeIndice: "IRL",
    trimestre: "3ème trimestre",
    annee: 2025,
    valeur: 147.83,
    datePublication: "2025-10-15",
  },
  {
    id: "irl004",
    typeIndice: "IRL",
    trimestre: "4ème trimestre",
    annee: 2025,
    valeur: 148.12,
    datePublication: "2026-01-15",
  },
  {
    id: "irl005",
    typeIndice: "IRL",
    trimestre: "1er trimestre",
    annee: 2026,
    valeur: 149.03,
    datePublication: "2026-04-15",
  },
];

const mockHistoriqueIndexations: IndexationValidee[] = [
  {
    id: "idxval001",
    bienId: "bi001",
    bienReferenceSnapshot: "BI-000001",
    bienNomSnapshot: "Appartement T2 Centre-ville",
    bienAdresseSnapshot: "12 Rue Victor Hugo, 69001 Lyon",
    contratId: "contrat001",
    contratReference: "CONTRAT-000001",
    bailReference: "BAIL-000001",
    locataireId: "loc001",
    locataireNom: "Claire Martin",
    dateValidation: "2026-01-01",
    dateEffet: "2026-01-01",
    ancienLoyer: 850,
    nouveauLoyer: 875,
    ecartMontant: 25,
    ecartPourcentage: 2.94,
    indiceUtilise: "IRL",
    ancienIndice: 145.47,
    nouvelIndice: 149.03,
    trimestreReference: "1er trimestre",
    anneeReference: 2025,
    prochaineDateRevision: "2027-01-01",
    utilisateur: "Utilisateur connecté",
    historique: [
      {
        id: "hist001",
        date: "2026-01-01",
        heure: "10:20",
        utilisateur: "Utilisateur connecté",
        action:
          "Indexation validée. Le loyer du bien, le contrat, le dépôt de garantie et les futurs quittancements ont été mis à jour.",
        ancienLoyer: 850,
        nouveauLoyer: 875,
        ancienIndice: 145.47,
        nouvelIndice: 149.03,
        trimestreReference: "1er trimestre",
        anneeReference: 2025,
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

function toDate(value: string) {
  return new Date(`${value}T00:00:00`);
}

function formatEuros(value: number) {
  return `${Math.round(value).toLocaleString("fr-FR")} €`;
}

function formatPourcentage(value: number) {
  return `${value.toFixed(2).replace(".", ",")} %`;
}

function addOneYear(dateValue: string) {
  const date = toDate(dateValue);
  date.setFullYear(date.getFullYear() + 1);
  return date.toISOString().slice(0, 10);
}

function findBien(biens: BienIndexationSource[], bienId: string) {
  return biens.find(bien => bien.id === bienId);
}

function findContrat(contrats: ContratIndexable[], contratId: string) {
  return contrats.find(contrat => contrat.id === contratId);
}

function getIndiceReference(
  indices: IndiceIRL[],
  trimestre: TrimestreIRL,
  annee: number
) {
  return indices.find(
    indice => indice.trimestre === trimestre && indice.annee === annee
  );
}

function getDernierIndiceDisponible(indices: IndiceIRL[]) {
  return [...indices].sort((a, b) => {
    const dateDiff =
      toDate(b.datePublication).getTime() - toDate(a.datePublication).getTime();

    if (dateDiff !== 0) return dateDiff;

    return b.valeur - a.valeur;
  })[0];
}

function isContratEligibleAIndexation(contrat: ContratIndexable) {
  return (
    contrat.statutContrat === "actif" &&
    contrat.bailStatut === "signe" &&
    contrat.clauseIndexation === true &&
    contrat.indiceReference === "IRL" &&
    Boolean(contrat.trimestreReference) &&
    Boolean(contrat.anneeReference) &&
    toDate(contrat.dateAnniversaireRevision) <= toDate(getToday())
  );
}

function getMotifNonEligible(contrat: ContratIndexable) {
  if (contrat.statutContrat !== "actif") return "Contrat non actif";
  if (contrat.bailStatut !== "signe") return "Bail non signé";
  if (!contrat.clauseIndexation) return "Aucune clause d’indexation";
  if (contrat.indiceReference !== "IRL") return "Indice non pris en charge";
  if (!contrat.trimestreReference || !contrat.anneeReference)
    return "Référence IRL incomplète";
  if (toDate(contrat.dateAnniversaireRevision) > toDate(getToday()))
    return `Révision possible à partir du ${contrat.dateAnniversaireRevision}`;

  return "Éligible";
}

function calculerSimulationIndexation(
  contrat: ContratIndexable,
  bien: BienIndexationSource,
  indices: IndiceIRL[]
): SimulationIndexation | null {
  const indiceReference = getIndiceReference(
    indices,
    contrat.trimestreReference,
    contrat.anneeReference
  );

  const dernierIndice = getDernierIndiceDisponible(indices);

  if (!indiceReference || !dernierIndice) return null;

  const loyerActuel = bien.loyerActuelHC;
  const nouveauLoyer = Math.round(
    (loyerActuel * dernierIndice.valeur) / indiceReference.valeur
  );

  const ecartMontant = nouveauLoyer - loyerActuel;
  const ecartPourcentage = (ecartMontant / loyerActuel) * 100;

  return {
    contrat,
    bien,
    indiceReference,
    dernierIndice,
    loyerActuel,
    nouveauLoyer,
    ecartMontant,
    ecartPourcentage,
    prochaineDateRevision: addOneYear(contrat.dateAnniversaireRevision),
  };
}

function buildHistoriqueIndexation(
  simulation: SimulationIndexation
): HistoriqueIndexationItem {
  return {
    id: `hist-${Date.now()}`,
    date: getToday(),
    heure: getNowTime(),
    utilisateur: "Utilisateur connecté",
    action:
      "Indexation validée. Le loyer actuel du bien, le contrat de location, le dossier Dépôt de garantie et les futurs quittancements ont été mis à jour.",
    ancienLoyer: simulation.loyerActuel,
    nouveauLoyer: simulation.nouveauLoyer,
    ancienIndice: simulation.indiceReference.valeur,
    nouvelIndice: simulation.dernierIndice.valeur,
    trimestreReference: simulation.contrat.trimestreReference,
    anneeReference: simulation.contrat.anneeReference,
  };
}

function getAnneesHistorique(indexations: IndexationValidee[], bienId: string) {
  return Array.from(
    new Set(
      indexations
        .filter(indexation => indexation.bienId === bienId)
        .map(indexation => Number(indexation.dateValidation.slice(0, 4)))
    )
  ).sort((a, b) => b - a);
}

function getBiensAvecHistorique(
  biens: BienIndexationSource[],
  indexations: IndexationValidee[]
) {
  return biens.filter(bien =>
    indexations.some(indexation => indexation.bienId === bien.id)
  );
}

function getIndexationsPourBienAnnee(
  indexations: IndexationValidee[],
  bienId: string,
  annee: number
) {
  return indexations
    .filter(
      indexation =>
        indexation.bienId === bienId &&
        Number(indexation.dateValidation.slice(0, 4)) === annee
    )
    .sort(
      (a, b) =>
        toDate(b.dateValidation).getTime() - toDate(a.dateValidation).getTime()
    );
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

          {actions}
        </div>
      </div>
    </div>
  );
}

function EligibleBadge({ eligible }: { eligible: boolean }) {
  return (
    <span
      className="px-2 py-0.5 rounded-full text-xs font-bold"
      style={{
        backgroundColor: eligible ? "#dcfce7" : "#f1f5f9",
        color: eligible ? "#166534" : "#64748b",
      }}
    >
      {eligible ? "Éligible" : "Non éligible"}
    </span>
  );
}

function IRLBadge() {
  return (
    <span
      className="px-2 py-0.5 rounded-full text-xs font-bold"
      style={{ backgroundColor: "#dbeafe", color: "#1d4ed8" }}
    >
      IRL
    </span>
  );
}

// ============================================================
// VUE CONTRATS ÉLIGIBLES
// ============================================================

function VueContratsIndexation({
  biens,
  contrats,
  indexations,
  onOpenBibliotheque,
  onOpenHistorique,
  onSimuler,
}: {
  biens: BienIndexationSource[];
  contrats: ContratIndexable[];
  indexations: IndexationValidee[];
  onOpenBibliotheque: () => void;
  onOpenHistorique: () => void;
  onSimuler: (contratId: string) => void;
}) {
  const [recherche, setRecherche] = useState("");

  const contratsAffiches = contrats.filter(contrat => {
    const bien = findBien(biens, contrat.bienId);
    const q = recherche.toLowerCase();

    return (
      contrat.reference.toLowerCase().includes(q) ||
      contrat.locataireNom.toLowerCase().includes(q) ||
      bien?.nom.toLowerCase().includes(q) ||
      bien?.reference.toLowerCase().includes(q)
    );
  });

  const totalEligibles = contrats.filter(isContratEligibleAIndexation).length;

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "#f8fafc", fontFamily: "'Inter', sans-serif" }}
    >
      <PageHeader
        title="📈 Indexation des loyers"
        subtitle="Révisions annuelles des loyers selon l’IRL, avec validation obligatoire du propriétaire."
        actions={
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={onOpenBibliotheque}
              className="px-4 py-2 rounded-2xl text-sm font-bold"
              style={{ backgroundColor: "#eff6ff", color: "#2563eb" }}
            >
              Bibliothèque IRL
            </button>

            <button
              onClick={onOpenHistorique}
              className="px-4 py-2 rounded-2xl text-sm font-bold"
              style={{ backgroundColor: "#f3e8ff", color: "#8b5cf6" }}
            >
              Historique
            </button>
          </div>
        }
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          {[
            {
              emoji: "📄",
              value: contrats.length,
              label: "Contrats analysés",
              bg: "linear-gradient(135deg,#f97316,#fb923c)",
            },
            {
              emoji: "✅",
              value: totalEligibles,
              label: "Éligibles",
              bg: "linear-gradient(135deg,#22c55e,#4ade80)",
            },
            {
              emoji: "📚",
              value: indexations.length,
              label: "Indexations validées",
              bg: "linear-gradient(135deg,#8b5cf6,#a78bfa)",
            },
            {
              emoji: "📊",
              value: "IRL",
              label: "Indice utilisé",
              bg: "linear-gradient(135deg,#3b82f6,#60a5fa)",
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
          placeholder="Rechercher un contrat, un bien ou un locataire..."
          className="w-full px-4 py-3 rounded-2xl text-sm border outline-none mb-5"
          style={{ borderColor: "#e2e8f0", backgroundColor: "#fff" }}
        />

        <div className="space-y-3">
          {contratsAffiches.map(contrat => {
            const bien = findBien(biens, contrat.bienId);
            const eligible = isContratEligibleAIndexation(contrat);
            const motif = getMotifNonEligible(contrat);

            return (
              <div key={contrat.id} className="bg-white rounded-3xl p-4 shadow-sm">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl"
                      style={{
                        background: "linear-gradient(135deg,#f97316,#fb923c)",
                      }}
                    >
                      📈
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p
                          className="font-extrabold text-sm"
                          style={{ color: "#1e293b" }}
                        >
                          {bien?.nom || "Bien non trouvé"}
                        </p>

                        <EligibleBadge eligible={eligible} />
                        <IRLBadge />
                      </div>

                      <p className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>
                        {contrat.reference} · {contrat.locataireNom}
                      </p>

                      <p className="text-xs mt-0.5" style={{ color: "#cbd5e1" }}>
                        Prochaine révision : {contrat.dateAnniversaireRevision} ·{" "}
                        {motif}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p
                      className="text-sm font-extrabold"
                      style={{ color: "#f97316" }}
                    >
                      {formatEuros(bien?.loyerActuelHC || 0)}
                    </p>
                    <p className="text-xs" style={{ color: "#94a3b8" }}>
                      Loyer actuel
                    </p>

                    <button
                      onClick={() => onSimuler(contrat.id)}
                      disabled={!eligible}
                      className="mt-2 px-4 py-2 rounded-2xl text-xs font-bold disabled:opacity-50"
                      style={{
                        backgroundColor: eligible ? "#fff7ed" : "#f1f5f9",
                        color: eligible ? "#f97316" : "#94a3b8",
                      }}
                    >
                      Simuler l’indexation
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// VUE BIBLIOTHÈQUE IRL
// ============================================================

function VueBibliothequeIRL({
  indices,
  onBack,
}: {
  indices: IndiceIRL[];
  onBack: () => void;
}) {
  const indicesTries = [...indices].sort((a, b) => {
    if (b.annee !== a.annee) return b.annee - a.annee;
    return b.datePublication.localeCompare(a.datePublication);
  });

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "#f8fafc", fontFamily: "'Inter', sans-serif" }}
    >
      <PageHeader
        title="📚 Bibliothèque des indices IRL"
        subtitle="Indices officiels administrés par la plateforme. Les utilisateurs ne peuvent pas les modifier."
        onBack={onBack}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5">
        <SectionCard>
          <SectionTitle emoji="📊" title="Historique des indices IRL" />

          <div className="space-y-3">
            {indicesTries.map(indice => (
              <div
                key={indice.id}
                className="p-4 rounded-3xl flex items-center justify-between gap-4 flex-wrap"
                style={{ backgroundColor: "#f8fafc" }}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <IRLBadge />
                    <p className="text-sm font-extrabold" style={{ color: "#1e293b" }}>
                      {indice.trimestre} {indice.annee}
                    </p>
                  </div>

                  <p className="text-xs mt-1" style={{ color: "#94a3b8" }}>
                    Date de publication : {indice.datePublication}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-xl font-black" style={{ color: "#f97316" }}>
                    {indice.valeur}
                  </p>
                  <p className="text-xs" style={{ color: "#94a3b8" }}>
                    Valeur publiée
                  </p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

// ============================================================
// VUE SIMULATION / VALIDATION
// ============================================================

function VueSimulationIndexation({
  simulation,
  onBack,
  onValidate,
}: {
  simulation: SimulationIndexation;
  onBack: () => void;
  onValidate: (simulation: SimulationIndexation) => void;
}) {
  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "#f8fafc", fontFamily: "'Inter', sans-serif" }}
    >
      <PageHeader
        title="🧮 Simulation d’indexation"
        subtitle={`${simulation.bien.nom} · ${simulation.contrat.reference} · ${simulation.contrat.locataireNom}`}
        onBack={onBack}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 space-y-4">
        <SectionCard>
          <SectionTitle emoji="📌" title="Données contractuelles" />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <InfoRow label="Bien" value={simulation.bien.nom} />
            <InfoRow label="Contrat" value={simulation.contrat.reference} />
            <InfoRow label="Bail" value={simulation.contrat.bailReference} />
            <InfoRow label="Locataire" value={simulation.contrat.locataireNom} />
            <InfoRow
              label="Date anniversaire"
              value={simulation.contrat.dateAnniversaireRevision}
            />
            <InfoRow
              label="Prochaine date après validation"
              value={simulation.prochaineDateRevision}
            />
            <InfoRow
              label="Trimestre référence"
              value={simulation.contrat.trimestreReference}
            />
            <InfoRow
              label="Année référence"
              value={simulation.contrat.anneeReference}
            />
          </div>
        </SectionCard>

        <SectionCard>
          <SectionTitle emoji="📊" title="Calcul IRL" />

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <InfoRow
              label="Loyer actuel"
              value={formatEuros(simulation.loyerActuel)}
            />
            <InfoRow
              label="Indice de référence"
              value={simulation.indiceReference.valeur}
            />
            <InfoRow
              label="Dernier indice disponible"
              value={simulation.dernierIndice.valeur}
            />
            <InfoRow
              label="Écart"
              value={formatEuros(simulation.ecartMontant)}
            />
            <InfoRow
              label="Nouveau loyer"
              value={formatEuros(simulation.nouveauLoyer)}
            />
          </div>

          <div
            className="mt-4 p-4 rounded-3xl"
            style={{ backgroundColor: "#fff7ed", border: "1px solid #fed7aa" }}
          >
            <p className="text-sm font-bold" style={{ color: "#9a3412" }}>
              Formule appliquée : loyer actuel × dernier indice IRL disponible ÷
              indice de référence. Le calcul utilise le loyer actuellement
              enregistré dans le module Biens, et non le loyer initial du bail.
            </p>
          </div>
        </SectionCard>

        <SectionCard>
          <SectionTitle emoji="✅" title="Validation propriétaire" />

          <p className="text-sm mb-4" style={{ color: "#64748b" }}>
            Tant que vous ne validez pas, aucune donnée n’est modifiée. Après
            validation, le nouveau loyer mettra à jour le module Biens, le contrat
            de location, le dossier Dépôt de garantie et les futurs quittancements.
            La date anniversaire de révision sera automatiquement reportée à
            l’année suivante.
          </p>

          <button
            onClick={() => onValidate(simulation)}
            className="w-full py-3 rounded-2xl text-white text-sm font-extrabold shadow"
            style={{ background: "linear-gradient(135deg,#22c55e,#16a34a)" }}
          >
            ✅ Valider l’indexation
          </button>
        </SectionCard>
      </div>
    </div>
  );
}

// ============================================================
// HISTORIQUE — BIENS
// ============================================================

function VueHistoriqueBiens({
  biens,
  indexations,
  onBack,
  onSelectBien,
}: {
  biens: BienIndexationSource[];
  indexations: IndexationValidee[];
  onBack: () => void;
  onSelectBien: (bienId: string) => void;
}) {
  const biensAvecHistorique = getBiensAvecHistorique(biens, indexations);

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "#f8fafc", fontFamily: "'Inter', sans-serif" }}
    >
      <PageHeader
        title="📚 Historique des indexations"
        subtitle="Historique organisé par bien, puis par année."
        onBack={onBack}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5">
        <SectionCard>
          <SectionTitle emoji="🏠" title="Biens avec indexations" />

          {biensAvecHistorique.length === 0 ? (
            <p className="text-sm text-center py-8" style={{ color: "#94a3b8" }}>
              Aucune indexation validée pour le moment.
            </p>
          ) : (
            <div className="space-y-3">
              {biensAvecHistorique.map(bien => {
                const indexationsBien = indexations.filter(
                  indexation => indexation.bienId === bien.id
                );

                return (
                  <button
                    key={bien.id}
                    onClick={() => onSelectBien(bien.id)}
                    className="w-full p-4 rounded-3xl text-left transition hover:shadow-md"
                    style={{ backgroundColor: "#f8fafc" }}
                  >
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div>
                        <p
                          className="text-sm font-extrabold"
                          style={{ color: "#1e293b" }}
                        >
                          {bien.nom}
                        </p>

                        <p className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>
                          {bien.reference} · {bien.adresse}
                        </p>
                      </div>

                      <div className="text-right">
                        <p
                          className="text-sm font-extrabold"
                          style={{ color: "#f97316" }}
                        >
                          {indexationsBien.length}
                        </p>
                        <p className="text-xs" style={{ color: "#94a3b8" }}>
                          indexation(s)
                        </p>
                      </div>
                    </div>
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
// HISTORIQUE — ANNÉES
// ============================================================

function VueHistoriqueAnnees({
  bien,
  indexations,
  onBack,
  onSelectAnnee,
}: {
  bien: BienIndexationSource;
  indexations: IndexationValidee[];
  onBack: () => void;
  onSelectAnnee: (annee: number) => void;
}) {
  const annees = getAnneesHistorique(indexations, bien.id);

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "#f8fafc", fontFamily: "'Inter', sans-serif" }}
    >
      <PageHeader
        title={`🏠 ${bien.nom}`}
        subtitle="Années d’indexation disponibles"
        onBack={onBack}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5">
        <SectionCard>
          <SectionTitle emoji="📅" title="Années" />

          <div className="grid sm:grid-cols-3 gap-3">
            {annees.map(annee => {
              const indexationsAnnee = getIndexationsPourBienAnnee(
                indexations,
                bien.id,
                annee
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
                    {indexationsAnnee.length} indexation(s)
                  </p>
                </button>
              );
            })}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

// ============================================================
// HISTORIQUE — INDEXATIONS
// ============================================================

function VueHistoriqueIndexations({
  bien,
  annee,
  indexations,
  onBack,
}: {
  bien: BienIndexationSource;
  annee: number;
  indexations: IndexationValidee[];
  onBack: () => void;
}) {
  const indexationsAnnee = getIndexationsPourBienAnnee(
    indexations,
    bien.id,
    annee
  );

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "#f8fafc", fontFamily: "'Inter', sans-serif" }}
    >
      <PageHeader
        title={`📈 ${bien.nom} — ${annee}`}
        subtitle="Indexations validées"
        onBack={onBack}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5">
        <SectionCard>
          <SectionTitle emoji="📚" title="Révisions réalisées" />

          <div className="space-y-3">
            {indexationsAnnee.map(indexation => (
              <div
                key={indexation.id}
                className="p-4 rounded-3xl"
                style={{ backgroundColor: "#f8fafc" }}
              >
                <div className="flex justify-between gap-4 flex-wrap">
                  <div>
                    <p
                      className="text-sm font-extrabold"
                      style={{ color: "#1e293b" }}
                    >
                      Indexation du {indexation.dateValidation}
                    </p>

                    <p className="text-xs mt-1" style={{ color: "#94a3b8" }}>
                      {indexation.contratReference} · {indexation.locataireNom}
                    </p>

                    <p className="text-xs mt-0.5" style={{ color: "#cbd5e1" }}>
                      IRL {indexation.trimestreReference} {indexation.anneeReference}
                    </p>
                  </div>

                  <div className="text-right">
                    <p
                      className="text-sm font-extrabold"
                      style={{ color: "#f97316" }}
                    >
                      {formatEuros(indexation.ancienLoyer)} →{" "}
                      {formatEuros(indexation.nouveauLoyer)}
                    </p>

                    <p className="text-xs" style={{ color: "#94a3b8" }}>
                      Écart : {formatEuros(indexation.ecartMontant)} ·{" "}
                      {formatPourcentage(indexation.ecartPourcentage)}
                    </p>

                    <p className="text-xs mt-1" style={{ color: "#94a3b8" }}>
                      Prochaine révision : {indexation.prochaineDateRevision}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

// ============================================================
// MODULE PRINCIPAL
// ============================================================

export default function ModuleIndexationLoyers() {
  const [view, setView] = useState<ViewState>({ name: "contrats" });
  const [biens, setBiens] = useState<BienIndexationSource[]>(mockBiens);
  const [contrats, setContrats] = useState<ContratIndexable[]>(mockContrats);
  const [indexations, setIndexations] = useState<IndexationValidee[]>(
    mockHistoriqueIndexations
  );

  const simulation = useMemo(() => {
    if (view.name !== "simulation") return null;

    const contrat = findContrat(contrats, view.contratId);
    if (!contrat) return null;

    const bien = findBien(biens, contrat.bienId);
    if (!bien) return null;

    return calculerSimulationIndexation(contrat, bien, mockBibliothequeIRL);
  }, [view, contrats, biens]);

  const handleValidateIndexation = (simulationValue: SimulationIndexation) => {
    const historiqueItem = buildHistoriqueIndexation(simulationValue);

    const nouvelleIndexation: IndexationValidee = {
      id: `idxval-${Date.now()}`,

      bienId: simulationValue.bien.id,
      bienReferenceSnapshot: simulationValue.bien.reference,
      bienNomSnapshot: simulationValue.bien.nom,
      bienAdresseSnapshot: simulationValue.bien.adresse,

      contratId: simulationValue.contrat.id,
      contratReference: simulationValue.contrat.reference,
      bailReference: simulationValue.contrat.bailReference,

      locataireId: simulationValue.contrat.locataireId,
      locataireNom: simulationValue.contrat.locataireNom,

      dateValidation: getToday(),
      dateEffet: simulationValue.contrat.dateAnniversaireRevision,

      ancienLoyer: simulationValue.loyerActuel,
      nouveauLoyer: simulationValue.nouveauLoyer,
      ecartMontant: simulationValue.ecartMontant,
      ecartPourcentage: simulationValue.ecartPourcentage,

      indiceUtilise: "IRL",
      ancienIndice: simulationValue.indiceReference.valeur,
      nouvelIndice: simulationValue.dernierIndice.valeur,
      trimestreReference: simulationValue.contrat.trimestreReference,
      anneeReference: simulationValue.contrat.anneeReference,

      prochaineDateRevision: simulationValue.prochaineDateRevision,
      utilisateur: "Utilisateur connecté",

      historique: [historiqueItem],
    };

    setIndexations(prev => [...prev, nouvelleIndexation]);

    setBiens(prev =>
      prev.map(bien =>
        bien.id === simulationValue.bien.id
          ? {
              ...bien,
              loyerActuelHC: simulationValue.nouveauLoyer,
            }
          : bien
      )
    );

    setContrats(prev =>
      prev.map(contrat =>
        contrat.id === simulationValue.contrat.id
          ? {
              ...contrat,
              dateDerniereIndexation: getToday(),
              dateAnniversaireRevision: simulationValue.prochaineDateRevision,
              anneeReference: simulationValue.dernierIndice.annee,
              trimestreReference: simulationValue.dernierIndice.trimestre,
            }
          : contrat
      )
    );

    setView({ name: "contrats" });

    alert(
      "Indexation validée. Le loyer du module Biens, le contrat de location, le dossier Dépôt de garantie et les futurs quittancements ont été mis à jour. La prochaine date de révision a été reportée à l’année suivante."
    );
  };

  if (view.name === "bibliotheque") {
    return (
      <VueBibliothequeIRL
        indices={mockBibliothequeIRL}
        onBack={() => setView({ name: "contrats" })}
      />
    );
  }

  if (view.name === "simulation" && simulation) {
    return (
      <VueSimulationIndexation
        simulation={simulation}
        onBack={() => setView({ name: "contrats" })}
        onValidate={handleValidateIndexation}
      />
    );
  }

  if (view.name === "historique_biens") {
    return (
      <VueHistoriqueBiens
        biens={biens}
        indexations={indexations}
        onBack={() => setView({ name: "contrats" })}
        onSelectBien={bienId => setView({ name: "historique_annees", bienId })}
      />
    );
  }

  if (view.name === "historique_annees") {
    const bien = findBien(biens, view.bienId);

    if (!bien) {
      return (
        <VueHistoriqueBiens
          biens={biens}
          indexations={indexations}
          onBack={() => setView({ name: "contrats" })}
          onSelectBien={bienId => setView({ name: "historique_annees", bienId })}
        />
      );
    }

    return (
      <VueHistoriqueAnnees
        bien={bien}
        indexations={indexations}
        onBack={() => setView({ name: "historique_biens" })}
        onSelectAnnee={annee =>
          setView({ name: "historique_indexations", bienId: bien.id, annee })
        }
      />
    );
  }

  if (view.name === "historique_indexations") {
    const bien = findBien(biens, view.bienId);

    if (!bien) {
      return (
        <VueHistoriqueBiens
          biens={biens}
          indexations={indexations}
          onBack={() => setView({ name: "contrats" })}
          onSelectBien={bienId => setView({ name: "historique_annees", bienId })}
        />
      );
    }

    return (
      <VueHistoriqueIndexations
        bien={bien}
        annee={view.annee}
        indexations={indexations}
        onBack={() => setView({ name: "historique_annees", bienId: bien.id })}
      />
    );
  }

  return (
    <VueContratsIndexation
      biens={biens}
      contrats={contrats}
      indexations={indexations}
      onOpenBibliotheque={() => setView({ name: "bibliotheque" })}
      onOpenHistorique={() => setView({ name: "historique_biens" })}
      onSimuler={contratId => setView({ name: "simulation", contratId })}
    />
  );
}