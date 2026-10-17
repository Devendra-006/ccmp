import React, { useState } from 'react';
import { 
  CalendarCheck, 
  Award, 
  CheckCircle2, 
  Users, 
  BookOpen, 
  Plus, 
  ShieldCheck,
  AlertCircle,
  Check,
  X,
  Clock,
  Sparkles,
  AlertTriangle,
  LayoutDashboard
} from 'lucide-react';

export default function TeacherPortal({
  subjects = [],
  students = [],
  onMarkAttendance,
  onRecordMarks,
  activeTab = 'overview',
  setActiveTab
}) {
  const currentTab = activeTab || 'overview';
  const [selectedSubjectId, setSelectedSubjectId] = useState(subjects[0]?.id || '');
  const [period, setPeriod] = useState('01');
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceRoster, setAttendanceRoster] = useState({}); // { studentId: 'present' | 'absent' | 'late' }
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [markedSessions, setMarkedSessions] = useState(new Set()); // key: `${subId}_${date}_${period}`

  // Marks state
  const [examName, setExamName] = useState('Mid-Term Assessment 2026');
  const [examType, setExamType] = useState('mid_term');
  const [maxMarks, setMaxMarks] = useState(50);
  const [marksSheet, setMarksSheet] = useState({}); // { studentId: number }

  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  // Check if current slot was already marked
  const sessionKey = `${selectedSubjectId}_${attendanceDate}_${period}`;
  const isAlreadyMarked = markedSessions.has(sessionKey);

  // Compute live count
  const totalStudents = students.length;
  const presentCount = students.filter(s => (attendanceRoster[s.id] || 'present') === 'present').length;
  const absentCount = students.filter(s => attendanceRoster[s.id] === 'absent').length;
  const lateCount = students.filter(s => attendanceRoster[s.id] === 'late').length;

  const handleToggleAttendance = (studentId, status) => {
    setAttendanceRoster(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  // Mark all present in 1 click
  const handleMarkAllPresent = () => {
    const allPres = {};
    students.forEach(s => {
      allPres[s.id] = 'present';
    });
    setAttendanceRoster(allPres);
    showToast(`Marked all ${students.length} students as Present`);
  };

  const handleOpenConfirm = (e) => {
    e.preventDefault();
    if (!selectedSubjectId) {
      alert('Please select a course / subject first');
      return;
    }
    if (students.length === 0) {
      alert('No students enrolled in registry');
      return;
    }
    if (isAlreadyMarked) {
      alert('Attendance for this course, date, and period has already been recorded.');
      return;
    }
    setShowConfirmModal(true);
  };

  const handleConfirmSaveAttendance = async () => {
    const records = students.map(s => ({
      studentId: s.id,
      status: attendanceRoster[s.id] || 'present'
    }));

    await onMarkAttendance({
      subjectId: selectedSubjectId,
      date: attendanceDate,
      period,
      records
    });

    setMarkedSessions(prev => new Set([...prev, sessionKey]));
    setShowConfirmModal(false);
    showToast(`Attendance recorded: ${presentCount} Present, ${absentCount} Absent`);
  };

  const handleSaveMarks = (e) => {
    e.preventDefault();
    if (!selectedSubjectId) {
      alert('Please select a course / subject first');
      return;
    }

    const marksList = students.map(s => ({
      studentId: s.id,
      marksObtained: parseFloat(marksSheet[s.id] || 40)
    }));

    onRecordMarks({
      subjectId: selectedSubjectId,
      name: examName,
      type: examType,
      maxMarks,
      marksList
    });

    showToast(`Examination marks saved for ${marksList.length} students`);
  };

  const currentSubjectObj = subjects.find(s => s.id === selectedSubjectId) || subjects[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div className="white-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge badge-emerald">Role: Faculty / Course Instructor</span>
              <span className="badge badge-sky">Semester 4 Teaching Term</span>
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', marginTop: '6px' }}>
              Faculty Classroom & Gradebook Portal
            </h2>
            <p style={{ fontSize: '13px', color: '#64748b' }}>
              Mark period attendance, verify student rosters, and publish internal examination marks to the university transcript ledger.
            </p>
          </div>

          {toastMsg && (
            <div className="badge badge-emerald" style={{ padding: '8px 16px', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={16} />
              <span>{toastMsg}</span>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', overflowX: 'auto' }}>
        <button
          className={`btn btn-sm ${currentTab === 'overview' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab && setActiveTab('overview')}
          style={{ background: currentTab === 'overview' ? '#0f172a' : '' }}
        >
          <LayoutDashboard size={14} />
          <span>Faculty Overview</span>
        </button>
        <button
          className={`btn btn-sm ${currentTab === 'attendance' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab && setActiveTab('attendance')}
          style={{ background: currentTab === 'attendance' ? '#0f172a' : '' }}
        >
          <CalendarCheck size={14} />
          <span>Daily Attendance Register</span>
        </button>
        <button
          className={`btn btn-sm ${currentTab === 'marks' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab && setActiveTab('marks')}
          style={{ background: currentTab === 'marks' ? '#0f172a' : '' }}
        >
          <Award size={14} />
          <span>Marks Entry Register</span>
        </button>
        <button
          className={`btn btn-sm ${currentTab === 'roster' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab && setActiveTab('roster')}
          style={{ background: currentTab === 'roster' ? '#0f172a' : '' }}
        >
          <Users size={14} />
          <span>Student Roster ({students.length})</span>
        </button>
      </div>

      {/* TAB 0: FACULTY OVERVIEW */}
      {currentTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Quick Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-label">Assigned Students</span>
                <div className="stat-icon-wrap stat-icon-indigo"><Users size={19} /></div>
              </div>
              <div className="stat-value" style={{ color: '#0f172a' }}>{students.length}</div>
              <div className="stat-footer">
                <span className="badge badge-indigo">Class Section CSE-A</span>
                <span style={{ fontSize: '11.5px', color: '#64748b' }}>Semester 4</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-label">Section Attendance Avg</span>
                <div className="stat-icon-wrap stat-icon-emerald"><CheckCircle2 size={19} /></div>
              </div>
              <div className="stat-value" style={{ color: '#059669' }}>93.8%</div>
              <div className="stat-footer">
                <span className="badge badge-emerald">Optimal Range</span>
                <span style={{ fontSize: '11.5px', color: '#64748b' }}>Regulatory Target &ge;75%</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-label">Courses Instructed</span>
                <div className="stat-icon-wrap stat-icon-sky"><BookOpen size={19} /></div>
              </div>
              <div className="stat-value" style={{ color: '#0284c7' }}>{subjects.length}</div>
              <div className="stat-footer">
                <span className="badge badge-sky">Curriculum Active</span>
                <span style={{ fontSize: '11.5px', color: '#64748b' }}>Core Technical Labs</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-label">Internal Assessments</span>
                <div className="stat-icon-wrap stat-icon-amber"><Award size={19} /></div>
              </div>
              <div className="stat-value" style={{ color: '#d97706' }}>Published</div>
              <div className="stat-footer">
                <span className="badge badge-amber">Mid-Term 2026</span>
                <span style={{ fontSize: '11.5px', color: '#64748b' }}>Transcript Ledger Updated</span>
              </div>
            </div>
          </div>

          {/* Today's Teaching Schedule & Low Attendance Watchlist */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
            {/* Teaching Schedule */}
            <div className="white-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={16} color="#4f46e5" />
                    <span>Today's Lecture & Lab Slots</span>
                  </h3>
                  <p style={{ fontSize: '12px', color: '#64748b' }}>Daily academic timetable and room allocations</p>
                </div>
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={() => setActiveTab && setActiveTab('attendance')}
                >
                  <CalendarCheck size={14} />
                  <span>Take Attendance</span>
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { code: 'CS401', name: 'Data Structures & Algorithms', time: '09:00 - 10:00 AM', room: 'Lecture Hall 302', section: 'CSE-A', period: 'Period 1' },
                  { code: 'CS402', name: 'Database Management Systems', time: '10:00 - 11:00 AM', room: 'Software Computing Lab 1', section: 'CSE-A', period: 'Period 2' },
                  { code: 'CS403', name: 'Operating Systems Architecture', time: '01:00 - 02:00 PM', room: 'Lecture Hall 304', section: 'CSE-B', period: 'Period 4' }
                ].map((slot, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="badge badge-indigo" style={{ fontSize: '10.5px' }}>{slot.period}</span>
                        <span style={{ fontSize: '13.5px', fontWeight: '700', color: '#0f172a' }}>{slot.name}</span>
                      </div>
                      <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '4px' }}>
                        {slot.code} • {slot.section} • {slot.room}
                      </div>
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: '600', color: '#4f46e5' }}>{slot.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Attendance Risk Watchlist */}
            <div className="white-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <AlertTriangle size={16} color="#e11d48" />
                    <span>Attendance Warning Watchlist</span>
                  </h3>
                  <p style={{ fontSize: '12px', color: '#64748b' }}>Students approaching the 75% regulatory barrier</p>
                </div>
                <span className="badge badge-rose">2 Students Flagged</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ padding: '12px 14px', background: '#fff1f2', borderRadius: '8px', border: '1px solid #fecdd3', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#9f1239' }}>David Miller (22CS004)</div>
                    <div style={{ fontSize: '11px', color: '#e11d48' }}>Current Attendance: 70.0% • 9 absences recorded</div>
                  </div>
                  <span className="badge badge-rose" style={{ fontSize: '11px' }}>Notice Sent</span>
                </div>

                <div style={{ padding: '12px 14px', background: '#fff1f2', borderRadius: '8px', border: '1px solid #fecdd3', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#9f1239' }}>Grace Lee (22CS007)</div>
                    <div style={{ fontSize: '11px', color: '#e11d48' }}>Current Attendance: 68.3% • 10 absences recorded</div>
                  </div>
                  <span className="badge badge-rose" style={{ fontSize: '11px' }}>Notice Sent</span>
                </div>

                <div style={{ padding: '12px 14px', background: '#ecfdf5', borderRadius: '8px', border: '1px solid #a7f3d0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#065f46' }}>Alex Rivera (22CS001) - Top Performer</div>
                    <div style={{ fontSize: '11px', color: '#059669' }}>Current Attendance: 97.0% • 29 of 30 classes attended</div>
                  </div>
                  <span className="badge badge-emerald" style={{ fontSize: '11px' }}>Compliant</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: ROSTER */}
      {currentTab === 'roster' && (
        <div className="white-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>
                Class Section CSE-A Master Roster
              </h3>
              <p style={{ fontSize: '12px', color: '#64748b' }}>
                Enrolled students in 4th Semester Computer Science & Engineering
              </p>
            </div>
            <span className="badge badge-indigo">{students.length} Students Active</span>
          </div>

          <div className="clean-table-container">
            <table className="clean-table">
              <thead>
                <tr>
                  <th>Roll No</th>
                  <th>Student Name</th>
                  <th>Enrolment ID</th>
                  <th>Institutional Email</th>
                  <th>Section</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {students.map(s => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: '700', color: '#4f46e5' }}>{s.rollNo}</td>
                    <td style={{ fontWeight: '600', color: '#0f172a' }}>{s.name}</td>
                    <td style={{ fontSize: '12px', color: '#64748b' }}>{s.enrolmentNo}</td>
                    <td style={{ fontSize: '12px', color: '#64748b' }}>{s.email}</td>
                    <td>{s.section || 'A'}</td>
                    <td>
                      <span className="badge badge-emerald">Enrolled</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 1: ATTENDANCE */}
      {currentTab === 'attendance' && (
        <div className="white-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>
                Period Attendance Register
              </h3>
              <p style={{ fontSize: '12px', color: '#64748b' }}>
                Select subject, session date, and period slot to take attendance
              </p>
            </div>

            {/* Quick "Mark All Present" Action */}
            {students.length > 0 && !isAlreadyMarked && (
              <button 
                type="button" 
                className="btn btn-outline btn-sm" 
                onClick={handleMarkAllPresent}
                style={{ borderColor: '#10b981', color: '#047857', background: '#ecfdf5' }}
              >
                <Sparkles size={14} />
                <span>Mark All Present</span>
              </button>
            )}
          </div>

          {/* Form Filter Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '16px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '4px' }}>
                Course / Subject <span style={{ color: '#e11d48' }}>*</span>
              </label>
              <select
                value={selectedSubjectId}
                onChange={e => setSelectedSubjectId(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff' }}
              >
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>{s.code}: {s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '4px' }}>
                Session Date <span style={{ color: '#e11d48' }}>*</span>
              </label>
              <input
                type="date"
                value={attendanceDate}
                onChange={e => setAttendanceDate(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '4px' }}>
                Period Slot <span style={{ color: '#e11d48' }}>*</span>
              </label>
              <select
                value={period}
                onChange={e => setPeriod(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff' }}
              >
                <option value="01">Period 1 (09:00 - 10:00)</option>
                <option value="02">Period 2 (10:15 - 11:15)</option>
                <option value="03">Period 3 (11:30 - 12:30)</option>
                <option value="04">Period 4 (01:30 - 02:30)</option>
                <option value="05">Period 5 (02:45 - 03:45)</option>
              </select>
            </div>
          </div>

          {/* Already Marked Duplicate Warning */}
          {isAlreadyMarked && (
            <div style={{ padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecdd3', borderRadius: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <AlertTriangle size={18} color="#e11d48" />
              <div>
                <strong style={{ fontSize: '13px', color: '#9f1239' }}>Session Already Recorded:</strong>
                <span style={{ fontSize: '12.5px', color: '#be123c', marginLeft: '6px' }}>
                  Attendance for {currentSubjectObj?.code} on {attendanceDate} (Period {period}) is already submitted to the institutional ledger. Duplicate submission is blocked.
                </span>
              </div>
            </div>
          )}

          {/* Real-Time Live Tally Banner */}
          <div style={{ padding: '12px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '13px' }}>
              <span style={{ fontWeight: '600', color: '#0f172a' }}>Live Roster Tally:</span>
              <span style={{ color: '#059669', fontWeight: '700' }}>✓ {presentCount} Present</span>
              <span style={{ color: '#e11d48', fontWeight: '700' }}>✗ {absentCount} Absent</span>
              <span style={{ color: '#d97706', fontWeight: '700' }}>⏱ {lateCount} Late</span>
              <span style={{ color: '#64748b' }}>(Total: {totalStudents} Students)</span>
            </div>

            <div style={{ fontSize: '12px', fontWeight: '600', color: '#4f46e5' }}>
              Turnout: {totalStudents > 0 ? ((presentCount / totalStudents) * 100).toFixed(0) : 0}%
            </div>
          </div>

          {/* Student Roster Table */}
          <div style={{ marginTop: '8px' }}>
            {students.length === 0 ? (
              <div style={{ padding: '36px', textAlign: 'center', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                <Users size={32} color="#94a3b8" style={{ margin: '0 auto 8px' }} />
                <div style={{ fontWeight: '600', color: '#0f172a' }}>No students enrolled in registry</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>
                  Admit students in the Admin portal before attendance can be taken.
                </div>
              </div>
            ) : (
              <div className="clean-table-container">
                <table className="clean-table">
                  <thead>
                    <tr>
                      <th>Roll No</th>
                      <th>Student Name</th>
                      <th>Enrolment ID</th>
                      <th style={{ textAlign: 'center' }}>Attendance Status Toggle</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map(s => {
                      const cur = attendanceRoster[s.id] || 'present';
                      return (
                        <tr key={s.id}>
                          <td style={{ fontWeight: '700', fontFamily: 'monospace' }}>{s.rollNo}</td>
                          <td style={{ fontWeight: '600', color: '#0f172a' }}>{s.name}</td>
                          <td style={{ fontSize: '12px', color: '#64748b' }}>{s.enrolmentNo}</td>
                          <td style={{ textAlign: 'center' }}>
                            <div style={{ display: 'inline-flex', gap: '6px' }}>
                              <button
                                type="button"
                                disabled={isAlreadyMarked}
                                onClick={() => handleToggleAttendance(s.id, 'present')}
                                className={`btn btn-sm ${cur === 'present' ? 'btn-emerald' : 'btn-outline'}`}
                                style={cur === 'present' ? { background: '#059669', color: '#fff', borderColor: '#059669' } : {}}
                              >
                                <Check size={12} />
                                <span>Present</span>
                              </button>
                              <button
                                type="button"
                                disabled={isAlreadyMarked}
                                onClick={() => handleToggleAttendance(s.id, 'absent')}
                                className={`btn btn-sm ${cur === 'absent' ? 'btn-primary' : 'btn-outline'}`}
                                style={cur === 'absent' ? { background: '#e11d48', borderColor: '#e11d48', color: '#fff' } : {}}
                              >
                                <X size={12} />
                                <span>Absent</span>
                              </button>
                              <button
                                type="button"
                                disabled={isAlreadyMarked}
                                onClick={() => handleToggleAttendance(s.id, 'late')}
                                className={`btn btn-sm ${cur === 'late' ? 'btn-primary' : 'btn-outline'}`}
                                style={cur === 'late' ? { background: '#d97706', borderColor: '#d97706', color: '#fff' } : {}}
                              >
                                <Clock size={12} />
                                <span>Late</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {students.length > 0 && (
              <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                <button 
                  className="btn btn-emerald" 
                  disabled={isAlreadyMarked}
                  onClick={handleOpenConfirm}
                  style={isAlreadyMarked ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
                >
                  <CheckCircle2 size={15} />
                  <span>{isAlreadyMarked ? 'Session Marked (Locked)' : 'Save & Submit Attendance'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: MARKS ENTRY */}
      {currentTab === 'marks' && (
        <div className="white-card">
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', marginBottom: '14px' }}>
            Examination Marks Entry Register
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '20px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '4px' }}>
                Course / Subject <span style={{ color: '#e11d48' }}>*</span>
              </label>
              <select
                value={selectedSubjectId}
                onChange={e => setSelectedSubjectId(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff' }}
              >
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>{s.code}: {s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '4px' }}>
                Assessment Title <span style={{ color: '#e11d48' }}>*</span>
              </label>
              <input
                type="text"
                value={examName}
                onChange={e => setExamName(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '4px' }}>
                Maximum Marks
              </label>
              <input
                type="number"
                value={maxMarks}
                onChange={e => setMaxMarks(parseInt(e.target.value, 10))}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
              />
            </div>
          </div>

          <div className="clean-table-container">
            <table className="clean-table">
              <thead>
                <tr>
                  <th>Roll No</th>
                  <th>Student Name</th>
                  <th>Marks Obtained (Max: {maxMarks})</th>
                  <th>Grade Estimation</th>
                </tr>
              </thead>
              <tbody>
                {students.map(s => {
                  const m = marksSheet[s.id] !== undefined ? marksSheet[s.id] : 42.5;
                  const pct = (m / maxMarks) * 100;
                  const estGrade = pct >= 90 ? 'O (Outstanding)' : pct >= 80 ? 'A+ (Excellent)' : pct >= 70 ? 'A (Very Good)' : 'B (Good)';
                  return (
                    <tr key={s.id}>
                      <td style={{ fontWeight: '700', fontFamily: 'monospace' }}>{s.rollNo}</td>
                      <td style={{ fontWeight: '600' }}>{s.name}</td>
                      <td>
                        <input
                          type="number"
                          value={m}
                          onChange={e => setMarksSheet({ ...marksSheet, [s.id]: parseFloat(e.target.value) || 0 })}
                          style={{ width: '100px', padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                          min="0" max={maxMarks} step="0.5"
                        />
                      </td>
                      <td>
                        <span className="badge badge-indigo" style={{ fontSize: '11px' }}>{estGrade}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn btn-indigo" onClick={handleSaveMarks}>
              <Award size={15} />
              <span>Submit & Publish Marks</span>
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: '440px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#059669', marginBottom: '12px' }}>
              <CalendarCheck size={24} />
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>Submit Attendance Register?</h3>
            </div>
            <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.5 }}>
              You are recording attendance for <strong>{currentSubjectObj?.name} ({currentSubjectObj?.code})</strong> on <strong>{attendanceDate}</strong> (Period {period}):
            </p>
            <div style={{ margin: '14px 0', padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-around' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '18px', fontWeight: '800', color: '#059669' }}>{presentCount}</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Present</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '18px', fontWeight: '800', color: '#e11d48' }}>{absentCount}</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Absent</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '18px', fontWeight: '800', color: '#d97706' }}>{lateCount}</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Late</div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
              <button className="btn btn-outline" onClick={() => setShowConfirmModal(false)}>
                Cancel
              </button>
              <button className="btn btn-emerald" onClick={handleConfirmSaveAttendance}>
                Confirm & Record in Ledger
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
