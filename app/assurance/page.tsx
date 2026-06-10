"use client";

import { useState } from "react";

// --- TYPES ---
type StatutContrat = "Actif" | "Expiré" | "À renouveler";
type StatutBien = "Occupé" | "Vacant" | "Préavis en cours" | "Archivé";

interface Document {
  id: string;
  nom: string;
  type: string;
  date: string;
  taille: string;
}

interface Assurance {
  id: string;
  type: string;
  assureur: string;
  numeroContrat: string;
  dateDebut: string;
  dateEcheance: string;
  statut: StatutContrat;
  montantPrime: string;
  documents: Document[];
}

interface Bien {
  id: string;
  reference: string;
  nom: string;
  adresse: string;
  statut: StatutBien;
  assurances: Assurance[];
}

// --- MOCK DATA ---
const mockBiens: Bien[] = [
  {
    id: "1",
    reference: "BIEN-001",
    nom: "Appartement Voltaire",
    adresse: "12 rue Voltaire, Paris",
    statut: "Occupé",
    assurances: [
      {
        id: "a1",
        type: "PNO",
        assureur: "Allianz",
        numeroContrat: "ALZ-2023-00142",
        dateDebut: "01/01/2023",
        dateEcheance: "31/12/2025",
        statut: "Actif",
        montantPrime: "180 €/an",
        documents: [
          { id: "d1", nom: "Contrat PNO 2023.pdf", type: "Contrat", date: "01/01/2023", taille: "1,2 Mo" },
          { id: "d2", nom: "Avenant 2024.pdf", type: "Avenant", date: "01/01/2024", taille: "0,4 Mo" },
        ],
      },
      {
        id: "a2",
        type: "GLI",
        assureur: "Solly Azar",
        numeroContrat: "SA-2023-00789",
        dateDebut: "15/03/2023",
        dateEcheance: "14/03/2024",
        statut: "Expiré",
        montantPrime: "350 €/an",
        documents: [
          { id: "d3", nom: "Contrat GLI 2023.pdf", type: "Contrat", date: "15/03/2023", taille: "2,1 Mo" },
        ],
      },
    ],
  },
  {
    id: "2",
    reference: "BIEN-002",
    nom: "Studio Gambetta",
    adresse: "8 avenue Gambetta, Paris",
    statut: "Vacant",
    assurances: [
      {
        id: "a3",
        type: "Logement vacant",
        assureur: "MMA",
        numeroContrat: "MMA-2024-00321",
        dateDebut: "01/06/2024",
        dateEcheance: "31/05/2025",
        statut: "À renouveler",
        montantPrime: "220 €/an",
        documents: [
          { id: "d4", nom: "Contrat vacant 2024.pdf", type: "Contrat", date: "01/06/2024", taille: "0,9 Mo" },
        ],
      },
    ],
  },
  {
    id: "3",
    reference: "BIEN-003",
    nom: "Maison Vincennes",
    adresse: "3 rue des Lilas, Vincennes",
    statut: "Préavis en cours",
    assurances: [],
  },
];

const typesAssurance = [
  "Assurance PNO (Propriétaire Non Occupant)",
  "Assurance logement vacant",
  "Garantie Loyers Impayés (GLI)",
  "Assurance Visale",
  "Assurance multirisque immeuble",
  "Assurance dommages-ouvrage",
  "Autre",
];

// --- HELPERS ---
const statutBienConfig: Record<StatutBien, { bg: string; color: string; label: string }> = {
  Occupé:           { bg: "#dcfce7", color: "#16a34a", label: "Occupé" },
  Vacant:           { bg: "#fce7f3", color: "#db2777", label: "Vacant" },
  "Préavis en cours": { bg: "#fef9c3", color: "#ca8a04", label: "Préavis en cours" },
  Archivé:          { bg: "#f3f4f6", color: "#6b7280", label: "Archivé" },
};

const statutContratConfig: Record<StatutContrat, { bg: string; color: string }> = {
  Actif:           { bg: "#dcfce7", color: "#16a34a" },
  Expiré:          { bg: "#fee2e2", color: "#dc2626" },
  "À renouveler":  { bg: "#fef9c3", color: "#ca8a04" },
};

const typeAssuranceEmoji: Record<string, string> = {
  "PNO": "🏠",
  "GLI": "🛡️",
  "Logement vacant": "🔒",
  "Visale": "✅",
  "Multirisque immeuble": "🏢",
  "Dommages-ouvrage": "🔨",
  "Autre": "📋",
};

