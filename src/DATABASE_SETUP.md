# Database Setup Guide

This guide will help you set up the complete database schema for the Student Attendance Tracker application in Supabase.

## 📋 Prerequisites

- A Supabase account (free tier works fine)
- Access to Supabase SQL Editor
- Basic understanding of PostgreSQL

## 🗃️ Database Schema

### Entity Relationship Diagram

```
┌─────────────────┐         ┌──────────────────┐
│    students     │         │    attendance    │
├─────────────────┤         ├──────────────────┤
│ id (PK)         │◄────────│ studentId (FK)   │
│ firstName       │         │ id (PK)          │
│ fatherName      │         │ date             │
│ surname         │         │ status           │
│ dateOfBirth     │         │ standard         │
│ mobileNumber    │         │ createdAt        │
│ studentPhoto    │         └──────────────────┘
│ standard        │
│ address         │
│ createdAt       │
│ updatedAt       │
└─────────────────┘
```

## 🚀 Step-by-Step Setup

### Step 1: Access Supabase SQL Editor

1. Log in to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Click on "SQL Editor" in the left sidebar
4. Click "New Query"

### Step 2: Create Tables

Copy and paste the following SQL script into the SQL Editor and click "Run":

```sql
-- ============================================
-- STUDENT ATTENDANCE TRACKER DATABASE SCHEMA
-- ============================================

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. CREATE STUDENTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS students (
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
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_mobile CHECK ("mobileNumber" ~ '^[6-9][0-9]{9}$'),
  CONSTRAINT valid_dob CHECK ("dateOfBirth" <= CURRENT_DATE)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_students_standard ON students(standard);
CREATE INDEX IF NOT EXISTS idx_students_mobile ON students("mobileNumber");
CREATE INDEX IF NOT EXISTS idx_students_created ON students("createdAt" DESC);

-- Add comments for documentation
COMMENT ON TABLE students IS 'Stores student information including personal details and contact information';
COMMENT ON COLUMN students.id IS 'Unique identifier for each student';
COMMENT ON COLUMN students."firstName" IS 'Student first name';
COMMENT ON COLUMN students."fatherName" IS 'Father or guardian name';
COMMENT ON COLUMN students.surname IS 'Family surname';
COMMENT ON COLUMN students."dateOfBirth" IS 'Date of birth';
COMMENT ON COLUMN students."mobileNumber" IS 'Contact mobile number (Indian format: 10 digits starting with 6-9)';
COMMENT ON COLUMN students."studentPhoto" IS 'URL to student photo in Supabase storage';
COMMENT ON COLUMN students.standard IS 'Class/Grade (1-12)';
COMMENT ON COLUMN students.address IS 'Complete residential address';

-- ============================================
-- 2. CREATE ATTENDANCE TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "studentId" UUID NOT NULL,
  date DATE NOT NULL,
  status VARCHAR(10) NOT NULL CHECK (status IN ('present', 'absent')),
  standard INTEGER NOT NULL CHECK (standard >= 1 AND standard <= 12),
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Foreign key constraint
  CONSTRAINT fk_student FOREIGN KEY ("studentId") 
    REFERENCES students(id) 
    ON DELETE CASCADE,
  
  -- Unique constraint: One attendance record per student per day
  CONSTRAINT unique_student_date UNIQUE("studentId", date)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date DESC);
CREATE INDEX IF NOT EXISTS idx_attendance_student ON attendance("studentId");
CREATE INDEX IF NOT EXISTS idx_attendance_standard ON attendance(standard);
CREATE INDEX IF NOT EXISTS idx_attendance_status ON attendance(status);
CREATE INDEX IF NOT EXISTS idx_attendance_date_standard ON attendance(date, standard);

-- Add comments for documentation
COMMENT ON TABLE attendance IS 'Stores daily attendance records for all students';
COMMENT ON COLUMN attendance.id IS 'Unique identifier for each attendance record';
COMMENT ON COLUMN attendance."studentId" IS 'Reference to student (FK)';
COMMENT ON COLUMN attendance.date IS 'Date of attendance';
COMMENT ON COLUMN attendance.status IS 'Attendance status: present or absent';
COMMENT ON COLUMN attendance.standard IS 'Class/Grade for quick filtering';

-- ============================================
-- 3. CREATE TRIGGERS FOR AUTO-UPDATE
-- ============================================

-- Function to automatically update updatedAt timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function before UPDATE on students
DROP TRIGGER IF EXISTS set_updated_at ON students;
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON students
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 4. ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on students table
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Enable RLS on attendance table
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 5. CREATE RLS POLICIES
-- ============================================

-- Policy: Allow authenticated users to read all students
DROP POLICY IF EXISTS "Allow authenticated read students" ON students;
CREATE POLICY "Allow authenticated read students" ON students
    FOR SELECT
    TO authenticated
    USING (true);

-- Policy: Allow authenticated users to insert students
DROP POLICY IF EXISTS "Allow authenticated insert students" ON students;
CREATE POLICY "Allow authenticated insert students" ON students
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Policy: Allow authenticated users to update students
DROP POLICY IF EXISTS "Allow authenticated update students" ON students;
CREATE POLICY "Allow authenticated update students" ON students
    FOR UPDATE
    TO authenticated
    USING (true);

-- Policy: Allow authenticated users to delete students
DROP POLICY IF EXISTS "Allow authenticated delete students" ON students;
CREATE POLICY "Allow authenticated delete students" ON students
    FOR DELETE
    TO authenticated
    USING (true);

-- Policy: Allow authenticated users to read all attendance
DROP POLICY IF EXISTS "Allow authenticated read attendance" ON attendance;
CREATE POLICY "Allow authenticated read attendance" ON attendance
    FOR SELECT
    TO authenticated
    USING (true);

-- Policy: Allow authenticated users to insert attendance
DROP POLICY IF EXISTS "Allow authenticated insert attendance" ON attendance;
CREATE POLICY "Allow authenticated insert attendance" ON attendance
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Policy: Allow authenticated users to update attendance
DROP POLICY IF EXISTS "Allow authenticated update attendance" ON attendance;
CREATE POLICY "Allow authenticated update attendance" ON attendance
    FOR UPDATE
    TO authenticated
    USING (true);

-- Policy: Allow authenticated users to delete attendance
DROP POLICY IF EXISTS "Allow authenticated delete attendance" ON attendance;
CREATE POLICY "Allow authenticated delete attendance" ON attendance
    FOR DELETE
    TO authenticated
    USING (true);

-- ============================================
-- SETUP COMPLETE
-- ============================================

-- Verify tables were created
DO $$
BEGIN
    RAISE NOTICE 'Database setup complete!';
    RAISE NOTICE 'Tables created: students, attendance';
    RAISE NOTICE 'Row Level Security: ENABLED';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '  1. Create storage bucket: attendance-tracker';
    RAISE NOTICE '  2. Create admin user in Authentication';
    RAISE NOTICE '  3. Run seed data (optional)';
END $$;
```

