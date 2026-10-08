import React, { useEffect, useState, useMemo } from 'react';
import { User, StudentProfile, StudentSummary, SubjectMark, AttendanceAnalytics, PerformanceTrend, PredictionData, WeakSubject, Recommendation, RiskAnalysis } from '../types';
import { api } from '../services/api';
import { StatCard } from '../components/StatCard';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import {
  Award,
  BookOpen,
  CalendarCheck,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  BrainCircuit,
  Lightbulb,
  AlertCircle,
  FileText,
  Printer,
  Download,
  Filter,
  ArrowUpDown,
  User as UserIcon,
  HelpCircle,
  Sparkles
} from 'lucide-react';

interface StudentDashboardProps {
  user: User;
  currentTab: string;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ user, currentTab }) => {
  const studentId = user.student_id || 'STD-2024-001';

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [summary, setSummary] = useState<StudentSummary | null>(null);
  const [marks, setMarks] = useState<SubjectMark[]>([]);
  const [attendance, setAttendance] = useState<AttendanceAnalytics | null>(null);
  const [trend, setTrend] = useState<PerformanceTrend[]>([]);
  const [prediction, setPrediction] = useState<PredictionData | null>(null);
  const [weakSubjects, setWeakSubjects] = useState<WeakSubject[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [riskAnalysis, setRiskAnalysis] = useState<RiskAnalysis | null>(null);

  // Filter & sort state for subject table
  const [sortField, setSortField] = useState<'subjectName' | 'percentage' | 'grade'>('subjectName');
  const [sortAsc, setSortAsc] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState('All');

  // Chart Metric Toggle for Performance Overview
  const [chartMetric, setChartMetric] = useState<'overallMarks' | 'internalMarks' | 'assignmentMarks' | 'examMarks'>('overallMarks');

  useEffect(() => {
    loadAllStudentData();
  }, [studentId]);

  const loadAllStudentData = async () => {
    setLoading(true);
    try {
      const [
        studentData,
        marksData,
        attData,
        trendData,
        predData,
        recData,
        riskData
      ] = await Promise.all([
        api.getStudent(studentId),
        api.getStudentMarks(studentId),
        api.getStudentAttendance(studentId),
        api.getStudentPerformanceTrend(studentId),
        api.getStudentPrediction(studentId),
        api.getStudentRecommendations(studentId),
        api.getStudentRisk(studentId)
      ]);

      setProfile(studentData.student);
      setSummary(studentData.summary);
      setMarks(marksData);
      setAttendance(attData);
      setTrend(trendData);
      setPrediction(predData);
      setWeakSubjects(recData.weakSubjects || []);
      setRecommendations(recData.recommendations || []);
      setRiskAnalysis(riskData);
    } catch (err) {
      console.error('Error fetching student data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filtered & sorted subject marks
  const filteredMarks = useMemo(() => {
    return marks
      .filter((m) => {
        const matchesSearch =
          m.subjectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.subjectCode.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesGrade = gradeFilter === 'All' || m.grade === gradeFilter;
        return matchesSearch && matchesGrade;
      })
      .sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];
        if (typeof valA === 'string') {
          return sortAsc
            ? (valA as string).localeCompare(valB as string)
            : (valB as string).localeCompare(valA as string);
        }
        return sortAsc ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
      });
  }, [marks, searchQuery, gradeFilter, sortField, sortAsc]);

  const toggleSort = (field: 'subjectName' | 'percentage' | 'grade') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const handlePrintReport = () => {
    window.print();
  };

  const handleDownloadCsv = () => {
    if (!marks.length) return;
    const headers = ['Subject Code', 'Subject Name', 'Internal', 'Assignment', 'Exam', 'Total', 'Percentage', 'Grade', 'Attendance'];
    const rows = marks.map((m) => [
      m.subjectCode,
      `"${m.subjectName}"`,
      m.internal,
      m.assignment,
      m.exam,
      m.total,
      `${m.percentage}%`,
      m.grade,
      `${m.attendancePercentage}%`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${profile?.name || 'student'}_performance_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-slate-500">Loading student academic analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Student Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center space-x-4">
          <img
            src={profile?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=student`}
            alt={profile?.name}
            className="w-16 h-16 rounded-2xl bg-blue-50 border-2 border-blue-100 p-1 shadow-xs"
          />
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-2xl font-bold text-slate-900">{profile?.name}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                {profile?.student_id}
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-0.5">
              {profile?.department} • Year {profile?.year}, Semester {profile?.semester}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleDownloadCsv}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center space-x-1.5 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Download CSV</span>
          </button>
          <button
            onClick={handlePrintReport}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center space-x-1.5 transition-colors shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* 5. Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Overall Performance"
          value={`${summary?.overallPerformance || 82}%`}
          subtitle={`CGPA: ${summary?.cgpa || 8.2} / 10`}
          icon={Award}
          iconBgColor="bg-blue-50"
          iconColor="text-blue-600"
          trend={{ value: '3.4% from Sem 3', isPositive: true }}
        />
        <StatCard
          title="Average Marks"
          value={`${summary?.averageMarks || 78.6}`}
          subtitle="Out of 95 maximum"
          icon={BookOpen}
          iconBgColor="bg-indigo-50"
          iconColor="text-indigo-600"
        />
        <StatCard
          title="Attendance Percentage"
          value={`${summary?.attendancePercentage || 91}%`}
          subtitle={summary && summary.attendancePercentage >= 75 ? 'Meets 75% guideline' : 'Below recommended'}
          icon={CalendarCheck}
          iconBgColor="bg-emerald-50"
          iconColor="text-emerald-600"
        />
        <StatCard
          title="Subjects Passed"
          value={summary?.subjectsPassed || '5/5'}
          subtitle={`${summary?.totalSubjects || 5} subjects registered`}
          icon={CheckCircle2}
          iconBgColor="bg-teal-50"
          iconColor="text-teal-600"
        />
        <StatCard
          title="Academic Risk Level"
          value={summary?.academicRiskLevel || 'Low Risk'}
          subtitle={summary?.riskDescription || 'Performance is stable.'}
          icon={AlertTriangle}
          iconBgColor={
            summary?.academicRiskLevel === 'High Risk'
              ? 'bg-rose-50'
              : summary?.academicRiskLevel === 'Medium Risk'
              ? 'bg-amber-50'
              : 'bg-emerald-50'
          }
          iconColor={
            summary?.academicRiskLevel === 'High Risk'
              ? 'text-rose-600'
              : summary?.academicRiskLevel === 'Medium Risk'
              ? 'text-amber-600'
              : 'text-emerald-600'
          }
          badge={{
            text: `Score: ${summary?.riskScore || 0}/100`,
            color:
              summary?.academicRiskLevel === 'High Risk'
                ? 'rose'
                : summary?.academicRiskLevel === 'Medium Risk'
                ? 'amber'
                : 'emerald'
          }}
        />
      </div>

      {/* Polite Low Attendance Banner if < 75% */}
      {attendance?.isOverallLow && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start space-x-3 text-amber-900 shadow-xs">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold">Attendance is below the recommended minimum.</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Your overall attendance is currently {attendance.overallAttendance}%. Regular attendance ensures eligibility for final term examinations and continuous internal assessment credit.
            </p>
          </div>
        </div>
      )}

      {/* 6. Performance Overview Chart */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center">
              <TrendingUp className="w-4 h-4 mr-2 text-blue-600" />
              Performance Overview: Marks vs Semester
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Historical performance trajectory across semesters
            </p>
          </div>

          {/* Metric Selector Buttons */}
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg">
            {(
              [
                { id: 'overallMarks', label: 'Overall Marks' },
                { id: 'internalMarks', label: 'Internal Marks' },
                { id: 'assignmentMarks', label: 'Assignment Marks' },
                { id: 'examMarks', label: 'Exam Marks' }
              ] as const
            ).map((m) => (
              <button
                key={m.id}
                onClick={() => setChartMetric(m.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  chartMetric === m.id
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <div className="h-72 mt-6">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="semester" stroke="#94a3b8" fontSize={12} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} domain={[40, 100]} tickFormatter={(v) => `${v}%`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: 'none',
                  borderRadius: '0.75rem',
                  color: '#fff',
                  fontSize: '12px'
                }}
                formatter={(val: any) => [`${val}%`, 'Score']}
              />
              <Legend verticalAlign="top" height={36} />
              <Line
                type="monotone"
                dataKey={chartMetric}
                name={
                  chartMetric === 'overallMarks'
                    ? 'Overall Marks %'
                    : chartMetric === 'internalMarks'
                    ? 'Internal Assessment %'
                    : chartMetric === 'assignmentMarks'
                    ? 'Assignments %'
                    : 'End Semester Exam %'
                }
                stroke="#2563eb"
                strokeWidth={3}
                dot={{ r: 5, fill: '#2563eb', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 7. Subject-Wise Performance Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center">
              <BookOpen className="w-4 h-4 mr-2 text-indigo-600" />
              Subject-Wise Academic Performance
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Continuous assessment and end-term examination breakdown
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search subject..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 w-44"
              />
              <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
            </div>

            {/* Grade Filter */}
            <select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
              className="py-1.5 px-3 text-xs rounded-lg border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="All">All Grades</option>
              <option value="A">Grade A</option>
              <option value="B+">Grade B+</option>
              <option value="B">Grade B</option>
              <option value="C">Grade C</option>
              <option value="F">Grade F</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th
                  onClick={() => toggleSort('subjectName')}
                  className="py-3.5 px-4 cursor-pointer hover:text-blue-600"
                >
                  <div className="flex items-center space-x-1">
                    <span>Subject</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3.5 px-4">Internal</th>
                <th className="py-3.5 px-4">Assignment</th>
                <th className="py-3.5 px-4">Exam</th>
                <th
                  onClick={() => toggleSort('percentage')}
                  className="py-3.5 px-4 cursor-pointer hover:text-blue-600"
                >
                  <div className="flex items-center space-x-1">
                    <span>Total</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('grade')}
                  className="py-3.5 px-4 cursor-pointer hover:text-blue-600"
                >
                  <div className="flex items-center space-x-1">
                    <span>Grade</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3.5 px-4">Attendance</th>
                <th className="py-3.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMarks.map((row) => (
                <tr key={row.markId} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-medium text-slate-900">
                    <div>{row.subjectName}</div>
                    <span className="text-[10px] text-slate-400 font-mono">{row.subjectCode}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 font-mono">{row.internal}</td>
                  <td className="py-3 px-4 text-slate-600 font-mono">{row.assignment}</td>
                  <td className="py-3 px-4 text-slate-600 font-mono">{row.exam}</td>
                  <td className="py-3 px-4 font-semibold text-slate-900">
                    <div>{row.totalMarks}</div>
                    <span className="text-[10px] text-slate-400">{row.percentage}%</span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                        row.grade === 'A'
                          ? 'bg-emerald-100 text-emerald-800'
                          : row.grade === 'B+'
                          ? 'bg-blue-100 text-blue-800'
                          : row.grade === 'B'
                          ? 'bg-cyan-100 text-cyan-800'
                          : row.grade === 'C'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {row.grade}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`font-semibold ${
                          row.attendancePercentage < 75 ? 'text-amber-600' : 'text-slate-700'
                        }`}
                      >
                        {row.attendancePercentage}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {row.percentage >= 60 ? (
                      <span className="text-emerald-600 font-medium flex items-center">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Passed
                      </span>
                    ) : (
                      <span className="text-rose-600 font-medium flex items-center">
                        <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Needs Support
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grid: 8. Attendance Analytics & 9. Performance Prediction */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Analytics */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center">
                  <CalendarCheck className="w-4 h-4 mr-2 text-emerald-600" />
                  Attendance Analytics
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Subject-wise compliance and trend</p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Overall: {attendance?.overallAttendance}%
              </span>
            </div>

            <div className="space-y-4 mt-5">
              {attendance?.subjectWise.map((sub) => (
                <div key={sub.subjectCode} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-800">
                      {sub.subjectName} ({sub.subjectCode})
                    </span>
                    <span
                      className={`font-bold ${
                        sub.isLowAttendance ? 'text-amber-600' : 'text-slate-700'
                      }`}
                    >
                      {sub.attendancePercentage}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        sub.isLowAttendance ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${sub.attendancePercentage}%` }}
                    ></div>
                  </div>
                  {sub.isLowAttendance && (
                    <p className="text-[11px] text-amber-600 italic">
                      Attendance is below the recommended minimum.
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 9. Performance Prediction (Prototype ML Feature) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center">
                  <BrainCircuit className="w-4 h-4 mr-2 text-purple-600" />
                  Academic Performance Prediction
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Predictive AI / Heuristic Analytics</p>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                Prototype Prediction
              </span>
            </div>

            {/* Score Highlight Card */}
            <div className="mt-5 p-4 rounded-xl bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-purple-700 uppercase">Predicted Final Score</p>
                <div className="text-3xl font-extrabold text-slate-900 mt-0.5">
                  {prediction?.predictedFinalScore}%
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Category:{' '}
                  <span className="font-bold text-purple-900">{prediction?.performanceCategory}</span>
                </p>
              </div>
              <div className="text-right">
                <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-white text-xs font-bold text-purple-800 shadow-xs border border-purple-200">
                  <Sparkles className="w-3 h-3 mr-1 text-purple-600" />
                  Confidence: {prediction?.confidence}%
                </div>
                <p className="text-[10px] text-slate-400 mt-2 font-mono">
                  {prediction?.modelType}
                </p>
              </div>
            </div>

            {/* Input Feature Breakdown */}
            <div className="mt-4 pt-3 border-t border-slate-100">
              <p className="text-xs font-bold text-slate-700 mb-2">Evaluated Input Features</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 block text-[11px]">Prev. Semester Marks</span>
                  <span className="font-bold text-slate-800">{prediction?.inputFeatures.previousSemesterMarks}%</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 block text-[11px]">Internal Marks Average</span>
                  <span className="font-bold text-slate-800">{prediction?.inputFeatures.internalMarksPercent}%</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 block text-[11px]">Assignment Average</span>
                  <span className="font-bold text-slate-800">{prediction?.inputFeatures.assignmentMarksPercent}%</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 block text-[11px]">Attendance Record</span>
                  <span className="font-bold text-slate-800">{prediction?.inputFeatures.attendancePercent}%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 italic">
            * Note: Modular backend service designed to connect with Python Scikit-Learn / XGBoost models.
          </div>
        </div>
      </div>

      {/* Grid: 10. Weak Subject Detection & 11. Academic Risk Detection */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 10. Weak Subject Detection */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center">
                <AlertTriangle className="w-4 h-4 mr-2 text-amber-500" />
                Weak Subject Detection
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Subjects performing below benchmark thresholds
              </p>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
              {weakSubjects.length} flagged
            </span>
          </div>

          {weakSubjects.length === 0 ? (
            <div className="py-8 text-center text-slate-500">
              <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
              <p className="text-sm font-semibold">No weak subjects detected!</p>
              <p className="text-xs text-slate-400 mt-1">All subjects maintain scores above 75%.</p>
            </div>
          ) : (
            <div className="space-y-4 mt-5">
              {weakSubjects.map((ws) => (
                <div
                  key={ws.subjectCode}
                  className="p-4 rounded-xl border border-amber-200/80 bg-amber-50/40 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{ws.subjectName}</h4>
                      <p className="text-xs text-slate-500">
                        Current Score: <span className="font-bold text-slate-800">{ws.currentScore}%</span>
                      </p>
                    </div>
                    <span
                      className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                        ws.status === 'Needs Improvement'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {ws.status}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-amber-100 text-xs text-slate-600 space-y-1">
                    <p className="font-semibold text-slate-700">Actionable Recommendations:</p>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-600 pl-1">
                      {ws.recommendations.map((rec, i) => (
                        <li key={i}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 11. Academic Risk Detection */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center">
                <HelpCircle className="w-4 h-4 mr-2 text-rose-500" />
                Academic Risk Indicator
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Transparent multi-factor scoring algorithm
              </p>
            </div>
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full border ${
                riskAnalysis?.riskLevel === 'High Risk'
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : riskAnalysis?.riskLevel === 'Medium Risk'
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}
            >
              {riskAnalysis?.riskLevel} ({riskAnalysis?.riskScore}/100)
            </span>
          </div>

          <div className="mt-5 space-y-3">
            <p className="text-xs text-slate-600">
              Risk score calculation is determined by four transparent factors:
            </p>

            <div className="space-y-2">
              {riskAnalysis?.factors.map((f, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-xl border flex items-center justify-between ${
                    f.conditionMet
                      ? 'bg-rose-50/50 border-rose-200 text-rose-900'
                      : 'bg-slate-50 border-slate-100 text-slate-600'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-slate-800">{f.factor}</span>
                      {f.conditionMet ? (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-200 text-rose-800">
                          +{f.pointsAdded} pts
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-emerald-600">Compliant (0 pts)</span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500">{f.details}</p>
                  </div>

                  <div className="shrink-0 ml-3">
                    {f.conditionMet ? (
                      <AlertTriangle className="w-4 h-4 text-rose-500" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500 flex justify-between">
              <span>0–25: Low Risk</span>
              <span>26–50: Medium Risk</span>
              <span>51–100: High Risk</span>
            </div>
          </div>
        </div>
      </div>

      {/* 19. Personalized Recommendations Engine */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center">
              <Lightbulb className="w-4 h-4 mr-2 text-amber-500" />
              Personalized Recommendations Engine
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Rule-based guidance tailored to your continuous assessment data
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
          {recommendations.map((rec) => (
            <div
              key={rec.id}
              className="p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-xs transition-all space-y-2 bg-slate-50/50"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                  {rec.category}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    rec.priority === 'High'
                      ? 'bg-rose-100 text-rose-800'
                      : rec.priority === 'Medium'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {rec.priority} Priority
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-900">{rec.message}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{rec.suggestedAction}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
