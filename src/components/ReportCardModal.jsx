import React from 'react';
import { 
  Printer, 
  X, 
  Award, 
  CheckCircle2, 
  GraduationCap,
  ShieldCheck
} from 'lucide-react';
import { studentProfile, examResultsData } from '../data/mockData';

export default function ReportCardModal({ onClose }) {
  const handlePrint = () => {
    window.print();
  };

  const totalCredits = examResultsData.reduce((acc, curr) => acc + curr.credits, 0);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '780px', padding: '36px' }}
      >
        {/* Modal Action Bar (Hidden during print) */}
        <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge badge-indigo">Official Document Preview</span>
            <span style={{ fontSize: '12px', color: '#64748b' }}>Generated on demand from Cloud Store (PRD Section 3.7 EXM-5)</span>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-indigo btn-sm" onClick={handlePrint}>
              <Printer size={14} />
              <span>Print / Save PDF</span>
            </button>
            <button className="icon-btn" onClick={onClose} style={{ width: '32px', height: '32px' }}>
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Official Transcript Paper Surface */}
        <div style={{ border: '2px solid #0f172a', padding: '32px', borderRadius: '4px', background: '#ffffff', color: '#0f172a' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', borderBottom: '2px solid #0f172a', paddingBottom: '20px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#eef2ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <GraduationCap size={28} />
              </div>
            </div>
            <h1 style={{ fontSize: '20px', fontWeight: '800', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              College of Engineering & Technology
            </h1>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#475569', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Autonomous Institution • Office of the Controller of Examinations
            </div>
            <div style={{ fontSize: '14px', fontWeight: '700', marginTop: '10px', color: '#4f46e5' }}>
              OFFICIAL GRADE CARD & ACADEMIC TRANSCRIPT
            </div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>
              {studentProfile.semester} • Academic Year 2026-2027
            </div>
          </div>

          {/* Student Profile Info Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', fontSize: '12.5px', marginBottom: '24px', background: '#f8fafc', padding: '16px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <div><strong>Student Name:</strong> {studentProfile.name}</div>
            <div><strong>Roll Number:</strong> {studentProfile.rollNo}</div>
            <div><strong>Enrolment ID:</strong> {studentProfile.enrolmentNo}</div>
            <div><strong>Section & Batch:</strong> {studentProfile.section} ({studentProfile.batch})</div>
            <div><strong>Program:</strong> {studentProfile.program}</div>
            <div><strong>Department:</strong> {studentProfile.department}</div>
          </div>

          {/* Grades Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', marginBottom: '24px' }}>
            <thead>
              <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                <th style={{ padding: '8px 10px', textAlign: 'left' }}>Course Code</th>
                <th style={{ padding: '8px 10px', textAlign: 'left' }}>Course Name</th>
                <th style={{ padding: '8px 10px', textAlign: 'center' }}>Credits</th>
                <th style={{ padding: '8px 10px', textAlign: 'center' }}>Marks (100)</th>
                <th style={{ padding: '8px 10px', textAlign: 'center' }}>Letter Grade</th>
                <th style={{ padding: '8px 10px', textAlign: 'center' }}>Points</th>
              </tr>
            </thead>
            <tbody>
              {examResultsData.map((res, i) => (
                <tr key={res.code} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '8px 10px', fontWeight: '600' }}>{res.code}</td>
                  <td style={{ padding: '8px 10px' }}>{res.name}</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center' }}>{res.credits}</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', fontWeight: '600' }}>{res.totalMarks}</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', fontWeight: '700', color: '#4f46e5' }}>{res.grade}</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', fontWeight: '700' }}>{res.gradePoint}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Performance Summary */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#fafbfc', marginBottom: '32px' }}>
            <div>
              <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '600' }}>Credits Registered</div>
              <div style={{ fontSize: '16px', fontWeight: '800' }}>{totalCredits} Credits</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '600' }}>Semester SGPA</div>
              <div style={{ fontSize: '18px', fontWeight: '800', color: '#4f46e5' }}>{studentProfile.sgpa} / 10.0</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '600' }}>Cumulative CGPA</div>
              <div style={{ fontSize: '18px', fontWeight: '800', color: '#059669' }}>{studentProfile.cgpa} / 10.0</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '600' }}>Academic Result</div>
              <div style={{ fontSize: '14px', fontWeight: '800', color: '#059669' }}>PASSED - FIRST CLASS</div>
            </div>
          </div>

          {/* Signatures & Seal */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: '20px', borderTop: '1px dashed #cbd5e1' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '40px' }}>Date of Issue: Oct 14, 2026</div>
              <div style={{ fontSize: '12px', fontWeight: '600', borderTop: '1px solid #0f172a', paddingTop: '4px', width: '160px' }}>
                Academic Registrar
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#059669', fontSize: '11px', fontWeight: '700', padding: '4px 10px', border: '1px dashed #10b981', borderRadius: '6px', marginBottom: '16px' }}>
                <ShieldCheck size={14} />
                <span>Digitally Verified & Sealed</span>
              </div>
              <div style={{ fontSize: '12px', fontWeight: '600', borderTop: '1px solid #0f172a', paddingTop: '4px', width: '180px' }}>
                Controller of Examinations
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
