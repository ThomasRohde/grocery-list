import type { GroceryItem } from '../types';

interface ItemListProps {
  items: GroceryItem[];
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ItemList({ items, onToggleComplete, onDelete }: ItemListProps) {
  const sortedItems = [...items].sort((a, b) => {
    if (a.isCompleted !== b.isCompleted) {
      return a.isCompleted ? 1 : -1;
    }
    return a.name.localeCompare(b.name);
  });

  const categoryEmojis: Record<string, string> = {
    produce: '🥕',
    dairy: '🥛',
    meat: '🥩',
    bakery: '🍞',
    pantry: '🥫',
    frozen: '🧊',
    household: '🏠',
    other: '📦'
  };

  return (
    <div className="space-y-2">
      {sortedItems.map(item => (
        <div
          key={item.id}
          className={`
            card transition-all duration-200
            ${item.isCompleted ? 'bg-gray-50 opacity-60' : 'bg-white'}
          `}
        >
          <div className="flex items-center space-x-3">
            <button
              onClick={() => onToggleComplete(item.id)}
              className={`
                w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors
                ${item.isCompleted                  ? 'bg-primary-600 border-primary-600 text-white' 
                  : 'border-gray-300 hover:border-primary-500'
                }
              `}
            >
              {item.isCompleted && '✓'}
            </button>
            
            <span className="text-xl">
              {categoryEmojis[item.category] || categoryEmojis.other}
            </span>
            
            <div className="flex-1">
              <div className={`
                font-medium 
                ${item.isCompleted ? 'line-through text-gray-500' : 'text-gray-900'}
              `}>
                {item.name}
              </div>
              <div className="text-sm text-gray-500">
                {item.quantity} {item.unit} • {item.category}
              </div>
            </div>
            
            <button
              onClick={() => onDelete(item.id)}
              className="text-gray-400 hover:text-red-500 p-1"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
