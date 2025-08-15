import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const location = useLocation();

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <div className="logo">
            📚 Library Management
          </div>
          <nav className="nav">
            <Link 
              to="/" 
              className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
            >
              Dashboard
            </Link>
            <Link 
              to="/books" 
              className={`nav-link ${location.pathname === '/books' ? 'active' : ''}`}
            >
              Books
            </Link>
            <Link 
              to="/books/add" 
              className={`nav-link ${location.pathname === '/books/add' ? 'active' : ''}`}
            >
              Add Book
            </Link>
            <Link 
              to="/activity" 
              className={`nav-link ${location.pathname === '/activity' ? 'active' : ''}`}
            >
              Activity
            </Link>
            <Link 
              to="/telemetry" 
              className={`nav-link ${location.pathname === '/telemetry' ? 'active' : ''}`}
            >
              Analytics
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
