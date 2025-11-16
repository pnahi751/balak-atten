import { useState, useEffect } from 'react';
import { Student, Attendance } from '../lib/types';
import { api } from '../lib/api';
import { getFullName, getTodayDate } from '../lib/utils';
import { useClasses } from '../hooks/useClasses';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner@2.0.3';
import { CheckCircle, XCircle, Save, User } from 'lucide-react';

export function AttendanceManager() {
  const { classes } = useClasses();
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Record<string, 'present' | 'absent'>>({});
  const [schools, setSchools] = useState<string[]>([]);
  const [selectedSchool, setSelectedSchool] = useState('all');
  const [selectedStandard, setSelectedStandard] = useState('all');
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadStudentsAndAttendance();
    loadSchools();
  }, [selectedStandard, selectedDate]);

  const loadSchools = async () => {
    try {
      const data = await api.schools.getAll();
      setSchools(data || []);
    } catch (error) {
      console.error('Error loading schools:', error);
    }
  };

  const loadStudentsAndAttendance = async () => {
    setLoading(true);
    try {
      // Load students with attendance for selected date and standard
      const standard = selectedStandard === 'all' ? undefined : parseInt(selectedStandard);
      const data = await api.attendance.getByDate(selectedDate, standard);
      
      setStudents(data || []);

      // Map existing attendance
      const attendanceMap: Record<string, 'present' | 'absent'> = {};
      data?.forEach((record: any) => {
        if (record.status) {
          attendanceMap[record.id] = record.status;
        }
      });
      setAttendance(attendanceMap);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  };

  const toggleAttendance = (studentId: string, status: 'present' | 'absent') => {
    setAttendance({ ...attendance, [studentId]: status });
  };

  const markAllPresent = () => {
    const newAttendance: Record<string, 'present' | 'absent'> = {};
    students.forEach((student) => {
      newAttendance[student.id] = 'present';
    });
    setAttendance(newAttendance);
  };

  const markAllAbsent = () => {
    const newAttendance: Record<string, 'present' | 'absent'> = {};
    students.forEach((student) => {
      newAttendance[student.id] = 'absent';
    });
    setAttendance(newAttendance);
  };

  const saveAttendance = async () => {
    setSaving(true);
    try {
      // Prepare bulk attendance records
      const records = Object.entries(attendance).map(([studentId, status]) => ({
        studentId,
        date: selectedDate,
        status,
      }));

      if (records.length > 0) {
        await api.attendance.bulkMark(records);
        toast.success('Attendance saved successfully');
      } else {
        toast.error('No attendance records to save');
      }
    } catch (error) {
      console.error('Error saving attendance:', error);
      toast.error('Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  const getAttendanceStats = () => {
    const marked = Object.keys(attendance).length;
    const present = Object.values(attendance).filter((s) => s === 'present').length;
    const absent = Object.values(attendance).filter((s) => s === 'absent').length;
    return { marked, present, absent, total: students.length };
  };

  const stats = getAttendanceStats();

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Mark Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="space-y-2">
              <Label>Select Date</Label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                max={getTodayDate()}
              />
            </div>
            <div className="space-y-2">
              <Label>Select Class</Label>
              <Select value={selectedStandard} onValueChange={setSelectedStandard}>
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem key="all" value="all">
                    All Classes
                  </SelectItem>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.standard.toString()}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Stats */}
          {students.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-600">Total Students</p>
                <p className="text-2xl text-blue-900">{stats.total}</p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-sm text-green-600">Present</p>
                <p className="text-2xl text-green-900">{stats.present}</p>
              </div>
              <div className="bg-red-50 p-3 rounded-lg">
                <p className="text-sm text-red-600">Absent</p>
                <p className="text-2xl text-red-900">{stats.absent}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">Marked</p>
                <p className="text-2xl text-gray-900">
                  {stats.marked}/{stats.total}
                </p>
              </div>
            </div>
          )}

          {/* Bulk Actions */}
          {students.length > 0 && (
            <div className="flex gap-2 mb-6">
              <Button size="sm" variant="outline" onClick={markAllPresent}>
                <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                Mark All Present
              </Button>
              <Button size="sm" variant="outline" onClick={markAllAbsent}>
                <XCircle className="w-4 h-4 mr-2 text-red-600" />
                Mark All Absent
              </Button>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading students...</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && students.length === 0 && (
            <div className="text-center py-8">
              <User className="w-12 h-12 mx-auto text-gray-400 mb-2" />
              <p className="text-gray-500">No students found in Class {selectedStandard}</p>
            </div>
          )}

          {/* Student List */}
          {!loading && students.length > 0 && (
            <>
              <div className="space-y-3 mb-6">
                {students.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition"
                  >
                    {/* Photo */}
                    <div className="flex-shrink-0">
                      {student.studentPhoto ? (
                        <img
                          src={student.studentPhoto}
                          alt={getFullName(student.firstName, student.fatherName, student.surname)}
                          className="w-12 h-12 rounded-lg object-cover border-2 border-gray-200"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center">
                          <User className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Student Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="truncate">
                        {getFullName(student.firstName, student.fatherName, student.surname)}
                      </h3>
                      <p className="text-sm text-gray-600">Roll No: {student.mobileNumber}</p>
                    </div>

                    {/* Attendance Buttons */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={attendance[student.id] === 'present' ? 'default' : 'outline'}
                        className={attendance[student.id] === 'present' ? 'bg-green-600 hover:bg-green-700' : ''}
                        onClick={() => toggleAttendance(student.id, 'present')}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Present
                      </Button>
                      <Button
                        size="sm"
                        variant={attendance[student.id] === 'absent' ? 'default' : 'outline'}
                        className={attendance[student.id] === 'absent' ? 'bg-red-600 hover:bg-red-700' : ''}
                        onClick={() => toggleAttendance(student.id, 'absent')}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Absent
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Save Button */}
              <div className="flex justify-end">
                <Button
                  onClick={saveAttendance}
                  disabled={saving || Object.keys(attendance).length === 0}
                  size="lg"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Attendance'}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}