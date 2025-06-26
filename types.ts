
export interface BddTb1Item {
  id: string;
  nomProjet: string;
  typeProjet: string;
  destinationGlobale: string;
  destinationPrecise: string;
  dateEcheance: string; // MM/YYYY
  description: string;
  travailEnCours: string;
  commentaires: string;
}

export interface BddTb2Item {
  id: string;
  destinationGlobale: string;
  destinationPrecise: string;
  nomContact: string;
  contactInfo: string;
}

export interface FiltersState {
  nomProjet: string; // Case_ZL2
  typeProjet: string; // Case_ZL1
  destinationGlobale: string; // Case_ZL3
  destinationPrecise: string; // Case_ZL4
  dateEcheance: string; // Case_ZL5 (MM/YYYY)
}

export interface AddToBddInputsState {
  newTypeProjet: string; // Case_ZZ1
  newNomProjet: string; // Case_ZZ2
  newDestinationGlobale: string; // Case_ZZ3
  newDestinationPrecise: string; // Case_ZZ4
}

export interface NewProjectEntryState {
  id?: string; // For identifying project being edited
  nomProjet: string; // Case_ZL6
  typeProjet: string; // Case_ZL7
  destinationGlobale: string; // Case_ZL8
  destinationPrecise: string; // Case_ZL9
  description: string; // Case_ZT1
  travailEnCours: string; // Case_ZT2
  dateEcheance: string; // Case_ZL10 (MM/YYYY)
  commentaires: string; // Case_ZT3
}

export interface ModalInput {
  id: string;
  label: string;
  value: string;
  type?: 'text' | 'month';
  required?: boolean;
  options?: string[]; // For select type
}

export interface ModalState {
  isOpen: boolean;
  title: string;
  message?: string;
  content?: React.ReactNode; // For more complex content
  inputs?: ModalInput[];
  onConfirm?: (inputs?: Record<string, string>) => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
}

export interface AppDatabase {
  bdd1_TypeProjet: string[];
  bdd2_NomProjet: string[];
  bdd3_DestinationGlobale: string[];
  bdd4_DateEcheance: string[]; // Unique MM/YYYY strings
  bddTb1_Projects: BddTb1Item[];
  bddTb2_Destinations: BddTb2Item[];
}

export enum ModalIds {
  CONFIRM_DELETE_TYPE_PROJET = 'CONFIRM_DELETE_TYPE_PROJET',
  CONFIRM_DELETE_NOM_PROJET = 'CONFIRM_DELETE_NOM_PROJET',
  CONFIRM_DELETE_DEST_GLOBALE = 'CONFIRM_DELETE_DEST_GLOBALE',
  CONFIRM_DELETE_DEST_PRECISE = 'CONFIRM_DELETE_DEST_PRECISE',
  ADD_TYPE_PROJET = 'ADD_TYPE_PROJET',
  ADD_NOM_PROJET = 'ADD_NOM_PROJET',
  ADD_DEST_GLOBALE = 'ADD_DEST_GLOBALE',
  ADD_DEST_PRECISE_STEP_1 = 'ADD_DEST_PRECISE_STEP_1',
  ADD_DEST_PRECISE_STEP_2 = 'ADD_DEST_PRECISE_STEP_2',
  ADD_DEST_PRECISE_STEP_3 = 'ADD_DEST_PRECISE_STEP_3',
  CONFIRM_DELETE_GTB_ROW = 'CONFIRM_DELETE_GTB_ROW',
  EDIT_GTB_ROW = 'EDIT_GTB_ROW',
  ALERT_NO_CHANGE = 'ALERT_NO_CHANGE',
  ALERT_NOTHING_SELECTED = 'ALERT_NOTHING_SELECTED',
  ALERT_EMPTY_INPUT = 'ALERT_EMPTY_INPUT',
  ALERT_SUCCESS = 'ALERT_SUCCESS',
}
    