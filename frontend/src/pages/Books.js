import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import BookCard from '../components/BookCard';
import CheckoutModal from '../components/CheckoutModal';
import ConfirmModal from '../components/ConfirmModal';
import AutocompleteSearch from '../components/AutocompleteSearch';
import { telemetryService } from '../services/telemetry';

const Books = () => {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [genreFilter, setGenreFilter] = useState('');
  const [genres, setGenres] = useState([]);
  
  // Autocomplete suggestions
  const [suggestions, setSuggestions] = useState({
    titles: [],
    authors: [],
    genres: []
  });
  
  // Modal states
  const [checkoutModal, setCheckoutModal] = useState({ isOpen: false, book: null });
  const [checkinModal, setCheckinModal] = useState({ isOpen: false, book: null });
  
  // Message state
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  useEffect(() => {
    filterBooks();
  }, [books, searchTerm, statusFilter, genreFilter, filterBooks]);

  useEffect(() => {
    generateSuggestions();
  }, [books, generateSuggestions]);

  const fetchBooks = useCallback(async () => {
    try {
      const response = await axios.get('/api/books');
      setBooks(response.data);
      
      // Extract unique genres for filter
      const uniqueGenres = [...new Set(response.data.map(book => book.genre).filter(Boolean))];
      setGenres(uniqueGenres);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching books:', error);
      showMessage('Error loading books', 'error');
      setLoading(false);
    }
  }, []);

  const generateSuggestions = useCallback(() => {
    const titles = [...new Set(books.map(book => book.title))].sort();
    const authors = [...new Set(books.map(book => book.author))].sort();
    const genres = [...new Set(books.map(book => book.genre).filter(Boolean))].sort();
    
    setSuggestions({ titles, authors, genres });
  }, [books]);

  const filterBooks = useCallback(() => {
    let filtered = books;

    // Enhanced search with fuzzy matching
    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      filtered = filtered.filter(book => {
        const titleMatch = book.title.toLowerCase().includes(query);
        const authorMatch = book.author.toLowerCase().includes(query);
        const isbnMatch = book.isbn && book.isbn.toLowerCase().includes(query);
        const tagMatch = book.tags && book.tags.toLowerCase().includes(query);
        
        // Fuzzy matching for common typos
        const fuzzyTitleMatch = fuzzyMatch(book.title.toLowerCase(), query);
        const fuzzyAuthorMatch = fuzzyMatch(book.author.toLowerCase(), query);
        
        return titleMatch || authorMatch || isbnMatch || tagMatch || 
               fuzzyTitleMatch || fuzzyAuthorMatch;
      });
    }

    if (statusFilter) {
      if (statusFilter === 'overdue') {
        filtered = filtered.filter(book => {
          if (book.status !== 'borrowed') return false;
          const dueDate = new Date(book.due_date);
          const today = new Date();
          return dueDate < today;
        });
      } else {
        filtered = filtered.filter(book => book.status === statusFilter);
      }
    }

    if (genreFilter) {
      filtered = filtered.filter(book => book.genre === genreFilter);
    }

    setFilteredBooks(filtered);
  }, [books, searchTerm, statusFilter, genreFilter]);

  // Simple fuzzy matching for common typos
  const fuzzyMatch = (text, query) => {
    if (query.length < 3) return false;
    
    // Check for character substitutions, insertions, deletions
    const distance = levenshteinDistance(text, query);
    const threshold = Math.floor(query.length * 0.3); // Allow 30% error
    
    return distance <= threshold && distance > 0;
  };

  // Calculate Levenshtein distance for fuzzy matching
  const levenshteinDistance = (str1, str2) => {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  };

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  const handleCheckout = (book) => {
    setCheckoutModal({ isOpen: true, book });
  };

  const handleCheckin = (book) => {
    setCheckinModal({ isOpen: true, book });
  };

  const confirmCheckout = async (bookId, borrowerData) => {
    try {
      await axios.post(`/api/books/${bookId}/checkout`, borrowerData);
      
      // Track successful checkout
      telemetryService.trackEvent('book_checkout', {
        bookId,
        borrowerName: borrowerData.name
      });
      
      showMessage('Book checked out successfully!', 'success');
      setCheckoutModal({ isOpen: false, book: null });
      fetchBooks(); // Refresh the books list
    } catch (error) {
      console.error('Error checking out book:', error);
      telemetryService.trackEvent('checkout_error', {
        bookId,
        error: error.response?.data?.error || error.message
      });
      showMessage(error.response?.data?.error || 'Error checking out book', 'error');
    }
  };

  const confirmCheckin = async () => {
    try {
      await axios.post(`/api/books/${checkinModal.book.id}/checkin`);
      
      // Track successful checkin
      telemetryService.trackEvent('book_checkin', {
        bookId: checkinModal.book.id,
        bookTitle: checkinModal.book.title
      });
      
      showMessage('Book checked in successfully!', 'success');
      setCheckinModal({ isOpen: false, book: null });
      fetchBooks(); // Refresh the books list
    } catch (error) {
      console.error('Error checking in book:', error);
      telemetryService.trackEvent('checkin_error', {
        bookId: checkinModal.book.id,
        error: error.response?.data?.error || error.message
      });
      showMessage(error.response?.data?.error || 'Error checking in book', 'error');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setGenreFilter('');
  };

  const handleSearchSelect = (selectedValue, type) => {
    // Track autocomplete selection
    telemetryService.trackEvent('autocomplete_selection', {
      selectedValue,
      type,
      searchTerm
    });
    
    if (type === 'title' || type === 'author') {
      setSearchTerm(selectedValue);
    } else if (type === 'genre') {
      setGenreFilter(selectedValue);
    }
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (searchTerm) count++;
    if (statusFilter) count++;
    if (genreFilter) count++;
    return count;
  };

  if (loading) {
    return <div className="loading">Loading books...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1>Library Books ({filteredBooks.length})</h1>
        <div className="btn-group">
          {getActiveFiltersCount() > 0 && (
            <button onClick={clearFilters} className="btn btn-outline btn-small">
              Clear Filters ({getActiveFiltersCount()})
            </button>
          )}
        </div>
      </div>

      {/* Message Alert */}
      {message.text && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Search and Filters */}
      <div className="search-section">
        {/* Autocomplete Search */}
        <AutocompleteSearch
          value={searchTerm}
          onChange={(value) => {
            setSearchTerm(value);
            // Track search with debouncing
            if (value.length >= 3) {
              setTimeout(() => {
                telemetryService.trackEvent('search_query', {
                  query: value,
                  resultsCount: filteredBooks.length
                });
              }, 1000);
            }
          }}
          onSelect={handleSearchSelect}
          suggestions={suggestions}
          placeholder="Search books by title, author, ISBN, or tags... (supports fuzzy matching)"
        />

        <div className="filters">
          <div className="filter-group">
            <label className="filter-label">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-select"
            >
              <option value="">All Status</option>
              <option value="available">Available</option>
              <option value="borrowed">Borrowed</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Genre</label>
            <select
              value={genreFilter}
              onChange={(e) => setGenreFilter(e.target.value)}
              className="form-select"
            >
              <option value="">All Genres</option>
              {genres.map(genre => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Search Tips */}
        {searchTerm && (
          <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#f0f8ff', borderRadius: '4px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            💡 <strong>Search Tips:</strong> Try typing partial words or even with typos - our fuzzy search will find matches! 
            {searchTerm.length >= 3 && (
              <span> Current search handles typos and partial matches for "{searchTerm}".</span>
            )}
          </div>
        )}

        <div style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>
          Showing {filteredBooks.length} of {books.length} books
        </div>
      </div>

      {/* Books Grid */}
      {filteredBooks.length > 0 ? (
        <div className="books-grid">
          {filteredBooks.map(book => (
            <BookCard
              key={book.id}
              book={book}
              onCheckout={handleCheckout}
              onCheckin={handleCheckin}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h3>No books found</h3>
          {getActiveFiltersCount() > 0 ? (
            <div>
              <p>No books match your current filters.</p>
              <button onClick={clearFilters} className="btn btn-primary">
                Clear All Filters
              </button>
            </div>
          ) : (
            <p>No books have been added to the library yet.</p>
          )}
        </div>
      )}

      {/* Quick Stats */}
      {books.length > 0 && (
        <div style={{ marginTop: '32px', padding: '16px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                {books.length}
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Total Books</div>
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--status-available)' }}>
                {books.filter(b => b.status === 'available').length}
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Available</div>
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--status-borrowed)' }}>
                {books.filter(b => b.status === 'borrowed').length}
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Borrowed</div>
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--status-overdue)' }}>
                {books.filter(b => {
                  if (b.status !== 'borrowed') return false;
                  const dueDate = new Date(b.due_date);
                  const today = new Date();
                  return dueDate < today;
                }).length}
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Overdue</div>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      <CheckoutModal
        book={checkoutModal.book}
        isOpen={checkoutModal.isOpen}
        onClose={() => setCheckoutModal({ isOpen: false, book: null })}
        onConfirm={confirmCheckout}
      />

      {/* Check-in Confirmation Modal */}
      <ConfirmModal
        isOpen={checkinModal.isOpen}
        onClose={() => setCheckinModal({ isOpen: false, book: null })}
        onConfirm={confirmCheckin}
        title="Check In Book"
        message={`Are you sure you want to check in "${checkinModal.book?.title}"?`}
        confirmText="Check In"
      />
    </div>
  );
};

export default Books;
