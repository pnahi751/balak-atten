import { useState, useEffect } from 'react';
import { Student } from '../lib/types';
import { api } from '../lib/api';
import { getFullName, formatDate, exportToCSV } from '../lib/utils';
import { useClasses } from '../hooks/useClasses';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { StudentForm } from './StudentForm';
import { toast } from 'sonner@2.0.3';
import { Search, Plus, Edit, Trash2, User, MessageCircle, Download } from 'lucide-react';

export function StudentList() {
  const { classes } = useClasses();
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [schools, setSchools] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSchool, setSelectedSchool] = useState('all');
  const [selectedStandard, setSelectedStandard] = useState('all');
  const [formOpen, setFormOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStudents();
    loadSchools();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [students, searchTerm, selectedSchool, selectedStandard]);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const data = await api.students.getAll();
      setStudents(data || []);
    } catch (error) {
      console.error('Error loading students:', error);
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
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

  const filterStudents = () => {
    let filtered = students;

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (student) =>
          student.firstName.toLowerCase().includes(term) ||
          student.fatherName.toLowerCase().includes(term) ||
          student.surname.toLowerCase().includes(term) ||
          student.mobileNumber.includes(term) ||
          (student.school && student.school.toLowerCase().includes(term))
      );
    }

    // Filter by school
    if (selectedSchool !== 'all') {
      filtered = filtered.filter((student) => student.school === selectedSchool);
    }

    // Filter by standard
    if (selectedStandard !== 'all') {
      filtered = filtered.filter((student) => student.standard === parseInt(selectedStandard));
    }

    setFilteredStudents(filtered);
  };

  const handleExportAll = () => {
    if (filteredStudents.length === 0) {
      toast.error('No students to export');
      return;
    }

    const exportData = filteredStudents.map((student) => ({
      'Full Name': getFullName(student.firstName, student.fatherName, student.surname),
      'Date of Birth': formatDate(student.dateOfBirth),
      'Mobile Number': student.mobileNumber,
      'Class': student.standard,
      'School': student.school || '',
      'Address': student.address,
    }));

    const filename = selectedSchool !== 'all' 
      ? `students-${selectedSchool.replace(/\s+/g, '-')}.csv`
      : 'all-students.csv';

    exportToCSV(exportData, filename);
    toast.success(`Exported ${filteredStudents.length} students successfully`);
  };

  const handleEdit = (student: Student) => {
    setSelectedStudent(student);
    setFormOpen(true);
  };

  const handleDelete = (student: Student) => {
    setStudentToDelete(student);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!studentToDelete) return;

    try {
      await api.students.delete(studentToDelete.id);
      toast.success('Student deleted successfully');
      loadStudents();
    } catch (error) {
      console.error('Error deleting student:', error);
      toast.error('Failed to delete student');
    } finally {
      setDeleteDialogOpen(false);
      setStudentToDelete(null);
    }
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setSelectedStudent(null);
  };

  const handleFormSave = () => {
    loadStudents();
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle>Student Management</CardTitle>
            <Button onClick={() => setFormOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Student
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search by name or mobile..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedSchool} onValueChange={setSelectedSchool}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Filter by school" />
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
            <Select value={selectedStandard} onValueChange={setSelectedStandard}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Filter by class" />
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
            <Button
              size="sm"
              variant="outline"
              onClick={handleExportAll}
              title="Export to CSV"
            >
              <Download className="w-4 h-4" />
            </Button>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading students...</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredStudents.length === 0 && (
            <div className="text-center py-8">
              <User className="w-12 h-12 mx-auto text-gray-400 mb-2" />
              <p className="text-gray-500">No students found</p>
              {searchTerm || selectedSchool !== 'all' || selectedStandard !== 'all' ? (
                <Button
                  variant="link"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedSchool('all');
                    setSelectedStandard('all');
                  }}
                >
                  Clear filters
                </Button>
              ) : (
                <Button variant="link" onClick={() => setFormOpen(true)}>
                  Add your first student
                </Button>
              )}
            </div>
          )}

          {/* Student List */}
          {!loading && filteredStudents.length > 0 && (
            <>
              <div className="space-y-4">
                {filteredStudents.map((student) => (
                  <div
                    key={student.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition"
                  >
                    {/* Photo */}
                    <div className="flex-shrink-0">
                      {student.studentPhoto ? (
                        <img
                          src={student.studentPhoto}
                          alt={getFullName(student.firstName, student.fatherName, student.surname)}
                          className="w-16 h-16 rounded-lg object-cover border-2 border-gray-200"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center">
                          <User className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Student Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="truncate">
                        {getFullName(student.firstName, student.fatherName, student.surname)}
                      </h3>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-1">
                        <span>Class {student.standard}</span>
                        <span>DOB: {formatDate(student.dateOfBirth)}</span>
                        <span>Mobile: {student.mobileNumber}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(`https://wa.me/91${student.mobileNumber}`, '_blank')}
                        title="WhatsApp"
                      >
                        <MessageCircle className="w-4 h-4 text-green-600" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(student)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(student)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Student Form Dialog */}
      <StudentForm
        student={selectedStudent}
        open={formOpen}
        onClose={handleFormClose}
        onSave={handleFormSave}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Student</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {studentToDelete && getFullName(studentToDelete.firstName, studentToDelete.fatherName, studentToDelete.surname)}?
              This action cannot be undone and will also delete all attendance records for this student.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}