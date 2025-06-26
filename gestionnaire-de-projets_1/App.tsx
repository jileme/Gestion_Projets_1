import React, { useState, useEffect, useCallback } from 'react';
import { GoogleGenAI } from "@google/genai";
import ProjectFilters from './components/ProjectFilters';
import ProjectAddForm from './components/ProjectAddForm';
import ProjectTable from './components/ProjectTable';
import Modal from './components/Modal';
import {
  AppDatabase,
  BddTb1Item,
  BddTb2Item,
  FiltersState,
  AddToBddInputsState,
  NewProjectEntryState,
  ModalState,
  ModalInput,
  ModalIds,
} from './types';
import { loadDatabase, saveDatabase, generateId, addUniqueAndSort, formatMonthYear, parseMonthYear, DB_KEY } from './services/databaseService'; // Import DB_KEY

// Initialize Gemini AI Client (as per general instructions, though not used in this app's core logic)
// IMPORTANT: Ensure process.env.API_KEY is available in your environment.
let ai: GoogleGenAI | null = null;
if (process.env.API_KEY) {
  ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
} else {
  console.warn("API_KEY for Gemini is not set. Gemini related functionalities will not be available.");
}


const initialFiltersState: FiltersState = {
  nomProjet: '',
  typeProjet: '',
  destinationGlobale: '',
  destinationPrecise: '',
  dateEcheance: '',
};

const initialAddToBddInputsState: AddToBddInputsState = {
  newTypeProjet: '',
  newNomProjet: '',
  newDestinationGlobale: '',
  newDestinationPrecise: '',
};

const initialNewProjectEntryState: NewProjectEntryState = {
  id: undefined,
  nomProjet: '',
  typeProjet: '',
  destinationGlobale: '',
  destinationPrecise: '',
  description: '',
  travailEnCours: '',
  dateEcheance: '',
  commentaires: '',
};


