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
import ParentPortal from './components/ParentPortal';
import AccountantPortal from './components/AccountantPortal';
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
  apiGetAttendanceSummary,
  apiGetResults,
  apiEnterMarks
} from './api/client';
import './App.css';

export default function App() {
  const [currentRole, setCurrentRole] = useState('student'); // 'admin', 'teacher', 'student', 'parent', 'accountant'
  const [currentUser, setCurrentUser] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Relational Master Entities
  const [departments, setDepartments] = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [feeStructures, setFeeStructures] = useState([]);
  const [feeDues, setFeeDues] = useState([]);
  const [notices, setNotices] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [attendanceStats, setAttendanceStats] = useState({ total: 30, attended: 29, percentage: 97 });
  const [examResults, setExamResults] = useState(null);

  // Modals state
  const [showReportCard, setShowReportCard] = useState(false);
  const [activePaymentFee, setActivePaymentFee] = useState(null);
  const [activeReceiptFee, setActiveReceiptFee] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);

  // Load live data from Express backend /api/v1
  const fetchAllData = async () => {
    try {
      setIsLoading(true);
      const [deptRes, progRes, subRes, stuRes, feeRes, noticeRes] = await Promise.allSettled([
        apiGetDepartments(),
        apiGetProgrammes(),
        apiGetSubjects(),
        apiGetStudents(),
        apiGetFeeStructures(),
        apiGetNotices()
      ]);

      let loadedStudents = [];
      if (deptRes.status === 'fulfilled' && deptRes.value.data) setDepartments(deptRes.value.data);
      if (progRes.status === 'fulfilled' && progRes.value.data) setProgrammes(progRes.value.data);
      if (subRes.status === 'fulfilled' && subRes.value.data) setSubjects(subRes.value.data);
      if (stuRes.status === 'fulfilled' && stuRes.value.data) {
        loadedStudents = stuRes.value.data;
        setStudents(loadedStudents);
      }
      if (feeRes.status === 'fulfilled' && feeRes.value.data) setFeeStructures(feeRes.value.data);
      if (noticeRes.status === 'fulfilled' && noticeRes.value.data) setNotices(noticeRes.value.data);

      // Fetch dynamic student-specific metrics for the active student (Alex Rivera)
      const targetStudent = loadedStudents.find(s => s.name === 'Alex Rivera') || loadedStudents[0];
      if (targetStudent) {
        const [duesRes, attRes, resRes] = await Promise.allSettled([
          apiGetFeeDues({ studentId: targetStudent.id }),
          apiGetAttendanceSummary(targetStudent.id),
          apiGetResults(targetStudent.id)
        ]);

        if (duesRes.status === 'fulfilled' && duesRes.value.data) {
          setFeeDues(duesRes.value.data);
        }
        if (attRes.status === 'fulfilled' && attRes.value.data) {
          setAttendanceStats({
            total: attRes.value.data.totalClasses || 30,
            attended: attRes.value.data.presentCount || 29,
            percentage: attRes.value.data.percentage !== undefined ? attRes.value.data.percentage : 97
          });
        }
        if (resRes.status === 'fulfilled' && resRes.value.data) {
          setExamResults(resRes.value.data);
        }
      }
    } catch (err) {
      console.warn('Backend live fetch note:', err.message);
    } finally {
      setIsLoading(false);
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
            const mapped = res.user.role === 'super_admin' ? 'admin' : res.user.role;
            setCurrentRole(mapped);
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
    setActiveTab('overview');
    fetchAllData();
  };

  const handleLogout = () => {
    localStorage.removeItem('csms_auth_token');
    setCurrentUser(null);
  };

  const handleRoleSwitch = (newRole) => {
    setCurrentRole(newRole);
    if (newRole === 'admin') setActiveTab('academic');
    else if (newRole === 'teacher') setActiveTab('attendance');
    else setActiveTab('overview');
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
      if (res.data) setNotices(prev => [res.data, ...prev]);
    } catch (e) {
      setNotices(prev => [{ id: `not-${Date.now()}`, created_at: new Date().toISOString(), ...notice }, ...prev]);
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

  // Active student for student / parent view (Alex Rivera or first student)
  const currentStudent = students.find(s => s.name === 'Alex Rivera') || students[0] || null;

  return (
    <div className="app-container">
      {/* Universal Left Sidebar for ALL Roles (Eliminates Layout Jumping) */}
      <Sidebar 
        currentRole={currentRole}
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        currentStudent={currentStudent}
        feesList={feeDues}
        notices={notices}
        attendanceStats={attendanceStats}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="main-wrapper">
        <Navbar
          currentRole={currentRole}
          onSwitchRole={handleRoleSwitch}
          currentStudent={currentStudent}
          currentUser={currentUser}
          onOpenLogin={() => setShowLoginModal(true)}
          onLogout={handleLogout}
          onToggleNotifications={() => setShowNotifications(!showNotifications)}
          unreadCount={notices.length}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />

        <main className="content-body">
          {/* 1. ADMIN PORTAL VIEW */}
          {currentRole === 'admin' && (
            <AdminPortal
              departments={departments}
              programmes={programmes}
              subjects={subjects}
              students={students}
              activeSection={activeTab}
              setActiveSection={setActiveTab}
              onAddDepartment={handleAddDepartment}
              onAddProgramme={handleAddProgramme}
              onAddSubject={handleAddSubject}
              onEnrollStudent={handleEnrollStudent}
              onAddFeeStructure={handleAddFeeStructure}
              onPostNotice={handlePostNotice}
            />
          )}

          {/* 2. TEACHER PORTAL VIEW */}
          {currentRole === 'teacher' && (
            <TeacherPortal
              subjects={subjects}
              students={students}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              onMarkAttendance={handleMarkAttendance}
              onRecordMarks={handleRecordMarks}
            />
          )}

          {/* 3. PARENT PORTAL VIEW */}
          {currentRole === 'parent' && (
            <ParentPortal
              currentStudent={currentStudent}
              attendanceStats={attendanceStats}
              examResults={examResults}
              feesList={feeDues}
              notices={notices}
              onOpenReportCard={() => setShowReportCard(true)}
              onInitiatePayment={(fee) => setActivePaymentFee(fee)}
            />
          )}

          {/* 4. ACCOUNTANT PORTAL VIEW */}
          {currentRole === 'accountant' && (
            <AccountantPortal
              feeStructures={feeStructures}
              feesList={feeDues}
              students={students}
              onAddFeeStructure={handleAddFeeStructure}
              onViewReceipt={(fee) => setActiveReceiptFee(fee)}
            />
          )}

          {/* 5. STUDENT PORTAL VIEW */}
          {currentRole === 'student' && (
            <>
              {activeTab === 'overview' && (
                <DashboardOverview
                  currentStudent={currentStudent}
                  attendanceStats={attendanceStats}
                  subjects={subjects}
                  feesList={feeDues}
                  notices={notices}
                  examResults={examResults}
                  onOpenReportCard={() => setShowReportCard(true)}
                  onOpenSimulator={() => setActiveTab('attendance')}
                  onOpenPaymentModal={() => {
                    const pending = feeDues.find(f => f.status === 'PENDING') || { 
                      title: 'Laboratory & Computing Dues', 
                      head: 'Laboratory & Computing Dues',
                      totalAmount: 12500, 
                      amountInPaise: 1250000 
                    };
                    setActivePaymentFee(pending);
                  }}
                  onSwitchRole={handleRoleSwitch}
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
          notices={notices}
          onClose={() => setShowNotifications(false)}
          onSelectNotice={() => {
            if (currentRole === 'student') setActiveTab('notices');
            else if (currentRole === 'admin') setActiveTab('notices');
          }}
        />
      )}

      {/* Official Grade Card / Marksheet Modal */}
      {showReportCard && (
        <ReportCardModal 
          currentStudent={currentStudent}
          examResults={examResults}
          onClose={() => setShowReportCard(false)} 
        />
      )}

      {/* Sandbox Fee Payment Modal */}
      {activePaymentFee && (
        <SandboxPaymentModal
          feeItem={activePaymentFee}
          onClose={() => setActivePaymentFee(null)}
          onPaymentSuccess={(feeId) => {
            setActivePaymentFee(null);
            // Mark fee as settled in state
            setFeeDues(prev => prev.map(f => f.id === feeId ? { ...f, status: 'PAID' } : f));
            setActiveReceiptFee({
              title: activePaymentFee.head || activePaymentFee.title || 'Laboratory & Computing Dues',
              totalAmount: activePaymentFee.amountInPaise ? activePaymentFee.amountInPaise / 100 : activePaymentFee.totalAmount || 12500,
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
          currentStudent={currentStudent}
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
