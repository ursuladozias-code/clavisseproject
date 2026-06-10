"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";

// --- MOCK DATA ---
const donneesGraphique = {
  mois: [
    { periode: "Jan", revenus: 4200, charges: 1100, resultat: 3100 },
    { periode: "Fév", revenus: 4200, charges: 980, resultat: 3220 },
    { periode: "Mar", revenus: 4350, charges: 1200, resultat: 3150 },
    { periode: "Avr", revenus: 4200, charges: 890, resultat: 3310 },
    { periode: "Mai", revenus: 4350, charges: 1050, resultat: 3300 },
    { periode: "Juin", revenus: 3600, charges: 950, resultat: 2650 },
  ],
  trimestre: [
    { periode: "T1", revenus: 12750, charges: 3280, resultat: 9470 },
    { periode: "T2", revenus: 13100, charges: 2890, resultat: 10210 },
    { periode: "T3", revenus: 12600, charges: 3100, resultat: 9500 },
    { periode: "T4", revenus: 13400, charges: 2950, resultat: 10450 },
  ],
  annee: [
    { periode: "2021", revenus: 45000, charges: 11200, resultat: 33800 },
    { periode: "2022", revenus: 48000, charges: 12100, resultat: 35900 },
    { periode: "2023", revenus: 51200, charges: 12300, resultat: 38900 },
    { periode: "2024", revenus: 51850, charges: 12220, resultat: 39630 },
  ],
};

const alertes = [
  {
    id: 1,
    icone: "⚠️",
    message: "Loyer impayé",
    detail: "Jean Martin — Maison Vincennes",
    date: "il y a 3 jours",
    priorite: "haute",
  },
  {
    id: 2,
    icone: "📋",
    message: "Bail arrivant à échéance",
    detail: "Studio Gambetta — 30/08/2025",
    date: "dans 62 jours",
    priorite: "moyenne",
  },
  {
    id: 3,
    icone: "📄",
    message: "Document manquant",
    detail: "Attestation assurance — Marie Dupont",
    date: "il y a 5 jours",
    priorite: "moyenne",
  },
  {
    id: 4,
    icone: "🔄",
    message: "Régularisation à effectuer",
    detail: "Appartement Voltaire — Période 2024",
    date: "À traiter",
    priorite: "basse",
  },
];

const activiteRecente = [
  {
    id: 1,
    icone: "💰",
    message: "Loyer encaissé — Marie Dupont",
    detail: "Appartement Voltaire • 1 350 €",
    date: "Aujourd'hui, 09:14",
  },
  {
    id: 2,
    icone: "📄",
    message: "Quittance générée — Sophie Bernard",
    detail: "Studio Gambetta • Mai 2025",
    date: "Hier, 14:32",
  },
  {
    id: 3,
    icone: "🔧",
    message: "Dépense ajoutée — Plomberie",
    detail: "Maison Vincennes • 320 €",
    date: "22/06/2025",
  },
  {
    id: 4,
    icone: "👤",
    message: "Nouveau locataire — Paul Durand",
    detail: "Studio Gambetta",
    date: "20/06/2025",
  },
  {
    id: 5,
    icone: "📋",
    message: "Bail modifié — Jean Martin",
    detail: "Maison Vincennes • Révision IRL",
    date: "18/06/2025",
  },
];

type PeriodeGraphique = "mois" | "trimestre" | "annee";

