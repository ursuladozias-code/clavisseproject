"use client";

import { useState } from "react";
import {
  FileText,
  ChevronDown,
  ChevronUp,
  CheckSquare,
  Square,
  Download,
  Eye,
  Calendar,
  Home,
  Users,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type Locataire = {
  id: number;
  nom: string;
  prenom: string;
  bien: string;
  adresse: string;
  loyer: number;
  charges: number;
  dateEntree: string; // "YYYY-MM-DD"
  dateSortie?: string;
  depotGarantieActif: boolean;
};

type Quittance = {
  id: number;
  locataireId: number;
  locataireNom: string;
  bien: string;
  adresse: string;
  dateDebut: string;
  dateFin: string;
  loyer: number;
  charges: number;
  totalPercu: number;
  prorata: boolean;
  dateGeneration: string;
  mois: number;
  annee: number;
};

// ─── Mock Data ────────────────────────────────────────────────────────────────

const locataires: Locataire[] = [
  {
    id: 1,
    nom: "Dupont",
    prenom: "Jean",
    bien: "Appartement – 12 rue Victor Hugo",
    adresse: "12 rue Victor Hugo, 75011 Paris",
    loyer: 850,
    charges: 80,
    dateEntree: "2023-04-01",
    depotGarantieActif: true,
  },
  {
    id: 2,
    nom: "Martin",
    prenom: "Marie",
    bien: "Studio – 8 rue des Fleurs",
    adresse: "8 rue des Fleurs, 69003 Lyon",
    loyer: 520,
    charges: 50,
    dateEntree: "2024-07-15",
    depotGarantieActif: true,
  },
  {
    id: 3,
    nom: "Bernard",
    prenom: "Lucas",
    bien: "Maison – 24 rue des Lilas",
    adresse: "24 rue des Lilas, 33000 Bordeaux",
    loyer: 1200,
    charges: 120,
    dateEntree: "2022-01-01",
    dateSortie: "2025-03-20",
    depotGarantieActif: false,
  },
  {
    id: 4,
    nom: "Petit",
    prenom: "Sophie",
    bien: "Appartement – 5 avenue Foch",
    adresse: "5 avenue Foch, 44000 Nantes",
    loyer: 720,
    charges: 60,
    dateEntree: "2025-03-15",
    depotGarantieActif: true,
  },
];

const historiqueMock: Quittance[] = [
  {
    id: 1,
    locataireId: 1,
    locataireNom: "Jean Dupont",
    bien: "Appartement – 12 rue Victor Hugo",
    adresse: "12 rue Victor Hugo, 75011 Paris",
    dateDebut: "2025-01-01",
    dateFin: "2025-01-31",
    loyer: 850,
    charges: 80,
    totalPercu: 930,
    prorata: false,
    dateGeneration: "2025-01-05",
    mois: 1,
    annee: 2025,
  },
  {
    id: 2,
    locataireId: 1,
    locataireNom: "Jean Dupont",
    bien: "Appartement – 12 rue Victor Hugo",
    adresse: "12 rue Victor Hugo, 75011 Paris",
    dateDebut: "2025-02-01",
    dateFin: "2025-02-28",
    loyer: 850,
    charges: 80,
    totalPercu: 930,
    prorata: false,
    dateGeneration: "2025-02-03",
    mois: 2,
    annee: 2025,
  },
  {
    id: 3,
    locataireId: 2,
    locataireNom: "Marie Martin",
    bien: "Studio – 8 rue des Fleurs",
    adresse: "8 rue des Fleurs, 69003 Lyon",
    dateDebut: "2025-01-01",
    dateFin: "2025-01-31",
    loyer: 520,
    charges: 50,
    totalPercu: 570,
    prorata: false,
    dateGeneration: "2025-01-05",
    mois: 1,
    annee: 2025,
  },
  {
    id: 4,
    locataireId: 4,
    locataireNom: "Sophie Petit",
    bien: "Appartement – 5 avenue Foch",
    adresse: "5 avenue Foch, 44000 Nantes",
    dateDebut: "2025-03-15",
    dateFin: "2025-03-31",
    loyer: 554.84,
    charges: 46.45,
    totalPercu: 601.29,
    prorata: true,
    dateGeneration: "2025-03-20",
    mois: 3,
    annee: 2025,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MOIS_LABELS = [
  "", "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

const formatDate = (d: string) => {
  const [y, m, j] = d.split("-");
  return `${j}/${m}/${y}`;
};

const parseDate = (d: string) => new Date(d);

const calculerProrata = (
  loyer: number,
  charges: number,
  dateDebutPeriode: string,
  dateFinPeriode: string,
  dateEntree?: string,
  dateSortie?: string
): { loyer: number; charges: number; debut: string; fin: string; prorata: boolean } => {
  const debut = parseDate(dateDebutPeriode);
  const fin = parseDate(dateFinPeriode);
  const entree = dateEntree ? parseDate(dateEntree) : null;
  const sortie = dateSortie ? parseDate(dateSortie) : null;

  let realDebut = debut;
  let realFin = fin;
  let isProrata = false;

  if (entree && entree > debut) {
    realDebut = entree;
    isProrata = true;
  }
  if (sortie && sortie < fin) {
    realFin = sortie;
    isProrata = true;
  }

  const totalJours = Math.round((fin.getTime() - debut.getTime()) / 86400000) + 1;
  const joursOccupes = Math.round((realFin.getTime() - realDebut.getTime()) / 86400000) + 1;
  const ratio = joursOccupes / totalJours;

  const loyerCalc = isProrata ? Math.round(loyer * ratio * 100) / 100 : loyer;
  const chargesCalc = isProrata ? Math.round(charges * ratio * 100) / 100 : charges;

  return {
    loyer: loyerCalc,
    charges: chargesCalc,
    debut: realDebut.toISOString().split("T")[0],
    fin: realFin.toISOString().split("T")[0],
    prorata: isProrata,
  };
};

// ─── Composant Principal ──────────────────────────────────────────────────────

export default function Quittances() {
  const [activeTab, setActiveTab] = useState<"generation" | "historique">("generation");
  const [quittances, setQuittances] = useState<Quittance[]>(historiqueMock);

  // --- Génération ---
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [selection, setSelection] = useState<number[]>([]);
  const [apercu, setApercu] = useState<
    { locataire: Locataire; loyer: number; charges: number; debut: string; fin: string; prorata: boolean }[]
  >([]);
  const [etape, setEtape] = useState<1 | 2>(1);
  const [successMsg, setSuccessMsg] = useState("");

  // --- Historique ---
  const [bienOuvert, setBienOuvert] = useState<string | null>(null);
  const [anneeOuverte, setAnneeOuverte] = useState<string | null>(null);
  const [moisOuvert, setMoisOuvert] = useState<string | null>(null);
  const [quittanceVue, setQuittanceVue] = useState<Quittance | null>(null);

  // ── Locataires éligibles (dépôt actif uniquement) ──
  const eligibles = locataires.filter((l) => l.depotGarantieActif);

  const lancerRecherche = () => {
    if (!dateDebut || !dateFin) return;
    const calc = eligibles.map((l) => {
      const res = calculerProrata(
        l.loyer, l.charges, dateDebut, dateFin,
        l.dateEntree, l.dateSortie
      );
      return { locataire: l, ...res };
    });
    setApercu(calc);
    setSelection(calc.map((c) => c.locataire.id));
    setEtape(2);
  };

  const toggleSelection = (id: number) => {
    setSelection((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toutSelectionner = () => {
    if (selection.length === apercu.length) setSelection([]);
    else setSelection(apercu.map((a) => a.locataire.id));
  };

  const generer = () => {
    const nouvelles: Quittance[] = apercu
      .filter((a) => selection.includes(a.locataire.id))
      .map((a, i) => {
        const d = new Date(a.debut);
        return {
          id: Date.now() + i,
          locataireId: a.locataire.id,
          locataireNom: `${a.locataire.prenom} ${a.locataire.nom}`,
          bien: a.locataire.bien,
          adresse: a.locataire.adresse,
          dateDebut: a.debut,
          dateFin: a.fin,
          loyer: a.loyer,
          charges: a.charges,
          totalPercu: Math.round((a.loyer + a.charges) * 100) / 100,
          prorata: a.prorata,
          dateGeneration: new Date().toISOString().split("T")[0],
          mois: d.getMonth() + 1,
          annee: d.getFullYear(),
        };
      });

    setQuittances((prev) => [...prev, ...nouvelles]);
    setSuccessMsg(`${nouvelles.length} quittance${nouvelles.length > 1 ? "s" : ""} générée${nouvelles.length > 1 ? "s" : ""} avec succès.`);
    setEtape(1);
    setDateDebut("");
    setDateFin("");
    setApercu([]);
    setSelection([]);
    setTimeout(() => setSuccessMsg(""), 5000);
  };

  // ── Structure historique : bien → année → mois ──
  const biens = Array.from(new Set(quittances.map((q) => q.bien)));

  const quittancesParBienAnnéeMois = (bien: string, annee: number, mois: number) =>
    quittances.filter((q) => q.bien === bien && q.annee === annee && q.mois === mois);

  const anneesParBien = (bien: string) =>
    Array.from(new Set(quittances.filter((q) => q.bien === bien).map((q) => q.annee))).sort((a, b) => b - a);

  const moisParBienAnnee = (bien: string, annee: number) =>
    Array.from(new Set(quittances.filter((q) => q.bien === bien && q.annee === annee).map((q) => q.mois))).sort((a, b) => a - b);

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Quittances de loyer</h1>
        <p className="text-gray-500 mt-1">Générez et consultez les quittances de vos locataires</p>
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
          { key: "generation", label: "Générer des quittances", icon: <FileText size={16} /> },
          { key: "historique", label: "Historique", icon: <Calendar size={16} /> },
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

      {/* ══════════════════════════════════════════════
          ONGLET GÉNÉRATION
      ══════════════════════════════════════════════ */}
      {activeTab === "generation" && (
        <div className="space-y-6">

          {/* Étape 1 — Période */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-gradient-to-br from-[#F97316] to-[#FBBF24] text-white text-xs font-bold flex items-center justify-center">1</span>
              <h2 className="font-bold text-gray-800">Sélectionnez la période</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Date de début</label>
                <input
                  type="date"
                  value={dateDebut}
                  onChange={(e) => { setDateDebut(e.target.value); setEtape(1); }}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Date de fin</label>
                <input
                  type="date"
                  value={dateFin}
                  onChange={(e) => { setDateFin(e.target.value); setEtape(1); }}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                />
              </div>
            </div>

            <button
              onClick={lancerRecherche}
              disabled={!dateDebut || !dateFin}
              className="bg-gradient-to-r from-[#F97316] to-[#FBBF24] hover:opacity-90 disabled:opacity-40 text-white font-semibold px-6 py-2.5 rounded-xl transition shadow-sm text-sm"
            >
              Rechercher les locataires éligibles
            </button>
          </div>

          {/* Étape 2 — Sélection & aperçu */}
          {etape === 2 && apercu.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-gradient-to-br from-[#F97316] to-[#FBBF24] text-white text-xs font-bold flex items-center justify-center">2</span>
                  <h2 className="font-bold text-gray-800">Sélectionnez les locataires</h2>
                </div>
                <button
                  onClick={toutSelectionner}
                  className="flex items-center gap-2 text-sm text-[#F97316] font-semibold hover:underline"
                >
                  {selection.length === apercu.length ? <CheckSquare size={16} /> : <Square size={16} />}
                  {selection.length === apercu.length ? "Tout désélectionner" : "Tout sélectionner"}
                </button>
              </div>

              <div className="space-y-3">
                {apercu.map((a) => {
                  const selected = selection.includes(a.locataire.id);
                  return (
                    <div
                      key={a.locataire.id}
                      onClick={() => toggleSelection(a.locataire.id)}
                      className={`flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-xl border-2 cursor-pointer transition ${
                        selected ? "border-[#F97316] bg-orange-50/40" : "border-gray-100 hover:border-gray-200"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          {selected ? (
                            <CheckSquare size={18} className="text-[#F97316]" />
                          ) : (
                            <Square size={18} className="text-gray-300" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">
                            {a.locataire.prenom} {a.locataire.nom}
                          </p>
                          <p className="text-xs text-gray-500">{a.locataire.bien}</p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Période réelle : {formatDate(a.debut)} → {formatDate(a.fin)}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3 text-sm ml-7 md:ml-0">
                        {a.prorata && (
                          <span className="bg-[#B57BEE]/15 text-[#8B4DC8] text-xs font-semibold px-2 py-0.5 rounded-full">
                            Prorata
                          </span>
                        )}
                        <div className="text-right">
                          <p className="text-xs text-gray-400">Loyer</p>
                          <p className="font-semibold text-gray-700">{a.loyer} €</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-400">Charges</p>
                          <p className="font-semibold text-gray-700">{a.charges} €</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-400">Total</p>
                          <p className="font-bold text-[#1a9a8a]">
                            {Math.round((a.loyer + a.charges) * 100) / 100} €
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={generer}
                  disabled={selection.length === 0}
                  className="bg-gradient-to-r from-[#F97316] to-[#FBBF24] hover:opacity-90 disabled:opacity-40 text-white font-semibold px-6 py-2.5 rounded-xl transition shadow-sm text-sm flex items-center gap-2"
                >
                  <FileText size={16} />
                  Générer {selection.length > 0 ? `${selection.length} quittance${selection.length > 1 ? "s" : ""}` : "les quittances"}
                </button>
              </div>
            </div>
          )}

          {etape === 2 && apercu.length === 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-400">
              <Users size={32} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">Aucun locataire éligible pour cette période.</p>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════
          ONGLET HISTORIQUE
      ══════════════════════════════════════════════ */}
      {activeTab === "historique" && (
        <div className="space-y-3">
          {biens.length === 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400">
              <FileText size={32} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">Aucune quittance générée pour le moment.</p>
            </div>
          )}

          {biens.map((bien) => (
            <div key={bien} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Niveau 1 — Bien */}
              <button
                onClick={() => setBienOuvert(bienOuvert === bien ? null : bien)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#4DD9C0]/15 flex items-center justify-center">
                    <Home size={18} className="text-[#2aA898]" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-800">{bien}</p>
                    <p className="text-xs text-gray-400">
                      {quittances.filter((q) => q.bien === bien).length} quittance(s)
                    </p>
                  </div>
                </div>
                {bienOuvert === bien ? (
                  <ChevronUp size={18} className="text-gray-400" />
                ) : (
                  <ChevronDown size={18} className="text-gray-400" />
                )}
              </button>

              {bienOuvert === bien && (
                <div className="border-t border-gray-100 bg-gray-50/50">
                  {anneesParBien(bien).map((annee) => {
                    const keyAnnee = `${bien}-${annee}`;
                    return (
                      <div key={annee} className="border-b border-gray-100 last:border-0">
                        {/* Niveau 2 — Année */}
                        <button
                          onClick={() => setAnneeOuverte(anneeOuverte === keyAnnee ? null : keyAnnee)}
                          className="w-full flex items-center justify-between px-6 py-3 hover:bg-gray-100/60 transition"
                        >
                          <span className="font-semibold text-gray-700 text-sm">{annee}</span>
                          {anneeOuverte === keyAnnee ? (
                            <ChevronUp size={15} className="text-gray-400" />
                          ) : (
                            <ChevronDown size={15} className="text-gray-400" />
                          )}
                        </button>

                        {anneeOuverte === keyAnnee && (
                          <div className="px-6 pb-3 space-y-2">
                            {moisParBienAnnee(bien, annee).map((mois) => {
                              const keyMois = `${bien}-${annee}-${mois}`;
                              const qMois = quittancesParBienAnnéeMois(bien, annee, mois);
                              return (
                                <div key={mois} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                                  {/* Niveau 3 — Mois */}
                                  <button
                                    onClick={() => setMoisOuvert(moisOuvert === keyMois ? null : keyMois)}
                                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition"
                                  >
                                    <span className="font-medium text-gray-700 text-sm">
                                      {MOIS_LABELS[mois]}
                                      <span className="ml-2 text-xs text-gray-400">({qMois.length} quittance{qMois.length > 1 ? "s" : ""})</span>
                                    </span>
                                    {moisOuvert === keyMois ? (
                                      <ChevronUp size={14} className="text-gray-400" />
                                    ) : (
                                      <ChevronDown size={14} className="text-gray-400" />
                                    )}
                                  </button>

                                  {moisOuvert === keyMois && (
                                    <div className="border-t border-gray-100 divide-y divide-gray-50">
                                      {qMois.map((q) => (
                                        <div key={q.id} className="flex items-center justify-between px-4 py-3 gap-3 flex-wrap">
                                          <div>
                                            <p className="font-semibold text-gray-800 text-sm">{q.locataireNom}</p>
                                            <p className="text-xs text-gray-500">
                                              {formatDate(q.dateDebut)} → {formatDate(q.dateFin)}
                                            </p>
                                            {q.prorata && (
                                              <span className="inline-block mt-1 bg-[#B57BEE]/15 text-[#8B4DC8] text-xs font-semibold px-2 py-0.5 rounded-full">
                                                Prorata
                                              </span>
                                            )}
                                          </div>
                                          <div className="flex items-center gap-4">
                                            <div className="text-right">
                                              <p className="text-xs text-gray-400">Total perçu</p>
                                              <p className="font-bold text-[#1a9a8a] text-sm">{q.totalPercu} €</p>
                                            </div>
                                            <div className="flex gap-2">
                                              <button
                                                onClick={() => setQuittanceVue(q)}
                                                className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition"
                                              >
                                                <Eye size={15} className="text-gray-500" />
                                              </button>
                                              <button className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#F97316] to-[#FBBF24] hover:opacity-90 flex items-center justify-center transition shadow-sm">
                                                <Download size={15} className="text-white" />
                                              </button>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Modal aperçu quittance ── */}
      {quittanceVue && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md space-y-5 p-6">
            {/* En-tête */}
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-800">Quittance de loyer</h2>
                <p className="text-sm text-gray-500">{quittanceVue.bien}</p>
              </div>
              {quittanceVue.prorata && (
                <span className="bg-[#B57BEE]/15 text-[#8B4DC8] text-xs font-bold px-2 py-1 rounded-full">
                  Prorata
                </span>
              )}
            </div>

            {/* Détail */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Locataire</span>
                <span className="font-semibold text-gray-800">{quittanceVue.locataireNom}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Adresse</span>
                <span className="font-medium text-gray-700 text-right max-w-[55%]">{quittanceVue.adresse}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Période</span>
                <span className="font-medium text-gray-700">
                  {formatDate(quittanceVue.dateDebut)} → {formatDate(quittanceVue.dateFin)}
                </span>
              </div>
              <hr className="border-gray-200" />
              <div className="flex justify-between">
                <span className="text-gray-500">Loyer</span>
                <span className="font-semibold text-gray-800">{quittanceVue.loyer} €</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Charges</span>
                <span className="font-semibold text-gray-800">{quittanceVue.charges} €</span>
              </div>
              <hr className="border-gray-200" />
              <div className="flex justify-between">
                <span className="text-gray-500 font-semibold">Total perçu</span>
                <span className="font-bold text-[#1a9a8a] text-base">{quittanceVue.totalPercu} €</span>
              </div>
            </div>

            <p className="text-xs text-gray-400 text-center">
              Générée le {formatDate(quittanceVue.dateGeneration)}
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setQuittanceVue(null)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 rounded-xl transition text-sm"
              >
                Fermer
              </button>
              <button className="flex-1 bg-gradient-to-r from-[#F97316] to-[#FBBF24] hover:opacity-90 text-white font-semibold py-2 rounded-xl transition text-sm flex items-center justify-center gap-2 shadow-sm">
                <Download size={15} />
                Télécharger
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
