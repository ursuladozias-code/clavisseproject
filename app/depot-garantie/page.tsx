"use client";
import { useState } from "react";

type Locataire = {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  statut?: "Actif" | "En préavis" | "Sorti";
  scoring?: "Excellent" | "Moyen" | "Médiocre";
};

type Bien = {
  id: number;
  nom: string;
  adresse: string;
  ville: string;
  codePostal: string;
  pieces: number;
  loyer: number;
  charges: number;
  type: string;
  locataire: string | null;
  dateSortieLocataire: string | null;
};

type Bail = {
  id: number;
  locataireId: number;
  bienId: number;
  typeBail: string;
  dateSignature: string;
  dateEntree: string;
  dateSortie?: string;
  loyer: number;
  charges: number;
  depotGarantie: number;
  periodicite: string;
  typeIndice: "IRL" | "ILC" | "ILAT";
  trimestreReference: "1T" | "2T" | "3T" | "4T";
  indiceReference: number;
  anneeReference: string;
  observations?: string;
  statut: "Actif" | "Terminé";
};

type Retenue = { description: string; montant: number };

type Restitution = {
  dateSortie: string;
  montantRestitue: number;
  montantRetenu: number;
  retenues: Retenue[];
  dateRestitution: string;
  type: "complete" | "partielle";
};

type RevisionLoyer = {
  date: string;
  indiceReference: string;
  ancienIndice: string | null;
  nouvelIndice: string | null;
  ancienLoyer: number | null;
  nouveauLoyer: number;
  estLigneInitiale: boolean;
};

type Contrat = {
  id: number;
  locataire: Locataire;
  bien: Bien;
  bail: Bail;
  statut: "Actif" | "Terminé";
  restitution?: Restitution;
  revisionsLoyer: RevisionLoyer[];
};

const locatairesDisponibles: Locataire[] = [
  { id: 1, nom: "Dupont", prenom: "Jean", email: "jean.dupont@email.com", telephone: "06 12 34 56 78", statut: "Actif", scoring: "Excellent" },
  { id: 2, nom: "Dozias", prenom: "Ursula", email: "ursulamrsd@gmail.com", telephone: "0761522930", statut: "En préavis", scoring: "Moyen" },
];

const biensDisponibles: Bien[] = [
  { id: 1, nom: "Appartement Paris 11e", adresse: "15 rue de la Roquette", ville: "Paris", codePostal: "75011", pieces: 3, loyer: 1200, charges: 150, type: "Appartement", locataire: null, dateSortieLocataire: null },
  { id: 2, nom: "Studio Lyon Centre", adresse: "8 place Bellecour", ville: "Lyon", codePostal: "69002", pieces: 1, loyer: 750, charges: 80, type: "Studio", locataire: null, dateSortieLocataire: null },
];

const bauxDisponibles: Bail[] = [
  {
    id: 1, locataireId: 1, bienId: 1,
    typeBail: "Bail d'habitation (loi 89)",
    dateSignature: "2024-01-01", dateEntree: "2024-02-01",
    loyer: 1200, charges: 150, depotGarantie: 2400,
    periodicite: "Mensuelle", typeIndice: "IRL",
    trimestreReference: "4T", indiceReference: 143.97,
    anneeReference: "2025", statut: "Actif",
  },
  {
    id: 2, locataireId: 2, bienId: 2,
    typeBail: "Bail meublé",
    dateSignature: "2023-06-01", dateEntree: "2023-07-01",
    loyer: 750, charges: 80, depotGarantie: 750,
    periodicite: "Mensuelle", typeIndice: "IRL",
    trimestreReference: "3T", indiceReference: 141.41,
    anneeReference: "2025", statut: "Actif",
  },
];

