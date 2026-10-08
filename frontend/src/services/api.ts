const API_BASE = '/api';

function getAuthHeader(): HeadersInit {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

export const api = {
  async postLogin(credentials: { identifier: string; password: string; role: string }) {
    const res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    return data;
  },

  async getStudents(filters?: { department?: string; semester?: string; search?: string }) {
    const params = new URLSearchParams();
    if (filters?.department) params.append('department', filters.department);
    if (filters?.semester) params.append('semester', filters.semester);
    if (filters?.search) params.append('search', filters.search);

    const res = await fetch(`${API_BASE}/students?${params.toString()}`, {
      headers: getAuthHeader()
    });
    if (!res.ok) throw new Error('Failed to fetch students');
    return res.json();
  },

  async getStudent(id: string) {
    const res = await fetch(`${API_BASE}/students/${id}`, {
      headers: getAuthHeader()
    });
    if (!res.ok) throw new Error('Failed to fetch student details');
    return res.json();
  },

  async getStudentMarks(id: string, semester?: number) {
    const url = semester ? `${API_BASE}/students/${id}/marks?semester=${semester}` : `${API_BASE}/students/${id}/marks`;
    const res = await fetch(url, { headers: getAuthHeader() });
    if (!res.ok) throw new Error('Failed to fetch marks');
    return res.json();
  },

  async getStudentAttendance(id: string, semester?: number) {
    const url = semester ? `${API_BASE}/students/${id}/attendance?semester=${semester}` : `${API_BASE}/students/${id}/attendance`;
    const res = await fetch(url, { headers: getAuthHeader() });
    if (!res.ok) throw new Error('Failed to fetch attendance');
    return res.json();
  },

  async getStudentPerformanceTrend(id: string) {
    const res = await fetch(`${API_BASE}/students/${id}/performance`, {
      headers: getAuthHeader()
    });
    if (!res.ok) throw new Error('Failed to fetch performance trend');
    return res.json();
  },

  async getStudentPrediction(id: string) {
    const res = await fetch(`${API_BASE}/students/${id}/prediction`, {
      headers: getAuthHeader()
    });
    if (!res.ok) throw new Error('Failed to fetch prediction');
    return res.json();
  },

  async getStudentRecommendations(id: string) {
    const res = await fetch(`${API_BASE}/students/${id}/recommendations`, {
      headers: getAuthHeader()
    });
    if (!res.ok) throw new Error('Failed to fetch recommendations');
    return res.json();
  },

  async getStudentRisk(id: string) {
    const res = await fetch(`${API_BASE}/students/${id}/risk`, {
      headers: getAuthHeader()
    });
    if (!res.ok) throw new Error('Failed to fetch risk analysis');
    return res.json();
  },

  // Faculty marks & attendance entry
  async saveMarks(body: {
    studentId: string;
    subjectId: number;
    internalMarks: number;
    assignmentMarks: number;
    examMarks: number;
    semester: number;
  }) {
    const res = await fetch(`${API_BASE}/marks`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to save marks');
    return data;
  },

  async updateMarks(markId: number, body: { internalMarks: number; assignmentMarks: number; examMarks: number }) {
    const res = await fetch(`${API_BASE}/marks/${markId}`, {
      method: 'PUT',
      headers: getAuthHeader(),
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update marks');
    return data;
  },

  async deleteMarks(markId: number) {
    const res = await fetch(`${API_BASE}/marks/${markId}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete marks');
    return data;
  },

  async saveAttendance(body: { studentId: string; subjectId: number; attendancePercentage: number; semester: number }) {
    const res = await fetch(`${API_BASE}/attendance`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to record attendance');
    return data;
  },

  // Analytics
  async getClassAnalytics(department?: string, semester?: number) {
    const params = new URLSearchParams();
    if (department) params.append('department', department);
    if (semester) params.append('semester', semester.toString());
    const res = await fetch(`${API_BASE}/analytics/class?${params.toString()}`, {
      headers: getAuthHeader()
    });
    if (!res.ok) throw new Error('Failed to fetch class analytics');
    return res.json();
  },

  async getDepartmentAnalytics() {
    const res = await fetch(`${API_BASE}/analytics/department`, {
      headers: getAuthHeader()
    });
    if (!res.ok) throw new Error('Failed to fetch department analytics');
    return res.json();
  },

  // Subjects & Faculty lookups
  async getSubjects() {
    const res = await fetch(`${API_BASE}/subjects`, { headers: getAuthHeader() });
    if (!res.ok) throw new Error('Failed to fetch subjects');
    return res.json();
  },

  async getFaculty() {
    const res = await fetch(`${API_BASE}/faculty`, { headers: getAuthHeader() });
    if (!res.ok) throw new Error('Failed to fetch faculty list');
    return res.json();
  },

  async createFaculty(body: any) {
    const res = await fetch(`${API_BASE}/faculty`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create faculty');
    return data;
  },

  async deleteFaculty(id: number | string) {
    const res = await fetch(`${API_BASE}/faculty/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    });
    return res.json();
  },

  // CSV import
  async uploadCsv(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE}/import`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'CSV import failed');
    return data;
  },

  // Reports
  async getStudentReport(id: string) {
    const res = await fetch(`${API_BASE}/reports/student/${id}`, {
      headers: getAuthHeader()
    });
    if (!res.ok) throw new Error('Failed to fetch student report');
    return res.json();
  },

  async getClassReport(department?: string, semester?: number) {
    const params = new URLSearchParams();
    if (department) params.append('department', department);
    if (semester) params.append('semester', semester.toString());
    const res = await fetch(`${API_BASE}/reports/class?${params.toString()}`, {
      headers: getAuthHeader()
    });
    if (!res.ok) throw new Error('Failed to fetch class report');
    return res.json();
  }
};
