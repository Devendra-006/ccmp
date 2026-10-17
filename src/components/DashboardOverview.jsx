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
  examResults = null,
  onOpenReportCard, 
  onOpenSimulator, 
  onOpenPaymentModal,
  onSwitchRole
}) {
  const hasStudent = Boolean(currentStudent);

  // Compute pending dues dynamically
  const pendingDuesList = feesList.filter(f => f.status === 'PENDING');
  const pendingFee = pendingDuesList.reduce(
    (acc, f) => acc + ((f.amountInPaise ? f.amountInPaise / 100 : f.amount) || 0), 
    0
  );

  // SGPA Calculation or formatted value
  const sgpaValue = examResults?.sgpa !== undefined && examResults?.sgpa !== null
    ? Number(examResults.sgpa).toFixed(2)
    : (hasStudent && examResults?.results?.length > 0 ? '9.00' : null);

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
                  <span style={{ fontWeight: '600', color: '#0f172a' }}>Semester {currentStudent.semester || 4}</span>
                  <span className="meta-divider" />
                  <span>Roll No: <strong>{currentStudent.rollNo}</strong></span>
                  <span className="meta-divider" />
                  <span>Enrolment ID: <strong>{currentStudent.enrolmentNo}</strong></span>
                  <span className="meta-divider" />
                  <span>Section: <strong>{currentStudent.section || 'A'}</strong></span>
                </div>
              </>
            ) : (
              <>
                <h1>
                  <span>Student Portal</span>
                  <span className="badge badge-gray" style={{ fontSize: '11px' }}>
                    Awaiting Student Profile
                  </span>
                </h1>
                <p style={{ fontSize: '13px', color: '#64748b' }}>
                  Select an enrolled student or switch to Admin view to manage admissions.
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
            {sgpaValue || '--'}
          </div>
          <div className="stat-footer">
            {sgpaValue ? (
              <>
                <span className="badge badge-indigo">10.0 Scale</span>
                <span style={{ fontSize: '11.5px', color: '#64748b' }}>Class Rank: Top 5%</span>
              </>
            ) : (
              <>
                <span className="badge badge-gray">Not Evaluated</span>
                <span style={{ fontSize: '11.5px', color: '#64748b' }}>Pending Mid-Terms</span>
              </>
            )}
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
            <span>{pendingDuesList.length} Due Head{pendingDuesList.length === 1 ? '' : 's'}</span>
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

        {/* Right Column: Notices & Quick Pay */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Announcements Card */}
          <div className="white-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>
                Campus Notice Board
              </h3>
              {notices.length > 0 && (
                <span className="badge badge-indigo" style={{ fontSize: '11px' }}>
                  {notices.length} Active
                </span>
              )}
            </div>

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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', fontWeight: '700', color: '#4f46e5' }}>{n.category}</span>
                      <span style={{ fontSize: '10.5px', color: '#94a3b8' }}>
                        {new Date(n.created_at || Date.now()).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a', marginTop: '2px' }}>{n.title}</div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                      {n.body && n.body.length > 90 ? `${n.body.slice(0, 90)}...` : n.body}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Dues Action Card */}
          {pendingFee > 0 && (
            <div className="white-card" style={{ background: '#fff1f2', border: '1px solid #fecdd3' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <CreditCard size={18} color="#be123c" />
                <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#9f1239' }}>Payment Due Notice</h4>
              </div>
              <p style={{ fontSize: '12px', color: '#be123c', marginBottom: '12px' }}>
                You have ₹ {pendingFee.toLocaleString('en-IN')} pending for Semester 4. Settle dues before the deadline.
              </p>
              <button 
                className="btn btn-sm btn-primary" 
                onClick={onOpenPaymentModal}
                style={{ width: '100%', background: '#be123c', borderColor: '#be123c', justifyContent: 'center' }}
              >
                Clear Dues via Razorpay Sandbox
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
