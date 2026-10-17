import { pool } from '../db/postgres.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

console.log('--- SEEDING PRODUCTION DEMO DATA INTO POSTGRESQL ---');

async function seedData() {
  try {
    const salt = await bcrypt.genSalt(10);
    const adminPass = await bcrypt.hash('Admin@123', salt);
    const teacherPass = await bcrypt.hash('Teacher@123', salt);
    const studentPass = await bcrypt.hash('Student@123', salt);

    // 1. Ensure Super Admin User
    await pool.query(`
      INSERT INTO users (email, password_hash, role, status)
      VALUES ('admin@campus.edu', $1, 'admin', 'active')
      ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash;
    `, [adminPass]);

    // 2. Departments
    const deptRows = [
      { code: 'CSE', name: 'Computer Science & Engineering' },
      { code: 'ECE', name: 'Electronics & Communication Engineering' },
      { code: 'MECH', name: 'Mechanical Engineering' }
    ];

    const depts = {};
    for (const d of deptRows) {
      const res = await pool.query(`
        INSERT INTO departments (code, name) VALUES ($1, $2)
        ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name
        RETURNING id, code, name;
      `, [d.code, d.name]);
      depts[d.code] = res.rows[0].id;
    }
    console.log('✓ 3 Departments seeded:', Object.keys(depts).join(', '));

    // 3. Programmes
    const progRows = [
      { deptCode: 'CSE', code: 'BTECH_CSE', name: 'B.Tech in Computer Science & Engineering', duration: 8 },
      { deptCode: 'CSE', code: 'BTECH_AI', name: 'B.Tech in Artificial Intelligence & Data Science', duration: 8 },
      { deptCode: 'ECE', code: 'BTECH_ECE', name: 'B.Tech in Electronics & Communication', duration: 8 },
      { deptCode: 'MECH', code: 'BTECH_ME', name: 'B.Tech in Mechanical Engineering', duration: 8 }
    ];

    const progs = {};
    for (const p of progRows) {
      const res = await pool.query(`
        INSERT INTO programmes (department_id, code, name, duration_semesters)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, department_id = EXCLUDED.department_id
        RETURNING id, code, name;
      `, [depts[p.deptCode], p.code, p.name, p.duration]);
      progs[p.code] = res.rows[0].id;
    }
    console.log('✓ 4 Programmes seeded:', Object.keys(progs).join(', '));

    // 4. Subjects (Semester 4 Curriculum)
    const subRows = [
      { prog: 'BTECH_CSE', code: 'CS401', name: 'Data Structures & Algorithms', credits: 4, sem: 4, type: 'core' },
      { prog: 'BTECH_CSE', code: 'CS402', name: 'Database Management Systems', credits: 4, sem: 4, type: 'core' },
      { prog: 'BTECH_CSE', code: 'CS403', name: 'Operating Systems & Architecture', credits: 3, sem: 4, type: 'core' },
      { prog: 'BTECH_CSE', code: 'CS404', name: 'Computer Networks & Security', credits: 3, sem: 4, type: 'core' },
      { prog: 'BTECH_CSE', code: 'CS405', name: 'Cloud Computing & Virtualization', credits: 3, sem: 4, type: 'core' },
      { prog: 'BTECH_CSE', code: 'CS406', name: 'Web Technologies & REST Lab', credits: 2, sem: 4, type: 'lab' },
      { prog: 'BTECH_AI', code: 'AI401', name: 'Machine Learning Foundations', credits: 4, sem: 4, type: 'core' },
      { prog: 'BTECH_AI', code: 'AI402', name: 'Applied Statistics & Probability', credits: 3, sem: 4, type: 'core' },
      { prog: 'BTECH_ECE', code: 'EC401', name: 'Signals & Systems', credits: 4, sem: 4, type: 'core' },
      { prog: 'BTECH_ME', code: 'ME401', name: 'Thermodynamics & Fluid Dynamics', credits: 4, sem: 4, type: 'core' }
    ];

    const subjects = [];
    for (const s of subRows) {
      const res = await pool.query(`
        INSERT INTO subjects (programme_id, code, name, credits, semester, type)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, credits = EXCLUDED.credits
        RETURNING id, code, name, credits, semester;
      `, [progs[s.prog], s.code, s.name, s.credits, s.sem, s.type]);
      subjects.push(res.rows[0]);
    }
    console.log(`✓ ${subjects.length} Subjects seeded`);

    // 5. Teachers
    const teacherData = [
      { name: 'Dr. Robert Vance', email: 'robert.vance@campus.edu', empCode: 'EMP-CSE-101', designation: 'Professor & HOD', dept: 'CSE' },
      { name: 'Prof. Sarah Jenkins', email: 'sarah.jenkins@campus.edu', empCode: 'EMP-CSE-102', designation: 'Assistant Professor', dept: 'CSE' },
      { name: 'Dr. Michael Chang', email: 'michael.chang@campus.edu', empCode: 'EMP-ECE-201', designation: 'Associate Professor', dept: 'ECE' }
    ];

    const teachers = [];
    for (const t of teacherData) {
      const uRes = await pool.query(`
        INSERT INTO users (email, password_hash, role, status)
        VALUES ($1, $2, 'teacher', 'active')
        ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
        RETURNING id;
      `, [t.email, teacherPass]);

      const tRes = await pool.query(`
        INSERT INTO teachers (user_id, department_id, employee_code, name, designation, phone)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (employee_code) DO UPDATE SET name = EXCLUDED.name, designation = EXCLUDED.designation
        RETURNING id, employee_code, name;
      `, [uRes.rows[0].id, depts[t.dept], t.empCode, t.name, t.designation, '+91-9876543210']);
      teachers.push(tRes.rows[0]);
    }
    console.log(`✓ ${teachers.length} Faculty Members seeded`);

    // 6. Students (20 students)
    const studentList = [
      { name: 'Alex Rivera', email: 'student@campus.edu', roll: '22CS001', enr: 'EN2022-001' },
      { name: 'Aarav Patel', email: 'aarav.patel@campus.edu', roll: '22CS002', enr: 'EN2022-002' },
      { name: 'Diya Sharma', email: 'diya.sharma@campus.edu', roll: '22CS003', enr: 'EN2022-003' },
      { name: 'Rohan Verma', email: 'rohan.verma@campus.edu', roll: '22CS004', enr: 'EN2022-004' },
      { name: 'Ananya Gupta', email: 'ananya.gupta@campus.edu', roll: '22CS005', enr: 'EN2022-005' },
      { name: 'Liam Chen', email: 'liam.chen@campus.edu', roll: '22CS006', enr: 'EN2022-006' },
      { name: 'Siddharth Rao', email: 'siddharth.rao@campus.edu', roll: '22CS007', enr: 'EN2022-007' },
      { name: 'Meera Nair', email: 'meera.nair@campus.edu', roll: '22CS008', enr: 'EN2022-008' },
      { name: 'Kabir Mehta', email: 'kabir.mehta@campus.edu', roll: '22CS009', enr: 'EN2022-009' },
      { name: 'Pooja Iyer', email: 'pooja.iyer@campus.edu', roll: '22CS010', enr: 'EN2022-010' },
      { name: 'Aryan Joshi', email: 'aryan.joshi@campus.edu', roll: '22CS011', enr: 'EN2022-011' },
      { name: 'Zara Khan', email: 'zara.khan@campus.edu', roll: '22CS012', enr: 'EN2022-012' },
      { name: 'Aditya Kulkarni', email: 'aditya.kulkarni@campus.edu', roll: '22CS013', enr: 'EN2022-013' },
      { name: 'Sneha Deshmukh', email: 'sneha.deshmukh@campus.edu', roll: '22CS014', enr: 'EN2022-014' },
      { name: 'Vikram Malhotra', email: 'vikram.malhotra@campus.edu', roll: '22CS015', enr: 'EN2022-015' },
      { name: 'Tanvi Shinde', email: 'tanvi.shinde@campus.edu', roll: '22CS016', enr: 'EN2022-016' },
      { name: 'Ishaan Reddy', email: 'ishaan.reddy@campus.edu', roll: '22CS017', enr: 'EN2022-017' },
      { name: 'Kavya Pillai', email: 'kavya.pillai@campus.edu', roll: '22CS018', enr: 'EN2022-018' },
      { name: 'Harsh Vardhan', email: 'harsh.vardhan@campus.edu', roll: '22CS019', enr: 'EN2022-019' },
      { name: 'Riya Saxena', email: 'riya.saxena@campus.edu', roll: '22CS020', enr: 'EN2022-020' }
    ];

    const students = [];
    for (const s of studentList) {
      const uRes = await pool.query(`
        INSERT INTO users (email, password_hash, role, status)
        VALUES ($1, $2, 'student', 'active')
        ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
        RETURNING id;
      `, [s.email, studentPass]);

      const sRes = await pool.query(`
        INSERT INTO students (user_id, enrolment_no, roll_no, name, programme_id, batch, semester, section, phone, address, blood_group)
        VALUES ($1, $2, $3, $4, $5, '2024-2028', 4, 'A', '+91-9123456789', 'Campus Hostel Block-B', 'O+')
        ON CONFLICT (enrolment_no) DO UPDATE SET name = EXCLUDED.name, roll_no = EXCLUDED.roll_no
        RETURNING id, enrolment_no, roll_no, name;
      `, [uRes.rows[0].id, s.enr, s.roll, s.name, progs['BTECH_CSE']]);
      students.push(sRes.rows[0]);
    }
    console.log(`✓ ${students.length} Students seeded`);

    // 7. Attendance Records (3 weeks across CSE Semester 4 subjects)
    const primaryStudent = students[0]; // Alex Rivera (student@campus.edu)
    const cseSubjects = subjects.filter(s => s.code.startsWith('CS'));
    const teacherId = teachers[0].id;

    let attCount = 0;
    // Generate dates over past 15 weekdays
    const dates = [];
    for (let i = 20; i >= 1; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      if (d.getDay() !== 0 && d.getDay() !== 6) { // skip weekends
        dates.push(d.toISOString().split('T')[0]);
      }
    }

    for (const date of dates.slice(0, 10)) {
      for (let p = 1; p <= 3; p++) {
        const sub = cseSubjects[p - 1];
        if (!sub) continue;
        const period = `0${p}`;

        const valueRows = [];
        const params = [];
        let paramIdx = 1;

        for (const stu of students) {
          let status = 'present';
          const rand = Math.random();
          if (stu.id === primaryStudent.id) {
            status = rand > 0.08 ? 'present' : rand > 0.04 ? 'late' : 'absent';
          } else {
            status = rand > 0.20 ? 'present' : rand > 0.10 ? 'absent' : 'late';
          }

          valueRows.push(`($${paramIdx}, $${paramIdx+1}, $${paramIdx+2}, $${paramIdx+3}, $${paramIdx+4}, $${paramIdx+5})`);
          params.push(stu.id, sub.id, date, period, status, teacherId);
          paramIdx += 6;
          attCount++;
        }

        if (valueRows.length > 0) {
          await pool.query(`
            INSERT INTO attendance (student_id, subject_id, date, period, status, marked_by)
            VALUES ${valueRows.join(', ')}
            ON CONFLICT (student_id, subject_id, date, period)
            DO UPDATE SET status = EXCLUDED.status;
          `, params);
        }
      }
    }
    console.log(`✓ ${attCount} Attendance ledger logs seeded`);

    const parentPass = await bcrypt.hash('Parent@123', salt);
    const accountantPass = await bcrypt.hash('Accountant@123', salt);

    // 1b. Ensure Parent and Accountant users exist
    await pool.query(`
      INSERT INTO users (email, password_hash, role, status)
      VALUES 
        ('parent@campus.edu', $1, 'parent', 'active'),
        ('accountant@campus.edu', $2, 'accountant', 'active')
      ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash;
    `, [parentPass, accountantPass]);

    // 8. Exams & Marks (Mid-Term 2026)
    const alexSubjectMarks = {
      'CS401': 46.5, // DSA: 93% (O)
      'CS402': 43.0, // DBMS: 86% (A+)
      'CS403': 39.5, // OS: 79% (A)
      'CS404': 44.0  // Networks: 88% (A+)
    };

    for (const sub of cseSubjects.slice(0, 4)) {
      const exRes = await pool.query(`
        INSERT INTO exams (subject_id, name, type, date, max_marks, weightage, is_published)
        VALUES ($1, $2, 'mid_term', '2026-03-15', 50, 30, true)
        RETURNING id;
      `, [sub.id, `Mid-Term Exam - ${sub.name}`]);
      const examId = exRes.rows[0].id;

      const markRows = [];
      const markParams = [];
      let mIdx = 1;

      for (const stu of students) {
        let marks = stu.id === primaryStudent.id 
          ? (alexSubjectMarks[sub.code] || 42.5) 
          : Math.floor(25 + Math.random() * 23);

        const pct = (marks / 50) * 100;
        const grade = pct >= 90 ? 'O' : pct >= 80 ? 'A+' : pct >= 70 ? 'A' : pct >= 60 ? 'B+' : 'B';
        const gp = pct >= 90 ? 10.0 : pct >= 80 ? 9.0 : pct >= 70 ? 8.0 : pct >= 60 ? 7.0 : 6.0;

        markRows.push(`($${mIdx}, $${mIdx+1}, $${mIdx+2}, $${mIdx+3}, $${mIdx+4})`);
        markParams.push(examId, stu.id, marks, grade, gp);
        mIdx += 5;
      }

      await pool.query(`
        INSERT INTO marks (exam_id, student_id, marks_obtained, grade, grade_point)
        VALUES ${markRows.join(', ')}
        ON CONFLICT (exam_id, student_id)
        DO UPDATE SET marks_obtained = EXCLUDED.marks_obtained, grade = EXCLUDED.grade, grade_point = EXCLUDED.grade_point;
      `, markParams);
    }
    console.log('✓ Diverse examinations and Gradebook marks seeded');

    // 9. Fee Structures & Complete 20-Student Ledger
    await pool.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_fee_dues_unique ON fee_dues (student_id, fee_structure_id);
    `);

    const fs1 = await pool.query(`
      INSERT INTO fee_structures (programme_id, semester, head, amount_in_paise, due_date)
      VALUES ($1, 4, 'Semester 4 Tuition Fee', 6500000, '2026-04-30')
      RETURNING id;
    `, [progs['BTECH_CSE']]);

    const fs2 = await pool.query(`
      INSERT INTO fee_structures (programme_id, semester, head, amount_in_paise, due_date)
      VALUES ($1, 4, 'Laboratory & Computing Dues', 1250000, '2026-05-15')
      RETURNING id;
    `, [progs['BTECH_CSE']]);

    // Seed dues across ALL 20 students so Accountant Ledger is 100% full and authentic
    let seededDuesCount = 0;
    for (let idx = 0; idx < students.length; idx++) {
      const stu = students[idx];
      // Alex Rivera (idx === 0): Tuition is PAID, Lab is PENDING
      const tuitionPaid = idx === 0 ? true : idx % 2 === 0;
      const labPaid = idx === 0 ? false : idx % 3 === 0;

      const due1 = await pool.query(`
        INSERT INTO fee_dues (student_id, fee_structure_id, amount_in_paise, status)
        VALUES ($1, $2, 6500000, $3)
        ON CONFLICT (student_id, fee_structure_id) DO UPDATE SET status = EXCLUDED.status
        RETURNING id;
      `, [stu.id, fs1.rows[0].id, tuitionPaid ? 'PAID' : 'PENDING']);
      seededDuesCount++;

      if (tuitionPaid) {
        await pool.query(`
          INSERT INTO payments (due_id, amount_in_paise, mode, gateway_ref, receipt_no, paid_at)
          VALUES ($1, 6500000, 'upi', $2, $3, '2026-03-01T10:30:00Z')
          ON CONFLICT (receipt_no) DO NOTHING
        `, [due1.rows[0].id, `pay_rzp_live_${849100 + idx}`, `RCP-2026-${849100 + idx}`]);
      }

      const due2 = await pool.query(`
        INSERT INTO fee_dues (student_id, fee_structure_id, amount_in_paise, status)
        VALUES ($1, $2, 1250000, $3)
        ON CONFLICT (student_id, fee_structure_id) DO UPDATE SET status = EXCLUDED.status
        RETURNING id;
      `, [stu.id, fs2.rows[0].id, labPaid ? 'PAID' : 'PENDING']);
      seededDuesCount++;

      if (labPaid) {
        await pool.query(`
          INSERT INTO payments (due_id, amount_in_paise, mode, gateway_ref, receipt_no, paid_at)
          VALUES ($1, 1250000, 'upi', $2, $3, '2026-03-05T14:20:00Z')
          ON CONFLICT (receipt_no) DO NOTHING
        `, [due2.rows[0].id, `pay_rzp_live_${949100 + idx}`, `RCP-2026-${949100 + idx}`]);
      }
    }

    console.log(`✓ ${seededDuesCount} Fee ledger dues & receipts seeded across all 20 students`);

    // 10. Notices (3 Campus Circulars)
    const noticesList = [
      {
        title: 'Mid-Term Examination Schedule Released (Semester 4)',
        body: 'The mid-term assessments for B.Tech Semester 4 will commence from March 25th. Download your hall ticket from the portal.',
        category: 'Exams',
        audience: 'all',
        isUrgent: true
      },
      {
        title: 'Annual Campus Cloud Computing & AI Hackathon 2026',
        body: 'Registrations are open for the 36-hour National Hackathon. Winners receive cloud credits and incubation support.',
        category: 'Events',
        audience: 'students',
        isUrgent: false
      },
      {
        title: 'Central Library Extended Study Hours Notice',
        body: 'The central digital library will remain open 24x7 during the examination period starting next Monday.',
        category: 'Facilities',
        audience: 'all',
        isUrgent: false
      }
    ];

    for (const n of noticesList) {
      await pool.query(`
        INSERT INTO notices (title, body, category, audience, is_urgent, created_by)
        VALUES ($1, $2, $3, $4, $5, (SELECT id FROM users WHERE email = 'admin@campus.edu'))
      `, [n.title, n.body, n.category, n.audience, n.isUrgent]);
    }
    console.log('✓ 3 Campus Circulars & Notices seeded');

    console.log('\n======================================================');
    console.log('🎉 PRODUCTION DEMO DATA SEEDED SUCCESSFULLY!');
    console.log('Demo Accounts:');
    console.log('  - Super Admin: admin@campus.edu / Admin@123');
    console.log('  - Teacher:     robert.vance@campus.edu / Teacher@123');
    console.log('  - Student:     student@campus.edu / Student@123 (Alex Rivera)');
    console.log('======================================================');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seedData();
