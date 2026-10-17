import React from 'react';
import { 
  LayoutDashboard, 
  CalendarCheck, 
  Clock, 
  GraduationCap, 
  CreditCard, 
  FileText, 
  BellRing,
  HelpCircle,
  ShieldCheck
} from 'lucide-react';
import { studentProfile } from '../data/mockData';

export default function Sidebar({ activeTab, setActiveTab }) {
  const menuItems = [
    { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
    { 
      id: 'attendance', 
      label: 'Attendance Tracker', 
      icon: CalendarCheck,
      badge: studentProfile.overallAttendance < 75 ? 'Warning' : null,
      badgeColor: 'badge-amber'
    },
    { id: 'timetable', label: 'Weekly Timetable', icon: Clock },
    { id: 'exams', label: 'Exams & Grades', icon: GraduationCap },
    { 
      id: 'fees', 
      label: 'Fees & Payments', 
      icon: CreditCard,
      badge: '₹12.5k Due',
      badgeColor: 'badge-rose'
    },
    { id: 'assignments', label: 'Assignments', icon: FileText },
    { id: 'notices', label: 'Notice Board', icon: BellRing, badge: '2 New', badgeColor: 'badge-indigo' },
  ];

  return (
    <aside className="sidebar no-print">
      <div className="sidebar-heading">Academic Portal</div>
      
      <ul className="nav-list">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <li key={item.id}>
              <button 
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setActiveTab(item.id)}
              >
                <div className="nav-item-left">
                  <Icon size={18} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`badge ${item.badgeColor}`} style={{ fontSize: '11px', padding: '2px 7px' }}>
                    {item.badge}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      <div className="sidebar-footer-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <ShieldCheck size={16} color="#10b981" />
          <span style={{ fontSize: '12px', fontWeight: '700', color: '#0f172a' }}>Academic Status</span>
        </div>
        <div style={{ fontSize: '12px', color: '#475569', lineHeight: 1.4 }}>
          Enrolled in <strong>CSE-A</strong> with all prerequisites cleared.
        </div>
        <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b' }}>
          <span>Enrolment ID</span>
          <span style={{ fontFamily: 'monospace', fontWeight: '600' }}>{studentProfile.enrolmentNo}</span>
        </div>
      </div>
    </aside>
  );
}
