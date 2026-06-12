"use client";

import { useMemo, useState, type ReactNode } from "react";

// ============================================================
// TYPES
// ============================================================

type StatutEtatDesLieux =
  | "aucun"
  | "entree_validee"
  | "sortie_validee";

type EtatPiece = "parfait" | "correct" | "moyen" | "vetuste";

type TypeEtatDesLieux = "entree" | "sortie";

type StatutContratLocation = "actif" | "termine" | "en_attente";

type DecisionDepotGarantie =
  | "restitution_integrale"
  | "restitution_partielle"
  | "aucune_restitution";

type ViewState =
  | { name: "liste" }
  | { name: "dossier"; dossierId: string }
  | { name: "form_entree"; dossierId: string }
  | { name: "form_sortie"; dossierId: string };

interface DossierEtatDesLieux {
  id: string;
  bienId: string;
  bienReference: string;
  bienNom: string;
  bienAdresse: string;

  locataireId: string;
  locataireNom: string;

  bailId: string;
  bailReference: string;
  bailSigne: boolean;
  dateDebutBail: string;

  contratId: string;
  contratReference: string;
  contratCree: boolean;
  statutContrat: StatutContratLocation;

  depotGarantieMontant: number;

  statutEtatDesLieux: StatutEtatDesLieux;

  etatDesLieuxEntree?: EtatDesLieuxArchive;
  etatDesLieuxSortie?: EtatDesLieuxArchive;
}

interface PieceEtatDesLieux {
  id: string;
  nom: string;
  etatGeneral: EtatPiece;
  observations: string;
  photos: PhotoEtatDesLieux[];
}

interface PhotoEtatDesLieux {
  id: string;
  nom: string;
  format: "jpg" | "jpeg" | "png" | "heic";
  urlPreview: string;
}

interface EtatDesLieuxArchive {
  id: string;
  type: TypeEtatDesLieux;
  reference: string;
  dateValidation: string;
  statut: "valide";
  pieces: PieceEtatDesLieux[];
  decisionDepotGarantie?: DecisionDepotGarantie;
  montantRetenu?: number;
}

interface HistoriqueEDL {
  id: string;
  dossierId: string;
  date: string;
  heure: string;
  utilisateur: string;
  action: string;
}

interface FormPieceDraft {
  id: string;
  nom: string;
  etatGeneral: EtatPiece;
  observations: string;
  photos: PhotoEtatDesLieux[];
}

// ============================================================
// MOCK API DATA
// ============================================================

const dossiersMock: DossierEtatDesLieux[] = [
  {
    id: "edl-dossier-001",
    bienId: "bi001",
    bienReference: "BI-000001",
    bienNom: "Appartement T2 Centre-ville",
    bienAdresse: "12 Rue Victor Hugo, 69001 Lyon",
    locataireId: "loc001",
    locataireNom: "Claire Martin",
    bailId: "bail001",
    bailReference: "BAIL-000001",
    bailSigne: true,
    dateDebutBail: "2026-01-01",
    contratId: "contrat001",
    contratReference: "CONTRAT-000001",
    contratCree: true,
    statutContrat: "actif",
    depotGarantieMontant: 850,
    statutEtatDesLieux: "aucun",
  },
  {
    id: "edl-dossier-002",
    bienId: "lot001",
    bienReference: "LOT-000001",
    bienNom: "Studio République",
    bienAdresse: "8 Avenue Jean Jaurès, 69007 Lyon",
    locataireId: "loc002",
    locataireNom: "Yanis Bernard",
    bailId: "bail002",
    bailReference: "BAIL-000002",
    bailSigne: true,
    dateDebutBail: "2026-03-15",
    contratId: "contrat002",
    contratReference: "CONTRAT-000002",
    contratCree: true,
    statutContrat: "actif",
    depotGarantieMontant: 700,
    statutEtatDesLieux: "entree_validee",
    etatDesLieuxEntree: {
      id: "edl-entree-002",
      type: "entree",
      reference: "EDL-E-2026-000002",
      dateValidation: "2026-03-15",
      statut: "valide",
      pieces: [
        {
          id: "piece-001",
          nom: "Pièce principale",
          etatGeneral: "correct",
          observations: "Murs propres. Sol en bon état général.",
          photos: [
            {
              id: "photo-001",
              nom: "piece_principale_entree.jpg",
              format: "jpg",
              urlPreview: "photo",
            },
          ],
        },
        {
          id: "piece-002",
          nom: "Salle de bains",
          etatGeneral: "moyen",
          observations: "Joint de douche légèrement usé.",
          photos: [
            {
              id: "photo-002",
              nom: "sdb_entree.png",
              format: "png",
              urlPreview: "photo",
            },
          ],
        },
      ],
    },
  },
  {
    id: "edl-dossier-003",
    bienId: "bi003",
    bienReference: "BI-000003",
    bienNom: "Maison Victor Hugo",
    bienAdresse: "22 Boulevard Victor Hugo, 59000 Lille",
    locataireId: "loc003",
    locataireNom: "Marie Dupont",
    bailId: "bail003",
    bailReference: "BAIL-000003",
    bailSigne: true,
    dateDebutBail: "2025-09-01",
    contratId: "contrat003",
    contratReference: "CONTRAT-000003",
    contratCree: true,
    statutContrat: "actif",
    depotGarantieMontant: 1200,
    statutEtatDesLieux: "sortie_validee",
    etatDesLieuxEntree: {
      id: "edl-entree-003",
      type: "entree",
      reference: "EDL-E-2025-000003",
      dateValidation: "2025-09-01",
      statut: "valide",
      pieces: [
        {
          id: "piece-003",
          nom: "Salon",
          etatGeneral: "correct",
          observations: "État satisfaisant.",
          photos: [
            {
              id: "photo-003",
              nom: "salon_entree.jpg",
              format: "jpg",
              urlPreview: "photo",
            },
          ],
        },
      ],
    },
    etatDesLieuxSortie: {
      id: "edl-sortie-003",
      type: "sortie",
      reference: "EDL-S-2026-000003",
      dateValidation: "2026-05-30",
      statut: "valide",
      decisionDepotGarantie: "restitution_partielle",
      montantRetenu: 200,
      pieces: [
        {
          id: "piece-004",
          nom: "Salon",
          etatGeneral: "moyen",
          observations: "Traces sur un mur. Photos ajoutées.",
          photos: [
            {
              id: "photo-004",
              nom: "salon_sortie.jpg",
              format: "jpg",
              urlPreview: "photo",
            },
          ],
        },
      ],
    },
  },
];

