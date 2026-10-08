export type UserRole = 'Student' | 'Faculty' | 'Admin';

export interface User {
  id: number;
  email: string;
  role: UserRole;
  student_id?: string;
  faculty_id?: string;
  profile?: any;
}

export interface StudentSummary {
  overallPerformance: number;
  averageMarks: number;
  attendancePercentage: number;
  subjectsPassed: string;
  passedCount: number;
  totalSubjects: number;
  cgpa: number;
  academicRiskLevel: 'Low Risk' | 'Medium Risk' | 'High Risk';
  riskScore: number;
  riskDescription: string;
  isDeclining: boolean;
}

export interface StudentProfile {
  id: number;
  student_id: string;
  name: string;
  email: string;
  department: string;
  year: number;
  semester: number;
  avatar?: string;
}

export interface SubjectMark {
  markId: number;
  subjectId: number;
  subjectCode: string;
  subjectName: string;
  internal: string;
  internalMarks: number;
  maxInternal: number;
  assignment: string;
  assignmentMarks: number;
  maxAssignment: number;
  exam: string;
  examMarks: number;
  maxExam: number;
  totalMarks: number;
  maxMarks: number;
  total: string;
  percentage: number;
  grade: string;
  attendancePercentage: number;
}

export interface AttendanceAnalytics {
  overallAttendance: number;
  isOverallLow: boolean;
  warningMessage: string | null;
  subjectWise: {
    subjectCode: string;
    subjectName: string;
    attendancePercentage: number;
    isLowAttendance: boolean;
    status: string;
  }[];
  trend: {
    semester: string;
    attendance: number;
  }[];
}

export interface PerformanceTrend {
  semester: string;
  internalMarks: number;
  assignmentMarks: number;
  examMarks: number;
  overallMarks: number;
}

export interface PredictionData {
  predictedFinalScore: number;
  performanceCategory: 'Excellent' | 'Good' | 'Average' | 'Needs Improvement' | 'Critical';
  confidence: number;
  modelType: string;
  isPrototype: boolean;
  featureWeights: {
    previousMarksWeight: number;
    internalMarksWeight: number;
    assignmentWeight: number;
    attendanceWeight: number;
    gpaWeight: number;
  };
  inputFeatures: {
    previousSemesterMarks: number;
    internalMarksPercent: number;
    assignmentMarksPercent: number;
    attendancePercent: number;
    previousGPA: number;
    studyConsistencyScore: number;
  };
  insights: string[];
}

export interface WeakSubject {
  subjectCode: string;
  subjectName: string;
  currentScore: number;
  attendancePercentage: number;
  status: 'Needs Improvement' | 'Moderate' | 'Satisfactory';
  recommendations: string[];
}

export interface Recommendation {
  id: string;
  category: string;
  priority: 'High' | 'Medium' | 'Low';
  message: string;
  suggestedAction: string;
}

export interface RiskAnalysis {
  riskScore: number;
  riskLevel: 'Low Risk' | 'Medium Risk' | 'High Risk';
  description: string;
  badgeColor: string;
  factors: {
    factor: string;
    pointsAdded: number;
    conditionMet: boolean;
    details: string;
  }[];
}
