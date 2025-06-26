
import React from 'react';
import { NewProjectEntryState, AppDatabase } from '../types';
import { formatMonthYear, parseMonthYear } from '../services/databaseService';

interface ProjectAddFormProps {
  entry: NewProjectEntryState;
  onEntryChange: <K extends keyof NewProjectEntryState>(key: K, value: NewProjectEntryState[K]) => void;
  onSubmit: () => void;
  db: AppDatabase;
  getFilteredDestPreciseOptions: (globalDest?: string) => string[];
  isEditing: boolean;
}

const ProjectAddForm: React.FC<ProjectAddFormProps> = ({
  entry,
  onEntryChange,
  onSubmit,
  db,
  getFilteredDestPreciseOptions,
  isEditing,
}) => {
  const commonSelectClass = "mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm";
  const commonInputClass = "mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm";
  const destPreciseOptionsForLR = getFilteredDestPreciseOptions(entry.destinationGlobale);

  const handleDateChange = (value: string) => { // value is YYYY-MM
    onEntryChange('dateEcheance', formatMonthYear(value));
  };
  
  return (
    <div className="bg-gray-50 p-4 rounded-lg shadow mb-6">
      <h3 className="text-lg font-medium text-gray-700 mb-3">{isEditing ? 'Modifier Projet' : 'Ajouter un nouveau projet (LR)'}</h3>
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {/* Case_ZL6: Nom Projet */}
        <div>
          <label htmlFor="lrNomProjet" className="block text-sm font-medium text-gray-700">Nom projet</label>
          <select id="lrNomProjet" value={entry.nomProjet} onChange={e => onEntryChange('nomProjet', e.target.value)} className={commonSelectClass}>
            <option value="">Sélectionner...</option>
            {db.bdd2_NomProjet.map(item => <option key={item} value={item}>{item}</option>)}
          </select>
        </div>
        {/* Case_ZL7: Type Projet */}
        <div>
          <label htmlFor="lrTypeProjet" className="block text-sm font-medium text-gray-700">Type projet</label>
          <select id="lrTypeProjet" value={entry.typeProjet} onChange={e => onEntryChange('typeProjet', e.target.value)} className={commonSelectClass}>
            <option value="">Sélectionner...</option>
            {db.bdd1_TypeProjet.map(item => <option key={item} value={item}>{item}</option>)}
          </select>
        </div>
        {/* Case_ZL8: Destination Globale */}
        <div>
          <label htmlFor="lrDestGlobale" className="block text-sm font-medium text-gray-700">Destination globale</label>
          <select 
            id="lrDestGlobale" 
            value={entry.destinationGlobale} 
            onChange={e => {
              onEntryChange('destinationGlobale', e.target.value);
              onEntryChange('destinationPrecise', ''); // Reset precise when global changes
            }} 
            className={commonSelectClass}
          >
            <option value="">Sélectionner...</option>
            {db.bdd3_DestinationGlobale.map(item => <option key={item} value={item}>{item}</option>)}
          </select>
        </div>
        {/* Case_ZL9: Destination Précise */}
        <div>
          <label htmlFor="lrDestPrecise" className="block text-sm font-medium text-gray-700">Destination précise</label>
          <select 
            id="lrDestPrecise" 
            value={entry.destinationPrecise} 
            onChange={e => onEntryChange('destinationPrecise', e.target.value)} 
            className={commonSelectClass}
            disabled={!destPreciseOptionsForLR.length && !entry.destinationGlobale}
          >
            <option value="">Sélectionner...</option>
            {destPreciseOptionsForLR.map(item => <option key={item} value={item}>{item}</option>)}
          </select>
        </div>
        {/* Case_ZT1: Description */}
        <div className="lg:col-span-2">
          <label htmlFor="lrDescription" className="block text-sm font-medium text-gray-700">Description</label>
          <input type="text" id="lrDescription" value={entry.description} onChange={e => onEntryChange('description', e.target.value)} className={commonInputClass} />
        </div>
        {/* Case_ZT2: Travail en cours */}
        <div className="lg:col-span-2">
          <label htmlFor="lrTravailEnCours" className="block text-sm font-medium text-gray-700">Travail en cours</label>
          <input type="text" id="lrTravailEnCours" value={entry.travailEnCours} onChange={e => onEntryChange('travailEnCours', e.target.value)} className={commonInputClass} />
        </div>
         {/* Case_ZL10: Date Échéance */}
        <div>
          <label htmlFor="lrDateEcheance" className="block text-sm font-medium text-gray-700">Date échéance</label>
          <input 
            type="month" 
            id="lrDateEcheance" 
            value={parseMonthYear(entry.dateEcheance)} 
            onChange={e => handleDateChange(e.target.value)} 
            className={commonInputClass} 
          />
        </div>
        {/* Case_ZT3: Commentaires */}
        <div className="lg:col-span-4">
          <label htmlFor="lrCommentaires" className="block text-sm font-medium text-gray-700">Commentaires</label>
          <textarea id="lrCommentaires" value={entry.commentaires} onChange={e => onEntryChange('commentaires', e.target.value)} rows={2} className={commonInputClass}></textarea>
        </div>
        <div className="lg:col-span-1 flex items-end">
          <button
            onClick={onSubmit} // BT_9 (ou Enregistrer si isEditing)
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            {isEditing ? 'Enregistrer Modifications' : 'Ajouter Projet'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectAddForm;
    
