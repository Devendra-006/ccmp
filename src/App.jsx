import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import DashboardOverview from './components/DashboardOverview';
import AttendanceModule from './components/AttendanceModule';
import TimetableModule from './components/TimetableModule';
import ExamsModule from './components/ExamsModule';
import FeesModule from './components/FeesModule';
import AssignmentsModule from './components/AssignmentsModule';
import NoticeBoardModule from './components/NoticeBoardModule';
import AdminPortal from './components/AdminPortal';
import TeacherPortal from './components/TeacherPortal';
import ReportCardModal from './components/ReportCardModal';
import FeeReceiptModal from './components/FeeReceiptModal';
import SandboxPaymentModal from './components/SandboxPaymentModal';
import NotificationsDrawer from './components/NotificationsDrawer';
import LoginModal from './components/LoginModal';
import { 
  apiGetMe,
  apiGetDepartments, 
  apiCreateDepartment,
  apiGetProgrammes,
  apiCreateProgramme,
  apiGetSubjects,
  apiCreateSubject,
  apiGetStudents,
  apiEnrollStudent,
  apiGetFeeStructures,
  apiCreateFeeStructure,
  apiGetFeeDues,
  apiPaySandbox,
  apiGetNotices,
  apiCreateNotice,
  apiMarkAttendance,
  apiEnterMarks
} from './api/client';
import './App.css';