const App: React.FC = () => {
  const [db, setDb] = useState<AppDatabase>(loadDatabase());
  const [filters, setFilters] = useState<FiltersState>(initialFiltersState);
  const [addToBddInputs, setAddToBddInputs] = useState<AddToBddInputsState>(initialAddToBddInputsState);
  const [newProjectEntry, setNewProjectEntry] = useState<NewProjectEntryState>(initialNewProjectEntryState);
  const [gtbData, setGtbData] = useState<BddTb1Item[]>([]);
  const [modalState, setModalState] = useState<ModalState>({ isOpen: false, title: '' });
  const [editingProjectId, setEditingProjectId] = useState<string | undefined>(undefined);
  const [contactForSelectedPrecise, setContactForSelectedPrecise] = useState<BddTb2Item | null>(null);

  useEffect(() => {
    saveDatabase(db);
  }, [db]);

  useEffect(() => {
    // Update contact display when filter for destinationPrecise changes
    if (filters.destinationPrecise) {
      const contact = db.bddTb2_Destinations.find(
        (d) => d.destinationPrecise === filters.destinationPrecise &&
               (filters.destinationGlobale ? d.destinationGlobale === filters.destinationGlobale : true)
      );
      setContactForSelectedPrecise(contact || null);
    } else {
      setContactForSelectedPrecise(null);
    }
  }, [filters.destinationPrecise, filters.destinationGlobale, db.bddTb2_Destinations]);


  const updateDb = (newDb: Partial<AppDatabase>) => {
    setDb(prevDb => ({ ...prevDb, ...newDb }));
  };

  const handleFilterChange = <K extends keyof FiltersState>(key: K, value: FiltersState[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setGtbData([]); // Clear GTB on filter change
  };

  const handleAddToBddInputChange = <K extends keyof AddToBddInputsState>(key: K, value: AddToBddInputsState[K]) => {
    setAddToBddInputs(prev => ({ ...prev, [key]: value }));
  };

  const handleNewProjectEntryChange = <K extends keyof NewProjectEntryState>(key: K, value: NewProjectEntryState[K]) => {
    setNewProjectEntry(prev => ({ ...prev, [key]: value }));
  };
  
  const handleClearFiltersAndInputs = () => { // BT_0
    setFilters(initialFiltersState);
    setAddToBddInputs(initialAddToBddInputsState);
    setNewProjectEntry(initialNewProjectEntryState);
    setEditingProjectId(undefined);
    setGtbData([]);
    setModalState({ isOpen: true, title: 'Effacement terminé', message: 'Tous les filtres et champs de saisie ont été réinitialisés.', onConfirm: closeModal });
  };

  const handleUpdateTable = useCallback(() => { // MiseAJour_GTB
    let filteredProjects = [...db.bddTb1_Projects];
    if (filters.typeProjet) {
      filteredProjects = filteredProjects.filter(p => p.typeProjet === filters.typeProjet);
    }
    if (filters.nomProjet) {
      filteredProjects = filteredProjects.filter(p => p.nomProjet === filters.nomProjet);
    }
    if (filters.destinationGlobale) {
      filteredProjects = filteredProjects.filter(p => p.destinationGlobale === filters.destinationGlobale);
    }
    if (filters.destinationPrecise) {
      filteredProjects = filteredProjects.filter(p => p.destinationPrecise === filters.destinationPrecise);
    }
    if (filters.dateEcheance) {
      filteredProjects = filteredProjects.filter(p => p.dateEcheance === filters.dateEcheance);
    }
    setGtbData(filteredProjects);
  }, [db.bddTb1_Projects, filters]); // Added dependencies to useCallback

  useEffect(() => { // Auto-update table when db changes and filters are present
    if(Object.values(filters).some(f => f !== '')) {
      handleUpdateTable();
    }
  }, [db, filters, handleUpdateTable]);


  const closeModal = () => setModalState({ isOpen: false, title: '' });

  // BT_1 to BT_4: Delete item from filter source list and related data
  const handleDeleteFilterItem = (filterKey: keyof FiltersState) => {
    const selectedValue = filters[filterKey];
    if (!selectedValue) {
      setModalState({ isOpen: true, title: 'Erreur', message: 'Vous n\'avez rien sélectionné.', onConfirm: closeModal, confirmText: 'OK' });
      return;
    }

    let confirmMessage = '';
    let action: () => void = () => {};

    switch (filterKey) {
      case 'typeProjet': // BT_1
        confirmMessage = `Etes-vous sûr de vouloir supprimer le type de projet "${selectedValue}" ? Cela supprimera aussi les projets associés.`;
        action = () => {
          const newBdd1 = db.bdd1_TypeProjet.filter(item => item !== selectedValue);
          const newTb1 = db.bddTb1_Projects.filter(p => p.typeProjet !== selectedValue);
          updateDb({ bdd1_TypeProjet: newBdd1, bddTb1_Projects: newTb1 });
          handleFilterChange('typeProjet', '');
        };
        break;
      case 'nomProjet': // BT_2
        confirmMessage = `Etes-vous sûr de vouloir supprimer le nom de projet "${selectedValue}" ? Cela supprimera aussi les projets associés.`;
        action = () => {
          const newBdd2 = db.bdd2_NomProjet.filter(item => item !== selectedValue);
          const newTb1 = db.bddTb1_Projects.filter(p => p.nomProjet !== selectedValue);
          updateDb({ bdd2_NomProjet: newBdd2, bddTb1_Projects: newTb1 });
          handleFilterChange('nomProjet', '');
        };
        break;
      case 'destinationGlobale': // BT_3
        confirmMessage = `Etes-vous sûr de vouloir supprimer la destination globale "${selectedValue}" ? Cela supprimera les projets et destinations précises associées.`;
        action = () => {
          const newBdd3 = db.bdd3_DestinationGlobale.filter(item => item !== selectedValue);
          const newTb1 = db.bddTb1_Projects.filter(p => p.destinationGlobale !== selectedValue);
          const newTb2 = db.bddTb2_Destinations.filter(d => d.destinationGlobale !== selectedValue);
          updateDb({ bdd3_DestinationGlobale: newBdd3, bddTb1_Projects: newTb1, bddTb2_Destinations: newTb2 });
          handleFilterChange('destinationGlobale', '');
          handleFilterChange('destinationPrecise', ''); 
        };
        break;
      case 'destinationPrecise': // BT_4
        confirmMessage = `Etes-vous sûr de vouloir supprimer la destination précise "${selectedValue}" ? Cela supprimera les projets associés et l'entrée dans les contacts.`;
        action = () => {
          // Only delete if it matches the global destination if one is selected, or any if no global is selected.
          const newTb1 = db.bddTb1_Projects.filter(p => 
            !(p.destinationPrecise === selectedValue && (!filters.destinationGlobale || p.destinationGlobale === filters.destinationGlobale))
          );
          const newTb2 = db.bddTb2_Destinations.filter(d => 
            !(d.destinationPrecise === selectedValue && (!filters.destinationGlobale || d.destinationGlobale === filters.destinationGlobale))
          );
          updateDb({ bddTb1_Projects: newTb1, bddTb2_Destinations: newTb2 });
          handleFilterChange('destinationPrecise', '');
        };
        break;
      default: return;
    }
    setModalState({ isOpen: true, title: 'Confirmation de suppression', message: confirmMessage, onConfirm: () => { action(); closeModal(); handleUpdateTable(); }, onCancel: closeModal });
  };
  
  // BT_5 to BT_8: Add item to BDD lists
  const handleAddBddItem = (inputKey: keyof AddToBddInputsState) => {
    const value = addToBddInputs[inputKey];
    if (!value.trim()) {
      let msg = '';
      if(inputKey === 'newTypeProjet') msg = "Vous n'avez écrit aucun type de projet";
      else if(inputKey === 'newNomProjet') msg = "Vous n'avez écrit aucun nom de projet";
      else if(inputKey === 'newDestinationGlobale') msg = "Vous n'avez écrit aucune destination globale";
      else if(inputKey === 'newDestinationPrecise') msg = "Vous n'avez écrit aucune destination précise";
      setModalState({ isOpen: true, title: 'Erreur', message: msg, onConfirm: closeModal, confirmText:'OK' });
      return;
    }

    let confirmMessage = `Vous voulez ajouter "${value}" ?`;
    let action = () => {};

    switch (inputKey) {
      case 'newTypeProjet': // BT_5
        action = () => {
          updateDb({ bdd1_TypeProjet: addUniqueAndSort(db.bdd1_TypeProjet, value) });
          handleAddToBddInputChange('newTypeProjet', '');
        };
        break;
      case 'newNomProjet': // BT_6
         action = () => {
          updateDb({ bdd2_NomProjet: addUniqueAndSort(db.bdd2_NomProjet, value) });
          handleAddToBddInputChange('newNomProjet', '');
        };
        break;
      case 'newDestinationGlobale': // BT_7
        action = () => {
          updateDb({ bdd3_DestinationGlobale: addUniqueAndSort(db.bdd3_DestinationGlobale, value) });
          handleAddToBddInputChange('newDestinationGlobale', '');
        };
        break;
      case 'newDestinationPrecise': // BT_8
        // This is a multi-step process
        const destPreciseValue = addToBddInputs.newDestinationPrecise;
        setModalState({
            isOpen: true,
            title: 'Ajouter Destination Précise (1/3)',
            message: `Vous voulez ajouter "${destPreciseValue}". Quelle destination globale ?`,
            inputs: [{ id: 'REP1', label: 'Destination Globale', value: '', required: true, options: db.bdd3_DestinationGlobale }],
            onConfirm: (step1Data) => {
                const REP1 = step1Data?.REP1;
                if (!REP1) return; 
                setModalState({
                    isOpen: true,
                    title: 'Ajouter Destination Précise (2/3)',
                    message: `Destination Globale: ${REP1}. Quel nom de contact ? (Optionnel)`,
                    inputs: [{ id: 'REP2', label: 'Nom Contact', value: '' }],
                    onConfirm: (step2Data) => {
                        const REP2 = step2Data?.REP2 || '';
                        setModalState({
                            isOpen: true,
                            title: 'Ajouter Destination Précise (3/3)',
                            message: `Nom Contact: ${REP2 || 'N/A'}. Quel contact (email/tel) ? (Optionnel)`,
                            inputs: [{ id: 'REP3', label: 'Info Contact', value: '' }],
                            onConfirm: (step3Data) => {
                                const REP3 = step3Data?.REP3 || '';
                                const newTb2Entry: BddTb2Item = {
                                    id: generateId(),
                                    destinationGlobale: REP1,
                                    destinationPrecise: destPreciseValue,
                                    nomContact: REP2,
                                    contactInfo: REP3,
                                };
                                updateDb({ bddTb2_Destinations: [...db.bddTb2_Destinations, newTb2Entry] });
                                handleAddToBddInputChange('newDestinationPrecise', '');
                                closeModal();
                                setModalState({ isOpen: true, title: 'Succès', message: `Destination précise "${destPreciseValue}" ajoutée.`, onConfirm: closeModal, confirmText: 'OK'});
                            },
                            onCancel: closeModal,
                        });
                    },
                    onCancel: closeModal,
                });
            },
            onCancel: closeModal,
        });
        return; // Skip generic confirm modal
    }
     setModalState({ isOpen: true, title: 'Confirmation', message: confirmMessage, onConfirm: () => { action(); closeModal(); }, onCancel: closeModal });
  };
  
  // LR Form (New Project Entry) - BT_9
  const handleSubmitNewProject = () => {
    // Basic validation
    if (!newProjectEntry.nomProjet || !newProjectEntry.typeProjet || !newProjectEntry.destinationGlobale || !newProjectEntry.destinationPrecise || !newProjectEntry.dateEcheance) {
        setModalState({ isOpen: true, title: 'Erreur de saisie', message: 'Veuillez remplir tous les champs obligatoires (Nom, Type, Destinations, Date Échéance).', onConfirm: closeModal, confirmText:'OK'});
        return;
    }
    
    const projectData: BddTb1Item = {
      id: editingProjectId || generateId(),
      nomProjet: newProjectEntry.nomProjet,
      typeProjet: newProjectEntry.typeProjet,
      destinationGlobale: newProjectEntry.destinationGlobale,
      destinationPrecise: newProjectEntry.destinationPrecise,
      dateEcheance: newProjectEntry.dateEcheance, 
      description: newProjectEntry.description,
      travailEnCours: newProjectEntry.travailEnCours,
      commentaires: newProjectEntry.commentaires,
    };

    let updatedProjects: BddTb1Item[];
    if (editingProjectId) {
      updatedProjects = db.bddTb1_Projects.map(p => p.id === editingProjectId ? projectData : p);
    } else {
      updatedProjects = [...db.bddTb1_Projects, projectData];
    }

    const newBdd4 = addUniqueAndSort(db.bdd4_DateEcheance, projectData.dateEcheance);
    
    updateDb({ bddTb1_Projects: updatedProjects, bdd4_DateEcheance: newBdd4 });
    setNewProjectEntry(initialNewProjectEntryState);
    setEditingProjectId(undefined);
    // handleUpdateTable(); // Refresh GTB will be handled by useEffect on db change
    setModalState({ isOpen: true, title: 'Succès', message: `Projet ${editingProjectId ? 'modifié' : 'ajouté'} avec succès.`, onConfirm: closeModal, confirmText:'OK'});
  };

  // GTB Actions
  const handleEditGtbRow = (project: BddTb1Item) => {
    setNewProjectEntry({ ...project }); 
    setEditingProjectId(project.id);
    const formElement = document.getElementById('project-add-form-section');
    if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleDeleteGtbRow = (projectId: string) => {
    setModalState({
      isOpen: true,
      title: 'Confirmation de suppression',
      message: 'Etes-vous sûr de vouloir supprimer cette ligne de projet ?',
      onConfirm: () => {
        const updatedProjects = db.bddTb1_Projects.filter(p => p.id !== projectId);
        updateDb({ bddTb1_Projects: updatedProjects });
        // handleUpdateTable(); // Refresh GTB will be handled by useEffect on db change
        closeModal();
      },
      onCancel: closeModal,
    });
  };
  
  const getFilteredDestPreciseOptions = useCallback((globalDest?: string): string[] => {
    if (globalDest) {
      return [...new Set(db.bddTb2_Destinations
        .filter(d => d.destinationGlobale === globalDest)
        .map(d => d.destinationPrecise))].sort();
    }
    return [...new Set(db.bddTb2_Destinations.map(d => d.destinationPrecise))].sort();
  }, [db.bddTb2_Destinations]);

  const handleExportTableToDoc = () => {
    if (!gtbData.length) {
      setModalState({ isOpen: true, title: 'Exportation impossible', message: 'Le tableau est vide. Veuillez appliquer des filtres et mettre à jour le tableau.', onConfirm: closeModal, confirmText: 'OK' });
      return;
    }

    const tableHeaders = [
      'Nom projet', 'Type projet', 'Destination globale', 'Destination précise',
      'Description', 'Travail en cours', 'Date échéance', 'Commentaires'
    ];

    let htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>Export Tableau Projets</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #dddddd; text-align: left; padding: 8px; word-break: break-word; }
          th { background-color: #f2f2f2; }
          @page WordSection1 {
            size: A4 landscape; 
            mso-page-orientation: landscape;
            margin: 0.5in 0.5in 0.5in 0.5in; /* Adjusted margins for A4 landscape */
          }
          div.WordSection1 { page:WordSection1; }
        </style>
      </head>
      <body>
        <div class="WordSection1">
          <h2>Tableau des Projets</h2>
          <table>
            <thead>
              <tr>${tableHeaders.map(header => `<th>${header}</th>`).join('')}</tr>
            </thead>
            <tbody>
    `;

    gtbData.forEach(project => {
      htmlContent += '<tr>';
      htmlContent += `<td>${project.nomProjet || ''}</td>`;
      htmlContent += `<td>${project.typeProjet || ''}</td>`;
      htmlContent += `<td>${project.destinationGlobale || ''}</td>`;
      htmlContent += `<td>${project.destinationPrecise || ''}</td>`;
      htmlContent += `<td>${project.description || ''}</td>`;
      htmlContent += `<td>${project.travailEnCours || ''}</td>`;
      htmlContent += `<td>${project.dateEcheance || ''}</td>`;
      htmlContent += `<td>${project.commentaires || ''}</td>`;
      htmlContent += '</tr>';
    });

    htmlContent += `
            </tbody>
          </table>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'application/msword' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'tableau_projets.doc';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);

    setModalState({ isOpen: true, title: 'Succès', message: 'Tableau exporté avec succès en fichier .doc.', onConfirm: closeModal, confirmText: 'OK' });
  };

  const handleExportDatabase = () => {
    try {
      const dbString = localStorage.getItem(DB_KEY);
      if (!dbString) {
        setModalState({ isOpen: true, title: 'Erreur', message: 'Aucune base de données à exporter.', onConfirm: closeModal, confirmText: 'OK' });
        return;
      }
      const blob = new Blob([dbString], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      link.download = `gestionProjetsDB_backup_${timestamp}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
      setModalState({ isOpen: true, title: 'Succès', message: 'Base de données exportée avec succès.', onConfirm: closeModal, confirmText: 'OK' });
    } catch (error) {
      console.error("Erreur lors de l'exportation de la BDD:", error);
      setModalState({ isOpen: true, title: 'Erreur', message: `Échec de l'exportation de la base de données: ${error instanceof Error ? error.message : String(error)}`, onConfirm: closeModal, confirmText: 'OK' });
    }
  };

  const handleImportDatabase = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setModalState({ isOpen: true, title: 'Erreur', message: 'Aucun fichier sélectionné.', onConfirm: closeModal, confirmText: 'OK' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        if (!content) {
          throw new Error("Le fichier est vide ou illisible.");
        }
        // Basic validation: Is it JSON? Does it have some expected top-level keys?
        const parsedDb = JSON.parse(content);
        if (typeof parsedDb === 'object' && parsedDb !== null && 
            'bdd1_TypeProjet' in parsedDb && 'bddTb1_Projects' in parsedDb && 'bddTb2_Destinations' in parsedDb) {
          
          localStorage.setItem(DB_KEY, content); // Save imported content to localStorage
          setDb(loadDatabase()); // Reload database into state from localStorage
          setFilters(initialFiltersState); // Reset filters
          setGtbData([]); // Clear current table
          // handleUpdateTable(); // Update table with new data - now handled by useEffect on db change
          setModalState({ isOpen: true, title: 'Succès', message: 'Base de données importée avec succès. Les filtres ont été réinitialisés.', onConfirm: closeModal, confirmText: 'OK' });
        } else {
          throw new Error("Le fichier ne semble pas être une base de données valide pour cette application.");
        }
      } catch (error) {
        console.error("Erreur lors de l'importation de la BDD:", error);
        setModalState({ isOpen: true, title: 'Erreur d\'importation', message: `Échec de l'importation: ${error instanceof Error ? error.message : String(error)}`, onConfirm: closeModal, confirmText: 'OK' });
      } finally {
        // Reset file input value so the same file can be selected again if needed
        if (event.target) {
          event.target.value = '';
        }
      }
    };
    reader.onerror = () => {
       setModalState({ isOpen: true, title: 'Erreur de lecture', message: 'Impossible de lire le fichier.', onConfirm: closeModal, confirmText: 'OK' });
       if (event.target) {
          event.target.value = '';
        }
    };
    reader.readAsText(file);
  };


  return (
    <div className="container mx-auto p-4" id="app-container">
      <div className="no-print">
        <ProjectFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          addToBddInputs={addToBddInputs}
          onAddToBddInputChange={handleAddToBddInputChange}
          db={db}
          onClearFilters={handleClearFiltersAndInputs}
          onUpdateTable={handleUpdateTable}
          onDeleteFilterItem={handleDeleteFilterItem}
          onAddBddItem={handleAddBddItem}
          getFilteredDestPreciseOptions={getFilteredDestPreciseOptions}
          contactForSelectedPrecise={contactForSelectedPrecise}
          onExportTableToDoc={handleExportTableToDoc}
          onExportDatabase={handleExportDatabase} // Pass export BDD function
          onImportDatabase={handleImportDatabase} // Pass import BDD function
        />
      </div>
      
      <div id="project-add-form-section" className="no-print">
        <ProjectAddForm
            entry={newProjectEntry}
            onEntryChange={handleNewProjectEntryChange}
            onSubmit={handleSubmitNewProject}
            db={db}
            getFilteredDestPreciseOptions={getFilteredDestPreciseOptions}
            isEditing={!!editingProjectId}
        />
      </div>

      <div id="project-table-printable-area">
        <ProjectTable
          projects={gtbData}
          onEdit={handleEditGtbRow}
          onDelete={handleDeleteGtbRow}
        />
      </div>

      <div className="no-print">
        <Modal {...modalState} />
      </div>
    </div>
  );
};

export default App;