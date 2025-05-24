import { Link } from 'react-router-dom';
import type { GroceryList } from '../types';

interface ListCardProps {
  list: GroceryList;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ListCard({ list, onSelect, onDelete }: ListCardProps) {
  const completedCount = list.items.filter(item => item.isCompleted).length;
  const totalCount = list.items.length;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="card hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-medium text-gray-900 truncate">{list.name}</h3>
        <button
          onClick={(e) => {
            e.preventDefault();
            onDelete(list.id);
          }}
          className="text-gray-400 hover:text-red-500 text-sm"
        >
          ×
        </button>
      </div>
      
      <div className="space-y-3">
        <div className="text-sm text-gray-600">
          {totalCount === 0 ? (
            'No items'
          ) : (
            `${completedCount}/${totalCount} items completed`
          )}
        </div>
        
        {totalCount > 0 && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        )}
        
        <Link
          to={`/grocery-list/list/${list.id}`}
          onClick={() => onSelect(list.id)}
          className="block w-full text-center btn-primary text-sm py-2"
        >
          Open List
        </Link>
      </div>
    </div>
  );
}
