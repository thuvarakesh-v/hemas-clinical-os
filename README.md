# 🏥 MediCare AI — Full Hospital Management System

A complete AI-driven hospital management system with 1 backend and 4 frontend applications, powered by Google Gemini AI.

---

## 🗂️ Project Structure

```
hospital-system/
├── backend/              ← Node.js 20 + Express + PostgreSQL + Gemini AI
├── patient-app/          ← React app (port 5173) — Patient Portal
├── medical-staff-app/    ← React app (port 5174) — Medical Staff Portal
├── medicine-staff-app/   ← React app (port 5175) — Medicine & Reports Portal
└── admin-app/            ← React app (port 5176) — Admin Control Panel
```

---

## 🚀 Quick Start (Docker)

### Prerequisites
- Docker Desktop installed
- Node.js 20+ (for running frontends locally)

### 1. Set up environment

```bash
cd backend
cp .env.example .env
```

Edit `.env` and fill in:
```env
GEMINI_API_KEY_1=your_gemini_api_key_here
GEMINI_API_KEY_2=optional_second_key
GEMINI_API_KEY_3=optional_third_key

# Email (optional — OTPs print to console if not set)
SMTP_USER=your@gmail.com
SMTP_PASS=your_app_password
```

> 💡 Get free Gemini API keys at: https://aistudio.google.com/app/apikey

### 2. Start Backend with Docker

```bash
cd backend
docker-compose up -d
```

This starts:
- **PostgreSQL** on port `5432`
- **Backend API** on port `3000`
- **pgAdmin** on port `5050` (admin@hospital.com / admin123)

### 3. Seed the database

```bash
docker-compose exec backend npm run db:seed
```

This creates:
- 18 departments, 22 allergies, 30 conditions
- Default admin: `superadmin` / `Admin@123456`
- 6 sample doctors (password: `Doctor@123`)
- 4 sample staff (password: `Staff@123`)

### 4. Start Frontend Apps

Open 4 terminals:

```bash
# Terminal 1 — Patient App
cd patient-app && npm install && npm run dev
# → http://localhost:5173

# Terminal 2 — Medical Staff App  
cd medical-staff-app && npm install && npm run dev
# → http://localhost:5174

# Terminal 3 — Medicine & Reports App
cd medicine-staff-app && npm install && npm run dev
# → http://localhost:5175

# Terminal 4 — Admin Panel
cd admin-app && npm install && npm run dev
# → http://localhost:5176
```

---

## 🔑 Default Login Credentials

| Portal | URL | Username | Password |
|--------|-----|----------|----------|
| Doctor Portal | :5177 | `dr.smith` | `Doctor@123` |
| Admin Panel | :5176 | `superadmin` | `Admin@123456` |
| Medical Staff | :5174 | `staff.medical1` | `Staff@123` |
| Medicine/Reports | :5175 | `staff.med1` | `Staff@123` |
| Doctor (staff portals) | :5174/:5175 | `dr.smith` | `Doctor@123` |
| Patient | :5173 | Register new account | — |

---

## 🏗️ Backend Architecture

### Technology Stack
- **Runtime**: Node.js 20.19.4
- **Framework**: Express.js 4
- **Database**: PostgreSQL 16 + Sequelize 6 ORM
- **AI**: Google Gemini 1.5 Flash (multi-key rotation)
- **Auth**: JWT (access + refresh tokens)
- **File Upload**: Multer
- **QR Code**: qrcode library
- **Email**: Nodemailer

### API Base URL
```
http://localhost:3000/api/v1
```

### Key Endpoints

**Auth**
```
POST /auth/patient/register     Register patient
POST /auth/patient/verify-otp   Verify email/phone OTP
POST /auth/patient/login        Patient login
POST /auth/staff/login          Doctor/Staff/Admin login
POST /auth/refresh              Refresh access token
POST /auth/logout               Logout
```

**Patient**
```
POST   /patient/profile         Create medical profile
GET    /patient/profile         Get full profile
PUT    /patient/profile         Update profile
POST   /patient/allergies       Add allergy
DELETE /patient/allergies/:id   Remove allergy
POST   /patient/conditions      Add condition
DELETE /patient/conditions/:id  Remove condition
GET    /emergency/:token        Emergency QR data (public)
```

