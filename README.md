# Student Academic Performance Analyzer

A modern, responsive full-stack web application designed for higher education institutions to monitor student performance, detect weak subjects, analyze attendance and marks, identify students academically at risk, and generate actionable academic predictions and recommendations.

---

## 1. Project Goal & Overview
The **Student Academic Performance Analyzer** helps students, faculty, and administrators track academic health in real time:
- **Students** gain visibility into their continuous assessments, historical trends, attendance warnings, and personalized study recommendations.
- **Faculty** can review class-wide performance, enter and update marks and attendance, and monitor students who require intervention.
- **Administrators** can view department-level metrics (CSE, CSE AIML, ECE, EEE, Mechanical), upload batch data via CSV, and generate official institutional reports.

The prototype includes realistic pre-populated data across multiple semesters and departments, and is architected with a decoupled service layer so that machine learning models (e.g., Python Scikit-Learn or XGBoost) can be integrated effortlessly in the future.

---

## 2. Technology Stack

### Frontend
- **React 18** with **TypeScript**
- **Tailwind CSS** for responsive design
- **Recharts** for interactive line charts, bar charts, and pie charts
- **Lucide React** for icons
- **Vite** for fast builds and hot module replacement (HMR)

### Backend
- **Node.js 24 (LTS)**
- **Express.js** REST API
- **node:sqlite** (native synchronous SQLite database engine, zero external C++ compile issues)
- **bcryptjs** for secure password hashing
- **jsonwebtoken** for token-based authentication
- **Multer** for multipart CSV academic uploads

### Database
- **SQLite 3** (`database/academic_analyzer.db`)
- Normalized schema with foreign key constraints: `users`, `students`, `faculty`, `subjects`, `marks`, `attendance`

---

## 3. Project Structure
```
P1/
├── backend/                       # Express REST API Server
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── server.ts              # Express API & static file serving
│       ├── db.ts                  # SQLite database connection & schema
│       ├── seed.ts                # Realistic sample data seeder
│       ├── predictionService.ts   # Performance prediction engine (ML-ready)
│       ├── riskService.ts         # Multi-factor academic risk engine
│       └── recommendationService.ts # Weak subject detection & rules engine
├── frontend/                      # React TypeScript Frontend
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── tsconfig.json
│   ├── index.html
│   └── src/
│       ├── main.tsx               # React root entry
│       ├── App.tsx                # Main application layout & state
│       ├── index.css              # Tailwind styles & print CSS
│       ├── types/
│       │   └── index.ts           # Shared TypeScript interfaces
│       ├── services/
│       │   └── api.ts             # Typed REST API client
│       ├── components/
│       │   ├── Navbar.tsx         # User status & role indicator
│       │   ├── Sidebar.tsx        # Role-based sidebar navigation
│       │   └── StatCard.tsx       # KPI tile with risk badges & trends
│       └── pages/
│           ├── Login.tsx          # Role switcher & demo quick-fill
│           ├── StudentDashboard.tsx # Complete student analytics portal
│           ├── FacultyDashboard.tsx # Class analytics & marks entry form
│           └── AdminDashboard.tsx   # Dept analytics, CSV import & reports
├── database/                      # SQLite Database Directory
│   ├── schema.sql                 # DDL definitions
│   └── academic_analyzer.db       # Generated SQLite database file
└── README.md
```

---

## 4. Demo Login Credentials

The application provides instant one-click login presets on the login screen for testing:

| Role | Demo Identifier / Email | Demo Password | Default View |
| :--- | :--- | :--- | :--- |
| **Student** | `student@example.com` *(or `STD-2024-001`)* | `student123` | Student Dashboard (Aarav Sharma) |
| **Faculty** | `faculty@example.com` | `faculty123` | Faculty Portal (Dr. Rajesh Kumar) |
| **Admin** | `admin@example.com` | `admin123` | Administrator Console |

---

## 5. Installation & Setup

### Prerequisites
- **Node.js 20+** installed (Node.js 24 LTS recommended)
- **npm** package manager

### 1. Database Initialization & Seeding
From the project root:
```powershell
cd backend
npm install
npm run seed
```
This initializes `database/academic_analyzer.db` with 18 students, 9 subjects across departments, 5 faculty members, multi-semester marks, and pre-computed attendance records.

### 2. Building the Frontend
```powershell
cd ../frontend
npm install
npm run build
```

---

## 6. How to Run the Application

