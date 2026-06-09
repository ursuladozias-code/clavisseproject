"use client";

import { useState } from "react";
import {
  Calculator,
  Home,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  FileText,
  Download,
  Send,
  CheckCircle,
  XCircle,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Locataire = {
  id: number;
  nom: string;
  prenom: string;
  bien: string;
  charges: number;
  dateEntree: string;
  dateSortie?: string;
  depotGarantieActif: boolean;
};

type PosteCharge = {
  id: string;
  categorie: string;
  label: string;
  montant: number;
};

type AutreCharge = {
  id: string;
  label: string;
  montant: number;
};

type Resultat = {
  totalChargesReelles: number;
  totalChargesProrata: number;
  provisionsPercues: number;
  solde: number;
  moisOccupes: number;
  jours: number;
  totalJoursAnnee: number;
  tauxOccupation: number;
};

// ─── Mock Data ────────────────────────────────────────────────────────────────

const locatairesMock: Locataire[] = [
  {
    id: 1,
    nom: "Dupont",
    prenom: "Jean",
    bien: "Appartement – 12 rue Victor Hugo",
    charges: 80,
    dateEntree: "2024-01-01",
    depotGarantieActif: true,
  },
  {
    id: 2,
    nom: "Martin",
    prenom: "Marie",
    bien: "Studio – 8 rue des Fleurs",
    charges: 50,
    dateEntree: "2024-04-15",
    depotGarantieActif: true,
  },
  {
    id: 3,
    nom: "Petit",
    prenom: "Sophie",
    bien: "Appartement – 5 avenue Foch",
    charges: 60,
    dateEntree: "2024-03-01",
    dateSortie: "2024-11-15",
    depotGarantieActif: false,
  },
];

const categoriesCharges: { categorie: string; postes: string[] }[] = [
  { categorie: "Eau", postes: ["Eau froide", "Eau chaude", "Assainissement"] },
  { categorie: "Ascenseur", postes: ["Électricité", "Entretien courant", "Petites réparations"] },
  { categorie: "Chauffage collectif", postes: ["Combustible", "Entretien", "Exploitation"] },
  {
    categorie: "Parties communes",
    postes: ["Électricité des parties communes", "Produits d'entretien", "Prestations de nettoyage", "Entretien courant"],
  },
  { categorie: "Espaces verts", postes: ["Entretien", "Arrosage", "Élagage"] },
  {
    categorie: "Taxes récupérables",
    postes: ["Taxe d'enlèvement des ordures ménagères (TEOM)", "Taxe de balayage"],
  },
  { categorie: "Personnel d'immeuble", postes: ["Gardien", "Employé d'immeuble"] },
];

// ─── Helper ───────────────────────────────────────────────────────────────────

function calculerOccupation(dateEntree: string, dateSortie: string | undefined, annee: number) {
  const debutAnnee = new Date(`${annee}-01-01`);
  const finAnnee = new Date(`${annee}-12-31`);
  const entree = new Date(dateEntree);
  const sortie = dateSortie ? new Date(dateSortie) : finAnnee;

  const debut = entree > debutAnnee ? entree : debutAnnee;
  const fin = sortie < finAnnee ? sortie : finAnnee;

  if (debut > fin) return { mois: 0, jours: 0, totalJoursAnnee: 365, taux: 0 };

  const jours = Math.ceil((fin.getTime() - debut.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const totalJoursAnnee = annee % 4 === 0 ? 366 : 365;
  const taux = jours / totalJoursAnnee;
  const mois = parseFloat((taux * 12).toFixed(1));

  return { mois, jours, totalJoursAnnee, taux };
}

function fmt(n: number) {
  return n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ─── Composant ────────────────────────────────────────────────────────────────

export default function RegularisationCharges() {
  const ANNEE = 2024;

  const [etape, setEtape] = useState<1 | 2 | 3>(1);
  const [locataire, setLocataire] = useState<Locataire | null>(null);
  const [catsOuvertes, setCatsOuvertes] = useState<string[]>(["Eau"]);
  const [postes, setPostes] = useState<PosteCharge[]>(() =>
    categoriesCharges.flatMap((cat) =>
      cat.postes.map((p) => ({ id: `${cat.categorie}||${p}`, categorie: cat.categorie, label: p, montant: 0 }))
    )
  );
  const [autres, setAutres] = useState<AutreCharge[]>([]);
  const [resultat, setResultat] = useState<Resultat | null>(null);
  const [envoye, setEnvoye] = useState(false);

  // ── Handlers ──
  const toggleCat = (cat: string) =>
    setCatsOuvertes((p) => (p.includes(cat) ? p.filter((c) => c !== cat) : [...p, cat]));

  const updatePoste = (id: string, val: number) =>
    setPostes((p) => p.map((x) => (x.id === id ? { ...x, montant: val } : x)));

  const addAutre = () =>
    setAutres((p) => [...p, { id: `autre-${Date.now()}`, label: "", montant: 0 }]);

  const updateAutre = (id: string, field: "label" | "montant", val: string | number) =>
    setAutres((p) => p.map((a) => (a.id === id ? { ...a, [field]: val } : a)));

  const removeAutre = (id: string) => setAutres((p) => p.filter((a) => a.id !== id));

  const totalSaisi =
    postes.reduce((s, p) => s + (p.montant || 0), 0) +
    autres.reduce((s, a) => s + (a.montant || 0), 0);

  const lancer = () => {
    if (!locataire) return;
    const { mois, jours, totalJoursAnnee, taux } = calculerOccupation(
      locataire.dateEntree,
      locataire.dateSortie,
      ANNEE
    );
    const totalChargesReelles = totalSaisi;
    const totalChargesProrata = parseFloat((totalChargesReelles * taux).toFixed(2));
    const provisionsPercues = parseFloat((locataire.charges * 12 * taux).toFixed(2));
    const solde = parseFloat((totalChargesProrata - provisionsPercues).toFixed(2));

    setResultat({
      totalChargesReelles,
      totalChargesProrata,
      provisionsPercues,
      solde,
      moisOccupes: mois,
      jours,
      totalJoursAnnee,
      tauxOccupation: taux,
    });
    setEtape(3);
  };

  const reset = () => {
    setEtape(1);
    setLocataire(null);
    setResultat(null);
    setEnvoye(false);
    setPostes((p) => p.map((x) => ({ ...x, montant: 0 })));
    setAutres([]);
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-2xl mx-auto space-y-5">

        {/* ── Header ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="bg-gradient-to-br from-[#4DD9C0] to-[#2aA898] p-2.5 rounded-xl shrink-0">
              <Calculator size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-800">
                Régularisation des charges
              </h1>
              <p className="text-sm text-gray-400">Exercice {ANNEE}</p>
            </div>
          </div>

          {/* Stepper */}
          <div className="flex items-center">
            {[
              { n: 1, label: "Locataire" },
              { n: 2, label: "Charges" },
              { n: 3, label: "Résultat" },
            ].map((s, i) => (
              <div key={s.n} className="flex items-center flex-1 min-w-0">
                <div className="flex items-center gap-1.5 shrink-0">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                      etape >= s.n
                        ? "bg-gradient-to-br from-[#F97316] to-[#FBBF24] text-white"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {s.n}
                  </div>
                  <span
                    className={`text-xs sm:text-sm font-medium whitespace-nowrap ${
                      etape >= s.n ? "text-gray-700" : "text-gray-400"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {i < 2 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 ${
                      etape > s.n ? "bg-[#F97316]" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ════════════════════════════════════════════════════
            ÉTAPE 1 — Sélection du locataire
        ════════════════════════════════════════════════════ */}
        {etape === 1 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
            <h2 className="font-semibold text-gray-700 flex items-center gap-2">
              <Home size={16} className="text-[#F97316]" />
              Sélectionnez le locataire
            </h2>

            <div className="space-y-3">
              {locatairesMock.map((loc) => {
                const { mois } = calculerOccupation(loc.dateEntree, loc.dateSortie, ANNEE);
                const sel = locataire?.id === loc.id;

                return (
                  <button
                    key={loc.id}
                    onClick={() => setLocataire(loc)}
                    className={`w-full text-left border-2 rounded-xl p-4 transition-all ${
                      sel
                        ? "border-[#F97316] bg-orange-50"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-800 truncate">
                          {loc.prenom} {loc.nom}
                        </p>
                        <p className="text-sm text-gray-500 truncate">{loc.bien}</p>
                        <div className="flex flex-wrap gap-x-3 mt-1">
                          <span className="text-xs text-gray-400">
                            Provision :{" "}
                            <span className="font-medium text-gray-600">{loc.charges} €/mois</span>
                          </span>
                          <span className="text-xs text-gray-400">
                            Occupation : <span className="font-medium text-gray-600">{mois} mois</span>
                          </span>
                        </div>
                      </div>
                      <span
                        className={`shrink-0 text-xs font-semibold px-2 py-1 rounded-full ${
                          loc.depotGarantieActif
                            ? "bg-[#4DD9C0]/20 text-[#1a9a8a]"
                            : "bg-red-100 text-red-500"
                        }`}
                      >
                        {loc.depotGarantieActif ? "Actif" : "Sorti"}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              disabled={!locataire}
              onClick={() => setEtape(2)}
              className="w-full bg-gradient-to-r from-[#F97316] to-[#FBBF24] hover:opacity-90 disabled:opacity-40 text-white font-semibold py-3 rounded-xl transition shadow-sm text-sm"
            >
              Continuer →
            </button>
          </div>
        )}

        {/* ════════════════════════════════════════════════════
            ÉTAPE 2 — Saisie des charges réelles
        ════════════════════════════════════════════════════ */}
        {etape === 2 && locataire && (
          <div className="space-y-4">

            {/* Récap locataire */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold text-gray-800 truncate">
                  {locataire.prenom} {locataire.nom}
                </p>
                <p className="text-sm text-gray-500 truncate">{locataire.bien}</p>
              </div>
              <button
                onClick={() => { setEtape(1); setResultat(null); }}
                className="shrink-0 text-xs text-[#F97316] hover:underline font-medium"
              >
                Modifier
              </button>
            </div>

            {/* Bandeau prorata */}
            {(() => {
              const { mois, jours, totalJoursAnnee } = calculerOccupation(
                locataire.dateEntree,
                locataire.dateSortie,
                ANNEE
              );
              const taux = ((jours / totalJoursAnnee) * 100).toFixed(1);
              const provisions = (locataire.charges * 12 * (jours / totalJoursAnnee)).toFixed(2);

              return (
                <div className="bg-[#EEF9FF] border border-[#B6E8FA] rounded-xl p-4 flex gap-3">
                  <AlertCircle size={17} className="text-[#2aA898] shrink-0 mt-0.5" />
                  <div className="text-sm text-[#1a7a8a] space-y-0.5">
                    <p className="font-semibold">Prorata calculé automatiquement</p>
                    <p>
                      {mois} mois occupés ({jours} j / {totalJoursAnnee}) — taux{" "}
                      <strong>{taux} %</strong>
                    </p>
                    <p>
                      Provisions proratisées :{" "}
                      <strong>{provisions} €</strong>
                    </p>
                  </div>
                </div>
              );
            })()}

            {/* Catégories */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-700">
                  Charges récupérables — exercice {ANNEE}
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Renseignez le montant annuel réel pour chaque poste.
                </p>
              </div>

              <div className="divide-y divide-gray-100">
                {categoriesCharges.map((cat) => {
                  const open = catsOuvertes.includes(cat.categorie);
                  const sous = postes.filter((p) => p.categorie === cat.categorie);
                  const total = sous.reduce((s, p) => s + (p.montant || 0), 0);

                  return (
                    <div key={cat.categorie}>
                      <button
                        onClick={() => toggleCat(cat.categorie)}
                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition"
                      >
                        <span className="font-medium text-gray-700 text-sm">{cat.categorie}</span>
                        <div className="flex items-center gap-3">
                          {total > 0 && (
                            <span className="text-xs font-semibold text-[#F97316]">
                              {fmt(total)} €
                            </span>
                          )}
                          {open ? (
                            <ChevronUp size={16} className="text-gray-400" />
                          ) : (
                            <ChevronDown size={16} className="text-gray-400" />
                          )}
                        </div>
                      </button>

                      {open && (
                        <div className="bg-gray-50 px-4 py-3 space-y-3">
                          {sous.map((poste) => (
                            <div
                              key={poste.id}
                              className="flex items-center justify-between gap-3"
                            >
                              <label className="text-sm text-gray-600 flex-1">{poste.label}</label>
                              <div className="relative w-32 shrink-0">
                                <input
                                  type="number"
                                  min={0}
                                  value={poste.montant || ""}
                                  placeholder="0"
                                  onChange={(e) =>
                                    updatePoste(poste.id, parseFloat(e.target.value) || 0)
                                  }
                                  className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-right pr-8 focus:outline-none focus:ring-2 focus:ring-[#F97316]/30 focus:border-[#F97316]"
                                />
                                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                                  €
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Autres charges */}
                <div>
                  <button
                    onClick={() => toggleCat("__autres__")}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition"
                  >
                    <span className="font-medium text-gray-700 text-sm">Autres charges récupérables</span>
                    <div className="flex items-center gap-3">
                      {autres.reduce((s, a) => s + (a.montant || 0), 0) > 0 && (
                        <span className="text-xs font-semibold text-[#F97316]">
                          {fmt(autres.reduce((s, a) => s + (a.montant || 0), 0))} €
                        </span>
                      )}
                      {catsOuvertes.includes("__autres__") ? (
                        <ChevronUp size={16} className="text-gray-400" />
                      ) : (
                        <ChevronDown size={16} className="text-gray-400" />
                      )}
                    </div>
                  </button>

                  {catsOuvertes.includes("__autres__") && (
                    <div className="bg-gray-50 px-4 py-3 space-y-3">
                      {autres.map((a) => (
                        <div key={a.id} className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Intitulé du poste"
                            value={a.label}
                            onChange={(e) => updateAutre(a.id, "label", e.target.value)}
                            className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F97316]/30 focus:border-[#F97316]"
                          />
                          <div className="relative w-28 shrink-0">
                            <input
                              type="number"
                              min={0}
                              placeholder="0"
                              value={a.montant || ""}
                              onChange={(e) =>
                                updateAutre(a.id, "montant", parseFloat(e.target.value) || 0)
                              }
                              className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-right pr-7 focus:outline-none focus:ring-2 focus:ring-[#F97316]/30 focus:border-[#F97316]"
                            />
                            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                              €
                            </span>
                          </div>
                          <button
                            onClick={() => removeAutre(a.id)}
                            className="text-red-400 hover:text-red-600 transition"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      ))}

                      <button
                        onClick={addAutre}
                        className="flex items-center gap-1.5 text-sm text-[#F97316] hover:text-orange-600 font-medium transition"
                      >
                        <Plus size={15} />
                        Ajouter un poste
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Total + Bouton calcul */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-700">Total des charges saisies</span>
                <span className="font-bold text-lg text-gray-800">{fmt(totalSaisi)} €</span>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setEtape(1)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl transition text-sm"
                >
                  ← Retour
                </button>
                <button
                  onClick={lancer}
                  disabled={totalSaisi === 0}
                  className="flex-1 bg-gradient-to-r from-[#F97316] to-[#FBBF24] hover:opacity-90 disabled:opacity-40 text-white font-semibold py-3 rounded-xl transition shadow-sm text-sm flex items-center justify-center gap-2"
                >
                  <Calculator size={16} />
                  Calculer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════
            ÉTAPE 3 — Résultat
        ════════════════════════════════════════════════════ */}
        {etape === 3 && resultat && locataire && (
          <div className="space-y-4">

            {/* Bandeau résultat */}
            {resultat.solde > 0 ? (
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-[#F97316] rounded-2xl p-5 flex items-start gap-4">
                <div className="bg-[#F97316] p-2 rounded-xl shrink-0">
                  <AlertCircle size={20} className="text-white" />
                </div>
                <div>
                  <p className="font-bold text-gray-800 text-base">
                    Complément dû par le locataire
                  </p>
                  <p className="text-3xl font-extrabold text-[#F97316] mt-1">
                    + {fmt(resultat.solde)} €
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Les charges réelles dépassent les provisions versées.
                  </p>
                </div>
              </div>
            ) : resultat.solde < 0 ? (
              <div className="bg-gradient-to-r from-teal-50 to-cyan-50 border-2 border-[#4DD9C0] rounded-2xl p-5 flex items-start gap-4">
                <div className="bg-[#2aA898] p-2 rounded-xl shrink-0">
                  <CheckCircle size={20} className="text-white" />
                </div>
                <div>
                  <p className="font-bold text-gray-800 text-base">
                    Remboursement dû au locataire
                  </p>
                  <p className="text-3xl font-extrabold text-[#1a9a8a] mt-1">
                    {fmt(Math.abs(resultat.solde))} €
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Les provisions versées excèdent les charges réelles.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-5 flex items-start gap-4">
                <div className="bg-gray-400 p-2 rounded-xl shrink-0">
                  <CheckCircle size={20} className="text-white" />
                </div>
                <div>
                  <p className="font-bold text-gray-800 text-base">Aucun solde</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Les provisions correspondent exactement aux charges réelles.
                  </p>
                </div>
              </div>
            )}

            {/* Détail du calcul */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-700">Détail du calcul</h3>
              </div>

              <div className="divide-y divide-gray-100">
                <div className="px-5 py-3 flex justify-between text-sm">
                  <span className="text-gray-500">Locataire</span>
                  <span className="font-medium text-gray-800">
                    {locataire.prenom} {locataire.nom}
                  </span>
                </div>
                <div className="px-5 py-3 flex justify-between text-sm">
                  <span className="text-gray-500">Bien</span>
                  <span className="font-medium text-gray-800 text-right max-w-[55%]">
                    {locataire.bien}
                  </span>
                </div>
                <div className="px-5 py-3 flex justify-between text-sm">
                  <span className="text-gray-500">Période</span>
                  <span className="font-medium text-gray-800">Exercice {ANNEE}</span>
                </div>
                <div className="px-5 py-3 flex justify-between text-sm">
                  <span className="text-gray-500">Occupation</span>
                  <span className="font-medium text-gray-800">
                    {resultat.moisOccupes} mois ({resultat.jours} j / {resultat.totalJoursAnnee}) —{" "}
                    {(resultat.tauxOccupation * 100).toFixed(1)} %
                  </span>
                </div>

                <div className="px-5 py-3 flex justify-between text-sm bg-gray-50">
                  <span className="text-gray-600 font-medium">Charges réelles totales</span>
                  <span className="font-semibold text-gray-800">
                    {fmt(resultat.totalChargesReelles)} €
                  </span>
                </div>
                <div className="px-5 py-3 flex justify-between text-sm bg-gray-50">
                  <span className="text-gray-600 font-medium">Charges imputables (prorata)</span>
                  <span className="font-semibold text-gray-800">
                    {fmt(resultat.totalChargesProrata)} €
                  </span>
                </div>
                <div className="px-5 py-3 flex justify-between text-sm bg-gray-50">
                  <span className="text-gray-600 font-medium">Provisions perçues (prorata)</span>
                  <span className="font-semibold text-gray-800">
                    {fmt(resultat.provisionsPercues)} €
                  </span>
                </div>

                <div className="px-5 py-4 flex justify-between">
                  <span className="font-bold text-gray-800">Solde de régularisation</span>
                  <span
                    className={`font-extrabold text-lg ${
                      resultat.solde > 0
                        ? "text-[#F97316]"
                        : resultat.solde < 0
                        ? "text-[#1a9a8a]"
                        : "text-gray-600"
                    }`}
                  >
                    {resultat.solde > 0 ? "+" : ""}
                    {fmt(resultat.solde)} €
                  </span>
                </div>
              </div>
            </div>

            {/* Détail des postes saisis */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-700">Détail des charges saisies</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {categoriesCharges.map((cat) => {
                  const sous = postes.filter(
                    (p) => p.categorie === cat.categorie && p.montant > 0
                  );
                  if (!sous.length) return null;
                  return (
                    <div key={cat.categorie} className="px-5 py-3">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                        {cat.categorie}
                      </p>
                      <div className="space-y-1.5">
                        {sous.map((p) => (
                          <div key={p.id} className="flex justify-between text-sm">
                            <span className="text-gray-600">{p.label}</span>
                            <span className="font-medium text-gray-800">{fmt(p.montant)} €</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
                {autres.filter((a) => a.montant > 0).map((a) => (
                  <div key={a.id} className="px-5 py-3 flex justify-between text-sm">
                    <span className="text-gray-600">{a.label || "Autre charge"}</span>
                    <span className="font-medium text-gray-800">{fmt(a.montant)} €</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-3">
              <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                <FileText size={16} className="text-[#F97316]" />
                {resultat.solde >= 0
                  ? "Facture de régularisation"
                  : "Avoir de régularisation"}
              </h3>
              <p className="text-sm text-gray-500">
                {resultat.solde > 0
                  ? "Un complément de charges est dû par le locataire. Téléchargez ou envoyez la facture."
                  : resultat.solde < 0
                  ? "Les provisions excèdent les charges. Téléchargez ou envoyez l'avoir de remboursement."
                  : "Aucun document à générer, les comptes sont à l'équilibre."}
              </p>

              {resultat.solde !== 0 && (
                <div className="flex flex-col sm:flex-row gap-3">
                  <button className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl transition text-sm">
                    <Download size={16} />
                    Télécharger le PDF
                  </button>
                  <button
                    onClick={() => setEnvoye(true)}
                    disabled={envoye}
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-[#F97316] to-[#FBBF24] hover:opacity-90 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition shadow-sm text-sm"
                  >
                    {envoye ? (
                      <>
                        <CheckCircle size={16} />
                        Envoyé
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        Envoyer au locataire
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Nouvelle régularisation */}
            <button
              onClick={reset}
              className="w-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 font-semibold py-3 rounded-xl transition text-sm"
            >
              ← Nouvelle régularisation
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
