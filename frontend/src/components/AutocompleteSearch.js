import React, { useState, useEffect, useRef, useCallback } from 'react';

const AutocompleteSearch = ({ 
  value, 
  onChange, 
  onSelect, 
  suggestions, 
  placeholder = "Search..." 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  const levenshteinDistance = useCallback((str1, str2) => {
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
  }, []);

  const fuzzyMatch = useCallback((text, query) => {
    if (query.length < 3) return false;
    const distance = levenshteinDistance(text, query);
    const threshold = Math.floor(query.length * 0.4);
    return distance <= threshold && distance > 0;
  }, [levenshteinDistance]);

  const generateFilteredSuggestions = useCallback(() => {
    const query = value.toLowerCase();
    const allSuggestions = [];

    // Add title suggestions
    suggestions.titles.forEach(title => {
      if (title.toLowerCase().includes(query)) {
        allSuggestions.push({
          value: title,
          type: 'title',
          label: title,
          category: '📖 Title'
        });
      }
    });

    // Add author suggestions
    suggestions.authors.forEach(author => {
      if (author.toLowerCase().includes(query)) {
        allSuggestions.push({
          value: author,
          type: 'author',
          label: author,
          category: '✍️ Author'
        });
      }
    });

    // Add genre suggestions
    suggestions.genres.forEach(genre => {
      if (genre.toLowerCase().includes(query)) {
        allSuggestions.push({
          value: genre,
          type: 'genre',
          label: genre,
          category: '🏷️ Genre'
        });
      }
    });

    // Fuzzy matching for titles and authors
    const fuzzyMatches = [];
    
    suggestions.titles.forEach(title => {
      if (!title.toLowerCase().includes(query) && fuzzyMatch(title.toLowerCase(), query)) {
        fuzzyMatches.push({
          value: title,
          type: 'title',
          label: title,
          category: '📖 Title (fuzzy)',
          isFuzzy: true
        });
      }
    });

    suggestions.authors.forEach(author => {
      if (!author.toLowerCase().includes(query) && fuzzyMatch(author.toLowerCase(), query)) {
        fuzzyMatches.push({
          value: author,
          type: 'author',
          label: author,
          category: '✍️ Author (fuzzy)',
          isFuzzy: true
        });
      }
    });

    // Combine and limit results
    const combined = [...allSuggestions, ...fuzzyMatches].slice(0, 8);
    setFilteredSuggestions(combined);
    setIsOpen(combined.length > 0);
    setHighlightedIndex(-1);
  }, [value, suggestions, fuzzyMatch]);

  useEffect(() => {
    if (value.length >= 2) {
      generateFilteredSuggestions();
    } else {
      setFilteredSuggestions([]);
      setIsOpen(false);
    }
  }, [value, suggestions, generateFilteredSuggestions]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    onChange(e.target.value);
  };

  const handleSuggestionClick = (suggestion) => {
    onChange(suggestion.value);
    onSelect(suggestion.value, suggestion.type);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredSuggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0) {
          handleSuggestionClick(filteredSuggestions[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        inputRef.current.blur();
        break;
      default:
        // Handle other keys
        break;
    }
  };

  const highlightMatch = (text, query) => {
    if (!query) return text;
    
    const index = text.toLowerCase().indexOf(query.toLowerCase());
    if (index === -1) return text;
    
    return (
      <>
        {text.substring(0, index)}
        <strong style={{ backgroundColor: '#F2A541', color: '#1F3B4D', padding: '0 2px', borderRadius: '2px' }}>
          {text.substring(index, index + query.length)}
        </strong>
        {text.substring(index + query.length)}
      </>
    );
  };

  return (
    <div className="autocomplete-container" style={{ position: 'relative' }} ref={dropdownRef}>
      <div className="search-bar">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => value.length >= 2 && setIsOpen(filteredSuggestions.length > 0)}
          placeholder={placeholder}
          className="search-input"
          autoComplete="off"
          style={{
            paddingRight: '40px'
          }}
        />
        
        {/* Search Icon */}
        <div style={{
          position: 'absolute',
          right: '12px',
          top: '50%',
          transform: 'translateY(-50%)',
          color: 'var(--text-secondary)',
          pointerEvents: 'none'
        }}>
          🔍
        </div>

        {/* Clear Button */}
        {value && (
          <button
            type="button"
            onClick={() => {
              onChange('');
              setIsOpen(false);
              inputRef.current.focus();
            }}
            style={{
              position: 'absolute',
              right: '35px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: '14px',
              padding: '4px'
            }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {isOpen && filteredSuggestions.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          backgroundColor: 'white',
          border: '1px solid #ddd',
          borderRadius: '4px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
          zIndex: 1000,
          maxHeight: '300px',
          overflowY: 'auto'
        }}>
          {filteredSuggestions.map((suggestion, index) => (
            <div
              key={`${suggestion.type}-${suggestion.value}-${index}`}
              onClick={() => handleSuggestionClick(suggestion)}
              style={{
                padding: '12px 16px',
                cursor: 'pointer',
                borderBottom: index < filteredSuggestions.length - 1 ? '1px solid #f0f0f0' : 'none',
                backgroundColor: highlightedIndex === index ? '#f8f9fa' : 'white',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={() => setHighlightedIndex(index)}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ 
                    fontSize: '14px',
                    fontWeight: '500',
                    color: 'var(--text-primary)'
                  }}>
                    {highlightMatch(suggestion.label, value)}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: 'var(--text-secondary)',
                    marginTop: '2px'
                  }}>
                    {suggestion.category}
                  </div>
                </div>
                
                {suggestion.isFuzzy && (
                  <div style={{
                    fontSize: '10px',
                    backgroundColor: '#e8f4f8',
                    color: '#2A7F6F',
                    padding: '2px 6px',
                    borderRadius: '8px',
                    fontWeight: '500'
                  }}>
                    fuzzy
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {/* Footer */}
          <div style={{
            padding: '8px 16px',
            backgroundColor: '#f8f9fa',
            borderTop: '1px solid #f0f0f0',
            fontSize: '11px',
            color: 'var(--text-secondary)',
            textAlign: 'center'
          }}>
            💡 Use ↑↓ arrows to navigate, Enter to select, Esc to close
          </div>
        </div>
      )}
    </div>
  );
};

export default AutocompleteSearch;
