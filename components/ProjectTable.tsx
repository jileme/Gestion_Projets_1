import React, { useState } from 'react';
import { BddTb1Item, NewProjectEntryState } from '../types';

interface ProjectTableProps {
  projects: BddTb1Item[];
  onEdit: (project: BddTb1Item) => void; // Populates LR form for editing
  onDelete: (projectId: string) => void;
}

const ProjectTable: React.FC<ProjectTableProps> = ({ projects, onEdit, onDelete }) => {
  if (!projects.length) {
    return <p className="text-center text-gray-500 py-8">Aucun projet à afficher. Modifiez les filtres ou ajoutez des projets.</p>;
  }

  const thClass = "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50";
  const tdClass = "px-4 py-3 whitespace-nowrap text-sm text-gray-700";

  return (
    <div className="shadow border-b border-gray-200 sm:rounded-lg overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className={thClass}>Nom projet</th>
            <th className={thClass}>Type projet</th>
            <th className={thClass}>Destination globale</th>
            <th className={thClass}>Destination précise</th>
            <th className={thClass}>Description</th>
            <th className={thClass}>Travail en cours</th>
            <th className={thClass}>Date échéance</th>
            <th className={thClass}>Commentaires</th>
            <th className={`${thClass} action-buttons-header`}>Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {projects.map((project) => (
            <tr key={project.id} className="hover:bg-gray-50">
              <td className={tdClass}>{project.nomProjet}</td>
              <td className={tdClass}>{project.typeProjet}</td>
              <td className={tdClass}>{project.destinationGlobale}</td>
              <td className={tdClass}>{project.destinationPrecise}</td>
              <td className={`${tdClass} max-w-xs truncate`} title={project.description}>{project.description}</td>
              <td className={`${tdClass} max-w-xs truncate`} title={project.travailEnCours}>{project.travailEnCours}</td>
              <td className={tdClass}>{project.dateEcheance}</td>
              <td className={`${tdClass} max-w-xs truncate`} title={project.commentaires}>{project.commentaires}</td>
              <td className={`${tdClass} space-x-2 action-buttons-cell`}>
                <button
                  onClick={() => onEdit(project)} // GTB_BT + numligne
                  className="text-indigo-600 hover:text-indigo-900 font-medium"
                >
                  Modifier
                </button>
                <button
                  onClick={() => onDelete(project.id)} // GTB_BTSP + numligne
                  className="text-red-600 hover:text-red-900 font-medium"
                >
                  Supprimer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProjectTable;
