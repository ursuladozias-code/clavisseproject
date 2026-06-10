"use client";

import { useState } from "react";

type Onglet = "infos" | "securite" | "abonnement" | "facturation" | "compte";

const mockProfil = {
  nom: "Martin",
  prenom: "Jean",
  email: "jean.martin@email.com",
  telephone: "06 12 34 56 78",
  adresse: "3 rue des Lilas, 94300 Vincennes",
  dateInscription: "12 janvier 2023",
};

const mockAbonnement = {
  formule: "Premium",
  dateDebut: "12 janvier 2023",
  statut: "Actif",
  prochaineEcheance: "12 juin 2025",
  prix: "29,90 €/mois",
};

const mockFactures = [
  { id: "FAC-2025-05", date: "01/05/2025", montant: "29,90 €", statut: "Payée" },
  { id: "FAC-2025-04", date: "01/04/2025", montant: "29,90 €", statut: "Payée" },
  { id: "FAC-2025-03", date: "01/03/2025", montant: "29,90 €", statut: "Payée" },
  { id: "FAC-2025-02", date: "01/02/2025", montant: "29,90 €", statut: "Payée" },
  { id: "FAC-2025-01", date: "01/01/2025", montant: "29,90 €", statut: "Payée" },
  { id: "FAC-2024-12", date: "01/12/2024", montant: "29,90 €", statut: "Payée" },
];

const formules = [
  {
    id: "starter",
    nom: "Starter",
    prix: "9,90 €",
    couleur: "#10b981",
    bg: "#ecfdf5",
    border: "#6ee7b7",
    biens: "Jusqu'à 2 biens",
    fonctionnalites: ["Gestion des loyers", "Quittances PDF", "Support email"],
    actuel: false,
  },
  {
    id: "premium",
    nom: "Premium",
    prix: "29,90 €",
    couleur: "#f97316",
    bg: "#fff7ed",
    border: "#fdba74",
    biens: "Jusqu'à 10 biens",
    fonctionnalites: ["Tout Starter", "États des lieux", "Dépôt de garantie", "Déclaration fiscale", "Support prioritaire"],
    actuel: true,
  },
  {
    id: "expert",
    nom: "Expert",
    prix: "59,90 €",
    couleur: "#8b5cf6",
    bg: "#f5f3ff",
    border: "#c4b5fd",
    biens: "Biens illimités",
    fonctionnalites: ["Tout Premium", "Multi-utilisateurs", "API accès", "Comptable dédié", "Support 7j/7"],
    actuel: false,
  },
];

