import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { toast } from 'sonner@2.0.3';
import { Plus, Edit, Trash2, Save, GraduationCap } from 'lucide-react';

interface ClassItem {
  id: number;
  name: string;
  standard: number;
}

export function ClassManagement() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassItem | null>(null);
  const [editName, setEditName] = useState('');

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
      toast.error('Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  const handleAddClass = () => {
    const newStandard = classes.length > 0 ? Math.max(...classes.map(c => c.standard)) + 1 : 1;
    const newClass: ClassItem = {
      id: newStandard,
      name: `Class ${newStandard}`,
      standard: newStandard,
    };
    setClasses([...classes, newClass]);
  };

  const handleEditClass = (classItem: ClassItem) => {
    setEditingClass(classItem);
    setEditName(classItem.name);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingClass) return;
    
    const updatedClasses = classes.map(c => 
      c.id === editingClass.id ? { ...c, name: editName } : c
    );
    setClasses(updatedClasses);
    setEditDialogOpen(false);
    setEditingClass(null);
    setEditName('');
  };

  const handleRemoveClass = (id: number) => {
    if (classes.length <= 1) {
      toast.error('You must have at least one class');
      return;
    }
    setClasses(classes.filter(c => c.id !== id));
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      await api.classes.update(classes);
      toast.success('Classes updated successfully');
    } catch (error) {
      console.error('Error saving classes:', error);
      toast.error('Failed to save classes');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <p className="text-center text-gray-500">Loading classes...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="w-6 h-6" />
                Class Management
              </CardTitle>
              <CardDescription>
                Add, edit, or remove classes for your school
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddClass} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Class
              </Button>
              <Button onClick={handleSaveAll} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classes.map((classItem) => (
              <div
                key={classItem.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition"
              >
                <div className="flex-1">
                  <h3>{classItem.name}</h3>
                  <p className="text-sm text-gray-500">Standard {classItem.standard}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditClass(classItem)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRemoveClass(classItem.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {classes.length === 0 && (
            <div className="text-center py-8">
              <GraduationCap className="w-12 h-12 mx-auto text-gray-400 mb-2" />
              <p className="text-gray-500">No classes configured</p>
              <Button variant="link" onClick={handleAddClass}>
                Add your first class
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Class Name</DialogTitle>
            <DialogDescription>
              Change the display name for this class
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="className">Class Name</label>
              <Input
                id="className"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="e.g., Class 1, Grade 1, Standard 1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
