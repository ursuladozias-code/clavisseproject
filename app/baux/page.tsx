"use client";
import { useState } from "react";

// ============================================================
// MOCK DATA
// ============================================================
const mockBiens = [
  { id: "b1", reference: "BIEN-001", nom: "Appartement Voltaire", adresse: "12 rue Voltaire", codePostal: "75011", ville: "Paris", type: "Appartement", surface: 45, pieces: 2, loyer: 1200, charges: 150, depot: 2400, dpe: "C", meuble: false },
  { id: "b2", reference: "BIEN-002", nom: "Studio Gambetta", adresse: "8 avenue Gambetta", codePostal: "75020", ville: "Paris", type: "Studio", surface: 22, pieces: 1, loyer: 850, charges: 80, depot: 850, dpe: "D", meuble: true },
  { id: "b3", reference: "BIEN-003", nom: "Maison Vincennes", adresse: "3 rue des Lilas", codePostal: "94300", ville: "Vincennes", type: "Maison", surface: 95, pieces: 4, loyer: 2100, charges: 200, depot: 4200, dpe: "B", meuble: false },
];

const mockLocataires = [
  { id: "l1", nom: "Dupont", prenom: "Jean", dateNaissance: "15/03/1985", lieuNaissance: "Paris (75)", adresse: "12 rue de la Paix, 75001 Paris", telephone: "06 12 34 56 78", email: "jean.dupont@email.com", garant: { type: "physique", nom: "Dupont", prenom: "Marie", adresse: "5 allée des Roses, 75015 Paris", telephone: "06 55 44 33 22", email: "marie.dupont@email.com" } },
  { id: "l2", nom: "Martin", prenom: "Sophie", dateNaissance: "22/07/1992", lieuNaissance: "Lyon (69)", adresse: "5 place Bellecour, 69002 Lyon", telephone: "06 98 76 54 32", email: "sophie.martin@email.com", garant: null },
  { id: "l3", nom: "Bernard", prenom: "Pierre", dateNaissance: "10/11/1988", lieuNaissance: "Bordeaux (33)", adresse: "8 allée des Roses, 33000 Bordeaux", telephone: "07 11 22 33 44", email: "pierre.bernard@email.com", garant: { type: "morale", denomination: "Bernard Holding SAS", formeJuridique: "SAS", siren: "123 456 789", adresse: "10 rue du Commerce, 33000 Bordeaux", representant: "Alain Bernard", email: "contact@bernard-holding.fr" } },
];

const typesBail = [
  { id: "nue", label: "Location nue", emoji: "🏠", desc: "Bail d'habitation – Loi 89" },
  { id: "meublee", label: "Location meublée", emoji: "🛋️", desc: "Logement équipé" },
  { id: "etudiant", label: "Bail étudiant", emoji: "🎓", desc: "9 mois non reconductible" },
  { id: "mobilite", label: "Bail mobilité", emoji: "🧳", desc: "1 à 10 mois" },
  { id: "professionnel", label: "Bail professionnel", emoji: "💼", desc: "6 ans minimum" },
  { id: "commercial", label: "Bail commercial", emoji: "🏪", desc: "3-6-9" },
  { id: "autre", label: "Autre", emoji: "📋", desc: "Autre modèle" },
];

const indicesIndexation = [
  { id: "IRL", label: "IRL – Indice de Référence des Loyers", compatible: ["nue", "meublee", "etudiant", "mobilite"] },
  { id: "ICC", label: "ICC – Indice du Coût de la Construction", compatible: ["commercial"] },
  { id: "ILAT", label: "ILAT – Indice des Loyers des Activités Tertiaires", compatible: ["professionnel"] },
];

const trimestres = [
  { id: "T1", label: "1er trimestre" },
  { id: "T2", label: "2e trimestre" },
  { id: "T3", label: "3e trimestre" },
  { id: "T4", label: "4e trimestre" },
];

const currentYear = new Date().getFullYear();
const annees = Array.from({ length: 10 }, (_, i) => String(currentYear - i));

const STEPS = ["Type de bail", "Bailleur", "Bien", "Occupation", "Locataire(s)", "Garant(s)", "Contrat", "Indexation", "Clauses", "Aperçu", "Signature"];

// Baux signés/importés mockés par bien
const mockBauxSignes = [
  {
    id: "bail1", bienId: "b1", reference: "BAIL-2024-001", typeBail: "nue", locataireIds: ["l1"],
    dateDebut: "01/01/2024", dateFin: "31/12/2024", loyer: 1200, charges: 150,
    statut: "signé", dateSignature: "20/12/2023", source: "genere",
    indexActive: true, typeIndice: "IRL",
  },
  {
    id: "bail2", bienId: "b1", reference: "BAIL-2025-001", typeBail: "nue", locataireIds: ["l1"],
    dateDebut: "01/01/2025", dateFin: "31/12/2025", loyer: 1250, charges: 150,
    statut: "actif", dateSignature: "15/12/2024", source: "genere",
    indexActive: true, typeIndice: "IRL",
  },
  {
    id: "bail3", bienId: "b2", reference: "BAIL-2025-002", typeBail: "meublee", locataireIds: ["l2"],
    dateDebut: "01/06/2025", dateFin: "31/05/2026", loyer: 850, charges: 80,
    statut: "actif", dateSignature: "20/05/2025", source: "importe",
    indexActive: false, typeIndice: "",
  },
];

// ============================================================
// HELPERS
// ============================================================
const statutConfig: Record<string, { label: string; color: string; bg: string }> = {
  "brouillon":           { label: "Brouillon",             color: "#6b7280", bg: "#f1f5f9" },
  "en_cours":            { label: "En cours de création",  color: "#d97706", bg: "#fef3c7" },
  "genere":              { label: "Généré",                color: "#7c3aed", bg: "#ede9fe" },
  "attente_signature":   { label: "En attente de signature", color: "#2563eb", bg: "#dbeafe" },
  "partiellement_signe": { label: "Partiellement signé",   color: "#f97316", bg: "#fff7ed" },
  "signé":               { label: "Signé",                 color: "#16a34a", bg: "#dcfce7" },
  "actif":               { label: "Actif",                 color: "#16a34a", bg: "#dcfce7" },
  "archive":             { label: "Archivé",               color: "#6b7280", bg: "#f1f5f9" },
  "importe":             { label: "Bail importé",          color: "#3b82f6", bg: "#eff6ff" },
};

function StatutBadge({ statut }: { statut: string }) {
  const cfg = statutConfig[statut] ?? { label: statut, color: "#6b7280", bg: "#f1f5f9" };
  return (
    <span className="text-xs font-extrabold px-2.5 py-1 rounded-xl"
      style={{ backgroundColor: cfg.bg, color: cfg.color }}>
      {cfg.label}
    </span>
  );
}

function SourceBadge({ source }: { source: string }) {
  if (source === "importe") return (
    <span className="text-xs font-bold px-2 py-0.5 rounded-lg" style={{ backgroundColor: "#eff6ff", color: "#3b82f6" }}>📁 Importé</span>
  );
  return (
    <span className="text-xs font-bold px-2 py-0.5 rounded-lg" style={{ backgroundColor: "#f0fdf4", color: "#16a34a" }}>✍️ Généré</span>
  );
}

// ============================================================
// SUB-COMPONENTS
// ============================================================
function Field({ label, value, onChange, placeholder, type = "text", required = false }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; required?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
        {label}{required && <span className="text-orange-500 ml-0.5">*</span>}
      </label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full px-4 py-3 rounded-2xl text-sm font-semibold outline-none border-2 transition-all"
        style={{ backgroundColor: "#f8fafc", borderColor: value ? "#f97316" : "#e2e8f0", color: "#1e293b" }} />
    </div>
  );
}

function SelectField({ label, value, onChange, options, placeholder, required = false }: {
  label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; placeholder?: string; required?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
        {label}{required && <span className="text-orange-500 ml-0.5">*</span>}
      </label>
      <div className="relative">
        <select value={value} onChange={e => onChange(e.target.value)}
          className="w-full appearance-none px-4 py-3 rounded-2xl text-sm font-semibold outline-none border-2 transition-all pr-10"
          style={{ backgroundColor: "#f8fafc", borderColor: value ? "#f97316" : "#e2e8f0", color: value ? "#1e293b" : "#94a3b8" }}>
          {placeholder && <option value="">{placeholder}</option>}
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">▾</span>
      </div>
    </div>
  );
}

