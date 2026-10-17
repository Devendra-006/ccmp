export const studentProfile = {
  id: "std-98214",
  enrolmentNo: "CS2023-0482",
  rollNo: "23CS42",
  name: "Alex Morgan Rivera",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  email: "alex.rivera@campus.edu",
  phone: "+91 98765 43210",
  program: "B.Tech Computer Science & Engineering",
  department: "School of Computing & Data Systems",
  batch: "2023 - 2027",
  semester: "Semester 5 (Fall 2026)",
  section: "CSE-A",
  mentor: "Dr. Elena Vance (Associate Professor)",
  advisorEmail: "elena.vance@campus.edu",
  bloodGroup: "O+",
  dob: "March 14, 2005",
  address: "Block B, Room 304, Greenfield Campus",
  status: "Active / Good Standing",
  cgpa: 8.84,
  sgpa: 9.12,
  creditsCompleted: 98,
  totalCredits: 160,
  overallAttendance: 84.6,
  minAttendanceThreshold: 75.0,
};

export const quickStats = [
  {
    id: "att",
    label: "Overall Attendance",
    value: "84.6%",
    subtext: "+1.4% from last month",
    status: "good",
    accent: "emerald",
    icon: "CalendarCheck",
    detail: "Safe above 75% limit"
  },
  {
    id: "cgpa",
    label: "Cumulative GPA (CGPA)",
    value: "8.84",
    subtext: "Class Rank #4 of 72",
    status: "excellent",
    accent: "indigo",
    icon: "Award",
    detail: "Dean's Honours List"
  },
  {
    id: "credits",
    label: "Credits Registered",
    value: "22 Credits",
    subtext: "6 Theory + 2 Labs",
    status: "info",
    accent: "sky",
    icon: "BookOpen",
    detail: "Semester 5 Load"
  },
  {
    id: "dues",
    label: "Pending Fee Dues",
    value: "₹ 12,500",
    subtext: "Due by Oct 30, 2026",
    status: "warning",
    accent: "rose",
    icon: "Receipt",
    detail: "Term-II Exam & Lab fee"
  }
];

export const todaySchedule = [
  {
    period: "01",
    time: "09:00 AM - 10:00 AM",
    code: "CS501",
    name: "Design & Analysis of Algorithms",
    teacher: "Prof. Rajesh Kumar",
    room: "Room 402 (CS Wing)",
    type: "Lecture",
    status: "completed",
    attended: true
  },
  {
    period: "02",
    time: "10:15 AM - 11:15 AM",
    code: "CS502",
    name: "Database Engineering & Cloud SQL",
    teacher: "Dr. Elena Vance",
    room: "Lab 3B (Cloud Lab)",
    type: "Lab Practice",
    status: "ongoing",
    attended: null
  },
  {
    period: "03",
    time: "11:30 AM - 12:30 PM",
    code: "CS503",
    name: "Computer Networks & Security",
    teacher: "Prof. Priya Nair",
    room: "Lecture Hall 2",
    type: "Lecture",
    status: "upcoming",
    attended: null
  },
  {
    period: "04",
    time: "01:30 PM - 02:30 PM",
    code: "CS504",
    name: "Machine Learning Foundations",
    teacher: "Dr. Marcus Chen",
    room: "Room 408 (Seminar Hall)",
    type: "Lecture",
    status: "upcoming",
    attended: null
  },
  {
    period: "05",
    time: "02:45 PM - 04:45 PM",
    code: "CS505P",
    name: "Algorithms & Problem Solving Lab",
    teacher: "Prof. Rajesh Kumar",
    room: "Lab 4A",
    type: "Practical Session",
    status: "upcoming",
    attended: null
  }
];

