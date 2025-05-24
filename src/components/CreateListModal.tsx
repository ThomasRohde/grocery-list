import { useState } from 'react';

interface CreateListModalProps {
  onClose: () => void;
  onCreate: (name: string) => void;
}

export function CreateListModal({ onClose, onCreate }: CreateListModalProps) {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onCreate(name.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Create New List</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="listName" className="block text-sm font-medium text-gray-700 mb-1">
              List Name
            </label>
            <input
              id="listName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Weekly Groceries"
              className="input-field"
              autoFocus
            />
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create List
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
