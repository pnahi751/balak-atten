# Student Attendance Tracker

A complete, production-ready web application for managing student attendance with admin authentication, student management, attendance marking, and comprehensive reporting features.

## 🚀 Features

### ✅ Admin Authentication
- Secure admin login with email/password
- Session management with JWT
- Protected routes and logout functionality

### 👥 Student Management
- Add/Edit/Delete student records
- Upload and display student photos
- Search by name or mobile number
- Filter by class (1-12)
- Pagination support
- Comprehensive student profiles with:
  - First Name, Father's Name, Surname
  - Date of Birth (with date picker)
  - Mobile Number (Indian format validation)
  - Student Photo (upload with thumbnail preview)
  - Class/Standard (1-12)
  - Complete Address
  - Automatic timestamps (createdAt, updatedAt)

### 📋 Attendance Management
- Mark attendance by date and class
- Bulk actions (Mark All Present/Absent)
- Real-time attendance statistics
- Visual indicators for Present/Absent status
- Save attendance with one click
- View attendance history per student
- Filter by class, date range

### 📊 Reports & Analytics
- **Student-wise Reports**: Individual attendance records with percentage
- **Class-wise Reports**: Aggregate attendance by class
- Date range filtering
- CSV export for all reports
- Attendance percentage calculation
- Color-coded performance indicators:
  - Green: ≥75% attendance
  - Yellow: 60-74% attendance
  - Red: <60% attendance

### 🎨 User Interface
- Modern, clean design with Tailwind CSS
- Mobile-first responsive layout
- Real-time dashboard with key metrics:
  - Total students count
  - Today's present count
  - Today's absent count
  - Total attendance marked today
- Confirmation dialogs for delete actions
- Toast notifications for all actions
- Loading states and empty states

### ✔️ Validation
- Client-side and server-side validation
- Indian mobile number format validation (10 digits starting with 6-9)
- Image size validation (max 5MB)
- Image type validation (JPG, PNG, GIF)
- Date validation
- Required field validation

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: lucide-react
- **Backend**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Notifications**: Sonner (toast)

## 📦 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Supabase account

### Step 1: Database Setup

You need to set up the following tables in your Supabase database:

#### Students Table
```sql
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "firstName" TEXT NOT NULL,
  "fatherName" TEXT NOT NULL,
  surname TEXT NOT NULL,
  "dateOfBirth" DATE NOT NULL,
  "mobileNumber" VARCHAR(10) NOT NULL,
  "studentPhoto" TEXT,
  standard INTEGER NOT NULL CHECK (standard >= 1 AND standard <= 12),
  address TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_students_standard ON students(standard);
CREATE INDEX idx_students_mobile ON students("mobileNumber");
```

#### Attendance Table
```sql
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "studentId" UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status VARCHAR(10) NOT NULL CHECK (status IN ('present', 'absent')),
  standard INTEGER NOT NULL CHECK (standard >= 1 AND standard <= 12),
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE("studentId", date)
);

-- Create indexes for better performance
CREATE INDEX idx_attendance_date ON attendance(date);
CREATE INDEX idx_attendance_student ON attendance("studentId");
CREATE INDEX idx_attendance_standard ON attendance(standard);
```

### Step 2: Storage Bucket Setup

Create a public storage bucket in Supabase for student photos:

1. Go to Supabase Dashboard → Storage
2. Create a new bucket named: `attendance-tracker`
3. Make it **public**
4. Set the following MIME types allowed: `image/jpeg, image/png, image/gif`

### Step 3: Create Admin User

Run this in your Supabase SQL Editor to create the default admin account:

**Option A: Using Supabase Dashboard**
1. Go to Authentication → Users
2. Click "Add User"
3. Email: `admin@school.com`
4. Password: `admin123`
5. Auto Confirm User: **Yes**

**Option B: Using SQL (if you have service role access)**
```sql
-- Note: This requires service role access
-- You can also use the Supabase Dashboard UI as described above
```

### Step 4: Seed Sample Data (Optional)

Add 3 sample students to get started:

```sql
INSERT INTO students (
  "firstName", 
  "fatherName", 
  surname, 
  "dateOfBirth", 
  "mobileNumber", 
  standard, 
  address,
  "createdAt",
  "updatedAt"
) VALUES 
(
  'Raj', 
  'Suresh', 
  'Kumar', 
  '2010-05-15', 
  '9876543210', 
  8, 
  '123 MG Road, Bangalore, Karnataka - 560001',
  NOW(),
  NOW()
),
(
  'Priya', 
  'Ramesh', 
  'Sharma', 
  '2011-08-22', 
  '9765432109', 
  7, 
  '456 Park Street, Mumbai, Maharashtra - 400001',
  NOW(),
  NOW()
),
(
  'Amit', 
  'Vijay', 
  'Patel', 
  '2009-03-10', 
  '9654321098', 
  9, 
  '789 Gandhi Nagar, Ahmedabad, Gujarat - 380001',
  NOW(),
  NOW()
);
```

### Step 5: Install Dependencies

```bash
npm install
```

### Step 6: Configure Environment

The application uses Supabase info from `/utils/supabase/info.tsx` which is automatically configured in the Figma Make environment.

