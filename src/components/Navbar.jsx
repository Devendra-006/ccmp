import React, { useState } from 'react';
import { 
  GraduationCap, 
  Bell, 
  Users, 
  ShieldCheck, 
  UserCheck, 
  LogIn, 
  LogOut,
  Menu,
  ChevronDown,
  Briefcase,
  DollarSign
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
  onToggleMobileMenu
}) {
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // Derive human-readable display name
  const getUserDisplayName = () => {
    if (currentUser?.name) return currentUser.name;
    if (currentRole === 'student') return currentStudent?.name || 'Alex Rivera';
    if (currentRole === 'teacher') return 'Dr. Robert Vance';
    if (currentRole === 'admin') return 'System Administrator';
    if (currentRole === 'parent') return 'Mr. David Rivera';
    if (currentRole === 'accountant') return 'Finance Bursar';
    return currentUser?.email?.split('@')[0] || 'Campus User';
  };

  const getUserEmail = () => {
    if (currentUser?.email) return currentUser.email;
    if (currentRole === 'student') return 'student@campus.edu';
    if (currentRole === 'teacher') return 'robert.vance@campus.edu';
    if (currentRole === 'admin') return 'admin@campus.edu';
    if (currentRole === 'parent') return 'parent.rivera@gmail.com';
    if (currentRole === 'accountant') return 'accounts@campus.edu';
    return 'user@campus.edu';
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return <ShieldCheck size={16} />;
      case 'teacher': return <Users size={16} />;
      case 'parent': return <Users size={16} />;
      case 'accountant': return <DollarSign size={16} />;
      case 'student':
      default: return <UserCheck size={16} />;
    }
  };

  return (
    <header className="top-nav no-print">
      <div className="top-nav-left">
        {/* Mobile Hamburger Menu Toggle */}
        <button 
          className="mobile-hamburger-btn" 
          onClick={onToggleMobileMenu}
          aria-label="Toggle navigation menu"
          style={{ display: 'none', background: 'none', border: 'none', padding: '6px', cursor: 'pointer', color: '#0f172a' }}
        >
          <Menu size={22} />
        </button>

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

        {/* Demo Role Switcher Bar */}
        <div className="demo-role-switcher" style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', padding: '3px', borderRadius: '8px', border: '1px solid #e2e8f0', marginLeft: '8px' }}>
          <span style={{ fontSize: '10.5px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', padding: '2px 8px' }}>
            🎭 Demo:
          </span>
          {[
            { id: 'admin', label: 'Admin' },
            { id: 'teacher', label: 'Teacher' },
            { id: 'student', label: 'Student' },
            { id: 'parent', label: 'Parent' },
            { id: 'accountant', label: 'Accountant' }
          ].map(r => (
            <button
              key={r.id}
              onClick={() => onSwitchRole(r.id)}
              style={{
                padding: '4px 9px',
                borderRadius: '6px',
                border: 'none',
                background: currentRole === r.id ? '#0f172a' : 'transparent',
                color: currentRole === r.id ? '#ffffff' : '#64748b',
                fontSize: '11.5px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="top-nav-right">
        {/* Notifications Toggle with Unread Badge */}
        <button 
          className="icon-btn" 
          onClick={onToggleNotifications}
          aria-label={`View notifications (${unreadCount} unread)`}
          title="Campus Circulars & Broadcasts"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span 
              style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                background: '#4f46e5',
                color: '#ffffff',
                fontSize: '10px',
                fontWeight: '700',
                borderRadius: '10px',
                padding: '1px 5px',
                border: '2px solid #ffffff'
              }}
            >
              {unreadCount}
            </span>
          )}
        </button>

        {/* User Profile with Full Name & Email Tooltip */}
        <div style={{ position: 'relative' }}>
          <div 
            className="user-profile-btn" 
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            title={`Logged in as ${getUserEmail()} (${currentRole})`}
          >
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#eef2ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {getRoleIcon(currentRole)}
            </div>
            <div className="user-info-text">
              <div className="user-name">
                {getUserDisplayName()}
              </div>
              <div className="user-role" style={{ textTransform: 'capitalize', color: '#059669', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '3px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                <span>{currentRole}</span>
              </div>
            </div>
            <ChevronDown size={13} color="#94a3b8" />
          </div>

          {/* User Dropdown / Account Menu */}
          {showUserDropdown && (
            <div 
              style={{
                position: 'absolute',
                right: 0,
                top: '42px',
                width: '240px',
                background: '#ffffff',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
                padding: '12px',
                zIndex: 100
              }}
            >
              <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '8px', marginBottom: '8px' }}>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>
                  {getUserDisplayName()}
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', wordBreak: 'break-all' }}>
                  {getUserEmail()}
                </div>
                <div style={{ marginTop: '4px' }}>
                  <span className="badge badge-indigo" style={{ fontSize: '10px', textTransform: 'capitalize' }}>
                    Role: {currentRole}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => {
                    setShowUserDropdown(false);
                    onOpenLogin();
                  }}
                  style={{ width: '100%', justifyContent: 'flex-start', fontSize: '12px' }}
                >
                  <LogIn size={13} />
                  <span>Switch User / Sign In</span>
                </button>
                {currentUser && (
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => {
                      setShowUserDropdown(false);
                      onLogout();
                    }}
                    style={{ width: '100%', justifyContent: 'flex-start', fontSize: '12px', color: '#e11d48', borderColor: '#fecdd3' }}
                  >
                    <LogOut size={13} />
                    <span>Sign Out</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
