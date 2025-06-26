import React from 'react';
import { FiltersState, AddToBddInputsState, AppDatabase, BddTb2Item } from '../types';

interface ProjectFiltersProps {
  filters: FiltersState;
  onFilterChange: <K extends keyof FiltersState>(key: K, value: FiltersState[K]) => void;
  addToBddInputs: AddToBddInputsState;
  onAddToBddInputChange: <K extends keyof AddToBddInputsState>(key: K, value: AddToBddInputsState[K]) => void;
  db: AppDatabase;
  onClearFilters: () => void;
  onUpdateTable: () => void;
  onDeleteFilterItem: (filterKey: keyof FiltersState) => void;
  onAddBddItem: (inputKey: keyof AddToBddInputsState) => void;
  getFilteredDestPreciseOptions: (globalDest?: string) => string[];
  contactForSelectedPrecise: BddTb2Item | null;
  onExportTableToDoc: () => void;
  onExportDatabase: () => void; // Nouveau pour exporter la BDD
  onImportDatabase: (event: React.ChangeEvent<HTMLInputElement>) => void; // Nouveau pour importer la BDD
}

const ProjectFilters: React.FC<ProjectFiltersProps> = ({
  filters,
  onFilterChange,
  addToBddInputs,
  onAddToBddInputChange,
  db,
  onClearFilters,
  onUpdateTable,
  onDeleteFilterItem,
  onAddBddItem,
  getFilteredDestPreciseOptions,
  contactForSelectedPrecise,
  onExportTableToDoc,
  onExportDatabase,
  onImportDatabase,
}) => {
  const destPreciseOptionsForZL4 = getFilteredDestPreciseOptions(filters.destinationGlobale);

  const commonSelectClass = "mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm";
  const commonInputClass = "mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm";
  const commonButtonClass = "py-2 px-4 rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2";
  const deleteButtonClass = `${commonButtonClass} bg-red-600 hover:bg-red-700 focus:ring-red-500 w-full mt-1`;
  const addButtonClass = `${commonButtonClass} bg-green-600 hover:bg-green-700 focus:ring-green-500 w-full mt-1`;
  
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImportButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow mb-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Projets</h2>
        <div className="flex flex-wrap gap-2"> {/* Flex-wrap pour les petits écrans */}
          <button
            type="button"
            onClick={onClearFilters} // BT_0
            className={`${commonButtonClass} bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-400`}
          >
            Clear
          </button>
          <button
            type="button"
            onClick={onUpdateTable} // MiseAJour_GTB
            className={`${commonButtonClass} bg-blue-600 hover:bg-blue-700 focus:ring-blue-500`}
          >
            Mise à jour tableau
          </button>
          <button
            type="button"
            onClick={onExportTableToDoc} 
            className={`${commonButtonClass} bg-teal-500 hover:bg-teal-600 focus:ring-teal-400`}
            aria-label="Exporter le tableau en .doc"
          >
            Exporter Tableau (.doc) 📄
          </button>
          <button
            type="button"
            onClick={onExportDatabase}
            className={`${commonButtonClass} bg-purple-600 hover:bg-purple-700 focus:ring-purple-500`}
            aria-label="Exporter la base de données"
          >
            Exporter BDD 💾
          </button>
          <input 
            type="file" 
            accept=".json" 
            onChange={onImportDatabase} 
            className="hidden" 
            ref={fileInputRef}
          />
          <button
            type="button"
            onClick={handleImportButtonClick}
            className={`${commonButtonClass} bg-pink-600 hover:bg-pink-700 focus:ring-pink-500`}
            aria-label="Importer la base de données"
          >
            Importer BDD 📂
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
        {/* Case_ZL1: Type Projet Filter */}
        <div>
          <label htmlFor="filterTypeProjet" className="block text-sm font-medium text-gray-700">Type projet (Filtre)</label>
          <select
            id="filterTypeProjet"
            name="typeProjet"
            value={filters.typeProjet}
            onChange={(e) => onFilterChange('typeProjet', e.target.value)}
            className={commonSelectClass}
          >
            <option value="">Tous</option>
            {db.bdd1_TypeProjet.map(item => <option key={item} value={item}>{item}</option>)}
          </select>
          <button type="button" onClick={() => onDeleteFilterItem('typeProjet')} className={deleteButtonClass}>Supprimer sélection</button> {/* BT_1 */}
          <input
            type="text"
            placeholder="Nouveau type projet..."
            value={addToBddInputs.newTypeProjet}
            onChange={(e) => onAddToBddInputChange('newTypeProjet', e.target.value)}
            className={`${commonInputClass} mt-2`} // Case_ZZ1
          />
          <button type="button" onClick={() => onAddBddItem('newTypeProjet')} className={addButtonClass}>Ajouter type</button> {/* BT_5 */}
        </div>

        {/* Case_ZL2: Nom Projet Filter */}
        <div>
          <label htmlFor="filterNomProjet" className="block text-sm font-medium text-gray-700">Nom projet (Filtre)</label>
          <select
            id="filterNomProjet"
            name="nomProjet"
            value={filters.nomProjet}
            onChange={(e) => onFilterChange('nomProjet', e.target.value)}
            className={commonSelectClass}
          >
            <option value="">Tous</option>
            {db.bdd2_NomProjet.map(item => <option key={item} value={item}>{item}</option>)}
          </select>
          <button type="button" onClick={() => onDeleteFilterItem('nomProjet')} className={deleteButtonClass}>Supprimer sélection</button> {/* BT_2 */}
          <input
            type="text"
            placeholder="Nouveau nom projet..."
            value={addToBddInputs.newNomProjet}
            onChange={(e) => onAddToBddInputChange('newNomProjet', e.target.value)}
            className={`${commonInputClass} mt-2`} // Case_ZZ2
          />
          <button type="button" onClick={() => onAddBddItem('newNomProjet')} className={addButtonClass}>Ajouter nom</button> {/* BT_6 */}
        </div>

        {/* Case_ZL3: Destination Globale Filter */}
        <div>
          <label htmlFor="filterDestGlobale" className="block text-sm font-medium text-gray-700">Destination globale (Filtre)</label>
          <select
            id="filterDestGlobale"
            name="destinationGlobale"
            value={filters.destinationGlobale}
            onChange={(e) => {
              onFilterChange('destinationGlobale', e.target.value);
              onFilterChange('destinationPrecise', ''); // Reset precise dest when global changes
            }}
            className={commonSelectClass}
          >
            <option value="">Toutes</option>
            {db.bdd3_DestinationGlobale.map(item => <option key={item} value={item}>{item}</option>)}
          </select>
          <button type="button" onClick={() => onDeleteFilterItem('destinationGlobale')} className={deleteButtonClass}>Supprimer sélection</button> {/* BT_3 */}
           <input
            type="text"
            placeholder="Nouv. dest. globale..."
            value={addToBddInputs.newDestinationGlobale}
            onChange={(e) => onAddToBddInputChange('newDestinationGlobale', e.target.value)}
            className={`${commonInputClass} mt-2`} // Case_ZZ3
          />
          <button type="button" onClick={() => onAddBddItem('newDestinationGlobale')} className={addButtonClass}>Ajouter dest. globale</button> {/* BT_7 */}
        </div>

        {/* Case_ZL4: Destination Précise Filter */}
        <div>
          <label htmlFor="filterDestPrecise" className="block text-sm font-medium text-gray-700">Destination précise (Filtre)</label>
          <select
            id="filterDestPrecise"
            name="destinationPrecise"
            value={filters.destinationPrecise}
            onChange={(e) => onFilterChange('destinationPrecise', e.target.value)}
            className={commonSelectClass}
            disabled={!destPreciseOptionsForZL4.length && !filters.destinationGlobale}
          >
            <option value="">Toutes</option>
            {destPreciseOptionsForZL4.map(item => <option key={item} value={item}>{item}</option>)}
          </select>
          <button type="button" onClick={() => onDeleteFilterItem('destinationPrecise')} className={deleteButtonClass}>Supprimer sélection</button> {/* BT_4 */}
          {contactForSelectedPrecise && (
            <div className="mt-2 p-2 border border-gray-200 rounded bg-gray-50 text-sm">
              <p><strong>Contact:</strong> {contactForSelectedPrecise.nomContact || 'N/A'}</p>
              <p><strong>Info:</strong> {contactForSelectedPrecise.contactInfo || 'N/A'}</p>
            </div>
          )}
          <input
            type="text"
            placeholder="Nouv. dest. précise..."
            value={addToBddInputs.newDestinationPrecise}
            onChange={(e) => onAddToBddInputChange('newDestinationPrecise', e.target.value)}
            className={`${commonInputClass} mt-2`} // Case_ZZ4
          />
          <button type="button" onClick={() => onAddBddItem('newDestinationPrecise')} className={addButtonClass}>Ajouter dest. précise</button> {/* BT_8 */}
        </div>
        
        {/* Case_ZL5: Date Échéance Filter */}
        <div>
          <label htmlFor="filterDateEcheance" className="block text-sm font-medium text-gray-700">Date échéance (Filtre)</label>
          <select
            id="filterDateEcheance"
            name="dateEcheance"
            value={filters.dateEcheance}
            onChange={(e) => onFilterChange('dateEcheance', e.target.value)}
            className={commonSelectClass}
          >
            <option value="">Toutes</option>
            {db.bdd4_DateEcheance.map(item => <option key={item} value={item}>{item}</option>)}
          </select>
          {/* No delete button for date échéance as per spec */}
        </div>
      </div>
    </div>
  );
};

export default ProjectFilters;