import React from 'react';
import { 
  GraduationCap, 
  Bell, 
  Sparkles,
  Users,
  ShieldCheck,
  UserCheck,
  LogIn,
  LogOut
} from 'lucide-react';

export default function Navbar({ 
  currentRole,
  onSwitchRole,
  currentStudent,
  currentUser,
  onOpenLogin,
  onLogout,
  onToggleNotifications, 
  unreadCount = 0, 
  onOpenReportCard,
  onOpenQuickFee
}) {
  return (
    <header className="top-nav no-print">
      <div className="top-nav-left">
        <div className="portal-brand">
          <div className="brand-icon-box">
            <GraduationCap size={20} />
          </div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: '700', letterSpacing: '-0.01em', color: '#0f172a' }}>
              Student Management Portal
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '500' }}>
              Cloud-Based Academic System
            </div>
          </div>
        </div>

        {/* Role Selector Pills */}
        <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', padding: '3px', borderRadius: '8px', border: '1px solid #e2e8f0', marginLeft: '12px' }}>
          <button
            onClick={() => onSwitchRole('admin')}
            style={{
              padding: '4px 10px',
              borderRadius: '6px',
              border: 'none',
              background: currentRole === 'admin' ? '#0f172a' : 'transparent',
              color: currentRole === 'admin' ? '#ffffff' : '#64748b',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            Admin View
          </button>
          <button
            onClick={() => onSwitchRole('teacher')}
            style={{
              padding: '4px 10px',
              borderRadius: '6px',
              border: 'none',
              background: currentRole === 'teacher' ? '#0f172a' : 'transparent',
              color: currentRole === 'teacher' ? '#ffffff' : '#64748b',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            Teacher View
          </button>
          <button
            onClick={() => onSwitchRole('student')}
            style={{
              padding: '4px 10px',
              borderRadius: '6px',
              border: 'none',
              background: currentRole === 'student' ? '#0f172a' : 'transparent',
              color: currentRole === 'student' ? '#ffffff' : '#64748b',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            Student View
          </button>
        </div>
      </div>

      <div className="top-nav-right">
        {currentRole === 'student' && (
          <>
            <button 
              className="btn btn-outline btn-sm" 
              onClick={onOpenReportCard}
              title="Official transcript"
            >
              <Sparkles size={14} color="#6366f1" />
              <span>Report Card</span>
            </button>

            <button 
              className="btn btn-outline btn-sm" 
              onClick={onOpenQuickFee}
              style={{ borderColor: '#fecdd3', color: '#be123c', background: '#fff1f2' }}
            >
              <span>Fee Portal</span>
            </button>
          </>
        )}

        {/* Notifications Toggle */}
        <button 
          className="icon-btn" 
          onClick={onToggleNotifications}
          aria-label="View notifications"
        >
          <Bell size={18} />
          {unreadCount > 0 && <span className="notification-dot" />}
        </button>

        {/* User Auth Info / Login Trigger */}
        {currentUser ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="user-profile-btn" style={{ padding: '4px 10px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#eef2ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {currentUser.role === 'admin' ? <ShieldCheck size={16} /> : currentUser.role === 'teacher' ? <Users size={16} /> : <UserCheck size={16} />}
              </div>
              <div className="user-info-text">
                <div className="user-name" style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {currentUser.email.split('@')[0]}
                </div>
                <div className="user-role" style={{ textTransform: 'capitalize', color: '#10b981', fontWeight: '700' }}>
                  ● {currentUser.role}
                </div>
              </div>
            </div>
            <button
              onClick={onLogout}
              title="Sign Out"
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '6px 8px',
                cursor: 'pointer',
                color: '#64748b',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '11px',
                fontWeight: '600'
              }}
            >
              <LogOut size={14} />
              <span>Logout</span>
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenLogin}
            className="btn btn-primary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <LogIn size={14} />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
}