export default function ProfilPage() {
  const [ongletActif, setOngletActif] = useState<Onglet>("infos");
  const [profil, setProfil] = useState(mockProfil);
  const [formProfil, setFormProfil] = useState(mockProfil);
  const [profilSauvegarde, setProfilSauvegarde] = useState(false);

  const [ancienMdp, setAncienMdp] = useState("");
  const [nouveauMdp, setNouveauMdp] = useState("");
  const [confirmMdp, setConfirmMdp] = useState("");
  const [mdpSauvegarde, setMdpSauvegarde] = useState(false);
  const [erreurMdp, setErreurMdp] = useState("");

  const [showSupprimer, setShowSupprimer] = useState(false);
  const [confirmTexte, setConfirmTexte] = useState("");
  const [showResilier, setShowResilier] = useState(false);

  const onglets: { id: Onglet; label: string; emoji: string }[] = [
    { id: "infos", label: "Informations", emoji: "👤" },
    { id: "securite", label: "Sécurité", emoji: "🔒" },
    { id: "abonnement", label: "Abonnement", emoji: "⭐" },
    { id: "facturation", label: "Facturation", emoji: "🧾" },
    { id: "compte", label: "Mon compte", emoji: "⚙️" },
  ];

  const sauvegarderProfil = () => {
    setProfil(formProfil);
    setProfilSauvegarde(true);
    setTimeout(() => setProfilSauvegarde(false), 3000);
  };

  const changerMdp = () => {
    setErreurMdp("");
    if (!ancienMdp || !nouveauMdp || !confirmMdp) {
      setErreurMdp("Veuillez remplir tous les champs.");
      return;
    }
    if (nouveauMdp !== confirmMdp) {
      setErreurMdp("Les mots de passe ne correspondent pas.");
      return;
    }
    if (nouveauMdp.length < 8) {
      setErreurMdp("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    setMdpSauvegarde(true);
    setAncienMdp(""); setNouveauMdp(""); setConfirmMdp("");
    setTimeout(() => setMdpSauvegarde(false), 3000);
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8" style={{ backgroundColor: "#FDF6EC" }}>
      <div className="max-w-5xl mx-auto">

        {/* ── HEADER ── */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800">
            👤 Mon Profil
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Gérez vos informations personnelles, sécurité et abonnement
          </p>
        </div>

        {/* ── CARTE IDENTITÉ ── */}
        <div
          className="rounded-3xl p-5 sm:p-6 mb-6 text-white"
          style={{ background: "linear-gradient(135deg, #f97316 0%, #f59e0b 100%)" }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-3xl bg-white/20 backdrop-blur flex items-center justify-center text-2xl font-extrabold shrink-0">
              {profil.prenom[0]}{profil.nom[0]}
            </div>
            {/* Infos */}
            <div className="flex-1">
              <p className="text-xl font-extrabold">{profil.prenom} {profil.nom}</p>
              <p className="text-sm opacity-80 mt-0.5">{profil.email}</p>
              <p className="text-sm opacity-80">{profil.telephone}</p>
            </div>
            {/* Badge abonnement */}
            <div className="sm:text-right">
              <span className="inline-block px-4 py-2 rounded-2xl bg-white/20 text-sm font-extrabold backdrop-blur">
                ⭐ {mockAbonnement.formule}
              </span>
              <p className="text-xs opacity-60 mt-2">Membre depuis {profil.dateInscription}</p>
              <p className="text-xs opacity-60">Prochaine échéance : {mockAbonnement.prochaineEcheance}</p>
            </div>
          </div>
        </div>

        {/* ── ONGLETS ── */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6" style={{ scrollbarWidth: "none" }}>
          {onglets.map((o) => (
            <button
              key={o.id}
              onClick={() => setOngletActif(o.id)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-sm font-bold whitespace-nowrap transition-all"
              style={
                ongletActif === o.id
                  ? { background: "linear-gradient(135deg, #f97316, #f59e0b)", color: "white", boxShadow: "0 4px 14px rgba(249,115,22,0.35)" }
                  : { backgroundColor: "white", color: "#6b7280" }
              }
            >
              <span>{o.emoji}</span>
              <span className="hidden sm:inline">{o.label}</span>
            </button>
          ))}
        </div>

        {/* ── CONTENU ── */}
        <div className="bg-white rounded-3xl shadow-sm p-5 sm:p-8">

          {/* INFORMATIONS */}
          {ongletActif === "infos" && (
            <div>
              <h2 className="text-lg font-extrabold text-gray-800 mb-5">
                👤 Informations personnelles
              </h2>

              {profilSauvegarde && (
                <div className="mb-4 p-3 rounded-2xl text-sm font-bold flex items-center gap-2"
                  style={{ backgroundColor: "#ecfdf5", color: "#059669", border: "1px solid #6ee7b7" }}>
                  ✅ Profil mis à jour avec succès !
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: "Prénom", key: "prenom", type: "text" },
                  { label: "Nom", key: "nom", type: "text" },
                  { label: "Adresse e-mail", key: "email", type: "email" },
                  { label: "Téléphone", key: "telephone", type: "tel" },
                ].map((f) => (
                  <div key={f.key}>
                    <label className="block text-xs font-extrabold text-gray-400 uppercase tracking-wider mb-1.5">
                      {f.label}
                    </label>
                    <input
                      type={f.type}
                      value={formProfil[f.key as keyof typeof formProfil]}
                      onChange={(e) => setFormProfil({ ...formProfil, [f.key]: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl border text-sm font-semibold text-gray-700 transition focus:outline-none"
                      style={{ backgroundColor: "#FDF6EC", borderColor: "#e5e7eb" }}
                      onFocus={(e) => { e.target.style.borderColor = "#f97316"; e.target.style.boxShadow = "0 0 0 3px rgba(249,115,22,0.15)"; }}
                      onBlur={(e) => { e.target.style.borderColor = "#e5e7eb"; e.target.style.boxShadow = "none"; }}
                    />
                  </div>
                ))}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-extrabold text-gray-400 uppercase tracking-wider mb-1.5">
                    Adresse postale
                  </label>
                  <input
                    type="text"
                    value={formProfil.adresse}
                    onChange={(e) => setFormProfil({ ...formProfil, adresse: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border text-sm font-semibold text-gray-700 transition focus:outline-none"
                    style={{ backgroundColor: "#FDF6EC", borderColor: "#e5e7eb" }}
                    onFocus={(e) => { e.target.style.borderColor = "#f97316"; e.target.style.boxShadow = "0 0 0 3px rgba(249,115,22,0.15)"; }}
                    onBlur={(e) => { e.target.style.borderColor = "#e5e7eb"; e.target.style.boxShadow = "none"; }}
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={sauvegarderProfil}
                  className="px-6 py-3 rounded-2xl text-sm font-extrabold text-white transition-all"
                  style={{ background: "linear-gradient(135deg, #f97316, #f59e0b)", boxShadow: "0 4px 14px rgba(249,115,22,0.35)" }}
                >
                  💾 Enregistrer les modifications
                </button>
              </div>
            </div>
          )}

          {/* SÉCURITÉ */}
          {ongletActif === "securite" && (
            <div>
              <h2 className="text-lg font-extrabold text-gray-800 mb-5">🔒 Sécurité du compte</h2>

              {mdpSauvegarde && (
                <div className="mb-4 p-3 rounded-2xl text-sm font-bold flex items-center gap-2"
                  style={{ backgroundColor: "#ecfdf5", color: "#059669", border: "1px solid #6ee7b7" }}>
                  ✅ Mot de passe modifié avec succès !
                </div>
              )}
              {erreurMdp && (
                <div className="mb-4 p-3 rounded-2xl text-sm font-bold flex items-center gap-2"
                  style={{ backgroundColor: "#fef2f2", color: "#dc2626", border: "1px solid #fca5a5" }}>
                  ❌ {erreurMdp}
                </div>
              )}

              {/* Changer mot de passe */}
              <div className="p-5 rounded-3xl mb-5" style={{ backgroundColor: "#FDF6EC" }}>
                <h3 className="font-extrabold text-gray-700 mb-4">🔑 Modifier le mot de passe</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-extrabold text-gray-400 uppercase tracking-wider mb-1.5">
                      Mot de passe actuel
                    </label>
                    <input
                      type="password"
                      value={ancienMdp}
                      onChange={(e) => setAncienMdp(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 rounded-2xl border text-sm font-semibold text-gray-700 bg-white focus:outline-none transition"
                      style={{ borderColor: "#e5e7eb" }}
                      onFocus={(e) => { e.target.style.borderColor = "#f97316"; e.target.style.boxShadow = "0 0 0 3px rgba(249,115,22,0.15)"; }}
                      onBlur={(e) => { e.target.style.borderColor = "#e5e7eb"; e.target.style.boxShadow = "none"; }}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { label: "Nouveau mot de passe", val: nouveauMdp, set: setNouveauMdp },
                      { label: "Confirmer", val: confirmMdp, set: setConfirmMdp },
                    ].map((f, i) => (
                      <div key={i}>
                        <label className="block text-xs font-extrabold text-gray-400 uppercase tracking-wider mb-1.5">
                          {f.label}
                        </label>
                        <input
                          type="password"
                          value={f.val}
                          onChange={(e) => f.set(e.target.value)}
                          placeholder="••••••••"
                          className="w-full px-4 py-3 rounded-2xl border text-sm font-semibold text-gray-700 bg-white focus:outline-none transition"
                          style={{ borderColor: "#e5e7eb" }}
                          onFocus={(e) => { e.target.style.borderColor = "#f97316"; e.target.style.boxShadow = "0 0 0 3px rgba(249,115,22,0.15)"; }}
                          onBlur={(e) => { e.target.style.borderColor = "#e5e7eb"; e.target.style.boxShadow = "none"; }}
                        />
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400">Minimum 8 caractères requis.</p>
                  <button
                    onClick={changerMdp}
                    className="px-6 py-3 rounded-2xl text-sm font-extrabold text-white transition-all"
                    style={{ background: "linear-gradient(135deg, #f97316, #f59e0b)", boxShadow: "0 4px 14px rgba(249,115,22,0.35)" }}
                  >
                    🔑 Modifier le mot de passe
                  </button>
                </div>
              </div>

              {/* Sessions */}
              <div className="p-5 rounded-3xl mb-5" style={{ backgroundColor: "#FDF6EC" }}>
                <h3 className="font-extrabold text-gray-700 mb-3">📱 Sessions actives</h3>
                <div className="space-y-3">
                  {[
                    { device: "MacBook Pro", lieu: "Paris, France", date: "Maintenant", actif: true, icon: "💻" },
                    { device: "iPhone 15", lieu: "Paris, France", date: "il y a 2h", actif: false, icon: "📱" },
                  ].map((s, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-white rounded-2xl">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{s.icon}</span>
                        <div>
                          <p className="text-sm font-bold text-gray-700">{s.device}</p>
                          <p className="text-xs text-gray-400">{s.lieu} · {s.date}</p>
                        </div>
                      </div>
                      {s.actif ? (
                        <span className="text-xs font-extrabold px-3 py-1 rounded-full"
                          style={{ backgroundColor: "#ecfdf5", color: "#059669" }}>
                          Session actuelle
                        </span>
                      ) : (
                        <button className="text-xs font-extrabold" style={{ color: "#ef4444" }}>
                          Déconnecter
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Réinitialisation */}
              <div className="p-5 rounded-3xl" style={{ backgroundColor: "#fff7ed", border: "1px solid #fed7aa" }}>
                <h3 className="font-extrabold text-gray-700 mb-1">📧 Réinitialisation par e-mail</h3>
                <p className="text-sm text-gray-500 mb-3">
                  Recevoir un lien sur <strong>{profil.email}</strong>
                </p>
                <button className="px-5 py-2.5 rounded-2xl text-sm font-extrabold transition"
                  style={{ border: "2px solid #fdba74", color: "#f97316", backgroundColor: "white" }}>
                  Envoyer le lien de réinitialisation
                </button>
              </div>
            </div>
          )}

          {/* ABONNEMENT */}
          {ongletActif === "abonnement" && (
            <div>
              <h2 className="text-lg font-extrabold text-gray-800 mb-5">⭐ Mon abonnement</h2>

              {/* Carte abonnement actuel */}
              <div className="rounded-3xl p-5 sm:p-6 mb-6 text-white"
                style={{ background: "linear-gradient(135deg, #f97316 0%, #f59e0b 100%)" }}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold opacity-80">Formule actuelle</p>
                    <p className="text-3xl font-extrabold mt-1">{mockAbonnement.formule}</p>
                    <p className="text-lg font-extrabold opacity-90 mt-1">{mockAbonnement.prix}</p>
                  </div>
                  <div className="sm:text-right">
                    <span className="inline-block px-3 py-1.5 rounded-2xl text-sm font-extrabold"
                      style={{ backgroundColor: "rgba(255,255,255,0.2)" }}>
                      ✅ {mockAbonnement.statut}
                    </span>
                    <p className="text-xs opacity-70 mt-2">Depuis le {mockAbonnement.dateDebut}</p>
                    <p className="text-xs opacity-70 mt-0.5">Prochaine échéance : {mockAbonnement.prochaineEcheance}</p>
                  </div>
                </div>
              </div>

              {/* Formules */}
              <h3 className="font-extrabold text-gray-700 mb-4">Changer de formule</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                {formules.map((f) => (
                  <div key={f.id} className="p-5 rounded-3xl transition-all"
                    style={{
                      backgroundColor: f.bg,
                      border: `2px solid ${f.actuel ? f.border : "#f3f4f6"}`,
                    }}>
                    <p className="font-extrabold text-gray-800 text-lg">{f.nom}</p>
                    <p className="text-2xl font-extrabold mt-1" style={{ color: f.couleur }}>
                      {f.prix}<span className="text-sm font-bold text-gray-400">/mois</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-1 mb-3 font-semibold">{f.biens}</p>
                    <ul className="space-y-1.5 mb-4">
                      {f.fonctionnalites.map((fn, i) => (
                        <li key={i} className="text-xs text-gray-600 flex items-center gap-1.5 font-semibold">
                          <span style={{ color: f.couleur }}>✓</span> {fn}
                        </li>
                      ))}
                    </ul>
                    {f.actuel ? (
                      <p className="text-center text-xs font-extrabold" style={{ color: f.couleur }}>
                        ✅ Formule actuelle
                      </p>
                    ) : (
                      <button className="w-full py-2.5 rounded-2xl text-xs font-extrabold text-white transition-all"
                        style={{ background: `linear-gradient(135deg, ${f.couleur}, ${f.couleur}cc)` }}>
                        Choisir {f.nom}
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Résilier */}
              <div className="p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                style={{ backgroundColor: "#fef2f2", border: "1px solid #fca5a5" }}>
                <div>
                  <p className="text-sm font-extrabold" style={{ color: "#dc2626" }}>Résilier mon abonnement</p>
                  <p className="text-xs mt-0.5" style={{ color: "#f87171" }}>
                    Accès actif jusqu'au {mockAbonnement.prochaineEcheance}
                  </p>
                </div>
                <button onClick={() => setShowResilier(true)}
                  className="px-4 py-2 rounded-2xl text-sm font-extrabold transition whitespace-nowrap"
                  style={{ border: "2px solid #fca5a5", color: "#dc2626", backgroundColor: "white" }}>
                  Résilier
                </button>
              </div>
            </div>
          )}

          {/* FACTURATION */}
          {ongletActif === "facturation" && (
            <div>
              <h2 className="text-lg font-extrabold text-gray-800 mb-5">🧾 Facturation</h2>

              {/* Moyen de paiement */}
              <div className="p-5 rounded-3xl mb-6" style={{ backgroundColor: "#FDF6EC" }}>
                <h3 className="font-extrabold text-gray-700 mb-3">💳 Moyen de paiement</h3>
                <div className="flex items-center justify-between bg-white p-4 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-8 rounded-xl flex items-center justify-center text-white text-xs font-extrabold"
                      style={{ background: "linear-gradient(135deg, #1d4ed8, #3b82f6)" }}>
                      VISA
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-700">•••• •••• •••• 4242</p>
                      <p className="text-xs text-gray-400">Expire 12/27</p>
                    </div>
                  </div>
                  <button className="text-sm font-extrabold" style={{ color: "#f97316" }}>
                    Modifier
                  </button>
                </div>
              </div>

              {/* Tableau */}
              <h3 className="font-extrabold text-gray-700 mb-3">📋 Historique des paiements</h3>
              <div className="rounded-3xl overflow-hidden" style={{ border: "1px solid #f3f4f6" }}>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ backgroundColor: "#FDF6EC" }}>
                        {["Référence", "Date", "Montant", "Statut", "PDF"].map((h) => (
                          <th key={h} className="text-left text-xs font-extrabold text-gray-400 uppercase tracking-wider px-4 py-3">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {mockFactures.map((f, i) => (
                        <tr key={f.id}
                          className="transition-colors hover:bg-orange-50/50"
                          style={{ borderTop: i > 0 ? "1px solid #f9fafb" : undefined }}>
                          <td className="px-4 py-3 font-extrabold" style={{ color: "#f97316" }}>{f.id}</td>
                          <td className="px-4 py-3 text-gray-500 font-semibold">{f.date}</td>
                          <td className="px-4 py-3 font-extrabold text-gray-800">{f.montant}</td>
                          <td className="px-4 py-3">
                            <span className="px-2.5 py-1 rounded-full text-xs font-extrabold"
                              style={{ backgroundColor: "#ecfdf5", color: "#059669" }}>
                              {f.statut}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <button className="text-xs font-extrabold flex items-center gap-1 transition"
                              style={{ color: "#f97316" }}>
                              ⬇️ Télécharger
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* MON COMPTE */}
          {ongletActif === "compte" && (
            <div>
              <h2 className="text-lg font-extrabold text-gray-800 mb-5">⚙️ Gestion du compte</h2>

              <div className="space-y-4">
                {/* Suspendre */}
                <div className="p-5 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  style={{ backgroundColor: "#fffbeb", border: "1px solid #fde68a" }}>
                  <div>
                    <h3 className="font-extrabold" style={{ color: "#b45309" }}>⏸️ Suspendre mon compte</h3>
                    <p className="text-sm mt-1" style={{ color: "#d97706" }}>
                      Désactivation temporaire. Vos données sont conservées.
                    </p>
                  </div>
                  <button className="px-5 py-2.5 rounded-2xl text-sm font-extrabold whitespace-nowrap transition"
                    style={{ border: "2px solid #fcd34d", color: "#b45309", backgroundColor: "white" }}>
                    Suspendre
                  </button>
                </div>

                {/* Exporter */}
                <div className="p-5 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  style={{ backgroundColor: "#eff6ff", border: "1px solid #bfdbfe" }}>
                  <div>
                    <h3 className="font-extrabold" style={{ color: "#1d4ed8" }}>📦 Exporter mes données</h3>
                    <p className="text-sm mt-1" style={{ color: "#3b82f6" }}>
                      Téléchargez toutes vos données au format ZIP.
                    </p>
                  </div>
                  <button className="px-5 py-2.5 rounded-2xl text-sm font-extrabold whitespace-nowrap transition"
                    style={{ border: "2px solid #93c5fd", color: "#1d4ed8", backgroundColor: "white" }}>
                    Exporter
                  </button>
                </div>

                {/* Supprimer */}
                <div className="p-5 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  style={{ backgroundColor: "#fef2f2", border: "1px solid #fca5a5" }}>
                  <div>
                    <h3 className="font-extrabold" style={{ color: "#dc2626" }}>🗑️ Supprimer mon compte</h3>
                    <p className="text-sm mt-1" style={{ color: "#ef4444" }}>
                      Action irréversible. Toutes vos données seront définitivement supprimées.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowSupprimer(true)}
                    className="px-5 py-2.5 rounded-2xl text-sm font-extrabold text-white whitespace-nowrap transition shadow-md"
                    style={{ background: "linear-gradient(135deg, #ef4444, #dc2626)" }}>
                    Supprimer le compte
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ── MODAL SUPPRESSION ── */}
      {showSupprimer && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}>
          <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 w-full max-w-md">
            <div className="text-center mb-6">
              <div className="text-5xl mb-3">⚠️</div>
              <h3 className="text-xl font-extrabold text-gray-800">
                Supprimer définitivement ?
              </h3>
              <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                Cette action est <strong>irréversible</strong>. Tous vos biens, locataires, contrats et documents seront supprimés.
              </p>
            </div>
            <div className="mb-5">
              <label className="block text-xs font-extrabold text-gray-400 uppercase tracking-wider mb-2">
                Tapez <span style={{ color: "#dc2626" }}>SUPPRIMER</span> pour confirmer
              </label>
              <input
                type="text"
                value={confirmTexte}
                onChange={(e) => setConfirmTexte(e.target.value)}
                placeholder="SUPPRIMER"
                className="w-full px-4 py-3 rounded-2xl border-2 text-sm font-bold text-gray-700 focus:outline-none"
                style={{ backgroundColor: "#fef2f2", borderColor: "#fca5a5" }}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowSupprimer(false); setConfirmTexte(""); }}
                className="flex-1 py-3 rounded-2xl text-sm font-extrabold border-2 transition"
                style={{ borderColor: "#e5e7eb", color: "#6b7280" }}>
                Annuler
              </button>
              <button
                disabled={confirmTexte !== "SUPPRIMER"}
                className="flex-1 py-3 rounded-2xl text-sm font-extrabold text-white transition shadow-md disabled:opacity-40"
                style={{ background: "linear-gradient(135deg, #ef4444, #dc2626)" }}>
                Supprimer définitivement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL RÉSILIER ── */}
      {showResilier && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}>
          <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 w-full max-w-md">
            <div className="text-center mb-6">
              <div className="text-5xl mb-3">📋</div>
              <h3 className="text-xl font-extrabold text-gray-800">Résilier l'abonnement ?</h3>
              <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                Votre accès <strong>Premium</strong> restera actif jusqu'au <strong>{mockAbonnement.prochaineEcheance}</strong>. Aucun remboursement ne sera effectué.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResilier(false)}
                className="flex-1 py-3 rounded-2xl text-sm font-extrabold border-2 transition"
                style={{ borderColor: "#e5e7eb", color: "#6b7280" }}>
                Annuler
              </button>
              <button
                onClick={() => setShowResilier(false)}
                className="flex-1 py-3 rounded-2xl text-sm font-extrabold text-white shadow-md transition"
                style={{ background: "linear-gradient(135deg, #ef4444, #dc2626)" }}>
                Confirmer la résiliation
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
