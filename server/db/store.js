import crypto from 'crypto';

// In-Memory Relational Datastore implementing PRD Schema
// All entity collections are initialized EMPTY as requested ("do not feed any data").
class Datastore {
  constructor() {
    this.reset();
  }

  reset() {
    // 1. Initial admin account so the system can be configured
    this.users = [
      {
        id: 'usr-admin-01',
        email: 'admin@campus.edu',
        password: 'password123',
        role: 'admin',
        status: 'active',
        createdAt: new Date().toISOString()
      }
    ];

    // All academic & operational collections start completely EMPTY
    this.departments = [];
    this.programmes = [];
    this.subjects = [];
    this.teachers = [];
    this.students = [];
    this.classes = [];
    this.enrolments = [];
    this.timetableSlots = [];
    this.attendance = [];
    this.exams = [];
    this.marks = [];
    this.feeStructures = [];
    this.feeDues = [];
    this.payments = [];
    this.notices = [];
    this.auditLogs = [];
  }

  generateId(prefix = 'id') {
    return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
  }

  // --- USERS & AUTH ---
  findUserByEmail(email) {
    return this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  findUserById(id) {
    return this.users.find(u => u.id === id);
  }

  createUser(userData) {
    const user = {
      id: this.generateId('usr'),
      status: 'active',
      createdAt: new Date().toISOString(),
      ...userData
    };
    this.users.push(user);
    return user;
  }

  // --- ACADEMICS ---
  createDepartment(data) {
    const dept = { id: this.generateId('dept'), createdAt: new Date().toISOString(), ...data };
    this.departments.push(dept);
    return dept;
  }

  createProgramme(data) {
    const prog = { id: this.generateId('prog'), createdAt: new Date().toISOString(), ...data };
    this.programmes.push(prog);
    return prog;
  }

  createSubject(data) {
    const sub = { id: this.generateId('sub'), createdAt: new Date().toISOString(), ...data };
    this.subjects.push(sub);
    return sub;
  }

  createClass(data) {
    const cls = { id: this.generateId('cls'), createdAt: new Date().toISOString(), ...data };
    this.classes.push(cls);
    return cls;
  }

  // --- TEACHERS ---
  createTeacher(data) {
    const teacher = { id: this.generateId('tch'), createdAt: new Date().toISOString(), ...data };
    this.teachers.push(teacher);
    return teacher;
  }

  // --- STUDENTS ---
  createStudent(data) {
    const student = {
      id: this.generateId('std'),
      status: 'active',
      createdAt: new Date().toISOString(),
      ...data
    };
    this.students.push(student);
    return student;
  }

  // --- ATTENDANCE ---
  markAttendance(records, markedBy) {
    const inserted = [];
    const now = new Date().toISOString();
    for (const rec of records) {
      // Check existing to prevent duplicate entry
      const existingIdx = this.attendance.findIndex(
        a => a.studentId === rec.studentId && 
             a.subjectId === rec.subjectId && 
             a.date === rec.date && 
             a.period === rec.period
      );

      const entry = {
        id: this.generateId('att'),
        studentId: rec.studentId,
        subjectId: rec.subjectId,
        date: rec.date,
        period: rec.period,
        status: rec.status, // 'present', 'absent', 'late'
        markedBy,
        createdAt: now,
        updatedAt: now
      };

      if (existingIdx >= 0) {
        this.attendance[existingIdx] = { ...this.attendance[existingIdx], ...entry };
        inserted.push(this.attendance[existingIdx]);
      } else {
        this.attendance.push(entry);
        inserted.push(entry);
      }
    }
    return inserted;
  }

  getStudentAttendanceSummary(studentId) {
    const records = this.attendance.filter(a => a.studentId === studentId);
    const total = records.length;
    const attended = records.filter(a => a.status === 'present').length;
    const percentage = total > 0 ? parseFloat(((attended / total) * 100).toFixed(1)) : 0;
    return { total, attended, missed: total - attended, percentage };
  }

  // --- EXAMS & MARKS ---
  createExam(data) {
    const exam = { id: this.generateId('exm'), isPublished: false, createdAt: new Date().toISOString(), ...data };
    this.exams.push(exam);
    return exam;
  }

  enterMarks(examId, marksList) {
    const inserted = [];
    for (const m of marksList) {
      const existingIdx = this.marks.findIndex(x => x.examId === examId && x.studentId === m.studentId);
      const entry = {
        id: this.generateId('mrk'),
        examId,
        studentId: m.studentId,
        marksObtained: m.marksObtained,
        grade: m.grade || this.calculateGrade(m.marksObtained),
        gradePoint: m.gradePoint || this.calculateGradePoint(m.marksObtained),
        createdAt: new Date().toISOString()
      };
      if (existingIdx >= 0) {
        this.marks[existingIdx] = { ...this.marks[existingIdx], ...entry };
        inserted.push(this.marks[existingIdx]);
      } else {
        this.marks.push(entry);
        inserted.push(entry);
      }
    }
    return inserted;
  }

  calculateGrade(marks) {
    if (marks >= 90) return 'O';
    if (marks >= 80) return 'A+';
    if (marks >= 70) return 'A';
    if (marks >= 60) return 'B+';
    if (marks >= 50) return 'B';
    if (marks >= 40) return 'C';
    return 'F';
  }

  calculateGradePoint(marks) {
    if (marks >= 90) return 10.0;
    if (marks >= 80) return 9.0;
    if (marks >= 70) return 8.0;
    if (marks >= 60) return 7.0;
    if (marks >= 50) return 6.0;
    if (marks >= 40) return 5.0;
    return 0.0;
  }

  // --- FEES ---
  createFeeStructure(data) {
    const fee = { id: this.generateId('fee'), createdAt: new Date().toISOString(), ...data };
    this.feeStructures.push(fee);
    return fee;
  }

  createFeeDue(data) {
    const due = { id: this.generateId('due'), status: 'PENDING', createdAt: new Date().toISOString(), ...data };
    this.feeDues.push(due);
    return due;
  }

  recordPayment(dueId, mode, amount) {
    const due = this.feeDues.find(d => d.id === dueId);
    if (!due) throw new Error('Fee due record not found');
    
    due.status = 'PAID';
    const payment = {
      id: this.generateId('pay'),
      dueId,
      amount,
      mode,
      gatewayRef: `GW_SANDBOX_${Date.now()}`,
      receiptNo: `RCPT-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      paidAt: new Date().toISOString()
    };
    this.payments.push(payment);
    return { due, payment };
  }

  // --- NOTICES ---
  createNotice(data) {
    const notice = { id: this.generateId('not'), createdAt: new Date().toISOString(), ...data };
    this.notices.push(notice);
    return notice;
  }
}

export const db = new Datastore();
