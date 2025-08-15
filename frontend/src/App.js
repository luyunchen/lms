import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Books from './pages/Books';
import AddBook from './pages/AddBook';
import BookDetails from './pages/BookDetails';
import Activity from './pages/Activity';
import TelemetryDashboard from './pages/TelemetryDashboard';
import { telemetryService } from './services/telemetry';

function App() {
  useEffect(() => {
    // Initialize telemetry on app start
    telemetryService.init();
    
    // Track app initialization
    telemetryService.trackEvent('app_initialized', {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    });

    return () => {
      // Clean up telemetry on app unmount
      telemetryService.cleanup();
    };
  }, []);
  return (
    <Router>
      <div className="app">
        <Header />
        <main className="main">
          <div className="container">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/books" element={<Books />} />
              <Route path="/books/add" element={<AddBook />} />
              <Route path="/books/:id" element={<BookDetails />} />
              <Route path="/activity" element={<Activity />} />
              <Route path="/telemetry" element={<TelemetryDashboard />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;