export const attendanceBreakdown = [
  {
    id: "sub-1",
    code: "CS501",
    name: "Design & Analysis of Algorithms",
    teacher: "Prof. Rajesh Kumar",
    credits: 4,
    attended: 36,
    total: 40,
    percentage: 90.0,
    status: "safe",
    color: "#10b981",
    recentLog: ["Present", "Present", "Present", "Absent", "Present"]
  },
  {
    id: "sub-2",
    code: "CS502",
    name: "Database Engineering & Cloud SQL",
    teacher: "Dr. Elena Vance",
    credits: 4,
    attended: 32,
    total: 38,
    percentage: 84.2,
    status: "safe",
    color: "#06b6d4",
    recentLog: ["Present", "Present", "Absent", "Present", "Present"]
  },
  {
    id: "sub-3",
    code: "CS503",
    name: "Computer Networks & Security",
    teacher: "Prof. Priya Nair",
    credits: 3,
    attended: 28,
    total: 35,
    percentage: 80.0,
    status: "safe",
    color: "#6366f1",
    recentLog: ["Present", "Absent", "Present", "Present", "Present"]
  },
  {
    id: "sub-4",
    code: "CS504",
    name: "Machine Learning Foundations",
    teacher: "Dr. Marcus Chen",
    credits: 4,
    attended: 27,
    total: 37,
    percentage: 72.9,
    status: "warning",
    color: "#f59e0b",
    recentLog: ["Absent", "Absent", "Present", "Present", "Absent"]
  },
  {
    id: "sub-5",
    code: "CS505P",
    name: "Algorithms Lab",
    teacher: "Prof. Rajesh Kumar",
    credits: 2,
    attended: 14,
    total: 15,
    percentage: 93.3,
    status: "safe",
    color: "#8b5cf6",
    recentLog: ["Present", "Present", "Present", "Present", "Present"]
  },
  {
    id: "sub-6",
    code: "CS506P",
    name: "Cloud Database Lab",
    teacher: "Dr. Elena Vance",
    credits: 2,
    attended: 13,
    total: 15,
    percentage: 86.6,
    status: "safe",
    color: "#ec4899",
    recentLog: ["Present", "Present", "Absent", "Present", "Present"]
  },
  {
    id: "sub-7",
    code: "HS501",
    name: "Engineering Economics & Management",
    teacher: "Dr. Sarah Jenkins",
    credits: 3,
    attended: 23,
    total: 30,
    percentage: 76.6,
    status: "safe",
    color: "#14b8a6",
    recentLog: ["Present", "Present", "Present", "Absent", "Present"]
  }
];

export const examResultsData = [
  {
    code: "CS501",
    name: "Design & Analysis of Algorithms",
    credits: 4,
    internals: 27,
    maxInternals: 30,
    midTerm: 18,
    maxMidTerm: 20,
    endTerm: 45,
    maxEndTerm: 50,
    totalMarks: 90,
    grade: "A+",
    gradePoint: 10,
    status: "Published"
  },
  {
    code: "CS502",
    name: "Database Engineering & Cloud SQL",
    credits: 4,
    internals: 26,
    maxInternals: 30,
    midTerm: 17,
    maxMidTerm: 20,
    endTerm: 43,
    maxEndTerm: 50,
    totalMarks: 86,
    grade: "A",
    gradePoint: 9,
    status: "Published"
  },
  {
    code: "CS503",
    name: "Computer Networks & Security",
    credits: 3,
    internals: 25,
    maxInternals: 30,
    midTerm: 16,
    maxMidTerm: 20,
    endTerm: 41,
    maxEndTerm: 50,
    totalMarks: 82,
    grade: "A",
    gradePoint: 9,
    status: "Published"
  },
  {
    code: "CS504",
    name: "Machine Learning Foundations",
    credits: 4,
    internals: 23,
    maxInternals: 30,
    midTerm: 15,
    maxMidTerm: 20,
    endTerm: 38,
    maxEndTerm: 50,
    totalMarks: 76,
    grade: "B+",
    gradePoint: 8,
    status: "Published"
  },
  {
    code: "CS505P",
    name: "Algorithms Lab",
    credits: 2,
    internals: 28,
    maxInternals: 30,
    midTerm: 19,
    maxMidTerm: 20,
    endTerm: 48,
    maxEndTerm: 50,
    totalMarks: 95,
    grade: "O",
    gradePoint: 10,
    status: "Published"
  },
  {
    code: "CS506P",
    name: "Cloud Database Lab",
    credits: 2,
    internals: 26,
    maxInternals: 30,
    midTerm: 18,
    maxMidTerm: 20,
    endTerm: 46,
    maxEndTerm: 50,
    totalMarks: 90,
    grade: "A+",
    gradePoint: 10,
    status: "Published"
  },
  {
    code: "HS501",
    name: "Engineering Economics & Management",
    credits: 3,
    internals: 24,
    maxInternals: 30,
    midTerm: 16,
    maxMidTerm: 20,
    endTerm: 40,
    maxEndTerm: 50,
    totalMarks: 80,
    grade: "A",
    gradePoint: 9,
    status: "Published"
  }
];

export const feeDuesList = [
  {
    id: "FEE-2026-001",
    title: "Semester 5 Tuition & Campus Facility Fee",
    category: "Tuition",
    totalAmount: 65000,
    paidAmount: 65000,
    dueAmount: 0,
    dueDate: "August 10, 2026",
    status: "PAID",
    receiptNo: "RCPT-2026-88192",
    paymentDate: "August 04, 2026",
    paymentMode: "Net Banking (SBI)"
  },
  {
    id: "FEE-2026-002",
    title: "Specialized Cloud Computing Lab & Resource Fee",
    category: "Lab & Infrastructure",
    totalAmount: 8500,
    paidAmount: 0,
    dueAmount: 8500,
    dueDate: "October 30, 2026",
    status: "PENDING",
    receiptNo: null,
    paymentDate: null,
    paymentMode: null
  },
  {
    id: "FEE-2026-003",
    title: "Mid-Term Examination & Assessment Fee",
    category: "Examination",
    totalAmount: 4000,
    paidAmount: 0,
    dueAmount: 4000,
    dueDate: "October 30, 2026",
    status: "PENDING",
    receiptNo: null,
    paymentDate: null,
    paymentMode: null
  },
  {
    id: "FEE-2026-004",
    title: "Digital Library Access & Journal Subscriptions",
    category: "Library",
    totalAmount: 3500,
    paidAmount: 3500,
    dueAmount: 0,
    dueDate: "July 25, 2026",
    status: "PAID",
    receiptNo: "RCPT-2026-44012",
    paymentDate: "July 22, 2026",
    paymentMode: "UPI (Paytm/GPay)"
  }
];