### Option A: Unified Full-Stack Server (Recommended for Demos)
The backend is configured to serve both the REST API endpoints (`/api/*`) and the built React frontend from a single port (`5000`):
```powershell
cd backend
npm start
```
Open **[http://localhost:5000](http://localhost:5000)** in your browser.

### Option B: Development Mode with Vite HMR
Run the backend and frontend in separate terminals:
1. **Backend Terminal**:
   ```powershell
   cd backend
   npm run dev    # Starts API on http://localhost:5000
   ```
2. **Frontend Terminal**:
   ```powershell
   cd frontend
   npm run dev    # Starts Vite dev server on http://localhost:3000
   ```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 7. Key Features & Business Logic

### A. Academic Calculations
- **Total Subject Marks** = $\text{Internal} + \text{Assignment} + \text{Exam}$
- **Subject Percentage** = $\frac{\text{Obtained Marks}}{\text{Maximum Marks}} \times 100$
- **Average Performance** = $\frac{\sum \text{Subject Percentages}}{\text{Number of Subjects}}$
- **Grade Scale**:
  - $\ge 85\%$: **A**
  - $\ge 75\%$: **B+**
  - $\ge 65\%$: **B**
  - $\ge 55\%$: **C**
  - $< 55\%$: **F** (Needs Attention)

### B. Transparent Academic Risk Logic
Risk score is computed on a 0–100 scale using 4 weighted indicators:
- **Low Marks** ($<60\%$ average): **+30 points**
- **Low Attendance** ($<75\%$ overall): **+25 points**
- **Declining Performance** (current semester $<$ previous semester): **+25 points**
- **Low Assignment Completion** ($<70\%$ average): **+20 points**

**Risk Tiers**:
- `0 – 25`: **Low Risk** *(Performance is stable)*
- `26 – 50`: **Medium Risk** *(Some areas require improvement)*
- `51 – 100`: **High Risk** *(Multiple academic indicators require attention)*

### C. Prototype Prediction Engine
- **Input Features**: Previous semester marks, Internal marks, Assignment marks, Attendance, Previous GPA, Study consistency score.
- **Output**: Predicted final score percentage, performance category (`Excellent`, `Good`, `Average`, `Needs Improvement`, `Critical`), and confidence rating ($78\% - 95\%$).
- **ML Decoupling**: Encapsulated inside `backend/src/predictionService.ts`. Designed to delegate to an external Python Flask/FastAPI microservice running Scikit-Learn or XGBoost.

### D. Data Import (CSV)
- Supports upload of `.csv` files on the Admin portal.
- Expected columns: `student_id`, `student_name`, `department`, `semester`, `subject`, `internal_marks`, `assignment_marks`, `exam_marks`, `attendance`.
- Full input validation: checks boundaries ($\text{internal} \le 25$, $\text{assignment} \le 20$, $\text{exam} \le 50$, $\text{attendance} \le 100$), reports row-by-row errors, and imports valid rows.
- Downloadable sample CSV provided via `/api/sample-csv`.

### E. Reporting
- **Student Performance Report**: Details, subject marks breakdown, attendance, CGPA, risk level, and recommendations.
- **Class Performance Report**: Department and semester averages, attendance rates, and grade distributions.
- Options to **Print Report** (uses print-optimized CSS) and **Download CSV**.

---

## 8. API Documentation Summary

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/login` | Authenticate user with role validation and JWT issuance |
| `GET` | `/api/students` | List students with search, department, and semester filters |
| `GET` | `/api/students/:id` | Student profile and summary metrics |
| `GET` | `/api/students/:id/marks` | Subject-wise marks (internal, assignment, exam, grade) |
| `GET` | `/api/students/:id/attendance` | Overall and subject-wise attendance with warning checks |
| `GET` | `/api/students/:id/performance` | Historical semester trend data |
| `GET` | `/api/students/:id/prediction` | Prototype performance prediction and confidence score |
| `GET` | `/api/students/:id/recommendations`| Personalized recommendations and weak subject detection |
| `GET` | `/api/students/:id/risk` | Transparent academic risk factors and score |
| `POST` | `/api/marks` | Add or update subject marks (with range validation) |
| `PUT` | `/api/marks/:id` | Edit specific marks record |
| `DELETE`| `/api/marks/:id` | Delete marks record |
| `POST` | `/api/attendance` | Add or update attendance record |
| `GET` | `/api/analytics/class` | Class-level statistics, grade & attendance distributions |
| `GET` | `/api/analytics/department` | Department-level performance across CSE, ECE, EEE, etc. |
| `POST` | `/api/import` | Upload and validate academic CSV file |
| `GET` | `/api/sample-csv` | Download sample CSV template |
| `GET` | `/api/reports/student/:id` | Comprehensive student report payload |
| `GET` | `/api/reports/class` | Class performance report payload |
| `GET` | `/api/subjects` | List subjects registered in the system |
| `GET` | `/api/faculty` | List faculty members |
| `POST` | `/api/faculty` | Register new faculty member |
| `DELETE`| `/api/faculty/:id` | Remove faculty member |
| `GET` | `/api/health` | Service health status |

---

## 9. Future AI / Machine Learning Integration
1. **Python ML Microservice**: Replace the weighted heuristic in `backend/src/predictionService.ts` by making an HTTP call to a Python FastAPI service (`http://localhost:8000/predict`).
2. **Model Choices**:
   - **Linear Regression / Ridge**: Predicts continuous final numerical scores.
   - **Random Forest / XGBoost**: Evaluates non-linear feature interactions (e.g., impact of steep attendance drops in specific subjects).
   - **Logistic Regression**: Predicts binary probability of student academic risk or course drop-out.
