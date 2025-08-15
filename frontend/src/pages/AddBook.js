import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AddBook = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    genre: '',
    year: '',
    isbn: '',
    tags: '',
    description: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post('/api/books', {
        ...formData,
        year: formData.year ? parseInt(formData.year) : null
      });

      showMessage('Book added successfully!', 'success');
      
      // Reset form
      setFormData({
        title: '',
        author: '',
        genre: '',
        year: '',
        isbn: '',
        tags: '',
        description: ''
      });

      // Redirect to books page after a short delay
      setTimeout(() => {
        navigate('/books');
      }, 2000);

    } catch (error) {
      console.error('Error adding book:', error);
      showMessage(
        error.response?.data?.error || 'Error adding book', 
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/books');
  };

  return (
    <div>
      <h1>Add New Book</h1>

      {/* Message Alert */}
      {message.text && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="form">
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="form-input"
                required
                placeholder="Enter book title"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Author *</label>
              <input
                type="text"
                name="author"
                value={formData.author}
                onChange={handleChange}
                className="form-input"
                required
                placeholder="Enter author name"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Genre</label>
              <select
                name="genre"
                value={formData.genre}
                onChange={handleChange}
                className="form-select"
              >
                <option value="">Select a genre</option>
                <option value="Fiction">Fiction</option>
                <option value="Non-Fiction">Non-Fiction</option>
                <option value="Science Fiction">Science Fiction</option>
                <option value="Fantasy">Fantasy</option>
                <option value="Mystery">Mystery</option>
                <option value="Romance">Romance</option>
                <option value="Thriller">Thriller</option>
                <option value="Biography">Biography</option>
                <option value="History">History</option>
                <option value="Science">Science</option>
                <option value="Technology">Technology</option>
                <option value="Business">Business</option>
                <option value="Self-Help">Self-Help</option>
                <option value="Classic Literature">Classic Literature</option>
                <option value="Poetry">Poetry</option>
                <option value="Drama">Drama</option>
                <option value="Children's Books">Children's Books</option>
                <option value="Young Adult">Young Adult</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Publication Year</label>
              <input
                type="number"
                name="year"
                value={formData.year}
                onChange={handleChange}
                className="form-input"
                min="1000"
                max={new Date().getFullYear()}
                placeholder="e.g., 2023"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">ISBN</label>
            <input
              type="text"
              name="isbn"
              value={formData.isbn}
              onChange={handleChange}
              className="form-input"
              placeholder="e.g., 978-0-123456-78-9"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Tags</label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              className="form-input"
              placeholder="e.g., classic, literature, award-winning (comma-separated)"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="form-textarea"
              rows="4"
              placeholder="Brief description of the book..."
            />
          </div>

          <div className="btn-group">
            <button 
              type="submit" 
              className="btn btn-cta"
              disabled={loading}
            >
              {loading ? 'Adding Book...' : 'Add Book'}
            </button>
            <button 
              type="button" 
              onClick={handleCancel}
              className="btn btn-outline"
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      <div className="form">
        <h3 className="form-title">Tips</h3>
        <ul style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
          <li>Title and Author are required fields</li>
          <li>ISBN should be unique - duplicate ISBNs will be rejected</li>
          <li>Tags help with searching - separate multiple tags with commas</li>
          <li>Use clear, descriptive titles for better searchability</li>
        </ul>
      </div>
    </div>
  );
};

export default AddBook;