### Step 3: Verify Tables

Run this query to verify your tables were created successfully:

```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('students', 'attendance');

-- Check students table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'students' 
ORDER BY ordinal_position;

-- Check attendance table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'attendance' 
ORDER BY ordinal_position;
```

### Step 4: Create Storage Bucket

1. Go to **Storage** in the left sidebar
2. Click **"New bucket"**
3. Name: `attendance-tracker`
4. **Public bucket**: ✅ (checked)
5. Click **"Create bucket"**

### Step 5: Configure Storage Policies

The bucket needs to allow authenticated users to upload and access files:

```sql
-- Storage policies are managed in the Storage section of Supabase Dashboard
-- Go to Storage → attendance-tracker → Policies
-- Create these policies via the UI:

-- 1. Allow authenticated uploads
-- Name: "Allow authenticated uploads"
-- Policy: authenticated users can INSERT
-- Target: objects in bucket

-- 2. Allow public read access
-- Name: "Allow public read"
-- Policy: public can SELECT
-- Target: objects in bucket

-- 3. Allow authenticated delete
-- Name: "Allow authenticated delete"
-- Policy: authenticated users can DELETE their own objects
-- Target: objects in bucket
```

Or use SQL (advanced):

```sql
-- Note: Storage policies are typically managed via Supabase Dashboard
-- These are reference commands and may need adjustment

-- Allow authenticated users to upload
CREATE POLICY "Allow authenticated uploads" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'attendance-tracker');

-- Allow public to view
CREATE POLICY "Allow public read" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'attendance-tracker');

-- Allow authenticated users to delete
CREATE POLICY "Allow authenticated delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'attendance-tracker');
```

## 🌱 Seed Data (Optional)

