import { projectId, publicAnonKey } from '../utils/supabase/info';
import { Student } from './types';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-3578af81`;

async function apiCall(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`,
      ...options.headers,
    },
  });

  const data = await response.json();
  
  if (!data.success && response.ok === false) {
    throw new Error(data.error || 'API request failed');
  }
  
  return data;
}

export const api = {
  // Class/Standard management
  classes: {
    getAll: async () => {
      const result = await apiCall('/classes');
      return result.data;
    },
    
    update: async (classes: Array<{ id: number; name: string; standard: number }>) => {
      const result = await apiCall('/classes', {
        method: 'POST',
        body: JSON.stringify({ classes }),
      });
      return result.data;
    },
  },

  // School management
  schools: {
    getAll: async () => {
      const result = await apiCall('/schools');
      return result.data;
    },
  },

  // Student management
  students: {
    getAll: async (): Promise<Student[]> => {
      const result = await apiCall('/students');
      return result.data;
    },
    
    getById: async (id: string): Promise<Student> => {
      const result = await apiCall(`/students/${id}`);
      return result.data;
    },
    
    create: async (student: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>): Promise<Student> => {
      const result = await apiCall('/students', {
        method: 'POST',
        body: JSON.stringify(student),
      });
      return result.data;
    },
    
    update: async (id: string, student: Partial<Student>): Promise<Student> => {
      const result = await apiCall(`/students/${id}`, {
        method: 'PUT',
        body: JSON.stringify(student),
      });
      return result.data;
    },
    
    delete: async (id: string): Promise<void> => {
      await apiCall(`/students/${id}`, {
        method: 'DELETE',
      });
    },
  },

  // Attendance management
  attendance: {
    getByDate: async (date: string, standard?: number) => {
      const params = new URLSearchParams({ date });
      if (standard) params.append('standard', standard.toString());
      
      const result = await apiCall(`/attendance?${params.toString()}`);
      return result.data;
    },
    
    mark: async (studentId: string, date: string, status: 'present' | 'absent') => {
      const result = await apiCall('/attendance', {
        method: 'POST',
        body: JSON.stringify({ studentId, date, status }),
      });
      return result.data;
    },
    
    bulkMark: async (records: Array<{ studentId: string; date: string; status: 'present' | 'absent' }>) => {
      const result = await apiCall('/attendance/bulk', {
        method: 'POST',
        body: JSON.stringify({ records }),
      });
      return result.data;
    },
  },

  // Reports
  reports: {
    getAttendance: async (startDate: string, endDate: string, standard?: number, school?: string) => {
      const params = new URLSearchParams({ startDate, endDate });
      if (standard) params.append('standard', standard.toString());
      if (school && school !== 'all') params.append('school', school);
      
      const result = await apiCall(`/reports/attendance?${params.toString()}`);
      return result.data;
    },
  },

  // Dashboard
  dashboard: {
    getStats: async () => {
      const result = await apiCall('/dashboard/stats');
      return result.data;
    },
  },

  // Photo upload
  uploadPhoto: async (fileName: string, fileData: string, studentId?: string) => {
    const result = await apiCall('/upload-photo', {
      method: 'POST',
      body: JSON.stringify({ fileName, fileData, studentId }),
    });
    return result.data;
  },
};