export const assignmentsList = [
  {
    id: "asg-101",
    title: "Dynamic Programming: Knapsack & Longest Common Subsequence",
    subject: "CS501 - Design & Analysis of Algorithms",
    faculty: "Prof. Rajesh Kumar",
    dueDate: "October 22, 2026",
    maxMarks: 25,
    status: "Submitted",
    score: "Pending Review",
    attachment: "DP_Assignment_Spec_v2.pdf",
    submissionDate: "October 13, 2026",
    badgeColor: "emerald"
  },
  {
    id: "asg-102",
    title: "PostgreSQL Database Normalization & Sharding Schema",
    subject: "CS502 - Database Engineering & Cloud SQL",
    faculty: "Dr. Elena Vance",
    dueDate: "October 28, 2026",
    maxMarks: 30,
    status: "In Progress",
    score: null,
    attachment: "Cloud_DB_Milestone1.pdf",
    submissionDate: null,
    badgeColor: "amber"
  },
  {
    id: "asg-103",
    title: "TCP/IP Packet Sniffer & Wireshark Stream Analysis",
    subject: "CS503 - Computer Networks & Security",
    faculty: "Prof. Priya Nair",
    dueDate: "November 05, 2026",
    maxMarks: 20,
    status: "Not Started",
    score: null,
    attachment: "Socket_Programming_Guide.pdf",
    submissionDate: null,
    badgeColor: "slate"
  },
  {
    id: "asg-104",
    title: "Supervised Learning: Gradient Descent & Regularization",
    subject: "CS504 - Machine Learning Foundations",
    faculty: "Dr. Marcus Chen",
    dueDate: "October 08, 2026",
    maxMarks: 25,
    status: "Graded",
    score: "24 / 25",
    attachment: "ML_Lab_Report_1.pdf",
    submissionDate: "October 06, 2026",
    badgeColor: "indigo"
  }
];

export const noticesList = [
  {
    id: "not-201",
    title: "Semester 5 Mid-Term Examination Schedule Announced",
    category: "Exams",
    date: "October 12, 2026",
    urgent: true,
    content: "The Controller of Examinations has published the finalized timetable for Semester 5 Mid-Terms. Theory exams will commence from November 10, 2026. Hall tickets will be issued through the student portal 7 days prior.",
    issuer: "Office of the Registrar",
    read: false,
    color: "#ef4444"
  },
  {
    id: "not-202",
    title: "Attendance Shortage Advisory - Minimum 75% Requirement",
    category: "Academic",
    date: "October 09, 2026",
    urgent: true,
    content: "All students are reminded that a strict 75% attendance threshold per subject is mandatory to be eligible for semester-end examinations. Students below 75% must meet their designated academic mentors immediately.",
    issuer: "Dean of Academic Affairs",
    read: false,
    color: "#f59e0b"
  },
  {
    id: "not-203",
    title: "AWS Cloud Workshop & Hands-on Certification Session",
    category: "Events",
    date: "October 05, 2026",
    urgent: false,
    content: "The Department of Computer Science is hosting a 2-day certified hands-on cloud computing bootcamp covering AWS Serverless, Lambda, RDS PostgreSQL, and S3 architecture on Oct 25-26 in Seminar Hall 1.",
    issuer: "Cloud Computing Club",
    read: true,
    color: "#3b82f6"
  },
  {
    id: "not-204",
    title: "Diwali & Mid-Semester Recess Dates Notification",
    category: "Campus",
    date: "September 28, 2026",
    urgent: false,
    content: "The institution will observe academic recess from October 31 to November 04, 2026. Regular classes will resume on Thursday, November 05, 2026 as per the standard timetable schedule.",
    issuer: "General Administration",
    read: true,
    color: "#10b981"
  }
];

