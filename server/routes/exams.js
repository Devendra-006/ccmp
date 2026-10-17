import express from 'express';
import { pool } from '../db/postgres.js';
import { authenticate, optionalAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

function calculateGrade(marks, maxMarks = 100) {
  const percentage = (marks / maxMarks) * 100;
  if (percentage >= 90) return { grade: 'O', gradePoint: 10.0 };
  if (percentage >= 80) return { grade: 'A+', gradePoint: 9.0 };
  if (percentage >= 70) return { grade: 'A', gradePoint: 8.0 };
  if (percentage >= 60) return { grade: 'B+', gradePoint: 7.0 };
  if (percentage >= 50) return { grade: 'B', gradePoint: 6.0 };
  if (percentage >= 40) return { grade: 'C', gradePoint: 5.0 };
  return { grade: 'F', gradePoint: 0.0 };
}

// List exams
router.get('/exams', optionalAuth, async (req, res) => {
  const { subjectId } = req.query;
  try {
    let queryText = `
      SELECT e.*, s.name AS subject_name, s.code AS subject_code 
      FROM exams e 
      LEFT JOIN subjects s ON e.subject_id = s.id 
      WHERE 1=1
    `;
    const params = [];

    if (subjectId) {
      params.push(subjectId);
      queryText += ` AND e.subject_id = $${params.length}`;
    }

    queryText += ` ORDER BY e.date DESC`;

    const result = await pool.query(queryText, params);
    const formatted = result.rows.map(r => ({
      ...r,
      subjectId: r.subject_id,
      maxMarks: r.max_marks,
      isPublished: r.is_published,
      subjectName: r.subject_name,
      subjectCode: r.subject_code
    }));

    res.json({ data: formatted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create exam (Admin / Teacher)
router.post('/exams', authenticate, requireRole(['admin', 'teacher']), async (req, res) => {
  const { subjectId, name, type = 'internal', date, maxMarks = 100, weightage = 100 } = req.body;
  if (!subjectId || !name || !date) {
    return res.status(400).json({ error: 'subjectId, name, and date are required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO exams (subject_id, name, type, date, max_marks, weightage, is_published) 
       VALUES ($1, $2, $3, $4, $5, $6, false) 
       RETURNING *`,
      [subjectId, name.trim(), type, date, parseInt(maxMarks, 10), parseInt(weightage, 10)]
    );

    const exam = result.rows[0];
    res.status(201).json({
      message: 'Exam created successfully',
      data: {
        ...exam,
        subjectId: exam.subject_id,
        maxMarks: exam.max_marks,
        isPublished: exam.is_published
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Publish exam results (Admin only - PRD EXM-4)
router.post('/exams/:id/publish', authenticate, requireRole(['admin']), async (req, res) => {
  try {
    const result = await pool.query(
      'UPDATE exams SET is_published = true WHERE id = $1 RETURNING *',
      [req.params.id]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'Exam not found' });

    res.json({
      message: 'Exam results published successfully',
      data: {
        ...result.rows[0],
        subjectId: result.rows[0].subject_id,
        isPublished: true
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Record marks for exam (Teacher / Admin)
router.post('/exams/:id/marks', authenticate, requireRole(['admin', 'teacher']), async (req, res) => {
  const { marksList } = req.body; // array of { studentId, marksObtained }
  if (!Array.isArray(marksList)) {
    return res.status(400).json({ error: 'marksList must be an array' });
  }

  try {
    const examRes = await pool.query('SELECT * FROM exams WHERE id = $1', [req.params.id]);
    if (examRes.rows.length === 0) return res.status(404).json({ error: 'Exam not found' });
    const exam = examRes.rows[0];

    const insertedRows = [];
    for (const item of marksList) {
      const marksObt = parseFloat(item.marksObtained);
      const { grade, gradePoint } = calculateGrade(marksObt, exam.max_marks);

      const queryText = `
        INSERT INTO marks (exam_id, student_id, marks_obtained, grade, grade_point) 
        VALUES ($1, $2, $3, $4, $5) 
        ON CONFLICT (exam_id, student_id) 
        DO UPDATE SET marks_obtained = EXCLUDED.marks_obtained, grade = EXCLUDED.grade, grade_point = EXCLUDED.grade_point 
        RETURNING *
      `;
      const mRow = await pool.query(queryText, [exam.id, item.studentId, marksObt, grade, gradePoint]);
      insertedRows.push(mRow.rows[0]);
    }

    res.status(201).json({
      message: `Marks recorded for ${insertedRows.length} students`,
      data: insertedRows.map(r => ({
        ...r,
        examId: r.exam_id,
        studentId: r.student_id,
        marksObtained: r.marks_obtained,
        gradePoint: r.grade_point
      }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Student results & GPA calculation (PRD EXM-3, EXM-5)
router.get('/results/:studentId', optionalAuth, async (req, res) => {
  const studentId = req.params.studentId;
  try {
    let queryText = `
      SELECT m.*, e.name AS exam_name, e.type AS exam_type, e.is_published, 
             s.name AS subject_name, s.code AS subject_code, s.credits 
      FROM marks m 
      JOIN exams e ON m.exam_id = e.id 
      JOIN subjects s ON e.subject_id = s.id 
      WHERE m.student_id = $1
    `;

    // Non-admin/teacher roles or unauthenticated can only see published exam results
    if (!req.user || req.user.role === 'student' || req.user.role === 'parent') {
      queryText += ` AND e.is_published = true`;
    }

    const result = await pool.query(queryText, [studentId]);
    const enriched = result.rows.map(m => ({
      id: m.id,
      examId: m.exam_id,
      studentId: m.student_id,
      marksObtained: parseFloat(m.marks_obtained),
      grade: m.grade,
      gradePoint: parseFloat(m.grade_point || 0),
      examName: m.exam_name,
      examType: m.exam_type,
      subjectCode: m.subject_code,
      subjectName: m.subject_name,
      credits: parseInt(m.credits || 3, 10)
    }));

    // Calculate SGPA
    let totalGradePoints = 0;
    let totalCredits = 0;
    for (const item of enriched) {
      totalGradePoints += (item.gradePoint || 0) * item.credits;
      totalCredits += item.credits;
    }
    const sgpa = totalCredits > 0 ? parseFloat((totalGradePoints / totalCredits).toFixed(2)) : 0;

    res.json({
      data: {
        studentId,
        results: enriched,
        totalCredits,
        sgpa
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
