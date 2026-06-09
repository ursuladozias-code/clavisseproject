// app/baux/page.tsx
"use client";

import { useState } from "react";
import {
  Plus, Search, FileText, Eye, Pencil, Trash2, X, ChevronDown,
  Calendar, Home, User, Euro, Clock
} from "lucide-react";

// ============================================================
// TYPES
// ============================================================
interface Bien {
  id: string;
  nom: string;
  adresse: string;
  ville: string;
  codePostal: string;
  type: string;
  surface: number;
  nbPieces: number;
  loyer?: number;
  charges?: number;
}

interface Locataire {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  statut?: "actif" | "inactif" | "sorti";
}

interface Bail {
    id: string;
    reference: string;
    bienId: string;
    locataireId: string;
    typeBail: string;
    typeIndice: string;        // NOUVEAU
    indiceTrimestreRef: string; // NOUVEAU
    indiceAnneeRef: string;    // NOUVEAU
    dateEntree: string;
    dateSortie: string;
    loyer: number;
    charges: number;
    depotGarantie: number;
    periodicite: string;
    dateSignature: string;
    statut: "actif" | "termine" | "resilie";
    observations: string;
  }  

// ============================================================
// DONNÉES MOCK
// ============================================================
const BIENS_MOCK: Bien[] = [
  { id: "b1", nom: "Appartement Paris 11", adresse: "12 rue de la Paix", ville: "Paris", codePostal: "75011", type: "Appartement", surface: 45, nbPieces: 2, loyer: 850, charges: 100 },
  { id: "b2", nom: "Studio Lyon Centre", adresse: "5 place Bellecour", ville: "Lyon", codePostal: "69002", type: "Studio", surface: 25, nbPieces: 1, loyer: 550, charges: 50 },
  { id: "b3", nom: "Maison Bordeaux", adresse: "8 allée des Roses", ville: "Bordeaux", codePostal: "33000", type: "Maison", surface: 90, nbPieces: 4, loyer: 1200, charges: 150 },
  { id: "b4", nom: "Garage Nantes", adresse: "2 rue du Port", ville: "Nantes", codePostal: "44000", type: "Garage", surface: 15, nbPieces: 1, loyer: 80, charges: 0 },
  { id: "b5", nom: "Appartement Marseille", adresse: "3 boulevard Michelet", ville: "Marseille", codePostal: "13008", type: "Appartement", surface: 60, nbPieces: 3, loyer: 750, charges: 80 },
];

const LOCATAIRES_MOCK: Locataire[] = [
  { id: "l1", nom: "Dupont", prenom: "Jean", email: "jean.dupont@email.com", telephone: "06 12 34 56 78", statut: "actif" },
  { id: "l2", nom: "Martin", prenom: "Sophie", email: "sophie.martin@email.com", telephone: "06 98 76 54 32", statut: "actif" },
  { id: "l3", nom: "Bernard", prenom: "Pierre", email: "pierre.bernard@email.com", telephone: "07 11 22 33 44", statut: "sorti" },
];

const TYPES_BAIL = [
  "Bail d'habitation (loi 89) - résidence principale",
  "Bail meublé",
  "Bail commercial",
  "Bail professionnel",
  "Bail saisonnier",
  "Bail de location de garage ou de place de parking",
  "Bail de location de terrain",
  "Bail de sous-location",
  "Convention d'occupation précaire",
  "Bail civil",
];

const PERIODICITES = ["Mensuelle", "Trimestrielle", "Annuelle"];
const TYPES_INDICE = [
  { value: "IRL", label: "IRL (Indice de Référence des Loyers)" },
  { value: "ILC", label: "ILC (Indice des Loyers Commerciaux)" },
  { value: "ILAT", label: "ILAT (Indice des Loyers des Activités Tertiaires)" },
];

const TRIMESTRES_REF = ["1T", "2T", "3T", "4T"];

const ANNEES_REF = Array.from({ length: 76 }, (_, i) => String(2025 + i));

