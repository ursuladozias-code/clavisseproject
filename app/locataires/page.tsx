"use client";
import { useState } from "react";

type Garant = {
  nom: string; prenom: string; dateNaissance: string; lieuNaissance: string;
  nationalite: string; adresse: string; email: string; telephone: string; profession: string;
};

type Locataire = {
  id: number;
  nom: string; prenom: string; dateNaissance: string; lieuNaissance: string; nationalite: string;
  adresseActuelle: string; email: string; telephone: string;
  profession: string; situationMatrimoniale: string;
  colocataires: { nom: string; prenom: string }[];
  hasGarant: boolean; garant: Garant;
  notation: "Parfait" | "Moyen" | "Mauvais" | null;
};

const situationsMatrimoniales = ["Célibataire","Marié(e)","Pacsé(e)","Divorcé(e)","Séparé(e)","Veuf/Veuve","En concubinage"];
const nationalites = ["Française","Belge","Suisse","Luxembourgeoise","Allemande","Espagnole","Italienne","Portugaise","Britannique","Autre"];

const notationConfig = {
  Parfait: { color: "bg-green-100 text-green-600", icon: "⭐" },
  Moyen: { color: "bg-orange-100 text-orange-500", icon: "⚠️" },
  Mauvais: { color: "bg-red-100 text-red-500", icon: "🔴" },
};

const defaultGarant: Garant = {
  nom: "", prenom: "", dateNaissance: "", lieuNaissance: "",
  nationalite: "", adresse: "", email: "", telephone: "", profession: "",
};

const defaultLocataire: Omit<Locataire, "id"> = {
  nom: "", prenom: "", dateNaissance: "", lieuNaissance: "", nationalite: "",
  adresseActuelle: "", email: "", telephone: "",
  profession: "", situationMatrimoniale: "",
  colocataires: [], hasGarant: false, garant: { ...defaultGarant }, notation: null,
};

const MOIS_LABELS = [
  "Janvier","Février","Mars","Avril","Mai","Juin",
  "Juillet","Août","Septembre","Octobre","Novembre","Décembre"
];

