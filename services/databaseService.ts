import { AppDatabase, BddTb1Item, BddTb2Item } from '../types';

export const DB_KEY = 'gestionProjetsDB'; // Export DB_KEY

const initialDatabase: AppDatabase = {
  bdd1_TypeProjet: ['Type A', 'Type B', 'Urgent'],
  bdd2_NomProjet: ['Alpha', 'Beta', 'Gamma'],
  bdd3_DestinationGlobale: ['Europe', 'Asie', 'Amérique'],
  bdd4_DateEcheance: ['06/2024', '12/2024', '03/2025'],
  bddTb1_Projects: [
    { id: 'proj1', nomProjet: 'Alpha', typeProjet: 'Type A', destinationGlobale: 'Europe', destinationPrecise: 'Paris', dateEcheance: '12/2024', description: 'Développement initial', travailEnCours: 'Phase 1', commentaires: 'RAS' },
    { id: 'proj2', nomProjet: 'Beta', typeProjet: 'Type B', destinationGlobale: 'Asie', destinationPrecise: 'Tokyo', dateEcheance: '03/2025', description: 'Extension fonctionnalités', travailEnCours: 'Analyse', commentaires: 'Attente validation' },
  ],
  bddTb2_Destinations: [
    { id: 'dest1', destinationGlobale: 'Europe', destinationPrecise: 'Paris', nomContact: 'Jean Dupont', contactInfo: 'jean.dupont@example.com' },
    { id: 'dest2', destinationGlobale: 'Asie', destinationPrecise: 'Tokyo', nomContact: 'Yoko Tanaka', contactInfo: 'yoko.tanaka@example.com' },
    { id: 'dest3', destinationGlobale: 'Europe', destinationPrecise: 'Berlin', nomContact: 'Hans Müller', contactInfo: 'hans.muller@example.com' },
  ],
};

export const loadDatabase = (): AppDatabase => {
  const data = localStorage.getItem(DB_KEY);
  if (data) {
    try {
      const parsedData = JSON.parse(data);
      // Basic validation if parsedData is a valid AppDatabase structure
      if (typeof parsedData === 'object' && parsedData !== null &&
          Array.isArray(parsedData.bdd1_TypeProjet) &&
          Array.isArray(parsedData.bdd2_NomProjet) &&
          Array.isArray(parsedData.bdd3_DestinationGlobale) &&
          Array.isArray(parsedData.bdd4_DateEcheance) &&
          Array.isArray(parsedData.bddTb1_Projects) &&
          Array.isArray(parsedData.bddTb2_Destinations)) {
        return parsedData;
      } else {
        console.warn('Invalid data structure in localStorage, reinitializing database.');
        saveDatabase(initialDatabase);
        return initialDatabase;
      }
    } catch (error) {
      console.error('Failed to parse database from localStorage, reinitializing:', error);
      saveDatabase(initialDatabase);
      return initialDatabase;
    }
  }
  // Initialize with some default data if nothing in localStorage
  saveDatabase(initialDatabase);
  return initialDatabase;
};

export const saveDatabase = (db: AppDatabase): void => {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
};

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

// Helper to add unique items to a list and sort
export const addUniqueAndSort = (list: string[], item: string): string[] => {
  if (item && !list.includes(item)) {
    return [...list, item].sort((a,b) => a.localeCompare(b)); // Added localeCompare for better sorting
  }
  return list;
};

// Helper to format date MM/YYYY for consistency
export const formatMonthYear = (dateStr: string): string => {
  if (!dateStr) return '';
  // Assuming dateStr is YYYY-MM from input type="month"
  const [year, month] = dateStr.split('-');
  if (year && month) {
    return `${month}/${year}`;
  }
  return ''; // Return empty if format is not as expected
};

export const parseMonthYear = (mmYYYY: string): string => {
  if (!mmYYYY || !mmYYYY.includes('/')) return '';
  const [month, year] = mmYYYY.split('/');
  if (year && month) {
    return `${year}-${month.padStart(2, '0')}`; // Format for input type="month", ensure month is 2 digits
  }
  return ''; // Return empty if format is not as expected
};