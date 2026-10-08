import React, { useEffect, useState } from 'react';
import { User } from '../types';
import { api } from '../services/api';
import { StatCard } from '../components/StatCard';
import {
  Users,
  Building,
  Award,
  CalendarCheck,
  AlertTriangle,
  UploadCloud,
  FileText,
  PlusCircle,
  Trash2,
  Download,
  Printer,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  FileCheck
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

interface AdminDashboardProps {
  user: User;
  currentTab: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, currentTab }) => {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [facultyList, setFacultyList] = useState<any[]>([]);

  // CSV Upload State
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);

  // Quick Faculty Add Form State
  const [facId, setFacId] = useState('');
  const [facName, setFacName] = useState('');
  const [facEmail, setFacEmail] = useState('');
  const [facDept, setFacDept] = useState('CSE');
  const [facDesignation, setFacDesignation] = useState('Assistant Professor');
  const [facMessage, setFacMessage] = useState<string | null>(null);

  // Reports Generation State
  const [reportType, setReportType] = useState<'student' | 'class'>('student');
  const [reportStudentId, setReportStudentId] = useState('STD-2024-001');
  const [generatedReport, setGeneratedReport] = useState<any>(null);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [deptAnalytics, studentsData, facultyData] = await Promise.all([
        api.getDepartmentAnalytics(),
        api.getStudents(),
        api.getFaculty()
      ]);
      setAnalytics(deptAnalytics);
      setStudents(studentsData);
      setFacultyList(facultyData);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCsvUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;

    setUploadLoading(true);
    setUploadResult(null);

    try {
      const result = await api.uploadCsv(uploadFile);
      setUploadResult(result);
      // Reload admin analytics on successful import
      loadAdminData();
    } catch (err: any) {
      setUploadResult({ success: false, errors: [err.message || 'CSV upload failed'] });
    } finally {
      setUploadLoading(false);
    }
  };

  const handleDownloadSampleCsv = () => {
    const csvUrl = '/api/sample-csv';
    const link = document.createElement('a');
    link.href = csvUrl;
    link.setAttribute('download', 'sample_academic_data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddFaculty = async (e: React.FormEvent) => {
    e.preventDefault();
    setFacMessage(null);
    try {
      await api.createFaculty({
        facultyId: facId,
        name: facName,
        email: facEmail,
        department: facDept,
        designation: facDesignation
      });
      setFacMessage('Faculty member added successfully.');
      setFacId('');
      setFacName('');
      setFacEmail('');
      loadAdminData();
    } catch (err: any) {
      setFacMessage(err.message || 'Failed to add faculty.');
    }
  };

  const handleDeleteFaculty = async (id: number) => {
    if (confirm('Are you sure you want to remove this faculty record?')) {
      await api.deleteFaculty(id);
      loadAdminData();
    }
  };

  const handleGenerateReport = async () => {
    if (reportType === 'student') {
      const data = await api.getStudentReport(reportStudentId);
      setGeneratedReport(data);
    } else {
      const data = await api.getClassReport('CSE', 4);
      setGeneratedReport(data);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-slate-500">Loading Administrator Analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Administrator Console</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Institution-Level Academic Intelligence & Department Performance
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleDownloadSampleCsv}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center space-x-1.5 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Sample CSV</span>
          </button>
        </div>
      </div>

      {/* 14. Admin Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        <StatCard
          title="Total Students"
          value={analytics?.summary?.totalStudents || 18}
          icon={Users}
          iconBgColor="bg-blue-50"
          iconColor="text-blue-600"
        />
        <StatCard
          title="Total Faculty"
          value={analytics?.summary?.totalFaculty || 5}
          icon={Users}
          iconBgColor="bg-indigo-50"
          iconColor="text-indigo-600"
        />
        <StatCard
          title="Departments"
          value={analytics?.summary?.totalDepartments || 5}
          icon={Building}
          iconBgColor="bg-purple-50"
          iconColor="text-purple-600"
        />
        <StatCard
          title="Average GPA"
          value={`${analytics?.summary?.averageGpa || 8.1} / 10`}
          icon={Award}
          iconBgColor="bg-teal-50"
          iconColor="text-teal-600"
        />
        <StatCard
          title="Average Attendance"
          value={`${analytics?.summary?.averageAttendance || 85.8}%`}
          icon={CalendarCheck}
          iconBgColor="bg-emerald-50"
          iconColor="text-emerald-600"
        />
        <StatCard
          title="Students At Risk"
          value={analytics?.summary?.studentsAtRisk || 4}
          icon={AlertTriangle}
          iconBgColor="bg-rose-50"
          iconColor="text-rose-600"
          badge={{ text: 'Action Needed', color: 'rose' }}
        />
      </div>

      {/* Department-Wise Charts */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center">
              <BarChart3 className="w-4 h-4 mr-2 text-purple-600" />
              Department-Level Academic Performance & Attendance
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Comparative analysis across CSE, CSE (AIML), ECE, EEE, and Mechanical Engineering
            </p>
          </div>
        </div>
        <div className="h-80 mt-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics?.departmentStats} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="department" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderRadius: '0.75rem', color: '#fff', fontSize: '12px' }}
              />
              <Legend verticalAlign="top" height={36} />
              <Bar dataKey="averageScore" name="Avg Score %" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              <Bar dataKey="averageAttendance" name="Avg Attendance %" fill="#06b6d4" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 15. Data Import (CSV Upload Feature) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center">
              <UploadCloud className="w-4 h-4 mr-2 text-blue-600" />
              Upload Student Academic Data (CSV Import)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Batch import marks and attendance records into the institutional database
            </p>
          </div>
          <button
            onClick={handleDownloadSampleCsv}
            className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center space-x-1"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download CSV Template</span>
          </button>
        </div>

        <form onSubmit={handleCsvUpload} className="mt-5 space-y-4">
          <div className="p-6 border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-xl bg-slate-50/60 text-center transition-colors">
            <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-700">
              Select CSV File with Academic Records
            </p>
            <p className="text-[11px] text-slate-400 mt-1 mb-3">
              Required columns: student_id, student_name, department, semester, subject, internal_marks, assignment_marks, exam_marks, attendance
            </p>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
              className="text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={uploadLoading || !uploadFile}
              className="px-5 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs flex items-center space-x-1.5 transition-colors disabled:opacity-50"
            >
              {uploadLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <FileCheck className="w-3.5 h-3.5" />
                  <span>Validate & Import CSV Records</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Upload feedback */}
        {uploadResult && (
          <div className="mt-4 p-4 rounded-xl border bg-slate-50 space-y-2 text-xs">
            {uploadResult.success ? (
              <div className="text-emerald-700 flex items-center space-x-2 font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  Successfully imported {uploadResult.importedCount} records out of {uploadResult.totalRows} rows!
                </span>
              </div>
            ) : (
              <div className="text-rose-700 flex items-center space-x-2 font-semibold">
                <AlertCircle className="w-4 h-4" />
                <span>Import Encountered Issues:</span>
              </div>
            )}

            {uploadResult.errors?.length > 0 && (
              <div className="text-rose-600 bg-rose-50 p-3 rounded-lg border border-rose-200 space-y-1">
                <p className="font-semibold">Validation Warnings / Errors:</p>
                <ul className="list-disc list-inside space-y-0.5">
                  {uploadResult.errors.map((err: string, i: number) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 16. Reports Generation Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center">
              <FileText className="w-4 h-4 mr-2 text-indigo-600" />
              Institutional Reports Generator
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Generate Student Performance Reports & Class Performance Summaries
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Report Type</label>
            <select
              value={reportType}
              onChange={(e: any) => setReportType(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
            >
              <option value="student">Student Performance Report</option>
              <option value="class">Class Performance Report</option>
            </select>
          </div>

          {reportType === 'student' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Select Student</label>
              <select
                value={reportStudentId}
                onChange={(e) => setReportStudentId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
              >
                {students.map((s) => (
                  <option key={s.student_id} value={s.student_id}>
                    {s.student_id} ({s.name})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-end space-x-2">
            <button
              onClick={handleGenerateReport}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white flex items-center space-x-1.5 transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Generate Report</span>
            </button>
            {generatedReport && (
              <button
                onClick={() => window.print()}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 flex items-center space-x-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>
            )}
          </div>
        </div>

        {/* Generated Report Preview */}
        {generatedReport && (
          <div className="mt-6 p-6 rounded-xl border border-slate-200 bg-slate-50/70 space-y-4">
            <div className="flex justify-between items-start pb-3 border-b border-slate-200">
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  {reportType === 'student' ? 'Official Student Performance Report' : 'Class Academic Report'}
                </h4>
                <p className="text-[11px] text-slate-500">
                  Generated on {new Date(generatedReport.generatedAt).toLocaleString()}
                </p>
              </div>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-blue-100 text-blue-800">
                Verified Prototype Report
              </span>
            </div>

            {reportType === 'student' ? (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-4 gap-3 bg-white p-3 rounded-lg border border-slate-200">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Student Name</span>
                    <span className="font-bold">{generatedReport.student?.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Student ID</span>
                    <span className="font-bold">{generatedReport.student?.student_id}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Department</span>
                    <span className="font-bold">{generatedReport.student?.department}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">CGPA / Average Marks</span>
                    <span className="font-bold">
                      {generatedReport.academicSummary?.gpa} / {generatedReport.academicSummary?.averageMarks}%
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-lg border bg-white">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 font-semibold text-slate-600">
                      <tr>
                        <th className="p-2">Subject</th>
                        <th className="p-2">Internal</th>
                        <th className="p-2">Assignment</th>
                        <th className="p-2">Exam</th>
                        <th className="p-2">Total</th>
                        <th className="p-2">Grade</th>
                        <th className="p-2">Attendance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {generatedReport.subjects?.map((sub: any, i: number) => (
                        <tr key={i}>
                          <td className="p-2 font-medium">{sub.subjectName}</td>
                          <td className="p-2 font-mono">{sub.internal}</td>
                          <td className="p-2 font-mono">{sub.assignment}</td>
                          <td className="p-2 font-mono">{sub.exam}</td>
                          <td className="p-2 font-bold">{sub.total}</td>
                          <td className="p-2 font-bold text-indigo-600">{sub.grade}</td>
                          <td className="p-2">{sub.attendance}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-3 gap-3 bg-white p-3 rounded-lg border border-slate-200">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Department</span>
                    <span className="font-bold">{generatedReport.department}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Semester</span>
                    <span className="font-bold">Semester {generatedReport.semester}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Total Enrolled</span>
                    <span className="font-bold">{generatedReport.totalStudents} Students</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Faculty Management List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center">
              <Users className="w-4 h-4 mr-2 text-purple-600" />
              Faculty Members Directory
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Faculty records across departments</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Faculty ID</th>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Designation</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {facultyList.map((fac) => (
                <tr key={fac.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-mono font-semibold text-slate-900">{fac.faculty_id}</td>
                  <td className="py-3 px-4 font-medium text-slate-900">{fac.name}</td>
                  <td className="py-3 px-4 text-slate-500">{fac.email}</td>
                  <td className="py-3 px-4">{fac.department}</td>
                  <td className="py-3 px-4 text-slate-600">{fac.designation}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleDeleteFaculty(fac.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
