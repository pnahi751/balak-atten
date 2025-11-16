// src/lib/attendance.ts
import { supabase } from './supabase';

export async function fetchStudents() {
  const { data, error } = await supabase.from('students').select('*');
  if (error) throw error;
  return data;
}

export async function addAttendanceEntry(student_id: number, date: string, present: boolean) {
  const { data, error } = await supabase.from('attendance').insert([{ student_id, date, present }]);
  if (error) throw error;
  return data;
}
