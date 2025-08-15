import React from 'react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", cancelText = "Cancel" }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div style={{ marginBottom: '24px' }}>
          <p>{message}</p>
        </div>

        <div className="btn-group">
          <button onClick={onConfirm} className="btn btn-cta">
            {confirmText}
          </button>
          <button onClick={onClose} className="btn btn-outline">
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