function SectionTitle({ icon, title, subtitle }: { icon: string; title: string; subtitle?: string }) {
  return (
    <div className="flex items-start gap-3 mb-6">
      <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
        style={{ background: "linear-gradient(135deg,#fff7ed,#fed7aa)" }}>{icon}</div>
      <div>
        <h2 className="text-base font-extrabold text-gray-800">{title}</h2>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

function InfoBadge({ label, value, icon }: { label: string; value: string | undefined; icon?: string }) {
  return (
    <div className="p-3 rounded-2xl" style={{ backgroundColor: "#f8fafc" }}>
      <p className="text-xs font-bold text-gray-400 mb-0.5">{icon} {label}</p>
      <p className="text-sm font-extrabold text-gray-800 break-words">{value || "–"}</p>
    </div>
  );
}

function NavButtons({ onBack, onNext, nextLabel = "Continuer →", disabled = false, isLast = false }: {
  onBack?: () => void; onNext: () => void; nextLabel?: string; disabled?: boolean; isLast?: boolean;
}) {
  return (
    <div className="flex justify-between items-center mt-8 pt-4" style={{ borderTop: "2px solid #f1f5f9" }}>
      {onBack
        ? <button onClick={onBack} className="px-5 py-2.5 rounded-2xl text-sm font-bold border-2 transition"
            style={{ borderColor: "#e2e8f0", color: "#64748b" }}>← Retour</button>
        : <div />}
      <button onClick={onNext} disabled={disabled}
        className="px-6 py-2.5 rounded-2xl text-white text-sm font-extrabold shadow-lg disabled:opacity-40 transition"
        style={{ background: "linear-gradient(135deg,#f97316,#fb923c)" }}>
        {nextLabel}
      </button>
    </div>
  );
}

function Stepper({ current, steps }: { current: number; steps: string[] }) {
  return (
    <div className="overflow-x-auto pb-2 mb-6">
      <div className="flex items-center min-w-max gap-0">
        {steps.map((s, i) => {
          const n = i + 1;
          const done = current > n;
          const active = current === n;
          return (
            <div key={s} className="flex items-center">
              {i > 0 && <div className="w-5 sm:w-8 h-0.5" style={{ backgroundColor: done ? "#f97316" : "#e2e8f0" }} />}
              <div className="flex flex-col items-center gap-1">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold transition-all"
                  style={{
                    backgroundColor: active ? "#f97316" : done ? "#fed7aa" : "#f1f5f9",
                    color: active ? "#fff" : done ? "#f97316" : "#94a3b8",
                    boxShadow: active ? "0 0 0 3px rgba(249,115,22,.2)" : "none",
                  }}>
                  {done ? "✓" : n}
                </div>
                <span className="text-[9px] font-bold whitespace-nowrap hidden sm:block"
                  style={{ color: active ? "#f97316" : done ? "#f97316" : "#94a3b8" }}>{s}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// VUE 1 — LISTE DES BIENS AVEC BAUX SIGNÉS
// ============================================================
function VueBiensAvecBaux({ onSelectBien, onNouveauBail }: {
  onSelectBien: (bienId: string) => void;
  onNouveauBail: () => void;
}) {
  const [recherche, setRecherche] = useState("");

  // Biens qui ont au moins un bail signé/actif/importé
  const biensAvecBaux = mockBiens.filter(bien =>
    mockBauxSignes.some(b => b.bienId === bien.id)
  );

  const biensFiltres = biensAvecBaux.filter(b =>
    b.nom.toLowerCase().includes(recherche.toLowerCase()) ||
    b.adresse.toLowerCase().includes(recherche.toLowerCase()) ||
    b.ville.toLowerCase().includes(recherche.toLowerCase())
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f8fafc", fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div className="px-4 sm:px-6 py-6" style={{ background: "linear-gradient(135deg,#fff7ed,#fff)" }}>
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-black" style={{ color: "#1e293b" }}>📋 Baux</h1>
            <p className="text-sm mt-0.5" style={{ color: "#94a3b8" }}>
              {biensAvecBaux.length} bien{biensAvecBaux.length > 1 ? "s" : ""} avec bail signé
            </p>
          </div>
          <button
            onClick={onNouveauBail}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-white text-sm font-extrabold shadow-lg"
            style={{ background: "linear-gradient(135deg,#f97316,#fb923c)" }}
          >
            + Nouveau bail
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-4">
        {/* Recherche */}
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input
            value={recherche}
            onChange={e => setRecherche(e.target.value)}
            placeholder="Rechercher un bien…"
            className="w-full pl-10 pr-4 py-3 rounded-2xl text-sm font-semibold outline-none border-2"
            style={{ backgroundColor: "#fff", borderColor: "#e2e8f0", color: "#1e293b" }}
          />
        </div>

        {/* Liste des biens */}
        {biensFiltres.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm">
            <div className="text-4xl mb-3">🏠</div>
            <p className="font-extrabold text-gray-700">Aucun bien avec bail signé</p>
            <p className="text-sm text-gray-400 mt-1 mb-6">Créez votre premier bail pour qu'il apparaisse ici</p>
            <button onClick={onNouveauBail}
              className="px-6 py-3 rounded-2xl text-white text-sm font-extrabold"
              style={{ background: "linear-gradient(135deg,#f97316,#fb923c)" }}>
              + Créer un bail
            </button>
          </div>
        ) : (
          biensFiltres.map(bien => {
            const bauxDuBien = mockBauxSignes.filter(b => b.bienId === bien.id);
            const nbActifs = bauxDuBien.filter(b => b.statut === "actif").length;

            return (
              <button
                key={bien.id}
                onClick={() => onSelectBien(bien.id)}
                className="w-full bg-white rounded-3xl p-5 shadow-sm text-left transition hover:shadow-md"
                style={{ border: "2px solid #f1f5f9" }}
              >
                <div className="flex items-start gap-4">
                  {/* Icône bien */}
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ background: "linear-gradient(135deg,#fff7ed,#fed7aa)" }}>
                    🏠
                  </div>
                  {/* Infos */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <p className="font-extrabold text-sm" style={{ color: "#1e293b" }}>{bien.nom}</p>
                        <p className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>
                          {bien.adresse}, {bien.codePostal} {bien.ville}
                        </p>
                      </div>
                      <span className="text-lg">›</span>
                    </div>
                    {/* Stats baux */}
                    <div className="flex items-center gap-3 mt-3 flex-wrap">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-xl"
                        style={{ backgroundColor: "#f1f5f9", color: "#64748b" }}>
                        {bien.type}
                      </span>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-xl"
                        style={{ backgroundColor: "#dcfce7", color: "#16a34a" }}>
                        {bauxDuBien.length} bail{bauxDuBien.length > 1 ? "s" : ""}
                      </span>
                      {nbActifs > 0 && (
                        <span className="text-xs font-bold px-2.5 py-1 rounded-xl"
                          style={{ backgroundColor: "#fff7ed", color: "#f97316" }}>
                          {nbActifs} actif{nbActifs > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                    {/* Aperçu locataires */}
                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                      {bauxDuBien.flatMap(b => b.locataireIds).map(lid => {
                        const loc = mockLocataires.find(l => l.id === lid);
                        if (!loc) return null;
                        return (
                          <div key={lid} className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl"
                            style={{ backgroundColor: "#eff6ff" }}>
                            <div className="w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-extrabold"
                              style={{ backgroundColor: "#3b82f6", color: "#fff" }}>
                              {loc.prenom[0]}{loc.nom[0]}
                            </div>
                            <span className="text-xs font-bold" style={{ color: "#1d4ed8" }}>
                              {loc.prenom} {loc.nom}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

// ============================================================
// VUE 2 — LISTE DES BAUX D'UN BIEN
// ============================================================
function VueBauxDuBien({ bienId, onBack, onSelectBail, onNouveauBail }: {
  bienId: string;
  onBack: () => void;
  onSelectBail: (bailId: string) => void;
  onNouveauBail: () => void;
}) {
  const bien = mockBiens.find(b => b.id === bienId)!;
  const baux = mockBauxSignes.filter(b => b.bienId === bienId);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f8fafc", fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div className="px-4 sm:px-6 py-5" style={{ background: "linear-gradient(135deg,#fff7ed,#fff)" }}>
        <div className="max-w-3xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-bold mb-3" style={{ color: "#94a3b8" }}>
            <button onClick={onBack} className="hover:underline" style={{ color: "#f97316" }}>Baux</button>
            <span>›</span>
            <span style={{ color: "#1e293b" }}>{bien.nom}</span>
          </div>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl"
                style={{ background: "linear-gradient(135deg,#fff7ed,#fed7aa)" }}>🏠</div>
              <div>
                <h1 className="text-base font-black" style={{ color: "#1e293b" }}>{bien.nom}</h1>
                <p className="text-xs" style={{ color: "#94a3b8" }}>{bien.adresse}, {bien.codePostal} {bien.ville}</p>
              </div>
            </div>
            <button onClick={onNouveauBail}
              className="px-4 py-2 rounded-2xl text-white text-sm font-extrabold"
              style={{ background: "linear-gradient(135deg,#f97316,#fb923c)" }}>
              + Nouveau bail
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-4">
        {baux.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm">
            <p className="font-extrabold text-gray-700">Aucun bail pour ce bien</p>
          </div>
        ) : (
          baux.map(bail => {
            const locs = bail.locataireIds.map(id => mockLocataires.find(l => l.id === id)).filter(Boolean);
            const typeBailLabel = typesBail.find(t => t.id === bail.typeBail)?.label ?? bail.typeBail;

            return (
              <button
                key={bail.id}
                onClick={() => onSelectBail(bail.id)}
                className="w-full bg-white rounded-3xl p-5 shadow-sm text-left transition hover:shadow-md"
                style={{ border: "2px solid #f1f5f9" }}
              >
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex-1">
                    {/* Référence + badges */}
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <p className="font-extrabold text-sm" style={{ color: "#1e293b" }}>{bail.reference}</p>
                      <StatutBadge statut={bail.statut} />
                      <SourceBadge source={bail.source} />
                    </div>
                    <p className="text-xs font-bold mb-3" style={{ color: "#64748b" }}>{typeBailLabel}</p>

                    {/* Locataires */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {locs.map(loc => loc && (
                        <div key={loc.id} className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl"
                          style={{ backgroundColor: "#eff6ff" }}>
                          <div className="w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-extrabold"
                            style={{ backgroundColor: "#3b82f6", color: "#fff" }}>
                            {loc.prenom[0]}{loc.nom[0]}
                          </div>
                          <span className="text-xs font-bold" style={{ color: "#1d4ed8" }}>{loc.prenom} {loc.nom}</span>
                        </div>
                      ))}
                    </div>

                    {/* Dates + loyer */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="p-2 rounded-xl" style={{ backgroundColor: "#f8fafc" }}>
                        <p className="text-[10px] font-bold text-gray-400">Début</p>
                        <p className="text-xs font-extrabold text-gray-700">{bail.dateDebut}</p>
                      </div>
                      <div className="p-2 rounded-xl" style={{ backgroundColor: "#f8fafc" }}>
                        <p className="text-[10px] font-bold text-gray-400">Fin</p>
                        <p className="text-xs font-extrabold text-gray-700">{bail.dateFin}</p>
                      </div>
                      <div className="p-2 rounded-xl" style={{ backgroundColor: "#f8fafc" }}>
                        <p className="text-[10px] font-bold text-gray-400">Loyer</p>
                        <p className="text-xs font-extrabold text-gray-700">{bail.loyer} €/mois</p>
                      </div>
                    </div>
                  </div>
                  <span className="text-gray-400 text-lg mt-1">›</span>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

// ============================================================
// VUE 3 — DÉTAIL D'UN BAIL + DOCUMENT
// ============================================================

// ============================================================
// WIZARD CRÉATION BAIL
// ============================================================
function NouveauBailWizard({ onRetour }: { onRetour: () => void }) {
  const [mode, setMode] = useState<"" | "importe" | "generer">("");
  const [step, setStep] = useState(1);

  // Bail importé
  const [importBien, setImportBien] = useState("");
  const [importLoc, setImportLoc] = useState<string[]>([]);
  const [importFile, setImportFile] = useState("");
  const [importDone, setImportDone] = useState(false);

  // Steps wizard
  const [typeBail, setTypeBail] = useState("");
  const [typeBailleur, setTypeBailleur] = useState<"" | "physique" | "morale">("");
  const [bPhy, setBPhy] = useState({ nom: "", prenom: "", dateNaissance: "", lieuNaissance: "", adresse: "", codePostal: "", ville: "", telephone: "", email: "" });
  const [bMor, setBMor] = useState({ denomination: "", formeJuridique: "", siren: "", rcs: "", capital: "", adresse: "", ville: "", greffe: "", repNom: "", repPrenom: "", repFonction: "", telephone: "", email: "" });
  const [bienId, setBienId] = useState("");
  const bien = mockBiens.find(b => b.id === bienId);
  const [occupation, setOccupation] = useState<"" | "individuelle" | "colocation">("");
  const [locIds, setLocIds] = useState<string[]>([]);
  const locataires = mockLocataires.filter(l => locIds.includes(l.id));
  const [contrat, setContrat] = useState({ dateSignature: "", datePriseEffet: "", duree: "", renouvellement: "automatique" });
  const [indexActive, setIndexActive] = useState(false);
  const [index, setIndex] = useState({ typeIndice: "", trimestre: "", annee: "", dateAnniversaire: "" });
  const [clauses, setClauses] = useState("");
  const [signatureEnvoyee, setSignatureEnvoyee] = useState(false);

  const upPhy = (k: string, v: string) => setBPhy(p => ({ ...p, [k]: v }));
  const upMor = (k: string, v: string) => setBMor(p => ({ ...p, [k]: v }));

  const next = () => setStep(s => s + 1);
  const back = () => setStep(s => s - 1);

  const canNext = () => {
    if (step === 1) return !!typeBail;
    if (step === 2) return !!typeBailleur;
    if (step === 3) return !!bienId;
    if (step === 4) return !!occupation;
    if (step === 5) return locIds.length > 0;
    return true;
  };

  const indicesCompatibles = indicesIndexation.filter(i => i.compatible.includes(typeBail));

  // ── Choix du mode ──
  if (!mode) {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#f8fafc", fontFamily: "'Inter', sans-serif" }}>
        <div className="px-4 sm:px-6 py-5" style={{ background: "linear-gradient(135deg,#fff7ed,#fff)" }}>
          <div className="max-w-3xl mx-auto flex items-center gap-3">
            <button onClick={onRetour} className="text-sm font-bold px-3 py-1.5 rounded-xl"
              style={{ backgroundColor: "#f1f5f9", color: "#64748b" }}>← Retour</button>
            <div>
              <h1 className="text-base font-black" style={{ color: "#1e293b" }}>Nouveau bail</h1>
            </div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md space-y-4">
            <p className="text-center text-sm font-bold mb-6" style={{ color: "#64748b" }}>Comment souhaitez-vous procéder ?</p>
            {/* Bail déjà signé */}
            <button onClick={() => setMode("importe")}
              className="w-full p-6 rounded-3xl text-left transition hover:shadow-lg"
              style={{ background: "linear-gradient(135deg,#1e3a5f,#2563eb)", color: "#fff" }}>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-4 bg-white/20">📁</div>
              <h2 className="text-base font-extrabold text-white mb-2">Le bail est déjà signé</h2>
              <p className="text-sm text-white/80 leading-relaxed">Importez directement le PDF de votre bail signé.</p>
              <p className="mt-4 text-sm font-extrabold text-white">Importer →</p>
            </button>
            {/* Générer */}
            <button onClick={() => setMode("generer")}
              className="w-full p-6 rounded-3xl text-left transition hover:shadow-lg"
              style={{ background: "linear-gradient(135deg,#f97316,#fb923c)", color: "#fff" }}>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-4 bg-white/20">✍️</div>
              <h2 className="text-base font-extrabold text-white mb-2">Rédiger et signer sur la plateforme</h2>
              <p className="text-sm text-white/80 leading-relaxed">Créez votre bail étape par étape à partir d'un modèle validé.</p>
              <p className="mt-4 text-sm font-extrabold text-white">Commencer →</p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Bail importé ──
  if (mode === "importe") {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "#f8fafc", fontFamily: "'Inter', sans-serif" }}>
        <div className="px-4 sm:px-6 py-5" style={{ background: "linear-gradient(135deg,#fff7ed,#fff)" }}>
          <div className="max-w-lg mx-auto flex items-center gap-3">
            <button onClick={() => setMode("")} className="text-sm font-bold px-3 py-1.5 rounded-xl"
              style={{ backgroundColor: "#f1f5f9", color: "#64748b" }}>← Retour</button>
            <h1 className="text-base font-black" style={{ color: "#1e293b" }}>Importer un bail signé</h1>
          </div>
        </div>
        <div className="max-w-lg mx-auto px-4 sm:px-6 py-6">
          {!importDone ? (
            <div className="bg-white rounded-3xl p-6 shadow-sm space-y-5">
              {/* Bien */}
              <SelectField label="Bien concerné" value={importBien} onChange={setImportBien}
                options={mockBiens.map(b => ({ value: b.id, label: b.nom }))}
                placeholder="Sélectionner un bien" required />
              {/* Locataires */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                  Locataire(s) <span className="text-orange-500">*</span>
                </label>
                <div className="space-y-2">
                  {mockLocataires.map(l => {
                    const sel = importLoc.includes(l.id);
                    return (
                      <button key={l.id} onClick={() => setImportLoc(p => sel ? p.filter(x => x !== l.id) : [...p, l.id])}
                        className="w-full flex items-center gap-3 p-3 rounded-2xl border-2 text-left transition"
                        style={{ borderColor: sel ? "#f97316" : "#e2e8f0", backgroundColor: sel ? "#fff7ed" : "#f8fafc" }}>
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-extrabold flex-shrink-0"
                          style={{ backgroundColor: sel ? "#f97316" : "#e2e8f0", color: sel ? "#fff" : "#6b7280" }}>
                          {l.prenom[0]}{l.nom[0]}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-extrabold text-gray-800">{l.prenom} {l.nom}</p>
                          <p className="text-xs text-gray-400">{l.email}</p>
                        </div>
                        {sel && <span className="text-orange-500 font-extrabold">✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
              {/* Upload */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                  Document PDF <span className="text-orange-500">*</span>
                </label>
                {!importFile ? (
                  <label className="block cursor-pointer">
                    <div className="border-2 border-dashed rounded-2xl p-8 text-center transition"
                      style={{ borderColor: "#e2e8f0", backgroundColor: "#f8fafc" }}>
                      <div className="text-3xl mb-2">📎</div>
                      <p className="text-sm font-bold text-gray-600">Cliquez pour sélectionner le PDF</p>
                      <p className="text-xs text-gray-400 mt-1">Format PDF uniquement</p>
                    </div>
                    <input type="file" accept=".pdf" className="hidden"
                      onChange={e => e.target.files?.[0] && setImportFile(e.target.files[0].name)} />
                  </label>
                ) : (
                  <div className="flex items-center gap-3 p-3 rounded-2xl border-2"
                    style={{ borderColor: "#f97316", backgroundColor: "#fff7ed" }}>
                    <span className="text-2xl">📄</span>
                    <p className="flex-1 text-sm font-extrabold text-gray-800">{importFile}</p>
                    <button onClick={() => setImportFile("")} className="text-xs text-gray-400 hover:text-red-500">✕</button>
                  </div>
                )}
              </div>
              <button
                onClick={() => setImportDone(true)}
                disabled={!importBien || importLoc.length === 0 || !importFile}
                className="w-full py-3 rounded-2xl text-white text-sm font-extrabold shadow-lg disabled:opacity-40"
                style={{ background: "linear-gradient(135deg,#f97316,#fb923c)" }}>
                ✓ Enregistrer le bail importé
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-3xl shadow-sm p-8 text-center">
              <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl"
                style={{ background: "linear-gradient(135deg,#10b981,#34d399)" }}>✓</div>
              <h2 className="text-lg font-extrabold text-gray-800 mb-2">Bail importé avec succès</h2>
              <div className="inline-block px-4 py-1.5 rounded-xl text-xs font-extrabold mb-4"
                style={{ backgroundColor: "#eff6ff", color: "#3b82f6" }}>📁 Bail importé</div>
              <p className="text-sm text-gray-400 mb-6">Le document a été associé au bien et au(x) locataire(s) sélectionnés.</p>
              <button onClick={onRetour}
                className="px-8 py-3 rounded-2xl text-white text-sm font-extrabold shadow"
                style={{ background: "linear-gradient(135deg,#f97316,#fb923c)" }}>
                Retour aux baux
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Wizard génération ──
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f8fafc", fontFamily: "'Inter', sans-serif" }}>
      <div className="px-4 sm:px-6 py-5" style={{ background: "linear-gradient(135deg,#fff7ed,#fff)", borderBottom: "1px solid #f1f5f9" }}>
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button onClick={() => setMode("")} className="text-sm font-bold px-3 py-1.5 rounded-xl flex-shrink-0"
            style={{ backgroundColor: "#f1f5f9", color: "#64748b" }}>← Retour</button>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-black truncate" style={{ color: "#1e293b" }}>Rédiger un bail</h1>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
        <Stepper current={step} steps={STEPS} />

        <div className="bg-white rounded-3xl p-6 shadow-sm">

          {/* STEP 1 – Type de bail */}
          {step === 1 && (
            <div>
              <SectionTitle icon="📋" title="Type de bail" subtitle="Sélectionnez le régime juridique applicable" />
              <div className="grid sm:grid-cols-2 gap-3">
                {typesBail.map(t => (
                  <button key={t.id} onClick={() => setTypeBail(t.id)}
                    className="p-4 rounded-2xl border-2 text-left transition"
                    style={{ borderColor: typeBail === t.id ? "#f97316" : "#e2e8f0", backgroundColor: typeBail === t.id ? "#fff7ed" : "#f8fafc" }}>
                    <div className="text-2xl mb-2">{t.emoji}</div>
                    <p className="font-extrabold text-sm text-gray-800">{t.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{t.desc}</p>
                  </button>
                ))}
              </div>
              <NavButtons onNext={next} disabled={!canNext()} />
            </div>
          )}

          {/* STEP 2 – Bailleur */}
          {step === 2 && (
            <div>
              <SectionTitle icon="👤" title="Le bailleur" subtitle="Personne physique ou morale ?" />
              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                {[{ v: "physique", label: "Personne physique", emoji: "🧑" }, { v: "morale", label: "Personne morale", emoji: "🏢" }].map(opt => (
                  <button key={opt.v} onClick={() => setTypeBailleur(opt.v as "physique" | "morale")}
                    className="p-5 rounded-2xl border-2 text-left transition"
                    style={{ borderColor: typeBailleur === opt.v ? "#f97316" : "#e2e8f0", backgroundColor: typeBailleur === opt.v ? "#fff7ed" : "#f8fafc" }}>
                    <div className="text-3xl mb-2">{opt.emoji}</div>
                    <p className="font-extrabold text-sm text-gray-800">{opt.label}</p>
                  </button>
                ))}
              </div>
              {typeBailleur === "physique" && (
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Nom" value={bPhy.nom} onChange={v => upPhy("nom", v)} required />
                  <Field label="Prénom" value={bPhy.prenom} onChange={v => upPhy("prenom", v)} required />
                  <Field label="Date de naissance" value={bPhy.dateNaissance} onChange={v => upPhy("dateNaissance", v)} type="date" />
                  <Field label="Lieu de naissance" value={bPhy.lieuNaissance} onChange={v => upPhy("lieuNaissance", v)} />
                  <div className="sm:col-span-2"><Field label="Adresse" value={bPhy.adresse} onChange={v => upPhy("adresse", v)} /></div>
                  <Field label="Code postal" value={bPhy.codePostal} onChange={v => upPhy("codePostal", v)} />
                  <Field label="Ville" value={bPhy.ville} onChange={v => upPhy("ville", v)} />
                  <Field label="Téléphone" value={bPhy.telephone} onChange={v => upPhy("telephone", v)} type="tel" />
                  <Field label="Email" value={bPhy.email} onChange={v => upPhy("email", v)} type="email" />
                </div>
              )}
              {typeBailleur === "morale" && (
                <div className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2"><Field label="Dénomination sociale" value={bMor.denomination} onChange={v => upMor("denomination", v)} required /></div>
                    <Field label="Forme juridique" value={bMor.formeJuridique} onChange={v => upMor("formeJuridique", v)} placeholder="SCI, SAS, SARL…" />
                    <Field label="SIREN" value={bMor.siren} onChange={v => upMor("siren", v)} required placeholder="XXX XXX XXX" />
                    <Field label="Numéro RCS" value={bMor.rcs} onChange={v => upMor("rcs", v)} />
                    <Field label="Capital social" value={bMor.capital} onChange={v => upMor("capital", v)} placeholder="Ex : 10 000 €" />
                    <Field label="Greffe" value={bMor.greffe} onChange={v => upMor("greffe", v)} placeholder="Ville du greffe" />
                    <Field label="Adresse du siège" value={bMor.adresse} onChange={v => upMor("adresse", v)} />
                    <Field label="Ville" value={bMor.ville} onChange={v => upMor("ville", v)} />
                  </div>
                  <div className="border-t pt-4" style={{ borderColor: "#e2e8f0" }}>
                    <p className="text-xs font-extrabold text-gray-500 uppercase tracking-wide mb-3">Représentant légal</p>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Field label="Nom" value={bMor.repNom} onChange={v => upMor("repNom", v)} />
                      <Field label="Prénom" value={bMor.repPrenom} onChange={v => upMor("repPrenom", v)} />
                      <Field label="Fonction" value={bMor.repFonction} onChange={v => upMor("repFonction", v)} placeholder="Gérant, Président…" />
                      <Field label="Téléphone" value={bMor.telephone} onChange={v => upMor("telephone", v)} type="tel" />
                      <div className="sm:col-span-2"><Field label="Email" value={bMor.email} onChange={v => upMor("email", v)} type="email" /></div>
                    </div>
                  </div>
                </div>
              )}
              <NavButtons onBack={() => setMode("")} onNext={next} disabled={!canNext()} />
            </div>
          )}

          {/* STEP 3 – Bien */}
          {step === 3 && (
            <div>
              <SectionTitle icon="🏠" title="Le bien loué" subtitle="Sélectionnez parmi vos biens – les informations sont préremplies" />
              <div className="space-y-3">
                {mockBiens.map(b => (
                  <button key={b.id} onClick={() => setBienId(b.id)}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition"
                    style={{ borderColor: bienId === b.id ? "#f97316" : "#e2e8f0", backgroundColor: bienId === b.id ? "#fff7ed" : "#f8fafc" }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                      style={{ backgroundColor: bienId === b.id ? "#f97316" : "#e2e8f0" }}>🏠</div>
                    <div className="flex-1">
                      <p className="font-extrabold text-sm text-gray-800">{b.nom}</p>
                      <p className="text-xs text-gray-400">{b.adresse}, {b.codePostal} {b.ville}</p>
                      <div className="flex gap-2 mt-1 flex-wrap">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg" style={{ backgroundColor: "#f1f5f9", color: "#64748b" }}>{b.type}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg" style={{ backgroundColor: "#f1f5f9", color: "#64748b" }}>{b.surface} m²</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg" style={{ backgroundColor: "#f1f5f9", color: "#64748b" }}>{b.loyer} €/mois</span>
                      </div>
                    </div>
                    {bienId === b.id && <span className="text-orange-500 font-extrabold">✓</span>}
                  </button>
                ))}
              </div>
              <NavButtons onBack={back} onNext={next} disabled={!canNext()} />
            </div>
          )}

          {/* STEP 4 – Occupation */}
          {step === 4 && (
            <div>
              <SectionTitle icon="🏘️" title="Mode d'occupation" subtitle="Comment le bien sera-t-il occupé ?" />
              <div className="grid sm:grid-cols-2 gap-4">
                {[{ v: "individuelle", label: "Location individuelle", emoji: "👤", desc: "Un seul locataire" },
                  { v: "colocation", label: "Colocation", emoji: "👥", desc: "Plusieurs locataires" }].map(opt => (
                  <button key={opt.v} onClick={() => setOccupation(opt.v as "individuelle" | "colocation")}
                    className="p-5 rounded-2xl border-2 text-left transition"
                    style={{ borderColor: occupation === opt.v ? "#f97316" : "#e2e8f0", backgroundColor: occupation === opt.v ? "#fff7ed" : "#f8fafc" }}>
                    <div className="text-3xl mb-2">{opt.emoji}</div>
                    <p className="font-extrabold text-sm text-gray-800">{opt.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{opt.desc}</p>
                  </button>
                ))}
              </div>
              <NavButtons onBack={back} onNext={next} disabled={!canNext()} />
            </div>
          )}

          {/* STEP 5 – Locataires */}
          {step === 5 && (
            <div>
              <SectionTitle icon="👤" title="Locataire(s)" subtitle="Sélectionnez parmi vos locataires existants" />
              <div className="space-y-3">
                {mockLocataires.map(l => {
                  const sel = locIds.includes(l.id);
                  const disabled = occupation === "individuelle" && locIds.length > 0 && !sel;
                  return (
                    <button key={l.id}
                      onClick={() => !disabled && setLocIds(p => sel ? p.filter(x => x !== l.id) : [...p, l.id])}
                      className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition"
                      style={{
                        borderColor: sel ? "#f97316" : "#e2e8f0",
                        backgroundColor: sel ? "#fff7ed" : disabled ? "#fafafa" : "#f8fafc",
                        opacity: disabled ? 0.4 : 1,
                        cursor: disabled ? "not-allowed" : "pointer"
                      }}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-extrabold flex-shrink-0"
                        style={{ backgroundColor: sel ? "#f97316" : "#e2e8f0", color: sel ? "#fff" : "#6b7280" }}>
                        {l.prenom[0]}{l.nom[0]}
                      </div>
                      <div className="flex-1">
                        <p className="font-extrabold text-sm text-gray-800">{l.prenom} {l.nom}</p>
                        <p className="text-xs text-gray-400">{l.email}</p>
                        <p className="text-xs text-gray-400">{l.telephone}</p>
                      </div>
                      {l.garant && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-lg flex-shrink-0"
                          style={{ backgroundColor: "#f0fdf4", color: "#16a34a" }}>
                          Garant ✓
                        </span>
                      )}
                      {sel && <span className="text-orange-500 font-extrabold">✓</span>}
                    </button>
                  );
                })}
              </div>
              <NavButtons onBack={back} onNext={next} disabled={!canNext()} />
            </div>
          )}

          {/* STEP 6 – Garants */}
          {step === 6 && (
            <div>
              <SectionTitle icon="🛡️" title="Garant(s)" subtitle="Récapitulatif des garants associés aux locataires sélectionnés" />
              {locataires.every(l => !l.garant) ? (
                <div className="text-center py-8 rounded-2xl" style={{ backgroundColor: "#f8fafc" }}>
                  <div className="text-4xl mb-3">🛡️</div>
                  <p className="text-sm font-bold text-gray-500">Aucun garant associé aux locataires sélectionnés</p>
                  <p className="text-xs text-gray-400 mt-1">Vous pouvez ajouter un garant depuis le module Locataires</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {locataires.map(l => l.garant && (
                    <div key={l.id} className="rounded-2xl border-2 p-4" style={{ borderColor: "#e2e8f0" }}>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-extrabold"
                          style={{ backgroundColor: "#f97316", color: "#fff" }}>
                          {l.prenom[0]}{l.nom[0]}
                        </div>
                        <p className="text-xs font-bold text-gray-500">Garant de {l.prenom} {l.nom}</p>
                      </div>
                      {l.garant.type === "physique" ? (
                        <div className="grid sm:grid-cols-2 gap-2">
                          <InfoBadge icon="👤" label="Nom complet" value={`${l.garant.prenom} ${l.garant.nom}`} />
                          <InfoBadge icon="📍" label="Adresse" value={l.garant.adresse} />
                          <InfoBadge icon="📞" label="Téléphone" value={l.garant.telephone} />
                          <InfoBadge icon="✉️" label="Email" value={l.garant.email} />
                        </div>
                      ) : (
                        <div className="grid sm:grid-cols-2 gap-2">
                          <InfoBadge icon="🏢" label="Dénomination" value={l.garant.denomination} />
                          <InfoBadge icon="⚖️" label="Forme juridique" value={l.garant.formeJuridique} />
                          <InfoBadge icon="🔢" label="SIREN" value={l.garant.siren} />
                          <InfoBadge icon="👤" label="Représentant" value={l.garant.representant} />
                          <InfoBadge icon="📍" label="Adresse" value={l.garant.adresse} />
                          <InfoBadge icon="✉️" label="Email" value={l.garant.email} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              <NavButtons onBack={back} onNext={next} />
            </div>
          )}

          {/* STEP 7 – Contrat */}
          {step === 7 && (
            <div>
              <SectionTitle icon="📅" title="Conditions du contrat" subtitle="Dates, durée et conditions financières" />

              {/* Dates */}
              <div className="mb-6">
                <p className="text-xs font-extrabold text-gray-500 uppercase tracking-wide mb-3">Dates</p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Date de signature" type="date" value={contrat.dateSignature}
                    onChange={v => setContrat(p => ({ ...p, dateSignature: v }))} required />
                  <Field label="Date de prise d'effet" type="date" value={contrat.datePriseEffet}
                    onChange={v => setContrat(p => ({ ...p, datePriseEffet: v }))} required />
                  <Field label="Durée (mois)" value={contrat.duree}
                    onChange={v => setContrat(p => ({ ...p, duree: v }))}
                    placeholder={typeBail === "etudiant" ? "9" : typeBail === "mobilite" ? "1 à 10" : "12"} />
                  <SelectField label="Renouvellement" value={contrat.renouvellement}
                    onChange={v => setContrat(p => ({ ...p, renouvellement: v }))}
                    options={[
                      { value: "automatique", label: "Tacite reconduction" },
                      { value: "manuel", label: "Renouvellement manuel" },
                      { value: "aucun", label: "Sans renouvellement" },
                    ]} />
                </div>
              </div>

              {/* Conditions financières préremplies */}
              {bien && (
                <div className="rounded-2xl p-4 mb-2" style={{ backgroundColor: "#f8fafc", border: "2px solid #e2e8f0" }}>
                  <p className="text-xs font-extrabold text-gray-500 uppercase tracking-wide mb-3">
                    💡 Conditions financières préremplies depuis le bien
                  </p>
                  <div className="grid sm:grid-cols-3 gap-3">
                    <InfoBadge icon="💶" label="Loyer mensuel" value={`${bien.loyer} €`} />
                    <InfoBadge icon="⚡" label="Charges" value={`${bien.charges} €`} />
                    <InfoBadge icon="🔐" label="Dépôt de garantie" value={`${bien.depot} €`} />
                  </div>
                </div>
              )}

              <NavButtons onBack={back} onNext={next} />
            </div>
          )}

          {/* STEP 8 – Indexation */}
          {step === 8 && (
            <div>
              <SectionTitle icon="📈" title="Indexation du loyer" subtitle="Révision automatique selon l'indice applicable" />

              <div className="flex items-center justify-between p-4 rounded-2xl mb-5"
                style={{ backgroundColor: "#f8fafc", border: "2px solid #e2e8f0" }}>
                <div>
                  <p className="text-sm font-extrabold text-gray-800">Activer l'indexation du loyer</p>
                  <p className="text-xs text-gray-400 mt-0.5">Révision annuelle automatique</p>
                </div>
                <button onClick={() => setIndexActive(p => !p)}
                  className="w-12 h-6 rounded-full transition-all relative flex-shrink-0"
                  style={{ backgroundColor: indexActive ? "#f97316" : "#e2e8f0" }}>
                  <span className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all"
                    style={{ left: indexActive ? "26px" : "2px" }} />
                </button>
              </div>

              {indexActive && (
                <div className="space-y-5">
                  {/* Indice */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                      Indice de référence <span className="text-orange-500">*</span>
                    </label>
                    {indicesCompatibles.length === 0 ? (
                      <div className="p-3 rounded-2xl text-sm font-bold text-gray-500" style={{ backgroundColor: "#f8fafc" }}>
                        Aucun indice disponible pour ce type de bail
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {indicesCompatibles.map(ind => (
                          <button key={ind.id} onClick={() => setIndex(p => ({ ...p, typeIndice: ind.id }))}
                            className="w-full flex items-center gap-3 p-3 rounded-2xl border-2 text-left transition"
                            style={{
                              borderColor: index.typeIndice === ind.id ? "#f97316" : "#e2e8f0",
                              backgroundColor: index.typeIndice === ind.id ? "#fff7ed" : "#f8fafc"
                            }}>
                            <span className="text-xl">📊</span>
                            <div className="flex-1">
                              <p className="text-sm font-extrabold text-gray-800">{ind.label}</p>
                            </div>
                            {index.typeIndice === ind.id && <span className="text-orange-500 font-extrabold">✓</span>}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Trimestre & Année de référence */}
                  {index.typeIndice && (
                    <div className="grid sm:grid-cols-2 gap-4">
                      <SelectField label="Trimestre de référence" value={index.trimestre}
                        onChange={v => setIndex(p => ({ ...p, trimestre: v }))}
                        options={trimestres.map(t => ({ value: t.id, label: t.label }))}
                        placeholder="Sélectionner" required />
                      <SelectField label="Année de référence" value={index.annee}
                        onChange={v => setIndex(p => ({ ...p, annee: v }))}
                        options={annees.map(a => ({ value: a, label: a }))}
                        placeholder="Sélectionner" required />
                      <div className="sm:col-span-2">
                        <Field label="Date anniversaire d'indexation" type="date"
                          value={index.dateAnniversaire}
                          onChange={v => setIndex(p => ({ ...p, dateAnniversaire: v }))} />
                      </div>
                    </div>
                  )}

                  {/* Résumé */}
                  {index.typeIndice && index.trimestre && index.annee && (
                    <div className="rounded-2xl p-4" style={{ backgroundColor: "#fff7ed", border: "2px solid #fed7aa" }}>
                      <p className="text-xs font-extrabold text-orange-600 uppercase tracking-wide mb-2">📋 Récapitulatif indexation</p>
                      <p className="text-sm text-gray-700">
                        Le loyer sera révisé chaque année sur la base de l'<strong>{index.typeIndice}</strong> du{" "}
                        <strong>{trimestres.find(t => t.id === index.trimestre)?.label} {index.annee}</strong>.
                      </p>
                      {index.dateAnniversaire && (
                        <p className="text-sm text-gray-700 mt-1">
                          Prochaine révision : <strong>{index.dateAnniversaire}</strong>
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              <NavButtons onBack={back} onNext={next} />
            </div>
          )}

          {/* STEP 9 – Clauses */}
          {step === 9 && (
            <div>
              <SectionTitle icon="📝" title="Clauses particulières" subtitle="Ajoutez des clauses spécifiques à ce bail (optionnel)" />
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                  Clauses particulières
                </label>
                <textarea
                  value={clauses}
                  onChange={e => setClauses(e.target.value)}
                  rows={8}
                  placeholder="Ex : Le locataire s'engage à ne pas sous-louer le logement sans accord écrit du bailleur…"
                  className="w-full px-4 py-3 rounded-2xl text-sm font-semibold outline-none border-2 resize-none transition"
                  style={{
                    backgroundColor: "#f8fafc",
                    borderColor: clauses ? "#f97316" : "#e2e8f0",
                    color: "#1e293b",
                    lineHeight: "1.6"
                  }}
                />
                <p className="text-xs text-gray-400 mt-1.5">
                  {clauses.length} caractère{clauses.length > 1 ? "s" : ""}
                </p>
              </div>

              {/* Suggestions */}
              <div className="mt-4">
                <p className="text-xs font-extrabold text-gray-500 uppercase tracking-wide mb-2">Suggestions</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Interdiction de sous-location",
                    "Animaux domestiques autorisés",
                    "Entretien du jardin à la charge du locataire",
                    "Assurance habitation obligatoire",
                    "Travaux soumis à accord écrit",
                  ].map(suggestion => (
                    <button key={suggestion}
                      onClick={() => setClauses(p => p ? `${p}\n${suggestion}` : suggestion)}
                      className="text-xs font-bold px-3 py-1.5 rounded-xl transition"
                      style={{ backgroundColor: "#f1f5f9", color: "#64748b" }}>
                      + {suggestion}
                    </button>
                  ))}
                </div>
              </div>

              <NavButtons onBack={back} onNext={next} />
            </div>
          )}

          {/* STEP 10 – Aperçu */}
          {step === 10 && (
            <div>
              <SectionTitle icon="👁️" title="Aperçu du bail" subtitle="Vérifiez toutes les informations avant génération" />

              <div className="space-y-4">
                {/* Type */}
                <div className="rounded-2xl p-4" style={{ backgroundColor: "#f8fafc", border: "2px solid #e2e8f0" }}>
                  <p className="text-xs font-extrabold text-gray-400 uppercase tracking-wide mb-2">Type de bail</p>
                  <p className="text-sm font-extrabold text-gray-800">
                    {typesBail.find(t => t.id === typeBail)?.emoji}{" "}
                    {typesBail.find(t => t.id === typeBail)?.label}
                  </p>
                </div>

                {/* Bailleur */}
                <div className="rounded-2xl p-4" style={{ backgroundColor: "#f8fafc", border: "2px solid #e2e8f0" }}>
                  <p className="text-xs font-extrabold text-gray-400 uppercase tracking-wide mb-2">Bailleur</p>
                  {typeBailleur === "physique" ? (
                    <div className="grid sm:grid-cols-2 gap-2">
                      <InfoBadge label="Nom" value={`${bPhy.prenom} ${bPhy.nom}`} />
                      <InfoBadge label="Email" value={bPhy.email} />
                      <InfoBadge label="Téléphone" value={bPhy.telephone} />
                      <InfoBadge label="Adresse" value={`${bPhy.adresse}, ${bPhy.codePostal} ${bPhy.ville}`} />
                    </div>
                  ) : (
                    <div className="grid sm:grid-cols-2 gap-2">
                      <InfoBadge label="Société" value={bMor.denomination} />
                      <InfoBadge label="SIREN" value={bMor.siren} />
                      <InfoBadge label="Représentant" value={`${bMor.repPrenom} ${bMor.repNom}`} />
                      <InfoBadge label="Email" value={bMor.email} />
                    </div>
                  )}
                </div>

                {/* Bien */}
                {bien && (
                  <div className="rounded-2xl p-4" style={{ backgroundColor: "#f8fafc", border: "2px solid #e2e8f0" }}>
                    <p className="text-xs font-extrabold text-gray-400 uppercase tracking-wide mb-2">Bien</p>
                    <div className="grid sm:grid-cols-2 gap-2">
                      <InfoBadge label="Bien" value={bien.nom} />
                      <InfoBadge label="Adresse" value={`${bien.adresse}, ${bien.codePostal} ${bien.ville}`} />
                      <InfoBadge label="Surface" value={`${bien.surface} m²`} />
                      <InfoBadge label="DPE" value={bien.dpe} />
                      <InfoBadge label="Loyer" value={`${bien.loyer} €`} />
                      <InfoBadge label="Charges" value={`${bien.charges} €`} />
                    </div>
                  </div>
                )}

                {/* Locataires */}
                <div className="rounded-2xl p-4" style={{ backgroundColor: "#f8fafc", border: "2px solid #e2e8f0" }}>
                  <p className="text-xs font-extrabold text-gray-400 uppercase tracking-wide mb-2">
                    Locataire{locataires.length > 1 ? "s" : ""}
                  </p>
                  <div className="space-y-2">
                    {locataires.map(l => (
                      <div key={l.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: "#fff" }}>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-extrabold"
                          style={{ backgroundColor: "#f97316", color: "#fff" }}>
                          {l.prenom[0]}{l.nom[0]}
                        </div>
                        <div>
                          <p className="text-sm font-extrabold text-gray-800">{l.prenom} {l.nom}</p>
                          <p className="text-xs text-gray-400">{l.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Contrat */}
                <div className="rounded-2xl p-4" style={{ backgroundColor: "#f8fafc", border: "2px solid #e2e8f0" }}>
                  <p className="text-xs font-extrabold text-gray-400 uppercase tracking-wide mb-2">Contrat</p>
                  <div className="grid sm:grid-cols-2 gap-2">
                    <InfoBadge label="Signature" value={contrat.dateSignature} />
                    <InfoBadge label="Prise d'effet" value={contrat.datePriseEffet} />
                    <InfoBadge label="Durée" value={contrat.duree ? `${contrat.duree} mois` : "–"} />
                    <InfoBadge label="Renouvellement" value={contrat.renouvellement} />
                  </div>
                </div>

                {/* Indexation */}
                {indexActive && index.typeIndice && (
                  <div className="rounded-2xl p-4" style={{ backgroundColor: "#fff7ed", border: "2px solid #fed7aa" }}>
                    <p className="text-xs font-extrabold text-orange-500 uppercase tracking-wide mb-2">📈 Indexation</p>
                    <div className="grid sm:grid-cols-3 gap-2">
                      <InfoBadge label="Indice" value={index.typeIndice} />
                      <InfoBadge label="Trimestre" value={index.trimestre} />
                      <InfoBadge label="Année" value={index.annee} />
                    </div>
                  </div>
                )}

                {/* Clauses */}
                {clauses && (
                  <div className="rounded-2xl p-4" style={{ backgroundColor: "#f8fafc", border: "2px solid #e2e8f0" }}>
                    <p className="text-xs font-extrabold text-gray-400 uppercase tracking-wide mb-2">Clauses particulières</p>
                    <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">{clauses}</p>
                  </div>
                )}
              </div>

              <NavButtons onBack={back} onNext={next} nextLabel="✓ Générer le bail" />
            </div>
          )}

          {/* STEP 11 – Signature */}
          {step === 11 && (
            <div>
              <SectionTitle icon="✍️" title="Signature électronique" subtitle="Envoyez le bail à toutes les parties pour signature" />

              {!signatureEnvoyee ? (
                <div className="space-y-5">
                  {/* Récap signataires */}
                  <div className="rounded-2xl p-4" style={{ backgroundColor: "#f8fafc", border: "2px solid #e2e8f0" }}>
                    <p className="text-xs font-extrabold text-gray-400 uppercase tracking-wide mb-3">Signataires</p>
                    <div className="space-y-3">
                      {/* Bailleur */}
                      <div className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: "#fff" }}>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                          style={{ backgroundColor: "#fff7ed" }}>🏠</div>
                        <div className="flex-1">
                          <p className="text-xs font-bold text-gray-400">Bailleur</p>
                          <p className="text-sm font-extrabold text-gray-800">
                            {typeBailleur === "physique"
                              ? `${bPhy.prenom} ${bPhy.nom}`
                              : bMor.denomination}
                          </p>
                          <p className="text-xs text-gray-400">
                            {typeBailleur === "physique" ? bPhy.email : bMor.email}
                          </p>
                        </div>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-lg"
                          style={{ backgroundColor: "#fef3c7", color: "#d97706" }}>En attente</span>
                      </div>

                      {/* Locataires */}
                      {locataires.map(l => (
                        <div key={l.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: "#fff" }}>
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-extrabold"
                            style={{ backgroundColor: "#eff6ff", color: "#3b82f6" }}>
                            {l.prenom[0]}{l.nom[0]}
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-bold text-gray-400">Locataire</p>
                            <p className="text-sm font-extrabold text-gray-800">{l.prenom} {l.nom}</p>
                            <p className="text-xs text-gray-400">{l.email}</p>
                          </div>
                          <span className="text-xs font-bold px-2 py-0.5 rounded-lg"
                            style={{ backgroundColor: "#fef3c7", color: "#d97706" }}>En attente</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Statut brouillon */}
                  <div className="rounded-2xl p-4 flex items-start gap-3"
                    style={{ backgroundColor: "#eff6ff", border: "2px solid #bfdbfe" }}>
                    <span className="text-xl">ℹ️</span>
                    <div>
                      <p className="text-sm font-extrabold text-blue-800">Statut actuel : Généré</p>
                      <p className="text-xs text-blue-600 mt-0.5">
                        Le bail sera passé en "En attente de signature" dès l'envoi.
                        Il deviendra "Signé" une fois toutes les parties ayant signé.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setSignatureEnvoyee(true)}
                    className="w-full py-4 rounded-2xl text-white text-sm font-extrabold shadow-lg"
                    style={{ background: "linear-gradient(135deg,#f97316,#fb923c)" }}>
                    ✉️ Envoyer pour signature électronique
                  </button>

                  <button
                    onClick={onRetour}
                    className="w-full py-3 rounded-2xl text-sm font-extrabold border-2"
                    style={{ borderColor: "#e2e8f0", color: "#64748b" }}>
                    Enregistrer en brouillon
                  </button>
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl"
                    style={{ background: "linear-gradient(135deg,#10b981,#34d399)" }}>✓</div>
                  <h2 className="text-lg font-extrabold text-gray-800 mb-2">Bail envoyé pour signature !</h2>
                  <div className="inline-block px-4 py-1.5 rounded-xl text-xs font-extrabold mb-4"
                    style={{ backgroundColor: "#dbeafe", color: "#2563eb" }}>
                    En attente de signature
                  </div>
                  <p className="text-sm text-gray-400 mb-1">
                    Chaque signataire a reçu un email avec le lien de signature.
                  </p>
                  <p className="text-sm text-gray-400 mb-6">
                    Le bail apparaîtra dans <strong>la fiche du bien</strong> et dans{" "}
                    <strong>l'espace locataire</strong> une fois signé.
                  </p>
                  <button onClick={onRetour}
                    className="px-8 py-3 rounded-2xl text-white text-sm font-extrabold shadow"
                    style={{ background: "linear-gradient(135deg,#f97316,#fb923c)" }}>
                    Retour aux baux
                  </button>
                </div>
              )}

              {!signatureEnvoyee && <NavButtons onBack={back} onNext={() => {}} nextLabel="" />}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// ============================================================
// DETAIL BAIL
// ============================================================
function VueDetailBail({ bailId, bienId, onBack }: {
  bailId: string;
  bienId: string;
  onBack: () => void;
}) {
  const bail = mockBauxSignes.find(b => b.id === bailId)!;
  const bien = mockBiens.find(b => b.id === bienId)!;
  const locataires = mockLocataires.filter(l => bail.locataireIds.includes(l.id));

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f8fafc", fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div className="px-4 sm:px-6 py-5" style={{ background: "linear-gradient(135deg,#fff7ed,#fff)" }}>
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-2 text-xs font-bold mb-3" style={{ color: "#94a3b8" }}>
            <button onClick={() => onBack()} className="hover:underline" style={{ color: "#f97316" }}>Baux</button>
            <span>›</span>
            <button onClick={onBack} className="hover:underline" style={{ color: "#f97316" }}>{bien.nom}</button>
            <span>›</span>
            <span style={{ color: "#1e293b" }}>{bail.reference}</span>
          </div>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base font-black" style={{ color: "#1e293b" }}>{bail.reference}</h1>
                <StatutBadge statut={bail.statut} />
                <SourceBadge source={bail.source} />
              </div>
              <p className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>
                {typesBail.find(t => t.id === bail.typeBail)?.label}
              </p>
            </div>
            <button className="px-4 py-2 rounded-2xl text-white text-sm font-bold shadow"
              style={{ background: "linear-gradient(135deg,#f97316,#fb923c)" }}>
              ⬇ Télécharger PDF
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-4">

        {/* Bien */}
        <div className="bg-white rounded-3xl p-5 shadow-sm">
          <p className="text-xs font-extrabold text-gray-400 uppercase tracking-wide mb-3">🏠 Bien</p>
          <div className="grid sm:grid-cols-2 gap-3">
            <InfoBadge label="Nom" value={bien.nom} />
            <InfoBadge label="Adresse" value={`${bien.adresse}, ${bien.codePostal} ${bien.ville}`} />
            <InfoBadge label="Type" value={bien.type} />
            <InfoBadge label="Surface" value={`${bien.surface} m²`} />
          </div>
        </div>

        {/* Locataires */}
        <div className="bg-white rounded-3xl p-5 shadow-sm">
          <p className="text-xs font-extrabold text-gray-400 uppercase tracking-wide mb-3">
            👤 Locataire{locataires.length > 1 ? "s" : ""}
          </p>
          <div className="space-y-3">
            {locataires.map(l => (
              <div key={l.id} className="flex items-center gap-3 p-3 rounded-2xl" style={{ backgroundColor: "#f8fafc" }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-extrabold"
                  style={{ backgroundColor: "#eff6ff", color: "#3b82f6" }}>
                  {l.prenom[0]}{l.nom[0]}
                </div>
                <div>
                  <p className="font-extrabold text-sm text-gray-800">{l.prenom} {l.nom}</p>
                  <p className="text-xs text-gray-400">{l.email} · {l.telephone}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Conditions financières */}
        <div className="bg-white rounded-3xl p-5 shadow-sm">
          <p className="text-xs font-extrabold text-gray-400 uppercase tracking-wide mb-3">💶 Conditions financières</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <InfoBadge label="Loyer" value={`${bail.loyer} €`} />
            <InfoBadge label="Charges" value={`${bail.charges} €`} />
            <InfoBadge label="Total mensuel" value={`${bail.loyer + bail.charges} €`} />
          </div>
        </div>

        {/* Dates */}
        <div className="bg-white rounded-3xl p-5 shadow-sm">
          <p className="text-xs font-extrabold text-gray-400 uppercase tracking-wide mb-3">📅 Dates</p>
          <div className="grid sm:grid-cols-3 gap-3">
            <InfoBadge label="Début" value={bail.dateDebut} />
            <InfoBadge label="Fin" value={bail.dateFin} />
            <InfoBadge label="Signé le" value={bail.dateSignature} />
          </div>
        </div>

        {/* Indexation */}
        {bail.indexActive && (
          <div className="bg-white rounded-3xl p-5 shadow-sm">
            <p className="text-xs font-extrabold text-orange-400 uppercase tracking-wide mb-3">📈 Indexation</p>
            <div className="grid sm:grid-cols-2 gap-3">
              <InfoBadge label="Indice" value={bail.typeIndice} />
              <InfoBadge label="Statut" value="Active" />
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================
export default function ModuleBaux() {
  type View =
    | { name: "liste_biens" }
    | { name: "baux_du_bien"; bienId: string }
    | { name: "detail_bail"; bailId: string; bienId: string }
    | { name: "nouveau_bail" };

  const [view, setView] = useState<View>({ name: "liste_biens" });

  if (view.name === "liste_biens") {
    return (
      <VueBiensAvecBaux
        onSelectBien={bienId => setView({ name: "baux_du_bien", bienId })}
        onNouveauBail={() => setView({ name: "nouveau_bail" })}
      />
    );
  }

  if (view.name === "baux_du_bien") {
    return (
      <VueBauxDuBien
        bienId={view.bienId}
        onBack={() => setView({ name: "liste_biens" })}
        onSelectBail={bailId => setView({ name: "detail_bail", bailId, bienId: view.bienId })}
        onNouveauBail={() => setView({ name: "nouveau_bail" })}
      />
    );
  }

  if (view.name === "detail_bail") {
    return (
      <VueDetailBail
        bailId={view.bailId}
        bienId={view.bienId}
        onBack={() => setView({ name: "baux_du_bien", bienId: view.bienId })}
      />
    );
  }

  if (view.name === "nouveau_bail") {
    return (
      <NouveauBailWizard
        onRetour={() => setView({ name: "liste_biens" })}
      />
    );
  }

  return null;
}
