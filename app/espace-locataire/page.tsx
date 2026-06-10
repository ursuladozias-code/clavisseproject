"use client";

import { useState } from "react";
import {
  Home,
  FileText,
  ChevronRight,
  LogOut,
  Download,
  Eye,
  X,
  Receipt,
  RefreshCw,
  Search,
} from "lucide-react";

// --- MOCK DATA ---
const locataireConnecte = {
  prenom: "Sophie",
  nom: "Martin",
  email: "sophie.martin@email.com",
  avatar: "SM",
};

const biensLocataire = [
  {
    id: 1,
    adresse: "12 rue des Lilas, 75011 Paris",
    type: "Appartement T3",
    statut: "actif",
    loyer: 1200,
    charges: 80,
    dateDebut: "2022-03-01",
    dateFin: null,
    quittances: [
      { id: 1, mois: "Juin 2025", montant: 1200, date: "01/06/2025" },
      { id: 2, mois: "Mai 2025", montant: 1200, date: "01/05/2025" },
      { id: 3, mois: "Avril 2025", montant: 1200, date: "01/04/2025" },
      { id: 4, mois: "Mars 2025", montant: 1200, date: "01/03/2025" },
    ],
    regularisations: [
      { id: 1, periode: "2024", montant: 85, date: "15/01/2025", type: "Régularisation annuelle" },
    ],
    bail: {
      dateSignature: "28/02/2022",
      dateDebut: "01/03/2022",
      duree: "3 ans",
      loyer: 1200,
      charges: 80,
      depot: 2400,
    },
  },
  {
    id: 2,
    adresse: "5 avenue Victor Hugo, 69002 Lyon",
    type: "Studio",
    statut: "terminé",
    loyer: 650,
    charges: 40,
    dateDebut: "2020-09-01",
    dateFin: "2022-02-28",
    quittances: [
      { id: 5, mois: "Février 2022", montant: 650, date: "01/02/2022" },
      { id: 6, mois: "Janvier 2022", montant: 650, date: "01/01/2022" },
    ],
    regularisations: [],
    bail: {
      dateSignature: "31/08/2020",
      dateDebut: "01/09/2020",
      duree: "1 an renouvelable",
      loyer: 650,
      charges: 40,
      depot: 650,
    },
  },
];

type Onglet = "quittances" | "regularisations" | "bail";