function HistoriqueRevisions({ contrat }: { contrat: Contrat }) {
  return (
    <div className="mt-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">
        📈 Historique des révisions de loyer
      </h3>
      <div className="overflow-x-auto rounded-xl border border-gray-100">
        <table className="w-full text-xs text-left">
          <thead className="bg-gray-50 text-gray-500 uppercase text-[11px]">
            <tr>
              <th className="px-3 py-2">Date d'indexation</th>
              <th className="px-3 py-2">Indice de référence</th>
              <th className="px-3 py-2">Ancien indice</th>
              <th className="px-3 py-2">Nouvel indice</th>
              <th className="px-3 py-2">Ancien loyer</th>
              <th className="px-3 py-2">Nouveau loyer</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {contrat.revisionsLoyer.map((rev, i) => (
              <tr
                key={i}
                className={rev.estLigneInitiale ? "bg-blue-50" : "bg-white hover:bg-gray-50"}
              >
                <td className="px-3 py-2 font-medium text-gray-700">
                  {new Date(rev.date).toLocaleDateString("fr-FR")}
                </td>
                <td className="px-3 py-2 text-gray-600">{rev.indiceReference}</td>
                <td className="px-3 py-2 text-gray-500">{rev.ancienIndice ?? "—"}</td>
                <td className="px-3 py-2 text-gray-500">{rev.nouvelIndice ?? "—"}</td>
                <td className="px-3 py-2 text-gray-500">
                  {rev.ancienLoyer !== null ? `${rev.ancienLoyer} €` : "—"}
                </td>
                <td className="px-3 py-2 font-semibold text-gray-800">
                  {rev.nouveauLoyer} €
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-400 italic mt-2">
        Les révisions de loyer sont gérées depuis le module Indexation des loyers.
      </p>
    </div>
  );
}

export default function DepotGarantiePage() {
  const [contrats, setContrats] = useState<Contrat[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [etape, setEtape] = useState(1);

  const [selectedLocataire, setSelectedLocataire] = useState<Locataire | null>(null);
  const [bauxLocataire, setBauxLocataire] = useState<Bail[]>([]);
  const [selectedBail, setSelectedBail] = useState<Bail | null>(null);
  const [bienAssocie, setBienAssocie] = useState<Bien | null>(null);

  const [rechercheNom, setRechercheNom] = useState("");
  const [rechercheCodePostal, setRechercheCodePostal] = useState("");
  const [rechercheStatut, setRechercheStatut] = useState("");

  const [contratSelectionne, setContratSelectionne] = useState<Contrat | null>(null);
  const [contratDetail, setContratDetail] = useState<Contrat | null>(null);
  const [showRestitution, setShowRestitution] = useState(false);
  const [dateSortie, setDateSortie] = useState("");
  const [dateRestitution, setDateRestitution] = useState("");
  const [retenues, setRetenues] = useState<Retenue[]>([]);
  const [nouvelleRetenue, setNouvelleRetenue] = useState({ description: "", montant: 0 });

  function handleSelectLocataire(loc: Locataire) {
    setSelectedLocataire(loc);
    setSelectedBail(null);
    setBienAssocie(null);
    const bauxDuLocataire = bauxDisponibles.filter(
      (b) => b.locataireId === loc.id && b.statut === "Actif"
    );
    setBauxLocataire(bauxDuLocataire);
    if (bauxDuLocataire.length === 1) {
      handleSelectBail(bauxDuLocataire[0]);
      setEtape(2);
    }
  }

  function handleSelectBail(bail: Bail) {
    setSelectedBail(bail);
    const bien = biensDisponibles.find((b) => b.id === bail.bienId) || null;
    setBienAssocie(bien);
  }

  function resetForm() {
    setSelectedLocataire(null);
    setSelectedBail(null);
    setBienAssocie(null);
    setBauxLocataire([]);
    setEtape(1);
    setShowForm(false);
  }

  function creerContrat() {
    if (!selectedLocataire || !selectedBail || !bienAssocie) return;

    const dateEntree = new Date(selectedBail.dateEntree);
    const dateAnniversaire = new Date(
      dateEntree.getFullYear() + 1,
      dateEntree.getMonth(),
      dateEntree.getDate()
    ).toISOString().split("T")[0];

    const indiceLabel = `IRL ${selectedBail.trimestreReference} ${selectedBail.anneeReference}`;

    const nouveau: Contrat = {
      id: Date.now(),
      locataire: selectedLocataire,
      bien: bienAssocie,
      bail: selectedBail,
      statut: "Actif",
      revisionsLoyer: [
        {
          date: dateAnniversaire,
          indiceReference: indiceLabel,
          ancienIndice: null,
          nouvelIndice: null,
          ancienLoyer: null,
          nouveauLoyer: selectedBail.loyer,
          estLigneInitiale: true,
        },
      ],
    };

    setContrats([...contrats, nouveau]);
    resetForm();
  }

  function ouvrirRestitution(contrat: Contrat) {
    if (contrat.statut !== "Actif") return;
    setContratSelectionne(contrat);
    setRetenues([]);
    setDateSortie("");
    setDateRestitution("");
    setNouvelleRetenue({ description: "", montant: 0 });
    setShowRestitution(true);
  }

  function ajouterRetenue() {
    if (!nouvelleRetenue.description || nouvelleRetenue.montant <= 0) return;
    setRetenues([...retenues, nouvelleRetenue]);
    setNouvelleRetenue({ description: "", montant: 0 });
  }

  function supprimerRetenue(index: number) {
    setRetenues(retenues.filter((_, i) => i !== index));
  }

  function validerRestitution() {
    if (!contratSelectionne || !dateSortie || !dateRestitution) return;
    const totalRetenu = retenues.reduce((s, r) => s + r.montant, 0);
    const montantRestitue = Math.max(0, contratSelectionne.bail.depotGarantie - totalRetenu);
    setContrats(contrats.map((c) =>
      c.id === contratSelectionne.id
        ? {
            ...c,
            statut: "Terminé",
            restitution: {
              dateSortie,
              montantRestitue,
              montantRetenu: totalRetenu,
              retenues,
              dateRestitution,
              type: totalRetenu === 0 ? "complete" : "partielle",
            },
          }
        : c
    ));
    setShowRestitution(false);
    setContratSelectionne(null);
  }

  function getContratsFiltres() {
    return contrats.filter((c) => {
      const nomComplet = `${c.locataire.prenom} ${c.locataire.nom}`.toLowerCase();
      if (rechercheNom && !nomComplet.includes(rechercheNom.toLowerCase())) return false;
      if (rechercheCodePostal && !c.bien.codePostal.includes(rechercheCodePostal)) return false;
      if (rechercheStatut && c.statut !== rechercheStatut) return false;
      return true;
    });
  }

  const contratsFiltres = getContratsFiltres();
  const totalRetenu = retenues.reduce((s, r) => s + r.montant, 0);
  const montantARestituer = contratSelectionne
    ? Math.max(0, contratSelectionne.bail.depotGarantie - totalRetenu)
    : 0;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dépôt de garantie</h1>
          <p className="text-gray-500 text-sm mt-1">Gérez les dépôts de garantie de vos contrats de location</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEtape(1); }}
          className="bg-[#F4B942] hover:bg-[#e0a832] text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow"
        >
          + Créer un contrat de location
        </button>
      </div>

           {/* FILTRES */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Rechercher par nom..."
          value={rechercheNom}
          onChange={(e) => setRechercheNom(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-52"
        />
        <input
          type="text"
          placeholder="Code postal..."
          value={rechercheCodePostal}
          onChange={(e) => setRechercheCodePostal(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-40"
        />
        <select
          value={rechercheStatut}
          onChange={(e) => setRechercheStatut(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
        >
          <option value="">Tous les statuts</option>
          <option value="Actif">Actif</option>
          <option value="Terminé">Terminé</option>
        </select>
      </div>

           {/* LISTE CONTRATS */}
           {contratsFiltres.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🏠</p>
          <p className="font-medium">Aucun contrat pour l'instant</p>
          <p className="text-sm">Cliquez sur &quot;Créer un contrat de location&quot; pour commencer</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {contratsFiltres.map((contrat) => (
            <div key={contrat.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  {/* Nom cliquable */}
                  <button
                    onClick={() => setContratDetail(contrat)}
                    className="font-semibold text-[#0F2A4A] hover:text-[#F4B942] hover:underline transition text-left"
                  >
                    {contrat.locataire.prenom} {contrat.locataire.nom}
                  </button>
                  <p className="text-sm text-gray-500">
                    {contrat.bien.adresse}, {contrat.bien.codePostal} {contrat.bien.ville}
                  </p>
                  <p className="text-sm text-gray-500">
                    {contrat.bien.type} — {contrat.bien.nom}
                  </p>
                  <p className="text-sm text-gray-500">Bail : {contrat.bail.typeBail}</p>
                  <p className="text-sm font-medium text-gray-700">
                    Dépôt de garantie :{" "}
                    <span className="text-[#F4B942] font-bold">{contrat.bail.depotGarantie} €</span>
                  </p>
                </div>

                <div className="flex flex-col items-end gap-2">
                  {/* Statut dépôt */}
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                    contrat.statut === "Actif"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-500"
                  }`}>
                    {contrat.statut === "Actif" ? "Dépôt actif" : "Dépôt restitué"}
                  </span>

                  {/* Montants restitution si terminé */}
                  {contrat.restitution && (
                    <div className="text-xs text-gray-500 text-right">
                      <p>Restitué : <span className="text-green-600 font-medium">{contrat.restitution.montantRestitue} €</span></p>
                      {contrat.restitution.montantRetenu > 0 && (
                        <p>Retenu : <span className="text-red-500 font-medium">{contrat.restitution.montantRetenu} €</span></p>
                      )}
                    </div>
                  )}

                  {/* Action restitution */}
                  {contrat.statut === "Actif" && (
                    <button
                      onClick={() => ouvrirRestitution(contrat)}
                      className="text-sm bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg font-medium transition"
                    >
                      Restituer le dépôt
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL FICHE DÉTAILLÉE LOCATAIRE */}
      {contratDetail && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-[#0F2A4A]">
                  {contratDetail.locataire.prenom} {contratDetail.locataire.nom}
                </h2>
                <p className="text-sm text-gray-400 mt-0.5">{contratDetail.bien.nom}</p>
              </div>
              <button
                onClick={() => setContratDetail(null)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Infos locataire */}
              <section>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <span>👤</span> Informations du locataire
                </h3>
                <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-400 text-xs">Nom complet</p>
                    <p className="font-medium">{contratDetail.locataire.prenom} {contratDetail.locataire.nom}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Email</p>
                    <p className="font-medium">{contratDetail.locataire.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Téléphone</p>
                    <p className="font-medium">{contratDetail.locataire.telephone}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Statut</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      contratDetail.locataire.statut === "Actif"
                        ? "bg-green-100 text-green-700"
                        : contratDetail.locataire.statut === "En préavis"
                        ? "bg-orange-100 text-orange-600"
                        : "bg-gray-100 text-gray-500"
                    }`}>
                      {contratDetail.locataire.statut ?? "—"}
                    </span>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Scoring</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      contratDetail.locataire.scoring === "Excellent"
                        ? "bg-green-100 text-green-700"
                        : contratDetail.locataire.scoring === "Moyen"
                        ? "bg-yellow-100 text-yellow-600"
                        : contratDetail.locataire.scoring === "Médiocre"
                        ? "bg-red-100 text-red-500"
                        : "bg-gray-100 text-gray-400"
                    }`}>
                      {contratDetail.locataire.scoring ?? "—"}
                    </span>
                  </div>
                </div>
              </section>

              {/* Infos bail */}
              <section>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <span>📄</span> Informations du bail
                </h3>
                <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-400 text-xs">Type de bail</p>
                    <p className="font-medium">{contratDetail.bail.typeBail}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Date d'entrée</p>
                    <p className="font-medium">{contratDetail.bail.dateEntree}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Loyer</p>
                    <p className="font-medium">{contratDetail.bail.loyer} € / mois</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Charges</p>
                    <p className="font-medium">{contratDetail.bail.charges} €</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Indice de référence</p>
                    <p className="font-medium">
                      {contratDetail.bail.typeIndice} {contratDetail.bail.trimestreReference} {contratDetail.bail.anneeReference}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Statut bail</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      contratDetail.bail.statut === "Actif"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}>
                      {contratDetail.bail.statut}
                    </span>
                  </div>
                </div>
              </section>

              {/* Infos dépôt de garantie */}
              <section>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <span>🔐</span> Dépôt de garantie
                </h3>
                <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-400 text-xs">Montant perçu</p>
                    <p className="font-bold text-[#F4B942]">{contratDetail.bail.depotGarantie} €</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Statut</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      contratDetail.statut === "Actif"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}>
                      {contratDetail.statut === "Actif" ? "Dépôt actif" : "Dépôt restitué"}
                    </span>
                  </div>
                  {contratDetail.restitution && (
                    <>
                      <div>
                        <p className="text-gray-400 text-xs">Date de sortie</p>
                        <p className="font-medium">{contratDetail.restitution.dateSortie}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs">Date de restitution</p>
                        <p className="font-medium">{contratDetail.restitution.dateRestitution}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs">Montant restitué</p>
                        <p className="font-medium text-green-600">{contratDetail.restitution.montantRestitue} €</p>
                      </div>
                      {contratDetail.restitution.montantRetenu > 0 && (
                        <div>
                          <p className="text-gray-400 text-xs">Montant retenu</p>
                          <p className="font-medium text-red-500">{contratDetail.restitution.montantRetenu} €</p>
                        </div>
                      )}
                      {contratDetail.restitution.retenues.length > 0 && (
                        <div className="col-span-2">
                          <p className="text-gray-400 text-xs mb-1">Détail des retenues</p>
                          <div className="space-y-1">
                            {contratDetail.restitution.retenues.map((r, i) => (
                              <div key={i} className="flex justify-between bg-red-50 rounded-lg px-3 py-1.5 text-xs">
                                <span>{r.description}</span>
                                <span className="text-red-500 font-medium">-{r.montant} €</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </section>

              {/* Historique révisions loyer */}
              <section>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <span>📈</span> Historique des révisions de loyer
                </h3>
                {contratDetail.revisionsLoyer.length === 0 ? (
                  <p className="text-sm text-gray-400 italic">Aucune révision enregistrée.</p>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-gray-100">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-gray-50 text-gray-500 uppercase text-[11px]">
                        <tr>
                          <th className="px-3 py-2">Date</th>
                          <th className="px-3 py-2">Indice de référence</th>
                          <th className="px-3 py-2">Ancien indice</th>
                          <th className="px-3 py-2">Nouvel indice</th>
                          <th className="px-3 py-2">Ancien loyer</th>
                          <th className="px-3 py-2">Nouveau loyer</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {contratDetail.revisionsLoyer.map((rev, i) => (
                          <tr key={i} className={rev.estLigneInitiale ? "bg-blue-50" : "bg-white hover:bg-gray-50"}>
                            <td className="px-3 py-2">{rev.date}</td>
                            <td className="px-3 py-2">{rev.indiceReference}</td>
                            <td className="px-3 py-2">{rev.ancienIndice ?? "—"}</td>
                            <td className="px-3 py-2">{rev.nouvelIndice ?? "—"}</td>
                            <td className="px-3 py-2">{rev.ancienLoyer !== null ? `${rev.ancienLoyer} €` : "—"}</td>
                            <td className="px-3 py-2 font-medium text-[#0F2A4A]">{rev.nouveauLoyer} €</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                <p className="text-xs text-gray-400 italic mt-2">
                  Les révisions de loyer sont gérées depuis le module Indexation des loyers.
                </p>
              </section>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CRÉATION CONTRAT */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">
                Créer un contrat — Étape {etape}/2
              </h2>
              <button onClick={resetForm} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>

            {/* ÉTAPE 1 : Sélection locataire */}
            {etape === 1 && (
              <div>
                <p className="text-sm text-gray-600 mb-3">Sélectionnez un locataire :</p>
                <div className="space-y-2">
                  {locatairesDisponibles.map((loc) => (
                    <button
                      key={loc.id}
                      onClick={() => handleSelectLocataire(loc)}
                      className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition ${
                        selectedLocataire?.id === loc.id
                          ? "border-[#F4B942] bg-[#FFF8EC]"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <p className="font-medium">{loc.prenom} {loc.nom}</p>
                      <p className="text-gray-400 text-xs">{loc.email} — {loc.statut}</p>
                    </button>
                  ))}
                </div>

                {/* Sélection bail si plusieurs */}
                {selectedLocataire && bauxLocataire.length > 1 && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-2">Sélectionnez un bail :</p>
                    <div className="space-y-2">
                      {bauxLocataire.map((bail) => (
                        <button
                          key={bail.id}
                          onClick={() => handleSelectBail(bail)}
                          className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition ${
                            selectedBail?.id === bail.id
                              ? "border-[#F4B942] bg-[#FFF8EC]"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <p className="font-medium">{bail.typeBail}</p>
                          <p className="text-gray-400 text-xs">Entrée : {bail.dateEntree} — DG : {bail.depotGarantie} €</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setEtape(2)}
                  disabled={!selectedLocataire || !selectedBail}
                  className="mt-5 w-full bg-[#F4B942] disabled:opacity-40 text-white py-2.5 rounded-xl font-semibold text-sm"
                >
                  Suivant →
                </button>
              </div>
            )}

            {/* ÉTAPE 2 : Récapitulatif */}
            {etape === 2 && selectedBail && bienAssocie && (
              <div>
                <p className="text-sm text-gray-600 mb-4">Récapitulatif du contrat :</p>
                <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Locataire</span>
                    <span className="font-medium">{selectedLocataire?.prenom} {selectedLocataire?.nom}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Bien</span>
                    <span className="font-medium">{bienAssocie.nom}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Type de bail</span>
                    <span className="font-medium">{selectedBail.typeBail}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Date d&apos;entrée</span>
                    <span className="font-medium">{selectedBail.dateEntree}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Loyer</span>
                    <span className="font-medium">{selectedBail.loyer} € / mois</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 mt-2">
                    <span className="text-gray-500 font-medium">Dépôt de garantie</span>
                    <span className="font-bold text-[#F4B942]">{selectedBail.depotGarantie} €</span>
                  </div>
                </div>

                <div className="flex gap-3 mt-5">
                  <button
                    onClick={() => setEtape(1)}
                    className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl font-semibold text-sm"
                  >
                    ← Retour
                  </button>
                  <button
                    onClick={creerContrat}
                    className="flex-1 bg-[#F4B942] text-white py-2.5 rounded-xl font-semibold text-sm"
                  >
                    Créer le contrat
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL RESTITUTION */}
      {showRestitution && contratSelectionne && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">Restitution du dépôt de garantie</h2>
              <button onClick={() => setShowRestitution(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 mb-4 text-sm">
              <p className="font-medium">{contratSelectionne.locataire.prenom} {contratSelectionne.locataire.nom}</p>
              <p className="text-gray-500">{contratSelectionne.bien.nom}</p>
              <p className="text-[#F4B942] font-bold mt-1">DG perçu : {contratSelectionne.bail.depotGarantie} €</p>
            </div>

            <div className="space-y-3 mb-4">
              <div>
                <label className="text-xs text-gray-500 font-medium">Date de sortie</label>
                <input
                  type="date"
                  value={dateSortie}
                  onChange={(e) => setDateSortie(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Date de restitution prévue</label>
                <input
                  type="date"
                  value={dateRestitution}
                  onChange={(e) => setDateRestitution(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1"
                />
              </div>
            </div>

            {/* Retenues */}
            <div className="mb-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">Retenues sur le dépôt</p>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Description"
                  value={nouvelleRetenue.description}
                  onChange={(e) => setNouvelleRetenue({ ...nouvelleRetenue, description: e.target.value })}
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm"
                />
                <input
                  type="number"
                  placeholder="Montant €"
                  value={nouvelleRetenue.montant || ""}
                  onChange={(e) => setNouvelleRetenue({ ...nouvelleRetenue, montant: parseFloat(e.target.value) || 0 })}
                  className="w-28 border border-gray-200 rounded-lg px-3 py-2 text-sm"
                />
                <button
                  onClick={ajouterRetenue}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium"
                >
                  +
                </button>
              </div>
              {retenues.map((r, i) => (
                <div key={i} className="flex items-center justify-between bg-red-50 rounded-lg px-3 py-2 text-sm mb-1">
                  <span>{r.description}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-red-600">-{r.montant} €</span>
                    <button onClick={() => supprimerRetenue(i)} className="text-red-400 hover:text-red-600">✕</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Récap montants */}
            <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-1 mb-5">
              <div className="flex justify-between">
                <span className="text-gray-500">Dépôt perçu</span>
                <span>{contratSelectionne.bail.depotGarantie} €</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Total retenu</span>
                <span className="text-red-500">-{totalRetenu} €</span>
              </div>
              <div className="flex justify-between font-bold border-t pt-2 mt-1">
                <span>Montant à restituer</span>
                <span className="text-green-600">{montantARestituer} €</span>
              </div>
            </div>

            <button
              onClick={validerRestitution}
              disabled={!dateSortie || !dateRestitution}
              className="w-full bg-[#F4B942] disabled:opacity-40 text-white py-2.5 rounded-xl font-semibold text-sm"
            >
              Valider la restitution
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
