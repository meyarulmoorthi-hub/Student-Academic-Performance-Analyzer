export interface RiskFactor {
  factor: string;
  pointsAdded: number;
  conditionMet: boolean;
  details: string;
}

export interface RiskAnalysisResult {
  riskScore: number; // 0 - 100
  riskLevel: 'Low Risk' | 'Medium Risk' | 'High Risk';
  description: string;
  badgeColor: string;
  factors: RiskFactor[];
}

export function calculateAcademicRisk(params: {
  averageMarks: number;
  overallAttendance: number;
  isDeclining: boolean;
  assignmentAverage: number;
  previousSemesterMarks?: number;
}): RiskAnalysisResult {
  const { averageMarks, overallAttendance, isDeclining, assignmentAverage } = params;

  const factors: RiskFactor[] = [
    {
      factor: 'Low Marks',
      pointsAdded: averageMarks < 60 ? 30 : 0,
      conditionMet: averageMarks < 60,
      details: averageMarks < 60
        ? `Current average marks are ${averageMarks.toFixed(1)}% (below 60% threshold)`
        : `Average marks are healthy at ${averageMarks.toFixed(1)}%`
    },
    {
      factor: 'Low Attendance',
      pointsAdded: overallAttendance < 75 ? 25 : 0,
      conditionMet: overallAttendance < 75,
      details: overallAttendance < 75
        ? `Attendance is at ${overallAttendance.toFixed(1)}% (below recommended 75% minimum)`
        : `Attendance is compliant at ${overallAttendance.toFixed(1)}%`
    },
    {
      factor: 'Declining Performance',
      pointsAdded: isDeclining ? 25 : 0,
      conditionMet: isDeclining,
      details: isDeclining
        ? 'Latest semester scores are trending downward compared to prior terms'
        : 'Performance trend is stable or upward'
    },
    {
      factor: 'Low Assignment Completion',
      pointsAdded: assignmentAverage < 70 ? 20 : 0,
      conditionMet: assignmentAverage < 70,
      details: assignmentAverage < 70
        ? `Continuous assignment scores average ${assignmentAverage.toFixed(1)}% (below 70%)`
        : `Assignment completion and scores are satisfactory at ${assignmentAverage.toFixed(1)}%`
    }
  ];

  const riskScore = factors.reduce((sum, f) => sum + f.pointsAdded, 0);

  let riskLevel: RiskAnalysisResult['riskLevel'] = 'Low Risk';
  let description = 'Performance is stable.';
  let badgeColor = 'emerald';

  if (riskScore >= 51) {
    riskLevel = 'High Risk';
    description = 'Multiple academic indicators require attention.';
    badgeColor = 'rose';
  } else if (riskScore >= 26) {
    riskLevel = 'Medium Risk';
    description = 'Some areas require improvement.';
    badgeColor = 'amber';
  }

  return {
    riskScore,
    riskLevel,
    description,
    badgeColor,
    factors
  };
}