function Field({ label, value, onChange, placeholder, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string;
}) {
  return (
    <div>
      <label className="text-xs text-gray-400 font-semibold uppercase tracking-wide block mb-1">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-200 rounded-xl px-4 py-2 text-[#0F2A4A] focus:outline-none focus:ring-2 focus:ring-[#F4B942] text-sm"
      />
    </div>
  );
}

function SelectField({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: string[];
}) {
  return (
    <div>
      <label className="text-xs text-gray-400 font-semibold uppercase tracking-wide block mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-200 rounded-xl px-4 py-2 text-[#0F2A4A] focus:outline-none focus:ring-2 focus:ring-[#F4B942] text-sm bg-white"
      >
        <option value="">-- Sélectionner --</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function Section({ titre, children }: { titre: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="font-semibold text-[#0F2A4A] mb-3 text-sm">{titre}</h4>
      <div className="bg-[#F8F9FA] rounded-xl p-4 space-y-2">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-400">{label}</span>
      <span className="font-semibold text-[#0F2A4A] text-right max-w-[60%]">{value || "—"}</span>
    </div>
  );
}

export default function LocatairesPage() {
  const [locataires, setLocataires] = useState<Locataire[]>([
    {
      id: 1, nom: "Dupont", prenom: "Jean",
      dateNaissance: "1990-05-14", lieuNaissance: "Paris", nationalite: "Française",
      adresseActuelle: "12 rue des Fleurs, 75001 Paris",
      email: "jean.dupont@email.com", telephone: "06 12 34 56 78",
      profession: "Ingénieur", situationMatrimoniale: "Célibataire",
      colocataires: [], hasGarant: false, garant: { ...defaultGarant }, notation: "Parfait",
    },
    {
      id: 2, nom: "Dozias", prenom: "Ursula",
      dateNaissance: "1995-11-03", lieuNaissance: "Lyon", nationalite: "Française",
      adresseActuelle: "8 avenue Jean Jaurès, 69007 Lyon",
      email: "ursulamrsd@gmail.com", telephone: "0761522930",
      profession: "Étudiante", situationMatrimoniale: "Célibataire",
      colocataires: [], hasGarant: true, garant: { ...defaultGarant }, notation: "Moyen",
    },
  ]);

  const [recherche, setRecherche] = useState("");
  const [filtreNotation, setFiltreNotation] = useState<"Tous" | "Parfait" | "Moyen" | "Mauvais">("Tous");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [etape, setEtape] = useState(1);
  const [form, setForm] = useState<Omit<Locataire, "id">>({ ...defaultLocataire, garant: { ...defaultGarant } });
  const [viewingId, setViewingId] = useState<number | null>(null);
  const [ongletFiche, setOngletFiche] = useState<"infos" | "quittances">("infos");
  const [anneeOuverteQuittance, setAnneeOuverteQuittance] = useState<string | null>(null);
  const [moisOuvertQuittance, setMoisOuvertQuittance] = useState<string | null>(null);

  const locatairesFiltres = locataires.filter((l) => {
    const matchRecherche = `${l.nom} ${l.prenom} ${l.email} ${l.telephone}`.toLowerCase().includes(recherche.toLowerCase());
    const matchNotation = filtreNotation === "Tous" || l.notation === filtreNotation;
    return matchRecherche && matchNotation;
  });

  const ouvrirAjout = () => {
    setForm({ ...defaultLocataire, garant: { ...defaultGarant } });
    setEditingId(null);
    setEtape(1);
    setShowModal(true);
  };

  const ouvrirEdition = (l: Locataire) => {
    setForm({ ...l });
    setEditingId(l.id);
    setEtape(1);
    setShowModal(true);
  };

  const sauvegarder = () => {
    if (editingId !== null) {
      setLocataires((prev) => prev.map((l) => l.id === editingId ? { ...form, id: editingId } : l));
    } else {
      setLocataires((prev) => [...prev, { ...form, id: Date.now() }]);
    }
    setShowModal(false);
  };

  const supprimerLocataire = (id: number) => {
    setLocataires((prev) => prev.filter((l) => l.id !== id));
  };

  const updateForm = (field: keyof Omit<Locataire, "id">, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateGarant = (field: keyof Garant, value: string) => {
    setForm((prev) => ({ ...prev, garant: { ...prev.garant, [field]: value } }));
  };

  const canNext = () => {
    if (etape === 1) return !!form.nom && !!form.prenom;
    return true;
  };

  const viewingLocataire = locataires.find((l) => l.id === viewingId);

  const stats = [
    { label: "Total locataires", value: locataires.length, color: "from-orange-400 to-amber-400 shadow-orange-200", icon: "👤" },
    { label: "Parfait", value: locataires.filter((l) => l.notation === "Parfait").length, color: "from-emerald-400 to-teal-400 shadow-emerald-200", icon: "⭐" },
    { label: "Moyen", value: locataires.filter((l) => l.notation === "Moyen").length, color: "from-yellow-400 to-orange-400 shadow-yellow-200", icon: "⚠️" },
    { label: "Mauvais", value: locataires.filter((l) => l.notation === "Mauvais").length, color: "from-rose-400 to-pink-400 shadow-rose-200", icon: "🔴" },
  ];

  const etapes = ["Identité", "Coordonnées", "Situation", "Colocataires", "Garant", "Notation", "Récap"];

  return (
    <div className="min-h-screen bg-[#FDFAF5] p-4 md:p-8">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#0F2A4A]">Locataires</h1>
          <p className="text-gray-400 text-sm mt-1">{locataires.length} locataire(s) enregistré(s)</p>
        </div>
        <button
          onClick={ouvrirAjout}
          className="bg-[#F4B942] hover:bg-[#E6A82F] text-white font-semibold px-5 py-2.5 rounded-xl shadow transition text-sm w-full sm:w-auto"
        >
          + Ajouter un locataire
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((s) => (
          <div key={s.label} className={`bg-gradient-to-br ${s.color} rounded-2xl p-5 text-white shadow-lg`}>
            <div className="text-3xl mb-2">{s.icon}</div>
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="text-xs font-semibold mt-1 opacity-90">{s.label}</div>
          </div>
        ))}
      </div>

      {/* RECHERCHE + FILTRES */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="🔍 Rechercher par nom, email, téléphone..."
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#F4B942]"
        />
        <div className="flex gap-2 flex-wrap">
          {(["Tous", "Parfait", "Moyen", "Mauvais"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFiltreNotation(f)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                filtreNotation === f ? "bg-[#F4B942] text-white" : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* TABLEAU desktop */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {locatairesFiltres.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-5xl mb-4">👤</div>
            <p className="text-gray-400 text-lg">Aucun locataire trouvé</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-6 py-4">Locataire</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-4">Email</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-4">Téléphone</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-4">Profession</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-4">Notation</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-4">Infos</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {locatairesFiltres.map((l, idx) => (
                <tr
                  key={l.id}
                  className={`border-b border-gray-50 hover:bg-[#FDFAF5] transition cursor-pointer ${idx % 2 !== 0 ? "bg-gray-50/30" : ""}`}
                  onClick={() => setViewingId(l.id)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#0F2A4A] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {l.prenom[0]}{l.nom[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-[#0F2A4A] text-sm">{l.prenom} {l.nom}</p>
                        <p className="text-xs text-gray-400">{l.situationMatrimoniale || "—"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600">{l.email}</td>
                  <td className="px-4 py-4 text-sm text-gray-600">{l.telephone}</td>
                  <td className="px-4 py-4 text-sm text-gray-600">{l.profession || "—"}</td>
                  <td className="px-4 py-4">
                    {l.notation ? (
                      <span className={`text-xs px-3 py-1 rounded-full font-semibold ${notationConfig[l.notation].color}`}>
                        {notationConfig[l.notation].icon} {l.notation}
                      </span>
                    ) : <span className="text-xs text-gray-300">—</span>}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex gap-1 flex-wrap">
                      {l.hasGarant && <span className="text-xs bg-blue-50 text-blue-500 px-2 py-1 rounded-full font-semibold">🛡 Garant</span>}
                      {l.colocataires.length > 0 && <span className="text-xs bg-purple-50 text-purple-500 px-2 py-1 rounded-full font-semibold">👥 {l.colocataires.length}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => setViewingId(l.id)} className="text-xs text-[#F4B942] font-semibold hover:underline">Voir</button>
                      <button onClick={() => ouvrirEdition(l)} className="text-xs text-gray-500 font-semibold hover:underline">Modifier</button>
                      <button onClick={() => supprimerLocataire(l.id)} className="text-xs text-red-400 font-semibold hover:underline">🗑</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* CARTES mobile */}
      <div className="md:hidden space-y-3">
        {locatairesFiltres.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl">
            <div className="text-5xl mb-4">👤</div>
            <p className="text-gray-400">Aucun locataire trouvé</p>
          </div>
        ) : (
          locatairesFiltres.map((l) => (
            <div
              key={l.id}
              onClick={() => setViewingId(l.id)}
              className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#0F2A4A] flex items-center justify-center text-white font-bold text-sm">
                    {l.prenom[0]}{l.nom[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-[#0F2A4A]">{l.prenom} {l.nom}</p>
                    <p className="text-xs text-gray-400">{l.profession || "—"}</p>
                  </div>
                </div>
                {l.notation && (
                  <span className={`text-xs px-2 py-1 rounded-full font-semibold ${notationConfig[l.notation].color}`}>
                    {notationConfig[l.notation].icon} {l.notation}
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-500 space-y-1 mb-3">
                <p>📧 {l.email}</p>
                <p>📞 {l.telephone}</p>
              </div>
              <div className="flex gap-2 justify-end" onClick={(e) => e.stopPropagation()}>
                <button onClick={() => ouvrirEdition(l)} className="text-xs text-gray-500 font-semibold border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50">Modifier</button>
                <button onClick={() => supprimerLocataire(l.id)} className="text-xs text-red-400 font-semibold border border-red-100 px-3 py-1.5 rounded-lg hover:bg-red-50">🗑 Suppr.</button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL FICHE LOCATAIRE */}
      {viewingLocataire && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#0F2A4A] flex items-center justify-center text-white font-bold">
                    {viewingLocataire.prenom[0]}{viewingLocataire.nom[0]}
                  </div>
                  <div>
                    <h2 className="font-bold text-[#0F2A4A]">{viewingLocataire.prenom} {viewingLocataire.nom}</h2>
                    {viewingLocataire.notation && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${notationConfig[viewingLocataire.notation].color}`}>
                        {notationConfig[viewingLocataire.notation].icon} {viewingLocataire.notation}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => { ouvrirEdition(viewingLocataire); setViewingId(null); }} className="text-xs bg-[#F4B942] text-white px-3 py-1.5 rounded-lg font-semibold">Modifier</button>
                  <button onClick={() => setViewingId(null)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                {(["infos", "quittances"] as const).map((o) => (
                  <button
                    key={o}
                    onClick={() => setOngletFiche(o)}
                    className={`text-sm px-4 py-1.5 rounded-lg font-semibold transition ${ongletFiche === o ? "bg-[#0F2A4A] text-white" : "text-gray-400 hover:bg-gray-100"}`}
                  >
                    {o === "infos" ? "Informations" : "Quittances"}
                  </button>
                ))}
              </div>
            </div>

            {ongletFiche === "infos" && (
              <div className="p-6 space-y-4">
                <Section titre="Identité">
                  <Row label="Nom complet" value={`${viewingLocataire.prenom} ${viewingLocataire.nom}`} />
                  <Row label="Date de naissance" value={viewingLocataire.dateNaissance} />
                  <Row label="Lieu de naissance" value={viewingLocataire.lieuNaissance} />
                  <Row label="Nationalité" value={viewingLocataire.nationalite} />
                </Section>
                <Section titre="Coordonnées">
                  <Row label="Email" value={viewingLocataire.email} />
                  <Row label="Téléphone" value={viewingLocataire.telephone} />
                  <Row label="Adresse" value={viewingLocataire.adresseActuelle} />
                </Section>
                <Section titre="Situation">
                  <Row label="Profession" value={viewingLocataire.profession} />
                  <Row label="Situation matrimoniale" value={viewingLocataire.situationMatrimoniale} />
                </Section>
                {viewingLocataire.colocataires.length > 0 && (
                  <Section titre="Colocataires">
                    {viewingLocataire.colocataires.map((c, i) => (
                      <Row key={i} label={`Colocataire ${i + 1}`} value={`${c.prenom} ${c.nom}`} />
                    ))}
                  </Section>
                )}
                {viewingLocataire.hasGarant && (
                  <Section titre="Garant">
                    <Row label="Nom complet" value={`${viewingLocataire.garant.prenom} ${viewingLocataire.garant.nom}`} />
                    <Row label="Email" value={viewingLocataire.garant.email} />
                    <Row label="Téléphone" value={viewingLocataire.garant.telephone} />
                    <Row label="Profession" value={viewingLocataire.garant.profession} />
                  </Section>
                )}
              </div>
            )}

            {ongletFiche === "quittances" && (
              <div className="p-6 space-y-3">
                {(() => {
                  const quittancesDuLocataire = [
                    { mois: 0, annee: 2025, loyer: 800, charges: 100, statut: "Payé" },
                    { mois: 1, annee: 2025, loyer: 800, charges: 100, statut: "Payé" },
                    { mois: 2, annee: 2025, loyer: 800, charges: 100, statut: "En attente" },
                  ];

                  const annees = [...new Set(quittancesDuLocataire.map((q) => q.annee))].sort((a, b) => b - a);

                  if (annees.length === 0) {
                    return (
                      <div className="text-center py-12 text-gray-400">
                        <p className="text-4xl mb-3">🧾</p>
                        <p className="text-sm">Aucune quittance disponible</p>
                      </div>
                    );
                  }

                  return annees.map((annee) => {
                    const anneeStr = String(annee);
                    const quittancesAnnee = quittancesDuLocataire.filter((q) => q.annee === annee);
                    const isAnneeOpen = anneeOuverteQuittance === anneeStr;

                    return (
                      <div key={annee} className="border border-gray-200 rounded-xl overflow-hidden">
                        <button
                          onClick={() => setAnneeOuverteQuittance(isAnneeOpen ? null : anneeStr)}
                          className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition"
                        >
                          <span className="font-bold text-[#0F2A4A]">{annee}</span>
                          <span className="text-gray-400 text-sm">{isAnneeOpen ? "▲" : "▼"}</span>
                        </button>

                        {isAnneeOpen && (
                          <div className="divide-y divide-gray-100">
                            {quittancesAnnee.map((q) => {
                              const moisStr = `${annee}-${q.mois}`;
                              const isMoisOpen = moisOuvertQuittance === moisStr;

                              return (
                                <div key={q.mois}>
                                  <button
                                    onClick={() => setMoisOuvertQuittance(isMoisOpen ? null : moisStr)}
                                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition"
                                  >
                                    <span className="text-sm font-semibold text-[#0F2A4A]">{MOIS_LABELS[q.mois]}</span>
                                    <div className="flex items-center gap-3">
                                      <span className={`text-xs px-2 py-1 rounded-full font-semibold ${q.statut === "Payé" ? "bg-green-100 text-green-600" : "bg-orange-100 text-orange-500"}`}>
                                        {q.statut}
                                      </span>
                                      <span className="text-xs text-gray-400">{isMoisOpen ? "▲" : "▼"}</span>
                                    </div>
                                  </button>

                                  {isMoisOpen && (
                                    <div className="px-4 pb-4 space-y-2 bg-gray-50">
                                      <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Loyer</span>
                                        <span className="font-semibold text-[#0F2A4A]">{q.loyer} €</span>
                                      </div>
                                      <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Charges</span>
                                        <span className="font-semibold text-[#0F2A4A]">{q.charges} €</span>
                                      </div>
                                      <div className="flex justify-between text-sm font-bold border-t border-gray-200 pt-2">
                                        <span className="text-[#0F2A4A]">Total</span>
                                        <span className="text-[#0F2A4A]">{q.loyer + q.charges} €</span>
                                      </div>
                                      <button className="w-full mt-2 bg-[#F4B942] hover:bg-[#E6A82F] text-white text-xs font-semibold py-2 rounded-xl transition">
                                        📄 Télécharger la quittance
                                      </button>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  });
                })()}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL AJOUT / EDITION */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 rounded-t-2xl">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold text-[#0F2A4A] text-lg">
                  {editingId ? "Modifier le locataire" : "Ajouter un locataire"}
                </h2>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
              </div>
              <div className="flex items-center gap-1 overflow-x-auto pb-1">
                {etapes.map((e, i) => (
                  <div key={e} className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => i + 1 < etape && setEtape(i + 1)}
                      className={`text-xs px-2 py-1 rounded-lg font-semibold transition ${
                        etape === i + 1 ? "bg-[#F4B942] text-white" :
                        etape > i + 1 ? "bg-green-100 text-green-600" :
                        "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {etape > i + 1 ? "✓" : i + 1} {e}
                    </button>
                    {i < etapes.length - 1 && <span className="text-gray-300 text-xs">›</span>}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 space-y-4">
              {etape === 1 && (
                <div className="space-y-4">
                  <h3 className="font-bold text-[#0F2A4A]">Informations personnelles</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field label="Prénom *" value={form.prenom} onChange={(v) => updateForm("prenom", v)} placeholder="Jean" />
                    <Field label="Nom *" value={form.nom} onChange={(v) => updateForm("nom", v)} placeholder="Dupont" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field label="Date de naissance" type="date" value={form.dateNaissance} onChange={(v) => updateForm("dateNaissance", v)} />
                    <Field label="Lieu de naissance" value={form.lieuNaissance} onChange={(v) => updateForm("lieuNaissance", v)} placeholder="Paris" />
                  </div>
                  <SelectField label="Nationalité" value={form.nationalite} onChange={(v) => updateForm("nationalite", v)} options={nationalites} />
                </div>
              )}

              {etape === 2 && (
                <div className="space-y-4">
                  <h3 className="font-bold text-[#0F2A4A]">Coordonnées</h3>
                  <Field label="Email *" type="email" value={form.email} onChange={(v) => updateForm("email", v)} placeholder="jean@email.com" />
                  <Field label="Téléphone" value={form.telephone} onChange={(v) => updateForm("telephone", v)} placeholder="06 12 34 56 78" />
                  <Field label="Adresse actuelle" value={form.adresseActuelle} onChange={(v) => updateForm("adresseActuelle", v)} placeholder="12 rue des Fleurs, 75001 Paris" />
                </div>
              )}

              {etape === 3 && (
                <div className="space-y-4">
                  <h3 className="font-bold text-[#0F2A4A]">Situation</h3>
                  <Field label="Profession" value={form.profession} onChange={(v) => updateForm("profession", v)} placeholder="Ingénieur" />
                  <SelectField label="Situation matrimoniale" value={form.situationMatrimoniale} onChange={(v) => updateForm("situationMatrimoniale", v)} options={situationsMatrimoniales} />
                </div>
              )}

              {etape === 4 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-[#0F2A4A]">Colocataires</h3>
                    <button
                      onClick={() => updateForm("colocataires", [...form.colocataires, { nom: "", prenom: "" }])}
                      className="text-sm bg-[#F4B942] text-white px-3 py-1.5 rounded-xl font-semibold hover:bg-[#E6A82F] transition"
                    >
                      + Ajouter
                    </button>
                  </div>
                  {form.colocataires.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-xl">
                      <p className="text-3xl mb-2">👥</p>
                      <p className="text-sm">Aucun colocataire</p>
                    </div>
                  ) : (
                    form.colocataires.map((c, i) => (
                      <div key={i} className="bg-gray-50 rounded-xl p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-[#0F2A4A]">Colocataire {i + 1}</span>
                          <button
                            onClick={() => updateForm("colocataires", form.colocataires.filter((_, j) => j !== i))}
                            className="text-red-400 hover:text-red-600 text-xs"
                          >🗑 Supprimer</button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <Field label="Prénom" value={c.prenom} onChange={(v) => {
                            const updated = [...form.colocataires];
                            updated[i] = { ...updated[i], prenom: v };
                            updateForm("colocataires", updated);
                          }} />
                          <Field label="Nom" value={c.nom} onChange={(v) => {
                            const updated = [...form.colocataires];
                            updated[i] = { ...updated[i], nom: v };
                            updateForm("colocataires", updated);
                          }} />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {etape === 5 && (
                <div className="space-y-4">
                  <h3 className="font-bold text-[#0F2A4A]">Garant</h3>
                  <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-xl hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={form.hasGarant}
                      onChange={(e) => updateForm("hasGarant", e.target.checked)}
                      className="w-4 h-4 accent-[#F4B942]"
                    />
                    <span className="text-sm font-semibold text-[#0F2A4A]">Ce locataire a un garant</span>
                  </label>
                  {form.hasGarant && (
                    <div className="space-y-3 bg-blue-50 rounded-xl p-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Field label="Prénom" value={form.garant.prenom} onChange={(v) => updateGarant("prenom", v)} />
                        <Field label="Nom" value={form.garant.nom} onChange={(v) => updateGarant("nom", v)} />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Field label="Date de naissance" type="date" value={form.garant.dateNaissance} onChange={(v) => updateGarant("dateNaissance", v)} />
                        <Field label="Lieu de naissance" value={form.garant.lieuNaissance} onChange={(v) => updateGarant("lieuNaissance", v)} />
                      </div>
                      <SelectField label="Nationalité" value={form.garant.nationalite} onChange={(v) => updateGarant("nationalite", v)} options={nationalites} />
                      <Field label="Adresse" value={form.garant.adresse} onChange={(v) => updateGarant("adresse", v)} />
                      <Field label="Email" type="email" value={form.garant.email} onChange={(v) => updateGarant("email", v)} />
                      <Field label="Téléphone" value={form.garant.telephone} onChange={(v) => updateGarant("telephone", v)} />
                      <Field label="Profession" value={form.garant.profession} onChange={(v) => updateGarant("profession", v)} />
                    </div>
                  )}
                </div>
              )}

              {etape === 6 && (
                <div className="space-y-4">
                  <h3 className="font-bold text-[#0F2A4A]">Notation du locataire</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {(["Parfait", "Moyen", "Mauvais"] as const).map((n) => (
                      <button
                        key={n}
                        onClick={() => updateForm("notation", form.notation === n ? null : n)}
                        className={`p-4 rounded-xl border-2 text-center transition ${
                          form.notation === n
                            ? `border-current ${notationConfig[n].color}`
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="text-2xl mb-1">{notationConfig[n].icon}</div>
                        <div className="font-semibold text-sm">{n}</div>
                      </button>
                    ))}
                  </div>
                  {form.notation && (
                    <div className={`p-3 rounded-xl text-sm font-semibold text-center ${notationConfig[form.notation].color}`}>
                      Notation sélectionnée : {notationConfig[form.notation].icon} {form.notation}
                    </div>
                  )}
                </div>
              )}

              {etape === 7 && (
                <div className="space-y-4">
                  <h3 className="font-bold text-[#0F2A4A]">Récapitulatif</h3>
                  <Section titre="Identité">
                    <Row label="Nom complet" value={`${form.prenom} ${form.nom}`} />
                    <Row label="Date de naissance" value={form.dateNaissance} />
                    <Row label="Lieu de naissance" value={form.lieuNaissance} />
                    <Row label="Nationalité" value={form.nationalite} />
                  </Section>
                  <Section titre="Coordonnées">
                    <Row label="Email" value={form.email} />
                    <Row label="Téléphone" value={form.telephone} />
                    <Row label="Adresse" value={form.adresseActuelle} />
                  </Section>
                  <Section titre="Situation">
                    <Row label="Profession" value={form.profession} />
                    <Row label="Situation matrimoniale" value={form.situationMatrimoniale} />
                  </Section>
                  <Section titre="Autres">
                    <Row label="Colocataires" value={form.colocataires.length > 0 ? `${form.colocataires.length} colocataire(s)` : "Aucun"} />
                    <Row label="Garant" value={form.hasGarant ? `${form.garant.prenom} ${form.garant.nom}` : "Non"} />
                    <Row label="Notation" value={form.notation || "Non définie"} />
                  </Section>
                </div>
              )}

              <div className="flex justify-between pt-4 border-t border-gray-100">
                {etape > 1 ? (
                  <button
                    onClick={() => setEtape(etape - 1)}
                    className="px-4 py-2 border border-gray-200 text-gray-500 rounded-xl hover:bg-gray-50 transition text-sm font-semibold"
                  >
                    ← Retour
                  </button>
                ) : <div />}
                {etape < etapes.length ? (
                  <button
                    onClick={() => canNext() && setEtape(etape + 1)}
                    disabled={!canNext()}
                    className="bg-[#F4B942] hover:bg-[#E6A82F] disabled:opacity-40 text-white px-6 py-2 rounded-xl font-semibold transition text-sm"
                  >
                    Suivant →
                  </button>
                ) : (
                  <button
                    onClick={sauvegarder}
                    className="bg-[#F4B942] hover:bg-[#E6A82F] text-white px-6 py-2 rounded-xl font-semibold transition text-sm"
                  >
                    ✓ {editingId ? "Enregistrer les modifications" : "Créer le locataire"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