Add sample students to test the application:

```sql
-- ============================================
-- SEED DATA - SAMPLE STUDENTS
-- ============================================

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
-- Student 1
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
-- Student 2
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
-- Student 3
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
),
-- Student 4
(
  'Sneha',
  'Mahesh',
  'Reddy',
  '2010-11-28',
  '9123456789',
  8,
  '234 Lake View, Hyderabad, Telangana - 500001',
  NOW(),
  NOW()
),
-- Student 5
(
  'Arjun',
  'Prakash',
  'Singh',
  '2012-02-14',
  '9234567890',
  6,
  '567 Ring Road, Delhi - 110001',
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- Verify seed data
SELECT 
  id,
  "firstName",
  "fatherName",
  surname,
  standard,
  "mobileNumber"
FROM students
ORDER BY standard, "firstName";
```

## 📊 Useful Queries

### Check Student Count by Class

```sql
SELECT 
  standard as "Class",
  COUNT(*) as "Total Students"
FROM students
GROUP BY standard
ORDER BY standard;
```

### View Recent Attendance

```sql
SELECT 
  a.date,
  a.standard as "Class",
  COUNT(*) as "Total Marked",
  SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as "Present",
  SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END) as "Absent"
FROM attendance a
GROUP BY a.date, a.standard
ORDER BY a.date DESC, a.standard
LIMIT 10;
```

### Student Attendance Report

```sql
SELECT 
  s."firstName" || ' ' || s."fatherName" || ' ' || s.surname as "Student Name",
  s.standard as "Class",
  COUNT(a.id) as "Total Days",
  SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as "Present",
  SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END) as "Absent",
  ROUND(
    (SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END)::NUMERIC / 
     COUNT(a.id)::NUMERIC * 100), 
    2
  ) as "Attendance %"
FROM students s
LEFT JOIN attendance a ON s.id = a."studentId"
GROUP BY s.id, s."firstName", s."fatherName", s.surname, s.standard
ORDER BY "Attendance %" DESC;
```

## 🔧 Maintenance Queries

### Delete All Attendance Records

```sql
-- WARNING: This will delete ALL attendance data
-- TRUNCATE attendance;
DELETE FROM attendance;
```

### Delete All Students (and their attendance)

```sql
-- WARNING: This will delete ALL students and attendance data
-- CASCADE will automatically delete related attendance records
-- TRUNCATE students CASCADE;
DELETE FROM students;
```

### Reset Auto-increment IDs (if needed)

```sql
-- Note: Using UUID, so this is not typically needed
-- But if you need to reset the sequence for any reason:
-- ALTER SEQUENCE students_id_seq RESTART WITH 1;
-- ALTER SEQUENCE attendance_id_seq RESTART WITH 1;
```

## 🔍 Troubleshooting

### Issue: Cannot insert into students table

**Solution**: Check RLS policies are created and user is authenticated

```sql
-- Verify RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('students', 'attendance');

-- Check existing policies
SELECT * FROM pg_policies 
WHERE tablename IN ('students', 'attendance');
```

### Issue: Foreign key constraint violation

**Solution**: Ensure student exists before creating attendance record

```sql
-- Check if student exists
SELECT id FROM students WHERE id = 'STUDENT_UUID_HERE';
```

### Issue: Duplicate attendance record

**Solution**: The unique constraint prevents duplicate records. Update existing record instead:

```sql
-- Use upsert pattern
INSERT INTO attendance ("studentId", date, status, standard, "createdAt")
VALUES ('STUDENT_ID', '2024-01-15', 'present', 8, NOW())
ON CONFLICT ("studentId", date) 
DO UPDATE SET status = EXCLUDED.status;
```

## 📈 Performance Tips

1. **Indexes are already created** for common query patterns
2. **Use pagination** when fetching large student lists
3. **Filter by standard** when querying attendance
4. **Use date ranges** to limit attendance queries
5. **Archive old data** periodically (optional)

## 🔐 Security Checklist

- ✅ Row Level Security enabled
- ✅ RLS policies created for authenticated users
- ✅ Foreign key constraints in place
- ✅ Check constraints for data validation
- ✅ Unique constraints to prevent duplicates
- ✅ Storage bucket policies configured

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Row Level Security Guide](https://supabase.io/docs/guides/auth/row-level-security)

---

**Database setup complete! 🎉**

Next: Return to the main README.md for application setup instructions.
