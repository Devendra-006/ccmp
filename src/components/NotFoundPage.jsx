import React from 'react';
import { FileQuestion, Home, ArrowLeft } from 'lucide-react';

export default function NotFoundPage({ onGoHome }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '60px 20px',
      textAlign: 'center'
    }}>
      <div style={{
        width: '80px',
        height: '80px',
        borderRadius: '20px',
        background: '#fff1f2',
        color: '#e11d48',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '20px'
      }}>
        <FileQuestion size={40} />
      </div>
      <div className="badge badge-rose" style={{ marginBottom: '10px' }}>
        HTTP 404 • Resource Not Found
      </div>
      <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>
        Academic Module Not Found
      </h1>
      <p style={{ fontSize: '14px', color: '#64748b', maxWidth: '420px', lineHeight: 1.5, marginBottom: '24px' }}>
        The requested institutional portal view or resource does not exist or has been moved in the cloud catalog.
      </p>
      <button 
        className="btn btn-primary" 
        onClick={onGoHome}
        style={{ gap: '8px', padding: '10px 20px' }}
      >
        <Home size={16} />
        <span>Return to Dashboard Overview</span>
      </button>
    </div>
  );
}
