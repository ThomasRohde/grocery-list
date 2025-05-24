import { useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useApp } from '../hooks/useApp';
import type { GroceryItem, GroceryCategory } from '../types';
import { ItemList } from '../components/ItemList';
import { AddItemForm } from '../components/AddItemForm';
import { ShareModal } from '../components/ShareModal';

export function ListPage() {
  const { id } = useParams<{ id: string }>();
  const { state, actions } = useApp();
  const [showAddForm, setShowAddForm] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const currentList = state.lists.find(list => list.id === id);

  if (!currentList) {
    return <Navigate to="/grocery-list" replace />;
  }

  const handleAddItem = (name: string, quantity: number, unit: string, category: GroceryCategory) => {
    const newItem: GroceryItem = {
      id: crypto.randomUUID(),
      name,
      quantity,
      unit,
      category,
      isCompleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      syncStatus: 'pending'
    };

    actions.addItem(currentList.id, newItem);
    setShowAddForm(false);
  };

  const handleDeleteItem = (itemId: string) => {
    actions.deleteItem(itemId);
  };

  const handleToggleComplete = (itemId: string) => {
    actions.toggleItemComplete(itemId);
  };

  const completedCount = currentList.items.filter(item => item.isCompleted).length;
  const totalCount = currentList.items.length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{currentList.name}</h1>
          <p className="text-gray-600 mt-1">
            {totalCount === 0 
              ? 'No items yet'
              : `${completedCount}/${totalCount} items completed`
            }
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowShareModal(true)}
            className="btn-secondary"
          >
            Share
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="btn-primary"
          >
            + Add Item
          </button>
        </div>
      </div>

      {totalCount > 0 && (
        <div className="bg-white rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm text-gray-500">{Math.round((completedCount / totalCount) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(completedCount / totalCount) * 100}%` }}
            />
          </div>
        </div>
      )}

      {currentList.items.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📝</div>
          <h2 className="text-xl font-medium text-gray-900 mb-2">No items yet</h2>
          <p className="text-gray-500 mb-6">
            Add your first item to start building your shopping list
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="btn-primary"
          >
            Add First Item
          </button>
        </div>
      ) : (
        <ItemList
          items={currentList.items}
          onToggleComplete={handleToggleComplete}
          onDelete={handleDeleteItem}
        />
      )}

      {showAddForm && (
        <AddItemForm
          onClose={() => setShowAddForm(false)}
          onAdd={handleAddItem}
        />
      )}

      {showShareModal && (
        <ShareModal
          list={currentList}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
}