// --- COMPOSANT GRAPHIQUE BARRES CSS ---
function BarChartCSS({
  data,
}: {
  data: { periode: string; revenus: number; charges: number; resultat: number }[];
}) {
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    item: (typeof data)[0] | null;
  }>({ visible: false, x: 0, y: 0, item: null });

  const maxVal = Math.max(...data.flatMap((d) => [d.revenus, d.charges, d.resultat]));

  return (
    <div className="w-full">
      {/* Légende */}
      <div className="flex items-center gap-5 mb-5 flex-wrap">
        {[
          { color: "#f97316", label: "Revenus" },
          { color: "#f43f5e", label: "Charges" },
          { color: "#10b981", label: "Résultat" },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: l.color }}
            />
            <span className="text-xs text-gray-400 font-medium">{l.label}</span>
          </div>
        ))}
      </div>

      {/* Barres */}
      <div className="relative">
        {/* Lignes de grille horizontales */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-8">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="border-t border-gray-100 w-full" />
          ))}
        </div>

        <div className="flex items-end justify-between gap-1 sm:gap-2 h-48 pb-8 relative">
          {data.map((d, i) => (
            <div
              key={i}
              className="flex-1 flex flex-col items-center gap-0.5 group relative"
              onMouseEnter={(e) => {
                const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                setTooltip({ visible: true, x: rect.left, y: rect.top, item: d });
              }}
              onMouseLeave={() => setTooltip({ ...tooltip, visible: false })}
            >
              {/* Groupe de 3 barres */}
              <div className="flex items-end gap-0.5 sm:gap-1 w-full justify-center h-40">
                {[
                  { val: d.revenus, color: "#f97316" },
                  { val: d.charges, color: "#f43f5e" },
                  { val: d.resultat, color: "#10b981" },
                ].map((b, j) => (
                  <div
                    key={j}
                    className="flex-1 max-w-[18px] sm:max-w-[24px] rounded-t-lg transition-all duration-300 group-hover:opacity-90"
                    style={{
                      height: `${(b.val / maxVal) * 100}%`,
                      backgroundColor: b.color,
                      minHeight: "4px",
                    }}
                  />
                ))}
              </div>
              {/* Label période */}
              <span className="text-xs text-gray-400 font-medium mt-1 truncate max-w-full text-center">
                {d.periode}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Tooltip */}
      {tooltip.visible && tooltip.item && (
        <div
          className="fixed z-50 bg-white rounded-2xl shadow-xl border border-gray-100 p-3 pointer-events-none text-xs"
          style={{ top: tooltip.y - 120, left: tooltip.x - 60 }}
        >
          <p className="font-bold text-gray-700 mb-2">{tooltip.item.periode}</p>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-orange-400" />
              <span className="text-gray-500">Revenus :</span>
              <span className="font-bold text-gray-700">
                {tooltip.item.revenus.toLocaleString("fr-FR")} €
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-rose-400" />
              <span className="text-gray-500">Charges :</span>
              <span className="font-bold text-gray-700">
                {tooltip.item.charges.toLocaleString("fr-FR")} €
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-gray-500">Résultat :</span>
              <span className="font-bold text-emerald-600">
                {tooltip.item.resultat.toLocaleString("fr-FR")} €
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- PAGE PRINCIPALE ---
export default function Dashboard() {
  const [periodeGraphique, setPeriodeGraphique] =
    useState<PeriodeGraphique>("mois");

  const data = donneesGraphique[periodeGraphique];

  return (
    <div
      className="min-h-screen px-4 md:px-8 py-8"
      style={{ backgroundColor: "#FDF6EC" }}
    >
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ── EN-TÊTE ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800">
              👋 Bonjour, Thomas
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Tableau de bord — vision globale de votre patrimoine
            </p>
          </div>
          <button
            className="self-start sm:self-auto flex items-center gap-2 px-5 py-3 rounded-2xl text-white text-sm font-bold shadow-lg hover:opacity-90 transition"
            style={{ background: "linear-gradient(135deg, #f43f5e, #fb7185)" }}
          >
            🔔 4 alertes actives
          </button>
        </div>

        {/* ── ROW 1 : 4 KPI CARDS ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              emoji: "💰",
              value: "3 600 €",
              label: "Loyers encaissés",
              sub: "3 / 4 loyers · +5% vs mois préc.",
              gradient: "linear-gradient(135deg, #f97316, #f59e0b)",
            },
            {
              emoji: "📊",
              value: "2 650 €",
              label: "Résultat net",
              sub: "Revenus 3 600 € – Charges 950 €",
              gradient: "linear-gradient(135deg, #10b981, #06b6d4)",
            },
            {
              emoji: "⚠️",
              value: "2 100 €",
              label: "Impayés",
              sub: "1 locataire · 1 échéance · 3 j.",
              gradient: "linear-gradient(135deg, #f43f5e, #fb7185)",
            },
            {
              emoji: "🏠",
              value: "75 %",
              label: "Taux d'occupation",
              sub: "3 biens · 1 vacant",
              gradient: "linear-gradient(135deg, #a78bfa, #8b5cf6)",
            },
          ].map((kpi) => (
            <div
              key={kpi.label}
              className="rounded-3xl p-5 md:p-6 text-white shadow-md flex flex-col justify-between min-h-[140px] md:min-h-[160px]"
              style={{ background: kpi.gradient }}
            >
              <div className="text-3xl">{kpi.emoji}</div>
              <div>
                <p className="text-2xl md:text-3xl font-extrabold leading-none">
                  {kpi.value}
                </p>
                <p className="text-sm font-semibold opacity-90 mt-1">
                  {kpi.label}
                </p>
                <p className="text-xs opacity-70 mt-1 hidden sm:block">
                  {kpi.sub}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* ── ROW 2 : GRAPHIQUE + ALERTES ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* GRAPHIQUE */}
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <div>
                <h2 className="text-lg font-extrabold text-gray-800">
                  📈 Produits – Charges – Résultat
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Évolution financière de votre patrimoine
                </p>
              </div>
              {/* Toggle période */}
              <div className="flex gap-1 bg-gray-100 rounded-2xl p-1 self-start sm:self-auto shrink-0">
                {(
                  [
                    { key: "mois", label: "Mois" },
                    { key: "trimestre", label: "Trim." },
                    { key: "annee", label: "Année" },
                  ] as { key: PeriodeGraphique; label: string }[]
                ).map((p) => (
                  <button
                    key={p.key}
                    onClick={() => setPeriodeGraphique(p.key)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      periodeGraphique === p.key
                        ? "bg-white text-orange-500 shadow"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
            <BarChartCSS data={data} />
          </div>

          {/* ALERTES */}
          <div className="bg-white rounded-3xl shadow-sm p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-extrabold text-gray-800">
                🔔 À traiter
              </h2>
              <span
                className="text-xs font-bold px-3 py-1 rounded-full text-white"
                style={{
                  background: "linear-gradient(135deg, #f43f5e, #fb7185)",
                }}
              >
                {alertes.length}
              </span>
            </div>
            <div className="flex flex-col gap-2 flex-1">
              {alertes.map((a) => (
                <button
                  key={a.id}
                  className="flex items-start gap-3 p-3.5 rounded-2xl text-left group transition-all"
                  style={{ backgroundColor: "#FDF6EC" }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLElement).style.backgroundColor =
                      "#fff7ed")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLElement).style.backgroundColor =
                      "#FDF6EC")
                  }
                >
                  <span className="text-xl shrink-0">{a.icone}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-700 leading-snug">
                      {a.message}
                    </p>
                    <p className="text-xs text-gray-400 truncate mt-0.5">
                      {a.detail}
                    </p>
                    <p className="text-xs text-gray-300 mt-0.5">{a.date}</p>
                  </div>
                  <ArrowRight
                    size={13}
                    className="text-gray-300 shrink-0 mt-1"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── ROW 3 : RÉSUMÉ PATRIMOINE + ACTIVITÉ RÉCENTE ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* RÉSUMÉ PATRIMOINE */}
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-extrabold text-gray-800">
                🏘️ Résumé du patrimoine
              </h2>
              <button className="text-sm font-bold text-orange-500 hover:text-orange-600 flex items-center gap-1 transition">
                Voir tout <ArrowRight size={13} />
              </button>
            </div>

            {/* 4 mini-stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {[
                {
                  emoji: "🏠",
                  label: "Biens total",
                  value: "3",
                  bg: "#fff7ed",
                  color: "#f97316",
                },
                {
                  emoji: "👥",
                  label: "Locataires",
                  value: "3",
                  bg: "#eff6ff",
                  color: "#3b82f6",
                },
                {
                  emoji: "💵",
                  label: "Valeur locative",
                  value: "4 350 €",
                  bg: "#f0fdf4",
                  color: "#10b981",
                },
                {
                  emoji: "📅",
                  label: "Revenus annuels",
                  value: "51 850 €",
                  bg: "#faf5ff",
                  color: "#8b5cf6",
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-2xl p-4 flex flex-col gap-1"
                  style={{ backgroundColor: s.bg }}
                >
                  <span className="text-2xl">{s.emoji}</span>
                  <p
                    className="text-xl font-extrabold"
                    style={{ color: s.color }}
                  >
                    {s.value}
                  </p>
                  <p className="text-xs text-gray-400 font-medium">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Répartition statuts */}
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                Répartition des biens
              </p>
              <div className="space-y-3">
                {[
                  {
                    label: "Occupé",
                    count: 2,
                    total: 4,
                    barColor: "#10b981",
                    bgBadge: "#f0fdf4",
                    textBadge: "#10b981",
                  },
                  {
                    label: "Vacant",
                    count: 1,
                    total: 4,
                    barColor: "#f97316",
                    bgBadge: "#fff7ed",
                    textBadge: "#f97316",
                  },
                  {
                    label: "Préavis en cours",
                    count: 1,
                    total: 4,
                    barColor: "#f59e0b",
                    bgBadge: "#fffbeb",
                    textBadge: "#d97706",
                  },
                ].map((s) => (
                  <div key={s.label} className="flex items-center gap-3">
                    <span
                      className="text-xs font-bold px-3 py-1 rounded-full w-36 text-center shrink-0"
                      style={{
                        backgroundColor: s.bgBadge,
                        color: s.textBadge,
                      }}
                    >
                      {s.label}
                    </span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2.5">
                      <div
                        className="h-2.5 rounded-full transition-all duration-500"
                        style={{
                          width: `${(s.count / s.total) * 100}%`,
                          backgroundColor: s.barColor,
                        }}
                      />
                    </div>
                    <span className="text-sm font-extrabold text-gray-600 w-4 text-right shrink-0">
                      {s.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ACTIVITÉ RÉCENTE */}
          <div className="bg-white rounded-3xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-extrabold text-gray-800">
                ⚡ Activité récente
              </h2>
              <button className="text-xs font-bold text-orange-500 hover:text-orange-600 transition">
                Tout voir
              </button>
            </div>
            <div>
              {activiteRecente.map((a, i) => (
                <div key={a.id}>
                  <div className="flex items-start gap-3 py-3">
                    <div
                      className="w-9 h-9 rounded-2xl flex items-center justify-center text-lg shrink-0"
                      style={{ backgroundColor: "#FDF6EC" }}
                    >
                      {a.icone}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-700 leading-snug">
                        {a.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5 truncate">
                        {a.detail}
                      </p>
                      <p className="text-xs text-gray-300 mt-0.5">{a.date}</p>
                    </div>
                  </div>
                  {i < activiteRecente.length - 1 && (
                    <div className="h-px bg-gray-50 ml-12" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
