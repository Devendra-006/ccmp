import React, { useState } from 'react';
import { 
  FileText, 
  UploadCloud, 
  CheckCircle2, 
  Clock, 
  Download, 
  FileCheck,
  AlertCircle
} from 'lucide-react';
import { assignmentsList as initialAssignments } from '../data/mockData';

export default function AssignmentsModule() {
  const [assignments, setAssignments] = useState(initialAssignments);
  const [submittingId, setSubmittingId] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadSuccessToast, setUploadSuccessToast] = useState(false);

  const handleOpenSubmit = (id) => {
    setSubmittingId(id);
    setUploadedFile(null);
  };

  const handleConfirmSubmit = () => {
    setAssignments(prev => prev.map(a => {
      if (a.id === submittingId) {
        return {
          ...a,
          status: 'Submitted',
          submissionDate: 'October 14, 2026',
          score: 'Under Review',
          badgeColor: 'emerald'
        };
      }
      return a;
    }));
    setSubmittingId(null);
    setUploadSuccessToast(true);
    setTimeout(() => setUploadSuccessToast(false), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Banner */}
      <div className="white-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
              Academic Assignments & Course Material
            </h2>
            <p style={{ fontSize: '13px', color: '#64748b' }}>
              Direct submissions to faculty evaluation queue (PRD Section 3.6 ASG-1 to ASG-3)
            </p>
          </div>
          {uploadSuccessToast && (
            <div className="badge badge-emerald" style={{ padding: '6px 14px', animation: 'fadeIn 0.2s' }}>
              <CheckCircle2 size={14} />
              <span>Assignment Submitted Successfully!</span>
            </div>
          )}
        </div>
      </div>

      {/* Assignments List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {assignments.map((item) => {
          const isSubmitted = item.status === 'Submitted' || item.status === 'Graded';
          return (
            <div 
              key={item.id}
              className="white-card"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '20px',
                flexWrap: 'wrap'
              }}
            >
              <div style={{ flex: 1, minWidth: '280px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <span className={`badge ${
                    item.status === 'Graded' ? 'badge-indigo' : 
                    item.status === 'Submitted' ? 'badge-emerald' : 'badge-amber'
                  }`}>
                    {item.status}
                  </span>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>Due: <strong>{item.dueDate}</strong></span>
                </div>

                <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', marginBottom: '4px' }}>
                  {item.title}
                </h3>

                <div style={{ fontSize: '12px', color: '#475569', display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                  <span>Course: <strong>{item.subject}</strong></span>
                  <span>•</span>
                  <span>Faculty: {item.faculty}</span>
                  <span>•</span>
                  <span>Max Marks: <strong>{item.maxMarks}</strong></span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {item.score && (
                  <div style={{ textAlign: 'right', paddingRight: '8px' }}>
                    <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '600' }}>Grade</div>
                    <div style={{ fontSize: '15px', fontWeight: '800', color: '#059669' }}>{item.score}</div>
                  </div>
                )}

                <button 
                  className="btn btn-outline btn-sm"
                  onClick={() => alert(`Downloading assignment brief: ${item.attachment}`)}
                  title="Download problem sheet"
                >
                  <Download size={13} />
                  <span>Problem Sheet</span>
                </button>

                {!isSubmitted ? (
                  <button 
                    className="btn btn-indigo btn-sm"
                    onClick={() => handleOpenSubmit(item.id)}
                  >
                    <UploadCloud size={14} />
                    <span>Upload Submission</span>
                  </button>
                ) : (
                  <button 
                    className="btn btn-outline btn-sm"
                    onClick={() => handleOpenSubmit(item.id)}
                    style={{ color: '#047857', borderColor: '#a7f3d0', background: '#ecfdf5' }}
                  >
                    <FileCheck size={14} />
                    <span>Replace File</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Submission Modal Dialog */}
      {submittingId && (
        <div className="modal-backdrop" onClick={() => setSubmittingId(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '24px', maxWidth: '520px' }}>
            <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#0f172a', marginBottom: '4px' }}>
              Upload Assignment Solution
            </h3>
            <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '16px' }}>
              Allowed formats: PDF, ZIP, TAR.GZ (Maximum file size: 25 MB)
            </p>

            <div 
              style={{
                border: '2px dashed #cbd5e1',
                borderRadius: '12px',
                padding: '32px 20px',
                textAlign: 'center',
                background: '#fafbfc',
                cursor: 'pointer',
                marginBottom: '16px'
              }}
              onClick={() => setUploadedFile('Solution_CSE_AlexRivera.pdf')}
            >
              <UploadCloud size={36} color="#6366f1" style={{ margin: '0 auto 10px' }} />
              <div style={{ fontWeight: '600', color: '#0f172a', fontSize: '14px' }}>
                {uploadedFile ? uploadedFile : 'Click to select or drop file here'}
              </div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                {uploadedFile ? 'File ready for submission (2.4 MB)' : 'Upload your zipped project source or PDF solution'}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button className="btn btn-outline" onClick={() => setSubmittingId(null)}>
                Cancel
              </button>
              <button 
                className="btn btn-indigo" 
                onClick={handleConfirmSubmit}
                disabled={!uploadedFile}
                style={{ opacity: uploadedFile ? 1 : 0.6 }}
              >
                Confirm & Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
