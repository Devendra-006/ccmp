import React, { useState } from 'react';
import { 
  Building2, 
  BookOpen, 
  GraduationCap, 
  UserPlus, 
  CreditCard, 
  Bell, 
  CheckCircle2, 
  Plus, 
  FolderPlus,
  ShieldCheck
} from 'lucide-react';

export default function AdminPortal({
  departments,
  programmes,
  subjects,
  students,
  onAddDepartment,
  onAddProgramme,
  onAddSubject,
  onEnrollStudent,
  onAddFeeStructure,
  onPostNotice
}) {
  const [activeSection, setActiveSection] = useState('academic'); // 'academic', 'students', 'fees', 'notices'
  
  // Form states
  const [deptForm, setDeptForm] = useState({ code: '', name: '' });
  const [progForm, setProgForm] = useState({ code: '', name: '', departmentId: '' });
  const [subForm, setSubForm] = useState({ code: '', name: '', credits: 3, semester: 1, type: 'core' });
  const [stuForm, setStuForm] = useState({ name: '', enrolmentNo: '', rollNo: '', email: '', semester: 1, section: 'A' });
  const [feeForm, setFeeForm] = useState({ head: '', amount: '', dueDate: '' });
  const [noticeForm, setNoticeForm] = useState({ title: '', body: '', category: 'Academic', isUrgent: false });
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleCreateDept = (e) => {
    e.preventDefault();
    if (!deptForm.code || !deptForm.name) return;
    onAddDepartment(deptForm);
    setDeptForm({ code: '', name: '' });
    showToast('Department registered successfully');
  };

  const handleCreateProg = (e) => {
    e.preventDefault();
    if (!progForm.code || !progForm.name) return;
    onAddProgramme(progForm);
    setProgForm({ code: '', name: '', departmentId: '' });
    showToast('Academic Programme created');
  };

  const handleCreateSub = (e) => {
    e.preventDefault();
    if (!subForm.code || !subForm.name) return;
    onAddSubject(subForm);
    setSubForm({ code: '', name: '', credits: 3, semester: 1, type: 'core' });
    showToast('Course / Subject added to curriculum');
  };

  const handleEnrollStudent = (e) => {
    e.preventDefault();
    if (!stuForm.name || !stuForm.enrolmentNo || !stuForm.rollNo) return;
    onEnrollStudent(stuForm);
    setStuForm({ name: '', enrolmentNo: '', rollNo: '', email: '', semester: 1, section: 'A' });
    showToast('Student enrolled into master directory');
  };

  const handleCreateFee = (e) => {
    e.preventDefault();
    if (!feeForm.head || !feeForm.amount || !feeForm.dueDate) return;
    onAddFeeStructure({
      head: feeForm.head,
      amountInPaise: parseInt(feeForm.amount, 10) * 100,
      dueDate: feeForm.dueDate
    });
    setFeeForm({ head: '', amount: '', dueDate: '' });
    showToast('Fee structure scheduled');
  };

  const handlePostNotice = (e) => {
    e.preventDefault();
    if (!noticeForm.title || !noticeForm.body) return;
    onPostNotice(noticeForm);
    setNoticeForm({ title: '', body: '', category: 'Academic', isUrgent: false });
    showToast('Notice published to campus board');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Admin Header */}
      <div className="white-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge badge-indigo">Role: Academic Registrar & Admin</span>
              <span className="badge badge-emerald">Master Management View</span>
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', marginTop: '6px' }}>
              Institution Setup & Administration
            </h2>
            <p style={{ fontSize: '13px', color: '#64748b' }}>
              Configure master records, programs, course catalogue, students, and fees (PRD Section 3.2, 3.4 & 3.13)
            </p>
          </div>

          {toastMessage && (
            <div className="badge badge-emerald" style={{ padding: '6px 14px' }}>
              <CheckCircle2 size={14} />
              <span>{toastMessage}</span>
            </div>
          )}
        </div>
      </div>

      {/* Admin Navigation Pills */}
      <div style={{ display: 'flex', gap: '10px', overflowX: 'auto' }}>
        {[
          { id: 'academic', label: '1. Curriculums & Subjects', icon: BookOpen },
          { id: 'students', label: '2. Student Directory & Admissions', icon: UserPlus },
          { id: 'fees', label: '3. Fee Structures', icon: CreditCard },
          { id: 'notices', label: '4. Notice Board Publisher', icon: Bell }
        ].map((item) => {
          const Icon = item.icon;
          const isSelected = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-outline'}`}
              style={{ padding: '8px 16px', gap: '8px' }}
            >
              <Icon size={14} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* SECTION 1: ACADEMIC CURRICULUM */}
      {activeSection === 'academic' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
          {/* Department Form */}
          <div className="white-card">
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Building2 size={16} color="#4f46e5" />
              <span>Add Department</span>
            </h3>
            <form onSubmit={handleCreateDept} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input 
                type="text" 
                placeholder="Dept Code (e.g. CS, EC, ME)" 
                value={deptForm.code} 
                onChange={e => setDeptForm({ ...deptForm, code: e.target.value })}
                style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                required 
              />
              <input 
                type="text" 
                placeholder="Department Name (e.g. Computer Science & Engg)" 
                value={deptForm.name} 
                onChange={e => setDeptForm({ ...deptForm, name: e.target.value })}
                style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                required 
              />
              <button type="submit" className="btn btn-indigo btn-sm" style={{ alignSelf: 'flex-start' }}>
                <Plus size={14} />
                <span>Save Department</span>
              </button>
            </form>

            <div style={{ marginTop: '16px', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>
                Existing Departments ({departments.length})
              </div>
              {departments.length === 0 ? (
                <div style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic' }}>No departments created yet.</div>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {departments.map(d => (
                    <span key={d.id} className="badge badge-gray">{d.code}: {d.name}</span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Subject / Course Form */}
          <div className="white-card">
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <BookOpen size={16} color="#0284c7" />
              <span>Add Course / Subject</span>
            </h3>
            <form onSubmit={handleCreateSub} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input 
                  type="text" 
                  placeholder="Course Code (e.g. CS501)" 
                  value={subForm.code} 
                  onChange={e => setSubForm({ ...subForm, code: e.target.value })}
                  style={{ flex: 1, padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  required 
                />
                <input 
                  type="number" 
                  placeholder="Credits" 
                  value={subForm.credits} 
                  onChange={e => setSubForm({ ...subForm, credits: parseInt(e.target.value, 10) })}
                  style={{ width: '90px', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  min="1" max="6"
                  required 
                />
              </div>
              <input 
                type="text" 
                placeholder="Course Title (e.g. Algorithms & Data Structures)" 
                value={subForm.name} 
                onChange={e => setSubForm({ ...subForm, name: e.target.value })}
                style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                required 
              />
              <div style={{ display: 'flex', gap: '10px' }}>
                <select 
                  value={subForm.semester} 
                  onChange={e => setSubForm({ ...subForm, semester: parseInt(e.target.value, 10) })}
                  style={{ flex: 1, padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff' }}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                    <option key={s} value={s}>Semester {s}</option>
                  ))}
                </select>
                <select 
                  value={subForm.type} 
                  onChange={e => setSubForm({ ...subForm, type: e.target.value })}
                  style={{ flex: 1, padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff' }}
                >
                  <option value="core">Core Theory</option>
                  <option value="lab">Practical / Lab</option>
                  <option value="elective">Elective</option>
                </select>
              </div>
              <button type="submit" className="btn btn-emerald btn-sm" style={{ alignSelf: 'flex-start' }}>
                <Plus size={14} />
                <span>Save Course</span>
              </button>
            </form>

            <div style={{ marginTop: '16px', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>
                Curriculum Subjects ({subjects.length})
              </div>
              {subjects.length === 0 ? (
                <div style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic' }}>No subjects added yet.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '140px', overflowY: 'auto' }}>
                  {subjects.map(s => (
                    <div key={s.id} style={{ fontSize: '12px', display: 'flex', justifyContent: 'space-between', padding: '4px 8px', background: '#f8fafc', borderRadius: '4px' }}>
                      <span><strong>{s.code}</strong>: {s.name}</span>
                      <span className="badge badge-sky" style={{ fontSize: '10px' }}>{s.credits} Credits</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: STUDENT ADMISSIONS & DIRECTORY */}
      {activeSection === 'students' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
          {/* Enroll Student Form */}
          <div className="white-card">
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <UserPlus size={16} color="#059669" />
              <span>Enroll New Student</span>
            </h3>
            <form onSubmit={handleEnrollStudent} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input 
                type="text" 
                placeholder="Full Name" 
                value={stuForm.name} 
                onChange={e => setStuForm({ ...stuForm, name: e.target.value })}
                style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                required 
              />
              <div style={{ display: 'flex', gap: '8px' }}>
                <input 
                  type="text" 
                  placeholder="Enrolment No (e.g. CS2026-001)" 
                  value={stuForm.enrolmentNo} 
                  onChange={e => setStuForm({ ...stuForm, enrolmentNo: e.target.value })}
                  style={{ flex: 1, padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  required 
                />
                <input 
                  type="text" 
                  placeholder="Roll No (e.g. 26CS01)" 
                  value={stuForm.rollNo} 
                  onChange={e => setStuForm({ ...stuForm, rollNo: e.target.value })}
                  style={{ width: '120px', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  required 
                />
              </div>
              <input 
                type="email" 
                placeholder="Student Email (for portal login)" 
                value={stuForm.email} 
                onChange={e => setStuForm({ ...stuForm, email: e.target.value })}
                style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
              />
              <div style={{ display: 'flex', gap: '8px' }}>
                <select 
                  value={stuForm.semester} 
                  onChange={e => setStuForm({ ...stuForm, semester: parseInt(e.target.value, 10) })}
                  style={{ flex: 1, padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff' }}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                    <option key={s} value={s}>Semester {s}</option>
                  ))}
                </select>
                <select 
                  value={stuForm.section} 
                  onChange={e => setStuForm({ ...stuForm, section: e.target.value })}
                  style={{ width: '100px', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff' }}
                >
                  <option value="A">Sec A</option>
                  <option value="B">Sec B</option>
                  <option value="C">Sec C</option>
                </select>
              </div>
              <button type="submit" className="btn btn-emerald btn-sm" style={{ marginTop: '4px' }}>
                <UserPlus size={14} />
                <span>Enroll into Registry</span>
              </button>
            </form>
          </div>

          {/* Student Directory Table */}
          <div className="white-card">
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', marginBottom: '12px' }}>
              Enrolled Students Directory ({students.length})
            </h3>
            {students.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                <GraduationCap size={36} color="#94a3b8" style={{ margin: '0 auto 8px' }} />
                <div style={{ fontWeight: '600', color: '#0f172a' }}>No students enrolled yet</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>
                  Use the enrollment form to admit your first student into the database.
                </div>
              </div>
            ) : (
              <div className="clean-table-container">
                <table className="clean-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Enrolment No</th>
                      <th>Roll No</th>
                      <th>Semester</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map(s => (
                      <tr key={s.id}>
                        <td style={{ fontWeight: '600' }}>{s.name}</td>
                        <td>{s.enrolmentNo}</td>
                        <td>{s.rollNo}</td>
                        <td>Sem {s.semester} ({s.section})</td>
                        <td><span className="badge badge-emerald">Active</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 3: FEE STRUCTURES */}
      {activeSection === 'fees' && (
        <div className="white-card" style={{ maxWidth: '540px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CreditCard size={16} color="#e11d48" />
            <span>Create Institutional Fee Head</span>
          </h3>
          <form onSubmit={handleCreateFee} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input 
              type="text" 
              placeholder="Fee Head (e.g. Tuition Fee, Exam Fee, Lab Fee)" 
              value={feeForm.head} 
              onChange={e => setFeeForm({ ...feeForm, head: e.target.value })}
              style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
              required 
            />
            <input 
              type="number" 
              placeholder="Amount in INR (e.g. 12500)" 
              value={feeForm.amount} 
              onChange={e => setFeeForm({ ...feeForm, amount: e.target.value })}
              style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
              required 
            />
            <input 
              type="date" 
              value={feeForm.dueDate} 
              onChange={e => setFeeForm({ ...feeForm, dueDate: e.target.value })}
              style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
              required 
            />
            <button type="submit" className="btn btn-indigo btn-sm" style={{ alignSelf: 'flex-start' }}>
              <Plus size={14} />
              <span>Define Fee Head</span>
            </button>
          </form>
        </div>
      )}

      {/* SECTION 4: NOTICE BOARD */}
      {activeSection === 'notices' && (
        <div className="white-card" style={{ maxWidth: '600px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Bell size={16} color="#d97706" />
            <span>Publish Institutional Circular</span>
          </h3>
          <form onSubmit={handlePostNotice} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input 
              type="text" 
              placeholder="Notice Headline" 
              value={noticeForm.title} 
              onChange={e => setNoticeForm({ ...noticeForm, title: e.target.value })}
              style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
              required 
            />
            <textarea 
              rows={4}
              placeholder="Notice description or memorandum..." 
              value={noticeForm.body} 
              onChange={e => setNoticeForm({ ...noticeForm, body: e.target.value })}
              style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', resize: 'vertical' }}
              required 
            />
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <select 
                value={noticeForm.category} 
                onChange={e => setNoticeForm({ ...noticeForm, category: e.target.value })}
                style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff' }}
              >
                <option value="Academic">Academic</option>
                <option value="Exams">Exams</option>
                <option value="Finance">Finance</option>
                <option value="Campus">Campus</option>
              </select>
              <label style={{ fontSize: '12.5px', color: '#475569', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={noticeForm.isUrgent} 
                  onChange={e => setNoticeForm({ ...noticeForm, isUrgent: e.target.checked })} 
                />
                <span>Mark as Urgent Notice</span>
              </label>
            </div>
            <button type="submit" className="btn btn-primary btn-sm" style={{ alignSelf: 'flex-start' }}>
              <span>Publish Circular</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