export default function EspaceLocataire() {
  const [bienSelectionne, setBienSelectionne] = useState<number | null>(null);
  const [onglet, setOnglet] = useState<Onglet>("quittances");
  const [docVisu, setDocVisu] = useState<string | null>(null);
  const [recherche, setRecherche] = useState("");
  const [filtre, setFiltre] = useState<"tous" | "actif" | "terminé">("tous");

  const bien = biensLocataire.find((b) => b.id === bienSelectionne);

  const biensFiltres = biensLocataire.filter((b) => {
    const matchRecherche = b.adresse.toLowerCase().includes(recherche.toLowerCase());
    const matchFiltre = filtre === "tous" || b.statut === filtre;
    return matchRecherche && matchFiltre;
  });

  const totalQuittances = biensLocataire.reduce((acc, b) => acc + b.quittances.length, 0);
  const biensActifs = biensLocataire.filter((b) => b.statut === "actif").length;

  // =====================
  // VUE DÉTAIL D'UN BIEN
  // =====================
  if (bienSelectionne && bien) {
    return (
      <div className="min-h-screen bg-[#FAFAF8]">
        {/* HEADER */}
        <div className="bg-white border-b border-gray-100 px-4 md:px-8 py-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setBienSelectionne(null)}
                className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition text-gray-600"
              >
                <ChevronRight size={18} className="rotate-180" />
              </button>
              <div>
                <h1 className="font-bold text-xl text-gray-800">Mon espace locataire</h1>
                <p className="text-sm text-gray-400">{bien.adresse}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-semibold text-gray-800">
                  {locataireConnecte.prenom} {locataireConnecte.nom}
                </p>
                <p className="text-xs text-gray-400">{locataireConnecte.email}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#F4B942] flex items-center justify-center text-white font-bold text-sm shadow">
                {locataireConnecte.avatar}
              </div>
              <button
                className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition text-gray-500"
                title="Déconnexion"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 md:px-8 py-6">
          {/* TITRE + STATUT */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{bien.type}</h2>
              <p className="text-gray-400 text-sm mt-0.5">{bien.adresse}</p>
            </div>
            <span
              className={`self-start sm:self-auto px-4 py-1.5 rounded-full text-sm font-bold ${
                bien.statut === "actif"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {bien.statut === "actif" ? "✅ Bail actif" : "🔒 Bail terminé"}
            </span>
          </div>

          {/* KPI CARDS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div
              className="rounded-2xl p-4 text-white shadow-md"
              style={{ background: "linear-gradient(135deg, #f97316, #f59e0b)" }}
            >
              <div className="text-2xl mb-1">🏠</div>
              <p className="text-xl font-bold">{bien.loyer} €</p>
              <p className="text-xs font-medium opacity-90 mt-1">Loyer mensuel</p>
            </div>
            <div
              className="rounded-2xl p-4 text-white shadow-md"
              style={{ background: "linear-gradient(135deg, #10b981, #06b6d4)" }}
            >
              <div className="text-2xl mb-1">🧾</div>
              <p className="text-xl font-bold">{bien.quittances.length}</p>
              <p className="text-xs font-medium opacity-90 mt-1">Quittances</p>
            </div>
            <div
              className="rounded-2xl p-4 text-white shadow-md"
              style={{ background: "linear-gradient(135deg, #a78bfa, #8b5cf6)" }}
            >
              <div className="text-2xl mb-1">📋</div>
              <p className="text-xl font-bold">{bien.regularisations.length}</p>
              <p className="text-xs font-medium opacity-90 mt-1">Régularisations</p>
            </div>
            <div
              className="rounded-2xl p-4 text-white shadow-md"
              style={{ background: "linear-gradient(135deg, #f43f5e, #ec4899)" }}
            >
              <div className="text-2xl mb-1">💰</div>
              <p className="text-xl font-bold">{bien.bail.depot} €</p>
              <p className="text-xs font-medium opacity-90 mt-1">Dépôt de garantie</p>
            </div>
          </div>

          {/* ONGLETS */}
          <div className="flex gap-2 mb-5 bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100">
            {[
              { key: "quittances", label: "Quittances", icon: <Receipt size={15} /> },
              { key: "regularisations", label: "Charges", icon: <RefreshCw size={15} /> },
              { key: "bail", label: "Bail", icon: <FileText size={15} /> },
            ].map((o) => (
              <button
                key={o.key}
                onClick={() => setOnglet(o.key as Onglet)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  onglet === o.key
                    ? "text-white shadow"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
                style={
                  onglet === o.key
                    ? { background: "linear-gradient(135deg, #f97316, #f59e0b)" }
                    : {}
                }
              >
                {o.icon}
                <span>{o.label}</span>
              </button>
            ))}
          </div>

          {/* ONGLET QUITTANCES */}
          {onglet === "quittances" && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {bien.quittances.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <Receipt size={40} className="mx-auto mb-3 opacity-30" />
                  <p>Aucune quittance disponible</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">
                        Période
                      </th>
                      <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide hidden sm:table-cell">
                        Date d&apos;émission
                      </th>
                      <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">
                        Montant
                      </th>
                      <th className="px-5 py-3.5 text-right text-xs font-semibold text-gray-400 uppercase tracking-wide">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {bien.quittances.map((q, i) => (
                      <tr
                        key={q.id}
                        className={`border-b border-gray-50 hover:bg-orange-50/30 transition ${
                          i === bien.quittances.length - 1 ? "border-0" : ""
                        }`}
                      >
                        <td className="px-5 py-4 font-semibold text-gray-800">{q.mois}</td>
                        <td className="px-5 py-4 text-gray-400 hidden sm:table-cell">{q.date}</td>
                        <td className="px-5 py-4 font-bold text-gray-800">{q.montant} €</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setDocVisu(`Quittance — ${q.mois}`)}
                              className="text-sm font-semibold text-orange-500 hover:text-orange-600 transition"
                            >
                              Voir
                            </button>
                            <button className="text-sm font-semibold text-gray-400 hover:text-gray-600 transition flex items-center gap-1">
                              <Download size={13} /> PDF
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* ONGLET RÉGULARISATIONS */}
          {onglet === "regularisations" && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {bien.regularisations.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <RefreshCw size={40} className="mx-auto mb-3 opacity-30" />
                  <p>Aucune régularisation disponible</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">
                        Type
                      </th>
                      <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide hidden sm:table-cell">
                        Date
                      </th>
                      <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">
                        Montant
                      </th>
                      <th className="px-5 py-3.5 text-right text-xs font-semibold text-gray-400 uppercase tracking-wide">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {bien.regularisations.map((r, i) => (
                      <tr
                        key={r.id}
                        className={`border-b border-gray-50 hover:bg-orange-50/30 transition ${
                          i === bien.regularisations.length - 1 ? "border-0" : ""
                        }`}
                      >
                        <td className="px-5 py-4">
                          <p className="font-semibold text-gray-800">{r.type}</p>
                          <p className="text-xs text-gray-400">Période {r.periode}</p>
                        </td>
                        <td className="px-5 py-4 text-gray-400 hidden sm:table-cell">{r.date}</td>
                        <td className="px-5 py-4 font-bold text-gray-800">{r.montant} €</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setDocVisu(`Régularisation ${r.periode}`)}
                              className="text-sm font-semibold text-orange-500 hover:text-orange-600 transition"
                            >
                              Voir
                            </button>
                            <button className="text-sm font-semibold text-gray-400 hover:text-gray-600 transition flex items-center gap-1">
                              <Download size={13} /> PDF
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* ONGLET BAIL */}
          {onglet === "bail" && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-5 border-b border-gray-50">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-11 h-11 rounded-xl bg-orange-50 flex items-center justify-center">
                    <FileText size={20} className="text-orange-500" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">Contrat de bail</p>
                    <p className="text-sm text-gray-400">Signé le {bien.bail.dateSignature}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { label: "Date de début", value: bien.bail.dateDebut },
                    { label: "Durée", value: bien.bail.duree },
                    { label: "Loyer mensuel", value: `${bien.bail.loyer} €` },
                    { label: "Charges", value: `${bien.bail.charges} €` },
                    { label: "Dépôt de garantie", value: `${bien.bail.depot} €` },
                    { label: "Total mensuel", value: `${bien.bail.loyer + bien.bail.charges} €` },
                  ].map((item) => (
                    <div key={item.label} className="bg-[#FAFAF8] rounded-xl p-3.5 border border-gray-100">
                      <p className="text-xs text-gray-400 mb-1">{item.label}</p>
                      <p className="font-bold text-gray-800">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-5 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setDocVisu("Contrat de bail")}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold hover:border-orange-400 hover:text-orange-500 transition"
                >
                  <Eye size={16} /> Visualiser
                </button>
                <button
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold hover:opacity-90 transition shadow-md"
                  style={{ background: "linear-gradient(135deg, #f97316, #f59e0b)" }}
                >
                  <Download size={16} /> Télécharger PDF
                </button>
              </div>
            </div>
          )}
        </div>

        {/* MODAL VISUALISATION */}
        {docVisu && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
              <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <h3 className="font-bold text-gray-800">{docVisu}</h3>
                <button
                  onClick={() => setDocVisu(null)}
                  className="p-2 rounded-xl hover:bg-gray-100 transition text-gray-500"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="p-8 text-center">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: "linear-gradient(135deg, #f97316, #f59e0b)" }}
                >
                  <FileText size={28} className="text-white" />
                </div>
                <p className="text-gray-500 text-sm mb-6">
                  Aperçu disponible après intégration du moteur PDF
                </p>
                <button
                  className="flex items-center gap-2 mx-auto px-6 py-3 rounded-xl text-white font-semibold shadow-md hover:opacity-90 transition"
                  style={{ background: "linear-gradient(135deg, #f97316, #f59e0b)" }}
                >
                  <Download size={16} /> Télécharger le PDF
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =====================
  // VUE LISTE DES BIENS
  // =====================
  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* HEADER */}
      <div className="bg-white border-b border-gray-100 px-4 md:px-8 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Mon espace locataire</h1>
            <p className="text-sm text-gray-400">Consultez vos documents locatifs</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-semibold text-gray-800">
                {locataireConnecte.prenom} {locataireConnecte.nom}
              </p>
              <p className="text-xs text-gray-400">{locataireConnecte.email}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#F4B942] flex items-center justify-center text-white font-bold text-sm shadow">
              {locataireConnecte.avatar}
            </div>
            <button
              className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition text-gray-500"
              title="Déconnexion"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-8 py-6">
        {/* TITRE */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">🏠 Mes logements</h2>
          <p className="text-gray-400 text-sm mt-1">
            Gérez et consultez vos documents locatifs
          </p>
        </div>

        {/* KPI CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div
            className="rounded-2xl p-4 text-white shadow-md"
            style={{ background: "linear-gradient(135deg, #f97316, #f59e0b)" }}
          >
            <div className="text-2xl mb-1">🏠</div>
            <p className="text-2xl font-bold">{biensLocataire.length}</p>
            <p className="text-xs font-medium opacity-90 mt-1">Total logements</p>
          </div>
          <div
            className="rounded-2xl p-4 text-white shadow-md"
            style={{ background: "linear-gradient(135deg, #10b981, #06b6d4)" }}
          >
            <div className="text-2xl mb-1">✅</div>
            <p className="text-2xl font-bold">{biensActifs}</p>
            <p className="text-xs font-medium opacity-90 mt-1">Bail{biensActifs > 1 ? "x" : ""} actif{biensActifs > 1 ? "s" : ""}</p>
          </div>
          <div
            className="rounded-2xl p-4 text-white shadow-md"
            style={{ background: "linear-gradient(135deg, #a78bfa, #8b5cf6)" }}
          >
            <div className="text-2xl mb-1">🧾</div>
            <p className="text-2xl font-bold">{totalQuittances}</p>
            <p className="text-xs font-medium opacity-90 mt-1">Quittances</p>
          </div>
          <div
            className="rounded-2xl p-4 text-white shadow-md"
            style={{ background: "linear-gradient(135deg, #f43f5e, #ec4899)" }}
          >
            <div className="text-2xl mb-1">💶</div>
            <p className="text-2xl font-bold">
              {biensLocataire
                .filter((b) => b.statut === "actif")
                .reduce((acc, b) => acc + b.loyer, 0)}{" "}
              €
            </p>
            <p className="text-xs font-medium opacity-90 mt-1">Loyer mensuel</p>
          </div>
        </div>

        {/* BARRE RECHERCHE + FILTRES */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-4 py-3 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center mb-5">
          <div className="flex items-center gap-2 flex-1 bg-[#FAFAF8] rounded-xl px-4 py-2.5 border border-gray-100">
            <Search size={16} className="text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="Rechercher une adresse..."
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              className="bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400 w-full"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {[
              { key: "tous", label: "Tous" },
              { key: "actif", label: "Actif" },
              { key: "terminé", label: "Terminé" },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFiltre(f.key as typeof filtre)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  filtre === f.key
                    ? "text-white shadow-md"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
                style={
                  filtre === f.key
                    ? { background: "linear-gradient(135deg, #f97316, #f59e0b)" }
                    : {}
                }
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* TABLEAU DES BIENS — desktop */}
        <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-4">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  Logement
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  Type
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  Loyer
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  Statut
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  Documents
                </th>
                <th className="px-5 py-3.5 text-right text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {biensFiltres.map((b, i) => (
                <tr
                  key={b.id}
                  className={`border-b border-gray-50 hover:bg-orange-50/20 transition ${
                    i === biensFiltres.length - 1 ? "border-0" : ""
                  }`}
                >
                  <td className="px-5 py-4">
                    <p className="font-bold text-gray-800">{b.adresse.split(",")[0]}</p>
                    <p className="text-xs text-gray-400">
                      {b.adresse.split(",").slice(1).join(",")}
                    </p>
                  </td>
                  <td className="px-5 py-4 text-gray-500 text-sm">{b.type}</td>
                  <td className="px-5 py-4 font-bold text-gray-800">{b.loyer} €</td>
                  <td className="px-5 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        b.statut === "actif"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {b.statut === "actif" ? "Actif" : "Terminé"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Receipt size={12} /> {b.quittances.length}
                      </span>
                      <span className="flex items-center gap-1">
                        <RefreshCw size={12} /> {b.regularisations.length}
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText size={12} /> 1
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => {
                        setBienSelectionne(b.id);
                        setOnglet("quittances");
                      }}
                      className="text-sm font-semibold text-orange-500 hover:text-orange-600 transition"
                    >
                      Voir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* CARTES BIENS — mobile */}
        <div className="md:hidden space-y-3">
          {biensFiltres.map((b) => (
            <button
              key={b.id}
              onClick={() => {
                setBienSelectionne(b.id);
                setOnglet("quittances");
              }}
              className="w-full bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:border-orange-300 transition text-left group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                      background:
                        b.statut === "actif"
                          ? "linear-gradient(135deg, #f97316, #f59e0b)"
                          : "linear-gradient(135deg, #94a3b8, #64748b)",
                    }}
                  >
                    <Home size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 text-sm">{b.adresse.split(",")[0]}</p>
                    <p className="text-xs text-gray-400">
                      {b.adresse.split(",").slice(1).join(",")}
                    </p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-gray-300 group-hover:text-orange-400 transition mt-1" />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    b.statut === "actif"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {b.statut === "actif" ? "Actif" : "Terminé"}
                </span>
                <span className="text-xs text-gray-500 font-semibold">{b.loyer} €/mois</span>
                <span className="text-xs text-gray-400">• {b.type}</span>
              </div>
              <div className="flex gap-4 mt-3 pt-3 border-t border-gray-50">
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <Receipt size={12} /> {b.quittances.length} quittances
                </span>
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <FileText size={12} /> 1 bail
                </span>
              </div>
            </button>
          ))}
        </div>

        <p className="text-center text-xs text-gray-400 mt-8">
          🔒 Espace sécurisé — Vos documents sont confidentiels
        </p>
      </div>
    </div>
  );
}
