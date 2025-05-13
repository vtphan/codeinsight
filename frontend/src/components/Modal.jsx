// src/components/Modal.jsx
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="modal-overlay" 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}
      onClick={onClose}
    >
      <div 
        className="modal-content"
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '20px',
          width: '80%',
          maxWidth: '800px',
          maxHeight: '80vh',
          overflowY: 'auto',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          position: 'relative'
        }}
        onClick={e => e.stopPropagation()}
      >
        <div 
          className="modal-header"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '15px',
            borderBottom: '1px solid #eee',
            paddingBottom: '10px'
          }}
        >
          <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{title}</h3>
          <button 
            className="close-button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '5px'
            }}
          >
            <X size={20} />
          </button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;