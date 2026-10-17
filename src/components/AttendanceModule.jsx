import React, { useState } from 'react';
import { 
  CalendarCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Calculator, 
  TrendingUp, 
  Info,
  ChevronRight,
  Filter
} from 'lucide-react';
import { attendanceBreakdown, studentProfile } from '../data/mockData';

export default function AttendanceModule() {
  const [filter, setFilter] = useState('all'); // 'all', 'safe', 'warning'
  const [selectedSubjectId, setSelectedSubjectId] = useState('overall');
  const [simulateAttend, setSimulateAttend] = useState(0);
  const [simulateMiss, setSimulateMiss] = useState(0);

  // Compute overall stats
  const totalConducted = attendanceBreakdown.reduce((acc, curr) => acc + curr.total, 0);
  const totalAttended = attendanceBreakdown.reduce((acc, curr) => acc + curr.attended, 0);
  const overallPercentage = ((totalAttended / totalConducted) * 100).toFixed(1);

  // Current simulation target
  let baseAttended = totalAttended;
  let baseTotal = totalConducted;
  let targetName = "Overall Academic Attendance";

  if (selectedSubjectId !== 'overall') {
    const sub = attendanceBreakdown.find(s => s.id === selectedSubjectId);
    if (sub) {
      baseAttended = sub.attended;
      baseTotal = sub.total;
      targetName = sub.name;
    }
  }

  // Simulation calculation
  const newAttended = baseAttended + simulateAttend;
  const newTotal = baseTotal + simulateAttend + simulateMiss;
  const projectedPercentage = ((newAttended / newTotal) * 100).toFixed(1);
  const isProjectedSafe = parseFloat(projectedPercentage) >= 75.0;

  // Filter subjects
  const filteredSubjects = attendanceBreakdown.filter(sub => {
    if (filter === 'safe') return sub.percentage >= 75;
    if (filter === 'warning') return sub.percentage < 75;
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Header Card */}
      <div className="white-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
              Attendance Records & Analysis
            </h2>
            <p style={{ fontSize: '13px', color: '#64748b' }}>
              Real-time synchronization with faculty attendance registers (Section 3.5 of PRD)
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span className="badge badge-emerald">Institutional Minimum: 75%</span>
            <span className="badge badge-indigo">Semester 5</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Cumulative Attendance</span>
            <div className="stat-icon-wrap stat-icon-emerald"><CalendarCheck size={18} /></div>
          </div>
          <div className="stat-value" style={{ color: '#059669' }}>{overallPercentage}%</div>
          <div className="stat-footer">
            <span>{totalAttended} of {totalConducted} Lectures</span>
            <span className="badge badge-emerald">Safe</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Attended Classes</span>
            <div className="stat-icon-wrap stat-icon-sky"><CheckCircle2 size={18} /></div>
          </div>
          <div className="stat-value">{totalAttended}</div>
          <div className="stat-footer">
            <span>Verified by biometric/roster</span>
            <span style={{ color: '#0284c7', fontWeight: '600' }}>{((totalAttended/totalConducted)*100).toFixed(0)}% Presence</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Missed Classes</span>
            <div className="stat-icon-wrap stat-icon-rose"><AlertTriangle size={18} /></div>
          </div>
          <div className="stat-value">{totalConducted - totalAttended}</div>
          <div className="stat-footer">
            <span>Authorized leave + unexcused</span>
            <span style={{ color: '#be123c' }}>{totalConducted - totalAttended} Periods</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Subjects At Risk</span>
            <div className="stat-icon-wrap" style={{ background: '#fffbeb', color: '#d97706', border: '1px solid #fde68a' }}>
              <AlertTriangle size={18} />
            </div>
          </div>
          <div className="stat-value" style={{ color: '#d97706' }}>
            {attendanceBreakdown.filter(s => s.percentage < 75).length} Subject
          </div>
          <div className="stat-footer">
            <span>CS504 Machine Learning (72.9%)</span>
            <span className="badge badge-amber">Action Req.</span>
          </div>
        </div>
      </div>

      {/* Interactive Simulator Section */}
      <div className="white-card" style={{ border: '1px solid #c7d2fe', background: '#fafbff' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#eef2ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calculator size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>
                Interactive Attendance Predictor & Simulator
              </h3>
              <p style={{ fontSize: '12px', color: '#64748b' }}>
                Simulate your upcoming classes to test what happens if you attend or miss upcoming sessions
              </p>
            </div>
          </div>
          <button 
            className="btn btn-outline btn-sm"
            onClick={() => { setSimulateAttend(0); setSimulateMiss(0); }}
          >
            Reset Simulation
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginTop: '16px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '6px' }}>
              Select Course Target
            </label>
            <select 
              value={selectedSubjectId} 
              onChange={(e) => {
                setSelectedSubjectId(e.target.value);
                setSimulateAttend(0);
                setSimulateMiss(0);
              }}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                fontSize: '13px',
                fontWeight: '500',
                color: '#0f172a',
                outline: 'none'
              }}
            >
              <option value="overall">All Subjects Combined (Overall Attendance)</option>
              {attendanceBreakdown.map(s => (
                <option key={s.id} value={s.id}>
                  {s.code}: {s.name} (Current: {s.percentage}%)
                </option>
              ))}
            </select>

            <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
              <div style={{ flex: 1, background: '#ffffff', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#059669', display: 'block', marginBottom: '6px' }}>
                  + If I Attend Next:
                </span>
                <div className="counter-group">
                  <button className="counter-btn" onClick={() => setSimulateAttend(Math.max(0, simulateAttend - 1))}>-</button>
                  <span className="counter-value">{simulateAttend}</span>
                  <button className="counter-btn" onClick={() => setSimulateAttend(simulateAttend + 1)}>+</button>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>classes</span>
                </div>
              </div>

              <div style={{ flex: 1, background: '#ffffff', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#e11d48', display: 'block', marginBottom: '6px' }}>
                  - If I Miss Next:
                </span>
                <div className="counter-group">
                  <button className="counter-btn" onClick={() => setSimulateMiss(Math.max(0, simulateMiss - 1))}>-</button>
                  <span className="counter-value">{simulateMiss}</span>
                  <button className="counter-btn" onClick={() => setSimulateMiss(simulateMiss + 1)}>+</button>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>classes</span>
                </div>
              </div>
            </div>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>
              Projected Outcome: {targetName}
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', margin: '8px 0' }}>
              <span style={{ fontSize: '32px', fontWeight: '800', color: isProjectedSafe ? '#059669' : '#dc2626' }}>
                {projectedPercentage}%
              </span>
              <span className={`badge ${isProjectedSafe ? 'badge-emerald' : 'badge-rose'}`}>
                {isProjectedSafe ? 'Exceeds 75% Cutoff' : 'Below 75% Cutoff'}
              </span>
            </div>
            <div style={{ fontSize: '12px', color: '#475569' }}>
              Estimated Total: <strong>{newAttended}</strong> attended / <strong>{newTotal}</strong> total sessions
            </div>
          </div>
        </div>
      </div>

      {/* Subject-Wise Attendance Breakdown Table */}
      <div className="white-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>
              Subject-Wise Attendance Register
            </h3>
            <p style={{ fontSize: '12px', color: '#64748b' }}>
              Live updates recorded period-by-period by subject faculty
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setFilter('all')}
            >
              All Courses ({attendanceBreakdown.length})
            </button>
            <button 
              className={`btn btn-sm ${filter === 'warning' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setFilter('warning')}
              style={filter === 'warning' ? {} : { color: '#b45309', borderColor: '#fde68a' }}
            >
              At Risk (&lt;75%)
            </button>
            <button 
              className={`btn btn-sm ${filter === 'safe' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setFilter('safe')}
            >
              Safe (&gt;=75%)
            </button>
          </div>
        </div>

        <div className="clean-table-container">
          <table className="clean-table">
            <thead>
              <tr>
                <th>Course Details</th>
                <th>Instructor</th>
                <th>Attended / Total</th>
                <th>Percentage</th>
                <th>Status</th>
                <th>Recent 5 Logs</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubjects.map((sub) => {
                const isSafe = sub.percentage >= 75.0;
                return (
                  <tr key={sub.id}>
                    <td>
                      <div style={{ fontWeight: '600', color: '#0f172a' }}>{sub.name}</div>
                      <div style={{ fontSize: '11.5px', color: '#64748b', display: 'flex', gap: '6px' }}>
                        <span>{sub.code}</span>
                        <span>•</span>
                        <span>{sub.credits} Credits</span>
                      </div>
                    </td>
                    <td>{sub.teacher}</td>
                    <td>
                      <span style={{ fontWeight: '700' }}>{sub.attended}</span>
                      <span style={{ color: '#94a3b8' }}> / {sub.total}</span>
                    </td>
                    <td style={{ minWidth: '140px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontWeight: '700', color: isSafe ? '#059669' : '#dc2626' }}>
                          {sub.percentage}%
                        </span>
                      </div>
                      <div className="progress-track" style={{ height: '6px' }}>
                        <div 
                          className="progress-fill" 
                          style={{ 
                            width: `${sub.percentage}%`, 
                            backgroundColor: isSafe ? sub.color : '#ef4444' 
                          }} 
                        />
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${isSafe ? 'badge-emerald' : 'badge-rose'}`}>
                        {isSafe ? 'Eligible' : 'Warning'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {sub.recentLog.map((log, idx) => (
                          <span 
                            key={idx}
                            title={`${log} on Day -${5-idx}`}
                            style={{ 
                              width: '20px', 
                              height: '20px', 
                              borderRadius: '4px', 
                              fontSize: '11px', 
                              fontWeight: '700', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              background: log === 'Present' ? '#ecfdf5' : '#fff1f2',
                              color: log === 'Present' ? '#059669' : '#e11d48',
                              border: log === 'Present' ? '1px solid #a7f3d0' : '1px solid #fecdd3'
                            }}
                          >
                            {log === 'Present' ? 'P' : 'A'}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
