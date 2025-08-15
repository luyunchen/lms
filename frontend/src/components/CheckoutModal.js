import React, { useState } from 'react';

const CheckoutModal = ({ book, isOpen, onClose, onConfirm }) => {
  const [borrowerData, setBorrowerData] = useState({
    name: '',
    email: '',
    phone: '',
    dueDate: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (borrowerData.name && borrowerData.email && borrowerData.dueDate) {
      onConfirm(book.id, {
        borrower_name: borrowerData.name,
        borrower_email: borrowerData.email,
        borrower_phone: borrowerData.phone,
        due_date: borrowerData.dueDate
      });
      setBorrowerData({ name: '', email: '', phone: '', dueDate: '' });
    }
  };

  const handleChange = (e) => {
    setBorrowerData({
      ...borrowerData,
      [e.target.name]: e.target.value
    });
  };

  // Set default due date to 2 weeks from today
  React.useEffect(() => {
    if (isOpen) {
      const defaultDueDate = new Date();
      defaultDueDate.setDate(defaultDueDate.getDate() + 14);
      setBorrowerData(prev => ({
        ...prev,
        dueDate: defaultDueDate.toISOString().split('T')[0]
      }));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Check Out Book</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="book-info" style={{ marginBottom: '24px', padding: '16px', backgroundColor: '#f9f9f7', borderRadius: '4px' }}>
          <h3>{book?.title}</h3>
          <p>by {book?.author}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Borrower Name *</label>
            <input
              type="text"
              name="name"
              value={borrowerData.name}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <input
              type="email"
              name="email"
              value={borrowerData.email}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={borrowerData.phone}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Due Date *</label>
            <input
              type="date"
              name="dueDate"
              value={borrowerData.dueDate}
              onChange={handleChange}
              className="form-input"
              required
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="btn-group">
            <button type="submit" className="btn btn-cta">
              Confirm Check Out
            </button>
            <button type="button" onClick={onClose} className="btn btn-outline">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutModal;
