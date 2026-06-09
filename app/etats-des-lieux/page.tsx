"use client";

import { useState, useRef } from "react";
import {
  ClipboardList, CheckCircle, AlertCircle, Camera, FileText,
  Download, Send, ChevronDown, ChevronUp, Gauge, PenLine,
  ArrowRight, ArrowLeft, Plus, Trash2, X, Image, ZoomIn, Printer,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type EtatItem = "Très bon état" | "Bon état" | "État moyen" | "Mauvais état" | "Dégradé" | "Hors service" | "";

type PhotoElement = { id: string; url: string; nom: string };

type ElementPiece = {
  id: string; label: string;
  etatEntree: EtatItem; obsEntree: string; photosEntree: PhotoElement[];
  etatSortie: EtatItem; obsSortie: string; photosSortie: PhotoElement[];
};

type Piece = { id: string; nom: string; custom?: boolean; elements: ElementPiece[] };

type Compteur = { id: string; label: string; valeurEntree: string; valeurSortie: string; unite: string };

type Locataire = {
  id: number; nom: string; prenom: string; bien: string;
  bienId: number; dateEntree: string; dateSortie?: string;
};

type TypeEDL = "entree" | "sortie" | "comparatif";

type Bien = {
  id: number;
  nom: string;
  adresse: string;
  type: string;
  locataire: string;
};

// ─── Constantes ───────────────────────────────────────────────────────────────

const ETATS: EtatItem[] = ["Très bon état", "Bon état", "État moyen", "Mauvais état", "Dégradé", "Hors service"];
const ETAT_COLORS: Record<string, string> = {
    "Très bon état": "bg-emerald-100 text-emerald-700",
    "Bon état": "bg-green-100 text-green-700",
    "État moyen": "bg-amber-100 text-amber-700",
    "Mauvais état": "bg-orange-100 text-orange-700",
    "Dégradé": "bg-rose-100 text-rose-700",
    "Hors service": "bg-red-100 text-red-700",
  };

const PIECES_SUGGESTIONS = [
  "Cave", "Garage", "Buanderie", "Bureau", "Débarras",
  "Terrasse", "Balcon", "Grenier", "Sous-sol", "Véranda",
];

const ELEMENTS_SUGGESTIONS: Record<string, string[]> = {
  default: ["Sol", "Murs", "Plafond", "Fenêtres", "Portes", "Électricité", "Chauffage", "Volets"],
  "Cuisine": ["Sol", "Murs", "Plafond", "Fenêtres", "Portes", "Placard", "Plan de travail", "Évier", "Robinetterie", "Hotte", "Plaque de cuisson", "Four", "Réfrigérateur"],
  "Salle de bain": ["Sol", "Murs", "Plafond", "Fenêtres", "Douche", "Baignoire", "Lavabo", "Robinetterie", "WC", "Miroir", "Ventilation"],
  "Salon": ["Sol", "Murs", "Plafond", "Fenêtres", "Portes", "Volets", "Électricité", "Chauffage"],
  "Chambre": ["Sol", "Murs", "Plafond", "Fenêtres", "Portes", "Volets", "Placard", "Électricité", "Chauffage"],
  "Entrée": ["Sol", "Murs", "Plafond", "Porte d'entrée", "Interphone", "Boîte aux lettres", "Électricité"],
  "WC": ["Sol", "Murs", "Plafond", "WC", "Chasse d'eau", "Robinetterie", "Ventilation"],
};

// ─── Mock Data ────────────────────────────────────────────────────────────────
const BIENS_MOCK: Bien[] = [
    {
      id: 1,
      nom: "Appartement T3",
      adresse: "12 rue des Lilas, Paris",
      type: "Appartement",
      locataire: "Marie Dupont",
    },
    {
      id: 2,
      nom: "Studio Centre-ville",
      adresse: "5 avenue Victor Hugo, Lyon",
      type: "Studio",
      locataire: "Marc Dubois",
    },
    {
      id: 3,
      nom: "Maison familiale",
      adresse: "18 rue des Fleurs, Bordeaux",
      type: "Maison",
      locataire: "Julie Leroy",
    },
  ];
const locatairesMock: Locataire[] = [
  { id: 1, nom: "Martin", prenom: "Sophie", bien: "Appartement T3 - Paris 11e", bienId: 101, dateEntree: "2023-09-01", dateSortie: "2024-06-30" },
  { id: 2, nom: "Dubois", prenom: "Marc", bien: "Studio - Lyon 6e", bienId: 102, dateEntree: "2024-01-15" },
  { id: 3, nom: "Leroy", prenom: "Julie", bien: "Appartement T2 - Bordeaux", bienId: 103, dateEntree: "2022-04-01", dateSortie: "2024-05-31" },
];

const PIECES_INIT: Piece[] = [
  {
    id: "p1", nom: "Entrée", elements: [
      { id: "e1", label: "Sol", etatEntree: "", obsEntree: "", photosEntree: [], etatSortie: "", obsSortie: "", photosSortie: [] },
      { id: "e2", label: "Murs", etatEntree: "", obsEntree: "", photosEntree: [], etatSortie: "", obsSortie: "", photosSortie: [] },
      { id: "e3", label: "Porte d'entrée", etatEntree: "", obsEntree: "", photosEntree: [], etatSortie: "", obsSortie: "", photosSortie: [] },
    ]
  },
  {
    id: "p2", nom: "Salon", elements: [
      { id: "e4", label: "Sol", etatEntree: "", obsEntree: "", photosEntree: [], etatSortie: "", obsSortie: "", photosSortie: [] },
      { id: "e5", label: "Murs", etatEntree: "", obsEntree: "", photosEntree: [], etatSortie: "", obsSortie: "", photosSortie: [] },
      { id: "e6", label: "Plafond", etatEntree: "", obsEntree: "", photosEntree: [], etatSortie: "", obsSortie: "", photosSortie: [] },
      { id: "e7", label: "Fenêtres", etatEntree: "", obsEntree: "", photosEntree: [], etatSortie: "", obsSortie: "", photosSortie: [] },
    ]
  },
  {
    id: "p3", nom: "Cuisine", elements: [
      { id: "e8", label: "Sol", etatEntree: "", obsEntree: "", photosEntree: [], etatSortie: "", obsSortie: "", photosSortie: [] },
      { id: "e9", label: "Plan de travail", etatEntree: "", obsEntree: "", photosEntree: [], etatSortie: "", obsSortie: "", photosSortie: [] },
      { id: "e10", label: "Évier", etatEntree: "", obsEntree: "", photosEntree: [], etatSortie: "", obsSortie: "", photosSortie: [] },
    ]
  },
  {
    id: "p4", nom: "Chambre", elements: [
      { id: "e11", label: "Sol", etatEntree: "", obsEntree: "", photosEntree: [], etatSortie: "", obsSortie: "", photosSortie: [] },
      { id: "e12", label: "Murs", etatEntree: "", obsEntree: "", photosEntree: [], etatSortie: "", obsSortie: "", photosSortie: [] },
      { id: "e13", label: "Placard", etatEntree: "", obsEntree: "", photosEntree: [], etatSortie: "", obsSortie: "", photosSortie: [] },
    ]
  },
  {
    id: "p5", nom: "Salle de bain", elements: [
      { id: "e14", label: "Sol", etatEntree: "", obsEntree: "", photosEntree: [], etatSortie: "", obsSortie: "", photosSortie: [] },
      { id: "e15", label: "Douche", etatEntree: "", obsEntree: "", photosEntree: [], etatSortie: "", obsSortie: "", photosSortie: [] },
      { id: "e16", label: "Lavabo", etatEntree: "", obsEntree: "", photosEntree: [], etatSortie: "", obsSortie: "", photosSortie: [] },
    ]
  },
  {
    id: "p6", nom: "WC", elements: [
      { id: "e17", label: "WC", etatEntree: "", obsEntree: "", photosEntree: [], etatSortie: "", obsSortie: "", photosSortie: [] },
      { id: "e18", label: "Chasse d'eau", etatEntree: "", obsEntree: "", photosEntree: [], etatSortie: "", obsSortie: "", photosSortie: [] },
    ]
  },
];

const COMPTEURS_INIT: Compteur[] = [
  { id: "c1", label: "Électricité", valeurEntree: "", valeurSortie: "", unite: "kWh" },
  { id: "c2", label: "Eau froide", valeurEntree: "", valeurSortie: "", unite: "m³" },
  { id: "c3", label: "Eau chaude", valeurEntree: "", valeurSortie: "", unite: "m³" },
  { id: "c4", label: "Gaz", valeurEntree: "", valeurSortie: "", unite: "m³" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const hasEcart = (el: ElementPiece): boolean => {
  if (!el.etatEntree || !el.etatSortie) return false;
  const entreeIdx = ETATS.indexOf(el.etatEntree as EtatItem);
  const sortieIdx = ETATS.indexOf(el.etatSortie as EtatItem);
  return sortieIdx > entreeIdx;
};

const makeId = () => `id-${Date.now()}-${Math.random().toString(36).slice(2)}`;

// ─── Badge ────────────────────────────────────────────────────────────────────

function Badge({ etat }: { etat: string }) {
  if (!etat) return <span className="text-gray-400 text-xs italic">Non renseigné</span>;
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ETAT_COLORS[etat] ?? "bg-gray-100 text-gray-600"}`}>
      {etat}
    </span>
  );
}

// ─── Modal Ajout Pièce ────────────────────────────────────────────────────────
function ModalAjoutPiece({ onClose, onAdd }: { onClose: () => void; onAdd: (nom: string) => void }) {
  const [nom, setNom] = useState("");

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-800">Ajouter une pièce</h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <input
          className="w-full border rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          placeholder="Nom de la pièce..."
          value={nom}
          onChange={e => setNom(e.target.value)}
        />
        <div className="flex flex-wrap gap-2 mb-4">
          {PIECES_SUGGESTIONS.map(s => (
            <button key={s} onClick={() => setNom(s)}
              className="text-xs bg-gray-100 hover:bg-blue-100 text-gray-700 px-3 py-1 rounded-full transition">
              {s}
            </button>
          ))}
        </div>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg border hover:bg-gray-50">Annuler</button>
          <button
            onClick={() => { if (nom.trim()) { onAdd(nom.trim()); onClose(); } }}
            className="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">
            Ajouter
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Modal Ajout Élément ──────────────────────────────────────────────────────
function ModalAjoutElement({ pieceNom, onClose, onAdd }: { pieceNom: string; onClose: () => void; onAdd: (label: string) => void }) {
  const [label, setLabel] = useState("");
  const suggestions = ELEMENTS_SUGGESTIONS[pieceNom] ?? ELEMENTS_SUGGESTIONS["default"];
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-800">Ajouter un élément</h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <input
          className="w-full border rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-blue-300"
          placeholder="Nom de l'élément..."
          value={label}
          onChange={e => setLabel(e.target.value)}
        />
        <div className="flex flex-wrap gap-2 mb-4">
          {suggestions.map(s => (
            <button key={s} onClick={() => setLabel(s)}
              className="text-xs bg-gray-100 hover:bg-blue-100 text-gray-700 px-3 py-1 rounded-full transition">
              {s}
            </button>
          ))}
        </div>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg border hover:bg-gray-50">Annuler</button>
          <button
            onClick={() => { if (label.trim()) { onAdd(label.trim()); onClose(); } }}
            className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700">
            Ajouter
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Carte Élément ────────────────────────────────────────────────────────────
function CarteElement({
  el, mode, onChange, onDelete,
}: {
  el: ElementPiece; mode: "entree" | "sortie" | "comparatif";
  onChange: (updated: ElementPiece) => void;
  onDelete: () => void;
}) {
  const fileRefEntree = useRef<HTMLInputElement>(null);
  const fileRefSortie = useRef<HTMLInputElement>(null);
  const [zoomPhoto, setZoomPhoto] = useState<string | null>(null);

  const handlePhoto = (side: "entree" | "sortie", files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach(file => {
      const url = URL.createObjectURL(file);
      const photo: PhotoElement = { id: makeId(), url, nom: file.name };
      if (side === "entree") {
        onChange({ ...el, photosEntree: [...el.photosEntree, photo] });
      } else {
        onChange({ ...el, photosSortie: [...el.photosSortie, photo] });
      }
    });
  };

  const ecart = hasEcart(el);

  return (
    <div className={`border rounded-xl p-4 mb-3 bg-white shadow-sm ${ecart ? "border-orange-300" : "border-slate-200"}`}>
      {zoomPhoto && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center" onClick={() => setZoomPhoto(null)}>
          <img src={zoomPhoto} className="max-h-[80vh] max-w-[90vw] rounded-xl shadow-2xl" alt="Zoom" />
        </div>
      )}
      <div className="flex justify-between items-center mb-3">
        <span className="font-semibold text-gray-700 text-sm">{el.label}</span>
        <div className="flex items-center gap-2">
          {ecart && <span className="text-xs text-amber-600 font-medium flex items-center gap-1"><AlertCircle size={13} /> Écart</span>}
          <button onClick={onDelete} className="text-gray-400 hover:text-red-500 transition"><Trash2 size={15} /></button>
        </div>
      </div>

      <div className={`grid gap-4 ${mode === "comparatif" ? "grid-cols-2" : "grid-cols-1"}`}>
        {(mode === "entree" || mode === "comparatif") && (
          <div>
            {mode === "comparatif" && <p className="text-xs font-bold text-indigo-600text-blue-600 mb-2 uppercase tracking-wide">Entrée</p>}
            <select
              value={el.etatEntree}
              onChange={e => onChange({ ...el, etatEntree: e.target.value as EtatItem })}
              className="w-full border rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
            >
              <option value="">Sélectionner un état</option>
              {ETATS.map(etat => (
                <option key={etat} value={etat}>{etat}</option>
              ))}
            </select>
            <textarea
              placeholder="Observations..."
              value={el.obsEntree}
              onChange={e => onChange({ ...el, obsEntree: e.target.value })}
              className="w-full border rounded-lg px-2 py-1.5 text-sm mt-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
            <div className="flex flex-wrap gap-2 mb-2">
              {el.photosEntree.map(p => (
                <div key={p.id} className="relative group">
                  <img src={p.url} className="w-14 h-14 object-cover rounded-lg border cursor-pointer" onClick={() => setZoomPhoto(p.url)} alt={p.nom} />
                  <button
                    onClick={() => onChange({ ...el, photosEntree: el.photosEntree.filter(x => x.id !== p.id) })}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}
            </div>
            <input ref={fileRefEntree} type="file" accept="image/*" multiple className="hidden"
              onChange={e => handlePhoto("entree", e.target.files)} />
            <button onClick={() => fileRefEntree.current?.click()}
              className="text-xs text-blue-600 flex items-center gap-1 hover:underline">
              <Camera size={13} /> Ajouter photo
            </button>
          </div>
        )}
        {(mode === "sortie" || mode === "comparatif") && (
          <div>
            {mode === "comparatif" && <p className="text-xs font-bold text-purple-600 mb-2 uppercase tracking-wide">Sortie</p>}
            <select
              value={el.etatSortie}
              onChange={e => onChange({ ...el, etatSortie: e.target.value as EtatItem })}
              className="w-full border rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
            >
              <option value="">Sélectionner un état</option>
              {ETATS.map(etat => (
                <option key={etat} value={etat}>{etat}</option>
              ))}
            </select>
            <textarea
              placeholder="Observations..."
              value={el.obsSortie}
              onChange={e => onChange({ ...el, obsSortie: e.target.value })}
              className="w-full border rounded-lg px-2 py-1.5 text-sm mt-2 resize-none focus:outline-none focus:ring-2 focus:ring-purple-200"
            />
            <div className="flex flex-wrap gap-2 mb-2">
              {el.photosSortie.map(p => (
                <div key={p.id} className="relative group">
                  <img src={p.url} className="w-14 h-14 object-cover rounded-lg border cursor-pointer" onClick={() => setZoomPhoto(p.url)} alt={p.nom} />
                  <button
                    onClick={() => onChange({ ...el, photosSortie: el.photosSortie.filter(x => x.id !== p.id) })}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}
            </div>
            <input ref={fileRefSortie} type="file" accept="image/*" multiple className="hidden"
              onChange={e => handlePhoto("sortie", e.target.files)} />
            <button onClick={() => fileRefSortie.current?.click()}
              className="text-xs text-purple-600 flex items-center gap-1 hover:underline">
              <Camera size={13} /> Ajouter photo
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Section Compteurs ────────────────────────────────────────────────────────
function SectionCompteurs({
  compteurs, mode, update,
}: {
  compteurs: Compteur[];
  mode: "entree" | "sortie" | "comparatif";
  update: (id: string, field: keyof Compteur, value: string) => void;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 mb-6">
      <h3 className="text-base font-bold text-gray-700 flex items-center gap-2 mb-4">
      <Gauge size={18} className="text-indigo-600" /> Compteurs
      </h3>
      <div className="space-y-4">
        {compteurs.map(c => (
          <div key={c.id} className="border rounded-xl p-4">
            <div className="flex justify-between items-start mb-3">
              <span className="font-medium text-gray-700">{c.label}</span>
            </div>
            <div className={`grid gap-3 ${mode === "comparatif" ? "grid-cols-2" : "grid-cols-1"}`}>
              {(mode === "entree" || mode === "comparatif") && (
                <div>
                  {mode === "comparatif" && <p className="text-xs font-bold text-blue-600 mb-1">Entrée</p>}
                  <input
                    type="number"
                    placeholder={`Valeur (${c.unite})`}
                    value={c.valeurEntree}
                    onChange={e => update(c.id, "valeurEntree", e.target.value)}
                    className="w-full border rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>
              )}
              {(mode === "sortie" || mode === "comparatif") && (
                <div>
                  {mode === "comparatif" && <p className="text-xs text-purple-600 font-bold mb-1">Sortie</p>}
                  <input
                    type="number"
                    placeholder={`Valeur (${c.unite})`}
                    value={c.valeurSortie}
                    onChange={e => update(c.id, "valeurSortie", e.target.value)}
                    className="w-full border rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
                  />
                </div>
              )}
            </div>
            {mode === "comparatif" && c.valeurEntree && c.valeurSortie && (
              <p className="text-xs text-gray-500 mt-2">
                Consommation : <span className="font-bold text-gray-700">{(parseFloat(c.valeurSortie) - parseFloat(c.valeurEntree)).toFixed(2)} {c.unite}</span>
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
// ─── Composant Principal ──────────────────────────────────────────────────────
function ListeBiens({
    biens,
    onSelect,
  }: {
    biens: any[];
    onSelect: (bien: any) => void;
  }) {
    return (
      <div className="space-y-4">
        {biens.map((bien) => (
          <button
            key={bien.id}
            onClick={() => onSelect(bien)}
            className="w-full bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:border-blue-400 hover:shadow-md transition text-left"
          >
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-bold text-gray-800">
                  {bien.nom}
                </h2>
  
                <p className="text-sm text-gray-500 mt-1">
                  {bien.adresse}
                </p>
  
                <div className="flex gap-2 mt-3">
                  <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                    {bien.type}
                  </span>
  
                  <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                    {bien.locataire}
                  </span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    );
  }
export default function EtatDesLieux() {
    const [etape, setEtape] = useState("biens");

const [bienSelectionne, setBienSelectionne] = useState<any>(null);
  const [mode, setMode] = useState<"entree" | "sortie" | "comparatif">("entree");
  const [pieces, setPieces] = useState<Piece[]>(PIECES_INIT);
  const [compteurs, setCompteurs] = useState<Compteur[]>(COMPTEURS_INIT);
  const [piecesOuvertes, setPiecesOuvertes] = useState<Record<string, boolean>>({});
  const [modalPiece, setModalPiece] = useState(false);
  const [modalElement, setModalElement] = useState<string | null>(null);
  const [signatureEntree, setSignatureEntree] = useState("");
  const [signatureSortie, setSignatureSortie] = useState("");
  const [locataire] = useState<Locataire>({
    id: 1, nom: "Dupont", prenom: "Marie", bien: "Appartement T3 - Paris 11e",
    bienId: 101, dateEntree: "2024-01-15",
  });

  const togglePiece = (id: string) =>
    setPiecesOuvertes(prev => ({ ...prev, [id]: !prev[id] }));

  const updateElement = (pieceId: string, updated: ElementPiece) => {
    setPieces(prev => prev.map(p =>
      p.id === pieceId
        ? { ...p, elements: p.elements.map(e => e.id === updated.id ? updated : e) }
        : p
    ));
  };

  const deleteElement = (pieceId: string, elId: string) => {
    setPieces(prev => prev.map(p =>
      p.id === pieceId ? { ...p, elements: p.elements.filter(e => e.id !== elId) } : p
    ));
  };

  const addElement = (pieceId: string, label: string) => {
    const newEl: ElementPiece = {
      id: makeId(), label,
      etatEntree: "", obsEntree: "", photosEntree: [],
      etatSortie: "", obsSortie: "", photosSortie: [],
    };
    setPieces(prev => prev.map(p =>
      p.id === pieceId ? { ...p, elements: [...p.elements, newEl] } : p
    ));
  };

  const addPiece = (nom: string) => {
    const newPiece: Piece = { id: makeId(), nom, custom: true, elements: [] };
    setPieces(prev => [...prev, newPiece]);
  };

  const deletePiece = (id: string) => {
    setPieces(prev => prev.filter(p => p.id !== id));
  };

  const updateCompteur = (id: string, field: keyof Compteur, value: string) => {
    setCompteurs(prev => prev.map(c =>
      c.id === id ? { ...c, [field]: value } : c
    ));
  };

  const nbEcarts = pieces.flatMap(p => p.elements).filter(hasEcart).length;

  const nbRenseignes = pieces.flatMap(p => p.elements).filter(e =>
    mode === "entree" ? e.etatEntree : mode === "sortie" ? e.etatSortie : e.etatEntree && e.etatSortie
  ).length;

  const totalElements = pieces.flatMap(p => p.elements).length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">

    {etape === "biens" && (
      <ListeBiens
        biens={BIENS_MOCK}
        onSelect={(bien) => {
          setBienSelectionne(bien);
          setEtape("edl");
        }}
      />
    )}
  
    {etape === "edl" && (
      <>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-30 shadow-sm">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
            <ClipboardList size={22} className="text-indigo-600" />
              <div>
                <h1 className="text-base font-bold text-gray-800">État des lieux</h1>
                <p className="text-xs text-gray-500">{locataire.prenom} {locataire.nom} — {locataire.bien}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {nbEcarts > 0 && (
                <span className="text-xs bg-orange-100 text-orange-700 font-semibold px-2 py-1 rounded-full flex items-center gap-1">
                  <AlertCircle size={12} /> {nbEcarts} écart{nbEcarts > 1 ? "s" : ""}
                </span>
              )}
              <span className="text-xs bg-blue-100 text-blue-700 font-semibold px-2 py-1 rounded-full">
                {nbRenseignes}/{totalElements}
              </span>
            </div>
          </div>

          {/* Tabs mode */}
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
            {(["entree", "sortie", "comparatif"] as const).map(m => (
              <button key={m} onClick={() => setMode(m)}
                className={`flex-1 text-xs font-semibold py-1.5 rounded-lg transition ${mode === m ? "bg-indigo-600 text-white shadow" : "text-slate-500 hover:text-slate-700text-gray-500 hover:text-gray-700"}`}>
                {m === "entree" ? "Entrée" : m === "sortie" ? "Sortie" : "Comparatif"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Pièces */}
        {pieces.map(piece => (
          <div key={piece.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-4">
            <div className="p-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <button onClick={() => togglePiece(piece.id)}>
                    {piecesOuvertes[piece.id] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                  <h2 className="text-lg font-semibold text-gray-800">{piece.nom}</h2>
                  {piece.custom && (
                    <button onClick={() => deletePiece(piece.id)}
                      className="text-gray-400 hover:text-red-500 transition">
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {piecesOuvertes[piece.id] && (
              <div className="px-5 pb-5 border-t border-gray-100 pt-4">
                {piece.elements.map(el => (
                  <CarteElement
                    key={el.id}
                    el={el}
                    mode={mode}
                    onChange={updated => updateElement(piece.id, updated)}
                    onDelete={() => deleteElement(piece.id, el.id)}
                  />
                ))}
                <button
                  onClick={() => setModalElement(piece.id)}
                  className="mt-2 text-sm text-blue-600 flex items-center gap-1 hover:underline">
                  <Plus size={15} /> Ajouter un élément
                </button>
              </div>
            )}
          </div>
        ))}

        {/* Bouton ajouter pièce */}
        <button
          onClick={() => setModalPiece(true)}
          className="w-full border-2 border-dashed border-gray-300 hover:border-blue-400 rounded-2xl py-4 text-sm text-gray-500 hover:text-blue-600 flex items-center justify-center gap-2 transition mb-6">
          <Plus size={18} /> Ajouter une pièce
        </button>

        {/* Compteurs */}
        <SectionCompteurs
          compteurs={compteurs}
          mode={mode}
          update={updateCompteur}
        />

        {/* Signatures */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 mb-6">
          <h3 className="text-base font-bold text-gray-700 flex items-center gap-2 mb-4">
          <PenLine size={18} className="text-indigo-600" /> Signatures
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Bailleur / Propriétaire</p>
              <div className="border-2 border-dashed border-gray-300 rounded-xl h-28 flex items-center justify-center text-gray-400 text-sm">
                Signature ici
              </div>
              <input
                type="text"
                placeholder="Nom et prénom"
                value={signatureEntree}
                onChange={e => setSignatureEntree(e.target.value)}
                className="mt-2 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Locataire</p>
              <div className="border-2 border-dashed border-gray-300 rounded-xl h-28 flex items-center justify-center text-gray-400 text-sm">
                Signature ici
              </div>
              <input
                type="text"
                placeholder="Nom et prénom"
                value={signatureSortie}
                onChange={e => setSignatureSortie(e.target.value)}
                className="mt-2 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Bouton export */}
        <div className="flex justify-end gap-3 mb-8">
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-300 text-sm text-gray-600 hover:bg-slate-50 transition">
            <Printer size={16} /> Imprimer
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm hover:bg-indigo-700 transition">
            <Download size={16} /> Exporter PDF
          </button>
        </div>
      </div>

      {/* Modal ajout pièce */}
      {modalPiece && (
        <ModalAjoutPiece
          onClose={() => setModalPiece(false)}
          onAdd={addPiece}
        />
      )}

      {/* Modal ajout élément */}
      {modalElement && (
        <ModalAjoutElement
          pieceNom={
            pieces.find(p => p.id === modalElement)?.nom ?? "default"
          }
          onClose={() => setModalElement(null)}
          onAdd={(label) => addElement(modalElement, label)}
        />
      )}
          </>
  )}
    </div>
  );
}
