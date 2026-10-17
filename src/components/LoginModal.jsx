import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  ShieldCheck, 
  GraduationCap, 
  UserCheck, 
  X, 
  Loader2, 
  AlertCircle,
  CheckCircle2,
  KeyRound
} from 'lucide-react';
import { apiLogin, apiRegister } from '../api/client';

export default function LoginModal({ isOpen, onClose, onLoginSuccess, initialRole = 'admin' }) {
  const [isRegister, setIsRegister] = useState(false);
  const [role, setRole] = useState(initialRole);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (isRegister) {
        const res = await apiRegister({ email, password, role, name });
        if (res.token) {
          localStorage.setItem('csms_auth_token', res.token);
          setSuccessMsg('Account registered successfully! Logging you in...');
          setTimeout(() => {
            onLoginSuccess(res.user, res.token);
            onClose();
          }, 800);
        }
      } else {
        const res = await apiLogin(email, password, role);
        if (res.token) {
          localStorage.setItem('csms_auth_token', res.token);
          setSuccessMsg('Authentication successful!');
          setTimeout(() => {
            onLoginSuccess(res.user, res.token);
            onClose();
          }, 600);
        }
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillAdminCredentials = () => {
    setEmail('admin@campus.edu');
    setPassword('Admin@123');
    setRole('admin');
    setIsRegister(false);
    setError('');
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 1100 }}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '440px', padding: '0', overflow: 'hidden', borderRadius: '16px' }}
      >
        {/* Header */}
        <div style={{ background: '#0f172a', color: '#ffffff', padding: '24px', position: 'relative' }}>
          <button 
            onClick={onClose}
            style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
          
          <div style={{ display: 'inline-flex', padding: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '10px', marginBottom: '12px' }}>
            <KeyRound size={22} color="#6366f1" />
          </div>
          <h2 style={{ fontSize: '18px', fontWeight: '800', margin: '0 0 4px', color: '#ffffff' }}>
            {isRegister ? 'Create Campus Account' : 'Portal Authentication'}
          </h2>
          <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>
            Secure Role-Based Identity via PostgreSQL & Supabase
          </p>
        </div>

        {/* Role Tabs */}
        <div style={{ display: 'flex', background: '#f8fafc', padding: '6px', borderBottom: '1px solid #e2e8f0', gap: '4px' }}>
          <button
            type="button"
            onClick={() => setRole('admin')}
            style={{
              flex: 1,
              padding: '8px 4px',
              border: 'none',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
              background: role === 'admin' ? '#0f172a' : 'transparent',
              color: role === 'admin' ? '#ffffff' : '#64748b',
              transition: 'all 0.15s ease'
            }}
          >
            Admin
          </button>
          <button
            type="button"
            onClick={() => setRole('teacher')}
            style={{
              flex: 1,
              padding: '8px 4px',
              border: 'none',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
              background: role === 'teacher' ? '#0f172a' : 'transparent',
              color: role === 'teacher' ? '#ffffff' : '#64748b',
              transition: 'all 0.15s ease'
            }}
          >
            Teacher
          </button>
          <button
            type="button"
            onClick={() => setRole('student')}
            style={{
              flex: 1,
              padding: '8px 4px',
              border: 'none',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
              background: role === 'student' ? '#0f172a' : 'transparent',
              color: role === 'student' ? '#ffffff' : '#64748b',
              transition: 'all 0.15s ease'
            }}
          >
            Student
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#b91c1c', fontSize: '13px' }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div style={{ background: '#ecfdf5', border: '1px solid #d1fae5', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#047857', fontSize: '13px' }}>
              <CheckCircle2 size={16} />
              <span>{successMsg}</span>
            </div>
          )}

          {isRegister && (
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                Full Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Dr. Jane Smith"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
              />
            </div>
          )}

          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
              Institutional Email
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                required
                placeholder={role === 'admin' ? 'admin@campus.edu' : `${role}@campus.edu`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
              />
              <Mail size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
            </div>
          </div>

          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
              />
              <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: 'none',
              background: '#4f46e5',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)'
            }}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Verifying credentials...</span>
              </>
            ) : (
              <span>{isRegister ? 'Register Account' : `Sign In as ${role.charAt(0).toUpperCase() + role.slice(1)}`}</span>
            )}
          </button>

          {/* Quick Admin Auto-fill Button */}
          {!isRegister && (
            <div style={{ marginTop: '14px', textAlign: 'center' }}>
              <button
                type="button"
                onClick={fillAdminCredentials}
                style={{
                  background: '#f1f5f9',
                  border: '1px dashed #cbd5e1',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  fontSize: '11px',
                  color: '#475569',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                ⚡ Quick Fill Seeded Admin (admin@campus.edu)
              </button>
            </div>
          )}

          <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '12px', color: '#64748b' }}>
            {isRegister ? (
              <span>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setIsRegister(false)}
                  style={{ background: 'none', border: 'none', color: '#4f46e5', fontWeight: '700', cursor: 'pointer', padding: 0 }}
                >
                  Sign In
                </button>
              </span>
            ) : (
              <span>
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => setIsRegister(true)}
                  style={{ background: 'none', border: 'none', color: '#4f46e5', fontWeight: '700', cursor: 'pointer', padding: 0 }}
                >
                  Create one
                </button>
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