**Documents / Vault**
```
POST /documents/upload          Upload document (auto AI analysis for PDFs)
GET  /documents                 List documents (with date/category filter)
GET  /documents/:id             Get document details
GET  /documents/:id/analysis    Get AI analysis result
DELETE /documents/:id           Delete document
```

**AI Engine**
```
POST /ai/chat                   Send chat message (with patient context)
POST /ai/symptoms               Analyze symptoms
GET  /ai/sessions               Get chat sessions
GET  /ai/sessions/:id           Get session history
GET  /ai/analyses               Get AI analyses history
GET  /ai/recommended-doctors    AI-recommended doctors for patient
```

**Appointments**
```
GET  /appointments/slots/:doctorId   Available time slots
POST /appointments                   Book appointment
GET  /appointments/my                My appointments
PUT  /appointments/:id/cancel        Cancel appointment
```

**Doctors (public)**
```
GET /doctors                Search/list doctors
GET /doctors/:id            Doctor details
```

**Admin**
```
GET    /admin/dashboard         Stats dashboard
GET    /admin/users             List patients
GET    /admin/doctors           List doctors
POST   /admin/doctors           Create doctor
PUT    /admin/doctors/:id       Update doctor
DELETE /admin/doctors/:id       Deactivate doctor
GET    /admin/staff             List staff
POST   /admin/staff             Create staff
PUT    /admin/staff/:id         Update staff
GET    /admin/departments       List departments
POST   /admin/departments       Create department
GET    /admin/appointments      All appointments
POST   /admin/allergies         Add master allergy
POST   /admin/conditions        Add master condition
```

---

## 🤖 AI System Architecture

### Gemini Integration
- **Multi-key rotation**: Cycles through up to 5 Gemini API keys to stay within rate limits
- **Model**: `gemini-1.5-flash` (fast, cost-effective)
- **Async PDF Analysis**: PDF uploads trigger background AI analysis

### AI Features

1. **PDF Document Analysis**
   - Extracts text from PDF using `pdf-parse`
   - Sends patient context + document text to Gemini
   - Returns: summary, key findings, what it means, indicators, urgency level, recommended specialist
   - Stores result in `ai_analyses` table linked to document and patient

2. **AI Chat Engine**
   - Maintains per-session conversation history (last 10 messages)
   - Patient profile (age, gender, allergies, conditions, recent analyses) injected as system context
   - Extracts metadata after each reply: detected symptoms, urgency, indicators
   - Saves each exchange to `chat_messages` table

3. **Symptom Analysis**
   - Standalone symptom analysis endpoint
   - Returns: possible conditions with probability, urgency level, immediate actions, red flags

4. **Doctor Recommendations**
   - Fetches available doctors from DB
   - Asks Gemini to rank by relevance to patient's profile and recent AI analyses
   - Returns personalized ordered list

### Patient Context Injection
Every AI call receives:
```json
{
  "name": "John Doe",
  "age": 35,
  "gender": "male",
  "bloodGroup": "O+",
  "allergies": ["Penicillin", "Peanuts"],
  "conditions": ["Type 2 Diabetes", "Hypertension"],
  "pastDocumentsSummary": "Recent CBC showed elevated WBC..."
}
```

---

## 🗃️ Database Schema

### Tables
| Table | Description |
|-------|-------------|
| `users` | Patient accounts (email/phone, password/PIN, account type) |
| `medical_profiles` | Patient health profile (DOB, gender, vitals, emergency contact) |
| `emergency_qr` | QR token + emergency health snapshot |
| `allergies` | Master allergy list |
| `user_allergies` | Patient ↔ Allergy junction (with custom allergies) |
| `conditions` | Master conditions list (with ICD codes) |
| `user_conditions` | Patient ↔ Condition junction |
| `departments` | Hospital departments/specialties |
| `doctors` | Doctor accounts + scheduling config |
| `staff` | Staff accounts (medical, medicine, lab, receptionist) |
| `admins` | Admin accounts |
| `appointments` | Bookings with status, notes, prescriptions |
| `documents` | Uploaded files metadata |
| `ai_analyses` | AI analysis results (linked to documents or symptoms) |
| `chat_messages` | AI chat history per session |

