import React from 'react';
import { 
  Award, 
  FileCheck, 
  Download, 
  CheckCircle2, 
  TrendingUp, 
  Sparkles,
  BarChart3
} from 'lucide-react';
import { examResultsData, studentProfile } from '../data/mockData';

export default function ExamsModule({ onOpenReportCard }) {
  // Calculate total marks scored
  const totalScored = examResultsData.reduce((acc, curr) => acc + curr.totalMarks, 0);
  const maxPossible = examResultsData.length * 100;
  const overallPercentage = ((totalScored / maxPossible) * 100).toFixed(1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Banner */}
      <div className="white-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
              Examinations, Marks & Grade Records
            </h2>
            <p style={{ fontSize: '13px', color: '#64748b' }}>
              Official published transcripts verified by Controller of Examinations (PRD Section 3.7)
            </p>
          </div>

          <button 
            className="btn btn-indigo"
            onClick={onOpenReportCard}
          >
            <Download size={15} />
            <span>Official Semester Grade Card (PDF)</span>
          </button>
        </div>
      </div>

      {/* GPA & Performance Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Semester SGPA</span>
            <div className="stat-icon-wrap stat-icon-indigo"><Award size={18} /></div>
          </div>
          <div className="stat-value" style={{ color: '#4f46e5' }}>{studentProfile.sgpa}</div>
          <div className="stat-footer">
            <span className="badge badge-indigo">Semester 5 Performance</span>
            <span style={{ color: '#64748b' }}>Scale: 10.0</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Cumulative CGPA</span>
            <div className="stat-icon-wrap stat-icon-emerald"><TrendingUp size={18} /></div>
          </div>
          <div className="stat-value" style={{ color: '#059669' }}>{studentProfile.cgpa}</div>
          <div className="stat-footer">
            <span className="badge badge-emerald">First Class with Distinction</span>
            <span style={{ color: '#64748b' }}>Rank: Top 5%</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Aggregate Marks</span>
            <div className="stat-icon-wrap stat-icon-sky"><BarChart3 size={18} /></div>
          </div>
          <div className="stat-value">{overallPercentage}%</div>
          <div className="stat-footer">
            <span>{totalScored} / {maxPossible} Marks Scored</span>
            <span style={{ color: '#0284c7', fontWeight: '600' }}>Grade A Average</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Degree Credit Progress</span>
            <div className="stat-icon-wrap stat-icon-violet"><Sparkles size={18} /></div>
          </div>
          <div className="stat-value">{studentProfile.creditsCompleted} <span style={{ fontSize: '16px', fontWeight: '500', color: '#94a3b8' }}>/ {studentProfile.totalCredits}</span></div>
          <div className="stat-footer">
            <span>61.2% Degree Completed</span>
            <span className="badge badge-violet">On Track</span>
          </div>
        </div>
      </div>

      {/* Published Course Results Table */}
      <div className="white-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>
              Semester 5 Comprehensive Marksheet Breakdown
            </h3>
            <p style={{ fontSize: '12px', color: '#64748b' }}>
              Weights: Continuous Assessment (30%) + Mid-Term (20%) + End-Term Examination (50%)
            </p>
          </div>
          <span className="badge badge-emerald">
            <CheckCircle2 size={12} />
            <span>All Results Verified & Published</span>
          </span>
        </div>

        <div className="clean-table-container">
          <table className="clean-table">
            <thead>
              <tr>
                <th>Course Details</th>
                <th>Credits</th>
                <th>Internals (30)</th>
                <th>Mid-Term (20)</th>
                <th>End-Term (50)</th>
                <th>Total (100)</th>
                <th>Grade</th>
                <th>Grade Point</th>
              </tr>
            </thead>
            <tbody>
              {examResultsData.map((course) => (
                <tr key={course.code}>
                  <td>
                    <div style={{ fontWeight: '600', color: '#0f172a' }}>{course.name}</div>
                    <div style={{ fontSize: '11.5px', color: '#64748b' }}>{course.code}</div>
                  </td>
                  <td>
                    <span style={{ fontWeight: '600' }}>{course.credits}</span>
                  </td>
                  <td>
                    <span style={{ color: '#334155', fontWeight: '500' }}>{course.internals}</span>
                    <span style={{ color: '#94a3b8', fontSize: '11px' }}> / 30</span>
                  </td>
                  <td>
                    <span style={{ color: '#334155', fontWeight: '500' }}>{course.midTerm}</span>
                    <span style={{ color: '#94a3b8', fontSize: '11px' }}> / 20</span>
                  </td>
                  <td>
                    <span style={{ color: '#334155', fontWeight: '500' }}>{course.endTerm}</span>
                    <span style={{ color: '#94a3b8', fontSize: '11px' }}> / 50</span>
                  </td>
                  <td>
                    <span style={{ fontWeight: '700', color: '#0f172a', fontSize: '14px' }}>
                      {course.totalMarks}
                    </span>
                    <span style={{ color: '#94a3b8', fontSize: '11px' }}> / 100</span>
                  </td>
                  <td>
                    <span 
                      style={{ 
                        fontWeight: '700', 
                        padding: '3px 8px', 
                        borderRadius: '4px',
                        fontSize: '12px',
                        background: course.grade === 'O' || course.grade === 'A+' ? '#ecfdf5' : '#eef2ff',
                        color: course.grade === 'O' || course.grade === 'A+' ? '#059669' : '#4f46e5',
                        border: course.grade === 'O' || course.grade === 'A+' ? '1px solid #a7f3d0' : '1px solid #c7d2fe'
                      }}
                    >
                      {course.grade}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontWeight: '700', color: '#334155' }}>
                      {course.gradePoint}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
