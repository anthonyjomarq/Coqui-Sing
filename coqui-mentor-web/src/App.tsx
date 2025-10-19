import { useState } from 'react';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { Footer } from './components/layout/Footer';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { HomePage } from './pages/HomePage';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleMenuToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('Application error:', error, errorInfo);
      }}
    >
      <div className="min-h-screen flex flex-col">
        <Header onMenuToggle={handleMenuToggle} />

        <div className="flex flex-1">
          <Sidebar isOpen={sidebarOpen} onClose={handleSidebarClose} />

          <main className="flex-1 overflow-auto">
            <HomePage />
          </main>
        </div>

        <Footer />
      </div>
    </ErrorBoundary>
  );
}

export default App;
