"use client";

import { useState } from "react";
import { FileText, TrendingUp, ChevronDown, ChevronUp, BookOpen } from "lucide-react";

type TypeIndice = "IRL" | "ILAT" | "ICC";

type IndiceEntry = {
  type: TypeIndice;
  trimestre: string;
  annee: number;
  valeur: number;
};

type RevisionLoyer = {
  id: number;
  date: string;
  ancienLoyer: number;
  nouveauLoyer: number;
  indiceRef: number;
  nouvelIndice: number;
  trimestreRef: string;
  nouveauTrimestre: string;
  typeIndice: TypeIndice;
};

type Contrat = {
  id: number;
  locataire: string;
  bien: string;
  loyer: number;
  typeIndice: TypeIndice;
  trimestreRef: string;
  anneeRef: number;
  indiceRef: number;
  revisionsLoyer: RevisionLoyer[];
};

const bibliothequeIndices: IndiceEntry[] = [
  { type: "IRL", trimestre: "T1", annee: 2024, valeur: 142.06 },
  { type: "IRL", trimestre: "T2", annee: 2024, valeur: 143.46 },
  { type: "IRL", trimestre: "T3", annee: 2024, valeur: 144.21 },
  { type: "IRL", trimestre: "T4", annee: 2024, valeur: 145.10 },
  { type: "IRL", trimestre: "T1", annee: 2025, valeur: 145.98 },
  { type: "IRL", trimestre: "T2", annee: 2025, valeur: 146.72 },
  { type: "ILAT", trimestre: "T1", annee: 2024, valeur: 132.14 },
  { type: "ILAT", trimestre: "T2", annee: 2024, valeur: 133.52 },
  { type: "ILAT", trimestre: "T3", annee: 2024, valeur: 134.10 },
  { type: "ILAT", trimestre: "T4", annee: 2024, valeur: 135.00 },
  { type: "ILAT", trimestre: "T1", annee: 2025, valeur: 135.87 },
  { type: "ILAT", trimestre: "T2", annee: 2025, valeur: 136.55 },
  { type: "ICC", trimestre: "T1", annee: 2024, valeur: 118.32 },
  { type: "ICC", trimestre: "T2", annee: 2024, valeur: 119.10 },
  { type: "ICC", trimestre: "T3", annee: 2024, valeur: 120.05 },
  { type: "ICC", trimestre: "T4", annee: 2024, valeur: 120.88 },
  { type: "ICC", trimestre: "T1", annee: 2025, valeur: 121.45 },
  { type: "ICC", trimestre: "T2", annee: 2025, valeur: 122.10 },
];

const contratsInitiaux: Contrat[] = [
  {
    id: 1,
    locataire: "Jean Dupont",
    bien: "Appartement Paris 11",
    loyer: 850,
    typeIndice: "IRL",
    trimestreRef: "T2",
    anneeRef: 2024,
    indiceRef: 143.46,
    revisionsLoyer: [],
  },
  {
    id: 2,
    locataire: "Marie Martin",
    bien: "Studio Lyon",
    loyer: 520,
    typeIndice: "IRL",
    trimestreRef: "T2",
    anneeRef: 2024,
    indiceRef: 143.46,
    revisionsLoyer: [],
  },
  {
    id: 3,
    locataire: "SAS Techpro",
    bien: "Bureaux Bordeaux",
    loyer: 2100,
    typeIndice: "ILAT",
    trimestreRef: "T1",
    anneeRef: 2024,
    indiceRef: 132.14,
    revisionsLoyer: [],
  },
  {
    id: 4,
    locataire: "SARL Commerce Plus",
    bien: "Local commercial Nantes",
    loyer: 1800,
    typeIndice: "ICC",
    trimestreRef: "T1",
    anneeRef: 2024,
    indiceRef: 118.32,
    revisionsLoyer: [],
  },
];

const anneesDisponibles = Array.from(
  new Set(bibliothequeIndices.map((i) => i.annee))
).sort((a, b) => a - b);

