import React, { useEffect, useState } from 'react';
import { User } from '../types';
import { api } from '../services/api';
import { StatCard } from '../components/StatCard';
import {
  Users,
  Award,
  CalendarCheck,
  AlertTriangle,
  Search,
  PenTool,
  Save,
  RotateCcw,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Eye,
  BarChart3,
  BookOpen,
  Filter
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface FacultyDashboardProps {
  user: User;
  currentTab: string;
}

export const FacultyDashboard: React.FC<FacultyDashboardProps> = ({ user, currentTab }) => {
  const [loading, setLoading] = useState(true);
  const [classAnalytics, setClassAnalytics] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');

  // Selected student for deep inspection modal
  const [selectedStudentDetail, setSelectedStudentDetail] = useState<any>(null);
  const [studentDetailLoading, setStudentDetailLoading] = useState(false);

  // Faculty Data Entry Form State
  const [entryStudentId, setEntryStudentId] = useState('');
  const [entryStudentName, setEntryStudentName] = useState('');
  const [entrySubjectId, setEntrySubjectId] = useState<number>(1);
  const [entrySemester, setEntrySemester] = useState<number>(4);
  const [entryInternal, setEntryInternal] = useState<string>('20');
  const [entryAssignment, setEntryAssignment] = useState<string>('16');
  const [entryExam, setEntryExam] = useState<string>('40');
  const [entryAttendance, setEntryAttendance] = useState<string>('85');
  const [formFeedback, setFormFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  useEffect(() => {
    loadFacultyData();
  }, []);

  const loadFacultyData = async () => {
    setLoading(true);
    try {
      const [analyticsData, studentsData, subjectsData] = await Promise.all([
        api.getClassAnalytics(),
        api.getStudents(),
        api.getSubjects()
      ]);
      setClassAnalytics(analyticsData);
      setStudents(studentsData);
      setSubjects(subjectsData);
      if (subjectsData.length > 0) {
        setEntrySubjectId(subjectsData[0].id);
      }
    } catch (err) {
      console.error('Error loading faculty dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInspectStudent = async (studentId: string) => {
    setStudentDetailLoading(true);
    try {
      const [stData, marksData, attData, riskData, recData] = await Promise.all([
        api.getStudent(studentId),
        api.getStudentMarks(studentId),
        api.getStudentAttendance(studentId),
        api.getStudentRisk(studentId),
        api.getStudentRecommendations(studentId)
      ]);
      setSelectedStudentDetail({
        ...stData,
        marks: marksData,
        attendance: attData,
        risk: riskData,
        recommendations: recData
      });
    } catch (err) {
      console.error('Error fetching student details:', err);
    } finally {
      setStudentDetailLoading(false);
    }
  };

  const handleResetForm = () => {
    setEntryStudentId('');
    setEntryStudentName('');
    setEntryInternal('');
    setEntryAssignment('');
    setEntryExam('');
    setEntryAttendance('');
    setFormFeedback(null);
  };

  const handleStudentSelectInForm = (stId: string) => {
    setEntryStudentId(stId);
    const found = students.find((s) => s.student_id === stId);
    if (found) {
      setEntryStudentName(found.name);
    }
  };

  const handleSaveMarksAndAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormFeedback(null);

    // Validation according to requirements
    const internal = Number(entryInternal);
    const assignment = Number(entryAssignment);
    const exam = Number(entryExam);
    const att = Number(entryAttendance);

    if (isNaN(internal) || internal < 0 || internal > 25) {
      setFormFeedback({ type: 'error', message: 'Internal marks must be between 0 and 25.' });
      return;
    }
    if (isNaN(assignment) || assignment < 0 || assignment > 20) {
      setFormFeedback({ type: 'error', message: 'Assignment marks must be between 0 and 20.' });
      return;
    }
    if (isNaN(exam) || exam < 0 || exam > 50) {
      setFormFeedback({ type: 'error', message: 'Exam marks must be between 0 and 50.' });
      return;
    }
    if (isNaN(att) || att < 0 || att > 100) {
      setFormFeedback({ type: 'error', message: 'Attendance percentage must be between 0 and 100.' });
      return;
    }

    setFormSubmitting(true);
    try {
      await api.saveMarks({
        studentId: entryStudentId,
        subjectId: entrySubjectId,
        internalMarks: internal,
        assignmentMarks: assignment,
        examMarks: exam,
        semester: entrySemester
      });

      await api.saveAttendance({
        studentId: entryStudentId,
        subjectId: entrySubjectId,
        attendancePercentage: att,
        semester: entrySemester
      });

      setFormFeedback({
        type: 'success',
        message: `Marks & Attendance successfully updated for student ${entryStudentId}!`
      });
      // Refresh class analytics
      loadFacultyData();
    } catch (err: any) {
      setFormFeedback({ type: 'error', message: err.message || 'Failed to save academic records.' });
    } finally {
      setFormSubmitting(false);
    }
  };

  // Filter students
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.student_id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDept === 'All' || s.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  const GRADE_COLORS = ['#10b981', '#3b82f6', '#06b6d4', '#f59e0b', '#ef4444'];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-slate-500">Loading Faculty Analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Faculty Academic Portal</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Class Performance Analytics, Marks Entry & Academic Risk Monitoring
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
            {user?.profile?.department || 'Computer Science & Engineering'}
          </span>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Students"
          value={classAnalytics?.totalStudents || 18}
          subtitle="Enrolled in active semester"
          icon={Users}
          iconBgColor="bg-blue-50"
          iconColor="text-blue-600"
        />
        <StatCard
          title="Class Average Marks"
          value={`${classAnalytics?.averageClassPerformance || 78.4}%`}
          subtitle="All continuous subjects"
          icon={Award}
          iconBgColor="bg-indigo-50"
          iconColor="text-indigo-600"
        />
        <StatCard
          title="Average Attendance"
          value={`${classAnalytics?.averageAttendance || 86.2}%`}
          subtitle="Minimum 75% required"
          icon={CalendarCheck}
          iconBgColor="bg-emerald-50"
          iconColor="text-emerald-600"
        />
        <StatCard
          title="Students At Risk"
          value={classAnalytics?.studentsAtRiskCount || 4}
          subtitle="Need academic support"
          icon={AlertTriangle}
          iconBgColor="bg-rose-50"
          iconColor="text-rose-600"
          badge={{ text: `${classAnalytics?.studentsAtRiskCount || 4} Flagged`, color: 'rose' }}
        />
        <StatCard
          title="Top Performers"
          value={classAnalytics?.topPerformingStudents?.length || 5}
          subtitle="Scoring above 80%"
          icon={CheckCircle2}
          iconBgColor="bg-teal-50"
          iconColor="text-teal-600"
        />
      </div>

      {/* Interactive Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subject Performance & Class Average Marks */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center">
                <BarChart3 className="w-4 h-4 mr-2 text-indigo-600" />
                Subject Performance vs Attendance
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Average marks score and class attendance by subject</p>
            </div>
          </div>
          <div className="h-72 mt-5">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={classAnalytics?.subjectPerformance} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="subjectName" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '0.75rem', color: '#fff', fontSize: '12px' }}
                />
                <Legend verticalAlign="top" height={36} />
                <Bar dataKey="averageScore" name="Avg Score %" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                <Bar dataKey="averageAttendance" name="Avg Attendance %" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Grade Distribution & Attendance Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center">
                <BookOpen className="w-4 h-4 mr-2 text-blue-600" />
                Class Grade Distribution
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Distribution of overall student grades</p>
            </div>
          </div>
          <div className="h-72 mt-5 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={classAnalytics?.gradeDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="count"
                  nameKey="grade"
                  label={({ grade, count }) => `${grade}: ${count}`}
                >
                  {classAnalytics?.gradeDistribution?.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={GRADE_COLORS[index % GRADE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '0.75rem', color: '#fff', fontSize: '12px' }}
                />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 13. Faculty Data Entry Form */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center">
              <PenTool className="w-4 h-4 mr-2 text-indigo-600" />
              Faculty Academic Data Entry & Marks Management
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter and update internal assessments, assignment scores, and attendance
            </p>
          </div>
          <span className="text-[10px] text-slate-400 font-medium">Validated Form Rules</span>
        </div>

        {formFeedback && (
          <div
            className={`mt-4 p-3 rounded-xl border flex items-center space-x-2 text-xs font-semibold ${
              formFeedback.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            {formFeedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{formFeedback.message}</span>
          </div>
        )}

        <form onSubmit={handleSaveMarksAndAttendance} className="mt-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select Student ID *
              </label>
              <select
                required
                value={entryStudentId}
                onChange={(e) => handleStudentSelectInForm(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="">-- Choose Student --</option>
                {students.map((st) => (
                  <option key={st.student_id} value={st.student_id}>
                    {st.student_id} ({st.name})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Student Name</label>
              <input
                type="text"
                readOnly
                placeholder="Student Name"
                value={entryStudentName}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50 text-slate-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Subject *</label>
              <select
                value={entrySubjectId}
                onChange={(e) => setEntrySubjectId(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.subject_name} ({sub.subject_code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Semester</label>
              <select
                value={entrySemester}
                onChange={(e) => setEntrySemester(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value={1}>Semester 1</option>
                <option value={2}>Semester 2</option>
                <option value={3}>Semester 3</option>
                <option value={4}>Semester 4</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Internal Marks (Max 25) *
              </label>
              <input
                type="number"
                min="0"
                max="25"
                step="0.5"
                required
                value={entryInternal}
                onChange={(e) => setEntryInternal(e.target.value)}
                placeholder="0 - 25"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Assignment Marks (Max 20) *
              </label>
              <input
                type="number"
                min="0"
                max="20"
                step="0.5"
                required
                value={entryAssignment}
                onChange={(e) => setEntryAssignment(e.target.value)}
                placeholder="0 - 20"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Exam Marks (Max 50) *
              </label>
              <input
                type="number"
                min="0"
                max="50"
                step="0.5"
                required
                value={entryExam}
                onChange={(e) => setEntryExam(e.target.value)}
                placeholder="0 - 50"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Attendance % (0 - 100) *
              </label>
              <input
                type="number"
                min="0"
                max="100"
                required
                value={entryAttendance}
                onChange={(e) => setEntryAttendance(e.target.value)}
                placeholder="0 - 100"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={handleResetForm}
              className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 flex items-center space-x-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>Reset</span>
            </button>

            <button
              type="submit"
              disabled={formSubmitting || !entryStudentId}
              className="px-5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs flex items-center space-x-1.5 transition-colors disabled:opacity-50"
            >
              {formSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Academic Entry</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Student List & Search / Inspection Feature */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center">
              <Users className="w-4 h-4 mr-2 text-blue-600" />
              Class Student Roster & Academic Inspection
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Click on any student to inspect marks, attendance trends, risk factors and recommendations
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-52"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
            </div>

            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="py-1.5 px-3 text-xs rounded-lg border border-slate-200 text-slate-700 bg-white"
            >
              <option value="All">All Departments</option>
              <option value="CSE">CSE</option>
              <option value="CSE (AIML)">CSE (AIML)</option>
              <option value="ECE">ECE</option>
              <option value="EEE">EEE</option>
              <option value="Mechanical">Mechanical</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Student</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4">Average Marks</th>
                <th className="py-3.5 px-4">Attendance</th>
                <th className="py-3.5 px-4">Academic Risk</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((st) => (
                <tr key={st.student_id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <img
                        src={st.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${st.name}`}
                        alt={st.name}
                        className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200"
                      />
                      <div>
                        <p className="font-semibold text-slate-900">{st.name}</p>
                        <p className="text-[11px] text-slate-400 font-mono">{st.student_id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-700">{st.department}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{st.averageMarks}%</td>
                  <td className="py-3 px-4">
                    <span
                      className={`font-semibold ${
                        st.averageAttendance < 75 ? 'text-amber-600 font-bold' : 'text-slate-700'
                      }`}
                    >
                      {st.averageAttendance}%
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${
                        st.riskLevel === 'High Risk'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : st.riskLevel === 'Medium Risk'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}
                    >
                      {st.riskLevel}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleInspectStudent(st.student_id)}
                      className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs flex items-center space-x-1 ml-auto transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Deep Student Inspection Modal */}
      {selectedStudentDetail && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-slate-100 space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <img
                  src={selectedStudentDetail.student?.avatar}
                  alt="Avatar"
                  className="w-12 h-12 rounded-xl bg-slate-100 p-0.5 border"
                />
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {selectedStudentDetail.student?.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {selectedStudentDetail.student?.student_id} • {selectedStudentDetail.student?.department}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudentDetail(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Academic summary in inspection */}
            <div className="grid grid-cols-4 gap-3 text-center text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border">
                <span className="text-slate-400 block text-[10px] uppercase">Overall Score</span>
                <span className="text-lg font-bold text-slate-900">
                  {selectedStudentDetail.summary?.overallPerformance}%
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border">
                <span className="text-slate-400 block text-[10px] uppercase">Attendance</span>
                <span className="text-lg font-bold text-slate-900">
                  {selectedStudentDetail.summary?.attendancePercentage}%
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border">
                <span className="text-slate-400 block text-[10px] uppercase">CGPA</span>
                <span className="text-lg font-bold text-slate-900">
                  {selectedStudentDetail.summary?.cgpa}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border">
                <span className="text-slate-400 block text-[10px] uppercase">Risk Level</span>
                <span className="text-sm font-bold text-rose-600">
                  {selectedStudentDetail.summary?.academicRiskLevel}
                </span>
              </div>
            </div>

            {/* Subject Marks Table */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Subject-Wise Marks
              </h4>
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 font-semibold text-slate-600">
                    <tr>
                      <th className="p-2.5">Subject</th>
                      <th className="p-2.5">Internal</th>
                      <th className="p-2.5">Assignment</th>
                      <th className="p-2.5">Exam</th>
                      <th className="p-2.5">Total</th>
                      <th className="p-2.5">Grade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedStudentDetail.marks?.map((m: any) => (
                      <tr key={m.markId}>
                        <td className="p-2.5 font-medium">{m.subjectName}</td>
                        <td className="p-2.5 font-mono">{m.internal}</td>
                        <td className="p-2.5 font-mono">{m.assignment}</td>
                        <td className="p-2.5 font-mono">{m.exam}</td>
                        <td className="p-2.5 font-bold">{m.total}</td>
                        <td className="p-2.5">
                          <span className="font-bold text-indigo-700">{m.grade}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Risk Factors Breakdown */}
            {selectedStudentDetail.risk && (
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Academic Risk Breakdown
                </h4>
                <div className="space-y-1.5">
                  {selectedStudentDetail.risk.factors?.map((f: any, idx: number) => (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-lg border text-xs flex justify-between ${
                        f.conditionMet ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-slate-50 text-slate-600'
                      }`}
                    >
                      <span>{f.factor}: {f.details}</span>
                      <span className="font-bold">{f.conditionMet ? `+${f.pointsAdded} pts` : '0 pts'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-3 border-t flex justify-end">
              <button
                onClick={() => setSelectedStudentDetail(null)}
                className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800"
              >
                Close Inspection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
