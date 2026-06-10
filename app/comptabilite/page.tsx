"use client";

import { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Plus,
  ChevronRight,
  AlertCircle,
  Send,
  Paperclip,
  X,
  Euro,
  Building2,
  Calendar,
  Filter,
  BarChart3,
  CheckCircle,
  Clock,
} from "lucide-react";

type Bien = {
  id: string;
  nom: string;
  adresse: string;
  locataire: string;
  loyer: number;
};

type Revenu = {
  id: string;
  bienId: string;
  mois: number;
  annee: number;
  montant: number;
  statut: "payé" | "impayé" | "en_attente";
};

type Depense = {
  id: string;
  bienId: string;
  mois: number;
  annee: number;
  nature: string;
  montant: number;
  justificatif?: string;
};

const BIENS: Bien[] = [
  { id: "b1", nom: "Appartement Paris 11e", adresse: "12 rue de la Roquette", locataire: "Marie Dupont", loyer: 1200 },
  { id: "b2", nom: "Studio Lyon 3e", adresse: "8 cours Lafayette", locataire: "Paul Martin", loyer: 650 },
  { id: "b3", nom: "T3 Bordeaux", adresse: "3 allée des Chartrons", locataire: "Sophie Bernard", loyer: 890 },
];

const MOIS = [
  "Janvier","Février","Mars","Avril","Mai","Juin",
  "Juillet","Août","Septembre","Octobre","Novembre","Décembre",
];

const REVENUS_INIT: Revenu[] = [
  { id: "r1", bienId: "b1", mois: 1, annee: 2025, montant: 1200, statut: "payé" },
  { id: "r2", bienId: "b1", mois: 2, annee: 2025, montant: 1200, statut: "payé" },
  { id: "r3", bienId: "b1", mois: 3, annee: 2025, montant: 1200, statut: "payé" },
  { id: "r4", bienId: "b1", mois: 4, annee: 2025, montant: 1200, statut: "payé" },
  { id: "r5", bienId: "b1", mois: 5, annee: 2025, montant: 1200, statut: "impayé" },
  { id: "r6", bienId: "b2", mois: 1, annee: 2025, montant: 650, statut: "payé" },
  { id: "r7", bienId: "b2", mois: 2, annee: 2025, montant: 650, statut: "payé" },
  { id: "r8", bienId: "b2", mois: 3, annee: 2025, montant: 650, statut: "en_attente" },
  { id: "r9", bienId: "b3", mois: 1, annee: 2025, montant: 890, statut: "payé" },
  { id: "r10", bienId: "b3", mois: 2, annee: 2025, montant: 890, statut: "payé" },
];

const DEPENSES_INIT: Depense[] = [
  { id: "d1", bienId: "b1", mois: 2, annee: 2025, nature: "Plomberie", montant: 320 },
  { id: "d2", bienId: "b1", mois: 3, annee: 2025, nature: "Assurance PNO", montant: 180 },
  { id: "d3", bienId: "b2", mois: 1, annee: 2025, nature: "Taxe foncière", montant: 750 },
  { id: "d4", bienId: "b3", mois: 3, annee: 2025, nature: "Ravalement façade", montant: 1200 },
];