const historiqueMock: HistoriqueEDL[] = [
  {
    id: "hist-001",
    dossierId: "edl-dossier-002",
    date: "2026-03-15",
    heure: "10:00",
    utilisateur: "Utilisateur connecté",
    action: "État des lieux d’entrée validé",
  },
  {
    id: "hist-002",
    dossierId: "edl-dossier-003",
    date: "2025-09-01",
    heure: "09:30",
    utilisateur: "Utilisateur connecté",
    action: "État des lieux d’entrée validé",
  },
  {
    id: "hist-003",
    dossierId: "edl-dossier-003",
    date: "2026-05-30",
    heure: "16:20",
    utilisateur: "Utilisateur connecté",
    action: "État des lieux de sortie validé",
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

function getEtatPieceLabel(etat: EtatPiece) {
  const labels: Record<EtatPiece, string> = {
    parfait: "Parfait",
    correct: "Correct",
    moyen: "Moyen",
    vetuste: "Vétuste",
  };

  return labels[etat];
}

function getStatutEDLLabel(statut: StatutEtatDesLieux) {
  const labels: Record<StatutEtatDesLieux, string> = {
    aucun: "Aucun état des lieux",
    entree_validee: "État des lieux d’entrée validé",
    sortie_validee: "État des lieux de sortie validé",
  };

  return labels[statut];
}

function getDecisionDepotLabel(decision?: DecisionDepotGarantie) {
  if (!decision) return "—";

  const labels: Record<DecisionDepotGarantie, string> = {
    restitution_integrale: "Restitution intégrale",
    restitution_partielle: "Restitution partielle",
    aucune_restitution: "Aucune restitution",
  };

  return labels[decision];
}

function getStatutTone(statut: StatutEtatDesLieux): "gray" | "green" | "blue" {
  if (statut === "aucun") return "gray";
  if (statut === "entree_validee") return "blue";
  return "green";
}

function canCreateEntree(dossier: DossierEtatDesLieux) {
  return !dossier.etatDesLieuxEntree;
}

function canCreateSortie(dossier: DossierEtatDesLieux) {
  return Boolean(dossier.etatDesLieuxEntree) && dossier.statutContrat === "actif" && !dossier.etatDesLieuxSortie;
}

function buildPhotoFromFilename(filename: string): PhotoEtatDesLieux | null {
  const extension = filename.split(".").pop()?.toLowerCase();

  if (!extension || !["jpg", "jpeg", "png", "heic"].includes(extension)) {
    return null;
  }

  return {
    id: `photo-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    nom: filename,
    format: extension as PhotoEtatDesLieux["format"],
    urlPreview: "photo",
  };
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

function PhotoChip({ photo }: { photo: PhotoEtatDesLieux }) {
  return (
    <div
      className="px-3 py-2 rounded-2xl text-xs font-bold flex items-center gap-2"
      style={{ backgroundColor: "#f1f5f9", color: "#64748b" }}
    >
      📷 {photo.nom}
    </div>
  );
}

// ============================================================
// LISTE PRINCIPALE
// ============================================================

function VueListeDossiers({
  dossiers,
  onOpen,
}: {
  dossiers: DossierEtatDesLieux[];
  onOpen: (dossierId: string) => void;
}) {
  const [recherche, setRecherche] = useState("");

  const dossiersAffiches = dossiers.filter(dossier => {
    const q = recherche.toLowerCase();

    return (
      dossier.bienNom.toLowerCase().includes(q) ||
      dossier.bienAdresse.toLowerCase().includes(q) ||
      dossier.locataireNom.toLowerCase().includes(q) ||
      dossier.bienReference.toLowerCase().includes(q)
    );
  });

  const totalAucun = dossiers.filter(d => d.statutEtatDesLieux === "aucun").length;
  const totalEntree = dossiers.filter(d => d.statutEtatDesLieux === "entree_validee").length;
  const totalSortie = dossiers.filter(d => d.statutEtatDesLieux === "sortie_validee").length;

  return (
    <PageShell>
      <PageHeader
        title="📝 États des lieux"
        subtitle="Biens éligibles, états des lieux d’entrée, états des lieux de sortie, archives et transmission au dépôt de garantie."
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <StatCard
            emoji="🏠"
            value={dossiers.length}
            label="Biens éligibles"
            gradient="linear-gradient(135deg,#f97316,#fb923c)"
          />
          <StatCard
            emoji="🕐"
            value={totalAucun}
            label="À réaliser"
            gradient="linear-gradient(135deg,#22c55e,#4ade80)"
          />
          <StatCard
            emoji="📥"
            value={totalEntree}
            label="Entrées validées"
            gradient="linear-gradient(135deg,#8b5cf6,#a78bfa)"
          />
          <StatCard
            emoji="📤"
            value={totalSortie}
            label="Sorties validées"
            gradient="linear-gradient(135deg,#3b82f6,#60a5fa)"
          />
        </div>

        <input
          value={recherche}
          onChange={event => setRecherche(event.target.value)}
          placeholder="Rechercher un bien, une adresse ou un locataire..."
          className="w-full px-5 py-4 rounded-[1.5rem] text-sm sm:text-base border outline-none mb-8 bg-white"
          style={{
            borderColor: "#e2e8f0",
            color: "#1e293b",
          }}
        />

        <div className="space-y-4">
          {dossiersAffiches.map(dossier => (
            <button
              key={dossier.id}
              onClick={() => onOpen(dossier.id)}
              className="w-full bg-white rounded-[2rem] p-5 shadow-sm hover:shadow-md transition text-left"
            >
              <div className="flex items-center justify-between gap-5 flex-wrap">
                <div className="flex items-center gap-4">
                  <div
                    className="w-14 h-14 rounded-3xl flex items-center justify-center text-2xl"
                    style={{
                      background: "linear-gradient(135deg,#f97316,#fb923c)",
                    }}
                  >
                    🏠
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-base font-black" style={{ color: "#1e293b" }}>
                        {dossier.bienNom}
                      </p>

                      <StatusBadge tone={getStatutTone(dossier.statutEtatDesLieux)}>
                        {getStatutEDLLabel(dossier.statutEtatDesLieux)}
                      </StatusBadge>
                    </div>

                    <p className="text-xs sm:text-sm mt-1" style={{ color: "#94a3b8" }}>
                      {dossier.bienReference} · {dossier.bienAdresse}
                    </p>

                    <p className="text-xs mt-1" style={{ color: "#cbd5e1" }}>
                      {dossier.locataireNom} · Bail au {dossier.dateDebutBail}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-sm font-black" style={{ color: "#f97316" }}>
                    Consulter
                  </p>
                  <p className="text-xs mt-1" style={{ color: "#94a3b8" }}>
                    {dossier.contratReference}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </main>
    </PageShell>
  );
}

// ============================================================
// DOSSIER
// ============================================================

function VueDossier({
  dossier,
  historique,
  onBack,
  onStartEntree,
  onStartSortie,
}: {
  dossier: DossierEtatDesLieux;
  historique: HistoriqueEDL[];
  onBack: () => void;
  onStartEntree: () => void;
  onStartSortie: () => void;
}) {
  return (
    <PageShell>
      <PageHeader
        title={`📝 ${dossier.bienNom}`}
        subtitle={`${dossier.bienReference} · ${dossier.bienAdresse}`}
        onBack={onBack}
        actions={
          <>
            <ActionButton
              onClick={onStartEntree}
              variant="orange"
              disabled={!canCreateEntree(dossier)}
            >
              Effectuer l’entrée
            </ActionButton>

            <ActionButton
              onClick={onStartSortie}
              variant="purple"
              disabled={!canCreateSortie(dossier)}
            >
              Effectuer la sortie
            </ActionButton>
          </>
        }
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-5">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            emoji="📄"
            value={dossier.bailReference}
            label="Bail signé"
            gradient="linear-gradient(135deg,#f97316,#fb923c)"
          />
          <StatCard
            emoji="🔐"
            value={formatEuros(dossier.depotGarantieMontant)}
            label="Dépôt de garantie"
            gradient="linear-gradient(135deg,#22c55e,#4ade80)"
          />
          <StatCard
            emoji="📥"
            value={dossier.etatDesLieuxEntree ? "Oui" : "Non"}
            label="Entrée validée"
            gradient="linear-gradient(135deg,#8b5cf6,#a78bfa)"
          />
          <StatCard
            emoji="📤"
            value={dossier.etatDesLieuxSortie ? "Oui" : "Non"}
            label="Sortie validée"
            gradient="linear-gradient(135deg,#3b82f6,#60a5fa)"
          />
        </div>

        <SectionCard>
          <SectionTitle emoji="📌" title="Informations du dossier" />

          <div className="grid sm:grid-cols-4 gap-3">
            <InfoRow label="Locataire" value={dossier.locataireNom} />
            <InfoRow label="Date début bail" value={dossier.dateDebutBail} />
            <InfoRow label="Contrat" value={dossier.contratReference} />
            <InfoRow label="Statut contrat" value={dossier.statutContrat} />
          </div>
        </SectionCard>

        <SectionCard>
          <SectionTitle emoji="📥" title="État des lieux d’entrée archivé" />

          {!dossier.etatDesLieuxEntree ? (
            <p className="text-sm py-4" style={{ color: "#94a3b8" }}>
              Aucun état des lieux d’entrée validé.
            </p>
          ) : (
            <ArchiveEDL archive={dossier.etatDesLieuxEntree} />
          )}
        </SectionCard>

        <SectionCard>
          <SectionTitle emoji="📤" title="État des lieux de sortie archivé" />

          {!dossier.etatDesLieuxSortie ? (
            <p className="text-sm py-4" style={{ color: "#94a3b8" }}>
              Aucun état des lieux de sortie validé.
            </p>
          ) : (
            <ArchiveEDL
              archive={dossier.etatDesLieuxSortie}
              entree={dossier.etatDesLieuxEntree}
            />
          )}
        </SectionCard>

        <SectionCard>
          <SectionTitle emoji="🕐" title="Historique API" />

          {historique.length === 0 ? (
            <p className="text-sm py-4" style={{ color: "#94a3b8" }}>
              Aucun historique pour le moment.
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
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </main>
    </PageShell>
  );
}

// ============================================================
// ARCHIVE
// ============================================================

function ArchiveEDL({
  archive,
  entree,
}: {
  archive: EtatDesLieuxArchive;
  entree?: EtatDesLieuxArchive;
}) {
  return (
    <div className="space-y-3">
      <div className="grid sm:grid-cols-4 gap-3">
        <InfoRow label="Référence" value={archive.reference} />
        <InfoRow label="Type" value={archive.type === "entree" ? "Entrée" : "Sortie"} />
        <InfoRow label="Date validation" value={archive.dateValidation} />
        <InfoRow label="Statut" value="Validé" />
      </div>

      {archive.type === "sortie" && (
        <div className="grid sm:grid-cols-2 gap-3">
          <InfoRow
            label="Décision dépôt de garantie"
            value={getDecisionDepotLabel(archive.decisionDepotGarantie)}
          />
          <InfoRow label="Montant retenu" value={formatEuros(archive.montantRetenu || 0)} />
        </div>
      )}

      <div className="space-y-3">
        {archive.pieces.map(piece => {
          const pieceEntree = entree?.pieces.find(p => p.nom === piece.nom);

          return (
            <div
              key={piece.id}
              className="p-4 rounded-3xl"
              style={{ backgroundColor: "#f8fafc" }}
            >
              <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
                <div>
                  <p className="text-sm font-black" style={{ color: "#1e293b" }}>
                    {piece.nom}
                  </p>
                  <p className="text-xs mt-1" style={{ color: "#94a3b8" }}>
                    État : {getEtatPieceLabel(piece.etatGeneral)}
                  </p>
                </div>

                <StatusBadge tone="blue">{getEtatPieceLabel(piece.etatGeneral)}</StatusBadge>
              </div>

              <p className="text-sm mb-3" style={{ color: "#64748b" }}>
                {piece.observations || "Aucune observation."}
              </p>

              {pieceEntree && (
                <div className="mb-3">
                  <p className="text-xs font-black mb-2" style={{ color: "#94a3b8" }}>
                    Photos d’entrée
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {pieceEntree.photos.map(photo => (
                      <PhotoChip key={photo.id} photo={photo} />
                    ))}
                  </div>
                </div>
              )}

              <p className="text-xs font-black mb-2" style={{ color: "#94a3b8" }}>
                Photos {archive.type === "entree" ? "d’entrée" : "de sortie"}
              </p>
              <div className="flex flex-wrap gap-2">
                {piece.photos.length === 0 ? (
                  <p className="text-xs" style={{ color: "#94a3b8" }}>
                    Aucune photo.
                  </p>
                ) : (
                  piece.photos.map(photo => <PhotoChip key={photo.id} photo={photo} />)
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// FORMULAIRE EDL ENTRÉE / SORTIE
// ============================================================

function FormEtatDesLieux({
  dossier,
  type,
  onBack,
  onValidate,
}: {
  dossier: DossierEtatDesLieux;
  type: TypeEtatDesLieux;
  onBack: () => void;
  onValidate: (payload: {
    dossierId: string;
    type: TypeEtatDesLieux;
    pieces: PieceEtatDesLieux[];
    decisionDepotGarantie?: DecisionDepotGarantie;
    montantRetenu?: number;
  }) => void;
}) {
  const piecesInitiales: FormPieceDraft[] =
    type === "sortie" && dossier.etatDesLieuxEntree
      ? dossier.etatDesLieuxEntree.pieces.map(piece => ({
          id: `draft-${piece.id}`,
          nom: piece.nom,
          etatGeneral: piece.etatGeneral,
          observations: "",
          photos: [],
        }))
      : [];

  const [pieces, setPieces] = useState<FormPieceDraft[]>(piecesInitiales);
  const [decisionDepot, setDecisionDepot] =
    useState<DecisionDepotGarantie>("restitution_integrale");
  const [montantRetenu, setMontantRetenu] = useState("");

  const addPiece = () => {
    setPieces(prev => [
      ...prev,
      {
        id: `piece-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        nom: "",
        etatGeneral: "correct",
        observations: "",
        photos: [],
      },
    ]);
  };

  const updatePiece = (pieceId: string, patch: Partial<FormPieceDraft>) => {
    setPieces(prev =>
      prev.map(piece => (piece.id === pieceId ? { ...piece, ...patch } : piece))
    );
  };

  const removePiece = (pieceId: string) => {
    setPieces(prev => prev.filter(piece => piece.id !== pieceId));
  };

  const addPhotoToPiece = (pieceId: string, filename: string) => {
    const photo = buildPhotoFromFilename(filename);

    if (!photo) {
      alert("Format non autorisé. Formats acceptés : JPG, PNG, HEIC.");
      return;
    }

    setPieces(prev =>
      prev.map(piece =>
        piece.id === pieceId
          ? {
              ...piece,
              photos: [...piece.photos, photo],
            }
          : piece
      )
    );
  };

  const handleValidate = () => {
    if (pieces.length === 0) {
      alert("Veuillez ajouter au moins une pièce.");
      return;
    }

    const hasEmptyName = pieces.some(piece => !piece.nom.trim());

    if (hasEmptyName) {
      alert("Chaque pièce doit avoir un nom.");
      return;
    }

    if (type === "sortie" && decisionDepot === "restitution_partielle") {
      if (!montantRetenu || Number(montantRetenu) <= 0) {
        alert("Veuillez renseigner le montant retenu.");
        return;
      }
    }

    const payloadPieces: PieceEtatDesLieux[] = pieces.map(piece => ({
      id: piece.id,
      nom: piece.nom,
      etatGeneral: piece.etatGeneral,
      observations: piece.observations,
      photos: piece.photos,
    }));

    onValidate({
      dossierId: dossier.id,
      type,
      pieces: payloadPieces,
      decisionDepotGarantie: type === "sortie" ? decisionDepot : undefined,
      montantRetenu:
        type === "sortie" && decisionDepot === "restitution_partielle"
          ? Number(montantRetenu)
          : type === "sortie" && decisionDepot === "aucune_restitution"
            ? dossier.depotGarantieMontant
            : 0,
    });
  };

  return (
    <PageShell>
      <PageHeader
        title={type === "entree" ? "📥 État des lieux d’entrée" : "📤 État des lieux de sortie"}
        subtitle={`${dossier.bienNom} · ${dossier.locataireNom}`}
        onBack={onBack}
        actions={
          <ActionButton onClick={handleValidate} variant="green">
            Valider {type === "entree" ? "l’entrée" : "la sortie"}
          </ActionButton>
        }
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-5">
        <SectionCard>
          <SectionTitle emoji="📌" title="Dossier" />

          <div className="grid sm:grid-cols-4 gap-3">
            <InfoRow label="Bien" value={dossier.bienNom} />
            <InfoRow label="Locataire" value={dossier.locataireNom} />
            <InfoRow label="Bail" value={dossier.bailReference} />
            <InfoRow label="Dépôt garantie" value={formatEuros(dossier.depotGarantieMontant)} />
          </div>
        </SectionCard>

        {type === "sortie" && dossier.etatDesLieuxEntree && (
          <SectionCard>
            <SectionTitle emoji="👁️" title="Préremplissage depuis l’état des lieux d’entrée" />

            <p className="text-sm mb-4" style={{ color: "#64748b" }}>
              Les pièces de l’état des lieux d’entrée sont récupérées depuis l’API.
              Le Front affiche les observations et photos d’entrée pour comparaison.
            </p>

            <ArchiveEDL archive={dossier.etatDesLieuxEntree} />
          </SectionCard>
        )}

        <SectionCard>
          <div className="flex items-center justify-between gap-4 flex-wrap mb-5">
            <SectionTitle emoji="🏠" title="Pièces" />

            {type === "entree" && (
              <ActionButton onClick={addPiece} variant="orange">
                + Ajouter une pièce
              </ActionButton>
            )}
          </div>

          {type === "sortie" && pieces.length === 0 && (
            <p className="text-sm" style={{ color: "#94a3b8" }}>
              Aucune pièce d’entrée récupérée depuis l’API.
            </p>
          )}

          {type === "entree" && pieces.length === 0 && (
            <div
              className="p-5 rounded-3xl text-center"
              style={{ backgroundColor: "#f8fafc" }}
            >
              <p className="text-sm font-bold" style={{ color: "#94a3b8" }}>
                Ajoutez les pièces nécessaires pour construire l’état des lieux.
              </p>
            </div>
          )}

          <div className="space-y-4">
            {pieces.map((piece, index) => {
              const pieceEntree = dossier.etatDesLieuxEntree?.pieces.find(
                p => p.nom === piece.nom
              );

              return (
                <div
                  key={piece.id}
                  className="p-4 rounded-3xl"
                  style={{ backgroundColor: "#f8fafc" }}
                >
                  <div className="flex justify-between gap-3 flex-wrap mb-4">
                    <p className="text-sm font-black" style={{ color: "#1e293b" }}>
                      Pièce {index + 1}
                    </p>

                    {type === "entree" && (
                      <button
                        onClick={() => removePiece(piece.id)}
                        className="text-xs font-black"
                        style={{ color: "#dc2626" }}
                      >
                        Supprimer
                      </button>
                    )}
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        className="block text-xs font-black mb-2"
                        style={{ color: "#64748b" }}
                      >
                        Nom de la pièce
                      </label>
                      <input
                        value={piece.nom}
                        disabled={type === "sortie"}
                        onChange={event => updatePiece(piece.id, { nom: event.target.value })}
                        placeholder="Salon, chambre, cuisine..."
                        className="w-full px-4 py-3 rounded-3xl border outline-none text-sm disabled:opacity-60"
                        style={{ borderColor: "#e2e8f0" }}
                      />
                    </div>

                    <div>
                      <label
                        className="block text-xs font-black mb-2"
                        style={{ color: "#64748b" }}
                      >
                        État général
                      </label>
                      <select
                        value={piece.etatGeneral}
                        onChange={event =>
                          updatePiece(piece.id, {
                            etatGeneral: event.target.value as EtatPiece,
                          })
                        }
                        className="w-full px-4 py-3 rounded-3xl border outline-none text-sm bg-white"
                        style={{ borderColor: "#e2e8f0" }}
                      >
                        <option value="parfait">Parfait</option>
                        <option value="correct">Correct</option>
                        <option value="moyen">Moyen</option>
                        <option value="vetuste">Vétuste</option>
                      </select>
                    </div>
                  </div>

                  {type === "sortie" && pieceEntree && (
                    <div
                      className="mt-4 p-4 rounded-3xl"
                      style={{ backgroundColor: "#fff" }}
                    >
                      <p className="text-xs font-black mb-2" style={{ color: "#94a3b8" }}>
                        Rappel entrée
                      </p>
                      <p className="text-sm font-bold" style={{ color: "#1e293b" }}>
                        État d’entrée : {getEtatPieceLabel(pieceEntree.etatGeneral)}
                      </p>
                      <p className="text-sm mt-1" style={{ color: "#64748b" }}>
                        {pieceEntree.observations || "Aucune observation d’entrée."}
                      </p>

                      <div className="flex flex-wrap gap-2 mt-3">
                        {pieceEntree.photos.map(photo => (
                          <PhotoChip key={photo.id} photo={photo} />
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-4">
                    <label
                      className="block text-xs font-black mb-2"
                      style={{ color: "#64748b" }}
                    >
                      Observations {type === "entree" ? "d’entrée" : "de sortie"}
                    </label>
                    <textarea
                      value={piece.observations}
                      onChange={event =>
                        updatePiece(piece.id, { observations: event.target.value })
                      }
                      rows={3}
                      placeholder="Observations libres..."
                      className="w-full px-4 py-3 rounded-3xl border outline-none text-sm resize-none"
                      style={{ borderColor: "#e2e8f0" }}
                    />
                  </div>

                  <div className="mt-4">
                    <label
                      className="block text-xs font-black mb-2"
                      style={{ color: "#64748b" }}
                    >
                      Ajouter une photo
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      <input
                        placeholder="photo.jpg / photo.png / photo.heic"
                        className="flex-1 min-w-[220px] px-4 py-3 rounded-3xl border outline-none text-sm"
                        style={{ borderColor: "#e2e8f0" }}
                        onKeyDown={event => {
                          if (event.key === "Enter") {
                            event.preventDefault();
                            const input = event.currentTarget;
                            if (input.value.trim()) {
                              addPhotoToPiece(piece.id, input.value.trim());
                              input.value = "";
                            }
                          }
                        }}
                      />

                      <ActionButton
                        variant="blue"
                        onClick={() => {
                          alert(
                            "Dans l’intégration réelle, ce bouton ouvrira un input file multiple."
                          );
                        }}
                      >
                        Téléverser
                      </ActionButton>
                    </div>

                    <p className="text-xs mt-2" style={{ color: "#94a3b8" }}>
                      Saisissez un nom de fichier puis appuyez sur Entrée. Formats :
                      JPG, PNG, HEIC.
                    </p>

                    <div className="flex flex-wrap gap-2 mt-3">
                      {piece.photos.map(photo => (
                        <PhotoChip key={photo.id} photo={photo} />
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>

        {type === "sortie" && (
          <SectionCard>
            <SectionTitle emoji="🔐" title="Décision concernant le dépôt de garantie" />

            <div className="grid sm:grid-cols-3 gap-3">
              {[
                {
                  id: "restitution_integrale",
                  label: "Restitution intégrale",
                  description: "Aucune retenue demandée.",
                },
                {
                  id: "restitution_partielle",
                  label: "Restitution partielle",
                  description: "Un montant retenu est transmis à l’API.",
                },
                {
                  id: "aucune_restitution",
                  label: "Aucune restitution",
                  description: "Le Back-End confirme le traitement.",
                },
              ].map(option => (
                <button
                  key={option.id}
                  onClick={() => setDecisionDepot(option.id as DecisionDepotGarantie)}
                  className="p-4 rounded-3xl text-left"
                  style={{
                    backgroundColor:
                      decisionDepot === option.id ? "#fff7ed" : "#f8fafc",
                    border:
                      decisionDepot === option.id
                        ? "2px solid #f97316"
                        : "2px solid transparent",
                  }}
                >
                  <p className="text-sm font-black" style={{ color: "#1e293b" }}>
                    {option.label}
                  </p>
                  <p className="text-xs mt-1" style={{ color: "#94a3b8" }}>
                    {option.description}
                  </p>
                </button>
              ))}
            </div>

            {decisionDepot === "restitution_partielle" && (
              <div className="mt-4">
                <label
                  className="block text-xs font-black mb-2"
                  style={{ color: "#64748b" }}
                >
                  Montant retenu
                </label>
                <input
                  type="number"
                  value={montantRetenu}
                  onChange={event => setMontantRetenu(event.target.value)}
                  placeholder="0"
                  className="w-full px-4 py-3 rounded-3xl border outline-none text-sm"
                  style={{ borderColor: "#e2e8f0" }}
                />
              </div>
            )}

            <div
              className="mt-4 p-4 rounded-3xl"
              style={{ backgroundColor: "#eff6ff", border: "1px solid #bfdbfe" }}
            >
              <p className="text-sm font-bold" style={{ color: "#1d4ed8" }}>
                Le Front transmet la décision au Back-End. Les retenues, la
                restitution et la clôture du contrat restent gérées par les APIs.
              </p>
            </div>
          </SectionCard>
        )}
      </main>
    </PageShell>
  );
}

// ============================================================
// MODULE PRINCIPAL
// ============================================================

export default function ModuleEtatsDesLieux() {
  const [view, setView] = useState<ViewState>({ name: "liste" });
  const [dossiers, setDossiers] = useState<DossierEtatDesLieux[]>(dossiersMock);
  const [historique, setHistorique] = useState<HistoriqueEDL[]>(historiqueMock);

  const selectedDossier = useMemo(() => {
    if (
      view.name === "dossier" ||
      view.name === "form_entree" ||
      view.name === "form_sortie"
    ) {
      return dossiers.find(dossier => dossier.id === view.dossierId);
    }

    return null;
  }, [view, dossiers]);

  const addHistory = (dossierId: string, action: string) => {
    setHistorique(prev => [
      ...prev,
      {
        id: `hist-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        dossierId,
        date: getToday(),
        heure: getNowTime(),
        utilisateur: "Utilisateur connecté",
        action,
      },
    ]);
  };

  const handleValidateEDL = (payload: {
    dossierId: string;
    type: TypeEtatDesLieux;
    pieces: PieceEtatDesLieux[];
    decisionDepotGarantie?: DecisionDepotGarantie;
    montantRetenu?: number;
  }) => {
    const reference =
      payload.type === "entree"
        ? `EDL-E-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`
        : `EDL-S-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

    const archive: EtatDesLieuxArchive = {
      id: `edl-${payload.type}-${Date.now()}`,
      type: payload.type,
      reference,
      dateValidation: getToday(),
      statut: "valide",
      pieces: payload.pieces,
      decisionDepotGarantie: payload.decisionDepotGarantie,
      montantRetenu: payload.montantRetenu,
    };

    setDossiers(prev =>
      prev.map(dossier => {
        if (dossier.id !== payload.dossierId) return dossier;

        if (payload.type === "entree") {
          return {
            ...dossier,
            statutEtatDesLieux: "entree_validee",
            etatDesLieuxEntree: archive,
          };
        }

        return {
          ...dossier,
          statutEtatDesLieux: "sortie_validee",
          etatDesLieuxSortie: archive,
        };
      })
    );

    addHistory(
      payload.dossierId,
      payload.type === "entree"
        ? "État des lieux d’entrée validé via API"
        : "État des lieux de sortie validé via API"
    );

    setView({ name: "dossier", dossierId: payload.dossierId });

    alert(
      payload.type === "entree"
        ? "État des lieux d’entrée validé. Le Back-End archive le document et met à jour le module Dépôt de garantie."
        : "État des lieux de sortie validé. Le Back-End transmet les retenues au module Dépôt de garantie et autorise la restitution."
    );
  };

  if (view.name === "dossier" && selectedDossier) {
    const historiqueDossier = historique.filter(
      item => item.dossierId === selectedDossier.id
    );

    return (
      <VueDossier
        dossier={selectedDossier}
        historique={historiqueDossier}
        onBack={() => setView({ name: "liste" })}
        onStartEntree={() =>
          setView({ name: "form_entree", dossierId: selectedDossier.id })
        }
        onStartSortie={() =>
          setView({ name: "form_sortie", dossierId: selectedDossier.id })
        }
      />
    );
  }

  if (view.name === "form_entree" && selectedDossier) {
    return (
      <FormEtatDesLieux
        dossier={selectedDossier}
        type="entree"
        onBack={() => setView({ name: "dossier", dossierId: selectedDossier.id })}
        onValidate={handleValidateEDL}
      />
    );
  }

  if (view.name === "form_sortie" && selectedDossier) {
    return (
      <FormEtatDesLieux
        dossier={selectedDossier}
        type="sortie"
        onBack={() => setView({ name: "dossier", dossierId: selectedDossier.id })}
        onValidate={handleValidateEDL}
      />
    );
  }

  return (
    <VueListeDossiers
      dossiers={dossiers}
      onOpen={dossierId => setView({ name: "dossier", dossierId })}
    />
  );
}