function getEmojiType(type: string) {
  const key = Object.keys(typeAssuranceEmoji).find(k => type.toLowerCase().includes(k.toLowerCase()));
  return key ? typeAssuranceEmoji[key] : "📋";
}

// --- KPI CARD ---
function KpiCard({ emoji, value, label, gradient }: { emoji: string; value: string | number; label: string; gradient: string }) {
  return (
    <div className="rounded-3xl p-5 sm:p-6 text-white flex flex-col gap-2 shadow-lg" style={{ background: gradient }}>
      <span className="text-3xl">{emoji}</span>
      <span className="text-3xl sm:text-4xl font-extrabold leading-none">{value}</span>
      <span className="text-sm font-semibold opacity-90">{label}</span>
    </div>
  );
}

// --- MAIN ---
export default function AssurancesPage() {
  const [biens] = useState<Bien[]>(mockBiens);
  const [bienSelectionne, setBienSelectionne] = useState<Bien | null>(null);
  const [assuranceSelectionnee, setAssuranceSelectionnee] = useState<Assurance | null>(null);
  const [showModalAjout, setShowModalAjout] = useState(false);
  const [recherche, setRecherche] = useState("");

  // Stats globales
  const totalAssurances = biens.reduce((s, b) => s + b.assurances.length, 0);
  const totalActives = biens.reduce((s, b) => s + b.assurances.filter(a => a.statut === "Actif").length, 0);
  const totalExpirees = biens.reduce((s, b) => s + b.assurances.filter(a => a.statut === "Expiré").length, 0);
  const biensSansAssurance = biens.filter(b => b.assurances.length === 0).length;

  const biensFiltres = biens.filter(b =>
    b.nom.toLowerCase().includes(recherche.toLowerCase()) ||
    b.adresse.toLowerCase().includes(recherche.toLowerCase()) ||
    b.reference.toLowerCase().includes(recherche.toLowerCase())
  );

  // Vue détail assurance
  if (assuranceSelectionnee && bienSelectionne) {
    return (
      <DetailAssurance
        assurance={assuranceSelectionnee}
        bien={bienSelectionne}
        onRetour={() => setAssuranceSelectionnee(null)}
      />
    );
  }

  // Vue fiche bien
  if (bienSelectionne) {
    return (
      <FicheBien
        bien={bienSelectionne}
        onRetour={() => setBienSelectionne(null)}
        onVoirAssurance={(a) => setAssuranceSelectionnee(a)}
        onAjouterAssurance={() => setShowModalAjout(true)}
        showModal={showModalAjout}
        onCloseModal={() => setShowModalAjout(false)}
      />
    );
  }

  // Vue liste des biens
  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8" style={{ backgroundColor: "#FDF6EC" }}>
      <div className="max-w-7xl mx-auto">

        {/* ── HEADER ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800 flex items-center gap-2">
              🛡️ Mes Assurances
            </h1>
            <p className="text-gray-500 text-sm mt-1">Gérez les contrats d'assurance de vos biens</p>
          </div>
        </div>

        {/* ── KPI CARDS ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <KpiCard emoji="📋" value={totalAssurances} label="Contrats enregistrés" gradient="linear-gradient(135deg, #f97316, #fb923c)" />
          <KpiCard emoji="✅" value={totalActives} label="Contrats actifs" gradient="linear-gradient(135deg, #10b981, #34d399)" />
          <KpiCard emoji="⚠️" value={totalExpirees} label="Expirés / À renouveler" gradient="linear-gradient(135deg, #f43f5e, #fb7185)" />
          <KpiCard emoji="🏠" value={biensSansAssurance} label="Biens sans assurance" gradient="linear-gradient(135deg, #8b5cf6, #a78bfa)" />
        </div>

        {/* ── BARRE RECHERCHE ── */}
        <div className="bg-white rounded-3xl p-4 mb-4 shadow-sm">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">🔍</span>
            <input
              type="text"
              placeholder="Rechercher un bien, une adresse…"
              value={recherche}
              onChange={e => setRecherche(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl text-sm outline-none text-gray-700 placeholder-gray-400 font-medium"
              style={{ backgroundColor: "#FDF6EC" }}
            />
          </div>
        </div>

        {/* ── LISTE DES BIENS ── */}
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden">

          {/* Header tableau desktop */}
          <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-100">
            {["RÉFÉRENCE", "BIEN", "STATUT", "ASSURANCES", "ACTION"].map(h => (
              <div key={h} className={`text-xs font-extrabold text-gray-400 uppercase tracking-wider ${h === "BIEN" ? "col-span-4" : h === "ACTION" ? "col-span-2 text-right" : "col-span-2"}`}>
                {h}
              </div>
            ))}
          </div>

          {/* Lignes */}
          <div className="divide-y divide-gray-50">
            {biensFiltres.map(bien => {
              const cfg = statutBienConfig[bien.statut];
              const nbActifs = bien.assurances.filter(a => a.statut === "Actif").length;
              const nbExpires = bien.assurances.filter(a => a.statut !== "Actif").length;

              return (
                <div
                  key={bien.id}
                  onClick={() => setBienSelectionne(bien)}
                  className="flex flex-col sm:grid sm:grid-cols-12 gap-3 sm:gap-4 px-4 sm:px-6 py-4 hover:bg-orange-50 transition-all cursor-pointer group"
                >
                  {/* Référence */}
                  <div className="sm:col-span-2 flex items-center">
                    <span className="text-sm font-extrabold" style={{ color: "#f97316" }}>{bien.reference}</span>
                  </div>

                  {/* Nom + adresse */}
                  <div className="sm:col-span-4">
                    <p className="text-sm font-extrabold text-gray-800">{bien.nom}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{bien.adresse}</p>
                  </div>

                  {/* Statut */}
                  <div className="sm:col-span-2 flex items-center">
                    <span className="px-3 py-1 rounded-full text-xs font-extrabold" style={{ backgroundColor: cfg.bg, color: cfg.color }}>
                      {cfg.label}
                    </span>
                  </div>

                  {/* Assurances */}
                  <div className="sm:col-span-2 flex items-center gap-2">
                    {bien.assurances.length === 0 ? (
                      <span className="text-xs text-gray-400 italic">Aucune assurance</span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {nbActifs > 0 && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ backgroundColor: "#dcfce7", color: "#16a34a" }}>
                            {nbActifs} actif{nbActifs > 1 ? "s" : ""}
                          </span>
                        )}
                        {nbExpires > 0 && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ backgroundColor: "#fee2e2", color: "#dc2626" }}>
                            {nbExpires} expiré{nbExpires > 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Action */}
                  <div className="sm:col-span-2 flex items-center sm:justify-end">
                    <button className="text-sm font-extrabold transition-colors" style={{ color: "#f97316" }}>
                      Voir →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {biensFiltres.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <div className="text-5xl mb-3">🔍</div>
              <p className="font-bold text-gray-500">Aucun bien trouvé</p>
              <p className="text-sm mt-1">Modifiez votre recherche</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// FICHE BIEN
// ═══════════════════════════════════════════════════
function FicheBien({
  bien,
  onRetour,
  onVoirAssurance,
  onAjouterAssurance,
  showModal,
  onCloseModal,
}: {
  bien: Bien;
  onRetour: () => void;
  onVoirAssurance: (a: Assurance) => void;
  onAjouterAssurance: () => void;
  showModal: boolean;
  onCloseModal: () => void;
}) {
  const cfg = statutBienConfig[bien.statut];

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8" style={{ backgroundColor: "#FDF6EC" }}>
      <div className="max-w-5xl mx-auto">

        {/* ── HEADER ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={onRetour}
              className="w-10 h-10 rounded-2xl flex items-center justify-center font-extrabold text-gray-600 hover:bg-white transition shadow-sm"
              style={{ backgroundColor: "#FDF6EC" }}
            >
              ←
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-gray-800">{bien.nom}</h1>
              <p className="text-sm text-gray-400">{bien.adresse}</p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-extrabold hidden sm:inline-block" style={{ backgroundColor: cfg.bg, color: cfg.color }}>
              {cfg.label}
            </span>
          </div>
          <button
            onClick={onAjouterAssurance}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl text-white text-sm font-extrabold shadow-lg transition active:scale-95"
            style={{ background: "linear-gradient(135deg, #f97316, #fb923c)" }}
          >
            + Ajouter une assurance
          </button>
        </div>

        {/* ── CONTENU ── */}
        {bien.assurances.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">🛡️</div>
            <p className="text-xl font-extrabold text-gray-700 mb-2">Aucune assurance enregistrée</p>
            <p className="text-sm text-gray-400 mb-6">Ajoutez votre premier contrat d'assurance pour ce bien</p>
            <button
              onClick={onAjouterAssurance}
              className="px-6 py-3 rounded-2xl text-white text-sm font-extrabold shadow-lg"
              style={{ background: "linear-gradient(135deg, #f97316, #fb923c)" }}
            >
              + Ajouter une assurance
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {bien.assurances.map(assurance => {
              const statutCfg = statutContratConfig[assurance.statut];
              return (
                <div
                  key={assurance.id}
                  className="bg-white rounded-3xl shadow-sm p-5 sm:p-6 hover:shadow-md transition-all cursor-pointer"
                  onClick={() => onVoirAssurance(assurance)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">

                    {/* Emoji + type */}
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                        style={{ backgroundColor: "#FDF6EC" }}>
                        {getEmojiType(assurance.type)}
                      </div>
                      <div>
                        <p className="font-extrabold text-gray-800 text-base">{assurance.type}</p>
                        <p className="text-sm text-gray-500">{assurance.assureur} · {assurance.numeroContrat}</p>
                      </div>
                    </div>

                    {/* Infos */}
                    <div className="flex flex-wrap gap-4 sm:gap-6 text-sm">
                      <div>
                        <p className="text-xs text-gray-400 font-semibold mb-0.5">Début</p>
                        <p className="font-extrabold text-gray-700">{assurance.dateDebut}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 font-semibold mb-0.5">Échéance</p>
                        <p className="font-extrabold text-gray-700">{assurance.dateEcheance}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 font-semibold mb-0.5">Prime</p>
                        <p className="font-extrabold text-gray-700">{assurance.montantPrime}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 font-semibold mb-0.5">Docs</p>
                        <p className="font-extrabold text-gray-700">{assurance.documents.length} fichier{assurance.documents.length > 1 ? "s" : ""}</p>
                      </div>
                    </div>

                    {/* Statut */}
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 rounded-full text-xs font-extrabold"
                        style={{ backgroundColor: statutCfg.bg, color: statutCfg.color }}>
                        {assurance.statut}
                      </span>
                      <span className="text-gray-400 font-bold text-lg">→</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── MODAL AJOUT ── */}
      {showModal && <ModalAjoutAssurance onClose={onCloseModal} />}
    </div>
  );
}

// ═══════════════════════════════════════════════════
// DETAIL ASSURANCE
// ═══════════════════════════════════════════════════
function DetailAssurance({ assurance, bien, onRetour }: { assurance: Assurance; bien: Bien; onRetour: () => void }) {
  const [documents, setDocuments] = useState<Document[]>(assurance.documents);
  const statutCfg = statutContratConfig[assurance.statut];

  function handleUpload() {
    const newDoc: Document = {
      id: `d${Date.now()}`,
      nom: `Nouveau document ${documents.length + 1}.pdf`,
      type: "Document",
      date: new Date().toLocaleDateString("fr-FR"),
      taille: "0,8 Mo",
    };
    setDocuments(prev => [...prev, newDoc]);
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8" style={{ backgroundColor: "#FDF6EC" }}>
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={onRetour}
            className="w-10 h-10 rounded-2xl flex items-center justify-center font-extrabold text-gray-600 hover:bg-white transition shadow-sm"
            style={{ backgroundColor: "#FDF6EC" }}
          >
            ←
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-800">{assurance.type}</h1>
            <p className="text-sm text-gray-400">{bien.nom} · {assurance.assureur}</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">

          {/* ── Infos contrat ── */}
          <div className="bg-white rounded-3xl shadow-sm p-5 sm:p-6">
            <h2 className="text-base font-extrabold text-gray-700 mb-4 flex items-center gap-2">
              📋 Informations du contrat
            </h2>
            <div className="space-y-4">
              {[
                { label: "Type d'assurance", value: assurance.type },
                { label: "Assureur", value: assurance.assureur },
                { label: "N° de contrat", value: assurance.numeroContrat },
                { label: "Date de souscription", value: assurance.dateDebut },
                { label: "Date d'échéance", value: assurance.dateEcheance },
                { label: "Prime annuelle", value: assurance.montantPrime },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center py-2 border-b border-gray-50">
                  <span className="text-sm text-gray-400 font-semibold">{label}</span>
                  <span className="text-sm font-extrabold text-gray-700">{value}</span>
                </div>
              ))}
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-400 font-semibold">Statut</span>
                <span className="px-3 py-1 rounded-full text-xs font-extrabold"
                  style={{ backgroundColor: statutCfg.bg, color: statutCfg.color }}>
                  {assurance.statut}
                </span>
              </div>
            </div>
          </div>

          {/* ── Documents ── */}
          <div className="bg-white rounded-3xl shadow-sm p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-extrabold text-gray-700 flex items-center gap-2">
                📁 Documents
              </h2>
              <button
                onClick={handleUpload}
                className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-extrabold text-white shadow"
                style={{ background: "linear-gradient(135deg, #f97316, #fb923c)" }}
              >
                + Ajouter
              </button>
            </div>

            {documents.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <div className="text-4xl mb-2">📂</div>
                <p className="text-sm font-semibold">Aucun document</p>
              </div>
            ) : (
              <div className="space-y-3">
                {documents.map(doc => (
                  <div key={doc.id} className="flex items-center gap-3 p-3 rounded-2xl group"
                    style={{ backgroundColor: "#FDF6EC" }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0 bg-white">
                      📄
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-extrabold text-gray-700 truncate">{doc.nom}</p>
                      <p className="text-xs text-gray-400">{doc.type} · {doc.date} · {doc.taille}</p>
                    </div>
                    <button
                      className="text-xs font-extrabold flex-shrink-0 transition"
                      style={{ color: "#f97316" }}
                    >
                      ↓
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Zone de dépôt */}
            <button
              onClick={handleUpload}
              className="w-full mt-4 border-2 border-dashed rounded-2xl py-4 text-sm font-extrabold transition hover:border-orange-400"
              style={{ borderColor: "#fdba74", color: "#f97316", backgroundColor: "#fff7ed" }}
            >
              📎 Déposer un document
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// MODAL AJOUT ASSURANCE
// ═══════════════════════════════════════════════════
function ModalAjoutAssurance({ onClose }: { onClose: () => void }) {
  const [etape, setEtape] = useState(1);
  const [form, setForm] = useState({
    type: "",
    assureur: "",
    numeroContrat: "",
    dateDebut: "",
    dateEcheance: "",
    montantPrime: "",
  });

  const etapes = ["Type", "Détails", "Documents"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">

        {/* Header modal */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-extrabold text-gray-800">🛡️ Ajouter une assurance</h2>
            <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-100 font-bold transition">
              ✕
            </button>
          </div>

          {/* Étapes */}
          <div className="flex gap-2">
            {etapes.map((label, i) => {
              const num = i + 1;
              const actif = etape === num;
              const fait = etape > num;
              return (
                <div key={label} className="flex items-center gap-2 flex-1">
                  <div className={`flex items-center gap-2 flex-1 ${i > 0 ? "ml-2" : ""}`}>
                    {i > 0 && <div className="h-px flex-1" style={{ backgroundColor: fait ? "#f97316" : "#e5e7eb" }} />}
                    <div className="flex items-center gap-1.5">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold transition"
                        style={{
                          backgroundColor: actif ? "#f97316" : fait ? "#fed7aa" : "#f3f4f6",
                          color: actif ? "#fff" : fait ? "#f97316" : "#9ca3af",
                        }}>
                        {fait ? "✓" : num}
                      </div>
                      <span className="text-xs font-bold hidden sm:block"
                        style={{ color: actif ? "#f97316" : fait ? "#f97316" : "#9ca3af" }}>
                        {label}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="px-6 pb-6">

          {/* Étape 1 */}
          {etape === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-extrabold text-gray-700 mb-2">Type d'assurance *</label>
                <select
                  value={form.type}
                  onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                  className="w-full px-4 py-3 rounded-2xl text-sm font-semibold outline-none border-2 transition"
                  style={{
                    backgroundColor: "#FDF6EC",
                    borderColor: form.type ? "#f97316" : "#e5e7eb",
                    color: form.type ? "#374151" : "#9ca3af",
                  }}
                >
                  <option value="">Sélectionner un type…</option>
                  {typesAssurance.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-extrabold text-gray-700 mb-2">Compagnie d'assurance *</label>
                <input
                  type="text"
                  placeholder="Ex : Allianz, MMA, AXA…"
                  value={form.assureur}
                  onChange={e => setForm(f => ({ ...f, assureur: e.target.value }))}
                  className="w-full px-4 py-3 rounded-2xl text-sm font-semibold outline-none border-2 transition"
                  style={{ backgroundColor: "#FDF6EC", borderColor: form.assureur ? "#f97316" : "#e5e7eb" }}
                />
              </div>
            </div>
          )}

          {/* Étape 2 */}
          {etape === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-extrabold text-gray-700 mb-2">Numéro de contrat</label>
                <input
                  type="text"
                  placeholder="Ex : ALZ-2024-00142"
                  value={form.numeroContrat}
                  onChange={e => setForm(f => ({ ...f, numeroContrat: e.target.value }))}
                  className="w-full px-4 py-3 rounded-2xl text-sm font-semibold outline-none border-2 transition"
                  style={{ backgroundColor: "#FDF6EC", borderColor: form.numeroContrat ? "#f97316" : "#e5e7eb" }}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-extrabold text-gray-700 mb-2">Date de début *</label>
                  <input
                    type="date"
                    value={form.dateDebut}
                    onChange={e => setForm(f => ({ ...f, dateDebut: e.target.value }))}
                    className="w-full px-4 py-3 rounded-2xl text-sm font-semibold outline-none border-2 transition"
                    style={{ backgroundColor: "#FDF6EC", borderColor: form.dateDebut ? "#f97316" : "#e5e7eb" }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-extrabold text-gray-700 mb-2">Date d'échéance</label>
                  <input
                    type="date"
                    value={form.dateEcheance}
                    onChange={e => setForm(f => ({ ...f, dateEcheance: e.target.value }))}
                    className="w-full px-4 py-3 rounded-2xl text-sm font-semibold outline-none border-2 transition"
                    style={{ backgroundColor: "#FDF6EC", borderColor: form.dateEcheance ? "#f97316" : "#e5e7eb" }}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-extrabold text-gray-700 mb-2">Montant de la prime</label>
                <input
                  type="text"
                  placeholder="Ex : 180 €/an"
                  value={form.montantPrime}
                  onChange={e => setForm(f => ({ ...f, montantPrime: e.target.value }))}
                  className="w-full px-4 py-3 rounded-2xl text-sm font-semibold outline-none border-2 transition"
                  style={{ backgroundColor: "#FDF6EC", borderColor: form.montantPrime ? "#f97316" : "#e5e7eb" }}
                />
              </div>
            </div>
          )}

          {/* Étape 3 */}
          {etape === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500 font-semibold">
                Déposez le contrat ou tout document associé à cette assurance.
              </p>
              <button
                className="w-full border-2 border-dashed rounded-2xl py-10 text-center transition hover:border-orange-400"
                style={{ borderColor: "#fdba74", backgroundColor: "#fff7ed" }}
              >
                <div className="text-4xl mb-2">📎</div>
                <p className="text-sm font-extrabold" style={{ color: "#f97316" }}>Cliquez pour ajouter un fichier</p>
                <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG · max 10 Mo</p>
              </button>
              <div className="p-4 rounded-2xl" style={{ backgroundColor: "#FDF6EC" }}>
                <p className="text-xs text-gray-500 font-semibold text-center">Aucun document ajouté</p>
              </div>
              <p className="text-xs text-gray-400 text-center">
                Vous pourrez ajouter des documents ultérieurement depuis la fiche de l'assurance.
              </p>
            </div>
          )}

          {/* Boutons navigation */}
          <div className="flex gap-3 mt-6">
            {etape > 1 && (
              <button
                onClick={() => setEtape(e => e - 1)}
                className="flex-1 py-3 rounded-2xl text-sm font-extrabold border-2 transition"
                style={{ borderColor: "#e5e7eb", color: "#6b7280" }}
              >
                ← Retour
              </button>
            )}
            {etape < 3 ? (
              <button
                onClick={() => setEtape(e => e + 1)}
                disabled={etape === 1 && (!form.type || !form.assureur)}
                className="flex-1 py-3 rounded-2xl text-sm font-extrabold text-white shadow-lg transition disabled:opacity-40"
                style={{ background: "linear-gradient(135deg, #f97316, #fb923c)" }}
              >
                Continuer →
              </button>
            ) : (
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-2xl text-sm font-extrabold text-white shadow-lg transition"
                style={{ background: "linear-gradient(135deg, #f97316, #fb923c)" }}
              >
                ✓ Enregistrer l'assurance
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
