import React from 'react';
import { 
  LayoutDashboard, 
  CalendarCheck, 
  Clock, 
  GraduationCap, 
  CreditCard, 
  FileText, 
  BellRing,
  Building2,
  BookOpen,
  Users,
  ShieldCheck,
  Server,
  Receipt,
  Award,
  CheckCircle2,
  FolderOpen
} from 'lucide-react';

export default function Sidebar({ 
  currentRole = 'student', 
  activeTab, 
  setActiveTab,
  currentStudent = null,
  feesList = [],
  notices = [],
  attendanceStats = { total: 0, attended: 0, percentage: 0 },
  isOpenMobile = false,
  onCloseMobile
}) {
  // Compute dynamic pending fee dues
  const pendingDues = feesList.filter(f => f.status === 'PENDING');
  const pendingAmount = pendingDues.reduce((acc, f) => acc + ((f.amountInPaise ? f.amountInPaise / 100 : f.amount) || 0), 0);
  
  // Format fee badge: e.g. "₹12.5k Due" if > 0, otherwise null
  const feeBadge = pendingAmount > 0 
    ? `₹${pendingAmount >= 1000 ? (pendingAmount / 1000).toFixed(1) + 'k' : pendingAmount} Due`
    : null;

  // Format notices badge: e.g. "3 New" if > 0, otherwise null
  const noticeBadge = notices.length > 0 ? `${notices.length} New` : null;

  // Format attendance badge
  const attendanceBadge = attendanceStats.total > 0 && attendanceStats.percentage < 75 ? 'Warning' : null;

  // Navigation Items per role
  const getNavItems = () => {
    switch (currentRole) {
      case 'admin':
        return [
          { id: 'overview', label: '0. Institution Overview', icon: LayoutDashboard },
          { id: 'academic', label: '1. Curriculums & Subjects', icon: BookOpen },
          { id: 'students', label: '2. Student Directory', icon: Users },
          { id: 'fees', label: '3. Fee Structures', icon: CreditCard },
          { id: 'notices', label: '4. Campus Notice Board', icon: BellRing, badge: noticeBadge, badgeColor: 'badge-indigo' },
          { id: 'cloud', label: '5. Cloud Health & Docker', icon: Server, badge: 'Healthy', badgeColor: 'badge-emerald' }
        ];

      case 'teacher':
        return [
          { id: 'overview', label: 'Faculty Overview', icon: LayoutDashboard },
          { id: 'attendance', label: 'Daily Attendance Register', icon: CalendarCheck },
          { id: 'marks', label: 'Marks & Gradebook Entry', icon: Award },
          { id: 'roster', label: 'Class Student Rosters', icon: Users },
          { id: 'notices', label: 'Campus Circulars', icon: BellRing, badge: noticeBadge, badgeColor: 'badge-indigo' }
        ];

      case 'parent':
        return [
          { id: 'overview', label: 'Ward Overview', icon: LayoutDashboard },
          { 
            id: 'attendance', 
            label: 'Ward Attendance', 
            icon: CalendarCheck,
            badge: attendanceBadge,
            badgeColor: 'badge-amber'
          },
          { id: 'academics', label: 'Grades & Marksheets', icon: GraduationCap },
          { 
            id: 'fees', 
            label: 'Fee Dues & Payment', 
            icon: CreditCard,
            badge: feeBadge,
            badgeColor: 'badge-rose'
          },
          { id: 'notices', label: 'School Notices', icon: BellRing, badge: noticeBadge, badgeColor: 'badge-indigo' }
        ];

      case 'accountant':
        return [
          { id: 'overview', label: 'Finance Dashboard', icon: LayoutDashboard },
          { 
            id: 'dues', 
            label: 'Student Fee Ledger', 
            icon: Receipt,
            badge: feeBadge,
            badgeColor: 'badge-rose'
          },
          { id: 'structures', label: 'Fee Structures Config', icon: CreditCard },
          { id: 'notices', label: 'Circulars & Notices', icon: BellRing, badge: noticeBadge, badgeColor: 'badge-indigo' }
        ];

      case 'student':
      default:
        return [
          { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
          { 
            id: 'attendance', 
            label: 'Attendance Tracker', 
            icon: CalendarCheck,
            badge: attendanceBadge,
            badgeColor: 'badge-amber'
          },
          { id: 'timetable', label: 'Weekly Timetable', icon: Clock },
          { id: 'exams', label: 'Exams & Grades', icon: GraduationCap },
          { 
            id: 'fees', 
            label: 'Fees & Payments', 
            icon: CreditCard,
            badge: feeBadge,
            badgeColor: 'badge-rose'
          },
          { id: 'assignments', label: 'Assignments', icon: FileText },
          { id: 'notices', label: 'Notice Board', icon: BellRing, badge: noticeBadge, badgeColor: 'badge-indigo' }
        ];
    }
  };

  const menuItems = getNavItems();

  return (
    <aside className={`sidebar no-print ${isOpenMobile ? 'mobile-open' : ''}`}>
      <div className="sidebar-heading" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>
          {currentRole === 'admin' ? 'Administration' :
           currentRole === 'teacher' ? 'Faculty Portal' :
           currentRole === 'parent' ? 'Guardian Portal' :
           currentRole === 'accountant' ? 'Accounts & Finance' :
           'Academic Portal'}
        </span>
        {onCloseMobile && (
          <button 
            onClick={onCloseMobile}
            className="mobile-close-btn"
            style={{ display: 'none', background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}
          >
            ✕
          </button>
        )}
      </div>
      
      <ul className="nav-list">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <li key={item.id}>
              <button 
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab(item.id);
                  if (onCloseMobile) onCloseMobile();
                }}
              >
                <div className="nav-item-left">
                  <Icon size={18} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`badge ${item.badgeColor || 'badge-gray'}`} style={{ fontSize: '11px', padding: '2px 7px' }}>
                    {item.badge}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      {/* Dynamic Role-Based Status Footer Box */}
      <div className="sidebar-footer-card">
        {currentRole === 'student' ? (
          currentStudent ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <ShieldCheck size={16} color="#10b981" />
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#0f172a' }}>Academic Status</span>
              </div>
              <div style={{ fontSize: '12px', color: '#475569', lineHeight: 1.4 }}>
                Enrolled in <strong>{currentStudent.programmeCode || 'CSE-A'}</strong> (Sec {currentStudent.section || 'A'})
              </div>
              <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b' }}>
                <span>Enrolment ID</span>
                <span style={{ fontFamily: 'monospace', fontWeight: '600' }}>{currentStudent.enrolmentNo}</span>
              </div>
            </>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <Users size={16} color="#6366f1" />
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#0f172a' }}>Student Session</span>
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.4 }}>
                Awaiting student profile assignment. Switch role or select user.
              </div>
            </>
          )
        ) : currentRole === 'admin' ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <ShieldCheck size={16} color="#4f46e5" />
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#0f172a' }}>System Registry</span>
            </div>
            <div style={{ fontSize: '12px', color: '#475569', lineHeight: 1.4 }}>
              PostgreSQL Cloud DB Connected. Full master privileges active.
            </div>
          </>
        ) : currentRole === 'teacher' ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <CheckCircle2 size={16} color="#059669" />
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#0f172a' }}>Faculty Authorization</span>
            </div>
            <div style={{ fontSize: '12px', color: '#475569', lineHeight: 1.4 }}>
              Active Teaching Term 2026. Attendance & Marks submission enabled.
            </div>
          </>
        ) : currentRole === 'parent' ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <ShieldCheck size={16} color="#6366f1" />
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#0f172a' }}>Guardian Link</span>
            </div>
            <div style={{ fontSize: '12px', color: '#475569', lineHeight: 1.4 }}>
              Ward: <strong>{currentStudent?.name || 'Alex Rivera'}</strong> (Roll: {currentStudent?.rollNo || '22CS001'})
            </div>
          </>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Receipt size={16} color="#e11d48" />
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#0f172a' }}>Bursar System</span>
            </div>
            <div style={{ fontSize: '12px', color: '#475569', lineHeight: 1.4 }}>
              Razorpay Test Sandbox configured for live settlements.
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
