import { useState } from 'react';
import type { GroceryCategory } from '../types';

interface AddItemFormProps {
  onClose: () => void;
  onAdd: (name: string, quantity: number, unit: string, category: GroceryCategory) => void;
}

const categories: { value: GroceryCategory; label: string; emoji: string }[] = [
  { value: 'produce', label: 'Produce', emoji: '🥕' },
  { value: 'dairy', label: 'Dairy', emoji: '🥛' },
  { value: 'meat', label: 'Meat', emoji: '🥩' },
  { value: 'bakery', label: 'Bakery', emoji: '🍞' },
  { value: 'pantry', label: 'Pantry', emoji: '🥫' },
  { value: 'frozen', label: 'Frozen', emoji: '🧊' },
  { value: 'household', label: 'Household', emoji: '🏠' },
  { value: 'other', label: 'Other', emoji: '📦' }
];

const units = ['pcs', 'lbs', 'kg', 'g', 'oz', 'cups', 'liters', 'ml', 'bottles', 'boxes', 'cans'];

export function AddItemForm({ onClose, onAdd }: AddItemFormProps) {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState('pcs');
  const [category, setCategory] = useState<GroceryCategory>('other');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onAdd(name.trim(), quantity, unit, category);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Add Item</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="itemName" className="block text-sm font-medium text-gray-700 mb-1">
              Item Name
            </label>
            <input
              id="itemName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Bananas"
              className="input-field"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                Quantity
              </label>
              <input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="input-field"
              />
            </div>
            
            <div>
              <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-1">
                Unit
              </label>
              <select
                id="unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="input-field"
              >
                {units.map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value as GroceryCategory)}
              className="input-field"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.emoji} {cat.label}
                </option>
              ))}
            </select>
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
              Add Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