---

## 📱 Frontend Apps

### 1. Patient App (port 5173)
- **Register**: Account type selection → contact verification (OTP) → medical profile setup → emergency QR generation
- **Home**: Health overview, upcoming appointments, recent documents, quick actions
- **Vault**: Document library with date/category filters, AI analysis view, PDF upload
- **AI Engine**: Real-time chat with MediAI, confidence score, detected indicators, recommended doctors
- **Booking**: Doctor search by name/specialty/department, slot picker, appointment booking
- **Profile**: View health data, allergies, conditions, download emergency QR

### 2. Medical Staff App (port 5174)
- **Dashboard**: Today's appointments overview
- **Patients**: Search and list patients
- **Patient Records**: Full patient profile — allergies, conditions, documents, appointment history
- **Appointments**: Date-filtered appointment viewer

### 3. Medicine & Reports App (port 5175)
- **Dashboard**: Quick action guide
- **Upload Report**: Patient search → file upload → auto AI analysis trigger
- **Find Patient**: Search and view patient records
- **All Reports**: Browse all patients and their document status

### 4. Doctor Portal (port 5177)
- **Login**: Doctor-only access (staff are redirected to the correct portal)
- **Dashboard**: Today's schedule, appointment stats, upcoming appointments
- **Appointments**: Full appointment management — complete, add notes, prescription, mark no-show
- **My Patients**: All patients seen, with full medical records view (allergies, conditions, documents, AI analyses)
- **Schedule**: Configure working days, hours, slot duration, consultation fee with live slot preview
- **My Profile**: Update bio and contact information

### 5. Admin Panel (port 5176)
- **Dashboard**: System-wide stats (users, doctors, staff, appointments, documents)
- **Patients**: List all patients, enable/disable accounts
- **Doctors**: Full CRUD — create, edit, update schedule, deactivate
- **Staff**: Full CRUD — create, assign roles, manage access
- **Departments**: Create and manage hospital departments
- **Appointments**: View all appointments with filters
- **Master Data**: Add/manage allergies and conditions master lists
- **Admins**: Create sub-admins (super admin only)

---

## 🔐 Security

- **JWT Authentication** with access (7d) + refresh (30d) tokens
- **Bcrypt** password hashing (12 rounds)
- **Rate Limiting**: 200 req/15min general, 20 req/15min for auth endpoints
- **Helmet.js** security headers
- **CORS** with origin whitelist
- **File type validation** on upload
- **Role-based access control** — 5 roles: patient, doctor, medical_staff, medicine_staff, admin

---

## 🐳 Production Deployment

```bash
cd backend

# Set production environment variables
export JWT_SECRET=your_very_long_random_secret_here
export GEMINI_API_KEY_1=your_key
# ... other env vars

docker-compose up -d --build
docker-compose exec backend npm run db:seed
```

Backend will be available at `http://your-server:3000`

Update each frontend app's `vite.config.js` proxy target to point to your server IP.

---

## 📋 Seeded Test Data

After running `npm run db:seed`:

**Doctors available:**
- Dr. James Smith — General Practice
- Dr. Li Chen — Cardiology  
- Dr. Priya Patel — Pediatrics
- Dr. Sarah Johnson — Neurology
- Dr. Omar Rahman — Orthopedics
- Dr. Maria Silva — Dermatology

**Staff accounts:**
- `staff.medical1` / `Staff@123` — Medical Staff
- `staff.lab1` / `Staff@123` — Lab Technician
- `staff.med1` / `Staff@123` — Medicine Staff
- `receptionist1` / `Staff@123` — Receptionist

---

## 🛠️ Troubleshooting

**Database connection error:**
```bash
docker-compose logs postgres
docker-compose restart backend
```

**AI not responding:**
- Check Gemini API key is set in `.env`
- OTPs print to console if SMTP not configured — check backend logs

**File uploads not working:**
```bash
docker-compose exec backend ls uploads/
# Should show: documents/ reports/ images/ temp/
```

**Reseed database:**
```bash
docker-compose exec backend npm run db:seed
```

---

## 📄 License

MIT License — Built for MediCare AI Hospital System
