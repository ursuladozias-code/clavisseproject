"use client";
import { useState } from "react";

const formatEuros = (n: number) =>
  n.toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

const BIENS_INITIAUX = [
  {
    id: 1,
    reference: "BIEN-001",
    nom: "Appartement Voltaire",
    adresse: "12 rue Voltaire",
    codePostal: "75011",
    ville: "Paris",
    typeLocation: "Location nue",
    typeLogement: "Appartement",
    surface: 45,
    pieces: 2,
    loyer: 1200,
    charges: 150,
    statut: "Occupé",
    locataire: "Marie Dupont",
    dateEntree: "2023-03-01",
    dpe: "C",
    etage: 3,
    ascenseur: true,
  },
  {
    id: 2,
    reference: "BIEN-002",
    nom: "Studio Gambetta",
    adresse: "8 avenue Gambetta",
    codePostal: "75020",
    ville: "Paris",
    typeLocation: "Location meublée",
    typeLogement: "Studio",
    surface: 22,
    pieces: 1,
    loyer: 850,
    charges: 80,
    statut: "Vacant",
    locataire: null,
    dateEntree: null,
    dpe: "D",
    etage: 1,
    ascenseur: false,
  },
  {
    id: 3,
    reference: "BIEN-003",
    nom: "Maison Vincennes",
    adresse: "3 rue des Lilas",
    codePostal: "94300",
    ville: "Vincennes",
    typeLocation: "Location nue",
    typeLogement: "Maison",
    surface: 95,
    pieces: 4,
    loyer: 2100,
    charges: 200,
    statut: "Préavis en cours",
    locataire: "Jean Martin",
    dateEntree: "2021-06-15",
    dpe: "B",
    etage: 0,
    ascenseur: false,
  },
];

const STATUT_STYLES: Record<string, string> = {
  "Occupé":           "bg-emerald-100 text-emerald-700 border border-emerald-200",
  "Vacant":           "bg-red-100 text-red-600 border border-red-200",
  "Préavis en cours": "bg-amber-100 text-amber-700 border border-amber-200",
  "Archivé":          "bg-gray-100 text-gray-500 border border-gray-200",
};

const DPE_STYLES: Record<string, string> = {
  A: "bg-green-500",
  B: "bg-green-400",
  C: "bg-yellow-400",
  D: "bg-orange-400",
  E: "bg-orange-500",
  F: "bg-red-500",
  G: "bg-red-700",
};

const FILTRES = ["Tous", "Occupé", "Vacant", "Préavis en cours", "Archivé"];

