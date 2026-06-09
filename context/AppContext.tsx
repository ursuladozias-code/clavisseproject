"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";

// =====================
// TYPES
// =====================
export type Garant = {
  nom: string;
  prenom: string;
  dateNaissance: string;
  lieuNaissance: string;
  nationalite: string;
  adresse: string;
  email: string;
  telephone: string;
  profession: string;
};

export type Colocataire = {
  nom: string;
  prenom: string;
};

export type Locataire = {
  id: number;
  nom: string;
  prenom: string;
  dateNaissance: string;
  lieuNaissance: string;
  nationalite: string;
  adresseActuelle: string;
  email: string;
  telephone: string;
  profession: string;
  situationMatrimoniale: string;
  colocataires: Colocataire[];
  hasGarant: boolean;
  garant: Garant | null;
  notation: "Parfait" | "Moyen" | "Mauvais" | null;
  bienId: number | null;
  bailId: number | null;
};

export type Bien = {
  id: number;
  nom: string;
  type: string;
  adresse: string;
  ville: string;
  codePostal: string;
  surface: number;
  pieces: number;
  loyer: number;
  charges: number;
  statut: "Loué" | "Vacant" | "Travaux";
  locataireId: number | null;
  bailId: number | null;
  description: string;
  dateAcquisition: string;
  valeurBien: number;
  taxeFonciere: number;
  assurance: string;
  numeroLot: string;
  diag: {
    dpe: string;
    ges: string;
    dateValidite: string;
  };
};

export type Bail = {
  id: number;
  type: "Habitation" | "Commercial" | "Professionnel" | "Agricole" | "Autre";
  bienId: number;
  locataireId: number;
  dateEntree: string;
  dateFin: string;
  loyer: number;
  charges: number;
  depot: number;
  statut: "Actif" | "Résilié" | "Expiré";
  indexation: boolean;
  indiceRef: string;
  clausesParticulieres: string;
};

export type Depot = {
  id: number;
  locataireId: number;
  bailId: number;
  bienId: number;
  montant: number;
  dateVersement: string;
  dateRestitution: string | null;
  statut: "Versé" | "Restitué" | "Litige";
  montantRetenu: number;
  motifRetenue: string;
};

// =====================
// CONTEXT TYPE
// =====================
type AppContextType = {
  biens: Bien[];
  locataires: Locataire[];
  baux: Bail[];
  depots: Depot[];

  addBien: (b: Omit<Bien, "id">) => void;
  updateBien: (b: Bien) => void;
  deleteBien: (id: number) => void;
  getBienById: (id: number) => Bien | undefined;

  addLocataire: (l: Omit<Locataire, "id">) => void;
  updateLocataire: (l: Locataire) => void;
  deleteLocataire: (id: number) => void;
  getLocataireById: (id: number) => Locataire | undefined;

  addBail: (b: Omit<Bail, "id">) => void;
  updateBail: (b: Bail) => void;
  deleteBail: (id: number) => void;
  getBailById: (id: number) => Bail | undefined;
  getBailByLocataire: (locataireId: number) => Bail | undefined;
  getBailByBien: (bienId: number) => Bail | undefined;

  addDepot: (d: Omit<Depot, "id">) => void;
  updateDepot: (d: Depot) => void;
  deleteDepot: (id: number) => void;
  getDepotByLocataire: (locataireId: number) => Depot | undefined;
  getDepotByBail: (bailId: number) => Depot | undefined;

  getLocataireAvecBienEtBail: (locataireId: number) => {
    locataire: Locataire | undefined;
    bien: Bien | undefined;
    bail: Bail | undefined;
    depot: Depot | undefined;
  };
};

// =====================
// CONTEXT
// =====================
const AppContext = createContext<AppContextType | undefined>(undefined);

// =====================
// PROVIDER
// =====================
export function AppProvider({ children }: { children: ReactNode }) {
  const [biens, setBiens] = useState<Bien[]>([]);
  const [locataires, setLocataires] = useState<Locataire[]>([]);
  const [baux, setBaux] = useState<Bail[]>([]);
  const [depots, setDepots] = useState<Depot[]>([]);

  // BIENS
  const addBien = (b: Omit<Bien, "id">) =>
    setBiens((prev) => [...prev, { ...b, id: Date.now() }]);
  const updateBien = (b: Bien) =>
    setBiens((prev) => prev.map((x) => (x.id === b.id ? b : x)));
  const deleteBien = (id: number) =>
    setBiens((prev) => prev.filter((x) => x.id !== id));
  const getBienById = (id: number) => biens.find((x) => x.id === id);

  // LOCATAIRES
  const addLocataire = (l: Omit<Locataire, "id">) =>
    setLocataires((prev) => [...prev, { ...l, id: Date.now() }]);
  const updateLocataire = (l: Locataire) =>
    setLocataires((prev) => prev.map((x) => (x.id === l.id ? l : x)));
  const deleteLocataire = (id: number) =>
    setLocataires((prev) => prev.filter((x) => x.id !== id));
  const getLocataireById = (id: number) => locataires.find((x) => x.id === id);

  // BAUX
  const addBail = (b: Omit<Bail, "id">) =>
    setBaux((prev) => [...prev, { ...b, id: Date.now() }]);
  const updateBail = (b: Bail) =>
    setBaux((prev) => prev.map((x) => (x.id === b.id ? b : x)));
  const deleteBail = (id: number) =>
    setBaux((prev) => prev.filter((x) => x.id !== id));
  const getBailById = (id: number) => baux.find((x) => x.id === id);
  const getBailByLocataire = (locataireId: number) =>
    baux.find((x) => x.locataireId === locataireId);
  const getBailByBien = (bienId: number) =>
    baux.find((x) => x.bienId === bienId);

  // DEPOTS
  const addDepot = (d: Omit<Depot, "id">) =>
    setDepots((prev) => [...prev, { ...d, id: Date.now() }]);
  const updateDepot = (d: Depot) =>
    setDepots((prev) => prev.map((x) => (x.id === d.id ? d : x)));
  const deleteDepot = (id: number) =>
    setDepots((prev) => prev.filter((x) => x.id !== id));
  const getDepotByLocataire = (locataireId: number) =>
    depots.find((x) => x.locataireId === locataireId);
  const getDepotByBail = (bailId: number) =>
    depots.find((x) => x.bailId === bailId);

  // HELPER
  const getLocataireAvecBienEtBail = (locataireId: number) => {
    const locataire = getLocataireById(locataireId);
    const bail = getBailByLocataire(locataireId);
    const bien = bail ? getBienById(bail.bienId) : undefined;
    const depot = getDepotByLocataire(locataireId);
    return { locataire, bien, bail, depot };
  };

  return (
    <AppContext.Provider
      value={{
        biens,
        locataires,
        baux,
        depots,
        addBien, updateBien, deleteBien, getBienById,
        addLocataire, updateLocataire, deleteLocataire, getLocataireById,
        addBail, updateBail, deleteBail, getBailById, getBailByLocataire, getBailByBien,
        addDepot, updateDepot, deleteDepot, getDepotByLocataire, getDepotByBail,
        getLocataireAvecBienEtBail,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

// =====================
// HOOK
// =====================
export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
}
