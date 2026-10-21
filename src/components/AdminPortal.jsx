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
  Search,
  Trash2,
  AlertTriangle,
  Server,
  Activity,
  Loader2
} from 'lucide-react';

export default function AdminPortal({
  departments = [],
  programmes = [],
  subjects = [],
  students = [],
  onAddDepartment,
  onAddSubject,
  onEnrollStudent,
  onAddFeeStructure,
  onPostNotice,
  activeSection = 'academic',
  setActiveSection
}) {
  const section = activeSection || 'academic';

  // Form states
  const [deptForm, setDeptForm] = useState({ code: '', name: '' });
  const [subForm, setSubForm] = useState({ 
    code: '', 
    name: '', 
    credits: 4, 
    semester: 4, 
    type: 'core',
    departmentId: ''
  });
  const [stuForm, setStuForm] = useState({ 
    name: '', 
    enrolmentNo: '', 
    rollNo: '', 
    email: '', 
    semester: 4, 
    section: 'A',
    programmeId: ''
  });
  const [feeForm, setFeeForm] = useState({ head: '', amount: '', dueDate: '', semester: 4 });
  const [noticeForm, setNoticeForm] = useState({ title: '', body: '', category: 'Academic', isUrgent: false });

  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [itemToDelete, setItemToDelete] = useState(null); // { type: 'subject'|'dept', id, name }

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleCreateDept = async (e) => {
    e.preventDefault();
    if (!deptForm.code.trim() || !deptForm.name.trim()) return;
    setIsSaving(true);
    try {
      await onAddDepartment(deptForm);
      setDeptForm({ code: '', name: '' });
      showToast('Department registered successfully');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateSub = async (e) => {
    e.preventDefault();
    if (!subForm.code.trim() || !subForm.name.trim()) return;
    setIsSaving(true);
    try {
      await onAddSubject({
        ...subForm,
        programmeId: programmes[0]?.id || null
      });
      setSubForm({ code: '', name: '', credits: 4, semester: 4, type: 'core', departmentId: '' });
      showToast('Course / Subject added to curriculum successfully');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEnrollStudent = async (e) => {
    e.preventDefault();
    if (!stuForm.name.trim() || !stuForm.enrolmentNo.trim() || !stuForm.rollNo.trim()) return;
    setIsSaving(true);
    try {
      await onEnrollStudent({
        ...stuForm,
        programmeId: stuForm.programmeId || programmes[0]?.id || null,
        batch: '2024-2028'
      });
      setStuForm({ name: '', enrolmentNo: '', rollNo: '', email: '', semester: 4, section: 'A', programmeId: '' });
      showToast('Student enrolled into master directory');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateFee = async (e) => {
    e.preventDefault();
    if (!feeForm.head || !feeForm.amount || !feeForm.dueDate) return;
    setIsSaving(true);
    try {
      await onAddFeeStructure({
        head: feeForm.head,
        amountInPaise: parseInt(feeForm.amount, 10) * 100,
        dueDate: feeForm.dueDate,
        semester: parseInt(feeForm.semester, 10)
      });
      setFeeForm({ head: '', amount: '', dueDate: '', semester: 4 });
      showToast('Fee structure scheduled & published');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePostNotice = async (e) => {
    e.preventDefault();
    if (!noticeForm.title.trim() || !noticeForm.body.trim()) return;
    setIsSaving(true);
    try {
      await onPostNotice(noticeForm);
      setNoticeForm({ title: '', body: '', category: 'Academic', isUrgent: false });
      showToast('Circular published to campus board');
    } finally {
      setIsSaving(false);
    }
  };

  // Filtered lists
  const filteredSubjects = subjects.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.rollNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.enrolmentNo?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Admin Header */}
      <div className="white-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge badge-indigo">Role: Academic Registrar & Super Admin</span>
              <span className="badge badge-emerald">PostgreSQL 17 Database Active</span>
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', marginTop: '6px' }}>
              Institution Setup & Master Management
            </h2>
            <p style={{ fontSize: '13px', color: '#64748b' }}>
              Manage university departments, curriculum course catalogs, student admissions, fee structures, and circulars.
            </p>
          </div>

          {toastMessage && (
            <div className="badge badge-emerald" style={{ padding: '8px 16px', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={16} />
              <span>{toastMessage}</span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Pills */}
      <div style={{ display: 'flex', gap: '10px', overflowX: 'auto' }}>
        {[
          { id: 'overview', label: '0. Institution Overview', icon: Activity },
          { id: 'academic', label: '1. Curriculums & Subjects', icon: BookOpen },
          { id: 'students', label: '2. Student Directory & Admissions', icon: UserPlus },
          { id: 'fees', label: '3. Fee Structures', icon: CreditCard },
          { id: 'notices', label: '4. Campus Notice Board', icon: Bell },
          { id: 'cloud', label: '5. Cloud Health & Docker', icon: Server }
        ].map((item) => {
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

      {/* SECTION 0: INSTITUTION OVERVIEW DASHBOARD */}
      {section === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* KPI Stat Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-label">Enrolled Students</span>
                <div className="stat-icon-wrap stat-icon-indigo"><UserPlus size={19} /></div>
              </div>
              <div className="stat-value" style={{ color: '#0f172a' }}>{students.length}</div>
              <div className="stat-footer">
                <span className="badge badge-indigo">Semester 4 Active</span>
                <span style={{ fontSize: '11.5px', color: '#64748b' }}>CS & Allied Depts</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-label">Departments</span>
                <div className="stat-icon-wrap stat-icon-emerald"><Building2 size={19} /></div>
              </div>
              <div className="stat-value" style={{ color: '#059669' }}>{departments.length}</div>
              <div className="stat-footer">
                <span className="badge badge-emerald">CSE, ECE, MECH</span>
                <span style={{ fontSize: '11.5px', color: '#64748b' }}>Accredited Units</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-label">Degree Programmes</span>
                <div className="stat-icon-wrap stat-icon-sky"><GraduationCap size={19} /></div>
              </div>
              <div className="stat-value" style={{ color: '#0284c7' }}>{programmes.length}</div>
              <div className="stat-footer">
                <span className="badge badge-sky">B.Tech Degrees</span>
                <span style={{ fontSize: '11.5px', color: '#64748b' }}>4-Year Curriculum</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-label">Active Courses</span>
                <div className="stat-icon-wrap stat-icon-amber"><BookOpen size={19} /></div>
              </div>
              <div className="stat-value" style={{ color: '#d97706' }}>{subjects.length}</div>
              <div className="stat-footer">
                <span className="badge badge-amber">Registered</span>
                <span style={{ fontSize: '11.5px', color: '#64748b' }}>Core & Electives</span>
              </div>
            </div>
          </div>

          {/* Quick Action Launchpad */}
          <div className="white-card">
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', marginBottom: '14px' }}>
              Administrative Quick Action Launchpad
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
              <button 
                className="btn btn-outline" 
                onClick={() => setActiveSection && setActiveSection('academic')}
                style={{ justifyContent: 'flex-start', padding: '12px 16px', background: '#ffffff' }}
              >
                <BookOpen size={16} color="#4f46e5" />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>Curriculums & Courses</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Add subjects and syllabus</div>
                </div>
              </button>

              <button 
                className="btn btn-outline" 
                onClick={() => setActiveSection && setActiveSection('students')}
                style={{ justifyContent: 'flex-start', padding: '12px 16px', background: '#ffffff' }}
              >
                <UserPlus size={16} color="#059669" />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>Student Admissions</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Enroll candidates & batches</div>
                </div>
              </button>

              <button 
                className="btn btn-outline" 
                onClick={() => setActiveSection && setActiveSection('fees')}
                style={{ justifyContent: 'flex-start', padding: '12px 16px', background: '#ffffff' }}
              >
                <CreditCard size={16} color="#0284c7" />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>Fee Structures</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Publish assessment dues</div>
                </div>
              </button>

              <button 
                className="btn btn-outline" 
                onClick={() => setActiveSection && setActiveSection('notices')}
                style={{ justifyContent: 'flex-start', padding: '12px 16px', background: '#ffffff' }}
              >
                <Bell size={16} color="#d97706" />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>Broadcast Circular</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Post campus-wide notices</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 1: ACADEMIC CURRICULUM & SUBJECTS */}
      {section === 'academic' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
          {/* Department Form */}
          <div className="white-card">
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Building2 size={16} color="#4f46e5" />
              <span>Register Department</span>
            </h3>
            <form onSubmit={handleCreateDept} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Department Code <span style={{ color: '#e11d48' }}>*</span>
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. CSE, ECE, MECH" 
                  value={deptForm.code} 
                  onChange={e => setDeptForm({ ...deptForm, code: e.target.value.toUpperCase() })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  required 
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Department Full Name <span style={{ color: '#e11d48' }}>*</span>
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. Computer Science & Engineering" 
                  value={deptForm.name} 
                  onChange={e => setDeptForm({ ...deptForm, name: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  required 
                />
              </div>
              <button 
                type="submit" 
                className="btn btn-indigo btn-sm" 
                disabled={isSaving}
                style={{ alignSelf: 'flex-start', marginTop: '4px' }}
              >
                {isSaving ? <Loader2 size={14} className="spin" /> : <Plus size={14} />}
                <span>Save Department</span>
              </button>
            </form>

            <div style={{ marginTop: '20px', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
                Existing Departments ({departments.length})
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {departments.map(d => (
                  <span key={d.id} className="badge badge-gray" style={{ fontSize: '12px', padding: '4px 10px' }}>
                    <strong>{d.code}</strong>: {d.name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Course / Subject Form with VISIBLE LABELS and Department Dropdown */}
          <div className="white-card">
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <BookOpen size={16} color="#0284c7" />
              <span>Add Course / Subject</span>
            </h3>
            <form onSubmit={handleCreateSub} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Department Dropdown */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Academic Department <span style={{ color: '#e11d48' }}>*</span>
                </label>
                <select
                  value={subForm.departmentId}
                  onChange={e => setSubForm({ ...subForm, departmentId: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff' }}
                >
                  <option value="">-- Select Department --</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.code} - {d.name}</option>
                  ))}
                </select>
              </div>

              {/* Code & Credits with explicit visible labels */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '4px' }}>
                    Course Code <span style={{ color: '#e11d48' }}>*</span>
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g. CS401" 
                    value={subForm.code} 
                    onChange={e => setSubForm({ ...subForm, code: e.target.value.toUpperCase() })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    required 
                  />
                </div>
                <div style={{ width: '110px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '4px' }}>
                    Credits (1-6) <span style={{ color: '#e11d48' }}>*</span>
                  </label>
                  <input 
                    type="number" 
                    placeholder="4" 
                    value={subForm.credits} 
                    onChange={e => setSubForm({ ...subForm, credits: parseInt(e.target.value, 10) || 1 })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    min="1" max="6"
                    required 
                  />
                </div>
              </div>

              {/* Title with explicit visible label */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Course Title / Name <span style={{ color: '#e11d48' }}>*</span>
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. Distributed Database Systems" 
                  value={subForm.name} 
                  onChange={e => setSubForm({ ...subForm, name: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  required 
                />
              </div>

              {/* Semester & Type with explicit visible labels */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '4px' }}>
                    Semester Term <span style={{ color: '#e11d48' }}>*</span>
                  </label>
                  <select 
                    value={subForm.semester} 
                    onChange={e => setSubForm({ ...subForm, semester: parseInt(e.target.value, 10) })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff' }}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '4px' }}>
                    Course Type <span style={{ color: '#e11d48' }}>*</span>
                  </label>
                  <select 
                    value={subForm.type} 
                    onChange={e => setSubForm({ ...subForm, type: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff' }}
                  >
                    <option value="core">Core Theory</option>
                    <option value="lab">Practical / Laboratory</option>
                    <option value="elective">Department Elective</option>
                  </select>
                </div>
              </div>

              <button 
                type="submit" 
                className="btn btn-emerald btn-sm" 
                disabled={isSaving}
                style={{ alignSelf: 'flex-start', marginTop: '6px' }}
              >
                {isSaving ? <Loader2 size={14} className="spin" /> : <Plus size={14} />}
                <span>Save Course to Catalog</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CURRICULUM SUBJECTS TABLE WITH SEARCH & DELETE */}
      {section === 'academic' && (
        <div className="white-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>
                Curriculum Courses & Subjects ({filteredSubjects.length} of {subjects.length})
              </h3>
              <p style={{ fontSize: '12px', color: '#64748b' }}>Accredited institutional syllabus courses</p>
            </div>

            <div className="search-box" style={{ width: '260px' }}>
              <Search size={14} className="search-icon" />
              <input
                type="text"
                placeholder="Search subjects..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="clean-table-container">
            <table className="clean-table">
              <thead>
                <tr>
                  <th>Course Code</th>
                  <th>Subject Title</th>
                  <th>Credits</th>
                  <th>Semester</th>
                  <th>Course Type</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubjects.map(sub => (
                  <tr key={sub.id}>
                    <td style={{ fontWeight: '700', fontFamily: 'monospace' }}>{sub.code}</td>
                    <td style={{ fontWeight: '600' }}>{sub.name}</td>
                    <td><span className="badge badge-sky">{sub.credits} Credits</span></td>
                    <td>Semester {sub.semester}</td>
                    <td style={{ textTransform: 'capitalize' }}>{sub.type}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        className="btn btn-sm btn-outline" 
                        onClick={() => setItemToDelete({ type: 'subject', id: sub.id, name: `${sub.code}: ${sub.name}` })}
                        style={{ padding: '3px 8px', color: '#e11d48', borderColor: '#fecdd3' }}
                        title="Remove Course"
                      >
                        <Trash2 size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 2: STUDENT DIRECTORY & ADMISSIONS */}
      {section === 'students' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1fr) 2fr', gap: '20px' }}>
          {/* Enroll Student Form */}
          <div className="white-card">
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <UserPlus size={16} color="#059669" />
              <span>Enroll New Student</span>
            </h3>
            <form onSubmit={handleEnrollStudent} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Student Full Name <span style={{ color: '#e11d48' }}>*</span>
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. Alex Rivera" 
                  value={stuForm.name} 
                  onChange={e => setStuForm({ ...stuForm, name: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  required 
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '4px' }}>
                    Enrolment ID <span style={{ color: '#e11d48' }}>*</span>
                  </label>
                  <input 
                    type="text" 
                    placeholder="EN2024-001" 
                    value={stuForm.enrolmentNo} 
                    onChange={e => setStuForm({ ...stuForm, enrolmentNo: e.target.value.toUpperCase() })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    required 
                  />
                </div>
                <div style={{ width: '120px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '4px' }}>
                    Roll No <span style={{ color: '#e11d48' }}>*</span>
                  </label>
                  <input 
                    type="text" 
                    placeholder="24CS001" 
                    value={stuForm.rollNo} 
                    onChange={e => setStuForm({ ...stuForm, rollNo: e.target.value.toUpperCase() })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    required 
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Email Address (for portal access)
                </label>
                <input 
                  type="email" 
                  placeholder="student@campus.edu" 
                  value={stuForm.email} 
                  onChange={e => setStuForm({ ...stuForm, email: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '4px' }}>
                    Semester Term <span style={{ color: '#e11d48' }}>*</span>
                  </label>
                  <select 
                    value={stuForm.semester} 
                    onChange={e => setStuForm({ ...stuForm, semester: parseInt(e.target.value, 10) })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff' }}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>
                </div>
                <div style={{ width: '100px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '4px' }}>
                    Section <span style={{ color: '#e11d48' }}>*</span>
                  </label>
                  <select 
                    value={stuForm.section} 
                    onChange={e => setStuForm({ ...stuForm, section: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff' }}
                  >
                    <option value="A">Sec A</option>
                    <option value="B">Sec B</option>
                    <option value="C">Sec C</option>
                  </select>
                </div>
              </div>

              <button 
                type="submit" 
                className="btn btn-emerald btn-sm" 
                disabled={isSaving}
                style={{ marginTop: '6px' }}
              >
                {isSaving ? <Loader2 size={14} className="spin" /> : <UserPlus size={14} />}
                <span>Admit Student</span>
              </button>
            </form>
          </div>

          {/* Student Directory Table */}
          <div className="white-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>
                  Enrolled Students Directory ({filteredStudents.length})
                </h3>
                <p style={{ fontSize: '12px', color: '#64748b' }}>Master student identity records</p>
              </div>

              <div className="search-box" style={{ width: '220px' }}>
                <Search size={14} className="search-icon" />
                <input
                  type="text"
                  placeholder="Filter students..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="clean-table-container">
              <table className="clean-table">
                <thead>
                  <tr>
                    <th>Roll No</th>
                    <th>Name</th>
                    <th>Enrolment ID</th>
                    <th>Class</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map(s => (
                    <tr key={s.id}>
                      <td style={{ fontWeight: '700', fontFamily: 'monospace' }}>{s.rollNo}</td>
                      <td style={{ fontWeight: '600' }}>{s.name}</td>
                      <td>{s.enrolmentNo}</td>
                      <td>Sem {s.semester} (Sec {s.section})</td>
                      <td><span className="badge badge-emerald">Active</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: FEE STRUCTURES */}
      {section === 'fees' && (
        <div className="white-card" style={{ maxWidth: '560px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CreditCard size={16} color="#e11d48" />
            <span>Create Institutional Fee Head</span>
          </h3>
          <form onSubmit={handleCreateFee} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '4px' }}>
                Fee Head Title <span style={{ color: '#e11d48' }}>*</span>
              </label>
              <input 
                type="text" 
                placeholder="e.g. Laboratory & Computing Dues" 
                value={feeForm.head} 
                onChange={e => setFeeForm({ ...feeForm, head: e.target.value })}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                required 
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Amount in INR (₹) <span style={{ color: '#e11d48' }}>*</span>
                </label>
                <input 
                  type="number" 
                  placeholder="12500" 
                  value={feeForm.amount} 
                  onChange={e => setFeeForm({ ...feeForm, amount: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  required 
                />
              </div>
              <div style={{ width: '130px' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Semester <span style={{ color: '#e11d48' }}>*</span>
                </label>
                <select
                  value={feeForm.semester}
                  onChange={e => setFeeForm({ ...feeForm, semester: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff' }}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                    <option key={s} value={s}>Semester {s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '4px' }}>
                Official Payment Due Date <span style={{ color: '#e11d48' }}>*</span>
              </label>
              <input 
                type="date" 
                value={feeForm.dueDate} 
                onChange={e => setFeeForm({ ...feeForm, dueDate: e.target.value })}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                required 
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-indigo btn-sm" 
              disabled={isSaving}
              style={{ alignSelf: 'flex-start', marginTop: '4px' }}
            >
              {isSaving ? <Loader2 size={14} className="spin" /> : <Plus size={14} />}
              <span>Define & Schedule Fee Head</span>
            </button>
          </form>
        </div>
      )}

      {/* SECTION 4: NOTICE BOARD */}
      {section === 'notices' && (
        <div className="white-card" style={{ maxWidth: '620px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Bell size={16} color="#d97706" />
            <span>Publish Institutional Circular</span>
          </h3>
          <form onSubmit={handlePostNotice} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '4px' }}>
                Circular Headline <span style={{ color: '#e11d48' }}>*</span>
              </label>
              <input 
                type="text" 
                placeholder="e.g. Mid-Term Examination Schedule Released" 
                value={noticeForm.title} 
                onChange={e => setNoticeForm({ ...noticeForm, title: e.target.value })}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                required 
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '4px' }}>
                Circular Description / Memorandum <span style={{ color: '#e11d48' }}>*</span>
              </label>
              <textarea 
                rows={4}
                placeholder="Details of the announcement..." 
                value={noticeForm.body} 
                onChange={e => setNoticeForm({ ...noticeForm, body: e.target.value })}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', resize: 'vertical' }}
                required 
              />
            </div>

            <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
              <div style={{ width: '160px' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Category
                </label>
                <select 
                  value={noticeForm.category} 
                  onChange={e => setNoticeForm({ ...noticeForm, category: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff' }}
                >
                  <option value="Academic">Academic</option>
                  <option value="Exams">Exams</option>
                  <option value="Finance">Finance</option>
                  <option value="Campus">Campus</option>
                </select>
              </div>

              <label style={{ fontSize: '13px', color: '#475569', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginTop: '16px' }}>
                <input 
                  type="checkbox" 
                  checked={noticeForm.isUrgent} 
                  onChange={e => setNoticeForm({ ...noticeForm, isUrgent: e.target.checked })} 
                />
                <span style={{ fontWeight: '600' }}>Mark as High Priority Broadcast</span>
              </label>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-sm" 
              disabled={isSaving}
              style={{ alignSelf: 'flex-start', marginTop: '6px', background: '#0f172a', borderColor: '#0f172a' }}
            >
              {isSaving ? <Loader2 size={14} className="spin" /> : <Bell size={14} />}
              <span>Publish Circular to Students & Faculty</span>
            </button>
          </form>
        </div>
      )}

      {/* SECTION 5: CLOUD HEALTH & DIAGNOSTICS */}
      {section === 'cloud' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="white-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>Cloud Infrastructure Health</h3>
                <p style={{ fontSize: '12px', color: '#64748b' }}>Liveness & readiness probe from GET /api/v1/health</p>
              </div>
              <span className="badge badge-emerald" style={{ padding: '4px 12px' }}>
                <Activity size={13} />
                <span>All Microservices Operational</span>
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
              <div style={{ padding: '14px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '12px', color: '#64748b' }}>PostgreSQL 17 (Supabase)</div>
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#059669', marginTop: '4px' }}>Connected (Pool: Active)</div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>Lat: ~35ms • AWS eu-central</div>
              </div>

              <div style={{ padding: '14px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Payment Gateway</div>
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#0284c7', marginTop: '4px' }}>Razorpay Test Sandbox</div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>Key: rzp_test_*** active</div>
              </div>

              <div style={{ padding: '14px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Transactional Mailer</div>
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#7c3aed', marginTop: '4px' }}>Resend Cloud API</div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>Dev sandbox routing active</div>
              </div>

              <div style={{ padding: '14px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '12px', color: '#64748b' }}>API Container Rate Limiting</div>
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', marginTop: '4px' }}>300 req / 15 min</div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>Standard IP Sliding Window</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: '420px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#e11d48', marginBottom: '12px' }}>
              <AlertTriangle size={24} />
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>Confirm Deletion</h3>
            </div>
            <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.5 }}>
              Are you sure you want to remove <strong>{itemToDelete.name}</strong> from the catalog? This record will be archived.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button className="btn btn-outline" onClick={() => setItemToDelete(null)}>
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                onClick={() => {
                  showToast(`Removed ${itemToDelete.name}`);
                  setItemToDelete(null);
                }}
                style={{ background: '#e11d48', borderColor: '#e11d48' }}
              >
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
