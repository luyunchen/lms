import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import CheckoutModal from '../components/CheckoutModal';
import ConfirmModal from '../components/ConfirmModal';

const BookDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [message, setMessage] = useState({ text: '', type: '' });

  // Modal states
  const [checkoutModal, setCheckoutModal] = useState({ isOpen: false });
  const [checkinModal, setCheckinModal] = useState({ isOpen: false });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false });

  useEffect(() => {
    fetchBook();
  }, [id, fetchBook]);

  const fetchBook = useCallback(async () => {
    try {
      const response = await axios.get(`/api/books/${id}`);
      setBook(response.data);
      setEditData(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching book:', error);
      showMessage('Book not found', 'error');
      setLoading(false);
    }
  }, [id]);

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const handleCancelEdit = () => {
    setEditing(false);
    setEditData(book);
  };

  const handleSaveEdit = async () => {
    try {
      await axios.put(`/api/books/${id}`, {
        ...editData,
        year: editData.year ? parseInt(editData.year) : null
      });
      
      showMessage('Book updated successfully!', 'success');
      setEditing(false);
      fetchBook(); // Refresh book data
    } catch (error) {
      console.error('Error updating book:', error);
      showMessage(error.response?.data?.error || 'Error updating book', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/books/${id}`);
      showMessage('Book deleted successfully!', 'success');
      setTimeout(() => navigate('/books'), 1500);
    } catch (error) {
      console.error('Error deleting book:', error);
      showMessage(error.response?.data?.error || 'Error deleting book', 'error');
    }
    setDeleteModal({ isOpen: false });
  };

  const handleCheckout = async (bookId, borrowerData) => {
    try {
      await axios.post(`/api/books/${bookId}/checkout`, borrowerData);
      showMessage('Book checked out successfully!', 'success');
      setCheckoutModal({ isOpen: false });
      fetchBook(); // Refresh book data
    } catch (error) {
      console.error('Error checking out book:', error);
      showMessage(error.response?.data?.error || 'Error checking out book', 'error');
    }
  };

  const handleCheckin = async () => {
    try {
      await axios.post(`/api/books/${id}/checkin`);
      showMessage('Book checked in successfully!', 'success');
      setCheckinModal({ isOpen: false });
      fetchBook(); // Refresh book data
    } catch (error) {
      console.error('Error checking in book:', error);
      showMessage(error.response?.data?.error || 'Error checking in book', 'error');
    }
  };

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

  const handleEditChange = (e) => {
    setEditData({
      ...editData,
      [e.target.name]: e.target.value
    });
  };

  if (loading) {
    return <div className="loading">Loading book details...</div>;
  }

  if (!book) {
    return (
      <div className="empty-state">
        <h2>Book not found</h2>
        <Link to="/books" className="btn btn-primary">Back to Books</Link>
      </div>
    );
  }

  return (
    <div>
      {/* Message Alert */}
      {message.text && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Header with title and actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1>{editing ? 'Edit Book' : book.title}</h1>
        <Link to="/books" className="btn btn-outline">
          ← Back to Books
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }}>
        {/* Book Information */}
        <div className="form">
          <div className="form-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Book Information</span>
            {!editing && (
              <button onClick={handleEdit} className="btn btn-primary btn-small">
                Edit
              </button>
            )}
          </div>

          {editing ? (
            // Edit Form
            <div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={editData.title}
                    onChange={handleEditChange}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Author *</label>
                  <input
                    type="text"
                    name="author"
                    value={editData.author}
                    onChange={handleEditChange}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Genre</label>
                  <input
                    type="text"
                    name="genre"
                    value={editData.genre || ''}
                    onChange={handleEditChange}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Year</label>
                  <input
                    type="number"
                    name="year"
                    value={editData.year || ''}
                    onChange={handleEditChange}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">ISBN</label>
                <input
                  type="text"
                  name="isbn"
                  value={editData.isbn || ''}
                  onChange={handleEditChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Tags</label>
                <input
                  type="text"
                  name="tags"
                  value={editData.tags || ''}
                  onChange={handleEditChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  name="description"
                  value={editData.description || ''}
                  onChange={handleEditChange}
                  className="form-textarea"
                  rows="4"
                />
              </div>

              <div className="btn-group">
                <button onClick={handleSaveEdit} className="btn btn-cta">
                  Save Changes
                </button>
                <button onClick={handleCancelEdit} className="btn btn-outline">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            // View Mode
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
                <div>
                  <h3 style={{ margin: '0 0 16px 0', color: 'var(--primary-color)' }}>{book.title}</h3>
                  <p style={{ margin: '0 0 8px 0', fontSize: '1.1rem', fontStyle: 'italic' }}>by {book.author}</p>
                  
                  <div style={{ margin: '16px 0' }}>
                    <span className={`status ${getStatusClass(book.status, book.due_date)}`}>
                      {getStatusText(book.status, book.due_date)}
                    </span>
                  </div>
                </div>

                <div>
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
                      <span className="book-info-label">Added:</span>
                      <span>{formatDate(book.created_at)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {book.description && (
                <div style={{ margin: '24px 0' }}>
                  <h4 style={{ margin: '0 0 8px 0', color: 'var(--text-primary)' }}>Description</h4>
                  <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>{book.description}</p>
                </div>
              )}

              {book.tags && (
                <div style={{ margin: '24px 0' }}>
                  <h4 style={{ margin: '0 0 8px 0', color: 'var(--text-primary)' }}>Tags</h4>
                  <div className="book-tags">
                    {book.tags.split(',').map((tag, index) => (
                      <span key={index} className="tag">
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Borrowing Information */}
        {book.status === 'borrowed' && book.borrower_name && (
          <div className="form">
            <h2 className="form-title">Borrowing Information</h2>
            <div className="book-info">
              <div className="book-info-item">
                <span className="book-info-label">Borrower:</span>
                <span>{book.borrower_name}</span>
              </div>
              <div className="book-info-item">
                <span className="book-info-label">Email:</span>
                <span>{book.borrower_email || 'N/A'}</span>
              </div>
              <div className="book-info-item">
                <span className="book-info-label">Borrowed Date:</span>
                <span>{formatDate(book.borrowed_date)}</span>
              </div>
              <div className="book-info-item">
                <span className="book-info-label">Due Date:</span>
                <span>{formatDate(book.due_date)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        {!editing && (
          <div className="form">
            <h2 className="form-title">Actions</h2>
            <div className="btn-group">
              {book.status === 'available' ? (
                <button 
                  onClick={() => setCheckoutModal({ isOpen: true })}
                  className="btn btn-cta"
                >
                  Check Out Book
                </button>
              ) : (
                <button 
                  onClick={() => setCheckinModal({ isOpen: true })}
                  className="btn btn-secondary"
                >
                  Check In Book
                </button>
              )}
              
              <button 
                onClick={() => setDeleteModal({ isOpen: true })}
                className="btn btn-danger"
                disabled={book.status === 'borrowed'}
              >
                Delete Book
              </button>
            </div>
            
            {book.status === 'borrowed' && (
              <p style={{ marginTop: '16px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                * Cannot delete book while it's checked out
              </p>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <CheckoutModal
        book={book}
        isOpen={checkoutModal.isOpen}
        onClose={() => setCheckoutModal({ isOpen: false })}
        onConfirm={handleCheckout}
      />

      <ConfirmModal
        isOpen={checkinModal.isOpen}
        onClose={() => setCheckinModal({ isOpen: false })}
        onConfirm={handleCheckin}
        title="Check In Book"
        message={`Are you sure you want to check in "${book.title}"?`}
        confirmText="Check In"
      />

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false })}
        onConfirm={handleDelete}
        title="Delete Book"
        message={`Are you sure you want to permanently delete "${book.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default BookDetails;
