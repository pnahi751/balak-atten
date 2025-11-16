import { useState, useEffect } from 'react';
import { Student } from '../lib/types';
import { api } from '../lib/api';
import { validateIndianMobile } from '../lib/utils';
import { useClasses } from '../hooks/useClasses';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { toast } from 'sonner@2.0.3';
import { Upload, X } from 'lucide-react';

interface StudentFormProps {
  student: Student | null;
  open: boolean;
  onClose: () => void;
  onSave: () => void;
}

export function StudentForm({ student, open, onClose, onSave }: StudentFormProps) {
  const { classes } = useClasses();
  const [formData, setFormData] = useState({
    firstName: '',
    fatherName: '',
    surname: '',
    dateOfBirth: '',
    mobileNumber: '',
    standard: '',
    address: '',
    school: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (student) {
      setFormData({
        firstName: student.firstName,
        fatherName: student.fatherName || '',
        surname: student.surname,
        dateOfBirth: student.dateOfBirth,
        mobileNumber: student.mobileNumber,
        standard: student.standard.toString(),
        address: student.address || '',
        school: student.school || '',
      });
      if (student.studentPhoto) {
        setPhotoPreview(student.studentPhoto);
      }
    } else {
      setFormData({
        firstName: '',
        fatherName: '',
        surname: '',
        dateOfBirth: '',
        mobileNumber: '',
        standard: '',
        address: '',
        school: '',
      });
      setPhotoPreview(null);
    }
    setErrors({});
    setPhotoFile(null);
  }, [student, open]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ ...errors, photo: 'Image size must be less than 5MB' });
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors({ ...errors, photo: 'Please select a valid image file' });
        return;
      }

      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
      setErrors({ ...errors, photo: '' });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.fatherName.trim()) newErrors.fatherName = "Father's name is required";
    if (!formData.surname.trim()) newErrors.surname = 'Surname is required';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = 'Mobile number is required';
    } else if (!validateIndianMobile(formData.mobileNumber)) {
      newErrors.mobileNumber = 'Invalid Indian mobile number (10 digits starting with 6-9)';
    }
    if (!formData.address.trim()) newErrors.address = 'Address is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the form errors');
      return;
    }

    setUploading(true);

    try {
      let photoUrl = student?.studentPhoto || null;

      // Upload photo if a new one was selected
      if (photoFile) {
        // Convert file to base64
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(photoFile);
        });
        
        const base64Data = await base64Promise;
        
        // Upload to server
        const uploadResult = await api.uploadPhoto(
          photoFile.name,
          base64Data,
          student?.id
        );
        
        photoUrl = uploadResult.url;
      }

      const studentData = {
        firstName: formData.firstName.trim(),
        fatherName: formData.fatherName.trim(),
        surname: formData.surname.trim(),
        dateOfBirth: formData.dateOfBirth,
        mobileNumber: formData.mobileNumber.trim(),
        standard: parseInt(formData.standard),
        address: formData.address.trim(),
        studentPhoto: photoUrl,
        school: formData.school.trim(),
      };

      if (student) {
        // Update existing student
        await api.students.update(student.id, studentData);
        toast.success('Student updated successfully');
      } else {
        // Create new student
        await api.students.create(studentData);
        toast.success('Student added successfully');
      }

      onSave();
      onClose();
    } catch (error: any) {
      console.error('Error saving student:', error);
      toast.error(error.message || 'Failed to save student');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{student ? 'Edit Student' : 'Add New Student'}</DialogTitle>
          <DialogDescription>
            {student ? 'Update student information below.' : 'Fill in the student information below.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Photo Upload */}
          <div className="space-y-2">
            <Label>Student Photo</Label>
            <div className="flex items-center gap-4">
              {photoPreview && (
                <div className="relative">
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-24 h-24 rounded-lg object-cover border-2 border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setPhotoFile(null);
                      setPhotoPreview(null);
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              <div className="flex-1">
                <label htmlFor="photo-upload" className="cursor-pointer">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600">
                      Click to upload photo
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Max 5MB, JPG, PNG, GIF
                    </p>
                  </div>
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </label>
                {errors.photo && <p className="text-sm text-red-500 mt-1">{errors.photo}</p>}
              </div>
            </div>
          </div>

          {/* Name Fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="Enter first name"
              />
              {errors.firstName && <p className="text-sm text-red-500">{errors.firstName}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="fatherName">Father's Name *</Label>
              <Input
                id="fatherName"
                value={formData.fatherName}
                onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                placeholder="Enter father's name"
              />
              {errors.fatherName && <p className="text-sm text-red-500">{errors.fatherName}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="surname">Surname *</Label>
              <Input
                id="surname"
                value={formData.surname}
                onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                placeholder="Enter surname"
              />
              {errors.surname && <p className="text-sm text-red-500">{errors.surname}</p>}
            </div>
          </div>

          {/* DOB and Mobile */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth *</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                max={new Date().toISOString().split('T')[0]}
              />
              {errors.dateOfBirth && <p className="text-sm text-red-500">{errors.dateOfBirth}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="mobileNumber">Mobile Number *</Label>
              <Input
                id="mobileNumber"
                type="tel"
                value={formData.mobileNumber}
                onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                placeholder="10 digit mobile number"
                maxLength={10}
              />
              {errors.mobileNumber && <p className="text-sm text-red-500">{errors.mobileNumber}</p>}
            </div>
          </div>

          {/* Standard */}
          <div className="space-y-2">
            <Label htmlFor="standard">Class/Standard *</Label>
            <Select value={formData.standard} onValueChange={(value) => setFormData({ ...formData, standard: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select class" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((cls) => (
                  <SelectItem key={cls.id} value={cls.standard.toString()}>
                    {cls.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address">Address *</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Enter complete address"
              rows={3}
            />
            {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}
          </div>

          {/* School */}
          <div className="space-y-2">
            <Label htmlFor="school">School</Label>
            <Input
              id="school"
              value={formData.school}
              onChange={(e) => setFormData({ ...formData, school: e.target.value })}
              placeholder="Enter school name"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={uploading}>
              Cancel
            </Button>
            <Button type="submit" disabled={uploading}>
              {uploading ? 'Saving...' : student ? 'Update Student' : 'Add Student'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}