export default function ComptabilitePage() {
  const [onglet, setOnglet] = useState<"revenus" | "depenses">("revenus");
  const [bienSelectionne, setBienSelectionne] = useState<Bien | null>(null);
  const [revenus, setRevenus] = useState<Revenu[]>(REVENUS_INIT);
  const [depenses, setDepenses] = useState<Depense[]>(DEPENSES_INIT);
  const [showRecap, setShowRecap] = useState(false);
  const [showRelance, setShowRelance] = useState<Revenu | null>(null);
  const [showAddDepense, setShowAddDepense] = useState(false);
  const [moisDepense, setMoisDepense] = useState<number | null>(null);
  const [filtreDepense, setFiltreDepense] = useState<"mensuel" | "annuel" | "bien">("mensuel");
  const [formDepense, setFormDepense] = useState({ nature: "", montant: "", mois: "" });

  const totalRevenus = revenus.filter((r) => r.statut === "payé").reduce((s, r) => s + r.montant, 0);
  const totalImpayes = revenus.filter((r) => r.statut === "impayé").reduce((s, r) => s + r.montant, 0);
  const totalDepenses = depenses.reduce((s, d) => s + d.montant, 0);
  const resultatNet = totalRevenus - totalDepenses;

  function ajouterDepense() {
    if (!bienSelectionne || !formDepense.nature || !formDepense.montant) return;
    const mois = moisDepense ?? parseInt(formDepense.mois);
    const nouvelle: Depense = {
      id: `d${Date.now()}`,
      bienId: bienSelectionne.id,
      mois,
      annee: 2025,
      nature: formDepense.nature,
      montant: parseFloat(formDepense.montant),
    };
    setDepenses([...depenses, nouvelle]);
    setShowAddDepense(false);
    setFormDepense({ nature: "", montant: "", mois: "" });
    setMoisDepense(null);
  }

  function envoyerRelance(revenu: Revenu) {
    const bien = BIENS.find((b) => b.id === revenu.bienId);
    alert(`Relance envoyée à ${bien?.locataire} pour le loyer de ${MOIS[revenu.mois - 1]} (${revenu.montant} €)`);
    setShowRelance(null);
  }

  const revenusBien = bienSelectionne
    ? revenus.filter((r) => r.bienId === bienSelectionne.id)
    : [];

  const depensesBien = bienSelectionne
    ? depenses.filter((d) => d.bienId === bienSelectionne.id)
    : [];

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Comptabilité</h1>
            <p className="text-sm text-gray-500 mt-0.5">Suivez vos revenus et dépenses</p>
          </div>
          <button
            onClick={() => setShowRecap(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-md transition-all hover:opacity-90 active:scale-95"
            style={{ background: "linear-gradient(135deg, #f59e0b, #f97316)" }}
          >
            <BarChart3 size={16} />
            Récapitulatif
          </button>
        </div>

       {/* KPIs - style dégradé comme Baux */}
<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
  {/* Revenus perçus */}
  <div
    className="rounded-2xl p-3 md:p-5 text-white shadow-md"
    style={{ background: "linear-gradient(135deg, #10d9a0, #06b6d4)" }}
  >
    <div className="text-2xl md:text-3xl mb-1 md:mb-2">💰</div>
    <p className="text-xl md:text-3xl font-bold">{totalRevenus.toLocaleString()} €</p>
    <p className="text-xs md:text-sm font-medium opacity-90 mt-1">Revenus perçus</p>
  </div>

  {/* Dépenses */}
  <div
    className="rounded-2xl p-3 md:p-5 text-white shadow-md"
    style={{ background: "linear-gradient(135deg, #f87171, #ec4899)" }}
  >
    <div className="text-2xl md:text-3xl mb-1 md:mb-2">📉</div>
    <p className="text-xl md:text-3xl font-bold">{totalDepenses.toLocaleString()} €</p>
    <p className="text-xs md:text-sm font-medium opacity-90 mt-1">Dépenses</p>
  </div>

  {/* Solde net */}
  <div
    className="rounded-2xl p-3 md:p-5 text-white shadow-md"
    style={{ background: "linear-gradient(135deg, #a78bfa, #8b5cf6)" }}
  >
    <div className="text-2xl md:text-3xl mb-1 md:mb-2">📊</div>
    <p className="text-xl md:text-3xl font-bold">{(totalRevenus - totalDepenses).toLocaleString()} €</p>
    <p className="text-xs md:text-sm font-medium opacity-90 mt-1">Solde net</p>
  </div>

  {/* Impayés */}
  <div
    className="rounded-2xl p-3 md:p-5 text-white shadow-md"
    style={{ background: "linear-gradient(135deg, #94a3b8, #64748b)" }}
  >
    <div className="text-2xl md:text-3xl mb-1 md:mb-2">⚠️</div>
    <p className="text-xl md:text-3xl font-bold">{totalImpayes.toLocaleString()} €</p>
    <p className="text-xs md:text-sm font-medium opacity-90 mt-1">Impayés</p>
  </div>
</div>

        {/* Onglets */}
        <div className="flex gap-2 bg-white rounded-2xl p-1.5 shadow-sm border border-gray-200 w-fit">
          <button
            onClick={() => { setOnglet("revenus"); setBienSelectionne(null); }}
            className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
              onglet === "revenus"
                ? "text-white shadow"
                : "text-gray-500 hover:text-gray-700"
            }`}
            style={onglet === "revenus" ? { background: "linear-gradient(135deg, #f59e0b, #f97316)" } : {}}
          >
            Revenus
          </button>
          <button
            onClick={() => { setOnglet("depenses"); setBienSelectionne(null); }}
            className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
              onglet === "depenses"
                ? "text-white shadow"
                : "text-gray-500 hover:text-gray-700"
            }`}
            style={onglet === "depenses" ? { background: "linear-gradient(135deg, #f59e0b, #f97316)" } : {}}
          >
            Dépenses
          </button>
        </div>

        {/* ── REVENUS ── */}
        {onglet === "revenus" && (
          <div className="space-y-4">
            {!bienSelectionne ? (
              <>
                <p className="text-sm text-gray-500">Sélectionnez un bien pour voir le détail des revenus</p>
                {BIENS.map((bien) => {
                  const revsBien = revenus.filter((r) => r.bienId === bien.id);
                  const total = revsBien.filter((r) => r.statut === "payé").reduce((s, r) => s + r.montant, 0);
                  const impayes = revsBien.filter((r) => r.statut === "impayé").length;
                  return (
                    <button
                      key={bien.id}
                      onClick={() => setBienSelectionne(bien)}
                      className="w-full bg-white rounded-2xl p-4 shadow-sm border border-gray-200 flex items-center justify-between hover:border-amber-300 hover:shadow-md transition-all text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                          style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}
                        >
                          <Building2 size={18} />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{bien.nom}</p>
                          <p className="text-xs text-gray-500">{bien.locataire}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-bold text-emerald-600">{total.toLocaleString()} €</p>
                          {impayes > 0 && (
                            <p className="text-xs text-red-500">{impayes} impayé{impayes > 1 ? "s" : ""}</p>
                          )}
                        </div>
                        <ChevronRight size={16} className="text-gray-400" />
                      </div>
                    </button>
                  );
                })}
              </>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setBienSelectionne(null)}
                    className="text-sm text-amber-600 hover:underline font-medium flex items-center gap-1"
                  >
                    ← Retour
                  </button>
                  <span className="text-gray-300">|</span>
                  <span className="text-sm font-semibold text-gray-900">{bienSelectionne.nom}</span>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-4 border-b border-gray-100 flex items-center gap-3"
                    style={{ background: "linear-gradient(135deg, #ecfdf5, #d1fae5)" }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                      style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}
                    >
                      <Building2 size={18} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{bienSelectionne.nom}</p>
                      <p className="text-xs text-gray-500">{bienSelectionne.locataire} · {bienSelectionne.loyer} €/mois</p>
                    </div>
                  </div>

                  <div className="divide-y divide-gray-50">
                    {MOIS.map((nomMois, idx) => {
                      const moisNum = idx + 1;
                      const revenu = revenusBien.find((r) => r.mois === moisNum);
                      return (
                        <div key={moisNum} className="flex items-center justify-between px-4 py-3">
                          <span className="text-sm text-gray-700 w-28">{nomMois}</span>
                          {revenu ? (
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-semibold text-gray-900">{revenu.montant.toLocaleString()} €</span>
                              {revenu.statut === "payé" && (
                                <span className="flex items-center gap-1 text-xs text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-medium">
                                  <CheckCircle size={11} /> Payé
                                </span>
                              )}
                              {revenu.statut === "en_attente" && (
                                <span className="flex items-center gap-1 text-xs text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full font-medium">
                                  <Clock size={11} /> En attente
                                </span>
                              )}
                              {revenu.statut === "impayé" && (
                                <div className="flex items-center gap-2">
                                  <span className="flex items-center gap-1 text-xs text-red-700 bg-red-100 px-2 py-0.5 rounded-full font-medium">
                                    <AlertCircle size={11} /> Impayé
                                  </span>
                                  <button
                                    onClick={() => setShowRelance(revenu)}
                                    className="flex items-center gap-1 text-xs text-white px-2 py-0.5 rounded-full font-medium transition-all hover:opacity-90"
                                    style={{ background: "linear-gradient(135deg, #f59e0b, #f97316)" }}
                                  >
                                    <Send size={11} /> Relancer
                                  </button>
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-300 italic">Aucun enregistrement</span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="p-4 border-t border-gray-100 flex justify-between items-center bg-gray-50">
                    <span className="text-sm font-medium text-gray-600">Total perçu</span>
                    <span className="text-base font-bold text-emerald-600">
                      {revenusBien.filter((r) => r.statut === "payé").reduce((s, r) => s + r.montant, 0).toLocaleString()} €
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── DÉPENSES ── */}
        {onglet === "depenses" && (
          <div className="space-y-4">

            {/* Filtres */}
            <div className="flex gap-2 flex-wrap">
              {(["mensuel", "annuel", "bien"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFiltreDepense(f)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    filtreDepense === f
                      ? "text-white border-transparent shadow"
                      : "bg-white text-gray-600 border-gray-200 hover:border-amber-300"
                  }`}
                  style={filtreDepense === f ? { background: "linear-gradient(135deg, #f59e0b, #f97316)" } : {}}
                >
                  <Filter size={11} />
                  {f === "mensuel" ? "Par mois" : f === "annuel" ? "Par année" : "Par bien"}
                </button>
              ))}
            </div>

            {!bienSelectionne ? (
              <>
                <p className="text-sm text-gray-500">Sélectionnez un bien pour gérer ses dépenses</p>
                {BIENS.map((bien) => {
                  const depsBien = depenses.filter((d) => d.bienId === bien.id);
                  const total = depsBien.reduce((s, d) => s + d.montant, 0);
                  return (
                    <button
                      key={bien.id}
                      onClick={() => setBienSelectionne(bien)}
                      className="w-full bg-white rounded-2xl p-4 shadow-sm border border-gray-200 flex items-center justify-between hover:border-amber-300 hover:shadow-md transition-all text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                          style={{ background: "linear-gradient(135deg, #6b7280, #4b5563)" }}
                        >
                          <Building2 size={18} />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{bien.nom}</p>
                          <p className="text-xs text-gray-500">{depsBien.length} dépense{depsBien.length > 1 ? "s" : ""}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-gray-600">{total.toLocaleString()} €</span>
                        <ChevronRight size={16} className="text-gray-400" />
                      </div>
                    </button>
                  );
                })}
              </>
            ) : (
              <>
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setBienSelectionne(null)}
                      className="text-sm text-amber-600 hover:underline font-medium flex items-center gap-1"
                    >
                      ← Retour
                    </button>
                    <span className="text-gray-300">|</span>
                    <span className="text-sm font-semibold text-gray-900">{bienSelectionne.nom}</span>
                  </div>
                  <button
                    onClick={() => setShowAddDepense(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white shadow-md hover:opacity-90 active:scale-95 transition-all"
                    style={{ background: "linear-gradient(135deg, #f59e0b, #f97316)" }}
                  >
                    <Plus size={15} />
                    Ajouter une dépense
                  </button>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  <div
                    className="p-4 border-b border-gray-100 flex items-center gap-3"
                    style={{ background: "linear-gradient(135deg, #f3f4f6, #e5e7eb)" }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                      style={{ background: "linear-gradient(135deg, #6b7280, #4b5563)" }}
                    >
                      <Building2 size={18} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{bienSelectionne.nom}</p>
                      <p className="text-xs text-gray-500">{bienSelectionne.adresse}</p>
                    </div>
                  </div>

                  {filtreDepense === "mensuel" && (
                    <div>
                      {MOIS.map((nomMois, idx) => {
                        const moisNum = idx + 1;
                        const deps = depensesBien.filter((d) => d.mois === moisNum);
                        if (deps.length === 0) return null;
                        return (
                          <div key={moisNum}>
                            <div className="px-4 py-2 bg-gray-50 border-y border-gray-100">
                              <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">{nomMois} 2025</span>
                            </div>
                            {deps.map((dep) => (
                              <div key={dep.id} className="flex items-center justify-between px-4 py-3 border-b border-gray-50 last:border-0">
                                <div className="flex items-center gap-3">
                                  <div
                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                                    style={{ background: "linear-gradient(135deg, #9ca3af, #6b7280)" }}
                                  >
                                    <Euro size={14} />
                                  </div>
                                  <span className="text-sm text-gray-800">{dep.nature}</span>
                                </div>
                                <span className="text-sm font-bold text-gray-700">{dep.montant.toLocaleString()} €</span>
                              </div>
                            ))}
                          </div>
                        );
                      })}
                      {depensesBien.length === 0 && (
                        <div className="p-8 text-center text-gray-400 text-sm">Aucune dépense enregistrée</div>
                      )}
                    </div>
                  )}

                  {filtreDepense === "annuel" && (
                    <div>
                      {depensesBien.length === 0 ? (
                        <div className="p-8 text-center text-gray-400 text-sm">Aucune dépense enregistrée</div>
                      ) : (
                        <div>
                          {depensesBien.map((dep) => (
                            <div key={dep.id} className="flex items-center justify-between px-4 py-3 border-b border-gray-50 last:border-0">
                              <div className="flex items-center gap-3">
                                <div
                                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                                  style={{ background: "linear-gradient(135deg, #9ca3af, #6b7280)" }}
                                >
                                  <Calendar size={14} />
                                </div>
                                <div>
                                  <p className="text-sm text-gray-800">{dep.nature}</p>
                                  <p className="text-xs text-gray-400">{MOIS[dep.mois - 1]} {dep.annee}</p>
                                </div>
                              </div>
                              <span className="text-sm font-bold text-gray-700">{dep.montant.toLocaleString()} €</span>
                            </div>
                          ))}
                          <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-between">
                            <span className="text-sm font-medium text-gray-600">Total annuel</span>
                            <span className="text-sm font-bold text-gray-700">
                              {depensesBien.reduce((s, d) => s + d.montant, 0).toLocaleString()} €
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {filtreDepense === "bien" && (
                    <div className="p-4 space-y-2">
                      {BIENS.map((b) => {
                        const deps = depenses.filter((d) => d.bienId === b.id);
                        const total = deps.reduce((s, d) => s + d.montant, 0);
                        return (
                          <div key={b.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                            <span className="text-sm text-gray-700 font-medium">{b.nom}</span>
                            <span className="text-sm font-bold text-gray-700">{total.toLocaleString()} €</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── MODAL RÉCAPITULATIF ── */}
        {showRecap && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-gray-900">Récapitulatif global</h2>
                <button onClick={() => setShowRecap(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-3 mb-5">
                <div className="flex justify-between p-3 rounded-xl text-white"
                  style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}>
                  <span className="text-sm font-semibold">Total revenus perçus</span>
                  <span className="text-sm font-bold">{totalRevenus.toLocaleString()} €</span>
                </div>
                <div className="flex justify-between p-3 rounded-xl text-white"
                  style={{ background: "linear-gradient(135deg, #f43f5e, #e11d48)" }}>
                  <span className="text-sm font-semibold">Total impayés</span>
                  <span className="text-sm font-bold">{totalImpayes.toLocaleString()} €</span>
                </div>
                <div className="flex justify-between p-3 rounded-xl text-white"
                  style={{ background: "linear-gradient(135deg, #6b7280, #4b5563)" }}>
                  <span className="text-sm font-semibold">Total dépenses</span>
                  <span className="text-sm font-bold">{totalDepenses.toLocaleString()} €</span>
                </div>
                <div className="flex justify-between p-3 rounded-xl text-white"
                  style={{ background: "linear-gradient(135deg, #a855f7, #7c3aed)" }}>
                  <span className="text-sm font-bold">Résultat net</span>
                  <span className="text-sm font-bold">{resultatNet.toLocaleString()} €</span>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Par bien</p>
                {BIENS.map((b) => {
                  const rev = revenus.filter((r) => r.bienId === b.id && r.statut === "payé").reduce((s, r) => s + r.montant, 0);
                  const dep = depenses.filter((d) => d.bienId === b.id).reduce((s, d) => s + d.montant, 0);
                  return (
                    <div key={b.id} className="p-3 border border-gray-100 rounded-xl bg-gray-50">
                      <p className="text-sm font-semibold text-gray-800 mb-1">{b.nom}</p>
                      <div className="flex gap-4 text-xs flex-wrap">
                        <span className="text-emerald-600 font-medium">Revenus : {rev.toLocaleString()} €</span>
                        <span className="text-gray-500 font-medium">Dépenses : {dep.toLocaleString()} €</span>
                        <span className="font-bold" style={{ color: "#7c3aed" }}>Net : {(rev - dep).toLocaleString()} €</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── MODAL RELANCE ── */}
        {showRelance && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Envoyer une relance</h2>
                <button onClick={() => setShowRelance(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
                  <X size={16} />
                </button>
              </div>
              <div
                className="rounded-xl p-3 mb-4 text-white"
                style={{ background: "linear-gradient(135deg, #f43f5e, #e11d48)" }}
              >
                <p className="text-sm font-semibold">
                  Loyer impayé de <strong>{showRelance.montant} €</strong> — {MOIS[showRelance.mois - 1]} {showRelance.annee}
                </p>
                <p className="text-xs opacity-80 mt-1">
                  {BIENS.find((b) => b.id === showRelance.bienId)?.locataire}
                </p>
              </div>
              <textarea
                rows={4}
                defaultValue={`Bonjour,\n\nNous vous rappelons que le loyer du mois de ${MOIS[showRelance.mois - 1]} d'un montant de ${showRelance.montant} € n'a pas encore été réglé.\n\nMerci de procéder au règlement dans les plus brefs délais.`}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-400 mb-4 resize-none"
              />
              <button
                onClick={() => envoyerRelance(showRelance)}
                className="w-full py-3 rounded-xl font-bold text-white shadow-md hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg, #f59e0b, #f97316)" }}
              >
                <Send size={15} />
                Envoyer la relance
              </button>
            </div>
          </div>
        )}

        {/* ── MODAL AJOUTER DÉPENSE ── */}
        {showAddDepense && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Ajouter une dépense</h2>
                <button onClick={() => setShowAddDepense(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block uppercase tracking-wide">Bien</label>
                  <div className="bg-gray-50 rounded-xl px-3 py-2.5 text-sm text-gray-700 border border-gray-100">{bienSelectionne?.nom}</div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block uppercase tracking-wide">Mois</label>
                  <select
                    value={moisDepense ?? ""}
                    onChange={(e) => setMoisDepense(parseInt(e.target.value))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    <option value="">Sélectionner un mois</option>
                    {MOIS.map((m, i) => (
                      <option key={i} value={i + 1}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block uppercase tracking-wide">Nature de la dépense</label>
                  <input
                    type="text"
                    placeholder="Ex: Plomberie, Assurance..."
                    value={formDepense.nature}
                    onChange={(e) => setFormDepense({ ...formDepense, nature: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block uppercase tracking-wide">Montant (€)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={formDepense.montant}
                    onChange={(e) => setFormDepense({ ...formDepense, montant: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block uppercase tracking-wide">Justificatif (optionnel)</label>
                  <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5 cursor-pointer hover:bg-gray-50 transition-all">
                    <Paperclip size={14} className="text-gray-400" />
                    <span className="text-sm text-gray-400">{"Ajouter un fichier"}</span>
                  </div>
                </div>
                <button
                  onClick={ajouterDepense}
                  className="w-full py-3 rounded-xl font-bold text-white shadow-md hover:opacity-90 active:scale-95 transition-all"
                  style={{ background: "linear-gradient(135deg, #f59e0b, #f97316)" }}
                >
                  Enregistrer la dépense
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
