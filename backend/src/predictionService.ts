/**
 * Performance Prediction Service
 * 
 * Note: This module implements the prototype prediction algorithm.
 * The architecture is decoupled so this service can seamlessly delegate
 * to an external Python / FastAPI / Scikit-Learn microservice in the future.
 */

export interface PredictionInput {
  previousSemesterMarks: number; // percentage (0-100)
  internalMarksPercent: number;  // percentage (0-100)
  assignmentMarksPercent: number; // percentage (0-100)
  attendancePercent: number;      // percentage (0-100)
  previousGPA: number;            // 0-10 scale
  studyConsistencyScore?: number; // 0-100 scale (derived or input)
}

export interface PredictionResult {
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
  inputFeatures: PredictionInput;
  insights: string[];
}

/**
 * Predicts final student performance based on continuous indicators
 */
export function predictPerformance(features: PredictionInput): PredictionResult {
  // Feature weights simulating a linear regression model
  const weights = {
    previousMarksWeight: 0.25,
    internalMarksWeight: 0.30,
    assignmentWeight: 0.15,
    attendanceWeight: 0.15,
    gpaWeight: 0.15
  };

  const gpaPercent = (features.previousGPA / 10) * 100;

  // Weighted score calculation
  const weightedScore =
    features.previousSemesterMarks * weights.previousMarksWeight +
    features.internalMarksPercent * weights.internalMarksWeight +
    features.assignmentMarksPercent * weights.assignmentWeight +
    features.attendancePercent * weights.attendanceWeight +
    gpaPercent * weights.gpaWeight;

  // Apply minor consistency moderation
  const consistency = features.studyConsistencyScore ?? 85;
  const consistencyModifier = ((consistency - 75) / 100) * 2; // subtle +/- 2%
  
  const rawScore = Math.min(100, Math.max(20, Math.round((weightedScore + consistencyModifier) * 10) / 10));

  // Determine category
  let category: PredictionResult['performanceCategory'] = 'Good';
  if (rawScore >= 85) category = 'Excellent';
  else if (rawScore >= 75) category = 'Good';
  else if (rawScore >= 60) category = 'Average';
  else if (rawScore >= 45) category = 'Needs Improvement';
  else category = 'Critical';

  // Confidence calculation based on variance across input metrics
  const inputs = [
    features.previousSemesterMarks,
    features.internalMarksPercent,
    features.assignmentMarksPercent,
    features.attendancePercent,
    gpaPercent
  ];
  const mean = inputs.reduce((a, b) => a + b, 0) / inputs.length;
  const variance = inputs.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / inputs.length;
  const stdDev = Math.sqrt(variance);
  
  // Higher alignment across metrics -> higher confidence (bounded between 78% and 95%)
  const confidence = Math.min(95, Math.max(78, Math.round(94 - stdDev * 0.6)));

  const insights: string[] = [];
  if (features.attendancePercent < 75) {
    insights.push('Attendance is pulling down predicted final marks.');
  }
  if (features.internalMarksPercent > features.previousSemesterMarks) {
    insights.push('Positive upward trend observed from internal assessments.');
  }
  if (features.assignmentMarksPercent < 70) {
    insights.push('Improving assignment scores could boost prediction by up to 5%.');
  }
  if (insights.length === 0) {
    insights.push('Consistent performance indicators across all continuous assessments.');
  }

  return {
    predictedFinalScore: rawScore,
    performanceCategory: category,
    confidence,
    modelType: 'Linear Weighted Heuristic (ML-Ready Interface)',
    isPrototype: true,
    featureWeights: weights,
    inputFeatures: features,
    insights
  };
}
