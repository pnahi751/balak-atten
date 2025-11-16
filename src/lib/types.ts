// Type definitions for the Student Attendance Tracker

export interface Student {
  id: string;
  firstName: string;
  fatherName: string;
  surname: string;
  dateOfBirth: string;
  mobileNumber: string;
  studentPhoto?: string;
  standard: number;
  address: string;
  school: string;
  createdAt: string;
}

export interface Attendance {
  id: string;
  studentId: string;
  date: string;
  status: 'present' | 'absent';
  standard: number;
  createdAt: string;
}

export interface AttendanceRecord extends Attendance {
  student?: Student;
}

export interface DashboardStats {
  totalStudents: number;
  todayPresent: number;
  todayAbsent: number;
  todayTotal: number;
}

export interface AttendanceReport {
  studentId: string;
  firstName: string;
  fatherName: string;
  surname: string;
  standard: number;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  attendancePercentage: number;
}