// Couleurs des badges indices — reprises de la palette Clavisse
const badgeStyle: Record<TypeIndice, { bg: string; text: string }> = {
  IRL:  { bg: "bg-[#4DD9C0]/20", text: "text-[#2aA898]" },   // teal — Baux actifs
  ILAT: { bg: "bg-[#B57BEE]/20", text: "text-[#8B4DC8]" },   // violet — Revenus mensuels
  ICC:  { bg: "bg-[#F87098]/20", text: "text-[#E04070]" },   // rose-rouge — Résiliés
};

export default function IndexationLoyers() {
  const [activeTab, setActiveTab] = useState<"revisions" | "bibliotheque">("revisions");
  const [contrats, setContrats] = useState<Contrat[]>(contratsInitiaux);
  const [selectedContrat, setSelectedContrat] = useState<Contrat | null>(null);
  const [anneeSelectionnee, setAnneeSelectionnee] = useState<string>("");
  const [showHistorique, setShowHistorique] = useState<number | null>(null);
  const [filtreIndice, setFiltreIndice] = useState<TypeIndice | "TOUS">("TOUS");
  const [successMsg, setSuccessMsg] = useState("");

  const trouverIndice = (type: TypeIndice, trimestre: string, annee: number) =>
    bibliothequeIndices.find(
      (i) => i.type === type && i.trimestre === trimestre && i.annee === annee
    );

  const calculerNouveauLoyer = (loyer: number, indiceRef: number, nouvelIndice: number) =>
    Math.round((loyer * nouvelIndice) / indiceRef * 100) / 100;

  const indiceSelectionne =
    selectedContrat && anneeSelectionnee
      ? trouverIndice(selectedContrat.typeIndice, selectedContrat.trimestreRef, parseInt(anneeSelectionnee))
      : null;

  const nouveauLoyerApercu =
    selectedContrat && indiceSelectionne
      ? calculerNouveauLoyer(selectedContrat.loyer, selectedContrat.indiceRef, indiceSelectionne.valeur)
      : null;

  const handleRevision = () => {
    if (!selectedContrat || !indiceSelectionne) return;

    const revision: RevisionLoyer = {
      id: Date.now(),
      date: new Date().toLocaleDateString("fr-FR"),
      ancienLoyer: selectedContrat.loyer,
      nouveauLoyer: nouveauLoyerApercu!,
      indiceRef: selectedContrat.indiceRef,
      nouvelIndice: indiceSelectionne.valeur,
      trimestreRef: `${selectedContrat.trimestreRef} ${selectedContrat.anneeRef}`,
      nouveauTrimestre: `${indiceSelectionne.trimestre} ${indiceSelectionne.annee}`,
      typeIndice: selectedContrat.typeIndice,
    };

    setContrats((prev) =>
      prev.map((c) =>
        c.id === selectedContrat.id
          ? {
              ...c,
              loyer: nouveauLoyerApercu!,
              indiceRef: indiceSelectionne.valeur,
              anneeRef: indiceSelectionne.annee,
              revisionsLoyer: [revision, ...c.revisionsLoyer],
            }
          : c
      )
    );

    setSuccessMsg(`Révision validée pour ${selectedContrat.locataire} — Nouveau loyer : ${nouveauLoyerApercu} €`);
    setSelectedContrat(null);
    setAnneeSelectionnee("");
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const indicesFiltres =
    filtreIndice === "TOUS" ? bibliothequeIndices : bibliothequeIndices.filter((i) => i.type === filtreIndice);

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Indexation des loyers</h1>
        <p className="text-gray-500 mt-1">Révisez les loyers selon les indices IRL, ILAT ou ICC</p>
      </div>

      {/* Succès */}
      {successMsg && (
        <div className="bg-[#4DD9C0]/15 border border-[#4DD9C0] text-[#1a9a8a] rounded-xl px-4 py-3 text-sm font-medium">
          ✅ {successMsg}
        </div>
      )}

      {/* Onglets */}
      <div className="flex gap-2 border-b border-gray-200">
        {[
          { key: "revisions", label: "Révisions de loyer", icon: <TrendingUp size={16} /> },
          { key: "bibliotheque", label: "Bibliothèque des indices", icon: <BookOpen size={16} /> },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold border-b-2 transition ${
              activeTab === tab.key
                ? "border-[#F97316] text-[#F97316]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Onglet Révisions ── */}
      {activeTab === "revisions" && (
        <div className="space-y-4">
          {contrats.map((contrat) => (
            <div key={contrat.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-gray-800">{contrat.locataire}</p>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${badgeStyle[contrat.typeIndice].bg} ${badgeStyle[contrat.typeIndice].text}`}
                    >
                      {contrat.typeIndice}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{contrat.bien}</p>
                  <div className="flex flex-wrap gap-4 mt-1 text-sm text-gray-600">
                    <span>Loyer actuel : <strong>{contrat.loyer} €</strong></span>
                    <span>Indice réf. : <strong>{contrat.indiceRef}</strong> ({contrat.trimestreRef} {contrat.anneeRef})</span>
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => setShowHistorique(showHistorique === contrat.id ? null : contrat.id)}
                    className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg transition"
                  >
                    <FileText size={15} />
                    Historique
                    {showHistorique === contrat.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                  <button
                    onClick={() => { setSelectedContrat(contrat); setAnneeSelectionnee(""); }}
                    className="bg-gradient-to-r from-[#F97316] to-[#FBBF24] hover:opacity-90 text-white text-sm font-semibold px-4 py-2 rounded-lg transition shadow-sm"
                  >
                    Nouvelle révision
                  </button>
                </div>
              </div>

              {/* Historique */}
              {showHistorique === contrat.id && (
                <div className="border-t border-gray-100 bg-gray-50 px-4 md:px-6 py-4">
                  {contrat.revisionsLoyer.length === 0 ? (
                    <p className="text-sm text-gray-400">Aucune révision effectuée.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead>
                          <tr className="text-gray-400 text-xs uppercase">
                            <th className="pb-2 pr-4">Date</th>
                            <th className="pb-2 pr-4">Indice</th>
                            <th className="pb-2 pr-4">Trimestre réf.</th>
                            <th className="pb-2 pr-4">Nouveau trimestre</th>
                            <th className="pb-2 pr-4">Ancien loyer</th>
                            <th className="pb-2">Nouveau loyer</th>
                          </tr>
                        </thead>
                        <tbody>
                          {contrat.revisionsLoyer.map((r) => (
                            <tr key={r.id} className="border-t border-gray-100">
                              <td className="py-2 pr-4 text-gray-600">{r.date}</td>
                              <td className="py-2 pr-4">
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${badgeStyle[r.typeIndice].bg} ${badgeStyle[r.typeIndice].text}`}>
                                  {r.typeIndice}
                                </span>
                              </td>
                              <td className="py-2 pr-4 text-gray-600">{r.trimestreRef}</td>
                              <td className="py-2 pr-4 text-gray-600">{r.nouveauTrimestre}</td>
                              <td className="py-2 pr-4 text-gray-600">{r.ancienLoyer} €</td>
                              <td className="py-2 font-semibold text-[#2aA898]">{r.nouveauLoyer} €</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Onglet Bibliothèque ── */}
      {activeTab === "bibliotheque" && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Filtres */}
          <div className="p-4 md:p-6 border-b border-gray-100 flex flex-wrap gap-2">
            <button
              onClick={() => setFiltreIndice("TOUS")}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${
                filtreIndice === "TOUS"
                  ? "bg-gradient-to-r from-[#F97316] to-[#FBBF24] text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Tous
            </button>
            {(["IRL", "ILAT", "ICC"] as TypeIndice[]).map((f) => (
              <button
                key={f}
                onClick={() => setFiltreIndice(f)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${
                  filtreIndice === f
                    ? `${badgeStyle[f].bg} ${badgeStyle[f].text} ring-1 ring-current`
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Tableau */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-400 text-xs uppercase">
                <tr>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Trimestre</th>
                  <th className="px-6 py-3">Année</th>
                  <th className="px-6 py-3">Valeur</th>
                </tr>
              </thead>
              <tbody>
                {indicesFiltres.map((indice, idx) => (
                  <tr key={idx} className="border-t border-gray-100 hover:bg-gray-50 transition">
                    <td className="px-6 py-3">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${badgeStyle[indice.type].bg} ${badgeStyle[indice.type].text}`}>
                        {indice.type}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-gray-700 font-medium">{indice.trimestre}</td>
                    <td className="px-6 py-3 text-gray-700">{indice.annee}</td>
                    <td className="px-6 py-3 font-semibold text-gray-800">{indice.valeur}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Modal Nouvelle révision ── */}
      {selectedContrat && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md space-y-5 p-6">
            {/* Header */}
            <div>
              <h2 className="text-lg font-bold text-gray-800">Nouvelle révision de loyer</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {selectedContrat.locataire} — {selectedContrat.bien}
              </p>
            </div>

            {/* Infos préremplies */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Type d'indice</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${badgeStyle[selectedContrat.typeIndice].bg} ${badgeStyle[selectedContrat.typeIndice].text}`}>
                  {selectedContrat.typeIndice}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Trimestre de référence</span>
                <span className="font-medium text-gray-800">{selectedContrat.trimestreRef}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Indice de référence</span>
                <span className="font-medium text-gray-800">
                  {selectedContrat.indiceRef} ({selectedContrat.trimestreRef} {selectedContrat.anneeRef})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Loyer actuel</span>
                <span className="font-semibold text-gray-800">{selectedContrat.loyer} €</span>
              </div>
            </div>

            {/* Sélection année */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Année du nouvel indice <span className="text-red-500">*</span>
              </label>
              <select
                value={anneeSelectionnee}
                onChange={(e) => setAnneeSelectionnee(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F97316]"
              >
                <option value="">Sélectionnez une année</option>
                {anneesDisponibles.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
              <p className="text-xs text-gray-400 mt-1">
                Le trimestre ({selectedContrat.trimestreRef}) et le type ({selectedContrat.typeIndice}) sont repris automatiquement depuis le bail.
              </p>
            </div>

            {/* Indice non trouvé */}
            {anneeSelectionnee && !indiceSelectionne && (
              <div className="bg-[#F87098]/10 border border-[#F87098] text-[#E04070] rounded-xl px-4 py-3 text-sm">
                ⚠️ Aucun indice {selectedContrat.typeIndice} {selectedContrat.trimestreRef} {anneeSelectionnee} dans la bibliothèque.
              </div>
            )}

            {/* Aperçu calcul */}
            {indiceSelectionne && nouveauLoyerApercu && (
              <div className="bg-[#4DD9C0]/10 rounded-xl p-4 space-y-2 text-sm border border-[#4DD9C0]/40">
                <div className="flex justify-between">
                  <span className="text-[#1a9a8a]">Nouvel indice trouvé</span>
                  <span className="font-semibold text-[#1a9a8a]">{indiceSelectionne.valeur}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#1a9a8a]">Nouveau loyer calculé</span>
                  <span className="font-bold text-[#1a9a8a] text-base">{nouveauLoyerApercu} €</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#1a9a8a]">Variation</span>
                  <span className={`font-semibold ${nouveauLoyerApercu > selectedContrat.loyer ? "text-[#2aA898]" : "text-[#E04070]"}`}>
                    {nouveauLoyerApercu > selectedContrat.loyer ? "+" : ""}
                    {(nouveauLoyerApercu - selectedContrat.loyer).toFixed(2)} €
                  </span>
                </div>
                <p className="text-xs text-[#4DD9C0] pt-1">
                  Formule : {selectedContrat.loyer} × {indiceSelectionne.valeur} / {selectedContrat.indiceRef}
                </p>
              </div>
            )}

            {/* Boutons */}
            <div className="flex gap-3 pt-1">
              <button
                onClick={() => { setSelectedContrat(null); setAnneeSelectionnee(""); }}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 rounded-xl transition text-sm"
              >
                Annuler
              </button>
              <button
                onClick={handleRevision}
                disabled={!indiceSelectionne}
                className="flex-1 bg-gradient-to-r from-[#F97316] to-[#FBBF24] hover:opacity-90 disabled:opacity-40 text-white font-semibold py-2 rounded-xl transition text-sm shadow-sm"
              >
                Valider la révision
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
