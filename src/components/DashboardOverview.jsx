import React from 'react';
import { 
  CalendarCheck, 
  Award, 
  BookOpen, 
  Receipt, 
  Clock, 
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Calculator,
  Download,
  CreditCard,
  Mail,
  UserCheck,
  UserPlus,
  Info
} from 'lucide-react';

export default function DashboardOverview({ 
  currentStudent,
  attendanceStats = { total: 0, attended: 0, percentage: 0 },
  subjects = [],
  feesList = [],
  notices = [],
  onOpenReportCard, 
  onOpenSimulator, 
  onOpenPaymentModal,
  onSwitchRole
}) {
  const hasStudent = Boolean(currentStudent);

  const pendingFee = feesList.filter(f => f.status === 'PENDING').reduce((acc, f) => acc + (f.amountInPaise / 100), 0);

  return (
    <div className="dashboard-overview-container">
      {/* Student Identity Card Banner */}
      <section className="student-hero">
        <div className="hero-profile-group">
          <div style={{ width: '64px', height: '64px', borderRadius: '12px', background: '#eef2ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <UserCheck size={32} />
          </div>
          <div className="hero-details">
            {hasStudent ? (
              <>
                <h1>
                  <span>{currentStudent.name}</span>
                  <span className="badge badge-emerald" style={{ fontSize: '11px', fontWeight: '700' }}>
                    Active Enrolment
                  </span>
                </h1>
                <div className="hero-meta-row">
                  <span style={{ fontWeight: '600', color: '#0f172a' }}>Semester {currentStudent.semester}</span>
                  <span className="meta-divider" />
                  <span>Roll No: <strong>{currentStudent.rollNo}</strong></span>
                  <span className="meta-divider" />
                  <span>Enrolment ID: <strong>{currentStudent.enrolmentNo}</strong></span>
                  <span className="meta-divider" />
                  <span>Section: <strong>{currentStudent.section}</strong></span>
                </div>
              </>
            ) : (
              <>
                <h1>
                  <span>Student Portal</span>
                  <span className="badge badge-gray" style={{ fontSize: '11px' }}>
                    Zero Enrolments (Uninitialized)
                  </span>
                </h1>
                <p style={{ fontSize: '13px', color: '#64748b' }}>
                  No student records loaded. Switch to Admin view to enroll records, or select an active user.
                </p>
              </>
            )}
          </div>
        </div>

        <div className="hero-actions">
          {hasStudent ? (
            <>
              <button className="btn btn-outline" onClick={onOpenSimulator}>
                <Calculator size={15} color="#059669" />
                <span>Attendance Simulator</span>
              </button>
              <button className="btn btn-indigo" onClick={onOpenReportCard}>
                <Download size={15} />
                <span>View Marksheet</span>
              </button>
            </>
          ) : (
            <button className="btn btn-indigo" onClick={() => onSwitchRole('admin')}>
              <UserPlus size={15} />
              <span>Open Admin Registry</span>
            </button>
          )}
        </div>
      </section>

      {/* 4 Feature Stat Cards */}
      <section className="stats-grid">
        {/* Attendance Card */}
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Overall Attendance</span>
            <div className="stat-icon-wrap stat-icon-emerald"><CalendarCheck size={19} /></div>
          </div>
          <div className="stat-value" style={{ color: '#059669' }}>
            {attendanceStats.percentage}%
          </div>
          <div className="stat-footer">
            <span>{attendanceStats.attended} of {attendanceStats.total} Sessions</span>
            <span className={`badge ${attendanceStats.percentage >= 75 ? 'badge-emerald' : 'badge-amber'}`}>
              {attendanceStats.total === 0 ? 'No Classes' : attendanceStats.percentage >= 75 ? 'Eligible' : 'Warning'}
            </span>
          </div>
        </div>

        {/* CGPA Card */}
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Semester SGPA</span>
            <div className="stat-icon-wrap stat-icon-indigo"><Award size={19} /></div>
          </div>
          <div className="stat-value" style={{ color: '#4f46e5' }}>
            {hasStudent ? '0.00' : '--'}
          </div>
          <div className="stat-footer">
            <span className="badge badge-indigo">10.0 Scale</span>
            <span style={{ fontSize: '11.5px', color: '#64748b' }}>Pending Evaluation</span>
          </div>
        </div>

        {/* Courses Card */}
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Registered Courses</span>
            <div className="stat-icon-wrap stat-icon-sky"><BookOpen size={19} /></div>
          </div>
          <div className="stat-value">
            {subjects.length} <span style={{ fontSize: '15px', color: '#94a3b8', fontWeight: '500' }}>Subjects</span>
          </div>
          <div className="stat-footer">
            <span>Curriculum active</span>
            <span className="badge badge-sky">{subjects.reduce((a, b) => a + (b.credits || 0), 0)} Credits</span>
          </div>
        </div>

        {/* Fee Dues Card */}
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Outstanding Fee Dues</span>
            <div className="stat-icon-wrap stat-icon-rose"><Receipt size={19} /></div>
          </div>
          <div className="stat-value" style={{ color: pendingFee > 0 ? '#e11d48' : '#059669' }}>
            ₹ {pendingFee.toLocaleString('en-IN')}
          </div>
          <div className="stat-footer">
            <span>{feesList.filter(f => f.status === 'PENDING').length} Due Heads</span>
            <span className={`badge ${pendingFee > 0 ? 'badge-rose' : 'badge-emerald'}`}>
              {pendingFee > 0 ? 'Action Req.' : 'Zero Dues'}
            </span>
          </div>
        </div>
      </section>

      {/* Two Column Layout */}
      <div className="dashboard-grid">
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Registered Courses Card */}
          <div className="white-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>
                  Enrolled Subjects & Faculty Roster
                </h2>
                <p style={{ fontSize: '12px', color: '#64748b' }}>
                  Live curriculum linked to the institutional catalog
                </p>
              </div>
            </div>

            {subjects.length === 0 ? (
              <div style={{ padding: '36px 16px', textAlign: 'center', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                <BookOpen size={32} color="#94a3b8" style={{ margin: '0 auto 8px' }} />
                <div style={{ fontWeight: '600', color: '#0f172a' }}>No courses added yet</div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                  Switch to Admin view to define subjects and academic curriculums.
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {subjects.map((sub) => (
                  <div key={sub.id} className="schedule-item">
                    <div className="period-pill">
                      {sub.code.slice(0, 3)}
                    </div>
                    <div className="schedule-content">
                      <div className="schedule-title">
                        <span>{sub.name}</span>
                        <span className="badge badge-gray">{sub.code}</span>
                      </div>
                      <div className="schedule-meta">
                        <span>{sub.credits} Academic Credits</span>
                        <span>•</span>
                        <span>Semester {sub.semester}</span>
                        <span>•</span>
                        <span style={{ textTransform: 'capitalize' }}>{sub.type}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Notices & Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Announcements Card */}
          <div className="white-card">
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', marginBottom: '12px' }}>
              Campus Notice Board
            </h3>

            {notices.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                <Info size={24} color="#94a3b8" style={{ margin: '0 auto 6px' }} />
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>No circulars published yet</div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                  Admin notices will display here once published.
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {notices.map((n) => (
                  <div key={n.id} style={{ padding: '12px', borderRadius: '6px', border: '1px solid #f1f5f9', borderLeft: '3px solid #4f46e5' }}>
                    <div style={{ fontSize: '11px', fontWeight: '700', color: '#4f46e5' }}>{n.category}</div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a', marginTop: '2px' }}>{n.title}</div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{n.body.slice(0, 80)}...</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
