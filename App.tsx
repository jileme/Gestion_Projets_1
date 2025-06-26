import React, { useState, useEffect, useCallback } from 'react';
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
import { loadDatabase, saveDatabase, generateId, addUniqueAndSort, formatMonthYear, parseMonthYear } from './services/databaseService';

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

  const handleUpdateTable = () => { // MiseAJour_GTB
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
  };

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
          const newTb1 = db.bddTb1_Projects.filter(p => p.destinationPrecise !== selectedValue || (filters.destinationGlobale && p.destinationGlobale !== filters.destinationGlobale));
          // Also remove from Bdd_TB2
          const newTb2 = db.bddTb2_Destinations.filter(d => d.destinationPrecise !== selectedValue || (filters.destinationGlobale && d.destinationGlobale !== filters.destinationGlobale));
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
                if (!REP1) return; // Modal validation handles this
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
      dateEcheance: newProjectEntry.dateEcheance, // Already MM/YYYY
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

    // Add dateEcheance to bdd4_DateEcheance if new
    const newBdd4 = addUniqueAndSort(db.bdd4_DateEcheance, projectData.dateEcheance);
    
    updateDb({ bddTb1_Projects: updatedProjects, bdd4_DateEcheance: newBdd4 });
    setNewProjectEntry(initialNewProjectEntryState);
    setEditingProjectId(undefined);
    handleUpdateTable(); // Refresh GTB
    setModalState({ isOpen: true, title: 'Succès', message: `Projet ${editingProjectId ? 'modifié' : 'ajouté'} avec succès.`, onConfirm: closeModal, confirmText:'OK'});
  };

  // GTB Actions
  const handleEditGtbRow = (project: BddTb1Item) => {
    setNewProjectEntry({ ...project }); // Load project data into LR form
    setEditingProjectId(project.id);
    window.scrollTo({ top: document.getElementById('project-add-form-section')?.offsetTop || 0, behavior: 'smooth' });
  };

  const handleDeleteGtbRow = (projectId: string) => {
    setModalState({
      isOpen: true,
      title: 'Confirmation de suppression',
      message: 'Etes-vous sûr de vouloir supprimer cette ligne de projet ?',
      onConfirm: () => {
        const updatedProjects = db.bddTb1_Projects.filter(p => p.id !== projectId);
        updateDb({ bddTb1_Projects: updatedProjects });
        handleUpdateTable(); // Refresh GTB
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


  return (
    <div className="container mx-auto p-4">
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
      />
      
      <div id="project-add-form-section">
        <ProjectAddForm
            entry={newProjectEntry}
            onEntryChange={handleNewProjectEntryChange}
            onSubmit={handleSubmitNewProject}
            db={db}
            getFilteredDestPreciseOptions={getFilteredDestPreciseOptions}
            isEditing={!!editingProjectId}
        />
      </div>

      <ProjectTable
        projects={gtbData}
        onEdit={handleEditGtbRow}
        onDelete={handleDeleteGtbRow}
      />

      <Modal {...modalState} />
    </div>
  );
};

export default App;
