import React, { useState } from 'react';
import { 
  CalendarCheck, 
  Award, 
  CheckCircle2, 
  Users, 
  BookOpen, 
  Plus, 
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export default function TeacherPortal({
  subjects,
  students,
  onMarkAttendance,
  onRecordMarks
}) {
  const [activeTab, setActiveTab] = useState('attendance'); // 'attendance', 'marks'
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [period, setPeriod] = useState('01');
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceRoster, setAttendanceRoster] = useState({}); // { studentId: 'present' | 'absent' | 'late' }

  // Marks state
  const [examName, setExamName] = useState('Mid-Term Assessment 2026');
  const [examType, setExamType] = useState('mid_term');
  const [maxMarks, setMaxMarks] = useState(50);
  const [marksSheet, setMarksSheet] = useState({}); // { studentId: number }

  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleToggleAttendance = (studentId, status) => {
    setAttendanceRoster(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleSaveAttendance = (e) => {
    e.preventDefault();
    if (!selectedSubjectId) {
      alert('Please select a course / subject first');
      return;
    }
    if (students.length === 0) {
      alert('No students currently enrolled in the institution');
      return;
    }

    const records = students.map(s => ({
      studentId: s.id,
      status: attendanceRoster[s.id] || 'present'
    }));

    onMarkAttendance({
      subjectId: selectedSubjectId,
      date: attendanceDate,
      period,
      records
    });

    showToast(`Attendance marked for ${records.length} students`);
  };

  const handleSaveMarks = (e) => {
    e.preventDefault();
    if (!selectedSubjectId) {
      alert('Please select a course / subject first');
      return;
    }

    const marksList = students.map(s => ({
      studentId: s.id,
      marksObtained: parseFloat(marksSheet[s.id] || 0)
    }));

    onRecordMarks({
      subjectId: selectedSubjectId,
      name: examName,
      type: examType,
      maxMarks,
      marksList
    });

    showToast(`Marks saved for ${marksList.length} students`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div className="white-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge badge-emerald">Role: Faculty / Subject Teacher</span>
              <span className="badge badge-sky">Academic Roster & Grading</span>
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', marginTop: '6px' }}>
              Faculty Classroom Management
            </h2>
            <p style={{ fontSize: '13px', color: '#64748b' }}>
              Take period-by-period class attendance and submit examination marks (PRD Module 3 & 4)
            </p>
          </div>

          {toastMsg && (
            <div className="badge badge-emerald" style={{ padding: '6px 14px' }}>
              <CheckCircle2 size={14} />
              <span>{toastMsg}</span>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          className={`btn btn-sm ${activeTab === 'attendance' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('attendance')}
        >
          <CalendarCheck size={14} />
          <span>Daily Attendance Marker</span>
        </button>
        <button
          className={`btn btn-sm ${activeTab === 'marks' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('marks')}
        >
          <Award size={14} />
          <span>Marks Entry Register</span>
        </button>
      </div>

      {/* TAB 1: ATTENDANCE */}
      {activeTab === 'attendance' && (
        <div className="white-card">
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', marginBottom: '14px' }}>
            Period Attendance Register
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '20px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '4px' }}>
                Course / Subject
              </label>
              <select
                value={selectedSubjectId}
                onChange={e => setSelectedSubjectId(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff' }}
              >
                <option value="">-- Choose Course --</option>
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>{s.code}: {s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '4px' }}>
                Date
              </label>
              <input
                type="date"
                value={attendanceDate}
                onChange={e => setAttendanceDate(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '4px' }}>
                Period Slot
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
                <option value="05">Period 5 (02:45 - 04:45)</option>
              </select>
            </div>
          </div>

          {/* Student Roster */}
          <div style={{ marginTop: '16px' }}>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a', marginBottom: '10px' }}>
              Class Student Roster ({students.length} Students)
            </div>

            {students.length === 0 ? (
              <div style={{ padding: '36px', textAlign: 'center', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                <Users size={32} color="#94a3b8" style={{ margin: '0 auto 8px' }} />
                <div style={{ fontWeight: '600', color: '#0f172a' }}>No students enrolled in registry yet</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>
                  Students must be enrolled in the Admin portal before attendance can be taken.
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
                      <th>Mark Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map(s => {
                      const cur = attendanceRoster[s.id] || 'present';
                      return (
                        <tr key={s.id}>
                          <td style={{ fontWeight: '700' }}>{s.rollNo}</td>
                          <td style={{ fontWeight: '600' }}>{s.name}</td>
                          <td>{s.enrolmentNo}</td>
                          <td>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button
                                type="button"
                                onClick={() => handleToggleAttendance(s.id, 'present')}
                                className={`btn btn-sm ${cur === 'present' ? 'btn-emerald' : 'btn-outline'}`}
                              >
                                Present
                              </button>
                              <button
                                type="button"
                                onClick={() => handleToggleAttendance(s.id, 'absent')}
                                className={`btn btn-sm ${cur === 'absent' ? 'btn-primary' : 'btn-outline'}`}
                                style={cur === 'absent' ? { background: '#e11d48', borderColor: '#e11d48' } : {}}
                              >
                                Absent
                              </button>
                              <button
                                type="button"
                                onClick={() => handleToggleAttendance(s.id, 'late')}
                                className={`btn btn-sm ${cur === 'late' ? 'btn-primary' : 'btn-outline'}`}
                                style={cur === 'late' ? { background: '#d97706', borderColor: '#d97706' } : {}}
                              >
                                Late
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
                <button className="btn btn-emerald" onClick={handleSaveAttendance}>
                  <CheckCircle2 size={15} />
                  <span>Submit Attendance Register</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: MARKS ENTRY */}
      {activeTab === 'marks' && (
        <div className="white-card">
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', marginBottom: '14px' }}>
            Examination Marks Entry
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '20px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '4px' }}>
                Course / Subject
              </label>
              <select
                value={selectedSubjectId}
                onChange={e => setSelectedSubjectId(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff' }}
              >
                <option value="">-- Choose Course --</option>
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>{s.code}: {s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '4px' }}>
                Assessment Name
              </label>
              <input
                type="text"
                value={examName}
                onChange={e => setExamName(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '4px' }}>
                Max Marks
              </label>
              <input
                type="number"
                value={maxMarks}
                onChange={e => setMaxMarks(parseInt(e.target.value, 10))}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
              />
            </div>
          </div>

          {/* Student Marks List */}
          {students.length === 0 ? (
            <div style={{ padding: '36px', textAlign: 'center', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
              <Users size={32} color="#94a3b8" style={{ margin: '0 auto 8px' }} />
              <div style={{ fontWeight: '600', color: '#0f172a' }}>No students enrolled in registry yet</div>
            </div>
          ) : (
            <div className="clean-table-container">
              <table className="clean-table">
                <thead>
                  <tr>
                    <th>Roll No</th>
                    <th>Student Name</th>
                    <th>Marks Scored (Max {maxMarks})</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(s => (
                    <tr key={s.id}>
                      <td style={{ fontWeight: '700' }}>{s.rollNo}</td>
                      <td style={{ fontWeight: '600' }}>{s.name}</td>
                      <td>
                        <input
                          type="number"
                          placeholder={`0 - ${maxMarks}`}
                          value={marksSheet[s.id] || ''}
                          onChange={e => setMarksSheet({ ...marksSheet, [s.id]: e.target.value })}
                          max={maxMarks}
                          min="0"
                          style={{ width: '120px', padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {students.length > 0 && (
            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-indigo" onClick={handleSaveMarks}>
                <Award size={15} />
                <span>Save Assessment Marks</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
