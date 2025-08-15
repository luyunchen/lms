import React from 'react';
import { Link } from 'react-router-dom';

const BookCard = ({ book, onCheckout, onCheckin }) => {
  const getStatusClass = (status, dueDate) => {
    if (status === 'available') return 'status-available';
    if (status === 'borrowed') {
      const due = new Date(dueDate);
      const today = new Date();
      return due < today ? 'status-overdue' : 'status-borrowed';
    }
    return '';
  };

  const getStatusText = (status, dueDate) => {
    if (status === 'available') return 'Available';
    if (status === 'borrowed') {
      const due = new Date(dueDate);
      const today = new Date();
      return due < today ? 'Overdue' : 'Borrowed';
    }
    return status;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="book-card">
      <div className="book-card-header">
        <h3 className="book-title">{book.title}</h3>
        <p className="book-author">by {book.author}</p>
      </div>
      
      <div className="book-card-body">
        <div className="book-info">
          <div className="book-info-item">
            <span className="book-info-label">Genre:</span>
            <span>{book.genre || 'N/A'}</span>
          </div>
          <div className="book-info-item">
            <span className="book-info-label">Year:</span>
            <span>{book.year || 'N/A'}</span>
          </div>
          <div className="book-info-item">
            <span className="book-info-label">ISBN:</span>
            <span>{book.isbn || 'N/A'}</span>
          </div>
          <div className="book-info-item">
            <span className="book-info-label">Status:</span>
            <span className={`status ${getStatusClass(book.status, book.due_date)}`}>
              {getStatusText(book.status, book.due_date)}
            </span>
          </div>
          {book.status === 'borrowed' && book.borrower_name && (
            <>
              <div className="book-info-item">
                <span className="book-info-label">Borrower:</span>
                <span>{book.borrower_name}</span>
              </div>
              <div className="book-info-item">
                <span className="book-info-label">Due Date:</span>
                <span>{formatDate(book.due_date)}</span>
              </div>
            </>
          )}
        </div>

        {book.description && (
          <p className="book-description">
            {book.description.length > 100 
              ? `${book.description.substring(0, 100)}...` 
              : book.description}
          </p>
        )}

        {book.tags && (
          <div className="book-tags">
            {book.tags.split(',').map((tag, index) => (
              <span key={index} className="tag">
                {tag.trim()}
              </span>
            ))}
          </div>
        )}

        <div className="btn-group">
          <Link to={`/books/${book.id}`} className="btn btn-primary btn-small">
            View Details
          </Link>
          
          {book.status === 'available' ? (
            <button 
              onClick={() => onCheckout(book)}
              className="btn btn-cta btn-small"
            >
              Check Out
            </button>
          ) : (
            <button 
              onClick={() => onCheckin(book)}
              className="btn btn-secondary btn-small"
            >
              Check In
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookCard;
