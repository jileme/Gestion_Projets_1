
import React, { useState, useEffect } from 'react';
import { ModalState, ModalInput as ModalInputType } from '../types';

interface ModalProps extends ModalState {
  // onConfirm might take specific input types later
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  title,
  message,
  content,
  inputs: initialInputs = [],
  onConfirm,
  onCancel,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
}) => {
  const [inputValues, setInputValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      const initialValues: Record<string, string> = {};
      initialInputs.forEach(input => {
        initialValues[input.id] = input.value || '';
      });
      setInputValues(initialValues);
    }
  }, [isOpen, initialInputs]);

  if (!isOpen) {
    return null;
  }

  const handleInputChange = (id: string, value: string) => {
    setInputValues(prev => ({ ...prev, [id]: value }));
  };

  const handleConfirm = () => {
    if (onConfirm) {
      // Basic validation for required fields
      if (initialInputs) {
        for (const input of initialInputs) {
          if (input.required && !inputValues[input.id]?.trim()) {
            alert(`Le champ "${input.label}" est requis.`);
            return;
          }
        }
      }
      onConfirm(inputValues);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">{title}</h2>
        {message && <p className="mb-4 text-gray-600">{message}</p>}
        {content && <div className="mb-4">{content}</div>}
        {initialInputs && initialInputs.length > 0 && (
          <div className="space-y-3 mb-4">
            {initialInputs.map(input => (
              <div key={input.id}>
                <label htmlFor={input.id} className="block text-sm font-medium text-gray-700">
                  {input.label} {input.required && <span className="text-red-500">*</span>}
                </label>
                {input.type === 'month' ? (
                   <input
                    type="month"
                    id={input.id}
                    value={inputValues[input.id] || ''}
                    onChange={e => handleInputChange(input.id, e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                ) : input.options ? (
                  <select
                    id={input.id}
                    value={inputValues[input.id] || ''}
                    onChange={e => handleInputChange(input.id, e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="">Sélectionner...</option>
                    {input.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                ) : (
                  <input
                    type={input.type || 'text'}
                    id={input.id}
                    value={inputValues[input.id] || ''}
                    onChange={e => handleInputChange(input.id, e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                )}
              </div>
            ))}
          </div>
        )}
        <div className="flex justify-end space-x-3">
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              {cancelText}
            </button>
          )}
          {onConfirm && (
             <button
              onClick={handleConfirm}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {confirmText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
    