const BAUX_MOCK: Bail[] = [
  {
    id: "bail1",
    reference: "BAIL-2024-001",
    bienId: "b1",
    locataireId: "l1",
    typeBail: "Bail d'habitation (loi 89) - résidence principale",
    dateEntree: "2024-01-01",
    dateSortie: "",
    loyer: 850,
    charges: 100,
    depotGarantie: 1700,
    periodicite: "Mensuelle",
    dateSignature: "2023-12-15",
    statut: "actif",
    observations: "",
typeIndice: "IRL",
indiceTrimestreRef: "1T",
indiceAnneeRef: "2024",
  },
  {
    id: "bail2",
    reference: "BAIL-2024-002",
    bienId: "b2",
    locataireId: "l2",
    typeBail: "Bail meublé",
    dateEntree: "2024-03-01",
    dateSortie: "",
    loyer: 550,
    charges: 50,
    depotGarantie: 550,
    periodicite: "Mensuelle",
    dateSignature: "2024-02-20",
    statut: "actif",
    observations: "",
typeIndice: "IRL",
indiceTrimestreRef: "1T",
indiceAnneeRef: "2024",
  },
  {
    id: "bail3",
    reference: "BAIL-2023-001",
    bienId: "b3",
    locataireId: "l3",
    typeBail: "Bail d'habitation (loi 89) - résidence principale",
    dateEntree: "2023-01-01",
    dateSortie: "2023-12-31",
    loyer: 1200,
    charges: 150,
    depotGarantie: 2400,
    periodicite: "Mensuelle",
    dateSignature: "2022-12-15",
    statut: "termine",
    observations: "Bail terminé normalement",
typeIndice: "IRL",
indiceTrimestreRef: "1T",
indiceAnneeRef: "2024",
  },
];

// ============================================================
// HELPERS
// ============================================================
function isBienDisponible(bienId: string, baux: Bail[], dateEntreeNouveauBail: string): boolean {
  const today = new Date().toISOString().split("T")[0];
  const dateRef = dateEntreeNouveauBail || today;
  const bauxDuBien = baux.filter((b) => b.bienId === bienId);
  if (bauxDuBien.length === 0) return true;
  for (const bail of bauxDuBien) {
    if (!bail.dateSortie || bail.dateSortie >= dateRef) return false;
  }
  return true;
}

function getBienById(id: string, biens: Bien[]) {
  return biens.find((b) => b.id === id);
}

function getLocataireById(id: string, locataires: Locataire[]) {
  return locataires.find((l) => l.id === id);
}

function generateReference(baux: Bail[]): string {
  const year = new Date().getFullYear();
  const count = baux.filter((b) => b.reference.includes(String(year))).length + 1;
  return `BAIL-${year}-${String(count).padStart(3, "0")}`;
}

function formatDate(dateStr: string) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("fr-FR");
}

