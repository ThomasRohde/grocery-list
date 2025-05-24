import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { HomePage } from './pages/HomePage';
import { ListPage } from './pages/ListPage';
import { SharedListPage } from './pages/SharedListPage';
import { Header } from './components/Header';
import { InstallPrompt } from './components/InstallPrompt';
import { OnlineStatus } from './components/OnlineStatus';

function App() {
  return (
    <AppProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <main className="container mx-auto px-4 py-6 max-w-4xl">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/grocery-list" element={<HomePage />} />
              <Route path="/grocery-list/list/:id" element={<ListPage />} />
              <Route path="/grocery-list/shared/:id" element={<SharedListPage />} />
            </Routes>
          </main>
          <InstallPrompt />
          <OnlineStatus />
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;
