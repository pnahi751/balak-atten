import { useState, useEffect } from 'react';
import { api } from '../lib/api';

interface ClassItem {
  id: number;
  name: string;
  standard: number;
}

export function useClasses() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    setLoading(true);
    try {
      const data = await api.classes.getAll();
      setClasses(data || []);
    } catch (error) {
      console.error('Error loading classes:', error);
      // Fallback to default classes if API fails
      setClasses([
        { id: 1, name: 'Class 1', standard: 1 },
        { id: 2, name: 'Class 2', standard: 2 },
        { id: 3, name: 'Class 3', standard: 3 },
        { id: 4, name: 'Class 4', standard: 4 },
        { id: 5, name: 'Class 5', standard: 5 },
        { id: 6, name: 'Class 6', standard: 6 },
        { id: 7, name: 'Class 7', standard: 7 },
        { id: 8, name: 'Class 8', standard: 8 },
        { id: 9, name: 'Class 9', standard: 9 },
        { id: 10, name: 'Class 10', standard: 10 },
        { id: 11, name: 'Class 11', standard: 11 },
        { id: 12, name: 'Class 12', standard: 12 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return { classes, loading, reload: loadClasses };
}