function getStatutConfig(statut: string) {
  switch (statut) {
    case "actif":
      return { label: "Actif", bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500" };
    case "termine":
      return { label: "Terminé", bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400" };
    case "resilie":
      return { label: "Résilié", bg: "bg-red-100", text: "text-red-700", dot: "bg-red-500" };
    default:
      return { label: statut, bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400" };
  }
}

// ============================================================
// MODAL FORMULAIRE
// ============================================================
interface BailModalProps {
  onClose: () => void;
  onSave: (bail: Bail) => void;
  baux: Bail[];
  biens: Bien[];
  locataires: Locataire[];
  bailToEdit: Bail | null;
}

function BailModal({ onClose, onSave, baux, biens, locataires, bailToEdit }: BailModalProps) {
  const [form, setForm] = useState({
    bienId: bailToEdit?.bienId || "",
    locataireId: bailToEdit?.locataireId || "",
    typeBail: bailToEdit?.typeBail || "",
    dateEntree: bailToEdit?.dateEntree || "",
    dateSortie: bailToEdit?.dateSortie || "",
    loyer: bailToEdit?.loyer || 0,
    charges: bailToEdit?.charges || 0,
    depotGarantie: bailToEdit?.depotGarantie || 0,
    periodicite: bailToEdit?.periodicite || "Mensuelle",
    dateSignature: bailToEdit?.dateSignature || "",
    typeIndice: bailToEdit?.typeIndice || "",
  indiceTrimestreRef: bailToEdit?.indiceTrimestreRef || "",
  indiceAnneeRef: bailToEdit?.indiceAnneeRef || "", 
    statut: bailToEdit?.statut || "actif",
    observations: bailToEdit?.observations || "",
  });

  const [showBienDropdown, setShowBienDropdown] = useState(false);
  const [rechercheBien, setRechercheBien] = useState("");

  const biensDisponibles = biens.filter((b) => {
    const disponible = bailToEdit?.bienId === b.id || isBienDisponible(b.id, baux, form.dateEntree);
    const matchSearch = b.nom.toLowerCase().includes(rechercheBien.toLowerCase()) ||
      b.ville.toLowerCase().includes(rechercheBien.toLowerCase());
    return disponible && matchSearch;
  });

  const selectedBien = form.bienId ? getBienById(form.bienId, biens) : null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const locataire = locataires.find((l) => l.id === form.locataireId);
    let statutAuto: Bail["statut"] = "actif";
    if (locataire?.statut === "sorti" || locataire?.statut === "inactif") {
      statutAuto = "termine";
    }
    const newBail: Bail = {
        id: bailToEdit?.id || `bail-${Date.now()}`,
        reference: bailToEdit?.reference || generateReference(baux),
        bienId: form.bienId,
        locataireId: form.locataireId,
        typeBail: form.typeBail,
        typeIndice: form.typeIndice,
        indiceTrimestreRef: form.indiceTrimestreRef,
        indiceAnneeRef: String(form.indiceAnneeRef),
        dateEntree: form.dateEntree,
        dateSortie: form.dateSortie || "",
        loyer: Number(form.loyer),
        charges: Number(form.charges),
        depotGarantie: Number(form.depotGarantie),
        periodicite: form.periodicite,
        dateSignature: form.dateSignature,
        statut: bailToEdit ? (form.statut as Bail["statut"]) : statutAuto,
        observations: form.observations || "",
      };
      onSave(newBail);      
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <FileText size={20} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {bailToEdit ? "Modifier le bail" : "Nouveau bail"}
              </h2>
              <p className="text-sm text-gray-500">
                {bailToEdit ? bailToEdit.reference : "Remplissez les informations du contrat"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Bien */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Bien <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowBienDropdown(!showBienDropdown)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-left flex items-center justify-between hover:border-blue-400 focus:ring-2 focus:ring-blue-500 outline-none transition-colors bg-white"
              >
                <span className={selectedBien ? "text-gray-900 text-sm" : "text-gray-400 text-sm"}>
                  {selectedBien ? selectedBien.nom : "Sélectionner un bien..."}
                </span>
                <ChevronDown size={16} className="text-gray-400" />
              </button>
              {showBienDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg">
                  <div className="p-2 border-b border-gray-100">
                    <input
                      type="text"
                      placeholder="Rechercher un bien..."
                      value={rechercheBien}
                      onChange={(e) => setRechercheBien(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {biensDisponibles.length === 0 ? (
                      <p className="px-4 py-3 text-sm text-gray-400 italic">Aucun bien disponible</p>
                    ) : (
                      biensDisponibles.map((b) => (
                        <div
                          key={b.id}
                          onClick={() => {
                            setForm({ ...form, bienId: b.id, loyer: b.loyer || 0, charges: b.charges || 0 });
                            setShowBienDropdown(false);
                            setRechercheBien("");
                          }}
                          className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-0"
                        >
                          <div className="font-medium text-sm text-gray-800">{b.nom}</div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            {b.adresse}, {b.codePostal} {b.ville} · {b.type} · {b.surface}m²
                          </div>
                          <div className="text-xs text-blue-600 mt-0.5">
                            {b.loyer ?? 0} € loyer · {b.charges ?? 0} € charges
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Locataire */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Locataire <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={form.locataireId}
              onChange={(e) => setForm({ ...form, locataireId: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none hover:border-blue-400 transition-colors"
            >
              <option value="">Sélectionner un locataire...</option>
              {locataires.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.nom} {l.prenom} — {l.email}
                  {l.statut === "sorti" ? " (Sorti)" : l.statut === "inactif" ? " (Inactif)" : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Type de bail */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Type de bail <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={form.typeBail}
              onChange={(e) => setForm({ ...form, typeBail: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none hover:border-blue-400 transition-colors"
            >
              <option value="">Sélectionner un type...</option>
              {TYPES_BAIL.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Date de signature <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={form.dateSignature}
                onChange={(e) => setForm({ ...form, dateSignature: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Date d'entrée <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={form.dateEntree}
                onChange={(e) => setForm({ ...form, dateEntree: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Date de sortie
              </label>
              <input
                type="date"
                value={form.dateSortie}
                onChange={(e) => setForm({ ...form, dateSortie: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Financier */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Loyer (€) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                min={0}
                value={form.loyer || ""}
                onChange={(e) => setForm({ ...form, loyer: Number(e.target.value) })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="0"
              />
              {form.bienId && (
                <p className="text-xs text-blue-500 mt-1">✓ Repris depuis la fiche du bien</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Charges (€)</label>
              <input
                type="number"
                min={0}
                value={form.charges || ""}
                onChange={(e) => setForm({ ...form, charges: Number(e.target.value) })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Dépôt de garantie (€)</label>
              <div className="flex gap-2 mb-2">
                {[1, 2].map((mois) => (
                  <button
                    key={mois}
                    type="button"
                    onClick={() => setForm({ ...form, depotGarantie: (form.loyer || 0) * mois })}
                    className="text-xs px-2 py-1 bg-gray-100 hover:bg-blue-100 text-gray-600 hover:text-blue-700 rounded-lg border border-gray-200 transition-colors"
                  >
                    {mois} mois
                  </button>
                ))}
              </div>
              <input
                type="number"
                min={0}
                value={form.depotGarantie || ""}
                onChange={(e) => setForm({ ...form, depotGarantie: Number(e.target.value) })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="0"
              />
            </div>
          </div>

          {/* Périodicité */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Périodicité</label>
              <select
                value={form.periodicite}
                onChange={(e) => setForm({ ...form, periodicite: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {PERIODICITES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            {bailToEdit && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Statut</label>
                <select
                  value={form.statut}
                  onChange={(e) => setForm({ ...form, statut: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="actif">Actif</option>
                  <option value="termine">Terminé</option>
                  <option value="resilie">Résilié</option>
                </select>
                <p className="text-xs text-gray-400 mt-1">Déterminé automatiquement selon le statut du locataire</p>
              </div>
            )}
          </div>
          {/* Indice d'indexation */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
      Type d'indice <span className="text-red-500">*</span>
    </label>
    <select
      required
      value={form.typeIndice}
      onChange={(e) => setForm({ ...form, typeIndice: e.target.value })}
      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
    >
      <option value="">— Sélectionner un indice —</option>
      {TYPES_INDICE.map((t) => (
        <option key={t.value} value={t.value}>{t.label}</option>
      ))}
    </select>
  </div>

  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
      Indice de référence <span className="text-red-500">*</span>
    </label>
    <div className="grid grid-cols-2 gap-2">
      <select
        required
        value={form.indiceTrimestreRef}
        onChange={(e) => setForm({ ...form, indiceTrimestreRef: e.target.value })}
        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
      >
        <option value="">— Trimestre —</option>
        {TRIMESTRES_REF.map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>
      <select
        required
        value={form.indiceAnneeRef}
        onChange={(e) => setForm({ ...form, indiceAnneeRef: e.target.value })}
        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
      >
        <option value="">— Année —</option>
        {ANNEES_REF.map((a) => (
          <option key={a} value={a}>{a}</option>
        ))}
      </select>
    </div>
  </div>
</div>

          {/* Observations */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Observations</label>
            <textarea
              rows={3}
              value={form.observations}
              onChange={(e) => setForm({ ...form, observations: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              placeholder="Notes, remarques particulières..."
            />
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 font-medium text-sm transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium text-sm transition-colors shadow-sm"
            >
              {bailToEdit ? "Enregistrer" : "Créer le bail"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================
// MODAL DÉTAIL
// ============================================================
interface BailDetailProps {
  bail: Bail;
  biens: Bien[];
  locataires: Locataire[];
  onClose: () => void;
  onEdit: () => void;
}

function BailDetail({ bail, biens, locataires, onClose, onEdit }: BailDetailProps) {
  const bien = getBienById(bail.bienId, biens);
  const locataire = getLocataireById(bail.locataireId, locataires);
  const statutConfig = getStatutConfig(bail.statut);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <FileText size={20} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{bail.reference}</h2>
              <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${statutConfig.bg} ${statutConfig.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${statutConfig.dot}`} />
                {statutConfig.label}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onEdit} className="p-2 hover:bg-blue-50 text-blue-600 rounded-xl transition-colors">
              <Pencil size={18} />
            </button>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <X size={20} className="text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Type de bail */}
          <div className="bg-blue-50 rounded-xl p-4">
            <p className="text-xs text-blue-500 font-semibold uppercase tracking-wide mb-1">Type de bail</p>
            <p className="text-blue-900 font-semibold text-sm">{bail.typeBail}</p>
          </div>

{/* Indice d'indexation */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <div className="bg-gray-50 rounded-xl p-4">
    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Type d'indice</p>
    <p className="font-semibold text-gray-900 text-sm">{bail.typeIndice || "—"}</p>
  </div>
  <div className="bg-gray-50 rounded-xl p-4">
    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Indice de référence</p>
    <p className="font-semibold text-gray-900 text-sm">
      {bail.indiceTrimestreRef && bail.indiceAnneeRef
        ? `${bail.indiceTrimestreRef} ${bail.indiceAnneeRef}`
        : "—"}
    </p>
  </div>
</div>

          {/* Bien & Locataire */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Home size={14} className="text-gray-400" />
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Bien</p>
              </div>
              <p className="font-semibold text-gray-900 text-sm">{bien?.nom || "—"}</p>
              <p className="text-xs text-gray-500 mt-0.5">{bien?.adresse}, {bien?.ville}</p>
              <p className="text-xs text-gray-400 mt-0.5">{bien?.type} · {bien?.surface}m² · {bien?.nbPieces} pièce(s)</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <User size={14} className="text-gray-400" />
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Locataire</p>
              </div>
              <p className="font-semibold text-gray-900 text-sm">{locataire?.prenom} {locataire?.nom}</p>
              <p className="text-xs text-gray-500 mt-0.5">{locataire?.email}</p>
              <p className="text-xs text-gray-400 mt-0.5">{locataire?.telephone}</p>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">Signature</p>
              <p className="font-semibold text-gray-800 text-sm">{formatDate(bail.dateSignature)}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">Entrée</p>
              <p className="font-semibold text-gray-800 text-sm">{formatDate(bail.dateEntree)}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">Sortie</p>
              <p className="font-semibold text-gray-800 text-sm">{formatDate(bail.dateSortie)}</p>
            </div>
          </div>

          {/* Financier */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-emerald-50 rounded-xl p-3 text-center">
              <p className="text-xs text-emerald-600 mb-1">Loyer</p>
              <p className="font-bold text-emerald-800">{bail.loyer.toLocaleString("fr-FR")} €</p>
            </div>
            <div className="bg-orange-50 rounded-xl p-3 text-center">
              <p className="text-xs text-orange-600 mb-1">Charges</p>
              <p className="font-bold text-orange-800">{bail.charges.toLocaleString("fr-FR")} €</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-3 text-center">
              <p className="text-xs text-purple-600 mb-1">Dépôt garantie</p>
              <p className="font-bold text-purple-800">{bail.depotGarantie.toLocaleString("fr-FR")} €</p>
            </div>
          </div>

          {/* Périodicité */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock size={14} className="text-gray-400" />
            <span>Paiement <strong>{bail.periodicite.toLowerCase()}</strong></span>
          </div>

          {/* Observations */}
          {bail.observations && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Observations</p>
              <p className="text-gray-700 bg-gray-50 rounded-xl p-4 text-sm">{bail.observations}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// PAGE PRINCIPALE
// ============================================================
export default function BauxPage() {
  const [baux, setBaux] = useState<Bail[]>(BAUX_MOCK);
  const [biens] = useState<Bien[]>(BIENS_MOCK);
  const [locataires] = useState<Locataire[]>(LOCATAIRES_MOCK);
  const [showModal, setShowModal] = useState(false);
  const [bailToEdit, setBailToEdit] = useState<Bail | null>(null);
  const [bailToView, setBailToView] = useState<Bail | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatut, setFilterStatut] = useState("");
  const [filterType, setFilterType] = useState("");

  const nbActifs = baux.filter((b) => b.statut === "actif").length;
  const nbTermines = baux.filter((b) => b.statut === "termine").length;
  const nbResilies = baux.filter((b) => b.statut === "resilie").length;
  const loyerTotal = baux.filter((b) => b.statut === "actif").reduce((sum, b) => sum + b.loyer + b.charges, 0);

  const biauxFiltres = baux.filter((bail) => {
    const bien = getBienById(bail.bienId, biens);
    const locataire = getLocataireById(bail.locataireId, locataires);
    const q = searchTerm.toLowerCase();
    const matchSearch =
      !searchTerm ||
      bail.reference.toLowerCase().includes(q) ||
      (bien?.nom.toLowerCase().includes(q) ?? false) ||
      (bien?.ville.toLowerCase().includes(q) ?? false) ||
      (locataire?.nom.toLowerCase().includes(q) ?? false) ||
      (locataire?.prenom.toLowerCase().includes(q) ?? false);
    const matchStatut = !filterStatut || bail.statut === filterStatut;
    const matchType = !filterType || bail.typeBail === filterType;
    return matchSearch && matchStatut && matchType;
  });

  function handleSave(bail: Bail) {
    if (bailToEdit) {
      setBaux(baux.map((b) => (b.id === bail.id ? bail : b)));
    } else {
      setBaux([...baux, bail]);
    }
    setShowModal(false);
    setBailToEdit(null);
  }

  function handleDelete(id: string) {
    if (confirm("Supprimer ce bail ?")) {
      setBaux(baux.filter((b) => b.id !== id));
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Baux</h1>
            <p className="text-gray-500 mt-1">Gérez vos contrats de location</p>
          </div>
          <button
            onClick={() => { setBailToEdit(null); setShowModal(true); }}
            className="inline-flex items-center gap-2 bg-amber-400 text-white px-6 py-3 rounded-2xl hover:bg-amber-500 font-semibold shadow-sm transition-colors"

          >
            <Plus size={18} />
            Nouveau bail
          </button>
        </div>

        {/* Stats */}
<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
  <div className="rounded-2xl p-5 text-white" style={{background: 'linear-gradient(135deg, #10d9a0, #06b6d4)'}}>
    <div className="text-3xl mb-2">✅</div>
    <div className="text-3xl font-bold">{nbActifs}</div>
    <div className="text-sm font-medium mt-1 opacity-90">Baux actifs</div>
  </div>
  <div className="rounded-2xl p-5 text-white" style={{background: 'linear-gradient(135deg, #94a3b8, #64748b)'}}>
    <div className="text-3xl mb-2">📋</div>
    <div className="text-3xl font-bold">{nbTermines}</div>
    <div className="text-sm font-medium mt-1 opacity-90">Terminés</div>
  </div>
  <div className="rounded-2xl p-5 text-white" style={{background: 'linear-gradient(135deg, #f472b6, #f43f5e)'}}>
    <div className="text-3xl mb-2">❌</div>
    <div className="text-3xl font-bold">{nbResilies}</div>
    <div className="text-sm font-medium mt-1 opacity-90">Résiliés</div>
  </div>
  <div className="rounded-2xl p-5 text-white" style={{background: 'linear-gradient(135deg, #c084fc, #a855f7)'}}>
    <div className="text-3xl mb-2">💰</div>
    <div className="text-3xl font-bold">{loyerTotal.toLocaleString("fr-FR")} €</div>
    <div className="text-sm font-medium mt-1 opacity-90">Revenus mensuels</div>
  </div>
</div>


        {/* Filtres */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 flex-1 shadow-sm">
            <Search size={16} className="text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="Rechercher par référence, bien, locataire..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="outline-none text-sm w-full bg-transparent"
            />
          </div>
          <select
            value={filterStatut}
            onChange={(e) => setFilterStatut(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none bg-white shadow-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tous les statuts</option>
            <option value="actif">Actif</option>
            <option value="termine">Terminé</option>
            <option value="resilie">Résilié</option>
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none bg-white shadow-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tous les types</option>
            {TYPES_BAIL.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Cartes */}
        {biauxFiltres.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center justify-center py-20 text-gray-400">
            <FileText size={48} className="mb-4 opacity-30" />
            <p className="text-lg font-semibold">Aucun bail trouvé</p>
            <p className="text-sm mt-1">Créez votre premier bail en cliquant sur "Nouveau bail"</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {biauxFiltres.map((bail) => {
              const bien = getBienById(bail.bienId, biens);
              const locataire = getLocataireById(bail.locataireId, locataires);
              const statutConfig = getStatutConfig(bail.statut);

              return (
                <div
                  key={bail.id}
                  className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden group"
                >
                  {/* Card Header */}
                  <div className="p-5 pb-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                          <FileText size={18} className="text-blue-600" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{bail.reference}</p>
                          <p className="text-xs text-gray-500 mt-0.5 truncate max-w-[160px]">{bail.typeBail}</p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${statutConfig.bg} ${statutConfig.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statutConfig.dot}`} />
                        {statutConfig.label}
                      </span>
                    </div>

                    {/* Bien */}
                    <div className="flex items-center gap-2 mb-2">
                      <Home size={13} className="text-gray-400 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{bien?.nom || "—"}</p>
                        <p className="text-xs text-gray-500 truncate">{bien?.adresse}, {bien?.ville}</p>
                      </div>
                    </div>

                    {/* Locataire */}
                    <div className="flex items-center gap-2">
                      <User size={13} className="text-gray-400 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-700 truncate">
                          {locataire?.prenom} {locataire?.nom}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{locataire?.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Financier */}
                  <div className="px-5 pb-4">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-emerald-50 rounded-xl p-2.5 text-center">
                        <p className="text-xs text-emerald-600 mb-0.5">Loyer</p>
                        <p className="font-bold text-emerald-800 text-sm">{bail.loyer.toLocaleString("fr-FR")} €</p>
                      </div>
                      <div className="bg-orange-50 rounded-xl p-2.5 text-center">
                        <p className="text-xs text-orange-600 mb-0.5">Charges</p>
                        <p className="font-bold text-orange-800 text-sm">{bail.charges.toLocaleString("fr-FR")} €</p>
                      </div>
                      <div className="bg-purple-50 rounded-xl p-2.5 text-center">
                        <p className="text-xs text-purple-600 mb-0.5">Dépôt</p>
                        <p className="font-bold text-purple-800 text-sm">{bail.depotGarantie.toLocaleString("fr-FR")} €</p>
                      </div>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="px-5 pb-4 flex items-center gap-1.5 text-xs text-gray-500">
                    <Calendar size={12} className="shrink-0" />
                    <span>Entrée : <strong className="text-gray-700">{formatDate(bail.dateEntree)}</strong></span>
                    {bail.dateSortie && (
                      <>
                        <span className="mx-1">·</span>
                        <span>Sortie : <strong className="text-gray-700">{formatDate(bail.dateSortie)}</strong></span>
                      </>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="border-t border-gray-100 px-5 py-3 flex items-center justify-end gap-1 bg-gray-50/50">
                    <button
                      onClick={() => setBailToView(bail)}
                      className="p-2 hover:bg-blue-50 text-blue-600 rounded-xl transition-colors"
                      title="Voir le détail"
                    >
                      <Eye size={15} />
                    </button>
                    <button
                      onClick={() => { setBailToEdit(bail); setShowModal(true); }}
                      className="p-2 hover:bg-amber-50 text-amber-600 rounded-xl transition-colors"
                      title="Modifier"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(bail.id)}
                      className="p-2 hover:bg-red-50 text-red-500 rounded-xl transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      {showModal && (
        <BailModal
          onClose={() => { setShowModal(false); setBailToEdit(null); }}
          onSave={handleSave}
          baux={baux}
          biens={biens}
          locataires={locataires}
          bailToEdit={bailToEdit}
        />
      )}

      {bailToView && (
        <BailDetail
          bail={bailToView}
          biens={biens}
          locataires={locataires}
          onClose={() => setBailToView(null)}
          onEdit={() => {
            setBailToEdit(bailToView);
            setBailToView(null);
            setShowModal(true);
          }}
        />
      )}
    </div>
  );
}