export default function BiensPage() {
  const [biens, setBiens]         = useState(BIENS_INITIAUX);
  const [filtre, setFiltre]       = useState("Tous");
  const [recherche, setRecherche] = useState("");
  const [showForm, setShowForm]   = useState(false);
  const [step, setStep]           = useState(1);
  const [bienSelectionne, setBienSelectionne] = useState<number | null>(null);

  const [form, setForm] = useState({
    nom: "", adresse: "", codePostal: "", ville: "",
    typeLocation: "Location nue", typeLogement: "Appartement",
    surface: "", pieces: "", etage: "", ascenseur: false,
    cave: false, parking: false, balcon: false, terrasse: false, jardin: false,
    loyer: "", charges: "", typeCharges: "Provision avec régularisation",
    exigibilite: "1", dateRevision: "",
    depotGarantie: "", dateEncaissement: "",
    tantièmes: "", tantiemesImmeuble: "",
    syndic: "", coordSyndic: "", surfacePrivative: "",
    dpe: "C", dateDpe: "", dateFinDpe: "", ges: "C",
  });

  const generateRef = () => `BIEN-${String(biens.length + 1).padStart(3, "0")}`;

  const handleSubmit = () => {
    const nouveau = {
      id: biens.length + 1,
      reference: generateRef(),
      nom: form.nom || "Nouveau bien",
      adresse: form.adresse,
      codePostal: form.codePostal,
      ville: form.ville,
      typeLocation: form.typeLocation,
      typeLogement: form.typeLogement,
      surface: Number(form.surface),
      pieces: Number(form.pieces),
      loyer: Number(form.loyer),
      charges: Number(form.charges),
      statut: "Vacant",
      locataire: null,
      dateEntree: null,
      dpe: form.dpe,
      etage: Number(form.etage),
      ascenseur: form.ascenseur,
    };
    setBiens([...biens, nouveau]);
    setShowForm(false);
    setStep(1);
  };

  const biensFiltres = biens.filter((b) => {
    const matchFiltre = filtre === "Tous" || b.statut === filtre;
    const matchRecherche =
      b.nom.toLowerCase().includes(recherche.toLowerCase()) ||
      b.adresse.toLowerCase().includes(recherche.toLowerCase()) ||
      b.ville.toLowerCase().includes(recherche.toLowerCase());
    return matchFiltre && matchRecherche;
  });

  const stats = {
    total: biens.length,
    occupes: biens.filter((b) => b.statut === "Occupé").length,
    vacants: biens.filter((b) => b.statut === "Vacant").length,
    revenus: biens.filter((b) => b.statut === "Occupé").reduce((s, b) => s + b.loyer + b.charges, 0),
  };

  const bienDetail = biens.find((b) => b.id === bienSelectionne);

  const ETAPES = ["Infos générales", "Caractéristiques", "Finances", "Copropriété", "Diagnostics"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">

      {/* Header */}
      <div className="bg-white border-b border-orange-100 px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">🏠 Mes Biens</h1>
          <p className="text-sm text-gray-500 mt-0.5">Gérez votre patrimoine locatif</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setStep(1); }}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-400 to-amber-400 hover:from-orange-500 hover:to-amber-500 text-white font-semibold px-5 py-2.5 rounded-2xl shadow-md shadow-orange-200 transition-all duration-200 text-sm"
        >
          <span className="text-lg">+</span> Ajouter un bien
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total des biens",  value: stats.total,              icon: "🏠", color: "from-orange-400 to-amber-400",  shadow: "shadow-orange-200" },
            { label: "Biens occupés",    value: stats.occupes,            icon: "✅", color: "from-emerald-400 to-teal-400",  shadow: "shadow-emerald-200" },
            { label: "Biens vacants",    value: stats.vacants,            icon: "🔑", color: "from-rose-400 to-pink-400",     shadow: "shadow-rose-200" },
            { label: "Revenus mensuels", value: formatEuros(stats.revenus), icon: "💰", color: "from-violet-400 to-purple-400", shadow: "shadow-violet-200" },

          ].map((s) => (
            <div key={s.label} className={`bg-gradient-to-br ${s.color} rounded-2xl p-5 text-white shadow-lg ${s.shadow}`}>
              <div className="text-3xl mb-2">{s.icon}</div>
              <div className="text-2xl font-bold">{s.value}</div>
              <div className="text-xs font-medium opacity-80 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filtres + Recherche */}
        <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-4 flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="🔍  Rechercher un bien, une adresse, une ville…"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-orange-50/40"
          />
          <div className="flex gap-2 flex-wrap">
            {FILTRES.map((f) => (
              <button
                key={f}
                onClick={() => setFiltre(f)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  filtre === f
                    ? "bg-gradient-to-r from-orange-400 to-amber-400 text-white shadow-md shadow-orange-200"
                    : "bg-gray-100 text-gray-500 hover:bg-orange-50"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Tableau desktop */}
        <div className="hidden lg:block bg-white rounded-2xl shadow-sm border border-orange-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-100">
                {["Référence", "Bien", "Type", "Surface", "Pièces", "Loyer", "Charges", "DPE", "Statut", "Locataire", "Actions"].map((h) => (
                  <th key={h} className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {biensFiltres.map((b, i) => (
                <tr
                  key={b.id}
                  className={`border-b border-gray-50 hover:bg-orange-50/40 transition cursor-pointer ${i % 2 === 0 ? "bg-white" : "bg-amber-50/20"}`}
                  onClick={() => setBienSelectionne(b.id)}
                >
                  <td className="px-4 py-3.5 font-mono text-xs text-orange-500 font-semibold">{b.reference}</td>
                  <td className="px-4 py-3.5">
                    <div className="font-semibold text-gray-800">{b.nom}</div>
                    <div className="text-xs text-gray-400">{b.adresse}, {b.ville}</div>
                  </td>
                  <td className="px-4 py-3.5 text-gray-600 text-xs">{b.typeLocation}</td>
                  <td className="px-4 py-3.5 text-gray-700 font-medium">{b.surface} m²</td>
                  <td className="px-4 py-3.5 text-gray-700">{b.pieces}</td>
                  <td className="px-4 py-3.5 font-semibold text-gray-800">{formatEuros(b.loyer)}</td>
                  <td className="px-4 py-3.5 text-gray-500">{formatEuros(b.charges)}</td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-white text-xs font-bold ${DPE_STYLES[b.dpe] || "bg-gray-400"}`}>
                      {b.dpe}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUT_STYLES[b.statut]}`}>
                      {b.statut}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-gray-600 text-xs">
                    {b.locataire || <span className="text-gray-300 italic">—</span>}
                  </td>
                  <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                    <div className="flex gap-1.5">
                      <button onClick={() => setBienSelectionne(b.id)} className="px-2.5 py-1.5 bg-orange-50 text-orange-500 rounded-lg text-xs font-medium hover:bg-orange-100 transition">Voir</button>
                      <button className="px-2.5 py-1.5 bg-gray-50 text-gray-500 rounded-lg text-xs font-medium hover:bg-gray-100 transition">Modifier</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {biensFiltres.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <div className="text-5xl mb-3">🏠</div>
              <p className="font-medium">Aucun bien trouvé</p>
              <p className="text-sm mt-1">Modifiez votre recherche ou ajoutez un bien</p>
            </div>
          )}
        </div>

        {/* Cartes mobile */}
        <div className="lg:hidden space-y-3">
          {biensFiltres.map((b) => (
            <div
              key={b.id}
              onClick={() => setBienSelectionne(b.id)}
              className="bg-white rounded-2xl shadow-sm border border-orange-100 p-4 cursor-pointer hover:shadow-md transition"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="font-semibold text-gray-800">{b.nom}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{b.adresse}, {b.ville}</div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUT_STYLES[b.statut]}`}>{b.statut}</span>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-orange-50 rounded-xl py-2">
                  <div className="font-bold text-orange-500">{formatEuros(b.loyer)}</div>
                  <div className="text-xs text-gray-400">Loyer</div>
                </div>
                <div className="bg-amber-50 rounded-xl py-2">
                  <div className="font-bold text-amber-600">{b.surface} m²</div>
                  <div className="text-xs text-gray-400">Surface</div>
                </div>
                <div className="bg-yellow-50 rounded-xl py-2">
                  <div className="font-bold text-yellow-600">{b.pieces} P</div>
                  <div className="text-xs text-gray-400">Pièces</div>
                </div>
              </div>
              {b.locataire && (
                <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                  <span>👤</span> {b.locataire}
                </div>
              )}
            </div>
          ))}
        </div>

      </div>

          {/* Modal fiche détaillée */}
          {bienDetail && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-orange-400 to-amber-400 rounded-t-3xl p-6 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-xs font-semibold opacity-70 mb-1">{bienDetail.reference}</div>
                  <h2 className="text-2xl font-bold">{bienDetail.nom}</h2>
                  <p className="text-sm opacity-80 mt-1">📍 {bienDetail.adresse}, {bienDetail.codePostal} {bienDetail.ville}</p>
                </div>
                <button onClick={() => setBienSelectionne(null)} className="text-white/70 hover:text-white text-2xl font-light">✕</button>
              </div>
              <div className="flex gap-3 mt-4 flex-wrap">
                <span className="bg-white/20 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold">{bienDetail.typeLogement}</span>
                <span className="bg-white/20 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold">{bienDetail.typeLocation}</span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUT_STYLES[bienDetail.statut]}`}>{bienDetail.statut}</span>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {/* Chiffres clés */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Loyer HC",  value: formatEuros(bienDetail.loyer),    icon: "💶" },
                  { label: "Charges",   value: formatEuros(bienDetail.charges),  icon: "📊" },
                  { label: "Surface",   value: `${bienDetail.surface} m²`,       icon: "📐" },
                  { label: "Pièces",    value: bienDetail.pieces,                icon: "🚪" },
                ].map((item) => (
                  <div key={item.label} className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-3 text-center border border-orange-100">
                    <div className="text-xl mb-1">{item.icon}</div>
                    <div className="font-bold text-gray-800">{item.value}</div>
                    <div className="text-xs text-gray-500">{item.label}</div>
                  </div>
                ))}
              </div>

              {/* Locataire */}
              <div className="bg-gray-50 rounded-2xl p-4">
                <h3 className="font-semibold text-gray-700 mb-3">👤 Locataire actuel</h3>
                {bienDetail.locataire ? (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-amber-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {bienDetail.locataire.split(" ").map((n: string) => n[0]).join("")}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800">{bienDetail.locataire}</div>
                      <div className="text-xs text-gray-400">
                        Entrée le {new Date(bienDetail.dateEntree!).toLocaleDateString("fr-FR")}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic">Aucun locataire en cours</p>
                )}
              </div>

              {/* DPE */}
              <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl font-bold ${DPE_STYLES[bienDetail.dpe]}`}>
                  {bienDetail.dpe}
                </div>
                <div>
                  <div className="font-semibold text-gray-700">Diagnostic de Performance Énergétique</div>
                  <div className="text-xs text-gray-400 mt-0.5">Classe {bienDetail.dpe}</div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button className="flex-1 py-2.5 bg-gradient-to-r from-orange-400 to-amber-400 text-white rounded-xl font-semibold text-sm hover:from-orange-500 hover:to-amber-500 transition shadow-md shadow-orange-200">
                  ✏️ Modifier
                </button>
                <button className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl font-semibold text-sm hover:bg-gray-50 transition">
                  📄 Documents
                </button>
                <button className="py-2.5 px-4 border border-red-100 text-red-400 rounded-xl text-sm hover:bg-red-50 transition">
                  Archiver
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal formulaire ajout */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

            {/* Header modal */}
            <div className="bg-gradient-to-r from-orange-400 to-amber-400 rounded-t-3xl p-6 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold">✨ Ajouter un bien</h2>
                  <p className="text-sm opacity-80 mt-1">Étape {step} sur {ETAPES.length}</p>
                </div>
                <button onClick={() => setShowForm(false)} className="text-white/70 hover:text-white text-2xl font-light">✕</button>
              </div>
              {/* Stepper */}
              <div className="flex gap-2 mt-4">
                {ETAPES.map((e, i) => (
                  <div key={e} className="flex-1">
                    <div className={`h-1.5 rounded-full transition-all ${i < step ? "bg-white" : "bg-white/30"}`} />
                    <div className={`text-xs mt-1.5 font-medium transition-all ${i + 1 === step ? "opacity-100" : "opacity-50"}`}>
                      {i + 1 === step ? e : ""}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Corps du formulaire */}
            <div className="p-6 space-y-4">

              {/* ÉTAPE 1 - Infos générales */}
              {step === 1 && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nom du bien</label>
                    <input
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-orange-50/30"
                      placeholder="Ex : Appartement Voltaire"
                      value={form.nom}
                      onChange={(e) => setForm({...form, nom: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Adresse</label>
                    <input
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-orange-50/30"
                      placeholder="12 rue Voltaire"
                      value={form.adresse}
                      onChange={(e) => setForm({...form, adresse: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Code postal</label>
                      <input
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-orange-50/30"
                        placeholder="75011"
                        value={form.codePostal}
                        onChange={(e) => setForm({...form, codePostal: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Ville</label>
                      <input
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-orange-50/30"
                        placeholder="Paris"
                        value={form.ville}
                        onChange={(e) => setForm({...form, ville: e.target.value})}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* ÉTAPE 2 - Caractéristiques */}
              {step === 2 && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Type de location</label>
                      <select
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-orange-50/30"
                        value={form.typeLocation}
                        onChange={(e) => setForm({...form, typeLocation: e.target.value})}
                      >
                        {["Location nue", "Location meublée", "Bail mobilité", "Local professionnel", "Colocation"].map((t) => (
                          <option key={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Type de logement</label>
                      <select
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-orange-50/30"
                        value={form.typeLogement}
                        onChange={(e) => setForm({...form, typeLogement: e.target.value})}
                      >
                        {["Appartement", "Maison", "Studio", "Local professionnel", "Garage", "Parking"].map((t) => (
                          <option key={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Surface (m²)</label>
                      <input
                        type="number"
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-orange-50/30"
                        placeholder="45"
                        value={form.surface}
                        onChange={(e) => setForm({...form, surface: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Pièces</label>
                      <input
                        type="number"
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-orange-50/30"
                        placeholder="2"
                        value={form.pieces}
                        onChange={(e) => setForm({...form, pieces: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Étage</label>
                      <input
                        type="number"
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-orange-50/30"
                        placeholder="0"
                        value={form.etage}
                        onChange={(e) => setForm({...form, etage: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Options</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[
                        { key: "ascenseur", label: "🛗 Ascenseur" },
                        { key: "cave",      label: "🪣 Cave" },
                        { key: "parking",   label: "🚗 Parking" },
                        { key: "balcon",    label: "🌿 Balcon" },
                        { key: "terrasse",  label: "☀️ Terrasse" },
                        { key: "jardin",    label: "🌳 Jardin" },
                      ].map((opt) => (
                        <label
                          key={opt.key}
                          className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition text-sm font-medium ${
                            (form as any)[opt.key]
                              ? "border-orange-300 bg-orange-50 text-orange-700"
                              : "border-gray-200 text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          <input
                            type="checkbox"
                            className="hidden"
                            checked={(form as any)[opt.key]}
                            onChange={(e) => setForm({...form, [opt.key]: e.target.checked})}
                          />
                          {opt.label}
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}
{/* ÉTAPE 3 - Finances */}
{step === 3 && (
  <>
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Loyer HC (€)</label>
        <input
          type="number"
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-orange-50/30"
          placeholder="1200"
          value={form.loyer}
          onChange={(e) => setForm({...form, loyer: e.target.value})}
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Provisions sur charges (€)</label>
        <input
          type="number"
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-orange-50/30"
          placeholder="150"
          value={form.charges}
          onChange={(e) => setForm({...form, charges: e.target.value})}
        />
      </div>
    </div>

    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Type de charges</label>
      <select
        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-orange-50/30"
        value={form.typeCharges}
        onChange={(e) => setForm({...form, typeCharges: e.target.value})}
      >
        <option>Provision avec régularisation</option>
        <option>Forfaitaires</option>
      </select>
    </div>

    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Dépôt de garantie (€)</label>
        <input
          type="number"
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-orange-50/30"
          placeholder="2400"
          value={form.depotGarantie}
          onChange={(e) => setForm({...form, depotGarantie: e.target.value})}
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Date de révision annuelle</label>
        <input
          type="date"
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-orange-50/30"
          value={form.dateRevision}
          onChange={(e) => setForm({...form, dateRevision: e.target.value})}
        />
      </div>
    </div>
  </>
)}


{/* ÉTAPE 4 - Copropriété */}
{step === 4 && (
  <>
    {/* Tantièmes */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          Tantièmes du lot
        </label>
        <input
          type="number"
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-orange-50/30"
          placeholder="Ex : 245"
          value={form.tantièmes}
          onChange={(e) => setForm({ ...form, tantièmes: e.target.value })}
        />
        <p className="text-xs text-gray-400 mt-1">Quote-part de votre lot dans la copropriété</p>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          Tantièmes de l'immeuble
        </label>
        <select
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-orange-50/30"
          value={form.tantiemesImmeuble}
          onChange={(e) => setForm({ ...form, tantiemesImmeuble: e.target.value })}
        >
          <option value="">— Sélectionner —</option>
          <option value="100">100</option>
          <option value="1000">1 000</option>
          <option value="10000">10 000</option>
          <option value="100000">100 000</option>
        </select>
        <p className="text-xs text-gray-400 mt-1">Total des tantièmes de l'immeuble</p>
      </div>
    </div>

    {form.tantièmes && form.tantiemesImmeuble && (
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-2xl p-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-amber-400 rounded-xl flex items-center justify-center text-white text-lg flex-shrink-0">
          🏢
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-700">Quote-part calculée</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {Number(form.tantièmes).toLocaleString("fr-FR")} /{" "}
            {Number(form.tantiemesImmeuble).toLocaleString("fr-FR")} tantièmes
            <span className="ml-2 font-bold text-orange-600">
              ({((Number(form.tantièmes) / Number(form.tantiemesImmeuble)) * 100).toFixed(3)} %)
            </span>
          </p>
        </div>
      </div>
    )}

    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
        Surface privative (m²)
      </label>
      <input
        type="number"
        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-orange-50/30"
        placeholder="45"
        value={form.surfacePrivative}
        onChange={(e) => setForm({ ...form, surfacePrivative: e.target.value })}
      />
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nom du syndic</label>
        <input
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-orange-50/30"
          placeholder="Foncia, Nexity…"
          value={form.syndic}
          onChange={(e) => setForm({ ...form, syndic: e.target.value })}
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Coordonnées du syndic</label>
        <input
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-orange-50/30"
          placeholder="Téléphone ou email"
          value={form.coordSyndic}
          onChange={(e) => setForm({ ...form, coordSyndic: e.target.value })}
        />
      </div>
    </div>
  </>
)}

              {/* ÉTAPE 5 - Diagnostics */}
              {step === 5 && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Classe DPE</label>
                      <select
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-orange-50/30"
                        value={form.dpe}
                        onChange={(e) => setForm({...form, dpe: e.target.value})}
                      >
                        {["A","B","C","D","E","F","G"].map((c) => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Classe GES</label>
                      <select
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-orange-50/30"
                        value={form.ges}
                        onChange={(e) => setForm({...form, ges: e.target.value})}
                      >
                        {["A","B","C","D","E","F","G"].map((c) => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Date du DPE</label>
                      <input
                        type="date"
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-orange-50/30"
                        value={form.dateDpe}
                        onChange={(e) => setForm({...form, dateDpe: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Date de fin de validité</label>
                      <input
                        type="date"
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-orange-50/30"
                        value={form.dateFinDpe}
                        onChange={(e) => setForm({...form, dateFinDpe: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="border-2 border-dashed border-orange-200 rounded-2xl p-8 text-center bg-orange-50/30 cursor-pointer hover:bg-orange-50 transition">
                    <div className="text-3xl mb-2">📎</div>
                    <p className="text-sm font-medium text-gray-500">Joindre le document DPE (PDF)</p>
                    <p className="text-xs text-gray-400 mt-1">Glissez-déposez ou cliquez pour parcourir</p>
                  </div>
                </>
              )}
</div>

            {/* Footer */}
            <div className="flex justify-between px-6 pb-6 gap-3">
              <button
                onClick={() => step > 1 ? setStep(step - 1) : setShowForm(false)}
                className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition"
              >
                {step > 1 ? "← Précédent" : "Annuler"}
              </button>
              <button
                onClick={() => step < 5 ? setStep(step + 1) : handleSubmit()}
                className="px-6 py-2.5 bg-gradient-to-r from-orange-400 to-amber-400 hover:from-orange-500 hover:to-amber-500 text-white rounded-xl text-sm font-semibold shadow-md shadow-orange-200 transition"
              >
                {step < 5 ? "Suivant →" : "✅ Enregistrer le bien"}
              </button>
            </div>

          </div>
        </div>
      )}{/* fin showForm */}

    </div>
  );
}
