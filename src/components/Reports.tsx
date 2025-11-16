import { useState, useEffect } from 'react';
import { Student, AttendanceRecord, AttendanceReport } from '../lib/types';
import { api } from '../lib/api';
import { getFullName, calculateAttendancePercentage, exportToCSV, formatDate } from '../lib/utils';
import { useClasses } from '../hooks/useClasses';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from 'sonner@2.0.3';
import { Download, FileText, TrendingUp } from 'lucide-react';

export function Reports() {
  const { classes } = useClasses();
  const [students, setStudents] = useState<Student[]>([]);
  const [studentReports, setStudentReports] = useState<AttendanceReport[]>([]);
  const [classReports, setClassReports] = useState<any[]>([]);
  const [schools, setSchools] = useState<string[]>([]);
  const [selectedSchool, setSelectedSchool] = useState('all');
  const [selectedStandard, setSelectedStandard] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadStudents();
    loadSchools();
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      generateReports();
    }
  }, [selectedStandard, selectedSchool, startDate, endDate]);

  const loadStudents = async () => {
    try {
      const data = await api.students.getAll();
      setStudents(data || []);
    } catch (error) {
      console.error('Error loading students:', error);
      toast.error('Failed to load students');
    }
  };

  const loadSchools = async () => {
    try {
      const data = await api.schools.getAll();
      setSchools(data || []);
    } catch (error) {
      console.error('Error loading schools:', error);
    }
  };

  const generateReports = async () => {
    if (!startDate || !endDate) {
      toast.error('Please select both start and end dates');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      toast.error('Start date must be before end date');
      return;
    }

    setLoading(true);
    try {
      // Call reports API
      const standard = selectedStandard !== 'all' ? parseInt(selectedStandard) : undefined;
      const reportData = await api.reports.getAttendance(startDate, endDate, standard, selectedSchool);

      // Map to student reports
      const reports: AttendanceReport[] = reportData.map((record: any) => ({
        studentId: record.studentId,
        firstName: record.firstName,
        fatherName: record.fatherName,
        surname: record.surname,
        standard: record.standard,
        totalDays: record.totalDays,
        presentDays: record.presentDays,
        absentDays: record.absentDays,
        attendancePercentage: record.attendancePercentage,
      }));

      setStudentReports(reports);

      // Generate class-wise reports
      const classMap = new Map<number, { standard: number; totalStudents: number; avgAttendance: number }>();

      reports.forEach((report) => {
        if (!classMap.has(report.standard)) {
          classMap.set(report.standard, {
            standard: report.standard,
            totalStudents: 0,
            avgAttendance: 0,
          });
        }

        const classData = classMap.get(report.standard)!;
        classData.totalStudents++;
        classData.avgAttendance += report.attendancePercentage;
      });

      const classReportsData = Array.from(classMap.values()).map((classData) => ({
        ...classData,
        avgAttendance: classData.totalStudents > 0 ? classData.avgAttendance / classData.totalStudents : 0,
      }));

      setClassReports(classReportsData);
    } catch (error) {
      console.error('Error generating reports:', error);
      toast.error('Failed to generate reports');
    } finally {
      setLoading(false);
    }
  };

  const exportStudentReport = () => {
    if (studentReports.length === 0) {
      toast.error('No data to export');
      return;
    }

    const exportData = studentReports.map((report) => ({
      'Full Name': getFullName(report.firstName, report.fatherName, report.surname),
      'Class': report.standard,
      'Total Days': report.totalDays,
      'Present Days': report.presentDays,
      'Absent Days': report.absentDays,
      'Attendance %': report.attendancePercentage,
    }));

    exportToCSV(exportData, `student-attendance-report-${startDate}-to-${endDate}.csv`);
    toast.success('Report exported successfully');
  };

  const exportClassReport = () => {
    if (classReports.length === 0) {
      toast.error('No data to export');
      return;
    }

    const exportData = classReports.map((report) => ({
      'Class': report.standard,
      'Total Students': report.totalStudents,
      'Average Attendance %': report.avgAttendance,
    }));

    exportToCSV(exportData, `class-attendance-report-${startDate}-to-${endDate}.csv`);
    toast.success('Report exported successfully');
  };

  const getPercentageColor = (percentage: number) => {
    if (percentage >= 75) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Attendance Reports</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Class Filter</Label>
              <Select value={selectedStandard} onValueChange={setSelectedStandard}>
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.standard.toString()}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>School Filter</Label>
              <Select value={selectedSchool} onValueChange={setSelectedSchool}>
                <SelectTrigger>
                  <SelectValue placeholder="Select school" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Schools</SelectItem>
                  {schools.map((school) => (
                    <SelectItem key={school} value={school}>
                      {school}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {!startDate || !endDate ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 mx-auto text-gray-400 mb-2" />
              <p className="text-gray-500">Please select date range to generate reports</p>
            </div>
          ) : loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Generating reports...</p>
            </div>
          ) : (
            <Tabs defaultValue="student" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="student">Student-wise Report</TabsTrigger>
                <TabsTrigger value="class">Class-wise Report</TabsTrigger>
              </TabsList>

              <TabsContent value="student" className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-600">
                    {studentReports.length} student{studentReports.length !== 1 ? 's' : ''} found
                  </p>
                  <Button onClick={exportStudentReport} disabled={studentReports.length === 0}>
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                </div>

                {studentReports.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No attendance data found for selected filters</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b bg-gray-50">
                          <th className="text-left p-3">Student Name</th>
                          <th className="text-left p-3">Class</th>
                          <th className="text-center p-3">Total Days</th>
                          <th className="text-center p-3">Present</th>
                          <th className="text-center p-3">Absent</th>
                          <th className="text-center p-3">Attendance %</th>
                        </tr>
                      </thead>
                      <tbody>
                        {studentReports.map((report) => (
                          <tr key={report.studentId} className="border-b hover:bg-gray-50">
                            <td className="p-3">
                              {getFullName(report.firstName, report.fatherName, report.surname)}
                            </td>
                            <td className="p-3">{report.standard}</td>
                            <td className="text-center p-3">{report.totalDays}</td>
                            <td className="text-center p-3 text-green-600">{report.presentDays}</td>
                            <td className="text-center p-3 text-red-600">{report.absentDays}</td>
                            <td className={`text-center p-3 ${getPercentageColor(report.attendancePercentage)}`}>
                              {report.attendancePercentage}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="class" className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-600">
                    {classReports.length} class{classReports.length !== 1 ? 'es' : ''} found
                  </p>
                  <Button onClick={exportClassReport} disabled={classReports.length === 0}>
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                </div>

                {classReports.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No attendance data found for selected filters</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {classReports.map((report) => (
                      <Card key={report.standard}>
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between">
                            <span>Class {report.standard}</span>
                            <TrendingUp className={`w-5 h-5 ${getPercentageColor(report.avgAttendance)}`} />
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Total Students:</span>
                            <span>{report.totalStudents}</span>
                          </div>
                          <div className="pt-2 border-t">
                            <div className="flex justify-between items-center">
                              <span>Attendance:</span>
                              <span className={`text-xl ${getPercentageColor(report.avgAttendance)}`}>
                                {report.avgAttendance}%
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}