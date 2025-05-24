import { useContext } from 'react';
import { AppContext } from '../context/AppContextDefinition';

export function useApp() {
  const context = useContext(AppContext);
  if (context === null) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
