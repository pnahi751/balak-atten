# Quick Start Guide

Get your Student Attendance Tracker up and running in 10 minutes! ⚡

## ⏱️ 10-Minute Setup

### 1️⃣ Supabase Setup (5 minutes)

#### A. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Click **"New Project"**
4. Name: `student-attendance`
5. Database Password: (save this somewhere safe)
6. Region: Choose closest to you
7. Click **"Create new project"** (takes ~2 minutes)

#### B. Run Database Script
1. In Supabase Dashboard, click **"SQL Editor"**
2. Click **"New Query"**
3. Copy the entire contents from `/DATABASE_SETUP.md` (the big SQL script)
4. Paste into the editor
5. Click **"Run"** (green play button)
6. Wait for success message ✅

#### C. Create Storage Bucket
1. Click **"Storage"** in left sidebar
2. Click **"New bucket"**
3. Name: `attendance-tracker`
4. Check ✅ **"Public bucket"**
5. Click **"Create bucket"**

#### D. Create Admin User
1. Click **"Authentication"** in left sidebar
2. Click **"Users"** tab
3. Click **"Add user"** → **"Create new user"**
4. Email: `admin@school.com`
5. Password: `admin123`
6. Check ✅ **"Auto Confirm User"**
7. Click **"Create user"**

### 2️⃣ Application Setup (5 minutes)

#### A. Install Dependencies
```bash
npm install
```

#### B. Run the Application
```bash
npm run dev
```

#### C. Login
1. Open browser to `http://localhost:3000`
2. Login with:
   - Email: `admin@school.com`
   - Password: `admin123`

### 3️⃣ First Steps in the App

#### Add Your First Student
1. Click **"Students"** in the navigation
2. Click **"Add Student"** button
3. Fill in the form:
   - First Name: `Rahul`
   - Father's Name: `Rajesh`
   - Surname: `Sharma`
   - Date of Birth: `2010-01-15`
   - Mobile: `9876543210`
   - Class: `8`
   - Address: `123 Main Street, Mumbai`
4. Optionally upload a photo
5. Click **"Add Student"**

#### Mark Attendance
1. Click **"Attendance"** in the navigation
2. Date is already set to today
3. Select **"Class 8"**
4. Click **"Present"** for the student you just added
5. Click **"Save Attendance"**

#### View Reports
1. Click **"Reports"** in the navigation
2. Set Start Date: One week ago
3. Set End Date: Today
4. Select **"Class 8"**
5. View the attendance percentage
6. Click **"Export CSV"** to download

## 🎉 Done!

You now have a fully functional attendance tracker!

## 🚀 Next Steps

### Add More Students

You can:
- Add students manually one by one
- Or run the seed data script from `DATABASE_SETUP.md` to add 5 sample students instantly

To add sample students:
1. Go to Supabase Dashboard → SQL Editor
2. Run the "Seed Data" section from `DATABASE_SETUP.md`

### Customize Your Setup

- **Change Admin Password**: See main README.md
- **Add Student Photos**: Click edit on any student and upload
- **Bulk Mark Attendance**: Use "Mark All Present" button
- **Export Data**: Use CSV export in Reports section

## 📱 Mobile Usage

The app is fully responsive! Just:
1. Open on your phone browser
2. Login with same credentials
3. Use the hamburger menu (☰) to navigate

## 🔐 Security Reminder

**⚠️ IMPORTANT**: Change the default admin password!

1. Go to Supabase Dashboard
2. Authentication → Users
3. Click on admin@school.com
4. Send password recovery or reset password
5. Or create a new admin user with different credentials

## 🆘 Common Issues

### "Cannot connect to database"
- ✅ Check Supabase project is active
- ✅ Verify you ran the database setup script
- ✅ Wait 2-3 minutes if you just created the project

### "Login failed"
- ✅ Check admin user was created in Authentication
- ✅ Verify "Auto Confirm User" was checked
- ✅ Use exact credentials: `admin@school.com` / `admin123`

### "Photo upload failed"
- ✅ Check storage bucket `attendance-tracker` exists
- ✅ Verify bucket is set to **Public**
- ✅ Image must be under 5MB
- ✅ Only JPG, PNG, GIF formats

### "Cannot mark attendance"
- ✅ Make sure you have students in that class
- ✅ Check you're logged in
- ✅ Verify date is not in the future

## 📊 Sample Workflow

Here's a typical daily workflow:

### Morning (9:00 AM)
1. Login to the system
2. Go to Attendance
3. Select today's date
4. Select Class 8
5. Mark all students (Present/Absent)
6. Save attendance
7. Repeat for other classes

### End of Week
1. Go to Reports
2. Set date range: Monday to Friday
3. Select "All Classes"
4. Review attendance percentages
5. Export CSV for records

### End of Month
1. Generate monthly reports
2. Identify students with low attendance (<75%)
3. Export reports for principal/parents
4. Archive data if needed

## 🎯 Pro Tips

1. **Use Search**: Quickly find students by typing name or mobile
2. **Bulk Actions**: Use "Mark All Present" as default, then change individual absences
3. **Filter by Class**: Focus on one class at a time
4. **Export Regularly**: Keep CSV backups of attendance data
5. **Mobile First**: Mark attendance on tablet/phone while in class
6. **Quick Links**: Use dashboard quick links to jump to features
7. **Real-time Stats**: Dashboard shows today's attendance instantly

## 📸 Screenshots Reference

### Dashboard View
- Total students count
- Today's present/absent
- Quick action cards

### Student List View
- Photo thumbnails
- Search bar
- Filter by class
- Edit/Delete buttons

### Attendance View
- Date and class selector
- Student list with photos
- Present/Absent toggle buttons
- Live statistics
- Save button

### Reports View
- Date range selector
- Student-wise table
- Class-wise cards
- Export CSV button
- Color-coded percentages

## 🔄 Data Management

### Backup Your Data
```sql
-- In Supabase SQL Editor, export data:
COPY students TO '/tmp/students_backup.csv' CSV HEADER;
COPY attendance TO '/tmp/attendance_backup.csv' CSV HEADER;
```

Or use the CSV export feature in Reports section.

### Import Bulk Students
Prepare a CSV file with columns:
- firstName, fatherName, surname, dateOfBirth, mobileNumber, standard, address

Then use Supabase Dashboard → Table Editor → Insert → Import CSV

## 📞 Support

- **Database Issues**: Check `DATABASE_SETUP.md`
- **Feature Usage**: Check main `README.md`
- **Supabase Help**: [supabase.com/docs](https://supabase.com/docs)

## ✅ Checklist

Before going live, make sure you've done:

- [ ] Created Supabase project
- [ ] Run database setup script
- [ ] Created storage bucket (public)
- [ ] Created admin user
- [ ] Tested login
- [ ] Added at least one test student
- [ ] Marked test attendance
- [ ] Viewed reports
- [ ] Exported CSV
- [ ] **Changed default admin password**
- [ ] Tested on mobile device

## 🎓 You're Ready!

Your attendance tracker is now fully operational. Start adding your actual students and marking daily attendance!

---

**Questions?** Refer to the detailed README.md for comprehensive documentation.

**Happy tracking! 📚✨**