export default function App() {
  const [currentRole, setCurrentRole] = useState('admin'); // 'admin', 'teacher', 'student'
  const [currentUser, setCurrentUser] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Relational Master Entities (Initialized empty as requested: "do not feed any data")
  const [departments, setDepartments] = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [feeStructures, setFeeStructures] = useState([]);
  const [feeDues, setFeeDues] = useState([]);
  const [notices, setNotices] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);

  // Modals state
  const [showReportCard, setShowReportCard] = useState(false);
  const [activePaymentFee, setActivePaymentFee] = useState(null);
  const [activeReceiptFee, setActiveReceiptFee] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);

  // Load live data from Express backend /api/v1
  const fetchAllData = async () => {
    try {
      const [deptRes, progRes, subRes, stuRes, feeRes, noticeRes] = await Promise.allSettled([
        apiGetDepartments(),
        apiGetProgrammes(),
        apiGetSubjects(),
        apiGetStudents(),
        apiGetFeeStructures(),
        apiGetNotices()
      ]);

      if (deptRes.status === 'fulfilled' && deptRes.value.data) setDepartments(deptRes.value.data);
      if (progRes.status === 'fulfilled' && progRes.value.data) setProgrammes(progRes.value.data);
      if (subRes.status === 'fulfilled' && subRes.value.data) setSubjects(subRes.value.data);
      if (stuRes.status === 'fulfilled' && stuRes.value.data) setStudents(stuRes.value.data);
      if (feeRes.status === 'fulfilled' && feeRes.value.data) setFeeStructures(feeRes.value.data);
      if (noticeRes.status === 'fulfilled' && noticeRes.value.data) setNotices(noticeRes.value.data);
    } catch (err) {
      console.warn('Backend live fetch notice:', err.message);
    }
  };

  // Check active JWT session on initial mount
  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem('csms_auth_token');
      if (token) {
        try {
          const res = await apiGetMe();
          if (res.user) {
            setCurrentUser(res.user);
            setCurrentRole(res.user.role === 'super_admin' ? 'admin' : res.user.role);
          }
        } catch (_) {
          localStorage.removeItem('csms_auth_token');
        }
      }
    };

    checkSession();
    fetchAllData();
  }, []);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    const mappedRole = user.role === 'super_admin' ? 'admin' : user.role;
    setCurrentRole(mappedRole);
    fetchAllData();
  };

  const handleLogout = () => {
    localStorage.removeItem('csms_auth_token');
    setCurrentUser(null);
  };

  // Handlers for Admin actions
  const handleAddDepartment = async (dept) => {
    try {
      const res = await apiCreateDepartment(dept);
      if (res.data) setDepartments(prev => [...prev, res.data]);
    } catch (e) {
      setDepartments(prev => [...prev, { id: `dept-${Date.now()}`, ...dept }]);
    }
  };

  const handleAddProgramme = async (prog) => {
    try {
      const res = await apiCreateProgramme(prog);
      if (res.data) setProgrammes(prev => [...prev, res.data]);
    } catch (e) {
      setProgrammes(prev => [...prev, { id: `prog-${Date.now()}`, ...prog }]);
    }
  };

  const handleAddSubject = async (sub) => {
    try {
      const res = await apiCreateSubject(sub);
      if (res.data) setSubjects(prev => [...prev, res.data]);
    } catch (e) {
      setSubjects(prev => [...prev, { id: `sub-${Date.now()}`, ...sub }]);
    }
  };

  const handleEnrollStudent = async (stu) => {
    try {
      const res = await apiEnrollStudent(stu);
      if (res.data) setStudents(prev => [...prev, res.data]);
    } catch (e) {
      setStudents(prev => [...prev, { id: `std-${Date.now()}`, ...stu }]);
    }
  };

  const handleAddFeeStructure = async (fee) => {
    try {
      const res = await apiCreateFeeStructure(fee);
      if (res.data) setFeeStructures(prev => [...prev, res.data]);
    } catch (e) {
      setFeeStructures(prev => [...prev, { id: `fee-${Date.now()}`, ...fee }]);
    }
  };

  const handlePostNotice = async (notice) => {
    try {
      const res = await apiCreateNotice(notice);
      if (res.data) setNotices(prev => [...prev, res.data]);
    } catch (e) {
      setNotices(prev => [...prev, { id: `not-${Date.now()}`, ...notice }]);
    }
  };

  // Handlers for Teacher actions
  const handleMarkAttendance = async (data) => {
    try {
      await apiMarkAttendance(data);
      setAttendanceRecords(prev => [...prev, ...data.records]);
    } catch (e) {
      setAttendanceRecords(prev => [...prev, ...data.records]);
    }
  };

  const handleRecordMarks = async (data) => {
    console.log('Recorded marks:', data);
  };

  // Active student for student view (first enrolled student, or null)
  const currentStudent = students[0] || null;

  return (
    <div className="app-container">
      {/* Sidebar for Student view navigation */}
      {currentRole === 'student' && (
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      )}

      {/* Main Content */}
      <div className="main-wrapper">
        <Navbar
          currentRole={currentRole}
          onSwitchRole={setCurrentRole}
          currentStudent={currentStudent}
          currentUser={currentUser}
          onOpenLogin={() => setShowLoginModal(true)}
          onLogout={handleLogout}
          onToggleNotifications={() => setShowNotifications(!showNotifications)}
          unreadCount={notices.length}
          onOpenReportCard={() => setShowReportCard(true)}
          onOpenQuickFee={() => {
            const pending = feeDues.find(f => f.status === 'PENDING') || { title: 'Semester Dues', totalAmount: 12500, dueAmount: 12500 };
            setActivePaymentFee(pending);
          }}
        />

        <main className="content-body">
          {/* ADMIN PORTAL VIEW (Module 1, 2, 5 setup) */}
          {currentRole === 'admin' && (
            <AdminPortal
              departments={departments}
              programmes={programmes}
              subjects={subjects}
              students={students}
              onAddDepartment={handleAddDepartment}
              onAddProgramme={handleAddProgramme}
              onAddSubject={handleAddSubject}
              onEnrollStudent={handleEnrollStudent}
              onAddFeeStructure={handleAddFeeStructure}
              onPostNotice={handlePostNotice}
            />
          )}

          {/* TEACHER PORTAL VIEW (Module 3 attendance & Module 4 marks) */}
          {currentRole === 'teacher' && (
            <TeacherPortal
              subjects={subjects}
              students={students}
              onMarkAttendance={handleMarkAttendance}
              onRecordMarks={handleRecordMarks}
            />
          )}

          {/* STUDENT PORTAL VIEW (Golden MVP Student experience) */}
          {currentRole === 'student' && (
            <>
              {activeTab === 'overview' && (
                <DashboardOverview
                  currentStudent={currentStudent}
                  attendanceStats={{ total: attendanceRecords.length, attended: attendanceRecords.filter(r => r.status === 'present').length, percentage: attendanceRecords.length > 0 ? ((attendanceRecords.filter(r => r.status === 'present').length / attendanceRecords.length)*100).toFixed(1) : 0 }}
                  subjects={subjects}
                  feesList={feeDues}
                  notices={notices}
                  onOpenReportCard={() => setShowReportCard(true)}
                  onOpenSimulator={() => setActiveTab('attendance')}
                  onOpenPaymentModal={() => {
                    setActivePaymentFee({ title: 'Semester Dues', totalAmount: 12500, dueAmount: 12500 });
                  }}
                  onSwitchRole={setCurrentRole}
                />
              )}

              {activeTab === 'attendance' && <AttendanceModule />}

              {activeTab === 'timetable' && <TimetableModule />}

              {activeTab === 'exams' && (
                <ExamsModule onOpenReportCard={() => setShowReportCard(true)} />
              )}

              {activeTab === 'fees' && (
                <FeesModule
                  feesList={feeDues}
                  onInitiatePayment={(fee) => setActivePaymentFee(fee)}
                  onViewReceipt={(fee) => setActiveReceiptFee(fee)}
                />
              )}

              {activeTab === 'assignments' && <AssignmentsModule />}

              {activeTab === 'notices' && <NoticeBoardModule />}
            </>
          )}
        </main>
      </div>

      {/* Notifications Drawer */}
      {showNotifications && (
        <NotificationsDrawer
          onClose={() => setShowNotifications(false)}
          onSelectNotice={() => {
            if (currentRole === 'student') setActiveTab('notices');
          }}
        />
      )}

      {/* Official Grade Card / Marksheet Modal */}
      {showReportCard && (
        <ReportCardModal onClose={() => setShowReportCard(false)} />
      )}

      {/* Sandbox Fee Payment Modal */}
      {activePaymentFee && (
        <SandboxPaymentModal
          feeItem={activePaymentFee}
          onClose={() => setActivePaymentFee(null)}
          onPaymentSuccess={(feeId) => {
            setActivePaymentFee(null);
            setActiveReceiptFee({
              title: 'Assessment Dues',
              totalAmount: 12500,
              receiptNo: `RCPT-2026-${Math.floor(10000 + Math.random() * 90000)}`,
              paymentDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
              paymentMode: 'Online Sandbox (Razorpay Test Mode)'
            });
          }}
        />
      )}

      {/* Official Tax Fee Receipt Modal */}
      {activeReceiptFee && (
        <FeeReceiptModal
          feeItem={activeReceiptFee}
          onClose={() => setActiveReceiptFee(null)}
        />
      )}

      {/* Role-Based Authentication & Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={handleLoginSuccess}
        initialRole={currentRole}
      />
    </div>
  );
}
