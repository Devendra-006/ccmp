import React, { useState } from 'react';
import { 
  Users, 
  CalendarCheck, 
  Award, 
  CreditCard, 
  Bell, 
  Download, 
  CheckCircle2, 
  AlertTriangle,
  Phone,
  Mail,
  ShieldCheck,
  GraduationCap
} from 'lucide-react';

export default function ParentPortal({
  currentStudent,
  attendanceStats = { total: 30, attended: 29, percentage: 97 },
  examResults = null,
  feesList = [],
  notices = [],
  activeSection = 'overview',
  setActiveSection,
  onOpenReportCard,
  onInitiatePayment
}) {
  const [selectedWard, setSelectedWard] = useState('ward-1');
  const section = activeSection || 'overview';

  const pendingDues = feesList.filter(f => f.status === 'PENDING');
  const totalPendingAmount = pendingDues.reduce((acc, f) => acc + ((f.amountInPaise ? f.amountInPaise / 100 : f.amount) || 0), 0);

  const ward = currentStudent || {
    name: 'Alex Rivera',
    rollNo: '22CS001',
    enrolmentNo: 'EN2022-001',
    programmeName: 'B.Tech in Computer Science & Engineering',
    semester: 4,
    section: 'A',
    batch: '2024-2028'
  };

  const navItems = [
    { id: 'overview', label: 'Ward Overview', icon: Users },
    { id: 'attendance', label: 'Ward Attendance', icon: CalendarCheck },
    { id: 'academics', label: 'Grades & Marksheets', icon: Award },
    { id: 'fees', label: 'Fee Dues & Payment', icon: CreditCard },
    { id: 'notices', label: 'School Notices', icon: Bell }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Parent Portal Header */}
      <div className="white-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge badge-indigo">Role: Parent / Guardian</span>
              <span className="badge badge-emerald">Verified Guardian Account</span>
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', marginTop: '6px' }}>
              Ward Academic & Financial Monitor
            </h2>
            <p style={{ fontSize: '13px', color: '#64748b' }}>
              Real-time academic tracking, attendance compliance, examination gradebook, and fee payments.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Active Ward</div>
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>{ward.name}</div>
            </div>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#e0e7ff', color: '#4338ca', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>
              AR
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Pills */}
      <div style={{ display: 'flex', gap: '10px', overflowX: 'auto' }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isSelected = section === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveSection && setActiveSection(item.id)}
              className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-outline'}`}
              style={{ padding: '8px 16px', gap: '8px', background: isSelected ? '#0f172a' : '' }}
            >
              <Icon size={14} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Ward Profile & Quick Metrics (Shown in Overview, Attendance, and Academics) */}
      {(section === 'overview' || section === 'attendance' || section === 'academics') && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
          {/* Attendance Metric */}
          <div className="stat-card">
            <div className="stat-card-header">
              <span className="stat-label">Ward Attendance</span>
              <div className="stat-icon-wrap stat-icon-emerald"><CalendarCheck size={19} /></div>
            </div>
            <div className="stat-value" style={{ color: '#059669' }}>
              {attendanceStats.percentage}%
            </div>
            <div className="stat-footer">
              <span>{attendanceStats.attended || 29} of {attendanceStats.total || 30} Sessions</span>
              <span className={`badge ${attendanceStats.percentage >= 75 ? 'badge-emerald' : 'badge-amber'}`}>
                {attendanceStats.percentage >= 75 ? 'Eligible for Exams' : 'Attendance Shortage'}
              </span>
            </div>
          </div>

          {/* Academic GPA */}
          <div className="stat-card">
            <div className="stat-card-header">
              <span className="stat-label">Cumulative SGPA</span>
              <div className="stat-icon-wrap stat-icon-indigo"><Award size={19} /></div>
            </div>
            <div className="stat-value" style={{ color: '#4f46e5' }}>
              {examResults?.sgpa ? Number(examResults.sgpa).toFixed(2) : '9.25'}
            </div>
            <div className="stat-footer">
              <span className="badge badge-indigo">10.0 Scale</span>
              <span style={{ fontSize: '11.5px', color: '#64748b' }}>Class Rank: #1 in CSE-A</span>
            </div>
          </div>

          {/* Pending Fee */}
          <div className="stat-card">
            <div className="stat-card-header">
              <span className="stat-label">Outstanding Fees</span>
              <div className="stat-icon-wrap stat-icon-rose"><CreditCard size={19} /></div>
            </div>
            <div className="stat-value" style={{ color: totalPendingAmount > 0 ? '#e11d48' : '#059669' }}>
              ₹ {totalPendingAmount.toLocaleString('en-IN')}
            </div>
            <div className="stat-footer">
              <span>{pendingDues.length} Pending Invoice</span>
              <span className={`badge ${totalPendingAmount > 0 ? 'badge-rose' : 'badge-emerald'}`}>
                {totalPendingAmount > 0 ? 'Due Soon' : 'All Clear'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: (section === 'academics' || section === 'fees') ? '1fr' : 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
        {/* Ward Academic Progress Card (Overview & Academics) */}
        {(section === 'overview' || section === 'academics') && (
          <div className="white-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>
                  Mid-Term Assessment Grades
                </h3>
                <p style={{ fontSize: '12px', color: '#64748b' }}>Semester 4 Examination Results</p>
              </div>
              <button className="btn btn-indigo btn-sm" onClick={onOpenReportCard}>
                <Download size={14} />
                <span>Full Marksheet</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {(examResults?.results || [
                { subjectCode: 'CS401', subjectName: 'Data Structures & Algorithms', marksObtained: 46.5, grade: 'O', credits: 4 },
                { subjectCode: 'CS402', subjectName: 'Database Management Systems', marksObtained: 43.0, grade: 'A+', credits: 4 },
                { subjectCode: 'CS403', subjectName: 'Operating Systems & Architecture', marksObtained: 39.5, grade: 'A', credits: 3 },
                { subjectCode: 'CS404', subjectName: 'Computer Networks & Security', marksObtained: 44.0, grade: 'A+', credits: 3 }
              ]).map((sub, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>{sub.subjectName}</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>{sub.subjectCode} • {sub.credits} Credits</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#4f46e5' }}>{sub.marksObtained} / 50</div>
                  <span className="badge badge-emerald" style={{ fontSize: '10.5px' }}>Grade {sub.grade}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

        {/* Fee Payment Section (Overview & Fees) */}
        {(section === 'overview' || section === 'fees') && (
          <div className="white-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>
                  Direct Fee Settlement
                </h3>
                <p style={{ fontSize: '12px', color: '#64748b' }}>Safe online payment gateway via Razorpay sandbox</p>
              </div>
              <ShieldCheck size={20} color="#10b981" />
            </div>

            {pendingDues.length === 0 ? (
              <div style={{ padding: '32px 16px', textAlign: 'center', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                <CheckCircle2 size={36} color="#16a34a" style={{ margin: '0 auto 8px' }} />
                <div style={{ fontWeight: '700', color: '#166534' }}>All Academic Dues Cleared</div>
                <div style={{ fontSize: '12px', color: '#15803d', marginTop: '4px' }}>
                  No outstanding fees pending for Semester 4. Thank you!
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {pendingDues.map((fee) => {
                  const amt = fee.amountInPaise ? fee.amountInPaise / 100 : fee.amount;
                  return (
                    <div key={fee.id} style={{ padding: '14px', borderRadius: '8px', border: '1px solid #fecdd3', background: '#fff1f2', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '13.5px', fontWeight: '700', color: '#9f1239' }}>{fee.head}</div>
                        <div style={{ fontSize: '11px', color: '#be123c', marginTop: '2px' }}>
                          Due Date: {new Date(fee.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                        <div style={{ fontSize: '16px', fontWeight: '800', color: '#9f1239' }}>₹ {amt.toLocaleString('en-IN')}</div>
                        <button 
                          className="btn btn-sm btn-primary" 
                          onClick={() => onInitiatePayment(fee)}
                          style={{ background: '#be123c', borderColor: '#be123c' }}
                        >
                          <CreditCard size={13} />
                          <span>Pay Online</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Paid History snippet */}
            <div style={{ marginTop: '20px', borderTop: '1px solid #f1f5f9', paddingTop: '14px' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '8px' }}>
                Recent Cleared Payments
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: '#f8fafc', borderRadius: '6px' }}>
                <div>
                  <div style={{ fontSize: '12.5px', fontWeight: '600', color: '#0f172a' }}>Semester 4 Tuition Fee</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Receipt: RCP-2026-849102 • Paid via UPI</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#059669' }}>₹ 65,000</div>
                  <span className="badge badge-emerald" style={{ fontSize: '10px' }}>Settled</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Detailed Attendance View (Only in Attendance tab) */}
        {section === 'attendance' && (
          <div className="white-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>
                  Semester Attendance Registry & Audit
                </h3>
                <p style={{ fontSize: '12px', color: '#64748b' }}>Official compliance with statutory attendance requirements</p>
              </div>
              <span className="badge badge-emerald">Eligible for End-Term Exams</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '16px' }}>
              <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Total Concluded Classes</div>
                <div style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', marginTop: '2px' }}>{attendanceStats.total || 30}</div>
              </div>
              <div style={{ padding: '12px', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                <div style={{ fontSize: '11px', color: '#166534' }}>Attended Sessions</div>
                <div style={{ fontSize: '18px', fontWeight: '800', color: '#15803d', marginTop: '2px' }}>{attendanceStats.attended || 29}</div>
              </div>
              <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Absences / Leaves</div>
                <div style={{ fontSize: '18px', fontWeight: '800', color: '#e11d48', marginTop: '2px' }}>{(attendanceStats.total || 30) - (attendanceStats.attended || 29)}</div>
              </div>
              <div style={{ padding: '12px', background: '#ecfdf5', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
                <div style={{ fontSize: '11px', color: '#065f46' }}>Compliance Ratio</div>
                <div style={{ fontSize: '18px', fontWeight: '800', color: '#059669', marginTop: '2px' }}>{attendanceStats.percentage}%</div>
              </div>
            </div>

            <div style={{ padding: '12px 14px', background: '#ecfdf5', borderRadius: '8px', border: '1px solid #a7f3d0', fontSize: '12.5px', color: '#065f46' }}>
              ✓ <strong>Excellent Standing:</strong> Ward attendance is well above the mandatory 75% threshold mandated by university regulations. No remedial action is required.
            </div>
          </div>
        )}
      </div>

      {/* College Notice Board (Overview & Notices) */}
      {(section === 'overview' || section === 'notices') && (
        <div className="white-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <Bell size={18} color="#4f46e5" />
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>
              Institutional Circulars for Parents
            </h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
            {notices.map((n) => (
              <div key={n.id} style={{ padding: '14px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span className="badge badge-indigo" style={{ fontSize: '10px' }}>{n.category}</span>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>{new Date(n.created_at || Date.now()).toLocaleDateString()}</span>
                </div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a', marginTop: '4px' }}>{n.title}</div>
                <div style={{ fontSize: '12px', color: '#475569', marginTop: '4px', lineHeight: 1.4 }}>{n.body}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