For local development, you would need to create this file with your Supabase credentials.

### Step 7: Run the Application

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 🔐 Admin Credentials

**Default Login:**
- **Email**: admin@school.com
- **Password**: admin123

**⚠️ IMPORTANT: Change these credentials immediately after first login!**

## 🔒 How to Change Admin Credentials

### Method 1: Using Supabase Dashboard (Recommended)
1. Log in to your Supabase Dashboard
2. Go to **Authentication** → **Users**
3. Find the admin user (admin@school.com)
4. Click on the user
5. You can:
   - Click "Send Password Recovery" to send a reset email
   - Or manually reset the password using "Reset Password"

### Method 2: Using SQL (Advanced)
If you need to create a new admin or change the email:

```sql
-- Create a new admin user via Supabase Auth
-- Use the Supabase Dashboard → Authentication → Add User interface
-- This is safer than SQL as it handles all the hashing properly
```

### Method 3: Using the Application (Future Enhancement)
You can add a "Change Password" feature in the application settings.

## 📱 Application Usage

### Dashboard
- View key metrics: total students, today's attendance
- Quick links to all major features
- Real-time statistics

### Student Management
1. Click "Add Student" to create a new student
2. Fill in all required fields (marked with *)
3. Upload a student photo (optional, max 5MB)
4. Click "Save" to add the student
5. Use the search bar to find students by name or mobile
6. Filter by class using the dropdown
7. Click edit icon to modify student details
8. Click delete icon to remove a student (with confirmation)

### Mark Attendance
1. Select the date (defaults to today)
2. Choose a class from the dropdown
3. Mark each student as Present or Absent
4. Use "Mark All Present/Absent" for bulk actions
5. Click "Save Attendance" to record
6. View real-time statistics while marking

### Generate Reports
1. Select start and end dates
2. Choose a class filter (or "All Classes")
3. Switch between Student-wise and Class-wise reports
4. View attendance percentages and statistics
5. Click "Export CSV" to download reports

## 📊 CSV Export

Export features include:
- **Student Report CSV**: Full name, class, total days, present days, absent days, percentage
- **Class Report CSV**: Class, total students, records, present/absent counts, percentage
- File naming: Automatically includes date range

## 🎯 API Endpoints (Supabase Auto-Generated)

The application uses Supabase's auto-generated REST API:
- `POST /rest/v1/students` - Create student
- `GET /rest/v1/students` - List students
- `PATCH /rest/v1/students?id=eq.{id}` - Update student
- `DELETE /rest/v1/students?id=eq.{id}` - Delete student
- `POST /rest/v1/attendance` - Create attendance records
- `GET /rest/v1/attendance` - Query attendance

## 🔒 Security Features

- Row Level Security (RLS) on Supabase tables
- JWT-based authentication
- Secure session management
- Protected routes (authentication required)
- Input validation on client and server
- SQL injection prevention (via Supabase)
- File upload restrictions (size, type)

## 📝 Validation Rules

### Student Form
- **First Name**: Required, text
- **Father's Name**: Required, text
- **Surname**: Required, text
- **Date of Birth**: Required, valid date, cannot be in future
- **Mobile Number**: Required, exactly 10 digits, must start with 6-9
- **Photo**: Optional, max 5MB, image files only (JPG, PNG, GIF)
- **Class**: Required, integer 1-12
- **Address**: Required, text

### Attendance
- Must select a date
- Must select a class
- Each student must be marked before saving

### Reports
- Start date must be before end date
- Both dates required
- Date range cannot be in the future

## 🐛 Troubleshooting

### Login Issues
- Ensure admin user is created in Supabase Auth
- Check Supabase project URL and anon key
- Verify email confirmation is enabled or auto-confirmed

### Photo Upload Issues
- Verify storage bucket `attendance-tracker` exists
- Check bucket is set to **public**
- Ensure image is under 5MB
- Supported formats: JPG, PNG, GIF

### Database Connection Issues
- Verify Supabase project is active
- Check database tables are created
- Ensure RLS policies allow authenticated access

### Missing Data
- Run the seed data SQL if no students exist
- Check table permissions in Supabase
- Verify indexes are created for performance

## 📄 License

This is a prototype application created with Figma Make. Not licensed for production use with real student data without proper compliance measures.

## ⚠️ Important Notes

1. **Data Privacy**: This prototype is not configured for handling real student PII in production. Implement proper data protection measures, compliance with local regulations (e.g., FERPA, GDPR), and security audits before production use.

2. **Backup**: Always backup your Supabase database regularly.

3. **Testing**: Test all features thoroughly before using with real data.

4. **Security**: Change default admin credentials immediately.

5. **Storage**: Monitor storage usage for photos in Supabase.

## 🆘 Support

For issues related to:
- **Supabase**: Check [Supabase Documentation](https://supabase.io/docs)
- **React**: Check [React Documentation](https://react.dev)
- **Tailwind CSS**: Check [Tailwind Documentation](https://tailwindcss.com/docs)

## 🎓 Educational Use

This application is designed for:
- School attendance tracking (prototype)
- Learning React and Supabase
- Understanding full-stack development
- Database design and relationships
- Authentication implementation

---

**Built with ❤️ using Figma Make**
