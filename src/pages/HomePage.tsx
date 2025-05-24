import { useState } from 'react';
import { useApp } from '../hooks/useApp';
import type { GroceryList } from '../types';
import { generateShareCode } from '../utils/pwa';
import { ListCard } from '../components/ListCard';
import { CreateListModal } from '../components/CreateListModal';

export function HomePage() {
  const { state, actions } = useApp();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleCreateList = (name: string) => {
    const newList: GroceryList = {
      id: crypto.randomUUID(),
      name,
      items: [],
      shareCode: generateShareCode(),
      createdAt: new Date(),
      updatedAt: new Date(),
      syncStatus: 'pending'
    };

    actions.addList(newList);
    actions.setCurrentList(newList.id);
    setShowCreateModal(false);
  };

  const handleDeleteList = (listId: string) => {
    if (confirm('Are you sure you want to delete this list?')) {
      actions.deleteList(listId);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Grocery Lists</h1>
          <p className="text-gray-600 mt-1">
            {state.lists.length === 0 
              ? 'Create your first shopping list to get started'
              : `${state.lists.length} list${state.lists.length === 1 ? '' : 's'}`
            }
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary"
        >
          + New List
        </button>
      </div>

      {state.lists.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-xl font-medium text-gray-900 mb-2">No lists yet</h2>
          <p className="text-gray-500 mb-6">
            Create your first grocery list to start shopping smarter
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary"
          >
            Create Your First List
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {state.lists.map(list => (
            <ListCard
              key={list.id}
              list={list}
              onSelect={(id) => actions.setCurrentList(id)}
              onDelete={handleDeleteList}
            />
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreateListModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateList}
        />
      )}
    </div>
  );
}
