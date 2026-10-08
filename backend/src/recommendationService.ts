export interface SubjectPerformance {
  subjectCode: string;
  subjectName: string;
  internalMarks: number;
  maxInternal: number;
  assignmentMarks: number;
  maxAssignment: number;
  examMarks: number;
  maxExam: number;
  totalMarks: number;
  maxTotal: number;
  percentage: number;
  attendancePercentage: number;
  grade: string;
}

export interface WeakSubjectItem {
  subjectCode: string;
  subjectName: string;
  currentScore: number;
  attendancePercentage: number;
  status: 'Needs Improvement' | 'Moderate' | 'Satisfactory';
  recommendations: string[];
}

export interface RecommendationItem {
  id: string;
  category: 'Attendance' | 'Subject Mastery' | 'Assignments' | 'Consistency' | 'Exams';
  priority: 'High' | 'Medium' | 'Low';
  message: string;
  suggestedAction: string;
}

export function generateRecommendations(data: {
  overallAttendance: number;
  overallAverage: number;
  assignmentAverage: number;
  isImproving: boolean;
  subjects: SubjectPerformance[];
}): { recommendations: RecommendationItem[]; weakSubjects: WeakSubjectItem[] } {
  const recommendations: RecommendationItem[] = [];
  const weakSubjects: WeakSubjectItem[] = [];

  // 1. Overall Attendance Check
  if (data.overallAttendance < 75) {
    recommendations.push({
      id: 'rec-att-1',
      category: 'Attendance',
      priority: 'High',
      message: 'Improve attendance and attend upcoming classes regularly.',
      suggestedAction: `Your overall attendance is ${data.overallAttendance.toFixed(1)}%. Aim to reach at least 75% to meet academic eligibility guidelines.`
    });
  } else if (data.overallAttendance >= 90) {
    recommendations.push({
      id: 'rec-att-2',
      category: 'Attendance',
      priority: 'Low',
      message: 'Commendable attendance record. Continue your regular class engagement.',
      suggestedAction: 'Keep up the 90%+ attendance standard.'
    });
  }

  // 2. Marks & Consistency Check
  if (data.isImproving) {
    recommendations.push({
      id: 'rec-trend-1',
      category: 'Consistency',
      priority: 'Low',
      message: 'Your performance is improving. Maintain your current study consistency.',
      suggestedAction: 'Keep tracking your weekly review milestones to preserve this positive trajectory.'
    });
  } else if (data.overallAverage < 60) {
    recommendations.push({
      id: 'rec-marks-1',
      category: 'Subject Mastery',
      priority: 'High',
      message: 'Focus on strengthening core fundamentals and schedule faculty mentoring.',
      suggestedAction: 'Dedicate 1.5 hours daily to core concept revision and solved exercises.'
    });
  }

  // 3. Assignment Check
  if (data.assignmentAverage < 70) {
    recommendations.push({
      id: 'rec-asgn-1',
      category: 'Assignments',
      priority: 'Medium',
      message: 'Complete assignments regularly to improve continuous assessment performance.',
      suggestedAction: 'Submit homework and lab exercises before due dates for maximum internal credit.'
    });
  }

  // 4. Subject-wise analysis and Weak Subject detection
  for (const s of data.subjects) {
    const subRecs: string[] = [];
    let status: WeakSubjectItem['status'] = 'Satisfactory';

    if (s.percentage < 60) {
      status = 'Needs Improvement';
      if (s.subjectName.toLowerCase().includes('math')) {
        subRecs.push('Practice more numerical problems and step-by-step proofs');
      } else if (s.subjectName.toLowerCase().includes('dbms') || s.subjectName.toLowerCase().includes('data')) {
        subRecs.push('Practice SQL queries and normalization theory thoroughly');
      } else {
        subRecs.push('Review previous lessons and core textbook chapters');
      }
      subRecs.push('Attend additional revision sessions and faculty doubt-clearing hours');
      if (s.assignmentMarks / s.maxAssignment < 0.7) {
        subRecs.push('Complete assignments regularly to boost continuous internal score');
      }
    } else if (s.percentage < 75) {
      status = 'Moderate';
      subRecs.push('Review previous lessons and solve past mid-term question sets');
      if (s.attendancePercentage < 75) {
        subRecs.push('Improve class attendance to avoid missing critical topics');
      }
    }

    if (status !== 'Satisfactory') {
      weakSubjects.push({
        subjectCode: s.subjectCode,
        subjectName: s.subjectName,
        currentScore: Math.round(s.percentage),
        attendancePercentage: Math.round(s.attendancePercentage),
        status,
        recommendations: subRecs
      });

      // Add high-priority subject recommendation
      if (status === 'Needs Improvement') {
        recommendations.push({
          id: `rec-sub-${s.subjectCode}`,
          category: 'Subject Mastery',
          priority: 'High',
          message: `Focus on strengthening fundamentals in ${s.subjectName}.`,
          suggestedAction: subRecs.join('. ') + '.'
        });
      }
    }
  }

  // Fallback if student is performing very well across everything
  if (recommendations.length === 0) {
    recommendations.push({
      id: 'rec-general-1',
      category: 'Consistency',
      priority: 'Low',
      message: 'Outstanding overall performance! Consider mentoring peers or taking advanced projects.',
      suggestedAction: 'Explore advanced seminars, competitive coding, or research papers.'
    });
  }

  return { recommendations, weakSubjects };
}
