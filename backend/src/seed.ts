import bcrypt from 'bcryptjs';
import { db, initDatabase } from './db.js';

export function seedDatabase() {
  console.log('Initializing database schema...');
  initDatabase();

  console.log('Clearing existing records...');
  db.exec(`
    DELETE FROM marks;
    DELETE FROM attendance;
    DELETE FROM subjects;
    DELETE FROM students;
    DELETE FROM faculty;
    DELETE FROM users;
  `);

  console.log('Seeding Demo Users...');
  const salt = bcrypt.genSaltSync(10);
  const studentHash = bcrypt.hashSync('student123', salt);
  const facultyHash = bcrypt.hashSync('faculty123', salt);
  const adminHash = bcrypt.hashSync('admin123', salt);

  const insertUser = db.prepare(`
    INSERT INTO users (email, password, role, student_id, faculty_id)
    VALUES (?, ?, ?, ?, ?)
  `);

  insertUser.run('student@example.com', studentHash, 'Student', 'STD-2024-001', null);
  insertUser.run('faculty@example.com', facultyHash, 'Faculty', null, 'FAC-CSE-001');
  insertUser.run('admin@example.com', adminHash, 'Admin', null, null);

  console.log('Seeding Faculty...');
  const insertFaculty = db.prepare(`
    INSERT INTO faculty (faculty_id, name, email, department, designation)
    VALUES (?, ?, ?, ?, ?)
  `);

  insertFaculty.run('FAC-CSE-001', 'Dr. Rajesh Kumar', 'faculty@example.com', 'CSE', 'Professor & HOD');
  insertFaculty.run('FAC-CSE-002', 'Prof. Sunita Rao', 'sunitarao@example.com', 'CSE (AIML)', 'Associate Professor');
  insertFaculty.run('FAC-ECE-001', 'Dr. K. V. Raman', 'kvraman@example.com', 'ECE', 'Assistant Professor');
  insertFaculty.run('FAC-EEE-001', 'Prof. Meenakshi Sundaram', 'meenakshi@example.com', 'EEE', 'Associate Professor');
  insertFaculty.run('FAC-MEC-001', 'Dr. Suresh Nambiar', 'suresh@example.com', 'Mechanical', 'Professor');

  console.log('Seeding Subjects...');
  const insertSubject = db.prepare(`
    INSERT INTO subjects (id, subject_code, subject_name, department, semester, credits, max_internal, max_assignment, max_exam)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const subjectsData = [
    { id: 1, code: 'CS401', name: 'Python', dept: 'CSE', sem: 4, cr: 4, mi: 25, ma: 20, me: 50 },
    { id: 2, code: 'CS402', name: 'Java', dept: 'CSE', sem: 4, cr: 4, mi: 25, ma: 20, me: 50 },
    { id: 3, code: 'CS403', name: 'DBMS', dept: 'CSE', sem: 4, cr: 4, mi: 25, ma: 20, me: 50 },
    { id: 4, code: 'MA401', name: 'Mathematics', dept: 'CSE', sem: 4, cr: 4, mi: 25, ma: 20, me: 50 },
    { id: 5, code: 'AI401', name: 'AI/ML', dept: 'CSE', sem: 4, cr: 4, mi: 25, ma: 20, me: 50 },
    { id: 6, code: 'CS404', name: 'Computer Networks', dept: 'CSE', sem: 4, cr: 3, mi: 25, ma: 20, me: 50 },
    { id: 7, code: 'EC401', name: 'Digital Electronics', dept: 'ECE', sem: 4, cr: 4, mi: 25, ma: 20, me: 50 },
    { id: 8, code: 'EE401', name: 'Control Systems', dept: 'EEE', sem: 4, cr: 4, mi: 25, ma: 20, me: 50 },
    { id: 9, code: 'ME401', name: 'Applied Thermodynamics', dept: 'Mechanical', sem: 4, cr: 4, mi: 25, ma: 20, me: 50 }
  ];

  for (const s of subjectsData) {
    insertSubject.run(s.id, s.code, s.name, s.dept, s.sem, s.cr, s.mi, s.ma, s.me);
  }

  console.log('Seeding Students...');
  const insertStudent = db.prepare(`
    INSERT INTO students (student_id, name, email, department, year, semester, avatar)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const studentsList = [
    { id: 'STD-2024-001', name: 'Aarav Sharma', email: 'student@example.com', dept: 'CSE', year: 2, sem: 4 },
    { id: 'STD-2024-002', name: 'Sneha Reddy', email: 'sneha.reddy@example.com', dept: 'CSE', year: 2, sem: 4 },
    { id: 'STD-2024-003', name: 'Priya Patel', email: 'priya.patel@example.com', dept: 'CSE', year: 2, sem: 4 },
    { id: 'STD-2024-004', name: 'Vikram Malhotra', email: 'vikram.m@example.com', dept: 'CSE', year: 2, sem: 4 }, // High risk
    { id: 'STD-2024-005', name: 'Rohan Mehta', email: 'rohan.mehta@example.com', dept: 'CSE', year: 2, sem: 4 },
    { id: 'STD-2024-006', name: 'Ananya Deshmukh', email: 'ananya.d@example.com', dept: 'CSE (AIML)', year: 2, sem: 4 },
    { id: 'STD-2024-007', name: 'Karan Kapoor', email: 'karan.k@example.com', dept: 'CSE (AIML)', year: 2, sem: 4 },
    { id: 'STD-2024-008', name: 'Aditya Roy', email: 'aditya.roy@example.com', dept: 'CSE (AIML)', year: 2, sem: 4 },
    { id: 'STD-2024-009', name: 'Pooja Nair', email: 'pooja.nair@example.com', dept: 'CSE (AIML)', year: 2, sem: 4 }, // High risk
    { id: 'STD-2024-010', name: 'Rahul Verma', email: 'rahul.verma@example.com', dept: 'ECE', year: 2, sem: 4 },
    { id: 'STD-2024-011', name: 'Neha Gupta', email: 'neha.gupta@example.com', dept: 'ECE', year: 2, sem: 4 },
    { id: 'STD-2024-012', name: 'Siddharth Sen', email: 'siddharth.s@example.com', dept: 'ECE', year: 2, sem: 4 }, // Medium risk
    { id: 'STD-2024-013', name: 'Tanvi Joshi', email: 'tanvi.joshi@example.com', dept: 'EEE', year: 2, sem: 4 },
    { id: 'STD-2024-014', name: 'Harsh Vardhan', email: 'harsh.v@example.com', dept: 'EEE', year: 2, sem: 4 },
    { id: 'STD-2024-015', name: 'Manish Pandey', email: 'manish.p@example.com', dept: 'Mechanical', year: 2, sem: 4 }, // High risk
    { id: 'STD-2024-016', name: 'Divya Iyer', email: 'divya.iyer@example.com', dept: 'Mechanical', year: 2, sem: 4 },
    { id: 'STD-2024-017', name: 'Gaurav Bhatia', email: 'gaurav.b@example.com', dept: 'CSE', year: 2, sem: 4 },
    { id: 'STD-2024-018', name: 'Megha Nair', email: 'megha.n@example.com', dept: 'CSE', year: 2, sem: 4 }
  ];

  for (const st of studentsList) {
    insertStudent.run(st.id, st.name, st.email, st.dept, st.year, st.sem, `https://api.dicebear.com/7.x/avataaars/svg?seed=${st.name.replace(' ', '')}`);
  }

  console.log('Seeding Marks & Attendance...');
  const insertMark = db.prepare(`
    INSERT INTO marks (student_id, subject_id, internal_marks, assignment_marks, exam_marks, semester)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const insertAttendance = db.prepare(`
    INSERT INTO attendance (student_id, subject_id, attendance_percentage, semester)
    VALUES (?, ?, ?, ?)
  `);

  // 1. Aarav Sharma (STD-2024-001) - Exactly as required in Prompt:
  // Python: 24/25, 18/20, 45/50 (Total 87, A, Attendance 94%)
  // Java: 21/25, 17/20, 39/50 (Total 77, B+, Attendance 91%)
  // DBMS: 19/25, 16/20, 35/50 (Total 70, B, Attendance 86%)
  // Mathematics: 15/25, 14/20, 31/50 (Total 60, C, Attendance 78%)
  // AI/ML: 23/25, 19/20, 44/50 (Total 86, A, Attendance 96%)
  const aaravMarks = [
    { subId: 1, internal: 24, asgn: 18, exam: 45, att: 94 },
    { subId: 2, internal: 21, asgn: 17, exam: 39, att: 91 },
    { subId: 3, internal: 19, asgn: 16, exam: 35, att: 86 },
    { subId: 4, internal: 15, asgn: 14, exam: 31, att: 78 },
    { subId: 5, internal: 23, asgn: 19, exam: 44, att: 96 }
  ];
  for (const m of aaravMarks) {
    insertMark.run('STD-2024-001', m.subId, m.internal, m.asgn, m.exam, 4);
    insertAttendance.run('STD-2024-001', m.subId, m.att, 4);
  }

  // Previous semesters for Aarav Sharma to provide trend: Sem 1 (72%), Sem 2 (76%), Sem 3 (81%), Sem 4 (84%)
  // We insert historical marks for Semesters 1, 2, 3
  const aaravHistory = [
    { sem: 1, internal: 18, asgn: 14, exam: 40 }, // ~72%
    { sem: 2, internal: 19, asgn: 15, exam: 42 }, // ~76%
    { sem: 3, internal: 21, asgn: 17, exam: 43 }  // ~81%
  ];
  for (const h of aaravHistory) {
    insertMark.run('STD-2024-001', 1, h.internal, h.asgn, h.exam, h.sem);
    insertAttendance.run('STD-2024-001', 1, 88 + (h.sem * 2), h.sem);
  }

  // 2. Sneha Reddy (Top Performer: ~92% avg, 95% att)
  const snehaMarks = [
    { subId: 1, internal: 25, asgn: 20, exam: 48, att: 98 },
    { subId: 2, internal: 24, asgn: 19, exam: 47, att: 96 },
    { subId: 3, internal: 23, asgn: 19, exam: 46, att: 94 },
    { subId: 4, internal: 24, asgn: 20, exam: 48, att: 95 },
    { subId: 5, internal: 25, asgn: 20, exam: 49, att: 97 }
  ];
  for (const m of snehaMarks) {
    insertMark.run('STD-2024-002', m.subId, m.internal, m.asgn, m.exam, 4);
    insertAttendance.run('STD-2024-002', m.subId, m.att, 4);
  }

  // 3. Vikram Malhotra (High Risk: Low marks < 60%, Low attendance 62%, Low assignments)
  const vikramMarks = [
    { subId: 1, internal: 12, asgn: 11, exam: 28, att: 65 },
    { subId: 2, internal: 13, asgn: 10, exam: 27, att: 62 },
    { subId: 3, internal: 11, asgn: 9,  exam: 25, att: 58 },
    { subId: 4, internal: 10, asgn: 8,  exam: 24, att: 60 },
    { subId: 5, internal: 14, asgn: 12, exam: 30, att: 68 }
  ];
  for (const m of vikramMarks) {
    insertMark.run('STD-2024-004', m.subId, m.internal, m.asgn, m.exam, 4);
    insertAttendance.run('STD-2024-004', m.subId, m.att, 4);
  }

  // Populate realistic data for the other students across the core subjects
  const otherStudents = studentsList.slice(2).filter(s => s.id !== 'STD-2024-004');
  
  for (const st of otherStudents) {
    // Generate varied performance profile
    const isHigh = st.name.includes('Priya') || st.name.includes('Aditya');
    const isAtRisk = st.name.includes('Pooja') || st.name.includes('Manish') || st.name.includes('Siddharth');
    
    for (let subId = 1; subId <= 5; subId++) {
      let internal = 20;
      let asgn = 16;
      let exam = 38;
      let att = 85;

      if (isHigh) {
        internal = 23 + Math.floor(Math.random() * 3);
        asgn = 18 + Math.floor(Math.random() * 3);
        exam = 44 + Math.floor(Math.random() * 6);
        att = 92 + Math.floor(Math.random() * 7);
      } else if (isAtRisk) {
        internal = 11 + Math.floor(Math.random() * 4);
        asgn = 10 + Math.floor(Math.random() * 4);
        exam = 26 + Math.floor(Math.random() * 7);
        att = 62 + Math.floor(Math.random() * 11); // triggers < 75% warning!
      } else {
        internal = 17 + Math.floor(Math.random() * 5);
        asgn = 14 + Math.floor(Math.random() * 5);
        exam = 33 + Math.floor(Math.random() * 8);
        att = 78 + Math.floor(Math.random() * 15);
      }

      insertMark.run(st.id, subId, internal, asgn, exam, 4);
      insertAttendance.run(st.id, subId, att, 4);
    }

    // Historical semesters 1, 2, 3 for semester trends
    for (let sem = 1; sem <= 3; sem++) {
      const baseExam = isHigh ? 42 : isAtRisk ? 28 : 34;
      insertMark.run(st.id, 1, 18, 15, baseExam + sem, sem);
      insertAttendance.run(st.id, 1, 80 + sem * 2, sem);
    }
  }

  console.log('Database seeded successfully with 18 students, 9 subjects, 5 faculty, and complete academic records!');
}

// Allow direct execution
if (process.argv[1]?.includes('seed')) {
  seedDatabase();
}