export const weeklyTimetable = {
  Monday: [
    { period: "1", time: "09:00 - 10:00", code: "CS501", name: "Design & Analysis of Algorithms", room: "Room 402", faculty: "Prof. Rajesh Kumar", color: "#6366f1" },
    { period: "2", time: "10:15 - 11:15", code: "CS502", name: "Database Engineering", room: "Lab 3B", faculty: "Dr. Elena Vance", color: "#06b6d4" },
    { period: "3", time: "11:30 - 12:30", code: "CS503", name: "Computer Networks & Security", room: "LH 2", faculty: "Prof. Priya Nair", color: "#8b5cf6" },
    { period: "4", time: "01:30 - 02:30", code: "CS504", name: "Machine Learning Foundations", room: "Hall 408", faculty: "Dr. Marcus Chen", color: "#f59e0b" },
    { period: "5", time: "02:45 - 04:45", code: "CS505P", name: "Algorithms Lab", room: "Lab 4A", faculty: "Prof. Rajesh Kumar", color: "#10b981" }
  ],
  Tuesday: [
    { period: "1", time: "09:00 - 10:00", code: "CS504", name: "Machine Learning Foundations", room: "Hall 408", faculty: "Dr. Marcus Chen", color: "#f59e0b" },
    { period: "2", time: "10:15 - 11:15", code: "CS501", name: "Design & Analysis of Algorithms", room: "Room 402", faculty: "Prof. Rajesh Kumar", color: "#6366f1" },
    { period: "3", time: "11:30 - 12:30", code: "HS501", name: "Engineering Economics", room: "Room 301", faculty: "Dr. Sarah Jenkins", color: "#14b8a6" },
    { period: "4", time: "01:30 - 03:30", code: "CS506P", name: "Cloud Database Lab", room: "Lab 3B", faculty: "Dr. Elena Vance", color: "#ec4899" },
    { period: "5", time: "03:45 - 04:45", code: "CS503", name: "Computer Networks & Security", room: "LH 2", faculty: "Prof. Priya Nair", color: "#8b5cf6" }
  ],
  Wednesday: [
    { period: "1", time: "09:00 - 10:00", code: "CS502", name: "Database Engineering", room: "Room 402", faculty: "Dr. Elena Vance", color: "#06b6d4" },
    { period: "2", time: "10:15 - 11:15", code: "CS503", name: "Computer Networks & Security", room: "LH 2", faculty: "Prof. Priya Nair", color: "#8b5cf6" },
    { period: "3", time: "11:30 - 12:30", code: "CS501", name: "Design & Analysis of Algorithms", room: "Room 402", faculty: "Prof. Rajesh Kumar", color: "#6366f1" },
    { period: "4", time: "01:30 - 02:30", code: "HS501", name: "Engineering Economics", room: "Room 301", faculty: "Dr. Sarah Jenkins", color: "#14b8a6" },
    { period: "5", time: "02:45 - 04:45", code: "TUTORIAL", name: "Peer Problem Solving Session", room: "Hall 408", faculty: "Student Mentors", color: "#64748b" }
  ],
  Thursday: [
    { period: "1", time: "09:00 - 10:00", code: "CS501", name: "Design & Analysis of Algorithms", room: "Room 402", faculty: "Prof. Rajesh Kumar", color: "#6366f1" },
    { period: "2", time: "10:15 - 11:15", code: "CS504", name: "Machine Learning Foundations", room: "Hall 408", faculty: "Dr. Marcus Chen", color: "#f59e0b" },
    { period: "3", time: "11:30 - 12:30", code: "CS502", name: "Database Engineering", room: "Room 402", faculty: "Dr. Elena Vance", color: "#06b6d4" },
    { period: "4", time: "01:30 - 03:30", code: "CS505P", name: "Algorithms Coding Lab", room: "Lab 4A", faculty: "Prof. Rajesh Kumar", color: "#10b981" },
    { period: "5", time: "03:45 - 04:45", code: "LIBRARY", name: "Self Study & Research Hour", room: "Central Lib", faculty: "Librarian", color: "#64748b" }
  ],
  Friday: [
    { period: "1", time: "09:00 - 10:00", code: "CS503", name: "Computer Networks & Security", room: "LH 2", faculty: "Prof. Priya Nair", color: "#8b5cf6" },
    { period: "2", time: "10:15 - 11:15", code: "HS501", name: "Engineering Economics", room: "Room 301", faculty: "Dr. Sarah Jenkins", color: "#14b8a6" },
    { period: "3", time: "11:30 - 12:30", code: "CS504", name: "Machine Learning Foundations", room: "Hall 408", faculty: "Dr. Marcus Chen", color: "#f59e0b" },
    { period: "4", time: "01:30 - 03:30", code: "SEMINAR", name: "Cloud Computing Student Seminar", room: "Audi 1", faculty: "Faculty Coordinator", color: "#0284c7" },
    { period: "5", time: "03:45 - 04:45", code: "SPORTS", name: "Recreation & Physical Activities", room: "Sports Ground", faculty: "Sports Director", color: "#10b981" }
  ]
};
